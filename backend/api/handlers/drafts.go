package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/doublegrey/formiks/backend/driver"
	"github.com/doublegrey/formiks/backend/logger"
	"github.com/doublegrey/formiks/backend/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func NewDraftHandler(db *driver.DB) *Draft {
	return &Draft{
		db: db.Mongo,
	}
}

type Draft struct {
	db *mongo.Database
}

func (d *Draft) Fetch(c *gin.Context) {
	drafts := make([]models.Submission, 0)
	cursor, err := d.db.Collection("drafts").Find(c.Request.Context(), bson.M{"parentId": nil})
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	cursor.All(c.Request.Context(), &drafts)
	c.JSON(http.StatusOK, drafts)
}

func (d *Draft) FetchByID(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}
	var parent models.Submission
	result := d.db.Collection("drafts").FindOne(c.Request.Context(), bson.M{"_id": id})
	err = result.Decode(&parent)
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	cursor, err := d.db.Collection("drafts").Find(c.Request.Context(), bson.M{"parentId": id.Hex()})
	if err != nil {
		logger.LogHandlerError(c, "Failed to fetch draft children", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	var children []models.Submission
	cursor.All(c.Request.Context(), &children)
	c.JSON(http.StatusOK, models.SubmissionWithChildren{Submission: parent, Children: children})
}

func (d *Draft) Create(c *gin.Context) {
	var submissionWithChildren models.SubmissionWithChildren
	err := c.BindJSON(&submissionWithChildren)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}

	submissionWithChildren.Submission.ID = primitive.NewObjectID()
	submissionWithChildren.Submission.Created = time.Now()

	c.JSON(http.StatusOK, create(d, submissionWithChildren))
}
func create(d *Draft, submissionWithChildren models.SubmissionWithChildren) models.Submission {
	submissionWithChildren.Submission.Updated = time.Now()
	submissionWithChildren.Submission.ParentID = nil

	for index := range submissionWithChildren.Children {
		submissionWithChildren.Children[index].ID = primitive.NewObjectID()
		if _, ok := submissionWithChildren.Children[index].ParentID.(string); ok {
			submissionWithChildren.Children[index].ParentID = submissionWithChildren.Submission.ID.Hex()
		}
		submissionWithChildren.Children[index].Created = time.Now()
		submissionWithChildren.Children[index].Updated = time.Now()
		submissionWithChildren.Children[index].Project = submissionWithChildren.Submission.Project

	}
	d.db.Collection("drafts").InsertOne(context.TODO(), submissionWithChildren.Submission)

	for _, child := range submissionWithChildren.Children {
		d.db.Collection("drafts").InsertOne(context.TODO(), child)
	}
	return submissionWithChildren.Submission
}

func (d *Draft) Update(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}

	var draft models.SubmissionWithChildren
	err = c.BindJSON(&draft)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	d.db.Collection("drafts").DeleteOne(context.TODO(), bson.M{"_id": id})
	d.db.Collection("drafts").DeleteMany(context.TODO(), bson.M{"parentId": id.Hex()})

	draft.Submission.ID = id
	for _, child := range draft.Children {
		child.ParentID = id.Hex()
	}

	create(d, draft)

	c.Status(http.StatusOK)
}

func (d *Draft) Delete(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}
	d.db.Collection("drafts").DeleteOne(context.TODO(), bson.M{"_id": id})
	d.db.Collection("drafts").DeleteMany(context.TODO(), bson.M{"parentId": id})
	c.Status(http.StatusOK)
}
