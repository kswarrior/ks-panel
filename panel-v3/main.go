package main

import (
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"
)

func main() {
	// Initialize Database
	InitDB()

	mux := http.NewServeMux()

	// Serve API routes
	mux.HandleFunc("/api/status", HandleStatus)
	mux.HandleFunc("/api/instances", HandleInstances)

	// Serve Frontend
	frontendBuild, err := fs.Sub(frontendFS, "frontend/out")
	if err != nil {
		log.Fatal(err)
	}
	fileServer := http.FileServer(http.FS(frontendBuild))

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if strings.HasPrefix(r.URL.Path, "/api/") {
			http.NotFound(w, r)
			return
		}

		path := strings.TrimPrefix(r.URL.Path, "/")
		if path == "" {
			path = "index.html"
		}

		_, err := frontendBuild.Open(path)
		if err != nil {
			htmlPath := path + ".html"
			if _, err := frontendBuild.Open(htmlPath); err == nil {
				r.URL.Path = "/" + htmlPath
			} else {
				r.URL.Path = "/index.html"
			}
		}

		fileServer.ServeHTTP(w, r)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "4040"
	}

	log.Printf("KS PANEL v3 starting on :%s\n", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}
