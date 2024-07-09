package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Dropdown struct {
	ID           primitive.ObjectID       `bson:"_id" json:"id,omitempty"`
	Created      time.Time                `json:"created" bson:"created"`
	Title        string                   `json:"title" bson:"title"`
	Description  string                   `json:"description" bson:"description"`
	Type         string                   `json:"type" bson:"type"` // url, js, sap, salesforce...
	URL          string                   `json:"url" bson:"url"`
	Processor    string                   `json:"processor" bson:"processor"`
	Values       []map[string]interface{} `json:"values" bson:"values"`
	SyncInterval int                      `json:"syncInterval" bson:"syncInterval"`
	LastSync     time.Time                `json:"lastSync"`
	Private      bool                     `json:"private" bson:"private"`
}
