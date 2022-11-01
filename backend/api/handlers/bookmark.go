package handlers

import (
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

func NewBookmarkHandler(db *driver.DB) *Bookmark {
	return &Bookmark{
		db: db.Mongo,
	}
}

type Bookmark struct {
	db *mongo.Database
}

func (b *Bookmark) Fetch(c *gin.Context) {
	var bookmarks []models.Bookmark
	cursor, err := b.db.Collection("bookmarks").Find(c.Request.Context(), bson.M{})
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	cursor.All(c.Request.Context(), &bookmarks)
	c.JSON(http.StatusOK, bookmarks)
}

func (b *Bookmark) Create(c *gin.Context) {
	var bookmark models.Bookmark
	err := c.BindJSON(&bookmark)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	bookmark.ID = primitive.NewObjectID()
	bookmark.Created = time.Now()
	b.db.Collection("bookmarks").InsertOne(c.Request.Context(), bookmark)
	c.JSON(http.StatusOK, bookmark)
}

func (b *Bookmark) Delete(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}
	b.db.Collection("bookmarks").DeleteOne(c.Request.Context(), bson.M{"_id": id})
	c.Status(http.StatusOK)
}
