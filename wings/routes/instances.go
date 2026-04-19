package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/kswarrior/ks-wings/providers/docker"
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
		c.JSON(202, gin.H{"message": "Deployment started (Go Wings Mock)"})
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
