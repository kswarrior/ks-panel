package routes

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/sirupsen/logrus"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func RegisterWebSocketRoutes(r *gin.RouterGroup) {
	r.GET("/exec/:id", handleWebSocket)
	r.GET("/stats/:id", handleWebSocket)
}

func handleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		logrus.Errorf("WebSocket upgrade failed: %v", err)
		return
	}
	defer conn.Close()

	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			logrus.Errorf("WebSocket read error: %v", err)
			return
		}
		if err := conn.WriteMessage(messageType, p); err != nil {
			logrus.Errorf("WebSocket write error: %v", err)
			return
		}
	}
}
