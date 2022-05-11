package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"github.com/doublegrey/formiks/backend/driver"
	"github.com/doublegrey/formiks/backend/logger"
	"github.com/doublegrey/formiks/backend/models"
	"github.com/doublegrey/formiks/backend/repositories"
	"github.com/doublegrey/formiks/backend/repositories/submission"
	"github.com/doublegrey/formiks/backend/sap"
)

func NewSubmissionHandler(db *driver.DB) *Submission {
	return &Submission{
		repo: submission.NewSubmissionRepo(db.Mongo),
		db:   db.Mongo,
	}
}

type Submission struct {
	repo repositories.SubmissionRepo
	db   *mongo.Database
}

func (r *Submission) FetchVendorTablePresets(c *gin.Context) {
	response, _ := r.repo.FetchVendorTablePresets(context.TODO())
	c.JSON(http.StatusOK, response)
}
func (r *Submission) UpsertVendorTablePreset(c *gin.Context) {
	var data models.VendorTablePreset
	err := c.BindJSON(&data)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}
	err = r.repo.UpsertVendorTablePreset(c.Request.Context(), data)
	status := http.StatusOK
	if err != nil {
		logger.LogHandlerError(c, "Failed to update vendor table", err)
		status = http.StatusInternalServerError
	}
	c.Status(status)
}

func (r *Submission) Fetch(c *gin.Context) {
	filter := bson.M{}
	if len(c.Query("project")) > 0 {
		filter = bson.M{"project": c.Query("project")}
	}
	submissions, err := r.repo.Fetch(c.Request.Context(), filter)
	if err != nil {
		logger.LogHandlerError(c, "Failed to fetch submissions", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, submissions)
}

func (r *Submission) FetchByID(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}
	submission, err := r.repo.FetchByID(c.Request.Context(), id)
	if err != nil {
		logger.LogHandlerError(c, "Failed to fetch submission", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, submission)
}

func (r *Submission) Create(c *gin.Context) {
	email, emailExists := c.Get("Email")
	if !emailExists {
		c.Status(http.StatusForbidden)
		return
	}
	var submission models.Submission
	err := c.BindJSON(&submission)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}
	submission.ID = primitive.NewObjectID()
	submission.Created = time.Now()
	submission.Updated = time.Now()
	submission.Author = email.(string)
	submission.Data["status"] = "New"
	submission, err = r.repo.Create(c.Request.Context(), submission)
	if err != nil {
		logger.LogHandlerError(c, "Failed to create submission", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, submission)
}

func (r *Submission) CreateWithChildren(c *gin.Context) {
	email, emailExists := c.Get("Email")
	if !emailExists {
		c.Status(http.StatusForbidden)
		return
	}
	var submissionWithChildren models.SubmissionWithChildrenRequest
	err := c.BindJSON(&submissionWithChildren)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}
	submissionWithChildren.Submission.ID = primitive.NewObjectID()
	submissionWithChildren.Submission.Created = time.Now()
	submissionWithChildren.Submission.Updated = time.Now()
	submissionWithChildren.Submission.Author = email.(string)
	submissionWithChildren.Submission.ParentID = nil
	submissionWithChildren.Submission.Data["status"] = "New"
	for index := range submissionWithChildren.Children {
		submissionWithChildren.Children[index].ID = primitive.NewObjectID()
		submissionWithChildren.Children[index].ParentID = submissionWithChildren.Submission.ID.Hex()
		submissionWithChildren.Children[index].Created = time.Now()
		submissionWithChildren.Children[index].Updated = time.Now()
		submissionWithChildren.Children[index].Project = submissionWithChildren.Submission.Project
		submissionWithChildren.Children[index].Data["status"] = "New"
	}
	children := sap.GetAccountLinesChildren(submissionWithChildren.Submission.ID.Hex(), submissionWithChildren.Submission.Project, submissionWithChildren.Submission.Data["projectNumber"].(string), []models.Submission{})
	submissionWithChildren.Children = append(submissionWithChildren.Children, children...)

	r.repo.Create(c.Request.Context(), submissionWithChildren.Submission)
	for _, child := range submissionWithChildren.Children {
		r.repo.Create(c.Request.Context(), child)
	}
	c.JSON(http.StatusOK, submissionWithChildren.Submission)
}

func (r *Submission) Update(c *gin.Context) {
	var submission models.Submission
	err := c.BindJSON(&submission)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}
	err = r.repo.Update(c.Request.Context(), submission)
	status := http.StatusOK
	if err != nil {
		logger.LogHandlerError(c, "Failed to update submission", err)
		status = http.StatusInternalServerError
	}
	c.Status(status)
}
func (r *Submission) PartialUpdate(c *gin.Context) {
	var request models.PartialUpdateRequest
	err := c.BindJSON(&request)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}
	r.db.Collection("submissions").UpdateOne(context.TODO(), bson.M{"_id": request.Submission}, bson.D{{Key: "$set", Value: bson.D{{Key: request.Path, Value: request.Value}, {Key: "updated", Value: time.Now()}}}})
}

func (r *Submission) CallSap(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}
	submission, err := r.repo.FetchByID(c.Request.Context(), id)
	if err != nil {
		logger.LogHandlerError(c, "Failed to fetch submission", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.String(sap.ZsdMdfOrder(submission))

}

func (r *Submission) Delete(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}
	err = r.repo.Delete(c.Request.Context(), id, true)
	status := http.StatusOK
	if err != nil {
		logger.LogHandlerError(c, "Failed to delete submission", err)
		status = http.StatusInternalServerError
	}
	c.Status(status)
}
