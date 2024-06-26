


export const invoiceColumnKeys: any ={
    'Self-Invoice number' : 'data.selfInvoiceNumber',
    'SAP Document Number' : 'data.documentNumberCMCT',
    'Date' : 'data.dateCMCT',
    'Operator' : 'data.operatorCMCT',
    'Rejection reason' :'data.rejectReasonLMD',
    'Status' : 'data.statusLMD',
    'Date of document' : 'data.invoicingDateLMD',
    'Requestor' :'data.requestorLMD',
    'Type of document' :'data.invoiceTypeLMD',
    'Document number to be cancelled' : 'data.cancellationInfoLMD',
    'ALSO Marketing Project Number' : 'data.alsoMarketingProjectNumberLMD',
    'Vendor' :'data.vendorLMD',
    'VOD' :'data.vodLMD',
    'BU' : 'data.buLMD',
    'Entry Date' :'data.entryDateLMD',
    'Material Number' : 'data.materialNumberLMD',
    'Reason' : 'data.reasonLMD',
    'Reason Code' : 'data.reasonCodeLMD',
    'Invoice Text' : 'data.invoiceTextLMD',
    'Reference Number From Vendor' : 'data.referenceNumberFromVendor',
    'Activity ID for Portal Vendors' : 'data.activityIdForPortalVendors',
    'Amount' : 'data.amountLMD',
    'Document Currency (DC)' : 'data.documentCurrencyLMD',
    'Payment Method' : 'data.paymentMethodLMD',
    'Dunning Stop?' : 'data.dunningStopLMD',
    'Deposit Number/Intercompany CN Number' : 'data.depositNumberLMD',
    'Additional Information' : 'data.additionalInformationLMD',
    'Send to' : 'data.sendToLMD',
    'Date of service rendered' : 'data.dateOfServiceRenderedLMD',
    'Link to proof' : 'data.linkToProofsLMD',

}

export const defaultColumns = [
    'generalInformation',
    'projectInformation',
    'purchaseOrder',
    'costInvoices',
    'salesInvoices',
    'costGlPostings',
    'incomeGlPostings',
    'projectResults',
    'controlChecks',
    'CMCT',
    'LMD',
];

export const cancellationMandatoryFields: string[] = [
    'cancellationInfoLMD',
    'additionalInformationLMD',
    'sendToLMD',
    'invoicingDateLMD',
];

export const invoiceMandatoryFields: string[] = [
    'invoicingDateLMD',
    'requestorLMD',
    'vendorLMD',
    'vodLMD',
    'entryDateLMD',
    'invoiceTypeLMD',
    'linkToProofsLMD',
    'reasonLMD',
    'reasonCodeLMD',
    'buLMD',
    'alsoMarketingProjectNumberLMD',
    'invoiceTextLMD',
    'amountLMD',
    'documentCurrencyLMD',
    'paymentMethodLMD',
    'dunningStopLMD',
    'sendToLMD',
    'materialNumberLMD',
];

