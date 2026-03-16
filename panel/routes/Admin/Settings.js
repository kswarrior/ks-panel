const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("node:fs");
const https = require("https");
const { db } = require("../../handlers/db.js");
const { logAudit } = require("../../handlers/auditLog.js");
const { sendTestEmail } = require("../../handlers/email.js");
const { isAdmin } = require("../../utils/isAdmin.js");
const log = new (require("cat-loggr"))();

// ====================== MULTER FOR LOGO (unchanged) ======================
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, "..", "..", "public", "assets");
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, "logo.png");
    },
  }),
  fileFilter: (req, file, cb) => {
    cb(
      null,
      file.mimetype.startsWith("image/") ||
        new Error("Not an image! Please upload an image file.")
    );
  },
});

// ====================== BACKGROUND CONFIG ======================

// Multer for backgrounds (NOW SUPPORTS GIF, MP4, PNG, JPG, WEBP)
const bgStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const bgPath = path.join(__dirname, "..", "..", "public", "assets", "backgrounds");
    fs.mkdirSync(bgPath, { recursive: true });
    cb(null, bgPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `custom-${Date.now()}${ext}`);
  },
});
const bgUpload = multer({
  storage: bgStorage,
  fileFilter: (req, file, cb) => {
    const allowed = file.mimetype.startsWith("image/") || file.mimetype === "video/mp4";
    cb(null, allowed || new Error("Only images and MP4 videos allowed"));
  },
});

