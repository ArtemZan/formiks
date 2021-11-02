package api

import (
	"github.com/doublegrey/formiks/backend/api/handlers"
	"github.com/doublegrey/formiks/backend/driver"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	projectHandler := handlers.NewProjectHandler(driver.Conn)
	userHandler := handlers.NewUserHandler(driver.Conn)
	apiGroup := r.Group("api")
	projectsGroup := apiGroup.Group("projects")
	submissionsGroup := apiGroup.Group("submissions")
	usersGroup := apiGroup.Group("users")
	pipelinesGroup := apiGroup.Group("pipelines")
	dropdownsGroup := apiGroup.Group("dropdowns")

	projectsGroup.GET("/", projectHandler.Fetch)        // get all projects available to user
	projectsGroup.GET("/:id", projectHandler.FetchByID) // get project
	projectsGroup.POST("/", projectHandler.Create)      // create project
	projectsGroup.PUT("/", projectHandler.Update)       // update project
	projectsGroup.DELETE("/:id", projectHandler.Delete) // delete project

	submissionsGroup.GET("/")       // get all submissions available to user
	submissionsGroup.GET("/:id")    // get submission
	submissionsGroup.POST("/")      // create submission
	submissionsGroup.PUT("/")       // update submission
	submissionsGroup.DELETE("/:id") // delete submission

	usersGroup.GET("/", userHandler.Fetch)              // get all users with custom roles
	usersGroup.GET("/:email", userHandler.FetchByEmail) // get roles for specific user
	usersGroup.GET("/roles", userHandler.Roles)         // get current user roles
	usersGroup.POST("/", userHandler.Create)            // create role
	usersGroup.PUT("/", userHandler.Update)             // update role
	usersGroup.DELETE("/:email", userHandler.Delete)    // delete role

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
