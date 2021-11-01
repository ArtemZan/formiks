package driver

import (
	"context"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

type DB struct {
	Mongo *mongo.Database
}

var Conn = &DB{}

func Connect() error {
	clientOptions := options.Client().ApplyURI(os.Getenv("MONGO_URL"))
	client, err := mongo.NewClient(clientOptions)
	if err != nil {
		return err
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()
	err = client.Connect(ctx)
	if err != nil {
		return err
	}

	err = client.Ping(context.Background(), readpref.Primary())
	if err != nil {
		return err
	}
	Conn.Mongo = client.Database(os.Getenv("MONGO_DB"))
	return err
}
