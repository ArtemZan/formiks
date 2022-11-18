package handlers

import (
	"context"
	"net/http"

	"github.com/doublegrey/formiks/backend/driver"
	"github.com/doublegrey/formiks/backend/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func NewViewHandler(db *driver.DB) *View {
	return &View{
		db: db.Mongo,
	}
}

type View struct {
	db *mongo.Database
}

func (v *View) FetchByID(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	var response models.SubmissionWithChildren
	subs := make([]models.Submission, 0)
	cursor, err := v.db.Collection("views").Find(context.TODO(), bson.M{"$or": []bson.M{{"_id": id}, {"parentId": id.Hex()}}})
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	err = cursor.All(context.TODO(), &subs)
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	for _, s := range subs {
		if s.ParentID == nil {
			response.Submission = s
		} else {
			response.Children = append(response.Children, s)
		}
	}

	c.JSON(http.StatusOK, response)
}
