package main

import "embed"

//go:embed all:frontend/out
var frontendFS embed.FS
