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

  try {
    if (fs.existsSync(filePath)) {
      const content = await fs.promises.readFile(filePath, "utf8");
      const translations = JSON.parse(content);
      return res.json(translations);
    } else {
      // Fallback to English
      const englishPath = path.join(__dirname, `../../../lang/en/lang.json`);
      if (fs.existsSync(englishPath)) {
        const content = await fs.promises.readFile(englishPath, "utf8");
        const translations = JSON.parse(content);
        return res.json(translations);
      }
      return res.status(404).json({ error: "Translations not found" });
    }
  } catch (error) {
    console.error("Translation error:", error);
    return res.status(500).json({ error: "Failed to load translations" });
  }
});

module.exports = router;
