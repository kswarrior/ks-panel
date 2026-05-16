package backend

import (
	"encoding/json"
	"net/http"
	"strings"
)

func HandleNotifications(w http.ResponseWriter, r *http.Request) {
	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	notifIDStr := ""
	if len(pathParts) > 2 {
		notifIDStr = pathParts[2]
	}

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
			var title, message, nType, createdAt string
			rows.Scan(&id, &title, &message, &nType, &createdAt)
			notifications = append(notifications, map[string]interface{}{
				"id":         id,
				"title":      title,
				"message":    message,
				"type":       nType,
				"created_at": createdAt,
			})
		}
		if notifications == nil {
			notifications = []map[string]interface{}{}
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
		_, err := DB.Exec("INSERT INTO notifications (title, message, type) VALUES (?, ?, ?)", n.Title, n.Message, n.Type)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)

	case http.MethodDelete:
		if notifIDStr == "" {
			http.Error(w, "Notification ID required", http.StatusBadRequest)
			return
		}
		_, err := DB.Exec("DELETE FROM notifications WHERE id = ?", notifIDStr)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)

	case http.MethodPut:
		if notifIDStr == "" {
			http.Error(w, "Notification ID required", http.StatusBadRequest)
			return
		}
		var n struct {
			Title   string `json:"title"`
			Message string `json:"message"`
			Type    string `json:"type"`
		}
		if err := json.NewDecoder(r.Body).Decode(&n); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		_, err := DB.Exec("UPDATE notifications SET title = ?, message = ?, type = ? WHERE id = ?", n.Title, n.Message, n.Type, notifIDStr)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	}
}
