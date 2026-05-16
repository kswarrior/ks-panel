package backend

import (
	"log"
	"net/http"
	"os/exec"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func HandleTerminal(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value(UserKey).(AuthUser)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Permission check (terminal requires manage_instances or Owner)
	if user.Permissions != "*" && !strings.Contains(user.Permissions, "manage_instances") {
		http.Error(w, "Forbidden", http.StatusForbidden)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("upgrade:", err)
		return
	}
	defer conn.Close()

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}

		// In a real scenario, you'd use a PTY.
		// For a simple standalone binary version, we'll execute and return output.
		// Note: This is dangerous without strict command white-listing or containerization.
		cmd := exec.Command("bash", "-c", string(message))
		out, err := cmd.CombinedOutput()
		if err != nil {
			conn.WriteMessage(websocket.TextMessage, []byte("Error: "+err.Error()))
			continue
		}
		conn.WriteMessage(websocket.TextMessage, out)
	}
}
