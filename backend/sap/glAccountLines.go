package sap

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/doublegrey/formiks/backend/driver"
	"github.com/doublegrey/formiks/backend/dropdowns"
	"github.com/doublegrey/formiks/backend/models"
	"github.com/doublegrey/formiks/backend/utils"
)

var AccountLines = make(map[string][]AccountLineRecord)

var allowedAccounts = map[string][]string{
	"Sales Invoices": {
		"0040400000",
		"0040408000",
		"0040416000",
		"0040400001",
		"0040400100",
		"0040419100",
		"0040400200",
		"0040416100",
		"0040400010",
		"0040400020",
		"0040400098",
		"0040400198",
		"0040400999",
		"0040408200",
		"0040416010",
		"0040419000",
		"0040436030",
		"0040440000",
		"0040444000",
		"0040449000",
		"0084100012",
		"0040420000",
		"0040428000",
		"0040436000",
		"0084100011",
		"0040420200",
	},
	"Income GL Postings": {
		"0040400000",
		"0040408000",
		"0040416000",
		"0040400001",
		"0040400100",
		"0040419100",
		"0040400200",
		"0040416100",
		"0040400010",
		"0040400020",
		"0040400198",
		"0040400098",
		"0040400999",
		"0040408200",
		"0040416010",
		"0040419000",
		"0040436030",
		"0040440000",
		"0040444000",
		"0040449000",
		"0084100012",
		"0040420000",
		"0040428000",
		"0040436000",
		"0084100011",
		"0040420200",
	},
	"Cost Invoices": {
		"0050501000", "0050501200", "0050501300", "0055900200", "0055904100", "0055922300", "0050700400", "0050600000", "0050610100", "0050700000", "0050600030", "0050600100", "0050900300", "0050900400", "0050900600", "0050900500", "0050900510", "0050600010", "0050700600", "0050600020", "0050600700", "0050500300", "0050849000", "0050800160", "0056490110", "0050850200", "0050850000", "0050850100", "0050650020", "0050551000", "0050650030", "0082204100", "0082200000", "0082216000", "0082230000", "0082246000", "0082230088", "0050500310", "0050500000", "0050550000", "0050551010", "0050660000", "0055902100", "0055902110", "0055902300", "0055902310", "0055904010", "0055920000", "0055920010", "0050610000", "0050650010", "0050650200", "0050650000", "0050650100", "0050700100", "0050700200", "0050750100", "0050700010", "0050700020", "0050750000", "0050600300", "0050650300", "0050900100", "0050900200", "0050900000", "0050900098", "0050900700", "0050900800", "0050950000", "0050950300", "0050950400", "0050660100", "0050600800", "0050800000", "0050800170", "0050900900", "0051009900", "0050500098", "0082204000", "0082270000", "0082200010", "0082200020", "0082200022", "0082216020", "0082274000", "0082286000", "0082234000", "0082200098", "0082230098", "50500310", "50500000", "50550000", "50551010", "50660000", "55902100", "55902110", "55902300", "55902310", "55904010", "55920000", "55920010", "50610000", "50650010", "50650200", "50650000", "50650100", "50700100", "50700200", "50750100", "50700010", "50700020", "50750000", "50600300", "50650300", "50900100", "50900200", "50900000", "50900098", "50900700", "50900800", "50950000", "50950300", "50950400", "50660100", "50600800", "50800000", "50800170", "50900900", "51009900", "50500098", "82204000", "82270000", "82200010", "82200020", "82200022", "82216020", "82274000", "82286000", "82234000", "82200098", "82230098",
	},
	"Cost GL Postings": {
		"0050501000", "0050501200", "0050501300", "0055900200", "0055904100", "0055922300", "0050700400", "0050600000", "0050610100", "0050700000", "0050600030", "0050600100", "0050900300", "0050900400", "0050900600", "0050900500", "0050900510", "0050600010", "0050700600", "0050600020", "0050600700", "0050500300", "0050849000", "0050800160", "0056490110", "0050850200", "0050850000", "0050850100", "0050650020", "0050551000", "0050650030", "0082204100", "0082200000", "0082216000", "0082230000", "0082246000", "0082230088", "0050500310", "0050500000", "0050550000", "0050551010", "0050660000", "0055902100", "0055902110", "0055902300", "0055902310", "0055904010", "0055920000", "0055920010", "0050610000", "0050650010", "0050650200", "0050650000", "0050650100", "0050700100", "0050700200", "0050750100", "0050700010", "0050700020", "0050750000", "0050600300", "0050650300", "0050900100", "0050900200", "0050900000", "0050900098", "0050900700", "0050900800", "0050950000", "0050950300", "0050950400", "0050660100", "0050600800", "0050800000", "0050800170", "0050900900", "0051009900", "0050500098", "0082204000", "0082270000", "0082200010", "0082200020", "0082200022", "0082216020", "0082274000", "0082286000", "0082234000", "0082200098", "0082230098", "50500310", "50500000", "50550000", "50551010", "50660000", "55902100", "55902110", "55902300", "55902310", "55904010", "55920000", "55920010", "50610000", "50650010", "50650200", "50650000", "50650100", "50700100", "50700200", "50750100", "50700010", "50700020", "50750000", "50600300", "50650300", "50900100", "50900200", "50900000", "50900098", "50900700", "50900800", "50950000", "50950300", "50950400", "50660100", "50600800", "50800000", "50800170", "50900900", "51009900", "50500098", "82204000", "82270000", "82200010", "82200020", "82200022", "82216020", "82274000", "82286000", "82234000", "82200098", "82230098",
	},
}

