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

func HandleCreateNode(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var n struct {
		Name           string `json:"name"`
		ConnectionType string `json:"connection_type"`
		Host           string `json:"host"`
		Port           string `json:"port"`
	}

	if err := json.NewDecoder(r.Body).Decode(&n); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	ipAddress := n.Host
	if n.ConnectionType == "Localhost" {
		ipAddress = "localhost"
	}
	if n.Port != "" {
		ipAddress = fmt.Sprintf("%s:%s", ipAddress, n.Port)
	}

	_, err := DB.Exec(
		"INSERT INTO nodes (name, ip_address, status, cpu_usage, ram_usage) VALUES (?, ?, ?, ?, ?)",
		n.Name, ipAddress, "Offline", "0%", "0GB / 0GB",
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
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
