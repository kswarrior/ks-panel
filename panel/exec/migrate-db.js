const { db, getAllData, databaseTable } = require("../handlers/db.js");
const Keyv = require("keyv");
const fs = require("node:fs");
const path = require("path");
const log = new (require("cat-loggr"))();

async function migrate() {
    const args = process.argv.slice(2);
    const targetURL = args[0];

    if (!targetURL) {
        log.error("Usage: node exec/migrate-db.js <target_database_url>");
        log.info("Example: node exec/migrate-db.js \"mysql://user:pass@localhost:3306/dbname\"");
        process.exit(1);
    }

    log.info("Starting database migration...");

    // 1. Fetch all data from current DB
    log.info("Fetching data from current database...");
    let data;
    try {
        data = await getAllData();
    } catch (e) {
        log.error("Failed to fetch data from current database: " + e.message);
        process.exit(1);
    }
    log.info(`Found ${data.length} records.`);

    if (data.length === 0) {
        log.warn("Current database is empty. Nothing to migrate.");
        process.exit(0);
    }

    // 2. Backup current data to a file
    const storageDir = path.join(__dirname, "../storage");
    if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

    const backupPath = path.join(storageDir, `backup-${Date.now()}.json`);
    log.info(`Creating backup at ${backupPath}...`);
    try {
        fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
        log.info("Backup created successfully.");
    } catch (e) {
        log.error("Failed to create backup: " + e.message);
        process.exit(1);
    }

    // 3. Connect to target DB
    log.info(`Connecting to target database...`);
    let targetStore;

    try {
        if (targetURL.startsWith("postgres")) {
            const PostgresStore = require("@keyvhq/postgres");
            targetStore = new PostgresStore(targetURL, { table: databaseTable });
        } else if (targetURL.startsWith("mysql") || targetURL.startsWith("mariadb")) {
            const MySQLStore = require("@keyvhq/mysql");
            targetStore = new MySQLStore(targetURL, { table: databaseTable });
        } else if (targetURL.startsWith("sqlite")) {
            const SQLiteStore = require("@keyvhq/sqlite");
            targetStore = new SQLiteStore(targetURL, { table: databaseTable });
        } else if (targetURL.startsWith("mongodb")) {
            const MongoStore = require("@keyvhq/mongo");
            targetStore = new MongoStore(targetURL, { collection: databaseTable });
        } else {
            log.error("Unsupported target database protocol.");
            process.exit(1);
        }
    } catch (e) {
        log.error("Failed to initialize target store: " + e.message);
        process.exit(1);
    }

    const targetDb = new Keyv({ store: targetStore, namespace: 'kspanel' });

    // 4. Write data to target DB
    log.info("Writing data to target database...");
    let migratedCount = 0;
    for (const item of data) {
        try {
            await targetDb.set(item.key, item.value);
            migratedCount++;
            if (migratedCount % 10 === 0) log.info(`Progress: ${migratedCount}/${data.length}...`);
        } catch (e) {
            log.error(`Failed to migrate key "${item.key}": ${e.message}`);
        }
    }

    // 5. Verify migration
    log.info("Verifying migration...");
    let verifiedCount = 0;
    for (const item of data) {
        try {
            const value = await targetDb.get(item.key);
            if (JSON.stringify(value) === JSON.stringify(item.value)) {
                verifiedCount++;
            } else {
                log.warn(`Verification failed for key: ${item.key}`);
            }
        } catch (e) {
             log.error(`Error verifying key "${item.key}": ${e.message}`);
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
