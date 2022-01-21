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
	ticker := time.NewTicker(5 * time.Minute)

	go func() {
		sap.FetchAccountLines()
		for range time.NewTicker(time.Hour).C {
			sap.FetchAccountLines()
		}
	}()

	go func() {
		for range time.NewTicker(5 * time.Hour).C {
			// we should clear active directory public key every 5 hours
			msal.PubKey = []byte{}
		}
	}()
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
