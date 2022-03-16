package sap

import (
	"context"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strings"
	"time"

	"github.com/doublegrey/formiks/backend/driver"
	"github.com/doublegrey/formiks/backend/dropdowns"
	"github.com/doublegrey/formiks/backend/models"
	"github.com/doublegrey/formiks/backend/utils"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

var AccountLines = make(map[string][]AccountLineRecord)
var accounts = []string{"0050501000", "0050501200", "0050501300", "0055900200", "0055904100", "0055922300", "0050700400", "0050600000", "0050610100", "0050700000", "0050600030", "0050600100", "0050900300", "0050900400", "0050900600", "0050900500", "0050900510", "0050600010", "0050700600", "0050600020", "0050600700", "0050500300", "0050849000", "0050800160", "0056490110", "0050850200", "0050850000", "0050850100", "0050650020", "0050551000", "0050650030", "0082204100", "0082200000", "0082216000", "0082230000", "0082246000", "0082230088", "0050500310", "0050500000", "0050550000", "0050551010", "0050660000", "0055902100", "0055902110", "0055902300", "0055902310", "0055904010", "0055920000", "0055920010", "0050610000", "0050650010", "0050650200", "0050650000", "0050650100", "0050700100", "0050700200", "0050750100", "0050700010", "0050700020", "0050750000", "0050600300", "0050650300", "0050900100", "0050900200", "0050900000", "0050900098", "0050900700", "0050900800", "0050950000", "0050950300", "0050950400", "0050660100", "0050600800", "0050800000", "0050800170", "0050900900", "0051009900", "0050500098", "0082204000", "0082270000", "0082200010", "0082200020", "0082200022", "0082216020", "0082274000", "0082286000", "0082234000", "0082200098", "0082230098"}

// var allowedAccounts = map[string][]string{
// 	"WK": {
// 		"0040400000",
// 		"0040408000",
// 		"0040416000",
// 		"0040400001",
// 		"0040400100",
// 		"0040419100",
// 		"0040400200",
// 		"0040416100",
// 		"0040400010",
// 		"0040400020",
// 		"0040400098",
// 		"0040400198",
// 		"0040400999",
// 		"0040408200",
// 		"0040416010",
// 		"0040419000",
// 		"0040436030",
// 		"0040440000",
// 		"0040444000",
// 		"0040449000",
// 		"0084100012",
// 		"0040420000",
// 		"0040428000",
// 		"0040436000",
// 		"0084100011",
// 		"0040420200",
// 	},
// 	"SA": {
// 		"0040400000",
// 		"0040408000",
// 		"0040416000",
// 		"0040400001",
// 		"0040400100",
// 		"0040419100",
// 		"0040400200",
// 		"0040416100",
// 		"0040400010",
// 		"0040400020",
// 		"0040400198",
// 		"0040400098",
// 		"0040400999",
// 		"0040408200",
// 		"0040416010",
// 		"0040419000",
// 		"0040436030",
// 		"0040440000",
// 		"0040444000",
// 		"0040449000",
// 		"0084100012",
// 		"0040420000",
// 		"0040428000",
// 		"0040436000",
// 		"0084100011",
// 		"0040420200",
// 	},
// 	"AB": allowedAccounts["SA"],
// 	"SB": allowedAccounts["SA"],
// 	"SL": allowedAccounts["SA"],
// 	"SW": allowedAccounts["SA"],
// }

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
			if isValid(record.Account, record.DocumentType) {
				AccountLines[record.ProjectNumber] = append(AccountLines[record.ProjectNumber], record)
			}
		}
	}
	return nil
}

