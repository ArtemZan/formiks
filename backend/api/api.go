package api

import (
	"github.com/doublegrey/formiks/backend/api/handlers"
	"github.com/doublegrey/formiks/backend/driver"
	"github.com/doublegrey/formiks/backend/middlewares/msal"
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	projectHandler := handlers.NewProjectHandler(driver.Conn)
	bookmarkHandler := handlers.NewBookmarkHandler(driver.Conn)
	submissionHandler := handlers.NewSubmissionHandler(driver.Conn)
	userHandler := handlers.NewUserHandler(driver.Conn)
	apiGroup := r.Group("api")
	projectsGroup := apiGroup.Group("projects")
	bookmarksGroup := apiGroup.Group("bookmarks")
	submissionsGroup := apiGroup.Group("submissions")
	usersGroup := apiGroup.Group("users")
	pipelinesGroup := apiGroup.Group("pipelines")
	dropdownsGroup := apiGroup.Group("dropdowns")

	projectsGroup.GET("/", projectHandler.Fetch)        // get all projects available to user
	projectsGroup.GET("/:id", projectHandler.FetchByID) // get project
	projectsGroup.POST("/", projectHandler.Create)      // create project
	projectsGroup.PUT("/:id", projectHandler.Update)    // update project
	projectsGroup.DELETE("/:id", projectHandler.Delete) // delete project

	bookmarksGroup.GET("/", bookmarkHandler.Fetch)
	bookmarksGroup.POST("/", msal.Admin(), bookmarkHandler.Create)
	bookmarksGroup.DELETE("/:id", msal.Admin(), bookmarkHandler.Delete)

	submissionsGroup.GET("/", submissionHandler.Fetch)        // get all submissions available to user
	submissionsGroup.GET("/:id", submissionHandler.FetchByID) // get submission
	submissionsGroup.POST("/", submissionHandler.Create)      // create submission
	submissionsGroup.PUT("/:id", submissionHandler.Update)    // update submission
	submissionsGroup.DELETE("/:id", submissionHandler.Delete) // delete submission

	usersGroup.GET("/", userHandler.Fetch)              // get all users with custom roles
	usersGroup.GET("/:email", userHandler.FetchByEmail) // get roles for specific user
	usersGroup.GET("/roles", userHandler.Roles)         // get current user roles
	usersGroup.POST("/", userHandler.Create)            // create role
	usersGroup.PUT("/:id", userHandler.Update)          // update role
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
