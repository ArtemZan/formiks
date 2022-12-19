package models

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PAreport struct {
	ID                           primitive.ObjectID `bson:"_id" json:"id,omitempty"`
	CompanyCode                  string             `bson:"companyCode" json:"companyCode"`
	YearMonth                    string             `bson:"yearMonth" json:"yearMonth"`
	ProjectNumber                string             `bson:"projectNumber" json:"projectNumber"`
	ProjectName                  string             `json:"projectName" bson:"projectName"`
	InvoiceNumber                string             `json:"invoiceNumber" bson:"invoiceNumber"`
	IncomeAccount                string             `json:"incomeAccount" bson:"incomeAccount"`
	InvoiceRecipientName         string             `json:"invoiceRecipientName" bson:"invoiceRecipientName"`
	InvoiceRecipientNumber       string             `json:"invoiceRecipientNumber" bson:"invoiceRecipientNumber"`
	RequestFromVendorNumber      string             `bson:"requestFromVendorNumber" json:"requestFromVendorNumber"`
	Validation                   string             `bson:"validation" json:"validation"`
	RequestFormVendorNAme        string             `bson:"requestFormVendorNAme" json:"requestFormVendorNAme"`
	BU                           string             `bson:"bu" json:"bu"`
	RequestFormVendorShare       string             `bson:"requestFormVendorShare" json:"requestFormVendorShare"`
	RequestFormVendorAmount      string             `bson:"requestFormVendorAmount" json:"requestFormVendorAmount"`
	NotOkRequestFromVendorNumber string             `bson:"notOkRequestFromVendorNumber" json:"notOkRequestFromVendorNumber"`
	NotOkRequestFormVendorNAme   string             `bson:"notOkRequestFormVendorNAme" json:"notOkRequestFormVendorNAme"`
}
