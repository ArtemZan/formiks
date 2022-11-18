package sap

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/doublegrey/formiks/backend/models"
)

func ZsdMdfOrder(submission models.Submission) interface{} {
	var r FRequest
	// r.FUNCTION = "ZSD_MDF_INT_ORDER"
	r.IM_ORDER = fmt.Sprintf("%v", submission.Data["projectNumber"])
	r.IM_ORDER_TYPE = "ZMCH"
	r.IM_ORDER_NAME = fmt.Sprintf("%v", submission.Data["campaignName"])
	r.IM_COMP_CODE = fmt.Sprintf("%v", submission.Data["companyCode"])
	r.IM_PERSON_RESP = fmt.Sprintf("%v", submission.Data["budgetApprovedByVendor"])
	r.IM_CURRENCY = fmt.Sprintf("%v", submission.Data["campaignBudgetsCurrency"])
	r.IM_CO_AREA = "A002"

	bs, _ := json.Marshal(r)
	fmt.Println(string(bs))
	client := &http.Client{}
	req, _ := http.NewRequest(http.MethodPost, "https://b2b-test.also.com/rad/ActWebServices.Wrike:api/IntOrder", bytes.NewReader(bs))
	req.SetBasicAuth("WRIKE", "mMvnfh67#hhz")
	req.Header.Add("Content-Type", "application/json")
	res, _ := client.Do(req)
	b, _ := ioutil.ReadAll(res.Body)
	// responseMsg := "Order has been successfully created"
	var response struct {
		IntOrderOut struct {
			EX_ORDERID  string `json:"EX_ORDERID"`
			EX_SUBRC    int    `json:"EX_SUBRC"`
			IT_MESSAGES []struct {
				MESSAGE string `json:"MESSAGE"`
				MSGNR   string `json:"MSGNR"`
				MSGV4   string `json:"MSGV4"`
				MSGTYP  string `json:"MSGTYP"`
				MSGV3   string `json:"MSGV3"`
				MSGV2   string `json:"MSGV2"`
				MSGID   string `json:"MSGID"`
				MSGV1   string `json:"MSGV1"`
			} `json:"IT_MESSAGES"`
		} `json:"IntOrderOut"`
	}
	json.Unmarshal(b, &response)

	return response
}
