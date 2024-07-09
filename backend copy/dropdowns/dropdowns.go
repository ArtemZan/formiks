package dropdowns

import (
	"context"

	"go.mongodb.org/mongo-driver/bson"

	"github.com/doublegrey/formiks/backend/driver"
	"github.com/doublegrey/formiks/backend/models"
	"github.com/doublegrey/formiks/backend/utils"
)

func FetchExchangeRates(ctx context.Context) map[string]float64 {
	var dropdown models.Dropdown
	exchangeRates := make(map[string]float64)
	driver.Conn.Mongo.Collection("dropdowns").FindOne(ctx, bson.M{"title": "Exchange Rates"}).Decode(&dropdown)
	for _, record := range dropdown.Values {
		exchangeRates[record["label"].(string)] = utils.String2float(record["value"].(string), false)
	}
	return exchangeRates
}
