package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/doublegrey/formiks/backend/driver"
	"github.com/doublegrey/formiks/backend/dropdowns"
	"github.com/doublegrey/formiks/backend/logger"
	"github.com/doublegrey/formiks/backend/models"
	"github.com/doublegrey/formiks/backend/repositories"
	"github.com/doublegrey/formiks/backend/repositories/submission"
	"github.com/doublegrey/formiks/backend/sap"
	"github.com/doublegrey/formiks/backend/utils"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func NewSubmissionHandler(db *driver.DB) *Submission {
	return &Submission{
		repo: submission.NewSubmissionRepo(db.Mongo),
		db:   db.Mongo,
	}
}

type Submission struct {
	repo repositories.SubmissionRepo
	db   *mongo.Database
}

func (r *Submission) FetchVendorTablePresets(c *gin.Context) {
	response, _ := r.repo.FetchVendorTablePresets(context.TODO())
	c.JSON(http.StatusOK, response)
}
func (r *Submission) UpsertVendorTablePreset(c *gin.Context) {
	var data models.VendorTablePreset
	err := c.BindJSON(&data)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}
	err = r.repo.UpsertVendorTablePreset(c.Request.Context(), data)
	status := http.StatusOK
	if err != nil {
		logger.LogHandlerError(c, "Failed to update vendor table", err)
		status = http.StatusInternalServerError
	}
	c.Status(status)
}

