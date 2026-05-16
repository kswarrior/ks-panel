package backend

import (
	"encoding/json"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"
)

func HandleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var credentials struct {
		Identifier string `json:"identifier"`
		Password   string `json:"password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&credentials); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var username, hashedPassword string
	err := DB.QueryRow("SELECT username, password FROM users WHERE username = ? OR email = ?", credentials.Identifier, credentials.Identifier).Scan(&username, &hashedPassword)
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(credentials.Password)); err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Simple session using username in cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "ks_session",
		Value:    username,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: true,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Login successful"})
}

func HandleMe(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(UserKey).(AuthUser)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var u struct {
		ID          int    `json:"id"`
		Username    string `json:"username"`
		RoleID      int    `json:"role_id"`
		Permissions string `json:"permissions"`
	}
	u.ID = user.ID
	u.Username = user.Username
	u.RoleID = user.RoleID
	u.Permissions = user.Permissions

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(u)
}
