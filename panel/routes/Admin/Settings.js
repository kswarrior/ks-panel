const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("node:fs");
const { db } = require("../../handlers/db.js");
const { logAudit } = require("../../handlers/auditLog.js");
const { sendTestEmail } = require("../../handlers/email.js");
const { isAdmin } = require("../../utils/isAdmin.js");
const log = new (require("cat-loggr"))();

// Configure multer for file upload
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

async function fetchCommonSettings(req) {
  const settings = (await db.get("settings")) || {};
  return {
    req,
    user: req.user,
    settings,
  };
}

// ====================== NEW: THEME ROUTES ======================

// Render Theme Customization Page
router.get("/admin/settings/theme", isAdmin, async (req, res) => {
  try {
    const common = await fetchCommonSettings(req);
    let theme = await db.get("theme");

    // If no theme exists yet, start with empty (your theme.ejs has fallbacks)
    if (!theme || typeof theme !== "object") {
      theme = {};
    }

    res.render("admin/settings/theme", { ...common, theme });
  } catch (error) {
    log.error("Error fetching theme settings:", error);
    res.status(500).send("Failed to load theme settings.");
  }
});

// Save Theme to Database
router.post("/admin/settings/theme/save", isAdmin, async (req, res) => {
  try {
    const themeData = req.body;

    await db.set("theme", themeData);

    logAudit(req.user.userId, req.user.username, "theme:edit", req.ip);

    res.redirect("/admin/settings/theme?msg=ThemeSaveSuccess");
  } catch (error) {
    log.error("Error saving theme:", error);
    res.redirect("/admin/settings/theme?err=ThemeSaveFailed");
  }
});

// ====================== EXISTING ROUTES (unchanged) ======================

router.get("/admin/settings", isAdmin, async (req, res) => {
  const settings = await fetchCommonSettings(req);
  res.render("admin/settings/appearance", settings);
});

router.get("/admin/settings/smtp", isAdmin, async (req, res) => {
  try {
    const settings = await fetchCommonSettings(req);
    const smtpSettings = (await db.get("smtp_settings")) || {};
    res.render("admin/settings/smtp", { ...settings, smtpSettings });
  } catch (error) {
    log.error("Error fetching SMTP settings:", error);
    res
      .status(500)
      .send("Failed to fetch SMTP settings. Please try again later.");
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
