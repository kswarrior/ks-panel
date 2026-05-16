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

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("ks_session")
		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var user AuthUser
		err = DB.QueryRow(`
			SELECT u.id, u.username, u.role_id, r.permissions
			FROM users u
			JOIN roles r ON u.role_id = r.id
			JOIN sessions s ON u.id = s.user_id
			WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP`, cookie.Value).Scan(&user.ID, &user.Username, &user.RoleID, &user.Permissions)

		if err != nil {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserKey, user)
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

			if user.Permissions == "*" {
				next.ServeHTTP(w, r)
				return
			}

			perms := strings.Split(user.Permissions, ",")
			allowed := false
			for _, p := range perms {
				if strings.TrimSpace(p) == permission {
					allowed = true
					break
				}
			}

			if !allowed {
				http.Error(w, "Forbidden", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
