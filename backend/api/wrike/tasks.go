package wrike

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"strings"
)

func getTask(id string) (TaskResponse, error) {
	client := &http.Client{}
	req, _ := http.NewRequest(http.MethodGet, fmt.Sprintf("https://www.wrike.com/api/v4/tasks/%s", id), nil)
	req.Header.Set("Authorization", os.Getenv("WRIKE_TOKEN"))
	resp, _ := client.Do(req)
	body, err := ioutil.ReadAll(resp.Body)
	var response TaskResponse
	if err != nil {
		return response, err
	}
	err = json.Unmarshal(body, &response)
	if err != nil {
		return response, err
	}
	if len(response.Data) < 1 {
		return response, errors.New("Response doesn't contain task")
	}
	return response, nil
}

func updateTask(id, description, customFields, importance string, dates ProjectSettings) {
	client := &http.Client{}
	form := url.Values{}
	fmt.Println(customFields)
	form.Add("customFields", customFields)
	form.Add("description", description)
	if len(importance) > 0 {
		form.Add("importance", importance)
	}
	if dates.StartDate != "" || dates.EndDate != "" {
		if dates.StartDate == "" {
			dates.StartDate = dates.EndDate
		}
		if dates.EndDate == "" {
			dates.EndDate = dates.StartDate
		}
		form.Add("dates", fmt.Sprintf(`{"start": "%s", "due": "%s"}`, dates.StartDate, dates.EndDate))
	}
	if len(dates.Owners) > 0 {
		form.Add("addResponsibles", fmt.Sprintf("[%s]", dates.Owners[0]))
	}
	req, _ := http.NewRequest(http.MethodPut, fmt.Sprintf("https://www.wrike.com/api/v4/tasks/%s", id), strings.NewReader(form.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Add("Content-Length", strconv.Itoa(len(form.Encode())))
	req.Header.Set("Authorization", os.Getenv("WRIKE_TOKEN"))
	res, err := client.Do(req)
	if err != nil {
		log.Println(err)
	}
	b, _ := ioutil.ReadAll(res.Body)
	fmt.Println(string(b))
}
