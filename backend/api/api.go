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
	dropdownHandler := handlers.NewDropdownHandler(driver.Conn)
	submissionHandler := handlers.NewSubmissionHandler(driver.Conn)
	userHandler := handlers.NewUserHandler(driver.Conn)
	apiGroup := r.Group("api")
	projectsGroup := apiGroup.Group("projects")
	bookmarksGroup := apiGroup.Group("bookmarks")
	dropdownsGroup := apiGroup.Group("dropdowns")
	submissionsGroup := apiGroup.Group("submissions")
	usersGroup := apiGroup.Group("users")
	pipelinesGroup := apiGroup.Group("pipelines")

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
	submissionsGroup.GET("/:id/sap", submissionHandler.CallSap)
	submissionsGroup.POST("/", submissionHandler.Create)                     // create submission
	submissionsGroup.POST("/children", submissionHandler.CreateWithChildren) // create submission with children
	submissionsGroup.POST("/partial", submissionHandler.PartialUpdate)       // update specific submission's field
	submissionsGroup.PUT("/:id", submissionHandler.Update)                   // update submission
	submissionsGroup.DELETE("/:id", submissionHandler.Delete)                // delete submission

	submissionsGroup.GET("/vendorTable/presets", submissionHandler.FetchVendorTablePresets)
	submissionsGroup.PUT("/vendorTable/presets/:id", submissionHandler.UpsertVendorTablePreset)

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

	dropdownsGroup.GET("/", dropdownHandler.Fetch)                      // get custom dropdowns
	dropdownsGroup.GET("/sync/:id", dropdownHandler.Sync)               // sync custom dropdown
	dropdownsGroup.GET("/:id", dropdownHandler.FetchByID)               // get custom dropdown
	dropdownsGroup.GET("/:id/values", dropdownHandler.Values)           // get custom dropdown values
	dropdownsGroup.POST("/", msal.Admin(), dropdownHandler.Create)      // create custom dropdown
	dropdownsGroup.PUT("/:id", msal.Admin(), dropdownHandler.Update)    // update custom dropdown
	dropdownsGroup.DELETE("/:id", msal.Admin(), dropdownHandler.Delete) // delete custom dropdown
}
