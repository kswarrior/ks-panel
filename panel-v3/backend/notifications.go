package backend

import (
	"encoding/json"
	"net/http"
	"time"
)

func HandleNotifications(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		// In a real app, you'd have a notifications table
		// For now, let's use a mock or create the table if missing
		notifications := []map[string]interface{}{
			{"id": 1, "title": "System Update", "message": "The panel has been updated to v3.0.0", "type": "info", "created_at": time.Now().Format("2006-01-02 15:04")},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(notifications)
	case http.MethodPost:
		w.WriteHeader(http.StatusCreated)
	}
}
