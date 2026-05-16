package main

import (
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"

	"kspanel/backend"
)

func main() {
	mux := http.NewServeMux()

	// Serve API routes
	mux.HandleFunc("/api/status", backend.HandleStatus)
	mux.HandleFunc("/api/instances", backend.HandleInstances)

	// Serve Frontend
	frontendBuild, err := fs.Sub(frontendFS, "frontend/out")
	if err != nil {
		log.Fatal(err)
	}
	fileServer := http.FileServer(http.FS(frontendBuild))

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// If requesting an API route that wasn't matched above, 404
		if strings.HasPrefix(r.URL.Path, "/api/") {
			http.NotFound(w, r)
			return
		}

		// Check if file exists in embedded FS
		path := strings.TrimPrefix(r.URL.Path, "/")
		if path == "" {
			path = "index.html"
		}

		_, err := frontendBuild.Open(path)
		if err != nil {
			// If file not found, try appending .html (Next.js static export behavior)
			htmlPath := path + ".html"
			if _, err := frontendBuild.Open(htmlPath); err == nil {
				r.URL.Path = "/" + htmlPath
			} else {
				// Fallback to index.html for SPA routing
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
