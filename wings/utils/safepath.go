package utils

import (
	"fmt"
	"path/filepath"
	"strings"
)

func SafePath(base, sub string) (string, error) {
	absBase, err := filepath.Abs(base)
	if err != nil {
		return "", err
	}

	target := filepath.Join(absBase, sub)
	absTarget, err := filepath.Abs(target)
	if err != nil {
		return "", err
	}

	if !strings.HasPrefix(absTarget, absBase) {
		return "", fmt.Errorf("attempting to access outside of the volume: %s", absTarget)
	}

	return absTarget, nil
}
