package main

import (
	"database/sql"
	"log"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func InitDB() {
	var err error
	DB, err = sql.Open("sqlite", "panel.db")
	if err != nil {
		log.Fatal(err)
	}

	schemas := []string{
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			display_name TEXT,
			username TEXT UNIQUE,
			email TEXT UNIQUE,
			password TEXT,
			role_id INTEGER,
			status TEXT,
			FOREIGN KEY(role_id) REFERENCES roles(id)
		);`,
		`CREATE TABLE IF NOT EXISTS roles (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT UNIQUE,
			color TEXT,
			permissions TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS nodes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT UNIQUE,
			ip_address TEXT,
			status TEXT,
			cpu_usage TEXT,
			ram_usage TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS instances (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT,
			status TEXT,
			node_id INTEGER,
			template_id INTEGER,
			FOREIGN KEY(node_id) REFERENCES nodes(id)
		);`,
		`CREATE TABLE IF NOT EXISTS templates (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT UNIQUE,
			description TEXT,
			image TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS settings (
			key TEXT PRIMARY KEY,
			value TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS themes (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT UNIQUE,
			config TEXT,
			is_active INTEGER DEFAULT 0
		);`,
	}

	for _, schema := range schemas {
		_, err := DB.Exec(schema)
		if err != nil {
			log.Fatalf("Error creating schema: %v", err)
		}
	}

	// Add missing columns if they don't exist (basic migration)
	DB.Exec("ALTER TABLE users ADD COLUMN display_name TEXT;")
	DB.Exec("ALTER TABLE users ADD COLUMN role_id INTEGER;")
	DB.Exec("ALTER TABLE roles ADD COLUMN color TEXT;")

	log.Println("Database initialized successfully.")
}
