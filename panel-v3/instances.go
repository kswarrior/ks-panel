package main

import (
	"encoding/json"
	"net/http"
	"strconv"
)

func HandleInstances(w http.ResponseWriter, r *http.Request) {
	rows, err := DB.Query("SELECT id, name, status, memory, cpu, disk FROM instances")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var instances []map[string]interface{}
	for rows.Next() {
		var id int
		var name, status string
		var memory, cpu, disk int
		if err := rows.Scan(&id, &name, &status, &memory, &cpu, &disk); err != nil {
			continue
		}
		instances = append(instances, map[string]interface{}{
			"id":     id,
			"name":   name,
			"status": status,
			"memory": memory,
			"cpu":    cpu,
			"disk":   disk,
		})
	}
	if instances == nil {
		instances = []map[string]interface{}{}
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(instances)
}

func HandleCreateInstance(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var inst struct {
		Name       string `json:"name"`
		NodeID     string `json:"nodeId"`
		TemplateID string `json:"templateId"`
		Memory     string `json:"memory"`
		CPU        string `json:"cpu"`
		Disk       string `json:"disk"`
	}

	if err := json.NewDecoder(r.Body).Decode(&inst); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	nodeID, _ := strconv.Atoi(inst.NodeID)
	templateID, _ := strconv.Atoi(inst.TemplateID)
	mem, _ := strconv.Atoi(inst.Memory)
	cpu, _ := strconv.Atoi(inst.CPU)
	disk, _ := strconv.Atoi(inst.Disk)

	_, err := DB.Exec(
		"INSERT INTO instances (name, status, node_id, template_id, memory, cpu, disk) VALUES ($1, $2, $3, $4, $5, $6, $7)",
		inst.Name, "Online", nodeID, templateID, mem, cpu, disk,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func HandleUpdateInstance(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Missing instance ID", http.StatusBadRequest)
		return
	}
	id, _ := strconv.Atoi(idStr)

	var inst struct {
		Name   string `json:"name"`
		Memory string `json:"memory"`
		CPU    string `json:"cpu"`
		Disk   string `json:"disk"`
	}

	if err := json.NewDecoder(r.Body).Decode(&inst); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	mem, _ := strconv.Atoi(inst.Memory)
	cpu, _ := strconv.Atoi(inst.CPU)
	disk, _ := strconv.Atoi(inst.Disk)

	_, err := DB.Exec(
		"UPDATE instances SET name = $1, memory = $2, cpu = $3, disk = $4 WHERE id = $5",
		inst.Name, mem, cpu, disk, id,
	)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func HandleDeleteInstance(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	idStr := r.URL.Query().Get("id")
	if idStr == "" {
		http.Error(w, "Missing instance ID", http.StatusBadRequest)
		return
	}
	id, _ := strconv.Atoi(idStr)

	_, err := DB.Exec("DELETE FROM instances WHERE id = $1", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
