const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// Whitelist of allowed language codes
const ALLOWED_LANGS = ["en", "de", "es", "fr", "in", "it", "nl", "pl", "pt"];

router.get("/api/v1/translations/:lang", async (req, res) => {
  const { lang } = req.params;

  // Security check: validate against whitelist to prevent directory traversal
  if (!ALLOWED_LANGS.includes(lang)) {
    return res.status(400).json({ error: "Invalid language code" });
  }

  const filePath = path.join(__dirname, `../../../lang/${lang}/lang.json`);

  if (fs.existsSync(filePath)) {
    try {
      const translations = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return res.json(translations);
    } catch (error) {
      return res.status(500).json({ error: "Failed to parse translations" });
    }
  } else {
    // Fallback to English
    const englishPath = path.join(__dirname, `../../../lang/en/lang.json`);
    if (fs.existsSync(englishPath)) {
      const translations = JSON.parse(fs.readFileSync(englishPath, "utf8"));
      return res.json(translations);
    }
    return res.status(404).json({ error: "Translations not found" });
  }
});

module.exports = router;
