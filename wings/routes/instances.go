package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/kswarrior/ks-wings/providers/docker"
	"github.com/sirupsen/logrus"
)

func RegisterInstanceRoutes(r *gin.RouterGroup, p *docker.Provider) {
	r.GET("/instances", func(c *gin.Context) {
		containers, err := p.ListInstances(c.Request.Context())
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, containers)
	})

	r.POST("/instances/create", func(c *gin.Context) {
		var config docker.CreateConfig
		if err := c.ShouldBindJSON(&config); err != nil {
			c.JSON(400, gin.H{"error": "Invalid configuration"})
			return
		}

		id, err := p.CreateInstance(c.Request.Context(), &config)
		if err != nil {
			logrus.Errorf("Failed to create instance: %v", err)
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}

		// Auto-start after creation
		if err := p.StartInstance(c.Request.Context(), id); err != nil {
			logrus.Errorf("Failed to start instance after creation: %v", err)
		}

		c.JSON(202, gin.H{
			"message":     "Instance created and started",
			"containerId": id,
		})
	})

	r.POST("/instances/:id/start", func(c *gin.Context) {
		id := c.Param("id")
		err := p.StartInstance(c.Request.Context(), id)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"message": "Started"})
	})

	r.POST("/instances/:id/stop", func(c *gin.Context) {
		id := c.Param("id")
		err := p.StopInstance(c.Request.Context(), id)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"message": "Stopped"})
	})

	r.DELETE("/instances/:id", func(c *gin.Context) {
		id := c.Param("id")
		err := p.DeleteInstance(c.Request.Context(), id)
		if err != nil {
			c.JSON(500, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"message": "Deleted"})
	})
}
