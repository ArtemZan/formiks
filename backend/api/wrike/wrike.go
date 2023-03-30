package wrike

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func Email(c *gin.Context) {
	body, err := ioutil.ReadAll(c.Request.Body)
	if err != nil {
		log.Printf("Failed to read request body: %v", err)
		c.Status(http.StatusBadRequest)
		return
	}

	taskID, err := CopyTaskFromBlueprint(fmt.Sprintf("Release Request (%s)", time.Now().Format("2006-01-02")), "643959518", "531480013")
	if err != nil {
		log.Println(err)
	}

	if len(taskID) > 0 {
		task, err := getTask(taskID)
		if err != nil {
			log.Println(err)
		}
		description := fmt.Sprintf("%s\n%s", task.Data[0].Description, string(body))
		updateTask(taskID, description, "", "Normal", ProjectSettings{})
	}
}
