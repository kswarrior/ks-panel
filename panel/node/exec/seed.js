const { db } = require("../handlers/db.js");
const { paths } = require("../utils/config.js");
const fs = require("node:fs");
const path = require("path");

const TEMPLATES_DIR = paths.templates;

async function seed() {
  console.log("🌱 Seeding database...");

  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.log("No templates found to seed.");
    return;
  }

  const templates = fs.readdirSync(TEMPLATES_DIR).filter(f => {
    try {
        return fs.statSync(path.join(TEMPLATES_DIR, f)).isDirectory();
    } catch (e) { return false; }
  });

  const images = [];
  for (const t of templates) {
    const mainPath = path.join(TEMPLATES_DIR, t, "main.json");
    if (fs.existsSync(mainPath)) {
      const data = JSON.parse(fs.readFileSync(mainPath, "utf8"));
      images.push({
        ...data.meta,
        filename: t
      });
    }
  }

  await db.set("images", images);
  console.log(`✅ Seeded ${images.length} images.`);
  process.exit(0);
}

seed();
