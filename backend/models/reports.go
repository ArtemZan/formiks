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
	IncomeAmountLCSI			 string             `json:"incomeAmountLCSI" bson:"incomeAmountLCSI"`
	InvoiceRecipientName         string             `json:"invoiceRecipientName" bson:"invoiceRecipientName"`
	InvoiceRecipientNumber       string             `json:"invoiceRecipientNumber" bson:"invoiceRecipientNumber"`
	Value 					  string             `bson:"value" json:"value"`
	ManufacturerNumber           string             `bson:"manufacturerNumber" json:"manufacturerNumber"`
	ManufacturerName             string             `bson:"manufacturerName" json:"manufacturerName"`
	RequestFromVendorNumber      string             `bson:"requestFromVendorNumber" json:"requestFromVendorNumber"`
	Validation                   string             `bson:"validation" json:"validation"`
	RequestFormVendorName        string             `bson:"requestFormVendorName" json:"requestFormVendorName"`
	BU                           string             `bson:"bu" json:"bu"`
	RequestFormVendorShare       float64             `bson:"requestFormVendorShare" json:"requestFormVendorShare"`
	RequestFormVendorAmount      float64             `bson:"requestFormVendorAmount" json:"requestFormVendorAmount"`
	NotOkRequestFromVendorNumber string             `bson:"notOkRequestFromVendorNumber" json:"notOkRequestFromVendorNumber"`
	NotOkRequestFormVendorName   string             `bson:"notOkRequestFormVendorName" json:"notOkRequestFormVendorName"`
	VendorShare 				string            `bson:"vendorShare" json:"vendorShare"`
	VendorAmount 				string             `bson:"vendorAmount" json:"vendorAmount"`
	VendorVODNumber			  string             `bson:"vendorVODNumber" json:"vendorVODNumber"`
	VendorManufacturerNumber     string             `bson:"vendorManufacturerNumber" json:"vendorManufacturerNumber"`
	VendorManucturerName		 string             `bson:"vendorManucturerName" json:"vendorManucturerName"`
	VendorBU 				   string             `bson:"vendorBU" json:"vendorBU"`
}