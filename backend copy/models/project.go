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
	ID            primitive.ObjectID `bson:"_id" json:"id,omitempty"`
	Created       time.Time          `json:"created"`
	Updated       time.Time          `json:"updated"`
	Type          string             `json:"type"`
	Title         string             `json:"title"`
	Author        string             `json:"author"`
	Description   string             `json:"description"`
	Statuses      []string           `json:"statuses"`
	DefaultStatus string             `json:"defaultStatus"`
	Tags          []string           `json:"tags"`
	Roles         []string           `json:"roles"`
	Components    *json.RawMessage   `json:"components"`
	Code          string             `json:"code"`
}

type ProjectComponent struct {
	Key    string                  `json:"key"`
	Label  string                  `json:"label"`
	Type   string                  `json:"type"`
	Input  bool                    `json:"input"`
	Values []ProjectComponentValue `json:"values"`
	Data   ProjectComponentData    `json:"data"`
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
