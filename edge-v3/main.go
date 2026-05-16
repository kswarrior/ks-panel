package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

func main() {
	// Initialize Local Database
	InitDB()

	mux := http.NewServeMux()

	mux.HandleFunc("/status", handleStatus)
	mux.HandleFunc("/heartbeat", handleHeartbeat)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5050"
	}

	log.Printf("KS EDGE starting on :%s\n", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}

func handleStatus(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"node_status": "online",
		"service": "ksedge",
		"version": "1.0.0",
	})
}

func handleHeartbeat(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}
