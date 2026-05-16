package backend

import (
	"encoding/json"
	"net/http"
)

func HandleInstances(w http.ResponseWriter, r *http.Request) {
	rows, err := DB.Query("SELECT id, name, status FROM instances")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var instances []map[string]interface{}
	for rows.Next() {
		var id int
		var name, status string
		rows.Scan(&id, &name, &status)
		instances = append(instances, map[string]interface{}{
			"id":     id,
			"name":   name,
			"status": status,
		})
	}
	if instances == nil {
		instances = []map[string]interface{}{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(instances)
}
