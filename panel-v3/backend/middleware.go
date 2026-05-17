package backend

import (
	"context"
	"net/http"
	"strings"
)

type contextKey string

const UserKey contextKey = "user"

type AuthUser struct {
	ID          int
	Username    string
	RoleID      int
	Permissions string
}

func (u AuthUser) HasPermission(permission string) bool {
	if u.Permissions == "*" {
		return true
	}
	perms := strings.Split(u.Permissions, ",")
	for _, p := range perms {
		if strings.TrimSpace(p) == permission {
			return true
		}
	}
	return false
}

func SecurityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Strict Security Headers
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "1; mode=block")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' ws: wss:;")
		w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains")

		next.ServeHTTP(w, r)
	})
}

func ValidateSession(r *http.Request) (*AuthUser, error) {
	cookie, err := r.Cookie("ks_session")
	if err != nil {
		return nil, err
	}

	var user AuthUser
	err = DB.QueryRow(`
		SELECT u.id, u.username, u.role_id, r.permissions
		FROM sessions s
		JOIN users u ON s.user_id = u.id
		JOIN roles r ON u.role_id = r.id
		WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP`, cookie.Value).Scan(&user.ID, &user.Username, &user.RoleID, &user.Permissions)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user, err := ValidateSession(r)
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserKey, *user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func PermissionMiddleware(permission string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user, ok := r.Context().Value(UserKey).(AuthUser)
			if !ok {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			if !user.HasPermission(permission) {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
