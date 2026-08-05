package main

import (
	"bytes"
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kswarrior/ks-wings/config"
	"github.com/kswarrior/ks-wings/providers/docker"
	"github.com/kswarrior/ks-wings/routes"
	"github.com/shirou/gopsutil/v4/cpu"
	"github.com/shirou/gopsutil/v4/disk"
	"github.com/shirou/gopsutil/v4/host"
	"github.com/shirou/gopsutil/v4/mem"
	"github.com/sirupsen/logrus"
)

var log = logrus.New()
var dockerProvider *docker.Provider

func main() {
	// Setup logging
	log.SetFormatter(&logrus.TextFormatter{
		FullTimestamp: true,
	})

	// Flags
	panelURL := flag.String("panel", "", "The URL of the panel to fetch configuration from")
	configKey := flag.String("key", "", "The configuration key for the node")
	doConfigure := flag.Bool("configure", false, "Run the configuration process")
	flag.Parse()

	if *doConfigure {
		if *panelURL == "" || *configKey == "" {
			log.Fatal("Panel URL and configuration key are required for configuration.")
		}
		runConfiguration(*panelURL, *configKey)
		return
	}

	// Load Config
	cfgPath := "config.json"
	cfg, err := config.LoadConfig(cfgPath)
	if err != nil {
		log.Fatalf("Failed to load config (run with --configure if needed): %v", err)
	}

	log.Infof("Starting KS Wings Go version v%s", cfg.Version)

	// Initialize Providers
	dockerProvider, err = docker.NewProvider()
	if err != nil {
		log.Fatalf("Failed to initialize Docker provider: %v", err)
	}

	// Create necessary folders
	os.MkdirAll("volumes", 0755)
	os.MkdirAll("storage", 0755)

	// Gin Engine
	r := gin.Default()

	// Basic Auth Middleware
	auth := gin.BasicAuth(gin.Accounts{
		"kspanel": cfg.Key,
	})

	// Routes
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"versionFamily":  1,
			"versionRelease": "kswings-go " + cfg.Version,
			"online":         true,
			"remote":         cfg.Remote,
		})
	})

	api := r.Group("/", auth)
	{
		api.GET("/stats", handleStats)
		api.GET("/resourceMonitor", handleResourceMonitor)
		routes.RegisterInstanceRoutes(api, dockerProvider)
		routes.RegisterFileRoutes(api)
		routes.RegisterWebSocketRoutes(api)
	}

	// Server
	port := fmt.Sprintf(":%d", cfg.Port)
	srv := &http.Server{
		Addr:    port,
		Handler: r,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	log.Infof("kswings is listening on port %s", port)

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Info("Server exiting")
}

func handleStats(c *gin.Context) {
	h, _ := host.Info()
	uptime := fmt.Sprintf("%dm", h.Uptime/60)

	v, _ := mem.VirtualMemory()
	c_pct, _ := cpu.Percent(time.Second, false)
	d, _ := disk.Usage("/")

	cpu_pct := 0.0
	if len(c_pct) > 0 {
		cpu_pct = c_pct[0]
	}

	containers, _ := dockerProvider.ListInstances(c.Request.Context())
	onlineCount := 0
	for _, container := range containers {
		if container.State == "running" {
			onlineCount++
		}
	}

	c.JSON(200, gin.H{
		"uptime":                uptime,
		"onlineContainersCount": onlineCount,
		"totalStats": gin.H{
			"cpu": cpu_pct,
			"ram": gin.H{
				"total":   float64(v.Total) / (1024 * 1024 * 1024),
				"used":    float64(v.Used) / (1024 * 1024 * 1024),
				"percent": v.UsedPercent,
			},
			"disk": gin.H{
				"total":   float64(d.Total) / (1024 * 1024 * 1024),
				"used":    float64(d.Used) / (1024 * 1024 * 1024),
				"percent": d.UsedPercent,
			},
		},
	})
}

func runConfiguration(panelURL, configKey string) {
	log.Infof("Fetching configuration from %s...", panelURL)

	client := &http.Client{Timeout: 10 * time.Second}
	reqURL := fmt.Sprintf("%s/admin/nodes/configure?configureKey=%s", panelURL, configKey)

	resp, err := client.Post(reqURL, "application/json", nil)
	if err != nil {
		log.Fatalf("Failed to connect to panel: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		body, _ := io.ReadAll(resp.Body)
		log.Fatalf("Panel returned error (%d): %s", resp.StatusCode, string(body))
	}

	configData, err := io.ReadAll(resp.Body)
	if err != nil {
		log.Fatalf("Failed to read configuration data: %v", err)
	}

	// Validate JSON
	var js json.RawMessage
	if err := json.Unmarshal(configData, &js); err != nil {
		log.Fatalf("Received invalid JSON from panel: %v", err)
	}

	// Pretty print
	var out bytes.Buffer
	json.Indent(&out, configData, "", "  ")

	err = os.WriteFile("config.json", out.Bytes(), 0644)
	if err != nil {
		log.Fatalf("Failed to save config.json: %v", err)
	}

	log.Info("Configuration successfully fetched and saved to config.json")
}

func handleResourceMonitor(c *gin.Context) {
	v, err := mem.VirtualMemory()
	if err != nil {
		log.Errorf("Failed to get RAM info: %v", err)
	}

	c_pct, err := cpu.Percent(time.Millisecond*500, false)
	if err != nil {
		log.Errorf("Failed to get CPU info: %v", err)
	}

	d, err := disk.Usage("/")
	if err != nil {
		log.Errorf("Failed to get Disk info: %v", err)
	}

	cpu_pct := 0.0
	if len(c_pct) > 0 {
		cpu_pct = c_pct[0]
	}

	// Helper to handle nil values if gopsutil fails
	var ramPercent, ramUsed, ramTotal float64
	if v != nil {
		ramPercent = v.UsedPercent
		ramUsed = float64(v.Used) / (1024 * 1024 * 1024)
		ramTotal = float64(v.Total) / (1024 * 1024 * 1024)
	}

	var diskPercent, diskUsed, diskTotal float64
	if d != nil {
		diskPercent = d.UsedPercent
		diskUsed = float64(d.Used) / (1024 * 1024 * 1024)
		diskTotal = float64(d.Total) / (1024 * 1024 * 1024)
	}

	c.JSON(200, gin.H{
		"cpu": gin.H{
			"percent": cpu_pct,
		},
		"ram": gin.H{
			"percent": ramPercent,
			"used":    ramUsed,
			"total":   ramTotal,
		},
		"disk": gin.H{
			"percent": diskPercent,
			"used":    diskUsed,
			"total":   diskTotal,
		},
	})
}
