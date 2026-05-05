const { db, getAllData } = require("../handlers/db.js");
const Keyv = require("keyv");
const fs = require("node:fs");
const path = require("path");
const log = new (require("cat-loggr"))();

async function migrate() {
    const args = process.argv.slice(2);
    const targetURL = args[0];

    if (!targetURL) {
        log.error("Usage: node exec/migrate-db.js <target_database_url>");
        process.exit(1);
    }

    log.info("Starting database migration...");

    // 1. Fetch all data from current DB
    log.info("Fetching data from current database...");
    const data = await getAllData();
    log.info(`Found ${data.length} records.`);

    // 2. Backup current data to a file
    const backupPath = path.join(__dirname, `../storage/backup-${Date.now()}.json`);
    log.info(`Creating backup at ${backupPath}...`);
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
    log.info("Backup created successfully.");

    // 3. Connect to target DB
    log.info(`Connecting to target database: ${targetURL}`);
    let targetStore;

    if (targetURL.startsWith("postgres")) {
        const PostgresStore = require("@keyvhq/postgres");
        targetStore = new PostgresStore(targetURL, { table: 'kspanel' });
    } else if (targetURL.startsWith("mysql") || targetURL.startsWith("mariadb")) {
        const MySQLStore = require("@keyvhq/mysql");
        targetStore = new MySQLStore(targetURL, { table: 'kspanel' });
    } else if (targetURL.startsWith("sqlite")) {
        const SQLiteStore = require("@keyvhq/sqlite");
        targetStore = new SQLiteStore(targetURL, { table: 'kspanel' });
    } else if (targetURL.startsWith("mongodb")) {
        const MongoStore = require("@keyvhq/mongo");
        targetStore = new MongoStore(targetURL, { collection: 'kspanel' });
    } else {
        log.error("Unsupported target database protocol.");
        process.exit(1);
    }

    const targetDb = new Keyv({ store: targetStore, namespace: 'kspanel' });

    // 4. Write data to target DB
    log.info("Writing data to target database...");
    for (const item of data) {
        await targetDb.set(item.key, item.value);
        log.debug(`Migrated key: ${item.key}`);
    }

    // 5. Verify migration
    log.info("Verifying migration...");
    let verifiedCount = 0;
    for (const item of data) {
        const value = await targetDb.get(item.key);
        if (JSON.stringify(value) === JSON.stringify(item.value)) {
            verifiedCount++;
        } else {
            log.warn(`Verification failed for key: ${item.key}`);
        }
    }

    if (verifiedCount === data.length) {
        log.info("Migration verified successfully!");
        log.info(`Migrated and verified ${verifiedCount} records.`);
        log.info("IMPORTANT: Update your DB_URL in .env or config.json to the new URL and restart the panel.");
    } else {
        log.error(`Migration failed! Only ${verifiedCount}/${data.length} records verified.`);
        process.exit(1);
    }
}

migrate().catch(err => {
    log.error("Migration error: " + err.message);
    process.exit(1);
});
