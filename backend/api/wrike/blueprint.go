package wrike

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strconv"

	"github.com/doublegrey/formiks/backend/network"
)

func CopyTaskFromBlueprint(title, blueprint, parentFolder string) (string, error) {
	url := "https://www.wrike.com/ui/task_copy?QoS=Load"

	var request struct {
		TargetTaskName              string   `json:"targetTaskName"`
		AsyncKey                    string   `json:"asyncKey"`
		TargetParentFolderID        int      `json:"targetParentFolderId"`
		SourceTaskID                int      `json:"sourceTaskId"`
		CopyNestedTasksWithStatuses []string `json:"copyNestedTasksWithStatuses"`
		KeepTaskDescription         bool     `json:"keepTaskDescription"`
		KeepTaskAttachments         bool     `json:"keepTaskAttachments"`
		KeepTaskAssignees           bool     `json:"keepTaskAssignees"`
		KeepTaskCustomFieldValues   bool     `json:"keepTaskCustomFieldValues"`
		CreateTemplate              bool     `json:"createTemplate"`
		NotifyAssignees             bool     `json:"notifyAssignees"`
	}

	source, err := strconv.Atoi(blueprint)
	if err != nil {
		return "", err
	}
	parent, err := strconv.Atoi(parentFolder)
	if err != nil {
		return "", err
	}

	request.TargetTaskName = title
	request.AsyncKey = "clonefolderRequest_73"
	request.TargetParentFolderID = parent
	request.SourceTaskID = source
	request.CopyNestedTasksWithStatuses = []string{"Active", "Completed", "Deferred", "Cancelled"}
	request.KeepTaskDescription = true
	request.KeepTaskAssignees = true
	request.KeepTaskAttachments = true
	request.CreateTemplate = false
	request.NotifyAssignees = true
	request.KeepTaskCustomFieldValues = true
	payload, err := json.Marshal(request)
	if err != nil {
		return "", err
	}
	// client := &http.Client{}
	client := network.Client
	req, _ := http.NewRequest(http.MethodPost, url, bytes.NewReader(payload))
	req.Header.Add("content-type", "application/json")
	req.Header.Add("x-w-account", "2930721")
	req.Header.Add("Authorization", os.Getenv("WRIKE_TOKEN"))
	res, err := client.Do(req)
	if err != nil {
		log.Println(err)
	}
	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		log.Println(err)
	}
	var response struct {
		Success bool `json:"success"`
		Data    []struct {
			ID int `json:"id"`
		} `json:"data"`
	}
	err = json.Unmarshal(body, &response)
	if err != nil {
		return "", err
	}
	if response.Success {
		conv := convertID(strconv.Itoa(response.Data[0].ID), "ApiV2Task")
		if len(conv.Data) > 0 {
			return conv.Data[0].ID, nil
		}
	}
	return "", errors.New("Failed to get task id")

}

func convertID(id, entityType string) ConverterResponse {
	// client := &http.Client{}
	client := network.Client
	var response ConverterResponse
	req, err := http.NewRequest(http.MethodGet, fmt.Sprintf("https://www.wrike.com/api/v4/ids?ids=[%s]&type=%s", id, entityType), nil)
	if err != nil {
		log.Println("Failed to crete request:", err)
	}
	req.Header.Set("Authorization", os.Getenv("WRIKE_TOKEN"))
	resp, _ := client.Do(req)
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println("Failed to read request body:", err)
	}
	err = json.Unmarshal(body, &response)
	if err != nil {
		log.Println("Failed to unmarshal JSON:", err)
	}
	return response
}
