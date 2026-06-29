const { config, rootDir, isPkg, paths } = require("../utils/config.js");
const { db } = require("../handlers/db.js");
const fs = require("node:fs");
const path = require("path");

const TEMPLATES_DIR = paths.templates;

async function seed() {
  console.log("🌱 Seeding database from: " + TEMPLATES_DIR);

  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.log("No templates directory found.");
    return;
  }

  const entries = fs.readdirSync(TEMPLATES_DIR);
  const images = [];

  for (const entry of entries) {
    const entryPath = path.join(TEMPLATES_DIR, entry);
    const stat = fs.statSync(entryPath);

    if (stat.isDirectory()) {
      const mainPath = path.join(entryPath, "main.json");
      if (fs.existsSync(mainPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(mainPath, "utf8"));
          images.push({
            ...(data.meta || {}),
            filename: entry
          });
        } catch (e) {
          console.error(`Failed to parse ${mainPath}: `, e);
        }
      }
    } else if (entry.endsWith(".json") && entry !== "categories.json" && entry !== "types.json") {
       try {
          const data = JSON.parse(fs.readFileSync(entryPath, "utf8"));
          images.push({
            ...(data.meta || {}),
            filename: entry.replace(".json", "")
          });
        } catch (e) {
          console.error(`Failed to parse ${entryPath}: `, e);
        }
    }
  }

  await db.set("images", images);
  console.log(`✅ Seeded ${images.length} images.`);
  process.exit(0);
}

seed();
