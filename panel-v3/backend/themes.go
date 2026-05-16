package backend

import (
	"encoding/json"
	"net/http"
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
