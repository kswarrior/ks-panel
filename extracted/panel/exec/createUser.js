const readline = require("readline");
const { db } = require("../handlers/db.js");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const config = require("../config.json");

const saltRounds = config.saltRounds || 10;

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
   Parse CLI Arguments
--------------------------*/
function parseArguments() {
  const args = {};
  process.argv.slice(2).forEach((arg) => {
    if (arg.startsWith("--")) {
      const [key, value] = arg.replace("--", "").split("=");
      args[key] = value;
    }
  });
  return args;
}

/* -------------------------
   Validation Helpers
--------------------------*/
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/* -------------------------
   Database Checks
--------------------------*/
async function doesUserExist(username) {
  const users = await db.get("users");
  return users ? users.some((u) => u.username === username) : false;
}

async function doesEmailExist(email) {
  const users = await db.get("users");
  return users ? users.some((u) => u.email === email) : false;
}

/* -------------------------
   Create User
--------------------------*/
async function createUser(username, email, password) {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const userId = uuidv4();

  let users = await db.get("users");
  if (!users) users = [];

  users.push({
    userId,
    username,
    email,
    password: hashedPassword,
    accessTo: [],
    admin: true,
    verified: true,
  });

  await db.set("users", users);
}

/* -------------------------
   CLI Question Helper
--------------------------*/
function ask(question) {
  return new Promise((resolve) => {
    rl.question(`${COLORS.BLUE}${question}${COLORS.RESET} `, resolve);
  });
}

/* -------------------------
   Main Function
--------------------------*/
async function main() {
  const args = parseArguments();

  let username = args.username;
  let email = args.email;
  let password = args.password;

  if (!username || !email || !password) {
    echo("Create a new ADMIN user for KS Panel");

    username = await ask("Username:");
    email = await ask("Email:");

    if (!isValidEmail(email)) {
      echoError("Invalid email format.");
      process.exit(1);
    }

    password = await ask("Password:");
  }

  if (!isValidEmail(email)) {
    echoError("Invalid email format.");
    process.exit(1);
  }

  const userExists = await doesUserExist(username);
  const emailExists = await doesEmailExist(email);

  if (userExists) {
    echoError("Username already exists.");
    process.exit(1);
  }

  if (emailExists) {
    echoError("Email already exists.");
    process.exit(1);
  }

  try {
    await createUser(username, email, password);
    echoSuccess("Admin user created successfully!");
  } catch (err) {
    echoError("Failed to create user: " + err.message);
  } finally {
    rl.close();
  }
}

main();
