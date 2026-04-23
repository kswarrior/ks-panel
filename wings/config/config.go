package config

import (
	"encoding/json"
	"os"
)

type Config struct {
	Remote string `json:"remote"`
	Key    string `json:"key"`
	Port   int    `json:"port"`
	Mysql  struct {
		Host     string `json:"host"`
		User     string `json:"user"`
		Password string `json:"password"`
	} `json:"mysql"`
	Ftp struct {
		Ip   string `json:"ip"`
		Port int    `json:"port"`
	} `json:"ftp"`
	Ssl struct {
		Enabled bool   `json:"enabled"`
		Cert    string `json:"cert"`
		Key     string `json:"key"`
	} `json:"ssl"`
	Proxy   bool   `json:"proxy"`
	Version string `json:"version"`
}

func LoadConfig(path string) (*Config, error) {
	file, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	var cfg Config
	err = json.Unmarshal(file, &cfg)
	return &cfg, err
}
