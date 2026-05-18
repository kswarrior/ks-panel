package main

import (
	"encoding/json"
	"net/http"
)

func HandleStatus(w http.ResponseWriter, r *http.Request) {
	TriggerHook(OnServerStart, map[string]string{"event": "status_check"})
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "online",
		"version": "3.0.0",
	})
}
