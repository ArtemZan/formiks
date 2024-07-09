package handlers

import (
	"fmt"
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

func NewDropdownHandler(db *driver.DB) *Dropdown {
	return &Dropdown{
		db: db.Mongo,
	}
}

type Dropdown struct {
	db *mongo.Database
}

// Sync dropdowns content
func (d *Dropdown) Sync(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}
	var dropdown models.Dropdown
	result := d.db.Collection("dropdowns").FindOne(c.Request.Context(), bson.M{"_id": id})
	err = result.Decode(&dropdown)
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}

	c.Status(http.StatusOK)
}

func (d *Dropdown) Fetch(c *gin.Context) {
	var dropdowns []models.Dropdown
	cursor, err := d.db.Collection("dropdowns").Find(c.Request.Context(), bson.M{})
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	cursor.All(c.Request.Context(), &dropdowns)
	c.JSON(http.StatusOK, dropdowns)
}

func (d *Dropdown) FetchByID(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}
	var dropdown models.Dropdown
	result := d.db.Collection("dropdowns").FindOne(c.Request.Context(), bson.M{"_id": id})
	err = result.Decode(&dropdown)
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, dropdown)
}

// Get dropdown values
func (d *Dropdown) Values(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}
	var dropdown models.Dropdown
	result := d.db.Collection("dropdowns").FindOne(c.Request.Context(), bson.M{"_id": id})
	err = result.Decode(&dropdown)
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	// FIXME: handle dropdown.Private
	c.JSON(http.StatusOK, dropdown.Values)
}

func (d *Dropdown) Create(c *gin.Context) {
	var dropdown models.Dropdown
	err := c.BindJSON(&dropdown)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	dropdown.ID = primitive.NewObjectID()
	dropdown.Created = time.Now()
	d.db.Collection("dropdowns").InsertOne(c.Request.Context(), dropdown)
	c.JSON(http.StatusOK, dropdown)
}

func (d *Dropdown) Update(c *gin.Context) {
	var dropdown models.Dropdown
	err := c.BindJSON(&dropdown)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	t, e := d.db.Collection("dropdowns").ReplaceOne(c.Request.Context(), bson.M{"_id": dropdown.ID}, dropdown)
	fmt.Println(t, e)
	c.Status(http.StatusOK)
}

func (d *Dropdown) Delete(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}
	d.db.Collection("dropdowns").DeleteOne(c.Request.Context(), bson.M{"_id": id})
	c.Status(http.StatusOK)
}
