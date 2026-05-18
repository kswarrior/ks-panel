package main

import (
	"encoding/json"
	"net/http"
	"strconv"
)

func HandleTickets(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(UserKey).(AuthUser)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	ticketIDStr := r.URL.Query().Get("id")

	switch r.Method {
	case http.MethodGet:
		if ticketIDStr != "" {
			ticketID, _ := strconv.Atoi(ticketIDStr)
			// Fetch Messages
			rows, err := DB.Query(`
				SELECT tm.id, tm.message, tm.created_at, u.username, u.display_name, u.role_id
				FROM ticket_messages tm
				JOIN users u ON tm.user_id = u.id
				WHERE tm.ticket_id = $1
				ORDER BY tm.created_at ASC`, ticketID)
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
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(messages)
		} else {
			// List Tickets
			query := `SELECT t.id, t.subject, t.status, t.priority, t.created_at, u.username
		          FROM tickets t JOIN users u ON t.user_id = u.id`
			args := []interface{}{}
			if user.Permissions != "*" {
				query += " WHERE t.user_id = $1"
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
				var subject, status, priority, createdAt, owner string
				rows.Scan(&id, &subject, &status, &priority, &createdAt, &owner)
				tickets = append(tickets, map[string]interface{}{
					"id":         id,
					"subject":    subject,
					"status":     status,
					"priority":   priority,
					"created_at": createdAt,
					"owner":      owner,
				})
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(tickets)
		}

	case http.MethodPost:
		if ticketIDStr != "" {
			ticketID, _ := strconv.Atoi(ticketIDStr)
			// Create Message
			var m struct {
				Message string `json:"message"`
			}
			if err := json.NewDecoder(r.Body).Decode(&m); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			_, err := DB.Exec("INSERT INTO ticket_messages (ticket_id, user_id, message) VALUES ($1, $2, $3)", ticketID, user.ID, m.Message)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusCreated)
		} else {
			// Create Ticket
			var t struct {
				Subject  string `json:"subject"`
				Priority string `json:"priority"`
			}
			if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			res, err := DB.Exec("INSERT INTO tickets (subject, user_id, status, priority) VALUES ($1, $2, $3, $4)", t.Subject, user.ID, "open", t.Priority)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			id, _ := res.LastInsertId()
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]int64{"id": id})
		}

	case http.MethodPut:
		// Update Status
		ticketID, _ := strconv.Atoi(ticketIDStr)
		var s struct {
			Status string `json:"status"`
		}
		json.NewDecoder(r.Body).Decode(&s)
		_, err := DB.Exec("UPDATE tickets SET status = $1 WHERE id = $2", s.Status, ticketID)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	}
}
