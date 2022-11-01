package handlers

import (
	"context"
	"net/http"

	"github.com/doublegrey/formiks/backend/driver"
	"github.com/doublegrey/formiks/backend/models"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func NewTemplateHandler(db *driver.DB) *Template {
	return &Template{
		db: db.Mongo,
	}
}

type Template struct {
	db *mongo.Database
}

func (t *Template) Fetch(c *gin.Context) {
	templates := make([]models.Template, 0)
	cursor, err := t.db.Collection("templates").Find(c.Request.Context(), bson.M{})
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return
	}
	cursor.All(c.Request.Context(), &templates)
	c.JSON(http.StatusOK, templates)
}

func (t *Template) Update(c *gin.Context) {
	name := c.Param("name")
	var template models.Template
	err := c.BindJSON(&template)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	t.db.Collection("templates").ReplaceOne(context.TODO(), bson.M{"name": name}, template, options.Replace().SetUpsert(true))
	c.Status(http.StatusOK)
}
