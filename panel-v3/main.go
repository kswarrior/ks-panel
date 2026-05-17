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

	"kspanel/backend"

	"golang.org/x/crypto/bcrypt"
	"golang.org/x/term"
)

func main() {
	// CLI Flags
	portFlag := flag.String("port", "8080", "Port to run the server on")
	sslFlag := flag.Bool("ssl", false, "Enable SSL/TLS")
	certFlag := flag.String("cert", "cert.pem", "Path to SSL certificate")
	keyFlag := flag.String("key", "key.pem", "Path to SSL private key")
	flag.Parse()

	// Initialize Database
	backend.InitDB()

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
	mux.HandleFunc("/api/status", backend.HandleStatus)
	mux.HandleFunc("/api/login", backend.HandleLogin)
	mux.HandleFunc("/api/logout", backend.HandleLogout)

	// Protected routes
	auth := backend.AuthMiddleware
	perm := backend.PermissionMiddleware

	mux.Handle("/api/me", auth(http.HandlerFunc(backend.HandleMe)))
	mux.Handle("/api/instances", auth(perm("view_instances")(http.HandlerFunc(backend.HandleInstances))))

	mux.Handle("/api/nodes", auth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost:
			perm("manage_nodes")(http.HandlerFunc(backend.HandleCreateNode)).ServeHTTP(w, r)
		case http.MethodPut:
			perm("manage_nodes")(http.HandlerFunc(backend.HandleUpdateNode)).ServeHTTP(w, r)
		case http.MethodDelete:
			perm("manage_nodes")(http.HandlerFunc(backend.HandleDeleteNode)).ServeHTTP(w, r)
		default:
			perm("view_nodes")(http.HandlerFunc(backend.HandleNodes)).ServeHTTP(w, r)
		}
	})))

	mux.Handle("/api/users", auth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodPost, http.MethodPut, http.MethodDelete:
			perm("manage_users")(http.HandlerFunc(backend.HandleUsers)).ServeHTTP(w, r)
		default:
			perm("view_users")(http.HandlerFunc(backend.HandleUsers)).ServeHTTP(w, r)
		}
	})))

	mux.Handle("/api/roles/", auth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			perm("view_roles")(http.HandlerFunc(backend.HandleRoles)).ServeHTTP(w, r)
		} else {
			perm("manage_roles")(http.HandlerFunc(backend.HandleRoles)).ServeHTTP(w, r)
		}
	})))

	mux.Handle("/api/settings", auth(perm("manage_settings")(http.HandlerFunc(backend.HandleSettings))))

	mux.Handle("/api/themes/", auth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			perm("view_themes")(http.HandlerFunc(backend.HandleThemes)).ServeHTTP(w, r)
		} else {
			perm("manage_themes")(http.HandlerFunc(backend.HandleThemes)).ServeHTTP(w, r)
		}
	})))

	mux.Handle("/api/templates", auth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			perm("view_templates")(http.HandlerFunc(backend.HandleTemplates)).ServeHTTP(w, r)
		} else {
			perm("manage_templates")(http.HandlerFunc(backend.HandleTemplates)).ServeHTTP(w, r)
		}
	})))

	mux.Handle("/api/notifications/", auth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			perm("view_instances")(http.HandlerFunc(backend.HandleNotifications)).ServeHTTP(w, r)
		} else {
			perm("manage_settings")(http.HandlerFunc(backend.HandleNotifications)).ServeHTTP(w, r)
		}
	})))

	mux.Handle("/api/tickets/", auth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		perm("view_instances")(http.HandlerFunc(backend.HandleTickets)).ServeHTTP(w, r)
	})))

	mux.Handle("/api/terminal", auth(http.HandlerFunc(backend.HandleTerminal)))
	mux.Handle("/api/instances/files", auth(perm("view_instances")(http.HandlerFunc(backend.HandleFiles))))
	mux.Handle("/api/instances/scan", auth(perm("view_instances")(http.HandlerFunc(backend.HandleScan))))

	// Apply Security Headers to all routes
	handler := backend.SecurityHeadersMiddleware(mux)

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

		// Map of internal routes that should never be leaked
		internalRoutes := []string{
			"instances", "nodes", "templates", "users", "roles", "settings", "notifications", "tickets", "account",
		}

		isInternal := false
		for _, ir := range internalRoutes {
			if strings.HasPrefix(path, ir) {
				isInternal = true
				break
			}
		}

		// Hard Backend Protection: Redirect to auth if trying to access internal HTML pages without session
		if isInternal {
			if _, err := backend.ValidateSession(r); err != nil {
				http.Redirect(w, r, "/auth", http.StatusFound)
				return
			}
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
		if err := http.ListenAndServeTLS(":"+*portFlag, *certFlag, *keyFlag, handler); err != nil {
			log.Fatal(err)
		}
	} else {
		log.Printf("KS PANEL v3 starting on :%s\n", *portFlag)
		if err := http.ListenAndServe(":"+*portFlag, handler); err != nil {
			log.Fatal(err)
		}
	}
}

