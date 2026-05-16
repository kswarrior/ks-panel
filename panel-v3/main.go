package main

import (
	"bufio"
	"flag"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"strings"
	"syscall"

	"golang.org/x/crypto/bcrypt"
	"golang.org/x/term"
)

func main() {
	// CLI Flags
	portFlag := flag.String("port", "4040", "Port to run the server on")
	flag.Parse()

	// Initialize Database
	InitDB()

	// Check for commands
	args := flag.Args()
	if len(args) > 0 {
		switch args[0] {
		case "create:user":
			createUser()
			return
		}
	}

	mux := http.NewServeMux()

	// Serve API routes
	mux.HandleFunc("/api/status", HandleStatus)
	mux.HandleFunc("/api/instances", HandleInstances)
	mux.HandleFunc("/api/nodes", HandleNodes)

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

	log.Printf("KS PANEL v3 starting on :%s\n", *portFlag)
	if err := http.ListenAndServe(":"+*portFlag, mux); err != nil {
		log.Fatal(err)
	}
}

func createUser() {
	reader := bufio.NewReader(os.Stdin)

	fmt.Print("Enter Username: ")
	username, _ := reader.ReadString('\n')
	username = strings.TrimSpace(username)

	fmt.Print("Enter Email: ")
	email, _ := reader.ReadString('\n')
	email = strings.TrimSpace(email)

	fmt.Print("Enter Password: ")
	bytePassword, _ := term.ReadPassword(int(syscall.Stdin))
	password := string(bytePassword)
	fmt.Println()

	fmt.Print("Confirm Password: ")
	byteConfirmPassword, _ := term.ReadPassword(int(syscall.Stdin))
	confirmPassword := string(byteConfirmPassword)
	fmt.Println()

	if password != confirmPassword {
		log.Fatal("Passwords do not match")
	}

	fmt.Print("Enter Role (owner/admin/user): ")
	role, _ := reader.ReadString('\n')
	role = strings.ToLower(strings.TrimSpace(role))

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Error hashing password: %v", err)
	}

	_, err = DB.Exec(
		"INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)",
		username, email, string(hashedPassword), role, "active",
	)
	if err != nil {
		log.Fatalf("Error creating user: %v", err)
	}

	fmt.Printf("User %s created successfully with role %s\n", username, role)
}
