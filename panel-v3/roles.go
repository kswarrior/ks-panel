package main

import (
	"encoding/json"
	"net/http"
	"strings"
)

func HandleRoles(w http.ResponseWriter, r *http.Request) {
	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	roleIDStr := ""
	if len(pathParts) > 2 {
		roleIDStr = pathParts[2]
	}

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
	case http.MethodPut:
		if roleIDStr == "" {
			http.Error(w, "Role ID required", http.StatusBadRequest)
			return
		}
		var role struct {
			Name        string `json:"name"`
			Color       string `json:"color"`
			Permissions string `json:"permissions"`
		}
		if err := json.NewDecoder(r.Body).Decode(&role); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err := DB.Exec("UPDATE roles SET name = ?, color = ?, permissions = ? WHERE id = ?", role.Name, role.Color, role.Permissions, roleIDStr)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	case http.MethodDelete:
		if roleIDStr == "" {
			http.Error(w, "Role ID required", http.StatusBadRequest)
			return
		}
		_, err := DB.Exec("DELETE FROM roles WHERE id = ?", roleIDStr)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	}
}
