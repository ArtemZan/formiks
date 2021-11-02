package handlers

import (
	"net/http"

	"github.com/doublegrey/formiks/backend/driver"
	"github.com/doublegrey/formiks/backend/logger"
	"github.com/doublegrey/formiks/backend/models"
	"github.com/doublegrey/formiks/backend/repositories"
	"github.com/doublegrey/formiks/backend/repositories/project"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func NewProjectHandler(db *driver.DB) *Project {
	return &Project{
		repo: project.NewProjectRepo(db.Mongo),
	}
}

type Project struct {
	repo repositories.ProjectRepo
}

func (r *Project) Fetch(c *gin.Context) {
	projects, err := r.repo.Fetch(c.Request.Context(), nil)
	if err != nil {
		logger.LogHandlerError(c, "Failed to fetch projects", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, projects)
}

func (r *Project) FetchByID(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}
	project, err := r.repo.FetchByID(c.Request.Context(), id)
	if err != nil {
		logger.LogHandlerError(c, "Failed to fetch project", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, project)
}

func (r *Project) Create(c *gin.Context) {
	var project models.Project
	err := c.BindJSON(&project)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}
	project, err = r.repo.Create(c.Request.Context(), project)
	if err != nil {
		logger.LogHandlerError(c, "Failed to create project", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, project)
}

func (r *Project) Update(c *gin.Context) {
	var project models.Project
	err := c.BindJSON(&project)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}
	err = r.repo.Update(c.Request.Context(), project)
	status := http.StatusOK
	if err != nil {
		logger.LogHandlerError(c, "Failed to update project", err)
		status = http.StatusInternalServerError
	}
	c.Status(status)
}

func (r *Project) Delete(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}
	err = r.repo.Delete(c.Request.Context(), id)
	status := http.StatusOK
	if err != nil {
		logger.LogHandlerError(c, "Failed to delete project", err)
		status = http.StatusInternalServerError
	}
	c.Status(status)
}
