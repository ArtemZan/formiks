package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID      primitive.ObjectID `bson:"_id" json:"id,omitempty"`
	Email   string             `json:"email" binding:"required"`
	Created time.Time          `json:"created,omitempty"`
	Roles   []string           `json:"roles" binding:"required"`
}