func (r *Submission) Fetch(c *gin.Context) {
	filter := bson.M{}
	if len(c.Query("project")) > 0 {
		filter = bson.M{"project": c.Query("project")}
	}
	submissions, err := r.repo.Fetch(c.Request.Context(), filter)
	if err != nil {
		logger.LogHandlerError(c, "Failed to fetch submissions", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, submissions)
}

func (r *Submission) FetchByID(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}
	submission, err := r.repo.FetchByID(c.Request.Context(), id)
	if err != nil {
		logger.LogHandlerError(c, "Failed to fetch submission", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, submission)
}

func (r *Submission) Create(c *gin.Context) {
	email, emailExists := c.Get("Email")
	if !emailExists {
		c.Status(http.StatusForbidden)
		return
	}
	var submission models.Submission
	err := c.BindJSON(&submission)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}
	submission.ID = primitive.NewObjectID()
	submission.Created = time.Now()
	submission.Updated = time.Now()
	submission.Author = email.(string)
	submission, err = r.repo.Create(c.Request.Context(), submission)
	if err != nil {
		logger.LogHandlerError(c, "Failed to create submission", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, submission)
}

func (r *Submission) CreateWithChildren(c *gin.Context) {
	email, emailExists := c.Get("Email")
	if !emailExists {
		c.Status(http.StatusForbidden)
		return
	}
	var submissionWithChildren models.SubmissionWithChildrenRequest
	err := c.BindJSON(&submissionWithChildren)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}
	submissionWithChildren.Submission.ID = primitive.NewObjectID()
	submissionWithChildren.Submission.Created = time.Now()
	submissionWithChildren.Submission.Updated = time.Now()
	submissionWithChildren.Submission.Author = email.(string)
	submissionWithChildren.Submission.ParentID = nil
	for index := range submissionWithChildren.Children {
		submissionWithChildren.Children[index].ID = primitive.NewObjectID()
		submissionWithChildren.Children[index].ParentID = submissionWithChildren.Submission.ID.Hex()
		submissionWithChildren.Children[index].Created = time.Now()
		submissionWithChildren.Children[index].Updated = time.Now()
		submissionWithChildren.Children[index].Project = submissionWithChildren.Submission.Project
	}
	glChildren := sap.AccountLines[submissionWithChildren.Submission.Data["projectNumber"].(string)]

	fmt.Println(submissionWithChildren.Submission.Data["projectNumber"].(string))
	fmt.Println(len(glChildren))

	exchangeRates := dropdowns.FetchExchangeRates(c.Request.Context())

	maxGroupLength := make(map[string]int)
	groups := make(map[string][]map[string]interface{})
	for _, glChild := range glChildren {
		var vg []string
		data := make(map[string]interface{})
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
			data["incomeAmountLCSI"] = utils.String2float(glChild.CostAmountInLC)
			data["incomeAmountDCSI"] = utils.String2float(glChild.CostAmountInDC)
			data["dcSI"] = glChild.DocumentCurrency
			data["incomeAmountEURSI"] = utils.String2float(glChild.CostAmountInDC) / exchangeRates[glChild.DocumentCurrency]
		case "SW":
			vg = []string{"Income GL Postings"}
			data["yearMonthIncomeGL"] = glChild.YearMonth
			data["documentTypeIncomeGL"] = glChild.DocumentType
			data["postingDateIncomeGL"] = glChild.PostingDate
			data["documentDateIncomeGL"] = glChild.DocumentDate
			data["documentNumberIncomeGL"] = glChild.DocumentNumber
			data["incomeAccountIncomeGL"] = glChild.Account
			data["name1IncomeGL"] = glChild.Name1
			data["incomeAmountLCIncomeGL"] = utils.String2float(glChild.CostAmountInLC)
			data["incomeAmountDCIncomeGL"] = utils.String2float(glChild.CostAmountInDC)
			data["dcIncomeGL"] = glChild.DocumentCurrency
			data["incomeAmountEurIncomeGL"] = utils.String2float(glChild.CostAmountInDC) / exchangeRates[glChild.DocumentCurrency]
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
			data["costAmountLC"] = utils.String2float(glChild.CostAmountInLC)
			data["costAmountDC"] = utils.String2float(glChild.CostAmountInDC)
			data["dc"] = glChild.DocumentCurrency
			data["costAmountEUR"] = utils.String2float(glChild.CostAmountInDC) / exchangeRates[glChild.DocumentCurrency]
		case "SK":
			vg = []string{"Cost GL Postings"}
			data["yearMonthCostGL"] = glChild.YearMonth
			data["documentTypeCostGL"] = glChild.DocumentType
			data["postingDateCostGL"] = glChild.PostingDate
			data["documentDateCostGL"] = glChild.DocumentDate
			data["documentNumberCostGL"] = glChild.DocumentNumber
			data["costAccountCostGL"] = glChild.Account
			data["costAmountLCCostGL"] = utils.String2float(glChild.CostAmountInLC)
			data["costAmountDCCostGL"] = utils.String2float(glChild.CostAmountInDC)
			data["dcCostGL"] = glChild.DocumentCurrency
			data["costAmountEURCostGL"] = utils.String2float(glChild.CostAmountInDC) / exchangeRates[glChild.DocumentCurrency]
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
			data["incomeAmountLCSI"] = utils.String2float(glChild.CostAmountInLC)
			data["incomeAmountDCSI"] = utils.String2float(glChild.CostAmountInDC)
			data["dcSI"] = glChild.DocumentCurrency
			data["incomeAmountEURSI"] = utils.String2float(glChild.CostAmountInDC) / exchangeRates[glChild.DocumentCurrency]
			data["yearMonth"] = glChild.YearMonth
			data["documentType"] = glChild.DocumentType
			data["postingDate"] = glChild.PostingDate
			data["documentDate"] = glChild.DocumentDate
			data["documentNumber"] = glChild.DocumentNumber
			data["invoiceNumber"] = glChild.InvoiceNumber
			data["costAccount"] = glChild.Account
			data["name1"] = glChild.Name1
			data["costAmountLC"] = utils.String2float(glChild.CostAmountInLC)
			data["costAmountDC"] = utils.String2float(glChild.CostAmountInDC)
			data["dc"] = glChild.DocumentCurrency
			data["costAmountEUR"] = utils.String2float(glChild.CostAmountInDC) / exchangeRates[glChild.DocumentCurrency]
		case "SA", "SL":
			vg = []string{"Income GL Postings", "Cost GL Postings"}
			data["yearMonthIncomeGL"] = glChild.YearMonth
			data["documentTypeIncomeGL"] = glChild.DocumentType
			data["postingDateIncomeGL"] = glChild.PostingDate
			data["documentDateIncomeGL"] = glChild.DocumentDate
			data["documentNumberIncomeGL"] = glChild.DocumentNumber
			data["incomeAccountIncomeGL"] = glChild.Account
			data["name1IncomeGL"] = glChild.Name1
			data["incomeAmountLCIncomeGL"] = utils.String2float(glChild.CostAmountInLC)
			data["incomeAmountDCIncomeGL"] = utils.String2float(glChild.CostAmountInDC)
			data["dcIncomeGL"] = glChild.DocumentCurrency
			data["incomeAmountEurIncomeGL"] = utils.String2float(glChild.CostAmountInDC) / exchangeRates[glChild.DocumentCurrency]
			data["yearMonthCostGL"] = glChild.YearMonth
			data["documentTypeCostGL"] = glChild.DocumentType
			data["postingDateCostGL"] = glChild.PostingDate
			data["documentDateCostGL"] = glChild.DocumentDate
			data["documentNumberCostGL"] = glChild.DocumentNumber
			data["costAccountCostGL"] = glChild.Account
			data["costAmountLCCostGL"] = utils.String2float(glChild.CostAmountInLC)
			data["costAmountDCCostGL"] = utils.String2float(glChild.CostAmountInDC)
			data["dcCostGL"] = glChild.DocumentCurrency
			data["costAmountEURCostGL"] = utils.String2float(glChild.CostAmountInDC) / exchangeRates[glChild.DocumentCurrency]
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

	for group, records := range groups {
		fmt.Printf("* %s: %d\n", group, len(records))
	}
	fmt.Printf("-------------------\nTotal tasks: %d\n", l)

	children := make([]models.Submission, l)

	for i := 0; i < l; i++ {
		child := models.Submission{
			ID:       primitive.NewObjectID(),
			ParentID: submissionWithChildren.Submission.ID.Hex(),
			Created:  time.Now(),
			Updated:  time.Now(),
			Project:  submissionWithChildren.Submission.Project,
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
	submissionWithChildren.Children = children
	fmt.Println(len(submissionWithChildren.Children))

	r.repo.Create(c.Request.Context(), submissionWithChildren.Submission)
	for _, child := range submissionWithChildren.Children {
		r.repo.Create(c.Request.Context(), child)
	}
	c.JSON(http.StatusOK, submissionWithChildren.Submission)
}

func (r *Submission) Update(c *gin.Context) {
	var submission models.Submission
	err := c.BindJSON(&submission)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}
	err = r.repo.Update(c.Request.Context(), submission)
	status := http.StatusOK
	if err != nil {
		logger.LogHandlerError(c, "Failed to update submission", err)
		status = http.StatusInternalServerError
	}
	c.Status(status)
}
func (r *Submission) PartialUpdate(c *gin.Context) {
	var request models.PartialUpdateRequest
	err := c.BindJSON(&request)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}
	r.db.Collection("submissions").UpdateOne(context.TODO(), bson.M{"_id": request.Submission}, bson.D{{Key: "$set", Value: bson.D{{Key: request.Path, Value: request.Value}, {Key: "updated", Value: time.Now()}}}})
}

func (r *Submission) CallSap(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}
	submission, err := r.repo.FetchByID(c.Request.Context(), id)
	if err != nil {
		logger.LogHandlerError(c, "Failed to fetch submission", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.String(sap.ZsdMdfOrder(submission))

}

func (r *Submission) Delete(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}
	err = r.repo.Delete(c.Request.Context(), id, true)
	status := http.StatusOK
	if err != nil {
		logger.LogHandlerError(c, "Failed to delete submission", err)
		status = http.StatusInternalServerError
	}
	c.Status(status)
}
