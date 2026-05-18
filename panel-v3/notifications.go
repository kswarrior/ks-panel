package main

import (
	"encoding/json"
	"net/http"
	"strconv"
)

func HandleNotifications(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		rows, err := DB.Query("SELECT id, title, message, type, created_at FROM notifications ORDER BY created_at DESC")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var notifications []map[string]interface{}
		for rows.Next() {
			var id int
			var title, message, notifType, createdAt string
			rows.Scan(&id, &title, &message, &notifType, &createdAt)
			notifications = append(notifications, map[string]interface{}{
				"id":         id,
				"title":      title,
				"message":    message,
				"type":       notifType,
				"created_at": createdAt,
			})
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(notifications)

	case http.MethodPost:
		var n struct {
			Title   string `json:"title"`
			Message string `json:"message"`
			Type    string `json:"type"`
		}
		if err := json.NewDecoder(r.Body).Decode(&n); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err := DB.Exec("INSERT INTO notifications (title, message, type) VALUES ($1, $2, $3)", n.Title, n.Message, n.Type)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)

	case http.MethodDelete:
		notifIDStr := r.URL.Query().Get("id")
		if notifIDStr == "" {
			http.Error(w, "Notification ID required", http.StatusBadRequest)
			return
		}
		id, _ := strconv.Atoi(notifIDStr)
		_, err := DB.Exec("DELETE FROM notifications WHERE id = $1", id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)

	case http.MethodPut:
		notifIDStr := r.URL.Query().Get("id")
		if notifIDStr == "" {
			http.Error(w, "Notification ID required", http.StatusBadRequest)
			return
		}
		id, _ := strconv.Atoi(notifIDStr)
		var n struct {
			Title   string `json:"title"`
			Message string `json:"message"`
			Type    string `json:"type"`
		}
		if err := json.NewDecoder(r.Body).Decode(&n); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err := DB.Exec("UPDATE notifications SET title = $1, message = $2, type = $3 WHERE id = $4", n.Title, n.Message, n.Type, id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	}
}