func GetAccountLinesChildren(parentID, parentProject, projectNumber string) []models.Submission {
	glChildren := AccountLines[projectNumber]
	exchangeRates := dropdowns.FetchExchangeRates(context.TODO())

	maxGroupLength := make(map[string]int)
	groups := make(map[string][]map[string]interface{})
	for _, glChild := range glChildren {
		var vg []string
		data := make(map[string]interface{})
		dcIndicator := 1.0
		if glChild.DebitCreditIndicator == "H" {
			dcIndicator = -1.0
		}
		switch strings.ToUpper(glChild.DocumentType) {
		case "DR", "RV", "WK":
			vg = []string{"Sales Invoices"}
			data["yearMonthSI"] = glChild.YearMonth
			data["documentTypeSI"] = glChild.DocumentType
			data["postingDateSI"] = glChild.PostingDate
			data["documentDateSI"] = glChild.DocumentDate
			data["documentNumberSI"] = glChild.DocumentNumber
			data["invoiceNumberSI"] = glChild.DocumentNumber
			data["incomeAccountSI"] = glChild.Account
			data["name1SI"] = glChild.Name1
			data["incomeAmountLCSI"] = utils.String2float(glChild.CostAmountInLC) * dcIndicator
			data["incomeAmountDCSI"] = utils.String2float(glChild.CostAmountInDC) * dcIndicator
			data["dcSI"] = glChild.DocumentCurrency
			data["incomeAmountEURSI"] = (utils.String2float(glChild.CostAmountInDC) / exchangeRates[glChild.DocumentCurrency]) * dcIndicator
		case "SW":
			vg = []string{"Income GL Postings"}
			data["yearMonthIncomeGL"] = glChild.YearMonth
			data["documentTypeIncomeGL"] = glChild.DocumentType
			data["postingDateIncomeGL"] = glChild.PostingDate
			data["documentDateIncomeGL"] = glChild.DocumentDate
			data["documentNumberIncomeGL"] = glChild.DocumentNumber
			data["incomeAccountIncomeGL"] = glChild.Account
			data["name1IncomeGL"] = glChild.Name1
			data["incomeAmountLCIncomeGL"] = utils.String2float(glChild.CostAmountInLC) * dcIndicator
			data["incomeAmountDCIncomeGL"] = utils.String2float(glChild.CostAmountInDC) * dcIndicator
			data["dcIncomeGL"] = glChild.DocumentCurrency
			data["incomeAmountEurIncomeGL"] = (utils.String2float(glChild.CostAmountInDC) / exchangeRates[glChild.DocumentCurrency]) * dcIndicator
		case "KX", "KW":
			vg = []string{"Cost Invoices"}
			data["yearMonth"] = glChild.YearMonth
			data["documentType"] = glChild.DocumentType
			data["postingDate"] = glChild.PostingDate
			data["documentDate"] = glChild.DocumentDate
			data["documentNumber"] = glChild.DocumentNumber
			data["invoiceNumber"] = glChild.InvoiceNumber
			data["costAccount"] = glChild.Account
			data["name1"] = glChild.Name1
			data["costAmountLC"] = utils.String2float(glChild.CostAmountInLC) * dcIndicator
			data["costAmountDC"] = utils.String2float(glChild.CostAmountInDC) * dcIndicator
			data["dc"] = glChild.DocumentCurrency
			data["costAmountEUR"] = (utils.String2float(glChild.CostAmountInDC) / exchangeRates[glChild.DocumentCurrency]) * dcIndicator
		case "SK":
			vg = []string{"Cost GL Postings"}
			data["yearMonthCostGL"] = glChild.YearMonth
			data["documentTypeCostGL"] = glChild.DocumentType
			data["postingDateCostGL"] = glChild.PostingDate
			data["documentDateCostGL"] = glChild.DocumentDate
			data["documentNumberCostGL"] = glChild.DocumentNumber
			data["costAccountCostGL"] = glChild.Account
			data["costAmountLCCostGL"] = utils.String2float(glChild.CostAmountInLC) * dcIndicator
			data["costAmountDCCostGL"] = utils.String2float(glChild.CostAmountInDC) * dcIndicator
			data["dcCostGL"] = glChild.DocumentCurrency
			data["costAmountEURCostGL"] = (utils.String2float(glChild.CostAmountInDC) / exchangeRates[glChild.DocumentCurrency]) * dcIndicator
		case "ZV":
			vg = []string{"Sales Invoices", "Cost Invoices"}
			data["yearMonthSI"] = glChild.YearMonth
			data["documentTypeSI"] = glChild.DocumentType
			data["postingDateSI"] = glChild.PostingDate
			data["documentDateSI"] = glChild.DocumentDate
			data["documentNumberSI"] = glChild.DocumentNumber
			data["invoiceNumberSI"] = glChild.DocumentNumber
			data["incomeAccountSI"] = glChild.Account
			data["name1SI"] = glChild.Name1
			data["incomeAmountLCSI"] = utils.String2float(glChild.CostAmountInLC) * dcIndicator
			data["incomeAmountDCSI"] = utils.String2float(glChild.CostAmountInDC) * dcIndicator
			data["dcSI"] = glChild.DocumentCurrency
			data["incomeAmountEURSI"] = (utils.String2float(glChild.CostAmountInDC) / exchangeRates[glChild.DocumentCurrency]) * dcIndicator
			data["yearMonth"] = glChild.YearMonth
			data["documentType"] = glChild.DocumentType
			data["postingDate"] = glChild.PostingDate
			data["documentDate"] = glChild.DocumentDate
			data["documentNumber"] = glChild.DocumentNumber
			data["invoiceNumber"] = glChild.InvoiceNumber
			data["costAccount"] = glChild.Account
			data["name1"] = glChild.Name1
			data["costAmountLC"] = utils.String2float(glChild.CostAmountInLC) * dcIndicator
			data["costAmountDC"] = utils.String2float(glChild.CostAmountInDC) * dcIndicator
			data["dc"] = glChild.DocumentCurrency
			data["costAmountEUR"] = (utils.String2float(glChild.CostAmountInDC) / exchangeRates[glChild.DocumentCurrency]) * dcIndicator
		case "SA", "SL":
			vg = []string{"Income GL Postings", "Cost GL Postings"}
			data["yearMonthIncomeGL"] = glChild.YearMonth
			data["documentTypeIncomeGL"] = glChild.DocumentType
			data["postingDateIncomeGL"] = glChild.PostingDate
			data["documentDateIncomeGL"] = glChild.DocumentDate
			data["documentNumberIncomeGL"] = glChild.DocumentNumber
			data["incomeAccountIncomeGL"] = glChild.Account
			data["name1IncomeGL"] = glChild.Name1
			data["incomeAmountLCIncomeGL"] = utils.String2float(glChild.CostAmountInLC) * dcIndicator
			data["incomeAmountDCIncomeGL"] = utils.String2float(glChild.CostAmountInDC) * dcIndicator
			data["dcIncomeGL"] = glChild.DocumentCurrency
			data["incomeAmountEurIncomeGL"] = (utils.String2float(glChild.CostAmountInDC) / exchangeRates[glChild.DocumentCurrency]) * dcIndicator
			data["yearMonthCostGL"] = glChild.YearMonth
			data["documentTypeCostGL"] = glChild.DocumentType
			data["postingDateCostGL"] = glChild.PostingDate
			data["documentDateCostGL"] = glChild.DocumentDate
			data["documentNumberCostGL"] = glChild.DocumentNumber
			data["costAccountCostGL"] = glChild.Account
			data["costAmountLCCostGL"] = utils.String2float(glChild.CostAmountInLC) * dcIndicator
			data["costAmountDCCostGL"] = utils.String2float(glChild.CostAmountInDC) * dcIndicator
			data["dcCostGL"] = glChild.DocumentCurrency
			data["costAmountEURCostGL"] = (utils.String2float(glChild.CostAmountInDC) / exchangeRates[glChild.DocumentCurrency]) * dcIndicator
		}
		for _, g := range vg {
			maxGroupLength[g]++
			groups[g] = append(groups[g], data)
		}
	}

	var l int
	for _, v := range maxGroupLength {
		if l < v {
			l = v
		}
	}

	children := make([]models.Submission, l)

	for i := 0; i < l; i++ {
		child := models.Submission{
			ID:       primitive.NewObjectID(),
			ParentID: parentID,
			Created:  time.Now(),
			Updated:  time.Now(),
			Project:  parentProject,
			Data:     make(map[string]interface{}),
		}
		for _, records := range groups {
			if len(records) > i {
				record := records[i]
				for k, v := range record {
					child.Data[k] = v
				}
			}
		}
		children[i] = child
	}
	return children
}

func CreateSubmissionsForAccountLines() {
	for projectNumber, cd := range AccountLines {
		if len(cd) < 1 {
			continue
		}
		submissionWithChildren := models.SubmissionWithChildrenRequest{
			Submission: models.Submission{
				ID:       primitive.NewObjectID(),
				Created:  time.Now(),
				Updated:  time.Now(),
				Author:   "formiks",
				ParentID: nil,
				Project:  "619515b754e61c8dd33daa52",
				Data:     make(map[string]interface{}),
			},
		}
		submissionWithChildren.Submission.Data["projectNumber"] = projectNumber
		children := GetAccountLinesChildren(submissionWithChildren.Submission.ID.Hex(), submissionWithChildren.Submission.Project, projectNumber)
		submissionWithChildren.Children = children

		driver.Conn.Mongo.Collection("submissions").InsertOne(context.TODO(), submissionWithChildren.Submission)
		for _, child := range submissionWithChildren.Children {
			driver.Conn.Mongo.Collection("submissions").InsertOne(context.TODO(), child)

		}
	}
}

func isValid(account, accountType string) bool {
	for _, v := range accounts {
		if v == account {
			return true
		}
	}
	return false
}