func FetchAccountLines() error {
	payload := strings.NewReader(`{
    "GetGLAccountLines": {
        "areaKey": "MKT",
        "year": "2022",
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
		// g := []string{}
		for _, record := range response.GetGLAccountLinesOutput.Rs {
			AccountLines[record.ProjectNumber] = append(AccountLines[record.ProjectNumber], record)
			// switch strings.ToUpper(record.DocumentType) {
			// case "DR", "RV", "WK":
			// 	g = []string{"Sales Invoices"}
			// case "SW":
			// 	g = []string{"Income GL Postings"}
			// case "KX", "KW":
			// 	g = []string{"Cost Invoices"}
			// case "SK":
			// 	g = []string{"Cost GL Postings"}
			// case "ZV":
			// 	g = []string{"Sales Invoices", "Cost Invoices"}
			// case "SA", "SL":
			// 	g = []string{"Income GL Postings", "Cost GL Postings"}
			// }
			// if isValid(record.Account, g) {
			// 	AccountLines[record.ProjectNumber] = append(AccountLines[record.ProjectNumber], record)
			// }
		}
	}
	return nil
}

func GetAccountLinesChildren(parentID, parentProject, projectNumber string, existingSubmissions []models.Submission) []models.Submission {
	glChildren := AccountLines[projectNumber]
	exchangeRates := dropdowns.FetchExchangeRates(context.TODO())

	maxGroupLength := make(map[string]int)
	groups := make(map[string][]map[string]interface{})
	for _, glChild := range glChildren {
		if len(glChild.DocumentDate) == 8 {
			glChild.DocumentDate = fmt.Sprintf("%s.%s.%s", glChild.DocumentDate[0:4], glChild.DocumentDate[4:6], glChild.DocumentDate[6:8])
		}
		if len(glChild.PostingDate) == 8 {
			glChild.PostingDate = fmt.Sprintf("%s.%s.%s", glChild.PostingDate[0:4], glChild.PostingDate[4:6], glChild.PostingDate[6:8])
		}
		var group string
		data := make(map[string]interface{})
		dcIndicator := 1.0
		if glChild.DebitCreditIndicator == "H" {
			dcIndicator = -1.0
		}
		exists := false
		es := models.Submission{}
		switch strings.ToUpper(glChild.DocumentType) {
		case "DR", "RV", "WK":
			if isValid(glChild.Account, "Sales Invoices") {
				for _, s := range existingSubmissions {
					if s.Data["documentNumberSI"] == glChild.DocumentNumber && s.Data["yearMonthSI"] == glChild.YearMonth {
						exists = true
						es = s
						break
					}
				}
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
				data["incomeAmountEURSI"] = (utils.String2float(glChild.CostAmountInLC) / exchangeRates[glChild.LocalCurrency]) * dcIndicator

				group = "Sales Invoices"
			}
		case "SW":
			if isValid(glChild.Account, "Income GL Postings") {
				for _, s := range existingSubmissions {
					if s.Data["documentNumberIncomeGL"] == glChild.DocumentNumber && s.Data["yearMonthIncomeGL"] == glChild.YearMonth {
						exists = true
						es = s
						break
					}
				}
				data["yearMonthIncomeGL"] = glChild.YearMonth
				data["documentTypeIncomeGL"] = glChild.DocumentType
				data["postingDateIncomeGL"] = glChild.PostingDate
				data["documentDateIncomeGL"] = glChild.DocumentDate
				data["documentNumberIncomeGL"] = glChild.DocumentNumber
				data["incomeAccountIncomeGL"] = glChild.Account
				data["incomeAmountLCIncomeGL"] = utils.String2float(glChild.CostAmountInLC) * dcIndicator
				data["incomeAmountDCIncomeGL"] = utils.String2float(glChild.CostAmountInDC) * dcIndicator
				data["dcIncomeGL"] = glChild.DocumentCurrency
				data["textIncomeGL"] = glChild.Text
				data["incomeAmountEurIncomeGL"] = (utils.String2float(glChild.CostAmountInLC) / exchangeRates[glChild.LocalCurrency]) * dcIndicator

				group = "Income GL Postings"
			}
		case "KX", "KW":
			if isValid(glChild.Account, "Cost Invoices") {
				for _, s := range existingSubmissions {
					if s.Data["documentNumber"] == glChild.DocumentNumber && s.Data["yearMonth"] == glChild.YearMonth {
						exists = true
						es = s
						break
					}
				}
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
				data["costAmountEUR"] = (utils.String2float(glChild.CostAmountInLC) / exchangeRates[glChild.LocalCurrency]) * dcIndicator

				group = "Cost Invoices"
			}
		case "SK":
			if isValid(glChild.Account, "Cost GL Postings") {
				for _, s := range existingSubmissions {
					if s.Data["documentNumberCostGL"] == glChild.DocumentNumber && s.Data["yearMonthCostGL"] == glChild.YearMonth {
						exists = true
						es = s
						break
					}
				}
				data["yearMonthCostGL"] = glChild.YearMonth
				data["documentTypeCostGL"] = glChild.DocumentType
				data["postingDateCostGL"] = glChild.PostingDate
				data["documentDateCostGL"] = glChild.DocumentDate
				data["documentNumberCostGL"] = glChild.DocumentNumber
				data["costAccountCostGL"] = glChild.Account
				data["costAmountLCCostGL"] = utils.String2float(glChild.CostAmountInLC) * dcIndicator
				data["costAmountDCCostGL"] = utils.String2float(glChild.CostAmountInDC) * dcIndicator
				data["dcCostGL"] = glChild.DocumentCurrency
				data["textCostGL"] = glChild.Text
				data["costAmountEURCostGL"] = (utils.String2float(glChild.CostAmountInLC) / exchangeRates[glChild.LocalCurrency]) * dcIndicator

				group = "Cost GL Postings"
			}
		case "ZV":
			if isValid(glChild.Account, "Sales Invoices") {
				for _, s := range existingSubmissions {
					if s.Data["documentNumberSI"] == glChild.DocumentNumber && s.Data["yearMonthSI"] == glChild.YearMonth {
						exists = true
						es = s
						break
					}
				}
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
				data["incomeAmountEURSI"] = (utils.String2float(glChild.CostAmountInLC) / exchangeRates[glChild.LocalCurrency]) * dcIndicator

				group = "Sales Invoices"
			} else if isValid(glChild.Account, "Cost Invoices") {
				for _, s := range existingSubmissions {
					if s.Data["documentNumber"] == glChild.DocumentNumber && s.Data["yearMonth"] == glChild.YearMonth {
						exists = true
						es = s
						break
					}
				}
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
				data["costAmountEUR"] = (utils.String2float(glChild.CostAmountInLC) / exchangeRates[glChild.LocalCurrency]) * dcIndicator

				group = "Cost Invoices"
			}

		case "SA", "SL":
			if isValid(glChild.Account, "Income GL Postings") {
				for _, s := range existingSubmissions {
					if s.Data["documentNumberIncomeGL"] == glChild.DocumentNumber && s.Data["yearMonthIncomeGL"] == glChild.YearMonth {
						exists = true
						es = s
						break
					}
				}
				data["yearMonthIncomeGL"] = glChild.YearMonth
				data["documentTypeIncomeGL"] = glChild.DocumentType
				data["postingDateIncomeGL"] = glChild.PostingDate
				data["documentDateIncomeGL"] = glChild.DocumentDate
				data["documentNumberIncomeGL"] = glChild.DocumentNumber
				data["incomeAccountIncomeGL"] = glChild.Account
				data["incomeAmountLCIncomeGL"] = utils.String2float(glChild.CostAmountInLC) * dcIndicator
				data["incomeAmountDCIncomeGL"] = utils.String2float(glChild.CostAmountInDC) * dcIndicator
				data["dcIncomeGL"] = glChild.DocumentCurrency
				data["textIncomeGL"] = glChild.Text
				data["incomeAmountEurIncomeGL"] = (utils.String2float(glChild.CostAmountInLC) / exchangeRates[glChild.LocalCurrency]) * dcIndicator

				group = "Income GL Postings"
			} else if isValid(glChild.Account, "Cost GL Postings") {
				for _, s := range existingSubmissions {
					if s.Data["documentNumberCostGL"] == glChild.DocumentNumber && s.Data["yearMonthCostGL"] == glChild.YearMonth {
						exists = true
						es = s
						break
					}
				}
				data["yearMonthCostGL"] = glChild.YearMonth
				data["documentTypeCostGL"] = glChild.DocumentType
				data["postingDateCostGL"] = glChild.PostingDate
				data["documentDateCostGL"] = glChild.DocumentDate
				data["documentNumberCostGL"] = glChild.DocumentNumber
				data["costAccountCostGL"] = glChild.Account
				data["costAmountLCCostGL"] = utils.String2float(glChild.CostAmountInLC) * dcIndicator
				data["costAmountDCCostGL"] = utils.String2float(glChild.CostAmountInDC) * dcIndicator
				data["dcCostGL"] = glChild.DocumentCurrency
				data["textCostGL"] = glChild.Text
				data["costAmountEURCostGL"] = (utils.String2float(glChild.CostAmountInLC) / exchangeRates[glChild.LocalCurrency]) * dcIndicator

				group = "Cost GL Postings"
			}
		}
		data["projectNumber"] = projectNumber
		data["status"] = "Created"
		if exists && es.Data["status"] != "Created" && len(existingSubmissions) > 0 {
			driver.Conn.Mongo.Collection("submissions").UpdateOne(context.TODO(), bson.M{"_id": es.ID}, bson.D{{Key: "$set", Value: bson.D{{Key: "data.status", Value: "Created"}}}})
		}

		if len(group) > 0 && !exists {
			maxGroupLength[group]++
			groups[group] = append(groups[group], data)
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
	fmt.Println("get updates from SAP")
	existingSubmissions := make([]models.Submission, 0)
	cursor, err := driver.Conn.Mongo.Collection("submissions").Find(context.TODO(), bson.M{})
	if err != nil {
		fmt.Println(err)
		return
	}
	err = cursor.All(context.TODO(), &existingSubmissions)
	//
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
		submissionWithChildren.Submission.Data["status"] = "Created"
		submissionWithChildren.Submission.Data["projectNumber"] = projectNumber
		children := GetAccountLinesChildren(submissionWithChildren.Submission.ID.Hex(), submissionWithChildren.Submission.Project, projectNumber, existingSubmissions)
		submissionWithChildren.Children = children
		if len(children) < 1 {
			continue
		}

		driver.Conn.Mongo.Collection("submissions").InsertOne(context.TODO(), submissionWithChildren.Submission)
		for _, child := range submissionWithChildren.Children {
			driver.Conn.Mongo.Collection("submissions").InsertOne(context.TODO(), child)
		}
	}
}

func isValid(account string, group string) bool {
	for _, v := range allowedAccounts[group] {
		if v == account {
			return true
		}
	}
	return false
}
