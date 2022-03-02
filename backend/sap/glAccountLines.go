package sap

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strings"
	"time"
)

var AccountLines = make(map[string][]AccountLineRecord)
var accounts = []string{"0050501000", "0050501200", "0050501300", "0055900200", "0055904100", "0055922300", "0050700400", "0050600000", "0050610100", "0050700000", "0050600030", "0050600100", "0050900300", "0050900400", "0050900600", "0050900500", "0050900510", "0050600010", "0050700600", "0050600020", "0050600700", "0050500300", "0050849000", "0050800160", "0056490110", "0050850200", "0050850000", "0050850100", "0050650020", "0050551000", "0050650030", "0082204100", "0082200000", "0082216000", "0082230000", "0082246000", "0082230088", "0050500310", "0050500000", "0050550000", "0050551010", "0050660000", "0055902100", "0055902110", "0055902300", "0055902310", "0055904010", "0055920000", "0055920010", "0050610000", "0050650010", "0050650200", "0050650000", "0050650100", "0050700100", "0050700200", "0050750100", "0050700010", "0050700020", "0050750000", "0050600300", "0050650300", "0050900100", "0050900200", "0050900000", "0050900098", "0050900700", "0050900800", "0050950000", "0050950300", "0050950400", "0050660100", "0050600800", "0050800000", "0050800170", "0050900900", "0051009900", "0050500098", "0082204000", "0082270000", "0082200010", "0082200020", "0082200022", "0082216020", "0082274000", "0082286000", "0082234000", "0082200098", "0082230098"}

func FetchAccountLines() error {
	payload := strings.NewReader(`{
    "GetGLAccountLines": {
        "areaKey": "MKT",
        "year": "2021",
        "bukrs": "6110"
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
			if isValid(record.Account) {
				AccountLines[record.ProjectNumber] = append(AccountLines[record.ProjectNumber], record)
			}
		}
	}
	// for k, v := range AccountLines {
	// 	fmt.Printf("%s: %d\n", k, len(v))
	// }
	return nil
}

func isValid(account string) bool {
	for _, v := range accounts {
		if v == account {
			return true
		}
	}
	return false
}
