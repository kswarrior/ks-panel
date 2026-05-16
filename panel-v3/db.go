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
			username TEXT UNIQUE,
			email TEXT UNIQUE,
			password TEXT,
			role TEXT,
			status TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS roles (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT UNIQUE,
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
	}

	for _, schema := range schemas {
		_, err := DB.Exec(schema)
		if err != nil {
			log.Fatalf("Error creating schema: %v", err)
		}
	}

	log.Println("Database initialized successfully.")
}
