package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
)

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
			var id int
			var name, config string
			var isActive int
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
		_, err := DB.Exec("INSERT INTO themes (name, config, is_active) VALUES ($1, $2, 0)", t.Name, t.Config)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)

	case http.MethodPut:
		themeIDStr := r.URL.Query().Get("id")
		var t struct {
			ID     int    `json:"id"`
			Name   string `json:"name"`
			Config string `json:"config"`
			Apply  bool   `json:"apply"`
		}
		if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if t.Apply {
			// Handle Apply Theme
			DB.Exec("UPDATE themes SET is_active = 0")
			_, err := DB.Exec("UPDATE themes SET is_active = 1 WHERE id = $1", t.ID)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		} else {
			// Handle Update Theme
			var id int
			if t.ID != 0 {
				id = t.ID
			} else {
				// Fallback to URL path ID
				fmt.Sscanf(themeIDStr, "%d", &id)
			}
			_, err := DB.Exec("UPDATE themes SET name = $1, config = $2 WHERE id = $3", t.Name, t.Config, id)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
		w.WriteHeader(http.StatusOK)

	case http.MethodDelete:
		themeIDStr := r.URL.Query().Get("id")
		if themeIDStr == "" {
			http.Error(w, "Theme ID required", http.StatusBadRequest)
			return
		}
		id, _ := strconv.Atoi(themeIDStr)
		_, err := DB.Exec("DELETE FROM themes WHERE id = $1", id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	}
}
