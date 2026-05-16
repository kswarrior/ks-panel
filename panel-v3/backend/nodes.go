package backend

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

func HandleNodes(w http.ResponseWriter, r *http.Request) {
	rows, err := DB.Query("SELECT id, name, ip_address FROM nodes")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type nodeResult struct {
		id      int
		name    string
		ip      string
		status  string
		cpu     string
		ram     string
		disk    string
		order   int
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
		var name, ip string
		rows.Scan(&id, &name, &ip)

		wg.Add(1)
		go func(id int, name, ip string, order int) {
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

			mu.Lock()
			results = append(results, nodeResult{
				id:     id,
				name:   name,
				ip:     ip,
				status: status,
				cpu:    cpuUsage,
				ram:    ramUsage,
				disk:   diskUsage,
				order:  order,
			})
			mu.Unlock()
		}(id, name, ip, index)
		index++
	}
	wg.Wait()

	// Sort results by order
	finalNodes := make([]map[string]interface{}, len(results))
	for _, res := range results {
		finalNodes[res.order] = map[string]interface{}{
			"id":         res.id,
			"name":       res.name,
			"ip_address": res.ip,
			"status":     res.status,
			"cpu_usage":  res.cpu,
			"ram_usage":  res.ram,
			"disk_usage": res.disk,
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
		"INSERT INTO nodes (name, ip_address, status, cpu_usage, ram_usage, disk_usage) VALUES (?, ?, ?, ?, ?, ?)",
		n.Name, ipAddress, "Offline", "0%", "0GB / 0GB", "0GB / 0GB",
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
