package backend

import (
	"encoding/json"
	"net/http"
)

func HandleTickets(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		tickets := []map[string]interface{}{
			{"id": 1, "subject": "Unable to connect to Node 01", "user": "kshosting", "status": "open", "priority": "high", "created_at": "2h ago"},
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(tickets)
	case http.MethodPost:
		w.WriteHeader(http.StatusCreated)
	}
}
