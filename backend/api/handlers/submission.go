package handlers

import (
	"context"
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
	response, err := r.repo.FetchByIDWithChildren(context.Background(), id)
	if err != nil {
		logger.LogHandlerError(c, "Failed to fetch submissions", err)
		c.Status(http.StatusInternalServerError)
		return
	}

	c.JSON(http.StatusOK, response)
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
	err := c.BindJSON(&submissionWithChildren)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}

	var hasChanged bool

	parentProjectNumber, exists := submissionWithChildren.Submission.Data["projectNumber"].(string)
	if !exists {
		c.Status(http.StatusBadRequest)
		return
	}

	childrenProjectNumbers := []string{}

	for _, child := range submissionWithChildren.Children {
		if child.Group == "country" {
			if submissionWithChildren.Local != nil && child.Data["companyCode"] == *submissionWithChildren.Local {
				if pn, exists := child.Data["projectNumber"].(string); exists {
					childrenProjectNumbers = append(childrenProjectNumbers, pn)
				} else {
					c.Status(http.StatusBadRequest)
					return
				}
			} else {
				if pn, exists := child.Data["localProjectNumber"].(string); exists {
					childrenProjectNumbers = append(childrenProjectNumbers, pn)
				} else {
					c.Status(http.StatusBadRequest)
					return
				}
			}
		}
	}

	for {
		pns := make([]string, 0, 1+len(childrenProjectNumbers))
		pns = append(pns, parentProjectNumber)
		pns = append(pns, childrenProjectNumbers...)
		if r.repo.ExistsAny(context.Background(), pns) {
			suffix := parentProjectNumber[len(parentProjectNumber)-2:]
			iSuffix, err := strconv.Atoi(suffix)
			if err != nil || iSuffix > 99 {
				c.Status(http.StatusBadRequest)
				return
			}
			iSuffix++
			parentProjectNumber = fmt.Sprintf("%s%02d", parentProjectNumber[:len(parentProjectNumber)-2], iSuffix)
			for i, cpn := range childrenProjectNumbers {
				childrenProjectNumbers[i] = fmt.Sprintf("%s%02d", cpn[:len(cpn)-2], iSuffix)
			}
			hasChanged = true
		} else {
			submissionWithChildren.Submission.Data["projectNumber"] = parentProjectNumber
			var lpi int
			for i := range submissionWithChildren.Children {

				submissionWithChildren.Children[i].Data["projectNumber"] = parentProjectNumber
				if submissionWithChildren.Children[i].Group == "country" {
					submissionWithChildren.Children[i].Data["localProjectNumber"] = childrenProjectNumbers[lpi]
					lpi++
				}

			}
			break
		}
	}

	views, err := r.repo.CreateViews(context.TODO(), submissionWithChildren)
	fmt.Println(submissionWithChildren)

	if submissionWithChildren.Local != nil {
		var targetSubmission models.Submission

		for _, child := range submissionWithChildren.Children {
			if child.Group == "country" && child.Data["companyCode"] == *submissionWithChildren.Local {
				targetSubmission = child
				targetSubmission.Data["projectNumber"] = child.Data["localProjectNumber"]
				targetSubmission.Data["localProjectNumber"] = ""
			}
		}
		targetSubmission.ID = primitive.NewObjectID()
		targetSubmission.ViewID = views.Submission.ID.Hex()
		targetSubmission.ParentID = nil
		targetSubmission.Created = time.Now()
		targetSubmission.Updated = time.Now()
		targetSubmission.Project = submissionWithChildren.Submission.Project

		r.repo.Create(context.TODO(), targetSubmission)

		c.JSON(http.StatusOK, models.SubmissionWithChildrenResponse{
			Submission: targetSubmission,
			HasChanged: hasChanged,
		})
	} else {
		submissionWithChildren.Submission.ID = primitive.NewObjectID()
		submissionWithChildren.Submission.Created = time.Now()
		submissionWithChildren.Submission.Updated = time.Now()
		submissionWithChildren.Submission.ParentID = nil
		submissionWithChildren.Submission.ViewID = views.Submission.ID.Hex()

		for index := range submissionWithChildren.Children {
			submissionWithChildren.Children[index].ID = primitive.NewObjectID()
			if _, ok := submissionWithChildren.Children[index].ParentID.(string); ok {
				submissionWithChildren.Children[index].ParentID = submissionWithChildren.Submission.ID.Hex()
			}
			submissionWithChildren.Children[index].ViewID = views.Children[index].ID.Hex()
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
			HasChanged: hasChanged,
		})
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

	r.repo.PartialUpdate(context.Background(), bson.M{"_id": request.Submission}, bson.D{{Key: "$set", Value: bson.D{{Key: request.Path, Value: request.Value}, {Key: "updated", Value: time.Now()}}}})
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
	c.JSON(200, sap.ZsdMdfOrder(submission))
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
