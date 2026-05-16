package backend

import (
	"encoding/json"
	"net/http"
	"strings"
)

func HandleTickets(w http.ResponseWriter, r *http.Request) {
	pathParts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	ticketIDStr := ""
	if len(pathParts) > 2 {
		ticketIDStr = pathParts[2]
	}

	user, _ := r.Context().Value(UserKey).(AuthUser)

	switch r.Method {
	case http.MethodGet:
		if ticketIDStr != "" {
			// Get messages for a specific ticket
			rows, err := DB.Query(`
				SELECT tm.id, tm.message, tm.created_at, u.username, u.display_name, u.role_id
				FROM ticket_messages tm
				JOIN users u ON tm.user_id = u.id
				WHERE tm.ticket_id = ?
				ORDER BY tm.created_at ASC`, ticketIDStr)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			defer rows.Close()

			var messages []map[string]interface{}
			for rows.Next() {
				var id, roleID int
				var msg, createdAt, username, displayName string
				rows.Scan(&id, &msg, &createdAt, &username, &displayName, &roleID)
				messages = append(messages, map[string]interface{}{
					"id":           id,
					"message":      msg,
					"created_at":   createdAt,
					"username":     username,
					"display_name": displayName,
					"role_id":      roleID,
				})
			}
			if messages == nil {
				messages = []map[string]interface{}{}
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(messages)
			return
		}

		// Get all tickets (restricted to user unless admin/owner)
		query := `SELECT t.id, t.subject, t.status, t.priority, t.created_at, u.username
		          FROM tickets t JOIN users u ON t.user_id = u.id`
		args := []interface{}{}
		if user.Permissions != "*" {
			query += " WHERE t.user_id = ?"
			args = append(args, user.ID)
		}
		query += " ORDER BY t.created_at DESC"

		rows, err := DB.Query(query, args...)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var tickets []map[string]interface{}
		for rows.Next() {
			var id int
			var subject, status, priority, createdAt, username string
			rows.Scan(&id, &subject, &status, &priority, &createdAt, &username)
			tickets = append(tickets, map[string]interface{}{
				"id":         id,
				"subject":    subject,
				"status":     status,
				"priority":   priority,
				"created_at": createdAt,
				"user":       username,
			})
		}
		if tickets == nil {
			tickets = []map[string]interface{}{}
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(tickets)

	case http.MethodPost:
		if ticketIDStr != "" {
			// Add a message to a ticket
			var m struct {
				Message string `json:"message"`
			}
			if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			_, err := DB.Exec("INSERT INTO ticket_messages (ticket_id, user_id, message) VALUES (?, ?, ?)", ticketIDStr, user.ID, m.Message)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusCreated)
			return
		}

		// Create a new ticket
		var t struct {
			Subject  string `json:"subject"`
			Priority string `json:"priority"`
		}
		if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		res, err := DB.Exec("INSERT INTO tickets (subject, user_id, status, priority) VALUES (?, ?, ?, ?)", t.Subject, user.ID, "open", t.Priority)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		id, _ := res.LastInsertId()
		// Auto-add first message if you want, but simple for now
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]int64{"id": id})

	case http.MethodPut:
		// Toggle status or close
		if ticketIDStr == "" {
			http.Error(w, "Ticket ID required", http.StatusBadRequest)
			return
		}
		var s struct {
			Status string `json:"status"`
		}
		json.NewDecoder(r.Body).Decode(&s)
		_, err := DB.Exec("UPDATE tickets SET status = ? WHERE id = ?", s.Status, ticketIDStr)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	}
}
