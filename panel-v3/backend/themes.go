package backend

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

func HandleThemes(w http.ResponseWriter, r *http.Request) {
	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	themeIDStr := ""
	if len(pathParts) > 2 {
		themeIDStr = pathParts[2]
	}

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
		if themes == nil {
			themes = []map[string]interface{}{}
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

	case http.MethodPut:
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
			_, err := DB.Exec("UPDATE themes SET is_active = 1 WHERE id = ?", t.ID)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		} else {
			// Handle Update Theme
			id := t.ID
			if id == 0 && themeIDStr != "" {
				// Fallback to URL path ID
				fmt.Sscanf(themeIDStr, "%d", &id)
			}
			_, err := DB.Exec("UPDATE themes SET name = ?, config = ? WHERE id = ?", t.Name, t.Config, id)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		}
		w.WriteHeader(http.StatusOK)

	case http.MethodDelete:
		if themeIDStr == "" {
			http.Error(w, "Theme ID required", http.StatusBadRequest)
			return
		}
		_, err := DB.Exec("DELETE FROM themes WHERE id = ?", themeIDStr)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	}
}
