package models

import (
	"encoding/json"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ProjectFetchFilter struct {
	Tags  []string
	Roles []string
}

type Project struct {
	ID          primitive.ObjectID `bson:"_id" json:"id,omitempty"`
	Created     time.Time          `json:"created,omitempty"`
	Updated     time.Time          `json:"updated,omitempty"`
	Title       string             `json:"title" binding:"required"`
	Author      string             `json:"author,omitempty"`
	Description string             `json:"description,omitempty"`
	Tags        []string           `json:"tags,omitempty"`
	Roles       []string           `json:"roles"`
	Components  *json.RawMessage   `json:"components" binding:"required"`
}

type ProjectComponent struct {
	Key    string                  `json:"key"`
	Label  string                  `json:"label"`
	Type   string                  `json:"type"`
	Input  bool                    `json:"input,omitempty"`
	Values []ProjectComponentValue `json:"values,omitempty"`
	Data   ProjectComponentData    `json:"data,omitempty"`
}

type ProjectComponentData struct {
	URL      string                  `json:"url"`
	Values   []ProjectComponentValue `json:"values"`
	Resource string                  `json:"resource"`
	JSON     string                  `json:"json"`
	Custom   string                  `json:"custom"`
}

type ProjectComponentValue struct {
	Label string `json:"label"`
	Value string `json:"value"`
}
