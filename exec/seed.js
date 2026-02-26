const axios = require("axios");
const { db } = require("../handlers/db");
const readline = require("readline");
const { v4: uuidv4 } = require("uuid");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/* -------------------------
   Simple Echo Logger
--------------------------*/
function echo(message) {
  console.log(`[KS-PANEL] ${message}`);
}

function echoError(message) {
  console.error(`[KS-PANEL ERROR] ${message}`);
}

/* -------------------------
   Seed Function
--------------------------*/
async function seed() {
  try {
    const existingImages = await db.get("images");

    if (existingImages && existingImages.length > 0) {
      rl.question(
        "'images' already exists in database. Continue seeding? (y/n): ",
        async (answer) => {
          if (answer.toLowerCase() !== "y") {
            echo("Seeding aborted by user.");
            rl.close();
            process.exit(0);
          } else {
            await performSeeding();
            rl.close();
          }
        }
      );
    } else {
      await performSeeding();
      rl.close();
    }
  } catch (error) {
    echoError("Seeding failed: " + error.message);
    rl.close();
  }
}

/* -------------------------
   Perform Seeding
--------------------------*/
async function performSeeding() {
  try {
    echo("Fetching image index...");

    const indexResponse = await axios.get(
      "https://raw.githubusercontent.com/skyport-team/images/refs/heads/main/seed/0.1.0-beta2.json"
    );

    const imageUrls = indexResponse.data;
    let imageDataArray = [];

    for (const url of imageUrls) {
      try {
        echo("Fetching image data...");
        const imageResponse = await axios.get(url);
        let imageData = imageResponse.data;

        imageData.Id = uuidv4();
        echo("Seeding: " + imageData.Name);

        imageDataArray.push(imageData);
      } catch (err) {
        echoError("Failed to fetch from " + url);
      }
    }

    if (imageDataArray.length > 0) {
      await db.set("images", imageDataArray);
      echo("Seeding completed successfully!");
    } else {
      echo("No new images were added.");
    }
  } catch (error) {
    echoError("Failed to fetch index or store data: " + error.message);
  }
}

/* -------------------------
   Exit Handlers
--------------------------*/
process.on("exit", () => {
  echo("Exiting...");
});

process.on("unhandledRejection", (reason) => {
  echoError("Unhandled Rejection: " + reason);
  process.exit(1);
});

/* -------------------------
   Run Seeder
--------------------------*/
seed();
