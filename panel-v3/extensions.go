package main

import (
	"encoding/json"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

// ExtensionManifest defines the structure of an extension
type ExtensionManifest struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Version     string `json:"version"`
	Author      string `json:"author"`
	Description string `json:"description"`
	Frontend    struct {
		Routes []struct {
			Path      string `json:"path"`
			Component string `json:"component"`
			Title     string `json:"title"`
		} `json:"routes"`
		Slots []struct {
			Target    string `json:"target"`
			Component string `json:"component"`
		} `json:"slots"`
	} `json:"frontend"`
	Backend struct {
		Hooks     []string `json:"hooks"`
		APIRoutes []struct {
			Path    string `json:"path"`
			Method  string `json:"method"`
			Handler string `json:"handler"`
		} `json:"api_routes"`
	} `json:"backend"`
}

var Extensions []ExtensionManifest
var overrideIndex = make(map[string]string) // file_path -> extension_overrides_full_path

// Hook types
const (
	OnServerStart   = "OnServerStart"
	OnServerStop    = "OnServerStop"
	OnUserRegister  = "OnUserRegister"
	OnInstanceCreate = "OnInstanceCreate"
)

type HookHandler func(data interface{})

var hooks = make(map[string][]HookHandler)

// RegisterHook adds a handler for a specific event
func RegisterHook(event string, handler HookHandler) {
	hooks[event] = append(hooks[event], handler)
}

// TriggerHook executes all registered handlers for an event with panic recovery
func TriggerHook(event string, data interface{}) {
	if handlers, ok := hooks[event]; ok {
		for _, handler := range handlers {
			go func(h HookHandler) {
				defer func() {
					if r := recover(); r != nil {
						log.Printf("Extension hook '%s' panicked: %v", event, r)
					}
				}()
				h(data)
			}(handler)
		}
	}
}

// RegisterExtensionRoutes adds dynamic API routes defined in extensions to the mux
func RegisterExtensionRoutes(mux *http.ServeMux) {
	for _, m := range Extensions {
		for _, route := range m.Backend.APIRoutes {
			log.Printf("Registering extension API route: [%s] %s", route.Method, route.Path)
			// In a production system, we'd use a dynamic loader (e.g. yaegi) to map the 'Handler' string
			// to an actual Go function. For this boilerplate, we'll provide a generic handler.
			path := route.Path
			mux.HandleFunc(path, func(w http.ResponseWriter, r *http.Request) {
				w.Header().Set("Content-Type", "application/json")
				json.NewEncoder(w).Encode(map[string]interface{}{
					"extension": m.ID,
					"message":   "Dynamic API response from extension",
					"handler":   route.Handler,
				})
			})
		}
	}
}

// LoadExtensions scans the extensions directory and loads manifests
func LoadExtensions() {
	extDir := "./extensions"
	if _, err := os.Stat(extDir); os.IsNotExist(err) {
		return
	}

	entries, err := os.ReadDir(extDir)
	if err != nil {
		log.Printf("Error reading extensions directory: %v", err)
		return
	}

	for _, entry := range entries {
		if entry.IsDir() {
			extPath := filepath.Join(extDir, entry.Name())
			manifestPath := filepath.Join(extPath, "manifest.json")
			data, err := os.ReadFile(manifestPath)
			if err != nil {
				continue
			}

			var m ExtensionManifest
			if err := json.Unmarshal(data, &m); err == nil {
				Extensions = append(Extensions, m)
				log.Printf("Loaded extension: %s (%s)", m.Name, m.Version)

				// Index overrides
				overrideDir := filepath.Join(extPath, "overrides")
				filepath.Walk(overrideDir, func(path string, info os.FileInfo, err error) error {
					if err == nil && !info.IsDir() {
						rel, _ := filepath.Rel(overrideDir, path)
						overrideIndex[rel] = path
					}
					return nil
				})
			}
		}
	}
}

// LayeredFS implements fs.FS with extension override support
type LayeredFS struct {
	Base fs.FS
}

func (l *LayeredFS) Open(name string) (fs.File, error) {
	// 1. Check Extensions for Overrides (Indexed)
	if overridePath, ok := overrideIndex[name]; ok {
		return os.Open(overridePath)
	}

	// 2. Fallback to Base (Embedded)
	return l.Base.Open(name)
}

// ServeExtensionAssets handles requests for specific extension files (js/css/images)
func ServeExtensionAssets(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/extensions/")
	parts := strings.SplitN(path, "/", 2)
	if len(parts) < 2 {
		http.NotFound(w, r)
		return
	}

	extID := parts[0]
	filePath := parts[1]

	fullPath := filepath.Join("extensions", extID, "frontend", filePath)
	if _, err := os.Stat(fullPath); err == nil {
		http.ServeFile(w, r, fullPath)
		return
	}

	http.NotFound(w, r)
}

// GetExtensionsHandler returns the list of loaded extensions for the frontend
func GetExtensionsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(Extensions)
}
