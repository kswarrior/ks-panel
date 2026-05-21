# Database Configuration Guide

KS Panel supports multiple database backends via Keyv and @keyvhq adapters.

## Supported Databases
- **SQLite** (Default, no setup required)
- **MySQL / MariaDB**
- **PostgreSQL**
- **MongoDB**

---

## 1. How to Change Your Database

To change your database, you need to update the `DB_URL` environment variable in your `.env` file or the `databaseURL` field in `config.json`.

### SQLite (Default)
Best for small setups. Data is stored in a local file.
```env
DB_URL=sqlite://storage/kspanel.sqlite
```

### MySQL / MariaDB
1. Create a database (e.g., `kspanel`) and a user with full privileges.
2. Update your `.env`:
```env
DB_URL=mysql://user:password@localhost:3306/kspanel
```

### PostgreSQL
1. Create a database and user.
2. Update your `.env`:
```env
DB_URL=postgres://user:password@localhost:5432/kspanel
```

### MongoDB
1. Ensure your MongoDB server is running.
2. Update your `.env`:
```env
DB_URL=mongodb://user:password@localhost:27017/kspanel?authSource=admin
```

---

## 2. Migrating Data (SQLite to MySQL/Postgres/Mongo)

If you want to move your existing data from SQLite to a more robust database, follow these steps:

### Automatic Migration Script
We provide a migration tool that backups your data and transfers it to the new database.

1. **Stop the Panel.**
2. **Run the migration command:**
   Replace `<NEW_DB_URL>` with your target database connection string.
   ```bash
   cd panel
   node exec/migrate-db.js "<NEW_DB_URL>"
   ```
   *Example:* `node exec/migrate-db.js "mysql://root:pass@localhost:3306/kspanel"`

3. **Verify the output.** The script will tell you if verification succeeded.
4. **Update your `.env`** with the new `DB_URL`.
5. **Restart the Panel.**

### Manual Backup
The migration script automatically creates a backup at `panel/storage/backup-<timestamp>.json`. You can also manually copy the `kspanel.sqlite` file before making changes.

---

## 3. First Run Setup
If you connect to a completely new (empty) database, KS Panel will detect that no admin user exists and will automatically redirect you to the **Setup Wizard** at `/setup/admin` where you can create your first account.
