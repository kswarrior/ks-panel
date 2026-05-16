package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/http"
)

func main() {
	// CLI Flags
	portFlag := flag.String("port", "5050", "Port to run the server on")
	flag.Parse()

	// Initialize Local Database
	InitDB()

	mux := http.NewServeMux()

	mux.HandleFunc("/status", handleStatus)
	mux.HandleFunc("/heartbeat", handleHeartbeat)

	log.Printf("KS EDGE starting on :%s\n", *portFlag)
	if err := http.ListenAndServe(":"+*portFlag, mux); err != nil {
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
