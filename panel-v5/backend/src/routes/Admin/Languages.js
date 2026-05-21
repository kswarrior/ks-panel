const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { hasPermission } = require("../../utils/isAdmin");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const LANG_DIR = path.join(__dirname, "../../lang");

// Helper to get all language codes
function getLangCodes() {
    return fs.readdirSync(LANG_DIR).filter(f => fs.statSync(path.join(LANG_DIR, f)).isDirectory());
}

// List languages
router.get("/admin/languages", hasPermission("manage_settings"), async (req, res) => {
    const codes = getLangCodes();
    const languages = codes.map(code => {
        const langPath = path.join(LANG_DIR, code, "lang.json");
        let name = code;
        if (fs.existsSync(langPath)) {
            try {
                const content = JSON.parse(fs.readFileSync(langPath, "utf8"));
                name = content.language_name || code;
            } catch (e) {}
        }
        return { code, name };
    });

    res.render("admin/languages/overview", {
        req,
        user: req.user,
        languages
    });
});

// Edit language
router.get("/admin/languages/edit/:code", hasPermission("manage_settings"), async (req, res) => {
    const { code } = req.params;
    const langPath = path.join(LANG_DIR, code, "lang.json");
    if (!fs.existsSync(langPath)) return res.redirect("/admin/languages?err=NotFound");

    const content = fs.readFileSync(langPath, "utf8");
    res.render("admin/languages/edit", {
        req,
        user: req.user,
        code,
        content
    });
});

// Save language
router.post("/admin/languages/save/:code", hasPermission("manage_settings"), async (req, res) => {
    const { code } = req.params;
    const { content } = req.body;
    const langPath = path.join(LANG_DIR, code, "lang.json");

    try {
        JSON.parse(content); // Validate JSON
        fs.writeFileSync(langPath, content, "utf8");
        res.redirect(`/admin/languages/edit/${code}?msg=Saved`);
    } catch (e) {
        res.redirect(`/admin/languages/edit/${code}?err=InvalidJSON`);
    }
});

// Create language
router.post("/admin/languages/create", hasPermission("manage_settings"), async (req, res) => {
    const { code } = req.body;
    if (!code || !/^[a-z]{2}$/.test(code)) return res.redirect("/admin/languages?err=InvalidCode");

    const newLangDir = path.join(LANG_DIR, code);
    if (fs.existsSync(newLangDir)) return res.redirect("/admin/languages?err=AlreadyExists");

    try {
        fs.mkdirSync(newLangDir, { recursive: true });
        const enContent = fs.readFileSync(path.join(LANG_DIR, "en", "lang.json"), "utf8");
        fs.writeFileSync(path.join(newLangDir, "lang.json"), enContent, "utf8");
        res.redirect(`/admin/languages/edit/${code}?msg=Created`);
    } catch (e) {
        res.redirect("/admin/languages?err=CreateFailed");
    }
});

// Delete language
router.post("/admin/languages/delete/:code", hasPermission("manage_settings"), async (req, res) => {
    const { code } = req.params;
    if (code === "en") return res.redirect("/admin/languages?err=CannotDeleteEnglish");

    const langDir = path.join(LANG_DIR, code);
    if (fs.existsSync(langDir)) {
        fs.rmSync(langDir, { recursive: true, force: true });
    }
    res.redirect("/admin/languages?msg=Deleted");
});

// Upload language
router.post("/admin/languages/upload", hasPermission("manage_settings"), upload.single("langFile"), async (req, res) => {
    if (!req.file) return res.redirect("/admin/languages?err=NoFile");
    const { code } = req.body;
    if (!code || !/^[a-z]{2}$/.test(code)) {
        fs.unlinkSync(req.file.path);
        return res.redirect("/admin/languages?err=InvalidCode");
    }

    const newLangDir = path.join(LANG_DIR, code);
    try {
        if (!fs.existsSync(newLangDir)) fs.mkdirSync(newLangDir, { recursive: true });
        fs.renameSync(req.file.path, path.join(newLangDir, "lang.json"));
        res.redirect(`/admin/languages/edit/${code}?msg=Uploaded`);
    } catch (e) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.redirect("/admin/languages?err=UploadFailed");
    }
});

module.exports = router;
