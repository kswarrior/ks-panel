package main

import (
	"database/sql"
	"log"

	_ "modernc.org/sqlite"
)

var DB *sql.DB

func InitDB() {
	var err error
	DB, err = sql.Open("sqlite", "edge.db")
	if err != nil {
		log.Fatal(err)
	}

	schemas := []string{
		`CREATE TABLE IF NOT EXISTS config (
			key TEXT PRIMARY KEY,
			value TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS instances (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			remote_id INTEGER,
			name TEXT,
			status TEXT,
			config TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS stats (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
			cpu_usage REAL,
			ram_usage REAL
		);`,
	}

	for _, schema := range schemas {
		_, err := DB.Exec(schema)
		if err != nil {
			log.Fatalf("Error creating edge schema: %v", err)
		}
	}

	log.Println("Edge database initialized successfully.")
}
