package sap

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"

	"github.com/doublegrey/formiks/backend/models"
)

func ZsdMdfOrder(submission models.Submission) (int, string) {
	var r FRequest
	r.Request.FUNCTION = "ZSD_MDF_INT_ORDER"
	r.Request.IM_ORDER = fmt.Sprintf("%v", submission.Data["projectNumber"])
	r.Request.IM_ORDER_TYPE = "ZMCH"
	r.Request.IM_ORDER_NAME = fmt.Sprintf("%v", submission.Data["campaignName"])
	r.Request.IM_COMP_CODE = fmt.Sprintf("%v", submission.Data["companyCode"])
	r.Request.IM_PERSON_RESP = fmt.Sprintf("%v", submission.Data["budgetApprovedByVendor"])
	r.Request.IM_CURRENCY = fmt.Sprintf("%v", submission.Data["campaignBudgetsCurrency"])
	r.Request.IM_CO_AREA = "A002"

	bs, _ := json.Marshal(r)
	fmt.Println(string(bs))
	client := &http.Client{}
	req, _ := http.NewRequest(http.MethodPost, "https://b2b-test.also.com/rad/ActWebServices.Wrike:api/receive", bytes.NewReader(bs))
	req.SetBasicAuth("WRIKE", "mMvnfh67#hhz")
	req.Header.Add("Content-Type", "application/json")
	res, _ := client.Do(req)
	b, _ := ioutil.ReadAll(res.Body)
	fmt.Println(string(b))
	comment := "No response from SAP"
	var response struct {
		FileName string `json:"fileName"`
		String   string `json:"string"`
		Header   struct {
			Lines struct {
				Message       string `json:"Message"`
				ContentType   string `json:"Content-Type"`
				Date          string `json:"Date"`
				ContentLength string `json:"Content-Length"`
			} `json:"lines"`
			Status        string `json:"status"`
			StatusMessage string `json:"statusMessage"`
		} `json:"header"`
		Body struct {
			Bytes string `json:"bytes"`
		} `json:"body"`
	}
	json.Unmarshal(b, &response)
	fmt.Println(response.Header.Lines.Message)
	if len(response.Header.Lines.Message) > 0 {
		comment = response.Header.Lines.Message
	}
	statusCode, _ := strconv.Atoi(response.Header.Status)
	if statusCode < 200 {
		statusCode = 200
	}
	return statusCode, comment
}
