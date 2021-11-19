package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Submission struct {
	ID       primitive.ObjectID     `bson:"_id" json:"id,omitempty"`
	Project  string                 `bson:"project" json:"project"`
	ParentID interface{}            `bson:"parentId" json:"parentId"`
	Created  time.Time              `json:"created" bson:"created"`
	Updated  time.Time              `json:"updated" bson:"updated"`
	Title    string                 `json:"title" bson:"title"`
	Status   string                 `json:"status" bson:"status"`
	Author   string                 `json:"author" bson:"author"`
	Data     map[string]interface{} `json:"data" bson:"data"`
}

type SubmissionWithChildrenRequest struct {
	Submission Submission   `json:"submission"`
	Children   []Submission `json:"children"`
}
