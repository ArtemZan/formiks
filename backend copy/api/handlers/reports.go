package handlers

import (
	"net/http"

	"github.com/doublegrey/formiks/backend/driver"
	"github.com/doublegrey/formiks/backend/logger"
	"github.com/doublegrey/formiks/backend/repositories"
	"github.com/doublegrey/formiks/backend/repositories/report"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func NewReportsHandler(db *driver.DB) *Report {
	return &Report{
		repo: report.NewReportRepo(db.Mongo),
		db:   db.Mongo,
	}
}

type Report struct {
	repo repositories.ReprotRepo
	db   *mongo.Database
}

func (r *Report) FetchPAreport(c *gin.Context) {
	data, err := r.repo.FetchPAreport(c.Request.Context())
	if err != nil {
		logger.LogHandlerError(c, "Failed to fetch submissions", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, data)
}
