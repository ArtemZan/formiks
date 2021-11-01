package main

import (
	"log"
	"os"

	"github.com/doublegrey/formiks/backend/api"
	"github.com/doublegrey/formiks/backend/driver"
	"github.com/doublegrey/formiks/backend/middlewares"
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
	r := gin.Default()
	middlewares.Setup(r)
	api.RegisterRoutes(r)
}
