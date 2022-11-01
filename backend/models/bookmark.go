package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Bookmark struct {
	ID      primitive.ObjectID `bson:"_id" json:"id,omitempty"`
	Created time.Time          `json:"created" bson:"created"`
	Title   string             `json:"title" bson:"title"`
	Tags    []string           `json:"tags" bson:"tags"`
}
