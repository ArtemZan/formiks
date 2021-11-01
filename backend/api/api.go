package api

import (
	"github.com/doublegrey/formiks/backend/api/handlers"
	"github.com/doublegrey/formiks/backend/driver"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	projectHandler := handlers.NewProjectHandler(driver.Conn)
	apiGroup := r.Group("api")
	projectsGroup := apiGroup.Group("projects")
	submissionsGroup := apiGroup.Group("submissions")
	usersGroup := apiGroup.Group("users")
	pipelinesGroup := apiGroup.Group("pipelines")
	dropdownsGroup := apiGroup.Group("dropdowns")

	projectsGroup.GET("/", projectHandler.Fetch)        // get all projects available to user
	projectsGroup.GET("/:id", projectHandler.FetchByID) // get project
	projectsGroup.POST("/", projectHandler.Create)      // create project
	projectsGroup.PUT("/:id", projectHandler.Update)    // update project
	projectsGroup.DELETE("/:id", projectHandler.Delete) // delete project

	submissionsGroup.GET("/")       // get all submissions available to user
	submissionsGroup.GET("/:id")    // get submission
	submissionsGroup.POST("/")      // create submission
	submissionsGroup.PUT("/:id")    // update submission
	submissionsGroup.DELETE("/:id") // delete submission

	usersGroup.GET("/")          // get all users with custom roles
	usersGroup.GET("/:email")    // get roles for specific user
	usersGroup.POST("/")         // create role
	usersGroup.PUT("/:email")    // update role
	usersGroup.DELETE("/:email") // delete role

	pipelinesGroup.GET("/")       // get all pipelines
	pipelinesGroup.GET("/:id")    // get pipeline stats
	pipelinesGroup.POST("/")      // create pipeline
	pipelinesGroup.PUT("/:id")    // update pipeline
	pipelinesGroup.DELETE("/:id") // delete pipeline

	dropdownsGroup.GET("/")       // get custom dropdowns
	dropdownsGroup.POST("/")      // create custom dropdown
	dropdownsGroup.PUT("/:id")    // update custom dropdown
	dropdownsGroup.DELETE("/:id") // delete custom dropdown
}
