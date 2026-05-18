package main

import (
	"encoding/json"
	"net/http"
)

func HandleTemplates(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		rows, err := DB.Query("SELECT id, name, description, image FROM templates")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var templates []map[string]interface{}
		for rows.Next() {
			var id int
			var name, desc, image string
			rows.Scan(&id, &name, &desc, &image)
			templates = append(templates, map[string]interface{}{
				"id":          id,
				"name":        name,
				"description": desc,
				"image":       image,
			})
		}
		if templates == nil {
			templates = []map[string]interface{}{}
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(templates)
	case http.MethodPost:
		var t struct {
			Name        string `json:"name"`
			Description string `json:"description"`
			Image       string `json:"image"`
			Config      string `json:"config"`
		}
		if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err := DB.Exec("INSERT INTO templates (name, description, image, config) VALUES ($1, $2, $3, $4)", t.Name, t.Description, t.Image, t.Config)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
	}
}
