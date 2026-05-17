package main

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func HandleFiles(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Query().Get("path")
	if path == "" {
		path = "."
	}

	// Security: Prevent path traversal
	absPath, err := filepath.Abs(path)
	if err != nil {
		http.Error(w, "Invalid path", http.StatusBadRequest)
		return
	}

	cwd, _ := os.Getwd()
	if !strings.HasPrefix(absPath, cwd) {
		http.Error(w, "Forbidden: Path traversal detected", http.StatusForbidden)
		return
	}

	switch r.Method {
	case http.MethodGet:
		entries, err := os.ReadDir(path)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		var files []map[string]interface{}
		for _, e := range entries {
			info, _ := e.Info()
			files = append(files, map[string]interface{}{
				"name":  e.Name(),
				"isDir": e.IsDir(),
				"size":  info.Size(),
				"time":  info.ModTime().Format("2006-01-02 15:04"),
			})
		}
		if files == nil {
			files = []map[string]interface{}{}
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(files)

	case http.MethodDelete:
		err := os.RemoveAll(path)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
	}
}

func HandleScan(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Simulate a virus scan looking for "suspicious" strings in the codebase
	// In a real scenario, this would use ClamAV or similar
	threats := []map[string]string{}

	searchDir := "."
	filepath.Walk(searchDir, func(path string, info os.FileInfo, err error) error {
		if err != nil || info.IsDir() || strings.Contains(path, "node_modules") || strings.Contains(path, ".next") {
			return nil
		}

		content, err := os.ReadFile(path)
		if err == nil {
			s := string(content)
			if strings.Contains(s, "eval(") || strings.Contains(s, "exec.Command") {
				threats = append(threats, map[string]string{
					"name":    "Heuristic.Suspicious.Script",
					"details": "Found suspicious function call in " + path,
					"level":   "Medium",
				})
			}
		}
		return nil
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(threats)
}
