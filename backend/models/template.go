package models

type Template struct {
	Name    string           `json:"name"`
	Columns []string         `json:"columns"`
	Filters []map[string]any `json:"filters"`
}
