package main

import (
	"fmt"
	"kspanel/backend"
)

func main() {
	// This is a mockup of how a Go plugin might look if using the 'plugin' package or similar.
	// For this boilerplate, we'll use a direct registration pattern in extensions.go.
}

// In a real system, the loader would call an Init function
func Init() {
	backend.RegisterHook(backend.OnServerStart, func(data interface{}) {
		fmt.Printf("[Cyber-Stats] Received OnServerStart event: %v\n", data)
	})
}
