package report

import (
	"context"
	"fmt"
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
			rdata.CompanyCode, _ = element.Data["companyCode"].(string)
			rdata.YearMonth, _ = element.Data["yearMonthSI"].(string)
			rdata.ProjectNumber, _ = element.Data["projectNumber"].(string)
			rdata.ProjectName, _ = element.Data["projectName"].(string)
			rdata.InvoiceNumber, _ = element.Data["invoiceNumberSI"].(string)
			rdata.IncomeAccount, _ = element.Data["incomeAccountSI"].(string)
			rdata.InvoiceRecipientName, _ = element.Data["name1SI"].(string)
			rdata.InvoiceRecipientNumber, _ = element.Data["numberSI"].(string)
			reports = append(reports, rdata)
			fmt.Println(element.Data["projectNumber"].(string))
		}
	}
	return reports, err
}