package report

import (
	"context"
	"log"
	"strconv"
	"time"

	"github.com/doublegrey/formiks/backend/models"
	"github.com/doublegrey/formiks/backend/repositories"
	"github.com/patrickmn/go-cache"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func NewReportRepo(Conn *mongo.Database) repositories.ReprotRepo {
	return &reportRepo{
		Conn:  Conn,
		Cache: cache.New(5*time.Minute, 10*time.Minute),
	}
}

type reportRepo struct {
	Conn  *mongo.Database
	Cache *cache.Cache
}

func (r *reportRepo) FetchPAreport(ctx context.Context) ([]models.PAreport, error) {
	reports := make([]models.PAreport, 0)
	submissions := make([]models.Submission, 0)

	cursor, err := r.Conn.Collection("submissions").Find(ctx, bson.M{})
	if err != nil {
		return reports, err
	}
	err = cursor.All(ctx, &submissions)

	for _, element := range submissions {
		if element.Data["incomeAccountSI"] != nil {
			var rdata models.PAreport
			var valid = false
			rdata.ID = element.ID
			rdata.CompanyCode, _ = element.Data["companyCode"].(string)
			rdata.YearMonth, _ = element.Data["yearMonthSI"].(string)
			rdata.ProjectNumber, _ = element.Data["projectNumber"].(string)
			rdata.ProjectName, _ = element.Data["projectName"].(string)
			rdata.InvoiceNumber, _ = element.Data["invoiceNumberSI"].(string)
			rdata.IncomeAccount, _ = element.Data["incomeAccountSI"].(string)
			rdata.InvoiceRecipientName, _ = element.Data["name1SI"].(string)
			// rdata.IncomeAmountLCSI, _ = element.Data["incomeAmountLCSI"].string()
			value, ok := element.Data["incomeAmountLCSI"].(float64) // assert type to float64
			if !ok {
				log.Fatalf("Value is not a float64")
			}
			rdata.IncomeAmountLCSI = strconv.FormatFloat(value, 'f', -1, 64) 
			rdata.InvoiceRecipientNumber, _ = element.Data["sapNumberSI"].(string)
			rdata.Value = rdata.IncomeAmountLCSI

			for _, vendorData := range submissions {
				vendorName, ok := vendorData.Data["vendorName"].(string)
				if vendorData.ParentID == element.ParentID && ok && vendorName != "" {
					rdata.VendorManufacturerNumber, _ = vendorData.Data["manufacturerNumber"].(string)
					rdata.VendorManucturerName, _ = vendorData.Data["vendorName"].(string)
					rdata.VendorBU, _= vendorData.Data["businessUnit"].(string)
					rdata.ProjectName, _= vendorData.Data["projectName"].(string)
					rdata.VendorVODNumber, _= vendorData.Data["debitorNumber"].(string)
					break
				}
			}

			if (rdata.InvoiceRecipientNumber == rdata.VendorVODNumber || rdata.InvoiceRecipientNumber == "00"+rdata.VendorVODNumber){
				valid = true
			}
			// for _, vendorData := range submissions {
			// 	if vendorData.ParentID == element.ParentID && vendorData.Group == "vendor" {
			// 		if rdata.InvoiceRecipientNumber == vendorData.Data["vendorNumber"] {
			// 			valid = true
			// 		}
			// 	}
			// }
			// if !valid {
			// 	for _, vendorData := range submissions {
			// 		if vendorData.ParentID == element.ParentID && vendorData.Group == "country" {
			// 			if rdata.InvoiceRecipientNumber == vendorData.Data["countrySAPnumber"] {

			// 			}
			// 		}
			// 	}
			// }
			if !valid {
				rdata.Validation = "NOT OK"
			} else {
				rdata.Validation = "OK"
			}
			if (rdata.ProjectName != ""){ 
				reports = append(reports, rdata)
			}
		}
	}
	return reports, err
}
