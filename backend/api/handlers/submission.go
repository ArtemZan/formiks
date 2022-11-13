package handlers

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"strconv"
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

func (r *Submission) FetchByIDWithChildren(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}
	parent, err := r.repo.FetchByID(c.Request.Context(), id)
	if err != nil {
		logger.LogHandlerError(c, "Failed to fetch submission", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	cursor, err := r.db.Collection("submissions").Find(c.Request.Context(), bson.M{"parentId": id.Hex()})
	if err != nil {
		logger.LogHandlerError(c, "Failed to fetch submission children", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	var children []models.Submission
	cursor.All(c.Request.Context(), &children)
	c.JSON(http.StatusOK, models.SubmissionWithChildren{Submission: parent, Children: children})
}

func (r *Submission) Create(c *gin.Context) {
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
	submission, err = r.repo.Create(c.Request.Context(), submission)
	if err != nil {
		logger.LogHandlerError(c, "Failed to create submission", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, submission)
}

func (r *Submission) CreateWithChildren(c *gin.Context) {
	var submissionWithChildren models.SubmissionWithChildren
	projectNumberChanges := make([]models.ProjectNumberChange, 0)
	err := c.BindJSON(&submissionWithChildren)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}
	if pn, exists := submissionWithChildren.Submission.Data["projectNumber"].(string); exists {
		var changed bool
		submissionWithChildren.Submission.Data["projectNumber"], changed, err = r.generateUniqueProjectNumber(pn)
		if err != nil {
			c.Status(http.StatusInternalServerError)
			return
		}
		if changed {
			projectNumberChanges = append(projectNumberChanges, models.ProjectNumberChange{
				Original:  pn,
				Generated: submissionWithChildren.Submission.Data["projectNumber"].(string),
				Child:     false,
			})
		}
	}

	submissionWithChildren.Submission.ID = primitive.NewObjectID()
	submissionWithChildren.Submission.Created = time.Now()
	submissionWithChildren.Submission.Updated = time.Now()
	submissionWithChildren.Submission.ParentID = nil
	submissionWithChildren.Submission.Data["status"] = "New"
	for index := range submissionWithChildren.Children {
		if _, exists := submissionWithChildren.Children[index].Data["companyCode"].(string); !exists {
			c.Status(http.StatusBadRequest)
			return
		}
		if _, exists := submissionWithChildren.Children[index].Data["projectNumber"].(string); !exists {
			c.Status(http.StatusBadRequest)
			return
		}

		pn := fmt.Sprintf("%s%s", submissionWithChildren.Children[index].Data["companyCode"].(string), submissionWithChildren.Children[index].Data["projectNumber"].(string)[4:])

		var changed bool
		submissionWithChildren.Children[index].Data["projectNumber"], changed, err = r.generateUniqueProjectNumber(pn)
		if err != nil {
			c.Status(http.StatusInternalServerError)
			return
		}
		if changed {
			projectNumberChanges = append(projectNumberChanges, models.ProjectNumberChange{
				Original:  pn,
				Generated: submissionWithChildren.Children[index].Data["projectNumber"].(string),
				Child:     true,
			})
		}

		submissionWithChildren.Children[index].ID = primitive.NewObjectID()
		if _, ok := submissionWithChildren.Children[index].ParentID.(string); ok {
			submissionWithChildren.Children[index].ParentID = submissionWithChildren.Submission.ID.Hex()
			submissionWithChildren.Children[index].Data["status"] = "New"
		}
		submissionWithChildren.Children[index].Created = time.Now()
		submissionWithChildren.Children[index].Updated = time.Now()
		submissionWithChildren.Children[index].Project = submissionWithChildren.Submission.Project
	}

	for _, child := range submissionWithChildren.Children {
		r.repo.Create(context.TODO(), child)
	}

	r.repo.Create(context.TODO(), submissionWithChildren.Submission)

	c.JSON(http.StatusOK, models.SubmissionWithChildrenResponse{
		Submission: submissionWithChildren.Submission,
		Children:   submissionWithChildren.Children,
		Changes:    projectNumberChanges,
	})
}

func (r *Submission) generateUniqueProjectNumber(pn string) (string, bool, error) {
	var changed bool
	for {
		if r.repo.Exists(context.TODO(), bson.M{"data.projectNumber": pn}) {
			changed = true
			suffix := pn[len(pn)-2:]
			iSuffix, err := strconv.Atoi(suffix)
			if err != nil {
				return pn, changed, err
			}
			if iSuffix > 99 {
				return pn, changed, errors.New("suffix out of range")
			}
			pn = fmt.Sprintf("%s%02d", pn[:len(pn)-2], iSuffix+1)
		} else {
			return pn, changed, nil
		}
	}
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
