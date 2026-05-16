package backend

import (
	"encoding/json"
	"net/http"
)

func HandleInstances(w http.ResponseWriter, r *http.Request) {
	instances := []map[string]interface{}{
		{"id": 1, "name": "Main Web Server", "status": "Running"},
		{"id": 2, "name": "Database Node 01", "status": "Running"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(instances)
}
