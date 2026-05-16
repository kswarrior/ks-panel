package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/mem"
)

func main() {
	// CLI Flags
	portFlag := flag.String("port", "5050", "Port to run the server on")
	sslFlag := flag.Bool("ssl", false, "Enable SSL/TLS")
	certFlag := flag.String("cert", "cert.pem", "Path to SSL certificate")
	keyFlag := flag.String("key", "key.pem", "Path to SSL private key")
	flag.Parse()

	// Initialize Local Database
	InitDB()

	mux := http.NewServeMux()

	mux.HandleFunc("/status", handleStatus)
	mux.HandleFunc("/heartbeat", handleHeartbeat)

	if *sslFlag {
		log.Printf("KS EDGE starting with SSL on :%s\n", *portFlag)
		if err := http.ListenAndServeTLS(":"+*portFlag, *certFlag, *keyFlag, mux); err != nil {
			log.Fatal(err)
		}
	} else {
		log.Printf("KS EDGE starting on :%s\n", *portFlag)
		if err := http.ListenAndServe(":"+*portFlag, mux); err != nil {
			log.Fatal(err)
		}
	}
}

func handleStatus(w http.ResponseWriter, r *http.Request) {
	vm, _ := mem.VirtualMemory()
	perc, _ := cpu.Percent(time.Second, false)
	usage, _ := disk.Usage("/")

	cpuStr := "0%"
	if len(perc) > 0 {
		cpuStr = fmt.Sprintf("%.1f%%", perc[0])
	}

	ramStr := fmt.Sprintf("%.1fGB / %.1fGB", float64(vm.Used)/1024/1024/1024, float64(vm.Total)/1024/1024/1024)
	diskStr := fmt.Sprintf("%.1fGB / %.1fGB", float64(usage.Used)/1024/1024/1024, float64(usage.Total)/1024/1024/1024)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"node_status": "online",
		"service":     "ksedge",
		"version":     "1.0.0",
		"cpu_usage":   cpuStr,
		"ram_usage":   ramStr,
		"disk_usage":  diskStr,
	})
}

func handleHeartbeat(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}
