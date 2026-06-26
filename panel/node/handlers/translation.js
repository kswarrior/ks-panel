const path = require("path");
const fs = require("fs");
const { rootDir, isPkg } = require("../utils/config.js");

function loadTranslations(lang) {
  const externalPath = path.join(rootDir, `lang/${lang}/lang.json`);
  const internalPath = path.join(__dirname, `../lang/${lang}/lang.json`);

  if (isPkg && fs.existsSync(externalPath)) {
    return JSON.parse(fs.readFileSync(externalPath, "utf8"));
  } else if (fs.existsSync(internalPath)) {
    return JSON.parse(fs.readFileSync(internalPath, "utf8"));
  }

  // Fallback to English
  const externalEnPath = path.join(rootDir, "lang/en/lang.json");
  const internalEnPath = path.join(__dirname, "../lang/en/lang.json");
  if (isPkg && fs.existsSync(externalEnPath)) {
    return JSON.parse(fs.readFileSync(externalEnPath, "utf8"));
  } else if (fs.existsSync(internalEnPath)) {
    return JSON.parse(fs.readFileSync(internalEnPath, "utf8"));
  }

  return {};
}

function translationMiddleware(req, res, next) {
  req.lang = req.cookies && req.cookies.lang ? req.cookies.lang : "en";
  req.translations = loadTranslations(req.lang);
  next();
}

module.exports = translationMiddleware;
