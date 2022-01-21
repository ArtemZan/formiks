package handlers

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/doublegrey/formiks/backend/driver"
	"github.com/doublegrey/formiks/backend/logger"
	"github.com/doublegrey/formiks/backend/models"
	"github.com/doublegrey/formiks/backend/repositories"
	"github.com/doublegrey/formiks/backend/repositories/submission"
	"github.com/doublegrey/formiks/backend/sap"
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

func (r *Submission) FetchVendorTable(c *gin.Context) {
	response, _ := r.repo.FetchVendorTable(context.TODO())
	c.JSON(http.StatusOK, response)
}
func (r *Submission) UpdateVendorTable(c *gin.Context) {
	var data models.VendorTable
	err := c.BindJSON(&data)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}
	err = r.repo.UpdateVendorTable(c.Request.Context(), data)
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

	for _, glChild := range glChildren {
		glSub := models.Submission{
			ID:       primitive.NewObjectID(),
			ParentID: submissionWithChildren.Submission.ID.Hex(),
			Created:  time.Now(),
			Updated:  time.Now(),
			Project:  submissionWithChildren.Submission.Project,
			Data:     make(map[string]interface{}),
		}
		dt := strings.ToUpper(glChild.DocumentType)
		empty := true
		if dt == "DR" || dt == "RV" || dt == "WK" || dt == "ZV" {
			empty = false
			glSub.Title = "Sales Invoices"
			glSub.Data["yearMonthSI"] = glChild.YearMonth
			glSub.Data["documentTypeSI"] = glChild.DocumentType
			glSub.Data["postingDateSI"] = glChild.PostingDate
			glSub.Data["documentDateSI"] = glChild.DocumentDate
			glSub.Data["documentNumberSI"] = glChild.DocumentNumber
			glSub.Data["invoiceNumberSI"] = glChild.InvoiceNumber
			glSub.Data["incomeAccountSI"] = glChild.Account
			glSub.Data["name1SI"] = glChild.Name1
			glSub.Data["incomeAmountLCSI"] = glChild.CostAmountInLC
			glSub.Data["incomeAmountDCSI"] = glChild.CostAmountInDC
			glSub.Data["dcSI"] = glChild.DocumentCurrency
		}
		if dt == "SW" || dt == "SA" || dt == "SL" {
			empty = false
			glSub.Title = "Income GL Postings"
			glSub.Data["yearMonthIncomeGL"] = glChild.YearMonth
			glSub.Data["documentTypeIncomeGL"] = glChild.DocumentType
			glSub.Data["postingDateIncomeGL"] = glChild.PostingDate
			glSub.Data["documentDateIncomeGL"] = glChild.DocumentDate
			glSub.Data["documentNumberIncomeGL"] = glChild.DocumentNumber
			glSub.Data["incomeAccountIncomeGL"] = glChild.Account
			glSub.Data["incomeAmountLCIncomeGL"] = glChild.CostAmountInLC
			glSub.Data["incomeAmountDCIncomeGL"] = glChild.CostAmountInDC
		}
		if dt == "KX" || dt == "KW" || dt == "ZV" {
			empty = false
			glSub.Title = "Cost Invoices"
			glSub.Data["yearMonth"] = glChild.YearMonth
			glSub.Data["documentType"] = glChild.DocumentType
			glSub.Data["postingDate"] = glChild.PostingDate
			glSub.Data["documentDate"] = glChild.DocumentDate
			glSub.Data["documentNumber"] = glChild.DocumentNumber
			glSub.Data["invoiceNumber"] = glChild.InvoiceNumber
			glSub.Data["costAccount"] = glChild.Account
			glSub.Data["name1"] = glChild.Name1
			glSub.Data["costAmountLC"] = glChild.CostAmountInLC
			glSub.Data["costAmountDC"] = glChild.CostAmountInDC
		}
		if dt == "SK" || dt == "SA" || dt == "SL" {
			empty = false
			glSub.Title = "Cost GL Postings"
			glSub.Data["yearMonthCostGL"] = glChild.YearMonth
			glSub.Data["documentTypeCostGL"] = glChild.DocumentType
			glSub.Data["postingDateCostGL"] = glChild.PostingDate
			glSub.Data["documentDateCostGL"] = glChild.DocumentDate
			glSub.Data["documentNumberCostGL"] = glChild.DocumentNumber
			glSub.Data["costAccountCostGL"] = glChild.Account
			glSub.Data["costAmountLCCostGL"] = glChild.CostAmountInLC
			glSub.Data["costAmountDCCostGL"] = glChild.CostAmountInDC
		}
		if !empty {
			submissionWithChildren.Children = append(submissionWithChildren.Children, glSub)
		}
	}

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
	err = r.repo.Delete(c.Request.Context(), id)
	status := http.StatusOK
	if err != nil {
		logger.LogHandlerError(c, "Failed to delete submission", err)
		status = http.StatusInternalServerError
	}
	c.Status(status)
}
