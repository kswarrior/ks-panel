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
		rows.Scan(&id, &name, &status, &memory, &cpu, &disk)
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

	mem, _ := strconv.Atoi(inst.Memory)
	cpu, _ := strconv.Atoi(inst.CPU)
	disk, _ := strconv.Atoi(inst.Disk)

	_, err := DB.Exec(
		"INSERT INTO instances (name, status, node_id, template_id, memory, cpu, disk) VALUES (?, ?, ?, ?, ?, ?, ?)",
		inst.Name, "Online", inst.NodeID, inst.TemplateID, mem, cpu, disk,
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

	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing instance ID", http.StatusBadRequest)
		return
	}

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
		"UPDATE instances SET name = ?, memory = ?, cpu = ?, disk = ? WHERE id = ?",
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

	id := r.URL.Query().Get("id")
	if id == "" {
		http.Error(w, "Missing instance ID", http.StatusBadRequest)
		return
	}

	_, err := DB.Exec("DELETE FROM instances WHERE id = ?", id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}
