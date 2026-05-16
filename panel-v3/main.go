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
	sslFlag := flag.Bool("ssl", false, "Enable SSL/TLS")
	certFlag := flag.String("cert", "cert.pem", "Path to SSL certificate")
	keyFlag := flag.String("key", "key.pem", "Path to SSL private key")
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
	mux.HandleFunc("/api/users", HandleUsers)
	mux.HandleFunc("/api/roles", HandleRoles)
	mux.HandleFunc("/api/settings", HandleSettings)
	mux.HandleFunc("/api/themes", HandleThemes)

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

	if *sslFlag {
		log.Printf("KS PANEL v3 starting with SSL on :%s\n", *portFlag)
		if err := http.ListenAndServeTLS(":"+*portFlag, *certFlag, *keyFlag, mux); err != nil {
			log.Fatal(err)
		}
	} else {
		log.Printf("KS PANEL v3 starting on :%s\n", *portFlag)
		if err := http.ListenAndServe(":"+*portFlag, mux); err != nil {
			log.Fatal(err)
		}
	}
}

func createUser() {
	reader := bufio.NewReader(os.Stdin)

	fmt.Print("Enter Display Name: ")
	displayName, _ := reader.ReadString('\n')
	displayName = strings.TrimSpace(displayName)

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
	roleName := strings.ToLower(strings.TrimSpace(func() string {
		r, _ := reader.ReadString('\n')
		return r
	}()))

	// Find or create role
	var roleID int
	roleErr := DB.QueryRow("SELECT id FROM roles WHERE name = ?", roleName).Scan(&roleID)
	if roleErr != nil {
		// Create role if not exists
		color := "#0ea5e9"
		if roleName == "owner" {
			color = "#ef4444"
		}
		res, err := DB.Exec("INSERT INTO roles (name, color, permissions) VALUES (?, ?, ?)", roleName, color, "*")
		if err != nil {
			log.Fatalf("Error creating role: %v", err)
		}
		id, _ := res.LastInsertId()
		roleID = int(id)
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("Error hashing password: %v", err)
	}

	_, err = DB.Exec(
		"INSERT INTO users (display_name, username, email, password, role_id, status) VALUES (?, ?, ?, ?, ?, ?)",
		displayName, username, email, string(hashedPassword), roleID, "active",
	)
	if err != nil {
		log.Fatalf("Error creating user: %v", err)
	}

	fmt.Printf("User %s created successfully with role %s (ID: %d)\n", username, roleName, roleID)
}
