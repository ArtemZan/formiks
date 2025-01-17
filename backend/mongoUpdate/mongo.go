package mongoUpdate

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func Update() {
    // Load .env file
    err := godotenv.Load()
    if err != nil {
        panic("Error loading .env file")
    }

    // Set MongoDB client options
    clientOptions := options.Client().ApplyURI(os.Getenv("MONGO_URL"))

    // Connect to MongoDB
    client, err := mongo.Connect(context.TODO(), clientOptions)
    if err != nil {
        panic(err)
    }

    // Check the connection
    err = client.Ping(context.TODO(), nil)
    if err != nil {
        panic(err)
    }

    fmt.Println("Connected to MongoDB!")

    // Get collection
    collection := client.Database(os.Getenv("MONGO_DB")).Collection("submissions")

    // Get current time at the start of the day
    now := time.Now()
    midnight := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

    // Set filter to match group "communication"
    filter := bson.M{"group": "communication"}

    // Get a cursor for the matched documents
    cursor, err := collection.Find(context.TODO(), filter)
    if err != nil {
        panic(err)
    }
    fmt.Println("Found documents!")

    // Iterate through each document
    for cursor.Next(context.TODO()) {
        var elem struct{
            Data struct{
                StatusLMD string `bson:"statusLMD"`
                InvoicingDateLMD string `bson:"invoicingDateLMD"`
                AlsoMarketingProjectNumberLMD string `bson:"alsoMarketingProjectNumberLMD"`
                SendToLMD string `bson:"sendToLMD"`
            } `bson:"data"`
        }
        err := cursor.Decode(&elem)
        if err != nil {
            panic(err)
        }

        // Parse date string
        if len(elem.Data.InvoicingDateLMD) > 0 {
            var datestring = elem.Data.InvoicingDateLMD
            layout := "2006-01-02T15:04:05.000Z"
            
            t, err := time.Parse(layout, datestring)
            if err != nil {
                fmt.Println("Error:", err)
            }
            fmt.Println("Updating document...")
                fmt.Println(elem.Data.AlsoMarketingProjectNumberLMD, elem.Data.StatusLMD)
            // If date is today or earlier and statusLMD is "FUTURE INVOICE"
			endOfDay := midnight.AddDate(0, 0, 1).Add(-time.Second)
            if t.Before(endOfDay) && elem.Data.StatusLMD == "FUTURE INVOICE"{
                // Update statusLMD to "OK FOR INVOICING"
                id := cursor.Current.Lookup("_id")
                update := bson.D{{Key: "$set", Value: bson.M{"data.statusLMD": "OK FOR INVOICING"}}}
				fmt.Printf("Update Document: %+v id: %v", update, id)
                _, err = collection.UpdateOne(context.TODO(), bson.M{"_id": id}, update)
                if err != nil {
                    panic(err)
                }
            }
        } 
    }

    if err = cursor.Err(); err != nil {
        panic(err)
    }

    cursor.Close(context.TODO())
    fmt.Println("Updates complete!")
}