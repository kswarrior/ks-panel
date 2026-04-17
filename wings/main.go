package main

import (
	"context"
	"fmt"
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

	// Load Config
	cfgPath := "config.json"
	cfg, err := config.LoadConfig(cfgPath)
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
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

func handleResourceMonitor(c *gin.Context) {
	v, _ := mem.VirtualMemory()
	c_pct, _ := cpu.Percent(time.Second, false)
	d, _ := disk.Usage("/")

	cpu_pct := 0.0
	if len(c_pct) > 0 {
		cpu_pct = c_pct[0]
	}

	c.JSON(200, gin.H{
		"cpu": gin.H{"percent": cpu_pct},
		"ram": gin.H{
			"percent": v.UsedPercent,
			"used":    float64(v.Used) / (1024 * 1024 * 1024),
			"total":   float64(v.Total) / (1024 * 1024 * 1024),
		},
		"disk": gin.H{
			"percent": d.UsedPercent,
			"used":    float64(d.Used) / (1024 * 1024 * 1024),
			"total":   float64(d.Total) / (1024 * 1024 * 1024),
		},
	})
}