func createUser() {
	rawArgs := flag.Args()[1:]
	params := make(map[string]string)

	for i := 0; i < len(rawArgs); i++ {
		arg := rawArgs[i]
		kv := ""
		if strings.HasPrefix(arg, "--") {
			kv = strings.TrimPrefix(arg, "--")
			if kv == "" && i+1 < len(rawArgs) {
				arg = rawArgs[i+1]
				i++
				kv = arg
			}
		} else if strings.Contains(arg, ":") {
			kv = arg
		}

		if kv != "" {
			parts := strings.SplitN(kv, ":", 2)
			key := strings.TrimSpace(parts[0])
			val := ""
			if len(parts) > 1 {
				val = parts[1]
			}

			// Support --key: value (space after colon)
			if (val == "" || val == " ") && i+1 < len(rawArgs) && !strings.HasPrefix(rawArgs[i+1], "--") && !strings.Contains(rawArgs[i+1], ":") {
				val = rawArgs[i+1]
				i++
			} else {
				// Append subsequent words that are not flags
				for i+1 < len(rawArgs) && !strings.HasPrefix(rawArgs[i+1], "--") && !strings.Contains(rawArgs[i+1], ":") {
					val = val + " " + rawArgs[i+1]
					i++
				}
			}
			params[key] = strings.TrimSpace(val)
		}
	}

	displayName := params["display_name"]
	username := params["username"]
	email := params["email"]
	password := params["password"]
	confirmPassword := params["confirm_password"]
	roleName := params["role"]

	if displayName == "" || username == "" || email == "" || password == "" {
		reader := bufio.NewReader(os.Stdin)

		if displayName == "" {
			fmt.Print("Enter Display Name: ")
			displayName, _ = reader.ReadString('\n')
			displayName = strings.TrimSpace(displayName)
		}

		if username == "" {
			fmt.Print("Enter Username: ")
			username, _ = reader.ReadString('\n')
			username = strings.TrimSpace(username)
		}

		if email == "" {
			fmt.Print("Enter Email: ")
			email, _ = reader.ReadString('\n')
			email = strings.TrimSpace(email)
		}

		if password == "" {
			fmt.Print("Enter Password: ")
			bytePassword, _ := term.ReadPassword(int(syscall.Stdin))
			password = string(bytePassword)
			fmt.Println()

			fmt.Print("Confirm Password: ")
			byteConfirmPassword, _ := term.ReadPassword(int(syscall.Stdin))
			confirmPassword = string(byteConfirmPassword)
			fmt.Println()
		} else if confirmPassword == "" {
			confirmPassword = password
		}
	} else if confirmPassword == "" {
		confirmPassword = password
	}

	if password != confirmPassword {
		log.Fatal("Passwords do not match")
	}

	if roleName == "" {
		roleName = "owner" // Default for CLI
	}

	// Find or create role
	var roleID int
	roleErr := backend.DB.QueryRow("SELECT id FROM roles WHERE name = ?", roleName).Scan(&roleID)
	if roleErr != nil {
		// Create role if not exists
		color := "#0ea5e9"
		if roleName == "owner" {
			color = "#ef4444"
		}
		res, err := backend.DB.Exec("INSERT INTO roles (name, color, permissions) VALUES (?, ?, ?)", roleName, color, "*")
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

	_, err = backend.DB.Exec(
		"INSERT INTO users (display_name, username, email, password, role_id, status) VALUES (?, ?, ?, ?, ?, ?)",
		displayName, username, email, string(hashedPassword), roleID, "active",
	)
	if err != nil {
		log.Fatalf("Error creating user: %v", err)
	}

	fmt.Printf("User %s created successfully with role %s (ID: %d)\n", username, roleName, roleID)
}
