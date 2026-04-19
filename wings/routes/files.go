package routes

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/kswarrior/ks-wings/utils"
)

func RegisterFileRoutes(r *gin.RouterGroup) {
	r.GET("/fs/:id/files", func(c *gin.Context) {
		volumeId := c.Param("id")
		subPath := c.Query("path")

		basePath := filepath.Join(".", "volumes", volumeId)

		targetPath, err := utils.SafePath(basePath, subPath)
		if err != nil {
			c.JSON(400, gin.H{"message": err.Error()})
			return
		}

		entries, err := os.ReadDir(targetPath)
		if err != nil {
			if os.IsNotExist(err) {
				c.JSON(404, gin.H{"message": "Volume or directory not found"})
			} else {
				c.JSON(500, gin.H{"message": err.Error()})
			}
			return
		}

		type FileInfo struct {
			Name        string    `json:"name"`
			IsDirectory bool      `json:"isDirectory"`
			IsEditable  bool      `json:"isEditable"`
			Size        string    `json:"size"`
			LastUpdated time.Time `json:"lastUpdated"`
			Purpose     string    `json:"purpose"`
			Extension   string    `json:"extension"`
			Permissions string    `json:"permissions"`
		}

		var files []FileInfo
		for _, entry := range entries {
			info, _ := entry.Info()
			files = append(files, FileInfo{
				Name:        entry.Name(),
				IsDirectory: entry.IsDir(),
				IsEditable:  true,
				Size:        fmt.Sprintf("%d", info.Size()),
				LastUpdated: info.ModTime(),
				Purpose:     "file",
				Extension:   filepath.Ext(entry.Name()),
				Permissions: fmt.Sprintf("%o", info.Mode().Perm()),
			})
		}

		c.JSON(200, gin.H{"files": files})
	})
}
