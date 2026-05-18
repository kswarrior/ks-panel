package main

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() {
	var err error
	connStr := os.Getenv("KSSQL_URL")
	if connStr == "" {
		connStr = "postgres://admin:admin@127.0.0.1:5433/panel?sslmode=disable"
	}

	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}

	schemas := []string{
		`CREATE TABLE IF NOT EXISTS roles (
			id SERIAL PRIMARY KEY,
			name TEXT UNIQUE,
			color TEXT,
			permissions TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS nodes (
			id SERIAL PRIMARY KEY,
			name TEXT UNIQUE,
			ip_address TEXT,
			status TEXT,
			cpu_usage TEXT,
			ram_usage TEXT,
			disk_usage TEXT,
			connection_type TEXT DEFAULT 'IP Address'
		);`,
		`CREATE TABLE IF NOT EXISTS templates (
			id SERIAL PRIMARY KEY,
			name TEXT UNIQUE,
			description TEXT,
			image TEXT,
			config TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			display_name TEXT,
			username TEXT UNIQUE,
			email TEXT UNIQUE,
			password TEXT,
			role_id INTEGER,
			status TEXT,
			FOREIGN KEY(role_id) REFERENCES roles(id)
		);`,
		`CREATE TABLE IF NOT EXISTS node_uptime (
			id SERIAL PRIMARY KEY,
			node_id INTEGER,
			status TEXT,
			timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(node_id) REFERENCES nodes(id)
		);`,
		`CREATE TABLE IF NOT EXISTS instances (
			id SERIAL PRIMARY KEY,
			name TEXT,
			status TEXT,
			node_id INTEGER,
			template_id INTEGER,
			memory INTEGER,
			cpu INTEGER,
			disk INTEGER,
			FOREIGN KEY(node_id) REFERENCES nodes(id),
			FOREIGN KEY(template_id) REFERENCES templates(id)
		);`,
		`CREATE TABLE IF NOT EXISTS settings (
			key TEXT PRIMARY KEY,
			value TEXT
		);`,
		`CREATE TABLE IF NOT EXISTS themes (
			id SERIAL PRIMARY KEY,
			name TEXT UNIQUE,
			config TEXT,
			is_active INTEGER DEFAULT 0
		);`,
		`CREATE TABLE IF NOT EXISTS notifications (
			id SERIAL PRIMARY KEY,
			title TEXT,
			message TEXT,
			type TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);`,
		`CREATE TABLE IF NOT EXISTS tickets (
			id SERIAL PRIMARY KEY,
			subject TEXT,
			user_id INTEGER,
			status TEXT,
			priority TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(user_id) REFERENCES users(id)
		);`,
		`CREATE TABLE IF NOT EXISTS ticket_messages (
			id SERIAL PRIMARY KEY,
			ticket_id INTEGER,
			user_id INTEGER,
			message TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY(ticket_id) REFERENCES tickets(id),
			FOREIGN KEY(user_id) REFERENCES users(id)
		);`,
		`CREATE TABLE IF NOT EXISTS sessions (
			token TEXT PRIMARY KEY,
			user_id INTEGER,
			expires_at TIMESTAMP,
			FOREIGN KEY(user_id) REFERENCES users(id)
		);`,
	}

	for _, schema := range schemas {
		_, err := DB.Exec(schema)
		if err != nil {
			log.Printf("Warning during schema initialization: %v", err)
		}
	}

	log.Println("Database initialized successfully with KSSQL.")
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
		_, err := DB.Exec("INSERT INTO roles (name, color, permissions) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING", r.name, r.color, r.permissions)
		if err != nil {
			log.Printf("Error seeding role %s: %v", r.name, err)
		}
	}
}
