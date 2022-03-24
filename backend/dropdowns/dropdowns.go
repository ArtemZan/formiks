package dropdowns

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"rogchap.com/v8go"

	"github.com/doublegrey/formiks/backend/driver"
	"github.com/doublegrey/formiks/backend/jengine"
	"github.com/doublegrey/formiks/backend/models"
	"github.com/doublegrey/formiks/backend/utils"
)

func SyncAll() error {
	isolate, err := jengine.CreateIsolate()
	if err != nil {
		return err
	}
	var dropdowns []models.Dropdown

	// FIXME: find all where type != json
	cursor, err := driver.Conn.Mongo.Collection("dropdowns").Find(context.TODO(), bson.M{})
	if err != nil {
		return err
	}
	err = cursor.All(context.TODO(), &dropdowns)
	if err != nil {
		return err
	}
	for _, dropdown := range dropdowns {
		if strings.ToUpper(dropdown.Type) != "JSON" && time.Now().After(dropdown.LastSync.Add(time.Minute*time.Duration(dropdown.SyncInterval))) {
			go SyncDropdown(isolate, dropdown)
		}
	}
	return nil
}

func SyncDropdown(isolate *v8go.Isolate, dropdown models.Dropdown) {
	if strings.ToUpper(dropdown.Type) == "JSON" {
		return
	}
	if isolate == nil {
		isolate, _ = jengine.CreateIsolate()
	}
	switch strings.ToUpper(dropdown.Type) {
	case "JS":
		jctx, err := jengine.CreateContext(isolate)
		if err != nil {
			return
		}
		dropdown, err = SyncJS(jctx, dropdown)
		if err != nil {
			return
		}
	}
	dropdown.LastSync = time.Now()
	driver.Conn.Mongo.Collection("dropdowns").ReplaceOne(context.TODO(), bson.M{"_id": dropdown.ID}, dropdown)
}

func SyncURL(dropdown models.Dropdown) (models.Dropdown, error) {
	return models.Dropdown{}, nil
}

func SyncJS(ctx *v8go.Context, sourceDropdown models.Dropdown) (models.Dropdown, error) {
	dropdown := sourceDropdown
	v, err := jengine.RunScript(ctx, sourceDropdown.Processor, fmt.Sprintf("%s.js", sourceDropdown.Title))
	if err != nil {
		return dropdown, err
	}
	b, err := v.MarshalJSON()
	if err != nil {
		return dropdown, err
	}
	err = json.Unmarshal(b, &dropdown.Values)
	return dropdown, err
}

func FetchExchangeRates(ctx context.Context) map[string]float64 {
	var dropdown models.Dropdown
	exchangeRates := make(map[string]float64)
	driver.Conn.Mongo.Collection("dropdowns").FindOne(ctx, bson.M{"title": "Exchange Rates"}).Decode(&dropdown)
	for _, record := range dropdown.Values {
		exchangeRates[record["label"].(string)] = utils.String2float(record["value"].(string), false)
	}
	return exchangeRates
}
