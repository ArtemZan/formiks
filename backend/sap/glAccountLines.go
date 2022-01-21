package sap

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strings"
	"time"
)

var AccountLines = make(map[string][]AccountLineRecord)

func FetchAccountLines() error {
	payload := strings.NewReader(`{
    "GetGLAccountLines": {
        "areaKey": "MKT",
        "year": "2021",
        "bukrs": "2000"
    }
	}`)

	client := &http.Client{Timeout: time.Minute * 2}
	req, err := http.NewRequest(http.MethodPost, "https://b2b-test.also.com/rad/ActWebServices.Wrike:api/getGLAccountLines", payload)

	if err != nil {
		return err
	}
	req.Header.Add("Authorization", "Basic V1JJS0U6bU12bmZoNjcjaGh6")
	req.Header.Add("Content-Type", "application/json")

	res, err := client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		return err
	}

	var response AccountLinesResponse

	err = json.Unmarshal(body, &response)
	if err != nil {
		return err
	}
	if len(response.GetGLAccountLinesOutput.Rs) > 0 {
		AccountLines = make(map[string][]AccountLineRecord)

		for _, record := range response.GetGLAccountLinesOutput.Rs {
			AccountLines[record.ProjectNumber] = append(AccountLines[record.ProjectNumber], record)
		}
	}
	return nil
}
