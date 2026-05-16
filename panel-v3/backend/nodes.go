package backend

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

func HandleNodes(w http.ResponseWriter, r *http.Request) {
	rows, err := DB.Query("SELECT id, name, ip_address FROM nodes")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	nodes := []map[string]interface{}{}
	client := http.Client{
		Timeout: 5 * time.Second,
	}

	for rows.Next() {
		var id int
		var name, ip string
		rows.Scan(&id, &name, &ip)

		status := "Offline"
		targetURL := ip
		if !strings.HasPrefix(targetURL, "http://") && !strings.HasPrefix(targetURL, "https://") {
			scheme := "http://"
			addr := targetURL
			if !containsPort(addr) {
				addr = fmt.Sprintf("%s:5050", addr)
			}
			targetURL = scheme + addr
		}

		if !strings.HasSuffix(targetURL, "/status") {
			if !strings.HasSuffix(targetURL, "/") {
				targetURL += "/"
			}
			targetURL += "status"
		}

		resp, err := client.Get(targetURL)
		if err == nil && resp.StatusCode == http.StatusOK {
			status = "Online"
			resp.Body.Close()
		}

		nodes = append(nodes, map[string]interface{}{
			"id":         id,
			"name":       name,
			"ip_address": ip,
			"status":     status,
			"cpu_usage":  "0%",
			"ram_usage":  "0GB / 0GB",
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(nodes)
}

func containsPort(s string) bool {
	if strings.Contains(s, "://") {
		parts := strings.SplitN(s, "://", 2)
		s = parts[1]
	}
	lastColon := strings.LastIndex(s, ":")
	if lastColon == -1 {
		return false
	}
	return true
}
