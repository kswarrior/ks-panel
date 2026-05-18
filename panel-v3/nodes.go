package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

func HandleNodes(w http.ResponseWriter, r *http.Request) {
	rows, err := DB.Query("SELECT id, name, ip_address, connection_type FROM nodes")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type nodeResult struct {
		id             int
		name           string
		ip             string
		connectionType string
		status         string
		cpu            string
		ram            string
		disk           string
		uptimeHistory  []string
		order          int
	}

	var results []nodeResult
	var mu sync.Mutex
	var wg sync.WaitGroup

	client := http.Client{
		Timeout: 5 * time.Second,
	}

	index := 0
	for rows.Next() {
		var id int
		var name, ip, connType string
		rows.Scan(&id, &name, &ip, &connType)

		wg.Add(1)
		go func(id int, name, ip, connType string, order int) {
			defer wg.Done()

			status := "Offline"
			cpuUsage, ramUsage, diskUsage := "0%", "0GB / 0GB", "0GB / 0GB"

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
				var stats struct {
					CPU  string `json:"cpu_usage"`
					RAM  string `json:"ram_usage"`
					Disk string `json:"disk_usage"`
				}
				json.NewDecoder(resp.Body).Decode(&stats)
				cpuUsage = stats.CPU
				ramUsage = stats.RAM
				diskUsage = stats.Disk
				resp.Body.Close()
			}

			// Fetch Uptime History (Last 40 segments)
			historyRows, _ := DB.Query("SELECT status FROM node_uptime WHERE node_id = ? ORDER BY timestamp DESC LIMIT 40", id)
			var history []string
			if historyRows != nil {
				for historyRows.Next() {
					var s string
					historyRows.Scan(&s)
					history = append(history, s)
				}
				historyRows.Close()
			}

			// Record current status if online
			DB.Exec("INSERT INTO node_uptime (node_id, status) VALUES (?, ?)", id, status)

			mu.Lock()
			results = append(results, nodeResult{
				id:             id,
				name:           name,
				ip:             ip,
				connectionType: connType,
				status:         status,
				cpu:            cpuUsage,
				ram:            ramUsage,
				disk:           diskUsage,
				uptimeHistory:  history,
				order:          order,
			})
			mu.Unlock()
		}(id, name, ip, connType, index)
		index++
	}
	wg.Wait()

	// Sort results by order
	finalNodes := make([]map[string]interface{}, len(results))
	for _, res := range results {
		finalNodes[res.order] = map[string]interface{}{
			"id":              res.id,
			"name":            res.name,
			"ip_address":      res.ip,
			"connection_type": res.connectionType,
			"status":          res.status,
			"cpu_usage":       res.cpu,
			"ram_usage":       res.ram,
			"disk_usage":      res.disk,
			"uptime_history":  res.uptimeHistory,
		}
	}

	w.Header().Set("Content-Type", "application/json")
	if finalNodes == nil {
		finalNodes = []map[string]interface{}{}
	}
	json.NewEncoder(w).Encode(finalNodes)
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
		"INSERT INTO nodes (name, ip_address, status, cpu_usage, ram_usage, disk_usage, connection_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
		n.Name, ipAddress, "Offline", "0%", "0GB / 0GB", "0GB / 0GB", n.ConnectionType,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func HandleDeleteNode(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing node ID", http.StatusBadRequest)
		return
	}

	_, err := DB.Exec("DELETE FROM nodes WHERE id = ?", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func HandleUpdateNode(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing node ID", http.StatusBadRequest)
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
		if !strings.Contains(ipAddress, ":") {
			ipAddress = fmt.Sprintf("%s:%s", ipAddress, n.Port)
		} else {
			// Handle cases where host might already have a colon (unlikely with this UI but good to be safe)
			parts := strings.Split(ipAddress, ":")
			ipAddress = fmt.Sprintf("%s:%s", parts[0], n.Port)
		}
	}

	_, err := DB.Exec(
		"UPDATE nodes SET name = ?, ip_address = ?, connection_type = ? WHERE id = ?",
		n.Name, ipAddress, n.ConnectionType, id,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
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