// Download any file (image or video)
async function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const file = fs.createWriteStream(filePath);
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    }).on("error", (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function fetchCommonSettings(req) {
  const settings = (await db.get("settings")) || {};
  return {
    req,
    user: req.user,
    settings,
  };
}

// ====================== NEW BACKGROUND ROUTE (used by appearance.ejs) ======================
router.post(
  "/admin/settings/change/background",
  isAdmin,
  bgUpload.single("bg"),
  async (req, res) => {
    const { type, url, preset } = req.body;

    try {
      let theme = (await db.get("theme")) || {};
      if (!theme.backgrounds || typeof theme.backgrounds !== "object") {
        theme.backgrounds = { login: "", dashboard: "", admin: "", instances: "" };
      }

      const bgDir = path.join(__dirname, "..", "..", "public", "assets", "backgrounds");
      fs.mkdirSync(bgDir, { recursive: true });

      let backgroundPath = "";

      if (type === "upload" && req.file) {
        backgroundPath = `/assets/backgrounds/${req.file.filename}`;
      } else if (type === "url" && url && url.startsWith("http")) {
        const ext = path.extname(url.split("?")[0]) || ".gif";
        const filename = `custom-${Date.now()}${ext}`;
        const filePath = path.join(bgDir, filename);
        await downloadImage(url, filePath);
        backgroundPath = `/assets/backgrounds/${filename}`;
      } else if (type === "preset") {
        const presets = {
          "1": "https://mir-s3-cdn-cf.behance.net/project_modules/disp/d6552119730059.563339f76cc0b.gif",
          "2": "https://i.pinimg.com/originals/1d/68/cb/1d68cb9a8fc9af3b1c845c79c4875d24.gif"
        };
        const presetUrl = presets[preset];
        if (!presetUrl) throw new Error("Invalid preset");

        const filename = `default${preset}.gif`;
        const filePath = path.join(bgDir, filename);
        if (!fs.existsSync(filePath)) {
          await downloadImage(presetUrl, filePath);
        }
        backgroundPath = `/assets/backgrounds/${filename}`;
      } else if (type === "none") {
        // Optional: delete old file
        if (theme.backgrounds.dashboard) {
          const oldPath = path.join(__dirname, "..", "..", "public", theme.backgrounds.dashboard);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        backgroundPath = "";
      }

      // Apply same background to ALL pages (simple & matches your current appearance.ejs)
      theme.backgrounds.login = backgroundPath;
      theme.backgrounds.dashboard = backgroundPath;
      theme.backgrounds.admin = backgroundPath;
      theme.backgrounds.instances = backgroundPath;

      await db.set("theme", theme);
      logAudit(req.user.userId, req.user.username, "background:edit", req.ip);

      res.redirect("/admin/settings?msg=BackgroundUpdated");
    } catch (err) {
      log.error("Error processing background:", err);
      res.redirect("/admin/settings?err=BackgroundFailed");
    }
  }
);

// ====================== EXISTING ROUTES (unchanged) ======================

router.get("/admin/settings", isAdmin, async (req, res) => {
  const settingsData = await fetchCommonSettings(req);
  res.render("admin/settings/appearance", { ...settingsData, pageType: "admin" });
});

router.get("/admin/settings/smtp", isAdmin, async (req, res) => {
  try {
    const settingsData = await fetchCommonSettings(req);
    const smtpSettings = (await db.get("smtp_settings")) || {};
    res.render("admin/settings/smtp", { ...settingsData, smtpSettings, pageType: "admin" });
  } catch (error) {
    log.error("Error fetching SMTP settings:", error);
    res.status(500).send("Failed to fetch SMTP settings. Please try again later.");
  }
});

router.post(
  "/admin/settings/toggle/force-verify",
  isAdmin,
  async (req, res) => {
    try {
      const settings = (await db.get("settings")) || {};
      settings.forceVerify = !settings.forceVerify;
      await db.set("settings", settings);
      logAudit(req.user.userId, req.user.username, "force-verify:edit", req.ip);
      res.redirect("/admin/settings");
    } catch (err) {
      log.error("Error toggling force verify:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.post("/admin/settings/change/name", isAdmin, async (req, res) => {
  const { name } = req.body;
  try {
    const settings = (await db.get("settings")) || {};
    settings.name = name;
    await db.set("settings", settings);
    logAudit(req.user.userId, req.user.username, "name:edit", req.ip);
    res.redirect(`/admin/settings?changednameto=${name}`);
  } catch (err) {
    log.error("Error changing name:", err);
    res.status(500).send("Database error");
  }
});

router.post("/admin/settings/saveSmtpSettings", isAdmin, async (req, res) => {
  const {
    smtpServer,
    smtpPort,
    smtpUser,
    smtpPass,
    smtpFromName,
    smtpFromAddress,
  } = req.body;

  try {
    await db.set("smtp_settings", {
      server: smtpServer,
      port: smtpPort,
      username: smtpUser,
      password: smtpPass,
      fromName: smtpFromName,
      fromAddress: smtpFromAddress,
    });
    logAudit(req.user.userId, req.user.username, "SMTP:edit", req.ip);
    res.redirect("/admin/settings/smtp?msg=SmtpSaveSuccess");
  } catch (error) {
    log.error("Error saving SMTP settings:", error);
    res.redirect("/admin/settings/smtp?err=SmtpSaveFailed");
  }
});

router.post("/sendTestEmail", isAdmin, async (req, res) => {
  try {
    const { recipientEmail } = req.body;
    await sendTestEmail(recipientEmail);
    res.redirect("/admin/settings/smtp?msg=TestemailSentsuccess");
  } catch (error) {
    log.error("Error sending test email:", error);
    res.redirect("/admin/settings/smtp?err=TestemailSentfailed");
  }
});

router.post(
  "/admin/settings/change/logo",
  isAdmin,
  upload.single("logo"),
  async (req, res) => {
    const { type } = req.body;

    try {
      const settings = (await db.get("settings")) || {};

      if (type === "image" && req.file) {
        settings.logo = true;
        await db.set("settings", settings);
        res.redirect("/admin/settings");
      } else if (type === "none") {
        const logoPath = path.join(
          __dirname,
          "..",
          "..",
          "public",
          "assets",
          "logo.png"
        );
        if (fs.existsSync(logoPath)) fs.unlinkSync(logoPath);
        settings.logo = false;
        await db.set("settings", settings);
        logAudit(req.user.userId, req.user.username, "logo:edit", req.ip);
        res.redirect("/admin/settings");
      } else {
        res.status(400).send("Invalid request");
      }
    } catch (err) {
      log.error("Error processing logo change:", err);
      res.status(500).send("Error processing logo change: " + err.message);
    }
  }
);

router.post("/admin/settings/toggle/register", isAdmin, async (req, res) => {
  try {
    const settings = (await db.get("settings")) || {};
    settings.register = !settings.register;
    await db.set("settings", settings);
    logAudit(req.user.userId, req.user.username, "register:edit", req.ip);
    res.redirect("/admin/settings");
  } catch (err) {
    log.error("Error toggling registration:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
