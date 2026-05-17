package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	"golang.org/x/crypto/bcrypt"
)

func HandleUsers(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		rows, err := DB.Query("SELECT id, display_name, username, email, role_id, status FROM users")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var users []map[string]interface{}
		for rows.Next() {
			var id, roleID int
			var displayName, username, email, status string
			rows.Scan(&id, &displayName, &username, &email, &roleID, &status)
			users = append(users, map[string]interface{}{
				"id":           id,
				"display_name": displayName,
				"username":     username,
				"email":        email,
				"role_id":      roleID,
				"status":       status,
			})
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(users)
	case http.MethodPost:
		var u struct {
			DisplayName string `json:"displayName"`
			Username    string `json:"username"`
			Email       string `json:"email"`
			Password    string `json:"password"`
			RoleID      int    `json:"roleId,string"`
		}
		if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Error hashing password", http.StatusInternalServerError)
			return
		}

		_, err = DB.Exec(
			"INSERT INTO users (display_name, username, email, password, role_id, status) VALUES (?, ?, ?, ?, ?, ?)",
			u.DisplayName, u.Username, u.Email, string(hashedPassword), u.RoleID, "active",
		)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
	case http.MethodPut:
		id := r.URL.Query().Get("id")
		var targetID int

		if id == "" {
			user, ok := r.Context().Value(UserKey).(AuthUser)
			if !ok {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
			targetID = user.ID
		} else {
			targetID, _ = strconv.Atoi(id)
		}

		var u struct {
			DisplayName string `json:"displayName"`
			Username    string `json:"username"`
			Password    string `json:"password"`
			Status      string `json:"status"`
			RoleID      int    `json:"roleId"`
		}
		if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		if u.Status != "" {
			_, err := DB.Exec("UPDATE users SET status = ? WHERE id = ?", u.Status, targetID)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		} else if u.RoleID != 0 {
			_, err := DB.Exec("UPDATE users SET role_id = ? WHERE id = ?", u.RoleID, targetID)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
		} else {
			if u.Password != "" {
				hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
				if err != nil {
					http.Error(w, "Error hashing password", http.StatusInternalServerError)
					return
				}
				_, err = DB.Exec("UPDATE users SET display_name = ?, username = ?, password = ? WHERE id = ?", u.DisplayName, u.Username, string(hashedPassword), targetID)
				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			} else {
				_, err := DB.Exec("UPDATE users SET display_name = ?, username = ? WHERE id = ?", u.DisplayName, u.Username, targetID)
				if err != nil {
					http.Error(w, err.Error(), http.StatusInternalServerError)
					return
				}
			}
		}
		w.WriteHeader(http.StatusOK)

	case http.MethodDelete:
		id := r.URL.Query().Get("id")
		if id == "" {
			http.Error(w, "ID required", http.StatusBadRequest)
			return
		}
		_, err := DB.Exec("DELETE FROM users WHERE id = ?", id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	}
}
