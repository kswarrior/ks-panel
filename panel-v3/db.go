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
			ram_usage TEXT,
			disk_usage TEXT,
			connection_type TEXT DEFAULT 'IP Address'
		);`,
		`CREATE TABLE IF NOT EXISTS node_uptime (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			node_id INTEGER,
			status TEXT,
			timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(node_id) REFERENCES nodes(id)
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
			image TEXT,
			config TEXT
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
		`CREATE TABLE IF NOT EXISTS notifications (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT,
			message TEXT,
			type TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS tickets (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			subject TEXT,
			user_id INTEGER,
			status TEXT,
			priority TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(user_id) REFERENCES users(id)
		);`,
		`CREATE TABLE IF NOT EXISTS ticket_messages (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			ticket_id INTEGER,
			user_id INTEGER,
			message TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(ticket_id) REFERENCES tickets(id),
			FOREIGN KEY(user_id) REFERENCES users(id)
		);`,
		`CREATE TABLE IF NOT EXISTS sessions (
			token TEXT PRIMARY KEY,
			user_id INTEGER,
			expires_at DATETIME,
			FOREIGN KEY(user_id) REFERENCES users(id)
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
	DB.Exec("ALTER TABLE nodes ADD COLUMN disk_usage TEXT;")
	DB.Exec("ALTER TABLE nodes ADD COLUMN connection_type TEXT DEFAULT 'IP Address';")
	DB.Exec("ALTER TABLE templates ADD COLUMN config TEXT;")

	log.Println("Database initialized successfully.")
	SeedRoles()
}

func SeedRoles() {
	roles := []struct {
		name        string
		color       string
		permissions string
	}{
		{"owner", "#ef4444", "*"},
		{"admin", "#0ea5e9", "view_instances,manage_instances,view_nodes,manage_nodes,view_users,manage_users,view_roles,manage_roles,view_themes,manage_themes,view_templates"},
		{"user", "#22c55e", "view_instances"},
	}

	for _, r := range roles {
		_, err := DB.Exec("INSERT OR IGNORE INTO roles (name, color, permissions) VALUES (?, ?, ?)", r.name, r.color, r.permissions)
		if err != nil {
			log.Printf("Error seeding role %s: %v", r.name, err)
		}
	}
}
