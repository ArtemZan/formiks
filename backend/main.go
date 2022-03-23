package main

import (
	"fmt"
	"log"
	"os"
	"path"
	"path/filepath"
	"time"

	"github.com/doublegrey/formiks/backend/api"
	"github.com/doublegrey/formiks/backend/driver"
	"github.com/doublegrey/formiks/backend/dropdowns"
	"github.com/doublegrey/formiks/backend/middlewares"
	"github.com/doublegrey/formiks/backend/middlewares/msal"
	"github.com/doublegrey/formiks/backend/sap"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if len(os.Getenv("DEV")) > 0 {
		err := godotenv.Load()
		if err != nil {
			log.Fatalf("Failed to read .env file: %v\n", err)
		}
	}
	err := driver.Connect()
	if err != nil {
		log.Fatalf("Failed to initialize database connection: %v\n", err)
	}

	// var documents []models.Submission
	// docs, _ := driver.Conn.Mongo.Collection("submissions").Find(context.TODO(), bson.M{"data.costAccount": "0050501000"})

	// docs.All(context.TODO(), &documents)

	// var sum float64
	// for _, doc := range documents {
	// 	sum += doc.Data["costAmountLC"].(float64)
	// }
	// fmt.Println(sum)
	// os.Exit(0)

	ticker := time.NewTicker(1 * time.Hour)

	go func() {
		sap.FetchAccountLines()
		// fmt.Println("account lines parsed...")
		// sap.CreateSubmissionsForAccountLines()
		// os.Exit(0)
		for range time.NewTicker(time.Hour * 5).C {
			sap.FetchAccountLines()
		}
	}()

	go func() {
		for range time.NewTicker(5 * time.Hour).C {
			// we should clear active directory public key every 5 hours
			msal.PubKey = []byte{}
		}
	}()

	go dropdowns.SyncAll()
	go func() {
		for {
			<-ticker.C
			dropdowns.SyncAll()
		}
	}()
	r := gin.Default()
	middlewares.Setup(r)
	api.RegisterRoutes(r)

	r.Use(static.Serve("/", static.LocalFile("../frontend/build", true)))
	r.NoRoute(func(c *gin.Context) {
		dir, file := path.Split(c.Request.RequestURI)
		ext := filepath.Ext(file)
		if file == "" || ext == "" {
			c.File("../frontend/build")
		} else {
			c.File("../frontend/build" + path.Join(dir, file))
		}

	})

	r.Run(fmt.Sprintf(":%s", os.Getenv("PORT")))
}
