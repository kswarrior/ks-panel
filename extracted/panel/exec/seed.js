const axios = require("axios");
const { db } = require("../handlers/db");
const readline = require("readline");
const { v4: uuidv4 } = require("uuid");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/* -------------------------
   Stylish Logger
--------------------------*/
const COLORS = {
  RESET: "\x1b[0m",
  CYAN: "\x1b[36m",
  GREEN: "\x1b[32m",
  YELLOW: "\x1b[33m",
  RED: "\x1b[31m",
  BLUE: "\x1b[34m",
  MAGENTA: "\x1b[35m",
  WHITE: "\x1b[37m",
};

function echo(message) {
  console.log(`${COLORS.CYAN}[KS Panel]${COLORS.RESET} ${message}`);
}

function echoSuccess(message) {
  console.log(`${COLORS.GREEN}[✓]${COLORS.RESET} ${message}`);
}

function echoWarning(message) {
  console.log(`${COLORS.YELLOW}[!]${COLORS.RESET} ${message}`);
}

function echoError(message) {
  console.error(`${COLORS.RED}[✗]${COLORS.RESET} ${message}`);
}

/* -------------------------
   Seed Function
--------------------------*/
async function seed() {
  try {
    const existingImages = await db.get("images");

    if (existingImages && existingImages.length > 0) {
      rl.question(
        `${COLORS.YELLOW}'images' already exists in database. Continue seeding? (y/n): ${COLORS.RESET}`,
        async (answer) => {
          if (answer.toLowerCase() !== "y") {
            echoWarning("Seeding aborted by user.");
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
        echoSuccess("Seeding: " + imageData.Name);

        imageDataArray.push(imageData);
      } catch (err) {
        echoError("Failed to fetch from " + url);
      }
    }

    if (imageDataArray.length > 0) {
      await db.set("images", imageDataArray);
      echoSuccess("Seeding completed successfully!");
    } else {
      echoWarning("No new images were added.");
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
