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

// ====================== BACKGROUND CONFIG (NEW) ======================

// Predefined backgrounds (downloaded locally on first use)
const predefinedBackgrounds = [
  { id: "pre1", name: "Predefined 1 (Cityscape)", url: "https://picsum.photos/id/1015/1920/1080" },
  { id: "pre2", name: "Predefined 2 (Nature)", url: "https://picsum.photos/id/29/1920/1080" },
  { id: "pre3", name: "Predefined 3 (Abstract)", url: "https://picsum.photos/id/201/1920/1080" },
  { id: "pre4", name: "Predefined 4 (Space)", url: "https://picsum.photos/id/1016/1920/1080" },
  { id: "pre5", name: "Predefined 5 (Landscape)", url: "https://picsum.photos/id/133/1920/1080" },
];

// Multer for custom background uploads
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
    cb(null, file.mimetype.startsWith("image/") || new Error("Not an image!"));
  },
});

// Download image from URL
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

// Resolve background key → public URL (downloads predefined if missing)
async function ensureBackground(value) {
  if (!value) return "";
  const bgDir = path.join(__dirname, "..", "..", "public", "assets", "backgrounds");

  if (value.startsWith("pre")) {
    const pre = predefinedBackgrounds.find(p => p.id === value);
    if (!pre) return "";
    const fileName = `${value}.jpg`;
    const filePath = path.join(bgDir, fileName);
    if (!fs.existsSync(filePath)) {
      await downloadImage(pre.url, filePath);
    }
    return `/assets/backgrounds/${fileName}`;
  }

  // Custom filename
  return `/assets/backgrounds/${value}`;
}

async function fetchCommonSettings(req) {
  const settings = (await db.get("settings")) || {};
  return {
    req,
    user: req.user,
    settings,
  };
}

// ====================== THEME ROUTES (FULL BACKGROUND SUPPORT) ======================

// Render Theme Customization Page
router.get("/admin/settings/theme", isAdmin, async (req, res) => {
  try {
    const common = await fetchCommonSettings(req);
    let theme = await db.get("theme") || {};

    // Default structure
    if (!theme.backgrounds || typeof theme.backgrounds !== "object") {
      theme.backgrounds = { login: "", dashboard: "", admin: "", instances: "" };
    }
    if (!theme.customBackgrounds) theme.customBackgrounds = [];

    res.render("admin/settings/theme", {
      ...common,
      theme,
      predefinedBackgrounds,
      pageType: "admin"
    });
  } catch (error) {
    log.error("Error fetching theme settings:", error);
    res.status(500).send("Failed to load theme settings.");
  }
});

// Save Theme (processes background keys → real paths)
router.post("/admin/settings/theme/save", isAdmin, async (req, res) => {
  try {
    let themeData = req.body;

    if (themeData.backgrounds && typeof themeData.backgrounds === "object") {
      for (let key in themeData.backgrounds) {
        let val = themeData.backgrounds[key];
        if (val) {
          const resolved = await ensureBackground(val);
          themeData.backgrounds[key] = resolved || "";
        } else {
          themeData.backgrounds[key] = "";
        }
      }
    }

    await db.set("theme", themeData);
    logAudit(req.user.userId, req.user.username, "theme:edit", req.ip);
    res.redirect("/admin/settings/theme?msg=ThemeSaveSuccess");
  } catch (error) {
    log.error("Error saving theme:", error);
    res.redirect("/admin/settings/theme?err=ThemeSaveFailed");
  }
});

// Upload custom background
router.post("/admin/settings/theme/background/upload", isAdmin, bgUpload.single("bg"), async (req, res) => {
  try {
    if (!req.file) throw new Error("No file uploaded");
    let theme = await db.get("theme") || {};
    if (!theme.customBackgrounds) theme.customBackgrounds = [];
    theme.customBackgrounds.push(req.file.filename);
    await db.set("theme", theme);
    logAudit(req.user.userId, req.user.username, "background:upload", req.ip);
    res.redirect("/admin/settings/theme?msg=BgUploadSuccess");
  } catch (e) {
    log.error("Background upload error:", e);
    res.redirect("/admin/settings/theme?err=BgUploadFailed");
  }
});

// Save background from URL (auto-download)
router.post("/admin/settings/theme/background/url", isAdmin, async (req, res) => {
  const { url } = req.body;
  if (!url || !url.startsWith("http")) {
    return res.redirect("/admin/settings/theme?err=InvalidUrl");
  }

  try {
    let theme = await db.get("theme") || {};
    if (!theme.customBackgrounds) theme.customBackgrounds = [];

    const bgDir = path.join(__dirname, "..", "..", "public", "assets", "backgrounds");
    fs.mkdirSync(bgDir, { recursive: true });
    const filename = `custom-${Date.now()}.jpg`;
    const filePath = path.join(bgDir, filename);

    await downloadImage(url, filePath);

    theme.customBackgrounds.push(filename);
    await db.set("theme", theme);
    logAudit(req.user.userId, req.user.username, "background:url", req.ip);
    res.redirect("/admin/settings/theme?msg=BgUrlSuccess");
  } catch (e) {
    log.error("Background URL error:", e);
    res.redirect("/admin/settings/theme?err=BgUrlFailed");
  }
});

// Delete custom background
router.post("/admin/settings/theme/background/delete", isAdmin, async (req, res) => {
  const { filename } = req.body;
  if (!filename) return res.status(400).send("No filename");

  try {
    let theme = await db.get("theme") || {};
    const filePath = path.join(__dirname, "..", "..", "public", "assets", "backgrounds", filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    if (theme.customBackgrounds) {
      theme.customBackgrounds = theme.customBackgrounds.filter(f => f !== filename);
    }
    await db.set("theme", theme);
    logAudit(req.user.userId, req.user.username, "background:delete", req.ip);
    res.redirect("/admin/settings/theme?msg=BgDeleteSuccess");
  } catch (e) {
    log.error("Background delete error:", e);
    res.redirect("/admin/settings/theme?err=BgDeleteFailed");
  }
});

// ====================== EXISTING ROUTES (UPDATED WITH pageType) ======================

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
