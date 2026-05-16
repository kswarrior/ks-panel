package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func HandleStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "online",
		"version": "3.0.0",
	})
}

func HandleInstances(w http.ResponseWriter, r *http.Request) {
	instances := []map[string]interface{}{
		{"id": 1, "name": "Main Web Server", "status": "Running"},
		{"id": 2, "name": "Database Node 01", "status": "Running"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(instances)
}

func HandleNodes(w http.ResponseWriter, r *http.Request) {
	rows, err := DB.Query("SELECT id, name, ip_address FROM nodes")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	nodes := []map[string]interface{}{}
	client := http.Client{
		Timeout: 5 * time.Second,
	}

	for rows.Next() {
		var id int
		var name, ip string
		rows.Scan(&id, &name, &ip)

		status := "Offline"
		targetURL := ip
		if !strings.HasPrefix(targetURL, "http://") && !strings.HasPrefix(targetURL, "https://") {
			scheme := "http://"
			addr := targetURL
			if !containsPort(addr) {
				addr = fmt.Sprintf("%s:5050", addr)
			}
			targetURL = scheme + addr
		}

		if !strings.HasSuffix(targetURL, "/status") {
			if !strings.HasSuffix(targetURL, "/") {
				targetURL += "/"
			}
			targetURL += "status"
		}

		resp, err := client.Get(targetURL)
		if err == nil && resp.StatusCode == http.StatusOK {
			status = "Online"
			resp.Body.Close()
		}

		nodes = append(nodes, map[string]interface{}{
			"id":         id,
			"name":       name,
			"ip_address": ip,
			"status":     status,
			"cpu_usage":  "0%",
			"ram_usage":  "0GB / 0GB",
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(nodes)
}

func HandleUsers(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		rows, err := DB.Query("SELECT id, display_name, username, email, role_id, status FROM users")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var users []map[string]interface{}
		for rows.Next() {
			var id, roleID int
			var displayName, username, email, status string
			rows.Scan(&id, &displayName, &username, &email, &roleID, &status)
			users = append(users, map[string]interface{}{
				"id":           id,
				"display_name": displayName,
				"username":     username,
				"email":        email,
				"role_id":      roleID,
				"status":       status,
			})
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(users)
	case http.MethodPost:
		var u struct {
			DisplayName string `json:"display_name"`
			Username    string `json:"username"`
			Email       string `json:"email"`
			Password    string `json:"password"`
			RoleID      int    `json:"role_id"`
		}
		if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Error hashing password", http.StatusInternalServerError)
			return
		}

		_, err = DB.Exec(
			"INSERT INTO users (display_name, username, email, password, role_id, status) VALUES (?, ?, ?, ?, ?, ?)",
			u.DisplayName, u.Username, u.Email, string(hashedPassword), u.RoleID, "active",
		)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
	}
}

func HandleRoles(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		rows, err := DB.Query("SELECT id, name, color, permissions FROM roles")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var roles []map[string]interface{}
		for rows.Next() {
			var id int
			var name, color, permissions string
			rows.Scan(&id, &name, &color, &permissions)
			roles = append(roles, map[string]interface{}{
				"id":          id,
				"name":        name,
				"color":       color,
				"permissions": permissions,
			})
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(roles)
	case http.MethodPost:
		var role struct {
			Name        string `json:"name"`
			Color       string `json:"color"`
			Permissions string `json:"permissions"`
		}
		if err := json.NewDecoder(r.Body).Decode(&role); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err := DB.Exec("INSERT INTO roles (name, color, permissions) VALUES (?, ?, ?)", role.Name, role.Color, role.Permissions)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
	}
}

func HandleSettings(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		rows, err := DB.Query("SELECT key, value FROM settings")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		settings := make(map[string]string)
		for rows.Next() {
			var key, value string
			rows.Scan(&key, &value)
			settings[key] = value
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(settings)
	case http.MethodPost:
		var s map[string]string
		if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		for k, v := range s {
			_, err := DB.Exec("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", k, v)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
		w.WriteHeader(http.StatusOK)
	}
}

func HandleThemes(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		rows, err := DB.Query("SELECT id, name, config, is_active FROM themes")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var themes []map[string]interface{}
		for rows.Next() {
			var id, isActive int
			var name, config string
			rows.Scan(&id, &name, &config, &isActive)
			themes = append(themes, map[string]interface{}{
				"id":        id,
				"name":      name,
				"config":    config,
				"is_active": isActive == 1,
			})
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(themes)
	case http.MethodPost:
		var t struct {
			Name   string `json:"name"`
			Config string `json:"config"`
		}
		if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err := DB.Exec("INSERT INTO themes (name, config, is_active) VALUES (?, ?, 0)", t.Name, t.Config)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
	}
}

func containsPort(s string) bool {
	if strings.Contains(s, "://") {
		parts := strings.SplitN(s, "://", 2)
		s = parts[1]
	}
	lastColon := strings.LastIndex(s, ":")
	if lastColon == -1 {
		return false
	}
	return true
}
