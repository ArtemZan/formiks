package models

type Template struct {
	Name    string                   `bson:"name" json:"name"`
	Columns []string                 `bson:"columns" json:"columns"`
	Filters []map[string]interface{} `bson:"filters" json:"filters"`
}
