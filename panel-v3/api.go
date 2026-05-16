package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

func HandleStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "online",
		"version": "3.0.0",
	})
}

func HandleInstances(w http.ResponseWriter, r *http.Request) {
	instances := []map[string]interface{}{
		{"id": 1, "name": "Main Web Server", "status": "Running"},
		{"id": 2, "name": "Database Node 01", "status": "Running"},
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(instances)
}

func HandleNodes(w http.ResponseWriter, r *http.Request) {
	rows, err := DB.Query("SELECT id, name, ip_address FROM nodes")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	nodes := []map[string]interface{}{}
	client := http.Client{
		Timeout: 2 * time.Second,
	}

	for rows.Next() {
		var id int
		var name, ip string
		rows.Scan(&id, &name, &ip)

		status := "Offline"
		addr := ip
		if !containsPort(addr) {
			addr = fmt.Sprintf("%s:5050", addr)
		}

		resp, err := client.Get(fmt.Sprintf("http://%s/status", addr))
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
	for i := len(s) - 1; i >= 0; i-- {
		if s[i] == ':' {
			return true
		}
		if s[i] < '0' || s[i] > '9' {
			return false
		}
	}
	return false
}