export const DisplayedColumnsList = [
    {
        label: 'All',
        value: 'all',
    },
    {
        label: 'None',
        value: 'none',
    },
    {
        label: 'General Information',
        value: 'generalInformation',
        children: [
            {
                label: 'Company Code',
                value: 'data.companyCode',
                type: 'string',
            },
            {
                label: 'Project Number',
                value: 'data.projectNumber',
                type: 'string',
            },
            {
                label: 'Local Project Number',
                value: 'data.localProjectNumber',
                type: 'string',
            },
            {
                label: 'Project Name',
                value: 'data.projectName',
                type: 'string',
            },
            {
                label: 'Campaign Start Date',
                value: 'data.campaignStartDate',
                type: 'date',
            },
            {
                label: 'Campaign End Date',
                value: 'data.campaignEndDate',
                type: 'date',
            },
            {
                label: 'Project Type/Purchase Order',
                value: 'data.projectType',
                type: 'dropdown',
            },
            { label: 'Author', value: 'author', type: 'string' },
            { label: 'Status', value: 'data.status', type: 'string' },
        ],
    },
    {
        label: 'Project Information',
        value: 'projectInformation',
        children: [
            { label: 'Countries EMEA', value: 'data.country', type: 'string' },
            {
                label: 'Country Code EMEA',
                value: 'data.countryCodeEMEA',
                type: 'string',
            },
            {
                label: 'Parent Project Number',
                value: 'data.parentProjectNumber',
                type: 'string',
            },
            {
                label: '% Country Share',
                value: 'data.countryShare',
                type: 'number',
            },
            {
                label: 'Country Budget Contribution (CC)',
                value: 'data.countryBudgetContributionCC',
                type: 'number',
            },
            {
                label: 'Country Cost Estimation (CC)',
                value: 'data.countryCostEstimationCC',
                type: 'number',
            },
            {
                label: 'Manufacturer Number',
                value: 'data.manufacturerNumber',
                type: 'string',
            },
            {
                label: 'Vendor Name',
                value: 'data.vendorName',
                type: 'dropdown',
            },
            {
                label: 'SAP Debitor Number',
                value: 'data.debitorNumber',
                type: 'string',
            },
            {
                label: 'Budget Source',
                value: 'data.budgetSource',
                type: 'dropdown',
            },
            {
                label: 'Vendor Budget Currency',
                value: 'data.vendorBudgetCurrency',
                type: 'dropdown',
            },
            {
                label: 'Vendor Amount',
                value: 'data.vendorAmount',
                type: 'number',
            },
            {
                label: 'Campaign Currency',
                value: 'data.campaignCurrency',
                type: 'dropdown',
            },
            {
                label: 'Estimated Income (CC)',
                value: 'data.estimatedIncomeCC',
                type: 'number',
            },
            {
                label: 'Estimated Costs (CC)',
                value: 'data.estimatedCostsCC',
                type: 'number',
            },
            {
                label: 'Estimated Result (CC)',
                value: 'data.estimatedResultCC',
                type: 'number',
            },
            {
                label: 'Estimated Income (EUR)',
                value: 'data.estimatedIncomeEUR',
                type: 'number',
            },
            {
                label: 'Estimated Costs (EUR)',
                value: 'data.estimatedCostsEUR',
                type: 'number',
            },
            {
                label: 'Estimated Result (EUR)',
                value: 'data.estimatedResultEUR',
                type: 'number',
            },
            {
                label: '% Vendor Share',
                value: 'data.vendorShare',
                type: 'number',
            },
            {
                label: 'Business Unit',
                value: 'data.businessUnit',
                type: 'string',
            },
            // { label: "PH1", value: "data.PH1", type: "string" },
            {
                label: 'Campaign Channel',
                value: 'data.campaignChannel',
                type: 'dropdown',
            },
            // {
            //   label: "Target Audience",
            //   value: "data.targetAudience",
            //   type: "dropdown",
            // },
            // {
            //   label: "Marketing Responsible",
            //   value: "data.marketingResponsible",
            //   type: "string",
            // },
            // {
            //   label: "Project Approver",
            //   value: "data.projectApprover",
            //   type: "string",
            // },
            {
                label: 'Additional Information',
                value: 'data.additionalInformation',
                type: 'string',
            },
        ],
    },
    {
        label: 'Purchase Order',
        value: 'purchaseOrder',
        children: [
            {
                label: 'Purchase Order Service Provider',
                value: 'data.purchaseOrderServiceProvider',
                type: 'string',
            },
            {
                label: 'Vendor Name',
                value: 'data.vendorNamePO',
                type: 'string',
            },
            {
                label: 'Net Value of Service Ordered (LC)',
                value: 'data.netValueOfServiceOrderedLC',
                type: 'string',
            },
            {
                label: 'Local Currency (LC)',
                value: 'data.localCurrency',
                type: 'string',
            },
            {
                label: 'Net Value (Purchase Order Currency)',
                value: 'data.netValuePOC',
                type: 'string',
            },
            {
                label: 'Purchase Order Currency',
                value: 'data.purchaseOrderCurrency',
                type: 'string',
            },
            {
                label: 'Net Value (EUR)',
                value: 'data.netValueEur',
                type: 'string',
            },
            {
                label: 'Purchase Order Status',
                value: 'data.purchaseOrderStatus',
                type: 'string',
            },
        ],
    },
    {
        label: 'Cost Invoices',
        value: 'costInvoices',
        children: [
            { label: 'Year / Month', value: 'data.yearMonth', type: 'string' },
            {
                label: 'Document Type',
                value: 'data.documentType',
                type: 'string',
            },
            { label: 'Posting Date', value: 'data.postingDate', type: 'date' },
            {
                label: 'Document Date',
                value: 'data.documentDate',
                type: 'date',
            },
            {
                label: 'Document Number',
                value: 'data.documentNumber',
                type: 'string',
            },
            {
                label: 'Invoice Number',
                value: 'data.invoiceNumber',
                type: 'string',
            },
            {
                label: 'Cost Account',
                value: 'data.costAccount',
                type: 'string',
            },
            { label: 'Invoice Supplier', value: 'data.name1', type: 'string' },
            {
                label: 'Cost Amount (LC)',
                value: 'data.costAmountLC',
                type: 'string',
            },
            {
                label: 'Cost Amount (DC)',
                value: 'data.costAmountDC',
                type: 'string',
            },
            {
                label: 'Document Currency (DC)',
                value: 'data.dc',
                type: 'string',
            },
            {
                label: 'Cost Amount (EUR)',
                value: 'data.costAmountEUR',
                type: 'string',
            },
            //{ label: "Cost Status", value: "data.costStatus", type: "string" },
        ],
    },
    {
        label: 'Sales Invoices',
        value: 'salesInvoices',
        children: [
            {
                label: 'Year / Month',
                value: 'data.yearMonthSI',
                type: 'string',
            },
            {
                label: 'Document Type',
                value: 'data.documentTypeSI',
                type: 'string',
            },
            {
                label: 'Posting Date',
                value: 'data.postingDateSI',
                type: 'date',
            },
            {
                label: 'Document Date',
                value: 'data.documentDateSI',
                type: 'date',
            },
            {
                label: 'Document Number',
                value: 'data.documentNumberSI',
                type: 'string',
            },

            {
                label: 'Invoice Number',
                value: 'data.invoiceNumberSI',
                type: 'string',
            },
            {
                label: 'Income Account',
                value: 'data.incomeAccountSI',
                type: 'string',
            },
            {
                label: 'Invoice Recipient',
                value: 'data.name1SI',
                type: 'string',
            },
            {
                label: 'Invoice Recipient Number',
                value: 'data.sapNumberSI',
                type: 'string',
            },
            {
                label: 'Income Amount (LC)',
                value: 'data.incomeAmountLCSI',
                type: 'string',
            },
            {
                label: 'Income Amount (DC)',
                value: 'data.incomeAmountDCSI',
                type: 'string',
            },
            {
                label: 'Document Currency (DC)',
                value: 'data.dcSI',
                type: 'string',
            },
            {
                label: 'Income Amount (EUR)',
                value: 'data.incomeAmountEURSI',
                type: 'string',
            },
            // {
            //   label: "Invoice Status (Paid/Not Paid)",
            //   value: "data.invoiceStatusSI",
            //   type: "string",
            // },
            // {
            //   label: "Activity ID for Portal Vendors",
            //   value: "data.activityIdSI",
            //   type: "string",
            // },
            // {
            //   label: "Additional Marketing Information",
            //   value: "data.additionalMarketingInformation",
            //   type: "string",
            // },
        ],
    },
    {
        label: 'Cost GL Postings',
        value: 'costGlPostings',
        children: [
            {
                label: 'Year / Month',
                value: 'data.yearMonthCostGL',
                type: 'string',
            },
            {
                label: 'Document Type',
                value: 'data.documentTypeCostGL',
                type: 'string',
            },
            {
                label: 'Posting Date',
                value: 'data.postingDateCostGL',
                type: 'date',
            },
            {
                label: 'Document Date',
                value: 'data.documentDateCostGL',
                type: 'date',
            },
            {
                label: 'Document Number',
                value: 'data.documentNumberCostGL',
                type: 'string',
            },
            {
                label: 'Text',
                value: 'data.textCostGL',
                type: 'string',
            },
            {
                label: 'Cost Account',
                value: 'data.costAccountCostGL',
                type: 'string',
            },
            {
                label: 'Cost Amount (LC)',
                value: 'data.costAmountLCCostGL',
                type: 'string',
            },
            {
                label: 'Cost Amount (DC)',
                value: 'data.costAmountDCCostGL',
                type: 'string',
            },
            {
                label: 'Document Currency (DC)',
                value: 'data.dcCostGL',
                type: 'string',
            },
            {
                label: 'Cost Amount (EUR)',
                value: 'data.costAmountEURCostGL',
                type: 'string',
            },
        ],
    },
    {
        label: 'Income GL Postings',
        value: 'incomeGlPostings',
        children: [
            {
                label: 'Year / Month',
                value: 'data.yearMonthIncomeGL',
                type: 'string',
            },
            {
                label: 'Document Type',
                value: 'data.documentTypeIncomeGL',
                type: 'string',
            },
            {
                label: 'Posting Date',
                value: 'data.postingDateIncomeGL',
                type: 'date',
            },
            {
                label: 'Document Date',
                value: 'data.documentDateIncomeGL',
                type: 'date',
            },
            {
                label: 'Document Number',
                value: 'data.documentNumberIncomeGL',
                type: 'string',
            },
            {
                label: 'Text',
                value: 'data.textIncomeGL',
                type: 'string',
            },
            {
                label: 'Income Account',
                value: 'data.incomeAccountIncomeGL',
                type: 'string',
            },
            {
                label: 'Income Amount (LC)',
                value: 'data.incomeAmountLCIncomeGL',
                type: 'string',
            },
            {
                label: 'Income Amount (DC)',
                value: 'data.incomeAmountDCIncomeGL',
                type: 'string',
            },
            {
                label: 'Document Currency (DC)',
                value: 'data.dcIncomeGL',
                type: 'string',
            },
            {
                label: 'Income Amount (EUR)',
                value: 'data.incomeAmountEurIncomeGL',
                type: 'string',
            },
        ],
    },
    {
        label: 'Project Results',
        value: 'projectResults',
        children: [
            {
                label: 'Total Income (LC)',
                value: 'data.totalIncomeLC',
                type: 'string',
            },
            {
                label: 'Total Costs (LC)',
                value: 'data.totalCostsLC',
                type: 'string',
            },
            {
                label: 'Total Profit (LC)',
                value: 'data.totalProfitLC',
                type: 'string',
            },
            {
                label: 'Total Loss (LC)',
                value: 'data.totalLossLC',
                type: 'string',
            },
            {
                label: 'Total Income (EUR)',
                value: 'data.totalIncomeEUR',
                type: 'string',
            },
            {
                label: 'Total Costs (EUR)',
                value: 'data.totalCostsEUR',
                type: 'string',
            },
            {
                label: 'Total Profit (EUR)',
                value: 'data.totalProfitEUR',
                type: 'string',
            },
            {
                label: 'Total Loss (EUR)',
                value: 'data.totalLossEUR',
                type: 'string',
            },
        ],
    },
    {
        label: 'Control Checks',
        value: 'controlChecks',
        children: [
            {
                label: 'Total Costs In Tool (LC)',
                value: 'data.totalCostsTool',
                type: 'string',
            },
            {
                label: 'Total Costs in SAP (LC)',
                value: 'data.totalCostsSAP',
                type: 'string',
            },
            {
                label: 'Total Income in Tool (LC)',
                value: 'data.totalIncomeTool',
                type: 'string',
            },
            {
                label: 'Total Income in SAP (LC)',
                value: 'data.totalIncomeSAP',
                type: 'string',
            },
        ],
    },
    {
        label: 'Input of Central Marketing Controlling Team',
        value: 'CMCT',
        children: [
            // {
            //   label: "Status",
            //   value: "data.statusCMCT",
            //   type: "dropdown",
            // },
            {
                label: 'SAP Document Number',
                value: 'data.documentNumberCMCT',
                type: 'string',
            },
            {
                label: 'Date',
                value: 'data.dateCMCT',
                type: 'date',
            },
            {
                label: 'Operator',
                value: 'data.operatorCMCT',
                type: 'string',
            },
            {
                label: 'Rejection reason',
                value: 'data.rejectReasonLMD',
                type: 'string',
            },
        ],
    },
    {
        label: 'Input of Local Marketing Department',
        value: 'LMD',
        children: [
            {
                label: 'Status',
                value: 'data.statusLMD',
                type: 'string',
            },
            {
                label: 'Date of document',
                value: 'data.invoicingDateLMD',
                type: 'date',
            },
            {
                label: 'Requestor',
                value: 'data.requestorLMD',
                type: 'string',
            },
            {
                label: 'Type of document',
                value: 'data.invoiceTypeLMD',
                type: 'string',
            },
            {
                label: 'Document number to be cancelled',
                value: 'data.cancellationInfoLMD',
                type: 'string',
            },
            {
                label: 'ALSO Marketing Project Number',
                value: 'data.alsoMarketingProjectNumberLMD',
                type: 'string',
            },
            {
                label: 'Vendor',
                value: 'data.vendorLMD',
                type: 'dropdown',
            },
            {
                label: 'VOD',
                value: 'data.vodLMD',
                type: 'string',
            },
            {
                label: 'BU',
                value: 'data.buLMD',
                type: 'string',
            },
            {
                label: 'Entry Date',
                value: 'data.entryDateLMD',
                type: 'date',
            },
            {
                label: 'Material Number',
                value: 'data.materialNumberLMD',
                type: 'string',
            },
            {
                label: 'Reason',
                value: 'data.reasonLMD',
                type: 'string',
            },
            {
                label: 'Reason Code',
                value: 'data.reasonCodeLMD',
                type: 'string',
            },

            {
                label: 'Invoice Text',
                value: 'data.invoiceTextLMD',
                type: 'string',
            },
            {
                label: 'Reference Number From Vendor',
                value: 'data.referenceNumberFromVendor',
                type: 'string',
            },
            {
                label: 'Activity ID for Portal Vendors',
                value: 'data.activityIdForPortalVendors',
            },
            {
                label: 'Amount',
                value: 'data.amountLMD',
                type: 'number',
            },
            {
                label: 'Document Currency (DC)',
                value: 'data.documentCurrencyLMD',
                type: 'string',
            },
            {
                label: 'Payment Method',
                value: 'data.paymentMethodLMD',
                type: 'string',
            },
            {
                label: 'Dunning Stop?',
                value: 'data.dunningStopLMD',
                type: 'string',
            },
            {
                label: 'Deposit Number/Intercompany CN Number',
                value: 'data.depositNumberLMD',
                type: 'string',
            },
            {
                label: 'Additional Information',
                value: 'data.additionalInformationLMD',
                type: 'string',
            },
            {
                label: 'Send to',
                value: 'data.sendToLMD',
                type: 'string',
            },
            {
                label: 'Date of service rendered',
                value: 'data.dateOfServiceRenderedLMD',
                type: 'string',
            },
            {
                label: 'Link to proof',
                value: 'data.linkToProofsLMD',
                type: 'string',
            },
        ],
    },
];

