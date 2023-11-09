/* eslint-disable react-hooks/rules-of-hooks */
import {
  Box,
  Button,
  Input,
  Text,
  useColorModeValue,
  // Icon,
  IconButton,
  Stack,
  VStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  CloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import {
  cloneElement,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
// import { MdEmail } from "react-icons/md";
// import styled from "styled-components";
import EditableTableCell from "../../components/EditableTableCell";
// import ThemedEditableTableCell from "../../components/ThemedEditableTableCell";
import Creatable from "react-select/creatable";
// import { keyframes } from "styled-components";
// import CreateModal from "../../components/RejectModal";
import Select from "react-select";
import { Submission } from "../../types/submission";
// import { FaChevronRight, FaChevronDown } from "react-icons/fa";
import Toast, { ToastType } from "../../components/Toast";
import { getAccountInfo } from "../../utils/MsGraphApiCall";

import BaseTable, {
  AutoResizer,
  Column,
  ColumnShape,
  unflatten,
} from "react-base-table";
import "react-base-table/styles.css";
import { RestAPI } from "../../api/rest";
import React from "react";
import _, { has } from "lodash";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
  BiPlusMedical,
  RiFileExcel2Line,
  RiUserFill,
  RiGroupFill,
  IoSave,
  // FaSleigh,
  RiAlbumFill,
  RiAlbumLine,
} from "react-icons/all";
import { toast } from "react-toastify";
import { CheckTreePicker, TagPicker } from "rsuite";
import { DateRangeInput, DateSingleInput } from "../../components/DatePicker";
import { NumberWithCommas } from "../../utils/Numbers";

import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { FilterField, Template } from "../../types/template";
import RejectModal from "../../components/RejectModal";
// import { types } from "util";
// import { modalPropTypes } from "rsuite/esm/Overlay/Modal";
// import { table } from "console";

interface Props {
  history: any;
  roles: string[];
}

const allValue = "all";
const noneValue = "none";

var ProjectType: any[] = [];
var PH1: any[] = [];
var Companies: any[] = [];
var VendorsNames: any[] = [];
var InternationalVendorsNames: any[] = [];
var CampaignChannel: any[] = [];
var TargetAudience: any[] = [];
var Budget: any[] = [];
var ExchangeRates: any[] = [];
var FiscalQuarter: any[] = [];
var Year: any[] = [];
var ProjectStartQuarter: any[] = [];
var BUs: any[] = [];
var SapStatus: any[] = [
  { label: "Created", value: "created" },
  { label: "None", value: "none" },
];
// var CostStatuses: any[] = [
//   { label: "Cost Invoiced", value: "Cost Invoiced" },
//   { label: "Cost Not Invoiced", value: "Cost Not Invoiced" },
//   { label: "Not Relevant", value: "Not Relevant" },
// ];
var submissionData: any;

var defaultColumns = [
  "generalInformation",
  "projectInformation",
  "purchaseOrder",
  "costInvoices",
  "salesInvoices",
  "costGlPostings",
  "incomeGlPostings",
  "projectResults",
  "controlChecks",
  "CMCT",
  "LMD",
];

let invoiceBlueFields: string[] = [
  "invoiceTypeLMD",
  "amountLMD",
  "activityIdForPortalVendors",
  "documentCurrencyLMD",
];

let invoiceMandatoryFields: string[] = [
  "invoicingDateLMD",
  "requestorLMD",
  "vendorLMD",
  "vodLMD",
  "entryDateLMD",
  "invoiceTypeLMD",
  "linkToProofsLMD",
  "reasonLMD",
  "reasonCodeLMD",
  "buLMD",
  "alsoMarketingProjectNumberLMD",
  "invoiceTextLMD",
  "amountLMD",
  "documentCurrencyLMD",
  "paymentMethodLMD",
  "dunningStopLMD",
  "sendToLMD",
  "materialNumberLMD",
];
let preInvoiceMandatoryFields: string[] = [
  "invoicingDateLMD",
  "requestorLMD",
  "vendorLMD",
  "linkToProofsLMD",
  "vodLMD",
  "buLMD",
  "entryDateLMD",
  "invoiceTypeLMD",
  "reasonLMD",
  "reasonCodeLMD",
  "alsoMarketingProjectNumberLMD",
  "invoiceTextLMD",
  "amountLMD",
  "documentCurrencyLMD",
  "paymentMethodLMD",
  "dunningStopLMD",
  "sendToLMD",
  "materialNumberLMD",
];
let internalInvoiceMandatoryFields: string[] = [
  "invoicingDateLMD",
  "requestorLMD",
  "vendorLMD",
  "vodLMD",
  "linkToProofsLMD",
  "buLMD",
  "entryDateLMD",
  "invoiceTypeLMD",
  "reasonLMD",
  "reasonCodeLMD",
  "alsoMarketingProjectNumberLMD",
  "invoiceTextLMD",
  "amountLMD",
  "documentCurrencyLMD",
  "paymentMethodLMD",
  "dunningStopLMD",
  "materialNumberLMD",
];
let cancellationMandatoryFields: string[] = [
  "cancellationInfoLMD",
  "additionalInformationLMD",
  "sendToLMD",
  "invoicingDateLMD",
];

async function fetchDropdowns() {
  var dropdownsIds: string[] = [
    "619b630a9a5a2bb37a93b23b",
    "619b61419a5a2bb37a93b237",
    "6391eea09a3d043b9a89d767",
    "619b62d79a5a2bb37a93b239",
    "619b632c9a5a2bb37a93b23c",
    "619b62959a5a2bb37a93b238",
    "619b62f29a5a2bb37a93b23a",
    "619b66defe27d06ad17d75ac",
    "619b6754fe27d06ad17d75ad",
    "619b6799fe27d06ad17d75ae",
    "619b7b9efe27d06ad17d75af",
    "619b7b9efe27d06ad17d75af",
    "633e93ed5a7691ac30c977fc",
    "636abbd43927f9c7703b19c4",
  ];
  var responses = await Promise.all(
    dropdownsIds.map((di) => {
      return RestAPI.getDropdownValues(di);
    })
  );
  PH1 = responses[0].data;
  Companies = responses[1].data;
  VendorsNames = responses[2].data;
  CampaignChannel = responses[3].data;
  TargetAudience = responses[4].data;
  Budget = responses[5].data;
  ExchangeRates = responses[6].data;
  FiscalQuarter = responses[7].data;
  Year = responses[8].data;
  ProjectStartQuarter = responses[9].data;
  ProjectType = responses[10].data;
  BUs = responses[12].data;
  InternationalVendorsNames = responses[13].data;
}

const loadOptions = (identifier: string) => {
  switch (identifier) {
    case "data.budgetSource":
      return Budget;
    case "data.projectType":
      return ProjectType;
    case "data.ph1":
      return PH1;
    case "data.campaignChannel":
      return CampaignChannel;
    case "data.targetAudience":
      return TargetAudience;
    case "data.budgetCurrency" ||
      "data.vendorBudgetCurrency" ||
      "data.campaignCurrency":
      return ExchangeRates;
    case "data.buLMD":
      return BUs;
    case "data.sapStatus":
      return SapStatus;
    case "data.caVendorName":
    case "data.vendorName":
    case "data.vendorNameSA":
      return VendorsNames;
    case "data.statusLMD":
      return [
        { label: "OK FOR INVOICING", value: "OK FOR INVOICING" },
        { label: "FUTURE INVOICE", value: "FUTURE INVOICE" },
        { label: "INVOICED", value: "INVOICED" },
        { label: "INCOMPLETE", value: "INCOMPLETE" },
        { label: "OK FOR CANCELLATION", value: "OK FOR CANCELLATION" },
        { label: "CANCELLED", value: "CANCELLED" },
      ];
    case "data.purchaseOrderStatus":
      return [
        { label: "Invoice Received", value: "Invoice Received" },
        { label: "Invoice Not Received", value: "Invoice Not Received" },
      ];
    case "data.costStatus":
      return [
        { label: "Cost Invoiced", value: "Cost Invoiced" },
        { label: "Cost Not Invoiced", value: "Cost Not Invoiced" },
      ];
    case "data.invoiceStatusSI":
      return [
        { label: "Paid", value: "Paid" },
        { label: "Not Paid", value: "Not Paid" },
      ];
  }
  return [];
};

function bytesToSize(bytes: number) {
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  var i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

const filterTypes = {
  text: [
    { label: "Exact", value: "exact" },
    { label: "Includes", value: "includes" },
  ],
  string: [
    { label: "Exact", value: "exact" },
    { label: "Includes", value: "includes" },
  ],
  number: [
    { label: "Exact", value: "exact" },
    { label: "Range", value: "range" },
  ],
  dropdown: [
    { label: "Exact", value: "exact" },
    { label: "Includes", value: "includes" },
  ],
  "multiple-dropdown": [
    { label: "Exact", value: "exact" },
    { label: "Includes", value: "includes" },
  ],
  date: [
    { label: "Exact", value: "exact" },
    { label: "Range", value: "range" },
  ],
};

const expandIconProps = ({ rowData }: { rowData: any }) => ({
  expanding: !rowData.children || rowData.children.length === 0,
});

const hasAllColumns = (values: string[]): boolean => {
  const exceptions = ["CTCM", "LDM", "CMCT", "LMD"];
  const filteredDefaultColumns = defaultColumns.filter(
    (col) => !exceptions.includes(col)
  );

  return filteredDefaultColumns.every((col) => values.includes(col));
};

const DisplayedColumnsList = [
  {
    label: "All",
    value: "all",
  },
  {
    label: "None",
    value: "none",
  },
  {
    label: "General Information",
    value: "generalInformation",
    children: [
      { label: "Company Code", value: "data.companyCode", type: "string" },
      { label: "Project Number", value: "data.projectNumber", type: "string" },
      {
        label: "Local Project Number",
        value: "data.localProjectNumber",
        type: "string",
      },
      { label: "Project Name", value: "data.projectName", type: "string" },
      {
        label: "Campaign Start Date",
        value: "data.campaignStartDate",
        type: "date",
      },
      {
        label: "Campaign End Date",
        value: "data.campaignEndDate",
        type: "date",
      },
      { label: "Project Type", value: "data.projectType", type: "dropdown" },
      { label: "Author", value: "author", type: "string" },
      { label: "Status", value: "data.status", type: "string" },
    ],
  },
  {
    label: "Project Information",
    value: "projectInformation",
    children: [
      { label: "Countries EMEA", value: "data.country", type: "string" },
      {
        label: "Country Code EMEA",
        value: "data.countryCodeEMEA",
        type: "string",
      },
      {
        label: "Parent Project Number",
        value: "data.parentProjectNumber",
        type: "string",
      },
      { label: "% Country Share", value: "data.countryShare", type: "number" },
      {
        label: "Country Budget Contribution (Campaign Currency)",
        value: "data.countryBudgetContributionCC",
        type: "number",
      },
      {
        label: "Country Cost Estimation (Campaign Currency)",
        value: "data.countryCostEstimationCC",
        type: "number",
      },
      {
        label: "Manufacturer Number",
        value: "data.manufacturerNumber",
        type: "string",
      },
      { label: "Vendor Name", value: "data.vendorName", type: "dropdown" },
      {
        label: "SAP Debitor Number",
        value: "data.debitorNumber",
        type: "string",
      },
      { label: "Budget Source", value: "data.budgetSource", type: "dropdown" },
      {
        label: "Vendor Budget Currency",
        value: "data.vendorBudgetCurrency",
        type: "dropdown",
      },
      {
        label: "Vendor Amount",
        value: "data.vendorAmount",
        type: "number",
      },
      {
        label: "Campaign Currency",
        value: "data.campaignCurrency",
        type: "dropdown",
      },
      {
        label: "Estimated Income (Campaign Currency)",
        value: "data.estimatedIncomeCC",
        type: "number",
      },
      {
        label: "Estimated Costs (Campaign Currency)",
        value: "data.estimatedCostsCC",
        type: "number",
      },
      {
        label: "Estimated Result (Campaign Currency)",
        value: "data.estimatedResultCC",
        type: "number",
      },
      {
        label: "Estimated Income EUR",
        value: "data.estimatedIncomeEUR",
        type: "number",
      },
      {
        label: "Estimated Costs EUR",
        value: "data.estimatedCostsEUR",
        type: "number",
      },
      {
        label: "Estimated Result EUR",
        value: "data.estimatedResultEUR",
        type: "number",
      },
      { label: "% Vendor Share", value: "data.vendorShare", type: "number" },
      { label: "Business Unit", value: "data.businessUnit", type: "string" },
      { label: "PH1", value: "data.PH1", type: "string" },
      {
        label: "Campaign Channel",
        value: "data.campaignChannel",
        type: "dropdown",
      },
      {
        label: "Target Audience",
        value: "data.targetAudience",
        type: "dropdown",
      },
      {
        label: "Marketing Responsible",
        value: "data.marketingResponsible",
        type: "string",
      },
      {
        label: "Project Approver",
        value: "data.projectApprover",
        type: "string",
      },
      {
        label: "Additional Information",
        value: "data.additionalInformation",
        type: "string",
      },
    ],
  },
  {
    label: "Purchase Order",
    value: "purchaseOrder",
    children: [
      {
        label: "Purchase Order Service Provider",
        value: "data.purchaseOrderServiceProvider",
        type: "string",
      },
      {
        label: "Vendor Name",
        value: "data.vendorNamePO",
        type: "string",
      },
      {
        label: "Net Value of Service Ordered (LC)",
        value: "data.netValueOfServiceOrderedLC",
        type: "string",
      },
      { label: "Local Currency", value: "data.localCurrency", type: "string" },
      {
        label: "Net Value (Purchase Order Currency)",
        value: "data.netValuePOC",
        type: "string",
      },
      {
        label: "Purchase Order Currency",
        value: "data.purchaseOrderCurrency",
        type: "string",
      },
      { label: "Net Value (EUR)", value: "data.netValueEur", type: "string" },
      {
        label: "Purchase Order Status",
        value: "data.purchaseOrderStatus",
        type: "string",
      },
    ],
  },
  {
    label: "Cost Invoices",
    value: "costInvoices",
    children: [
      { label: "Year / Month", value: "data.yearMonth", type: "string" },
      { label: "Document Type", value: "data.documentType", type: "string" },
      { label: "Posting Date", value: "data.postingDate", type: "date" },
      { label: "Document Date", value: "data.documentDate", type: "date" },
      {
        label: "Document Number",
        value: "data.documentNumber",
        type: "string",
      },
      { label: "Invoice Number", value: "data.invoiceNumber", type: "string" },
      { label: "Cost Account", value: "data.costAccount", type: "string" },
      { label: "Invoice Supplier", value: "data.name1", type: "string" },
      { label: "Cost Amount (LC)", value: "data.costAmountLC", type: "string" },
      { label: "Cost Amount (DC)", value: "data.costAmountDC", type: "string" },
      { label: "DC", value: "data.dc", type: "string" },
      {
        label: "Cost Amount (EUR)",
        value: "data.costAmountEUR",
        type: "string",
      },
      { label: "Cost Status", value: "data.costStatus", type: "string" },
    ],
  },
  {
    label: "Sales Invoices",
    value: "salesInvoices",
    children: [
      { label: "Year / Month", value: "data.yearMonthSI", type: "string" },
      { label: "Document Type", value: "data.documentTypeSI", type: "string" },
      { label: "Posting Date", value: "data.postingDateSI", type: "date" },
      { label: "Document Date", value: "data.documentDateSI", type: "date" },
      {
        label: "Document Number",
        value: "data.documentNumberSI",
        type: "string",
      },

      {
        label: "Invoice Number",
        value: "data.invoiceNumberSI",
        type: "string",
      },
      {
        label: "Income Account",
        value: "data.incomeAccountSI",
        type: "string",
      },
      { label: "Invoice Recipient", value: "data.name1SI", type: "string" },
      {
        label: "Income Amount (LC)",
        value: "data.incomeAmountLCSI",
        type: "string",
      },
      {
        label: "Income Amount (DC)",
        value: "data.incomeAmountDCSI",
        type: "string",
      },
      { label: "DC", value: "data.dcSI", type: "string" },
      {
        label: "Income Amount (EUR)",
        value: "data.incomeAmountEURSI",
        type: "string",
      },
      {
        label: "Invoice Status (Paid/Not Paid)",
        value: "data.invoiceStatusSI",
        type: "string",
      },
      {
        label: "Activity ID for Portal Vendors",
        value: "data.activityIdSI",
        type: "string",
      },
      {
        label: "Additional Marketing Information",
        value: "data.additionalMarketingInformation",
        type: "string",
      },
    ],
  },
  {
    label: "Cost GL Postings",
    value: "costGlPostings",
    children: [
      { label: "Year / Month", value: "data.yearMonthCostGL", type: "string" },
      {
        label: "Document Type",
        value: "data.documentTypeCostGL",
        type: "string",
      },
      {
        label: "Posting Date",
        value: "data.postingDateCostGL",
        type: "date",
      },
      {
        label: "Document Date",
        value: "data.documentDateCostGL",
        type: "date",
      },
      {
        label: "Document Number",
        value: "data.documentNumberCostGL",
        type: "string",
      },
      {
        label: "Text",
        value: "data.textCostGL",
        type: "string",
      },
      {
        label: "Cost Account",
        value: "data.costAccountCostGL",
        type: "string",
      },
      {
        label: "Cost Amount (LC)",
        value: "data.costAmountLCCostGL",
        type: "string",
      },
      {
        label: "Cost Amount (DC)",
        value: "data.costAmountDCCostGL",
        type: "string",
      },
      { label: "DC", value: "data.dcCostGL", type: "string" },
      {
        label: "Cost Amount (EUR)",
        value: "data.costAmountEURCostGL",
        type: "string",
      },
    ],
  },
  {
    label: "Income GL Postings",
    value: "incomeGlPostings",
    children: [
      {
        label: "Year / Month",
        value: "data.yearMonthIncomeGL",
        type: "string",
      },
      {
        label: "Document Type",
        value: "data.documentTypeIncomeGL",
        type: "string",
      },
      {
        label: "Posting Date",
        value: "data.postingDateIncomeGL",
        type: "date",
      },
      {
        label: "Document Date",
        value: "data.documentDateIncomeGL",
        type: "date",
      },
      {
        label: "Document Number",
        value: "data.documentNumberIncomeGL",
        type: "string",
      },
      {
        label: "Text",
        value: "data.textIncomeGL",
        type: "string",
      },
      {
        label: "Income Account",
        value: "data.incomeAccountIncomeGL",
        type: "string",
      },
      {
        label: "Income Amount (LC)",
        value: "data.incomeAmountLCIncomeGL",
        type: "string",
      },
      {
        label: "Income Amount (DC)",
        value: "data.incomeAmountDCIncomeGL",
        type: "string",
      },
      { label: "DC", value: "data.dcIncomeGL", type: "string" },
      {
        label: "Income Amount (EUR)",
        value: "data.incomeAmountEurIncomeGL",
        type: "string",
      },
    ],
  },
  {
    label: "Project Results",
    value: "projectResults",
    children: [
      {
        label: "Total Income (LC)",
        value: "data.totalIncomeLC",
        type: "string",
      },
      {
        label: "Total Costs (LC)",
        value: "data.totalCostsLC",
        type: "string",
      },
      {
        label: "Total Profit (LC)",
        value: "data.totalProfitLC",
        type: "string",
      },
      {
        label: "Total Loss (LC)",
        value: "data.totalLossLC",
        type: "string",
      },
      {
        label: "Total Income (EUR)",
        value: "data.totalIncomeEUR",
        type: "string",
      },
      {
        label: "Total Costs (EUR)",
        value: "data.totalCostsEUR",
        type: "string",
      },
      {
        label: "Total Profit (EUR)",
        value: "data.totalProfitEUR",
        type: "string",
      },
      {
        label: "Total Loss (EUR)",
        value: "data.totalLossEUR",
        type: "string",
      },
    ],
  },
  {
    label: "Control Checks",
    value: "controlChecks",
    children: [
      {
        label: "Total Costs In Tool (LC)",
        value: "data.totalCostsTool",
        type: "string",
      },
      {
        label: "Total Costs in SAP (LC)",
        value: "data.totalCostsSAP",
        type: "string",
      },
      {
        label: "Total Income in Tool (LC)",
        value: "data.totalIncomeTool",
        type: "string",
      },
      {
        label: "Total Income in SAP (LC)",
        value: "data.totalIncomeSAP",
        type: "string",
      },
    ],
  },
  {
    label: "Input of Central Marketing Controlling Team",
    value: "CMCT",
    children: [
      // {
      //   label: "Status",
      //   value: "data.statusCMCT",
      //   type: "dropdown",
      // },
      {
        label: "SAP Document Number",
        value: "data.documentNumberCMCT",
        type: "string",
      },
      {
        label: "Date",
        value: "data.dateCMCT",
        type: "date",
      },
      {
        label: "Operator",
        value: "data.operatorCMCT",
        type: "string",
      },
      {
        label: "Rejection reason",
        value: "data.rejectReasonLMD",
        type: "string",
      },
    ],
  },
  {
    label: "Input of Local Marketing Department",
    value: "LMD",
    children: [
      {
        label: "Status",
        value: "data.statusLMD",
        type: "string",
      },
      {
        label: "Date of document",
        value: "data.invoicingDateLMD",
        type: "date",
      },
      {
        label: "Requestor",
        value: "data.requestorLMD",
        type: "string",
      },
      {
        label: "Type of document",
        value: "data.invoiceTypeLMD",
        type: "string",
      },
      {
        label: "Document number to be cancelled",
        value: "data.cancellationInfoLMD",
        type: "string",
      },
      {
        label: "ALSO Marketing Project Number",
        value: "data.alsoMarketingProjectNumberLMD",
        type: "string",
      },
      {
        label: "Vendor",
        value: "data.vendorLMD",
        type: "dropdown",
      },
      {
        label: "VOD",
        value: "data.vodLMD",
        type: "string",
      },
      {
        label: "BU",
        value: "data.buLMD",
        type: "string",
      },
      {
        label: "Entry Date",
        value: "data.entryDateLMD",
        type: "date",
      },
      {
        label: "Material Number",
        value: "data.materialNumberLMD",
        type: "string",
      },
      {
        label: "Reason",
        value: "data.reasonLMD",
        type: "string",
      },
      {
        label: "Reason Code",
        value: "data.reasonCodeLMD",
        type: "string",
      },

      {
        label: "Invoice Text",
        value: "data.invoiceTextLMD",
        type: "string",
      },
      {
        label: "Reference Number From Vendor",
        value: "data.referenceNumberFromVendor",
        type: "string",
      },
      {
        label: "Activity ID for Portal Vendors",
        value: "data.activityIdForPortalVendors",
      },
      {
        label: "Amount",
        value: "data.amountLMD",
        type: "number",
      },
      {
        label: "Document Currency",
        value: "data.documentCurrencyLMD",
        type: "string",
      },
      {
        label: "Payment Method",
        value: "data.paymentMethodLMD",
        type: "string",
      },
      {
        label: "Dunning Stop?",
        value: "data.dunningStopLMD",
        type: "string",
      },
      {
        label: "Deposit Number/Central CN Number",
        value: "data.depositNumberLMD",
        type: "string",
      },
      {
        label: "Additional Information",
        value: "data.additionalInformationLMD",
        type: "string",
      },
      {
        label: "Send to",
        value: "data.sendToLMD",
        type: "string",
      },
      {
        label: "Date of service rendered",
        value: "data.dateOfServiceRenderedLMD",
        type: "string",
      },
      {
        label: "Link to proof",
        value: "data.linkToProofsLMD",
        type: "string",
      },
    ],
  },
];

// const DisplayedColumnsListProjects = DisplayedColumnsList.filter((option) =>
//   [
//     "all",
//     "none",
//     "generalInformation",
//     "projectInformation",
//     "purchaseOrder",
//     "costInvoices",
//     "salesInvoices",
//     "costGlPostings",
//     "incomeGlPostings",
//     "projectResults",
//     "controlChecks",
//   ].includes(option.value)
// );

// const DisplayedColumnsListCommunication = DisplayedColumnsList.filter(
//   (option) => ["all", "none", "CMCT", "LMD"].includes(option.value)
// );

// const DisplayedColumnsListOptions = DisplayedColumnsList.flatMap(
//   (group: any) => {
//     // Check if group has a children property and that it's an array
//     if (Array.isArray(group.children)) {
//       return group.children.map((column: any) => {
//         return {
//           label: `${column.label} (${group.label})`,
//           value: column.value,
//           type: column.type,
//         };
//       });
//     }
//     // Return an empty array if the group doesn't have children
//     return [];
//   }
// );

export function SubmissionsTable(props: Props) {
  const [rejectedSubmission, setRejectedSubmission] = useState<
    Submission | undefined
  >(undefined);

  const [rejectedSubmissionComm, setRejectedSubmissionComm] = useState<
    Submission | undefined
  >(undefined);
  const [selectedTemplate, setSelectedTemplate] = useState("local");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sourceSubmissions, setSourceSubmissions] = useState(new Map());
  const [currentUser, setCurrentUser] = useState({ displayName: "unknown" });
  const [debugOverlayHidden, hideDebugOverlay] = useState(true);
  // const [previousValues, setPreviousValues] = useState<string[]>([]);
  const [previousValuesProject, setPreviousValuesProject] = useState<string[]>(
    []
  );
  const [previousValuesComm, setPreviousValuesComm] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterField[]>([]);
  const [displayedColumns, setDisplayedColumns] =
    useState<string[]>(defaultColumns);
  const [tabIndex, setTabIndex] = useState(0);
  const [totalCostAmount, setTotalCostAmount] = useState(0);
  const [totalCostAmountCostGL, setTotalCostAmountCostGL] = useState(0);
  const [totalCostAmountLC, setTotalCostAmountLC] = useState(0);
  const [totalCostAmountLCCostGL, setTotalCostAmountLCCostGL] = useState(0);
  const [totalIncomeAmount, setTotalIncomeAmount] = useState(0);
  const [totalIncomeAmountLCIncomeGL, setTotalIncomeAmountLCIncomeGL] =
    useState(0);
  const [totalIncomeAmountIncomeGL, setTotalIncomeAmountIncomeGL] = useState(0);
  const [totalIncomeAmountLC, setTotalIncomeAmountLC] = useState(0);
  const [totalCostsInTool, setTotalCostsInTool] = useState(0);
  const [totalIncomeInTool, setTotalIncomeInTool] = useState(0);
  const [totalCostsInToolEUR, setTotalCostsInToolEUR] = useState(0);
  const [totalIncomeInToolEUR, setTotalIncomeInToolEUR] = useState(0);
  const [totalLossInToolEUR, setTotalLossInToolEUR] = useState(0);
  const [totalLossInToolLC, setTotalLossInToolLC] = useState(0);
  const [totalProfitInToolEUR, setTotalProfitInToolEUR] = useState(0);
  const [totalProfitInToolLC, setTotalProfitInToolLC] = useState(0);
  // const { fps, avgFps } = useFps(20);
  const [tableWidth, setTableWidth] = useState(1000);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [financialYear, setFinancialYear] = useState<string>("");
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(
    []
  );
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [
    filteredCommunicationSubmissions,
    setFilteredCommunicationSubmissions,
  ] = useState<Submission[]>([]);
  const [communicationSubmissions, setCommunicationSubmissions] = useState<
    Submission[]
  >([]);
  const [onlyMine, setOnlyMine] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [userRoles, setUserRoles] = useState<string[]>(props.roles);
  const [defaultColumnsWidth, setDefaultColumnsWidth] = useState({});
  const onScroll = React.useCallback(
    (args) => {
      if (args.scrollLeft !== scrollLeft) {
        setScrollLeft(args.scrollLeft);
      }
    },
    [scrollLeft]
  );
  // const [heapInfo, setHeapInfo] = useState<any>({
  //   total: 0,
  //   allocated: 0,
  //   current: 0,
  //   domSize: 0,
  // });
  const [totalRequests, setTotalRequests] = useState(1);

  useEffect(() => {
    fetchDropdowns().then(() => forceUpdate());
  }, []);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);

  // useEffect(() => {
  //   getHeapInfo();
  //   const interval = setInterval(() => {
  //     getHeapInfo();
  //   }, 5000);

  //   return () => clearInterval(interval);
  // }, []);

  useEffect(() => {
    setUserRoles(props.roles);
  }, [props.roles]);

  useEffect(() => {
    let tca = 0;
    let tcal = 0;
    let tcit = 0;
    let tiit = 0;
    let tcite = 0;
    let tiite = 0;
    let tcacgl = 0;
    let tia = 0;
    let tial = 0;
    let tcalcgl = 0;
    let tialigl = 0;
    let tiaigl = 0;
    let tcalit = 0;
    let tcaeit = 0;
    let tpit = 0;
    let tlit = 0;
    let tpite = 0;
    let tlite = 0;
    filteredSubmissions.forEach((subm) => {
      if (subm.parentId === null) {
        tca += subm.data.costAmountEUR || 0;
        tcacgl += subm.data.costAmountEURCostGL || 0;
        tcal += subm.data.costAmountLC || 0;
        tia += subm.data.incomeAmountEURSI || 0;
        tial += subm.data.incomeAmountLCSI || 0;
        tcalcgl += subm.data.costAmountLCCostGL || 0;
        tialigl += subm.data.incomeAmountLCIncomeGL || 0;
        tiaigl += subm.data.incomeAmountEurIncomeGL || 0;
        let sumLC =
          (subm.data.incomeAmountLCSI + subm.data.incomeAmountLCIncomeGL) * -1 -
          (subm.data.costAmountLC + subm.data.costAmountLCCostGL);
        if (sumLC < 0) {
          tlit += sumLC;
        } else {
          tpit += sumLC;
        }
        let sumEUR =
          (subm.data.incomeAmountEURSI + subm.data.incomeAmountEurIncomeGL) *
            -1 -
          (subm.data.costAmountEUR + subm.data.costAmountEURCostGL);
        if (sumEUR < 0) {
          tlite += sumEUR;
        } else {
          tpite += sumEUR;
        }
      }
    });
    tcit = -(tcal + tcalcgl);
    tiit = -(tial + tialigl);
    tcite = -(tca + tcacgl);
    tiite = -(tia + tiaigl);
    setTotalCostAmount(tca);
    setTotalCostAmountCostGL(tcacgl);
    setTotalCostAmountLC(tcal);
    setTotalCostAmountLCCostGL(tcalcgl);
    setTotalIncomeAmount(tia);
    setTotalIncomeAmountLCIncomeGL(tialigl);
    setTotalIncomeAmountLC(tial);
    setTotalIncomeAmountIncomeGL(tiaigl);
    setTotalCostsInTool(tcit);
    setTotalIncomeInTool(tiit);
    setTotalCostsInToolEUR(tcite);
    setTotalIncomeInToolEUR(tiite);
    setTotalProfitInToolLC(tpit);
    setTotalProfitInToolEUR(tpite);
    setTotalLossInToolLC(tlit);
    setTotalLossInToolEUR(tlite);
    forceUpdate();
  }, [filteredSubmissions]);

  useEffect(() => {
    var filteredMap = new Map();
    var filtered: Submission[] = [];
    var cFilteredMap = new Map();
    var filteredCommunication: Submission[] = [];
    var f: FilterField[] = JSON.parse(JSON.stringify(filters));

    if (onlyMine) {
      f.push({
        columnValue: "author",
        columnLabel: "Author",
        type: "string",
        filter: "exact",
        values: [],
        selectedValues: [currentUser.displayName],
      } as FilterField);
    }

    if (financialYear !== "") {
      const fullYear = `20${financialYear}`;
      submissions.forEach((submission) => {
        let valid = true;
        let validCost = true;
        let validIncome = true;
        let validCostGL = true;
        let validIncomeGL = true;

        validCost = submission.data.yearMonth
          ? submission.data.yearMonth.includes(fullYear)
          : false;
        validIncome = submission.data.yearMonthSI
          ? submission.data.yearMonthSI.includes(fullYear)
          : false;
        validCostGL = submission.data.yearMonthCostGL
          ? submission.data.yearMonthCostGL.includes(fullYear)
          : false;
        validIncomeGL = submission.data.yearMonthIncomeGL
          ? submission.data.yearMonthIncomeGL.includes(fullYear)
          : false;
        valid = validCost || validIncome || validCostGL || validIncomeGL;

        if (valid) {
          filteredMap.set(submission.id, submission);
        }
      });
      f.push({
        columnValue: "data.yearMonth",
        columnLabel: "Year Month",
        type: "string",
        filter: "includes",
        values: [],
        selectedValues: [fullYear],
      } as FilterField);
    }
    //   const selectedValues = Array.from(
    //     { length: 12 },
    //     (_, i) => `${fullYear}/${i + 1}`
    //   );
    //   f.push({
    //     columnValue: "data.yearMonth",
    //     columnLabel: "Year Month",
    //     type: "string",
    //     filter: "includes",
    //     values: [],
    //     selectedValues: [selectedValues],
    //   } as FilterField);
    // }
    if (f.length > 0 && submissions.length > 0) {
      if (financialYear === "") {
        submissions.forEach((submission) => {
          var valid = true;
          for (let filter of f) {
            if (
              filter.columnLabel.includes(
                "Input of Local Marketing Department"
              ) ||
              filter.columnLabel.includes(
                "Input of Central Marketing Controlling Team"
              )
            ) {
              return;
            }

            if (
              filter.selectedValues !== null &&
              filter.selectedValues.length > 0
            ) {
              var value = _.get(submission, filter.columnValue, filter);

              if (value === undefined) {
                valid = false;
                return;
              }
              switch (filter.type) {
                case "text":
                case "string":
                  switch (filter.filter) {
                    case "exact":
                      if (
                        filter.columnValue === "data.documentNumber" ||
                        filter.columnValue === "data.costAccount" ||
                        filter.columnValue === "data.documentNumberSI" ||
                        filter.columnValue === "data.incomeAccountSI" ||
                        filter.columnValue === "data.documentNumberCostGL" ||
                        filter.columnValue === "data.costAccountCostGL" ||
                        filter.columnValue === "data.documentNumberIncomeGL" ||
                        filter.columnValue === "data.incomeAccountIncomeGL"
                      ) {
                        valid = value
                          .toString()
                          .endsWith(filter.selectedValues[0].toString());
                      } else {
                        valid =
                          filter.selectedValues[0].toString() ===
                          value.toString();
                      }
                      break;
                    case "includes":
                      if (
                        !value
                          .toString()
                          .toLowerCase()
                          .includes(
                            filter.selectedValues[0].toString().toLowerCase()
                          )
                      ) {
                        valid = false;
                      }
                      break;
                  }
                  break;
                case "number":
                  switch (filter.filter) {
                    case "exact":
                      if (!isNaN(value)) {
                        if (submission.data.projectNumber === "6110CH239404") {
                          console.log(value);
                        }
                        valid =
                          Number(filter.selectedValues[0]) ===
                          Math.round(value * 100) / 100;
                      } else {
                        valid = false;
                      }
                      break;
                    case "range":
                      if (filter.selectedValues.length === 2) {
                        if (!isNaN(value)) {
                          let roundValue = Math.round(value * 100) / 100;
                          if (
                            Number(filter.selectedValues[0]) >
                            Number(filter.selectedValues[1])
                          ) {
                            valid =
                              roundValue <= Number(filter.selectedValues[0]) &&
                              roundValue >= Number(filter.selectedValues[1]);
                          } else {
                            valid =
                              roundValue >= Number(filter.selectedValues[0]) &&
                              roundValue <= Number(filter.selectedValues[1]);
                          }
                        } else {
                          valid = false;
                        }
                      }
                      break;
                  }
                  break;
                case "dropdown":
                  switch (filter.filter) {
                    case "exact":
                      var exists = false;
                      // eslint-disable-next-line no-loop-func
                      const options = loadOptions(filter.columnValue);
                      filter.selectedValues.forEach((filterValue) => {
                        const tmp = options.find((option) => {
                          return (
                            option.value.debitorischer ===
                            filterValue.debitorischer
                          );
                        });
                        let selectedOption = "";
                        if (tmp) {
                          selectedOption = tmp.label;
                        }

                        // const selectedLabel = selectedOption
                        //   ? selectedOption.label
                        //   : null;
                        // console.log(selectedLabel);
                        if (filterValue === value) {
                          exists = true;
                        }
                      });

                      if (!exists) {
                        valid = false;
                      }
                      break;
                    case "includes":
                      valid = false;
                      break;
                  }
                  break;
                case "multiple-dropdown":
                  switch (filter.filter) {
                    case "includes":
                      var exists = false;
                      // eslint-disable-next-line no-loop-func
                      filter.selectedValues.forEach((filterValue) => {
                        if (filterValue.toString() === value) {
                          exists = true;
                        }
                      });
                      if (!exists) {
                        valid = false;
                      }
                      break;
                    case "exact":
                      valid = false;
                      break;
                  }
                  break;
                case "date":
                  var v = new Date(value).setHours(0, 0, 0, 0);
                  var filterDate = new Date(filter.selectedValues[0]).setHours(
                    0,
                    0,
                    0,
                    0
                  );
                  if (
                    v !== null &&
                    filter.filter === "range" &&
                    filter.selectedValues.length === 2 &&
                    filter.selectedValues[0] !== null &&
                    filter.selectedValues[1] !== null
                  ) {
                    var filterEndDate = new Date(
                      filter.selectedValues[1]
                    ).setHours(0, 0, 0, 0);
                    valid = v >= filterDate && v <= filterEndDate;
                  } else if (
                    v !== null &&
                    filter.selectedValues[0] !== null &&
                    filter.filter === "exact" &&
                    filter.selectedValues.length === 1
                  ) {
                    valid = v === filterDate;
                  }
                  break;
              }
            }
            if (!valid) {
              return;
            }
          }

          if (valid) {
            // submission.parentId = null;
            // if (submission.parentId !== null) {
            //   var parent = sourceSubmissions.get(submission.parentId);
            //   if (parent !== undefined && parent.id !== undefined) {
            //     filteredMap.set(parent.id, parent);
            //   }
            //   submissions.forEach((s) => {
            //     if (s.parentId === submission.parentId) {
            //       filteredMap.set(s.id, s);
            //     }
            //   });
            // }
            filteredMap.set(submission.id, submission);
          }
        });
        ///
        communicationSubmissions.forEach((submission) => {
          var valid = true;
          filters.forEach((filter) => {
            if (
              !filter.columnLabel.includes(
                "Input of Local Marketing Department"
              ) &&
              !filter.columnLabel.includes(
                "Input of Central Marketing Controlling Team"
              )
            ) {
              return;
            }
            if (
              filter.selectedValues !== null &&
              filter.selectedValues.length > 0
            ) {
              var value = _.get(submission, filter.columnValue);
              if (value === undefined || value === null) {
                value = "";
              }
              if (value === undefined) {
                valid = false;
                return;
              }
              switch (filter.type) {
                case "text":
                case "string":
                  switch (filter.filter) {
                    case "exact":
                      valid =
                        filter.selectedValues[0].toString() ===
                        value.toString();
                      break;
                    case "includes":
                      valid = value
                        .toString()
                        .toLowerCase()
                        .includes(
                          filter.selectedValues[0].toString().toLowerCase()
                        );
                      break;
                  }
                  break;
                case "number":
                  switch (filter.filter) {
                    case "exact":
                      valid =
                        filter.selectedValues[0].toFixed(2) ===
                        value.toFixed(2);
                      break;
                    case "range":
                      if (filter.selectedValues.length === 2) {
                        valid =
                          value >= filter.selectedValues[0] &&
                          value <= filter.selectedValues[1];
                      }
                      break;
                  }
                  break;
                case "dropdown":
                case "multiple-dropdown":
                  switch (filter.filter) {
                    case "includes":
                      var exists = false;
                      filter.selectedValues.forEach((filterValue) => {
                        if (filterValue.toString() === value) {
                          exists = true;
                        }
                      });
                      if (!exists) {
                        valid = false;
                      }
                      break;
                    case "exact":
                      valid = false;
                      break;
                  }
                  break;
                case "date":
                  var v = new Date(value).setHours(0, 0, 0, 0);
                  if (
                    v !== null &&
                    filter.filter === "range" &&
                    filter.selectedValues.length === 2 &&
                    filter.selectedValues[0] !== null &&
                    filter.selectedValues[1] !== null
                  ) {
                    valid =
                      v >= filter.selectedValues[0].setHours(0, 0, 0, 0) &&
                      v <= filter.selectedValues[1].setHours(0, 0, 0, 0);
                  } else if (
                    v !== null &&
                    filter.selectedValues[0] !== null &&
                    filter.filter === "exact" &&
                    filter.selectedValues.length === 1
                  ) {
                    valid = v === filter.selectedValues[0].setHours(0, 0, 0, 0);
                  }
                  break;
              }
            }
          });
          if (valid) {
            // submission.parentId = null;
            // if (submission.parentId !== null) {
            //   var parent = sourceSubmissions.get(submission.parentId);
            //   if (parent !== undefined && parent.id !== undefined) {
            //     cFilteredMap.set(parent.id, parent);
            //   }
            // }
            cFilteredMap.set(submission.id, submission);
          }
        });
        ///
      }
      communicationSubmissions.forEach((value) => {
        if (value.parentId !== null) {
          if (!cFilteredMap.has(value.parentId)) {
            value.data.temp = value.parentId;
            value.parentId = null;
          }
        }
        filteredCommunication.push(value);
      });
      filteredMap.forEach((value) => {
        if (value.parentId !== null) {
          if (!filteredMap.has(value.parentId)) {
            value.data.temp = value.parentId;
            value.parentId = null;
          }
        }
        filtered.push(value);
      });
      setFilteredCommunicationSubmissions(filteredCommunication);
      setFilteredSubmissions(filtered);
    } else {
      communicationSubmissions.forEach((value) => {
        if (value.data.temp !== undefined) {
          value.parentId = value.data.temp;
          value.data.temp = undefined;
        }
        filteredCommunication.push(value);
      });
      submissions.forEach((value) => {
        if (value.data.temp !== undefined) {
          value.parentId = value.data.temp;
          value.data.temp = undefined;
        }
        filtered.push(value);
      });
      setFilteredSubmissions(submissions);
      setFilteredCommunicationSubmissions(communicationSubmissions);
    }
  }, [filters, submissions, communicationSubmissions, onlyMine, financialYear]);

  // const getHeapInfo = () => {
  //   var memory = (window.performance as any).memory;
  //   if (memory !== undefined) {
  //     var info: any = {
  //       total: memory.jsHeapSizeLimit,
  //       allocated: memory.totalJSHeapSize,
  //       current: memory.usedJSHeapSize,
  //       domSize: document.getElementsByTagName("*").length,
  //     };
  //     setHeapInfo(info);
  //   }
  // };
  const getVisibleColumnIndices = (offset: number, columns: any) => {
    var netOffsets: any[] = [],
      offsetSum = 0,
      leftBound = offset - 200,
      rightBound = offset + tableWidth,
      visibleIndices: any[] = [];

    columns.forEach((col: any) => {
      netOffsets.push(offsetSum);
      offsetSum += col.width;
    });

    netOffsets.forEach((columnOffset, colIdx) => {
      var isOutside = columnOffset < leftBound || columnOffset > rightBound;
      if (!isOutside) {
        visibleIndices.push(colIdx);
      }
    });

    return visibleIndices;
  };
  // ________________________________
  // |              |               |
  // |              |               |
  // |              |               |
  // |              |               |
  // |              |               |
  // |              |               |
  // --------------------------------

  // // rightBound = offset+tableWidth;
  //  <-------------*--------------->
  //  <-------------************---->

  //  // leftBound = offset;
  //  <-------------*--------------->
  //  <--************--------------->

  // leftBound = offset - maxColumnWidth;

  //                 offset ->
  // ********<---------------|--------------->*********
  //         leftBound       -      rightBound

  // leftBound = offset;
  // rightBound = tableWidth;

  // isOutside = columnOffset < leftBound || columnOffset > rightBound;

  // if (!isOutside) {
  //     // render column
  // } else {
  //     // remove from DOM
  // }
  const rowRenderer = React.useCallback(
    ({ cells, columns }) => {
      // null out hidden content on scroll
      if (cells.length === 89) {
        const visibleIndices = getVisibleColumnIndices(scrollLeft, columns);
        const startIndex = visibleIndices[0];
        const visibleCells: any = visibleIndices.map((x) => cells[x]);

        if (startIndex > 0) {
          let width = 0;
          for (let i = 0; i < visibleIndices[0]; i++) {
            width += cells[i].props.style.width;
          }

          const placeholder = <div key="placeholder" style={{ width }} />;
          return [placeholder, visibleCells];
        }
        return visibleCells;
      }

      return cells;
    },
    [scrollLeft]
  );
  const addHoursToDate = (date: Date, hoursToAdd: number): Date => {
    return new Date(date.getTime() + hoursToAdd * 60 * 60 * 1000);
  };
  const getFilteredColumns = (tabIndex: number) => {
    if (tabIndex === 0) {
      return DisplayedColumnsList.slice(0, 11);
    }
    return DisplayedColumnsList.slice(-2);
  };

  const handleTabsChange = (index: any) => {
    setTabIndex(index); // update the state

    if (index === 0) {
      if (previousValuesProject.length === 0) {
        setDisplayedColumns(defaultColumns);
        let columns = [
          "all",
          "generalInformation",
          "projectInformation",
          "purchaseOrder",
          "costInvoices",
          "salesInvoices",
          "costGlPostings",
          "incomeGlPostings",
          "projectResults",
          "controlChecks",
        ];
        setDisplayedColumns(columns);
      } else {
        setDisplayedColumns(previousValuesProject);
      }
    } else if (index === 1) {
      if (previousValuesComm.length === 0) {
        let columns = ["CMCT", "LMD"];

        setDisplayedColumns(columns);
      } else {
        setDisplayedColumns(previousValuesComm);
      }
    }
  };

  async function partialUpdate(submission: string, path: string, value: any) {
    setTotalRequests(totalRequests + 1);
    if (path.includes("[")) {
      var s = path.split(".");
      s.shift();
      path = s.join(".");
    }
    RestAPI.updateSubmissionPartial(submission, path, value);
  }

  function hasRequiredFields(ts: any) {
    if (!ts || !ts.data) {
      return false;
    }
    let requiredFields: string[] = [];
    switch (ts.data["invoiceTypeLMD"]) {
      case "Invoice":
        requiredFields = invoiceMandatoryFields;
        break;
      case "Pre-Invoice":
        requiredFields = preInvoiceMandatoryFields;
        break;
      case "Internal Invoice":
        requiredFields = internalInvoiceMandatoryFields;
        break;
      case "Cancellation":
        requiredFields = cancellationMandatoryFields;
        break;
    }
    // Check if all required fields are present and not empty
    for (let field of requiredFields) {
      if (!ts.data[field] || ts.data[field].length === 0) {
        return false;
      }
    }

    // Check if paymentMethodLMD is "Money in House" and depositNumberLMD is present and not empty
    if (
      (ts.data.paymentMethodLMD === "Money in House" ||
        ts.data.paymentMethodLMD === "Central CN") &&
      (!ts.data.depositNumberLMD || ts.data.depositNumberLMD.length === 0)
    ) {
      return false;
    }

    return true;
  }

  function handleCellUpdate(submission: string, path: string, value: any) {
    var submissionIndex = submissions.findIndex((s) => s.id === submission);
    if (submissionIndex > -1) {
      path = `[${submissionIndex}].${path}`;
      if (_.get(submissions, path) !== value) {
        _.set(submissions, path, value);
        partialUpdate(submission, path, value);
      }
    }
  }

  function getColumnName(dataKey: string, group: string) {
    var column = tableCells.find((el) => el.dataKey === dataKey);
    return column ? column.title : "";
  }

  function handleCommunicationCellUpdate(
    submission: string,
    path: string,
    value: any
  ) {
    var submissionIndex = communicationSubmissions.findIndex(
      (s) => s.id === submission
    );

    if (submissionIndex > -1) {
      path = `[${submissionIndex}].${path}`;

      if (_.get(communicationSubmissions, path) !== value) {
        _.set(communicationSubmissions, path, value);
        partialUpdate(submission, path, value);
        var datePath = `[${submissionIndex}].data.entryDateLMD`;
        if (_.get(communicationSubmissions, datePath) === undefined) {
          _.set(communicationSubmissions, datePath, new Date());
          partialUpdate(submission, datePath, new Date().toString());
        }
      }
    }
  }
  const toggleRowExpansion = (rowKey: string) => {
    setExpandedRowKeys((prevKeys) => {
      if (prevKeys.includes(rowKey)) {
        return prevKeys.filter((key) => key !== rowKey);
      } else {
        return [...prevKeys, rowKey];
      }
    });
  };

  const formatDate = (dateInput: string | Date): string => {
    const date = new Date(dateInput);

    if (!dateInput || isNaN(date.getTime())) {
      return "";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed in JavaScript
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  };

  const expandAllRows = () => {
    const allRowKeys = submissions
      .map((row) => row.id?.toString())
      .filter((id): id is string => id !== undefined);

    setExpandedRowKeys(allRowKeys);
  };

  const handleRowClick = (event: any) => {
    toggleRowExpansion(event.rowData.id);
  };

  function fieldBackColor(props: any) {
    if (
      props.rowData.data.invoiceTypeLMD === "Cancellation" ||
      (props.cellData && props.cellData.length > 0)
    ) {
      return "#F5FAEF";
    } else {
      return "#f7cdd6";
    }
  }
  function deleteSubmission(submissionId: string) {
    var tbd: string[] = [submissionId];
    var submissionIndex = submissions.findIndex((s) => s.id === submissionId);
    if (submissionIndex > -1) {
      var temp = [...submissions];
      temp.splice(submissionIndex, 1);
      temp.map((s, index) => {
        if (s.parentId !== null && s.parentId === submissionId) {
          if (s.id) {
            temp.splice(index, 1);
            tbd.push(s.id);
          }
        }
      });
      setSubmissions(temp);
      RestAPI.deleteSubmission(submissionId);
    }
  }
  function parentizeSubmission(submissionId: string) {
    var submissionIndex = submissions.findIndex((s) => s.id === submissionId);
    if (submissionIndex > -1) {
      var temp = [...submissions];
      temp[submissionIndex].parentId = null;
      partialUpdate(submissionId, "parentId", null);
      setSubmissions(temp);
    }
  }

  function cellColor(props: any): string {
    var mandatoryFields: any = [];
    if (props.column.key === "data.invoiceTypeLMD" && props.cellData === "") {
      return "#f7cdd6";
    }

    switch (props.rowData.data.invoiceTypeLMD) {
      case "Invoice":
        mandatoryFields = invoiceMandatoryFields;
        break;
      case "Pre-Invoice":
        mandatoryFields = preInvoiceMandatoryFields;
        break;
      case "Internal Invoice":
        mandatoryFields = internalInvoiceMandatoryFields;
        break;
      case "Cancellation":
        mandatoryFields = cancellationMandatoryFields;
        break;
    }
    if (
      mandatoryFields.includes(
        props.column.key.substring(5, props.column.key.length)
      ) &&
      mandatoryFieldValidation(props) === "#f7cdd6"
    ) {
      return "#f7cdd6";
    } else {
      if (props.column.key === "data.depositNumberLMD") {
        if (
          (props.rowData.data.paymentMethodLMD === "Money in House" ||
            props.rowData.data.paymentMethodLMD === "Central CN") &&
          props.cellData === ""
        ) {
          return "#f7cdd6";
        } else {
          return "#F5FAEF";
        }
      }
    }

    if (
      invoiceBlueFields.includes(
        props.column.key.substring(5, props.column.key.length)
      ) &&
      props.rowData.data.newLine!
    ) {
      if (props.rowData.data.invoiceTypeLMD === "Cancellation") {
        return "#F5FAEF";
      }
      return "#d0d0ff";
    } else {
      return "#F5FAEF";
    }
  }

  function reject(submissionId: string, viewId: string, comment: string) {
    RestAPI.getView(viewId).then((response) => {
      response.data.submission.data["_rejected"] = true;
      response.data.submission.data["_rejectedComment"] = comment;
      RestAPI.createDraft(response.data).then(() => {
        toast(
          <Toast
            title={"Project Rejected"}
            message={
              "Project was rejected and can now be found in drafts section"
            }
            type={"success"}
          />
        );
      });
      RestAPI.deleteSubmission(submissionId);
      var temp = [...submissions];
      var submissionIndex = submissions.findIndex((s) => s.id === submissionId);
      temp.splice(submissionIndex, 1);
      setSubmissions(temp);
    });
  }

  function sortAndStructureData(dataArray: Submission[]): Submission[] {
    // Separating parent and child items
    const parentItems = dataArray.filter((item) => item.parentId === null);
    const childItems = dataArray.filter((item) => item.parentId !== null);

    // Sorting parent items by 'created' date
    parentItems.sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    );

    // Structuring sorted array
    const sortedAndStructuredArray: Submission[] = [];

    parentItems.forEach((parentItem) => {
      sortedAndStructuredArray.push(parentItem); // Adding parent item
      // Extracting and sorting child items of the current parent
      const currentChildItems = childItems.filter(
        (childItem) => childItem.parentId === parentItem.id
      );
      // Optionally: Sort children by some property if needed
      // currentChildItems.sort((a, b) => someComparingFunction);
      sortedAndStructuredArray.push(...currentChildItems); // Adding child items
    });

    return sortedAndStructuredArray;
  }

  function callSap(submissionId: string) {
    RestAPI.callSapSubmission(submissionId)
      .then((response) => {
        var message = `Order ${response.data.IntOrderOut.EX_ORDERID} has been successfully created`;
        var type: ToastType = "success";
        switch (response.data.IntOrderOut.EX_SUBRC) {
          case 4:
            message = `Order ${response.data.IntOrderOut.EX_ORDERID} already exists`;
            type = "error";
            break;
          case 0:
            message = `Order ${response.data.IntOrderOut.EX_ORDERID} created in SAP`;
            break;
        }
        toast(<Toast title={"SAP Response"} message={message} type={type} />);

        if (type === "success") {
          handleCellUpdate(submissionId, "data.status", "Created");
        }
      })
      .catch((error) => {
        toast(
          <Toast
            title={"SAP Response"}
            message={
              <div
                dangerouslySetInnerHTML={{ __html: "Failed to create order" }}
              />
            }
            type={"error"}
          />
        );
      });
  }

  async function handleResize(column: string, width: number) {
    var c = localStorage.getItem("vendors.columns");
    var columns = {} as any;
    if (c !== null) {
      columns = JSON.parse(c);
    }
    columns[column] = width;
    localStorage.setItem("vendors.columns", JSON.stringify(columns));
  }

  function columnWidth(column: string, dw: number) {
    var sd = (defaultColumnsWidth as any)[column];
    return sd ? sd : dw;
  }

  useEffect(() => {
    var selected = localStorage.getItem("template") || "local";
    setSelectedTemplate(selected);
    var template = templates.find((t) => t.name == selected);
    if (template) {
      setDisplayedColumns(template.columns);
      setFilters(template.filters);
    }
  }, [templates]);

  useEffect(() => {
    localStorage.setItem("template", selectedTemplate);
  }, [selectedTemplate]);

  useEffect(() => {
    RestAPI.getTemplates().then((response) => setTemplates(response.data));
    RestAPI.getSubmissions().then((response) => {
      var vSubs: Submission[] = [];
      var subs = response.data;
      var ss = new Map();
      var cSubs: Submission[] = [];

      subs.forEach((sub) => {
        if (sub.group === "communication") {
          cSubs.push(sub);
        } else {
          vSubs.push(sub);
        }
        ss.set(sub.id, sub);
      });

      vSubs.map((sub) => {
        if (sub.parentId === null) {
          sub.data.costAmountLC = 0;
          sub.data.costAmountEUR = 0;
          sub.data.incomeAmountLCSI = 0;
          sub.data.incomeAmountEURSI = 0;
          sub.data.costAmountLCCostGL = 0;
          sub.data.costAmountEURCostGL = 0;
          sub.data.incomeAmountLCIncomeGL = 0;
          sub.data.incomeAmountEurIncomeGL = 0;
          sub.data.totalIncomeLC = 0;
          sub.data.totalCostsLC = 0;
          sub.data.totalIncomeEUR = 0;
          sub.data.totalCostsEUR = 0;
          sub.data.totalCostsTool = 0;
          sub.data.totalIncomeTool = 0;
          vSubs
            .filter((s) => s.parentId === sub.id)
            .forEach((cs) => {
              sub.data.costAmountLC += cs.data.costAmountLC || 0;
              sub.data.costAmountEUR += cs.data.costAmountEUR || 0;
              sub.data.incomeAmountLCSI += cs.data.incomeAmountLCSI || 0;
              sub.data.incomeAmountEURSI += cs.data.incomeAmountEURSI || 0;
              sub.data.costAmountLCCostGL += cs.data.costAmountLCCostGL || 0;
              sub.data.costAmountEURCostGL += cs.data.costAmountEURCostGL || 0;
              sub.data.incomeAmountLCIncomeGL +=
                cs.data.incomeAmountLCIncomeGL || 0;
              sub.data.incomeAmountEurIncomeGL +=
                cs.data.incomeAmountEurIncomeGL || 0;

              let incomeLC = cs.data.incomeAmountLCSI || 0;
              let incomeLCGL = cs.data.incomeAmountLCIncomeGL || 0;
              sub.data.totalIncomeLC += -(incomeLC + incomeLCGL);
              sub.data.totalCostsLC += -(
                (cs.data.costAmountLC || 0) + (cs.data.costAmountLCCostGL || 0)
              );
              let incomeEUR = cs.data.incomeAmountEURSI || 0;
              let incomeEURGL = cs.data.incomeAmountEurIncomeGL || 0;
              sub.data.totalIncomeEUR += -(incomeEUR + incomeEURGL);
              sub.data.totalCostsEUR += -(
                (cs.data.costAmountEUR || 0) +
                (cs.data.costAmountEURCostGL || 0)
              );
              sub.data.totalCostsTool +=
                cs.data.costAmountLC || 0 + cs.data.costAmountLCCostG || 0;
              sub.data.totalCostsSAP +=
                cs.data.costAmountLC || 0 + cs.data.costAmountLCCostG || 0;
              sub.data.totalProfitLC +=
                (cs.data.costAmountLC || 0) + (cs.data.costAmountLCCostGL || 0);
              sub.data.totalIncomeTool +=
                (cs.data.incomeAmountLCSI || 0) +
                (cs.data.incomeAmountLCIncomeGL || 0);
            });
          if (sub.data.totalIncomeLC + sub.data.totalCostsLC >= 0) {
            sub.data.totalProfitLC =
              sub.data.totalIncomeLC + sub.data.totalCostsLC;
          } else {
            sub.data.totalProfitLC = 0;
            sub.data.totalLossLC = -(
              sub.data.totalIncomeLC + sub.data.totalCostsLC
            );
          }
          if (sub.data.totalIncomeEUR + sub.data.totalCostsEUR >= 0) {
            sub.data.totalProfitEUR =
              sub.data.totalIncomeEUR + sub.data.totalCostsEUR;
          } else {
            sub.data.totalProfitEUR = 0;
            sub.data.totalLossEUR = -(
              sub.data.totalIncomeEUR + sub.data.totalCostsEUR
            );
          }
          sub.data.totalCostsSAP = sub.data.totalCostsTool;
        }
      });
      let sortedSubs: Submission[] = [];
      sortedSubs = vSubs.sort((a, b) => {
        if (a.parentId === null && b.parentId === null) {
          if (a.created > b.created) return -1;
          if (a.created < b.created) return 1;
        }
        if (a.parentId === null && b.parentId !== null) return -1;
        if (a.parentId !== null && b.parentId === null) return 1;

        if (a.parentId !== null && b.parentId !== null) {
          const projectTypeA = a.data["projectType"];
          const projectTypeB = b.data["projectType"];

          // Anything but Purchase Order and not undefined first
          if (
            projectTypeA !== "Purchase Order" &&
            projectTypeA !== undefined &&
            (projectTypeB === "Purchase Order" || projectTypeB === undefined)
          )
            return -1;
          if (
            projectTypeB !== "Purchase Order" &&
            projectTypeB !== undefined &&
            (projectTypeA === "Purchase Order" || projectTypeA === undefined)
          )
            return 1;

          // Undefined ones next
          if (projectTypeA === undefined && projectTypeB !== undefined)
            return -1;
          if (projectTypeB === undefined && projectTypeA !== undefined)
            return 1;

          // Purchase Order last
          if (projectTypeA === "Purchase Order") return 1;
          if (projectTypeB === "Purchase Order") return -1;
        }

        return 0;
      });

      setCommunicationSubmissions(cSubs);
      setFilteredCommunicationSubmissions(cSubs);
      setSourceSubmissions(ss);
      setSubmissions(sortedSubs);
      setFilteredSubmissions(sortedSubs);
    });
  }, []);
  useEffect(() => {
    getAccountInfo().then((response) => {
      if (response) {
        setCurrentUser(response);
      }
    });
  }, []);

  function findSubmissionsByPO(po: string) {
    var s: Submission[] = [];
    var parent = submissions.find(
      (submission) =>
        submission.data.projectNumber === po && submission.parentId === null
    );
    if (parent !== undefined) {
      s.push(parent);
      s.push(...submissions.filter((sub) => sub.parentId === parent?.id));
    }
    return s;
  }

  function visibilityController(group: string, key: string) {
    return !displayedColumns.includes(group) && !displayedColumns.includes(key);
  }

  function isFieldMandatory(props: any) {
    if (props.cellData && props.cellData.length > 0) {
      return "#F5FAEF";
    } else {
      return "#f7cdd6";
    }
  }

  function createNewLineActive(props: any) {
    return true;
  }

  function mandatoryFieldValidation(props: any) {
    if (props === undefined) {
      return "#F5FAEF";
    }
    switch (props.rowData.data.invoiceTypeLMD) {
      case "Invoice":
        if (props.column.key === "data.depositNumberLMD") {
          if (
            props.rowData.data.paymentMethodLMD === "Money in House" ||
            props.rowData.data.paymentMethodLMD === "Central CN"
          ) {
            return "#f7cdd6";
          } else {
            return "#F5FAEF";
          }
        }
        if (
          invoiceMandatoryFields.findIndex(
            (element) =>
              element === props.column.key.substring(5, props.column.key.length)
          ) > -1
        ) {
          switch (typeof props.cellData) {
            case "number":
              if (!props.cellData) {
                return "#f7cdd6";
              }
              if (props.cellData > 0) {
                return "#F5FAEF";
              } else {
                return "#f7cdd6";
              }
            case "string":
              if (props.cellData && props.cellData.length > 0) {
                return "#F5FAEF";
              } else {
                return "#f7cdd6";
              }
            case "object":
              if (props.cellData === null) {
                return "#f7cdd6";
              } else {
                return "#F5FAEF";
              }
            case "undefined":
              return "#f7cdd6";
          }
          return "#F5FAEF";
        } else {
          return "#F5FAEF";
        }
      case "Pre-Invoice":
        if (props.column.key === "data.depositNumberLMD") {
          if (
            props.rowData.data.paymentMethodLMD === "Money in House" ||
            props.rowData.data.paymentMethodLMD === "Central CN"
          ) {
            return "#f7cdd6";
          } else {
            return "#F5FAEF";
          }
        }
        if (
          preInvoiceMandatoryFields.findIndex(
            (element) =>
              element === props.column.key.substring(5, props.column.key.length)
          ) > -1
        ) {
          switch (typeof props.cellData) {
            case "number":
              if (!props.cellData) {
                return "#f7cdd6";
              }
              if (props.cellData > 0) {
                return "#F5FAEF";
              } else {
                return "#f7cdd6";
              }
            case "string":
              if (props.cellData && props.cellData.length > 0) {
                return "#F5FAEF";
              } else {
                return "#f7cdd6";
              }
            case "object":
              if (props.cellData === null) {
                return "#f7cdd6";
              } else {
                return "#F5FAEF";
              }
            case "undefined":
              return "#f7cdd6";
          }
          return "#F5FAEF";
        } else {
          return "#F5FAEF";
        }
      case "Internal Invoice":
        if (props.column.key === "data.depositNumberLMD") {
          if (
            (props.rowData.data.paymentMethodLMD === "Money in House" ||
              props.rowData.data.paymentMethodLMD === "Central CN") &&
            props.cellData === ""
          ) {
            return "#f7cdd6";
          } else {
            return "#F5FAEF";
          }
        }
        if (
          internalInvoiceMandatoryFields.findIndex(
            (element) =>
              element === props.column.key.substring(5, props.column.key.length)
          ) > -1
        ) {
          switch (typeof props.cellData) {
            case "number":
              if (props.cellData > 0) {
                return "#F5FAEF";
              } else {
                return "#f7cdd6";
              }
            case "string":
              if (props.cellData && props.cellData.length > 0) {
                return "#F5FAEF";
              } else {
                return "#f7cdd6";
              }
            case "object":
              if (props.cellData === null) {
                return "#f7cdd6";
              } else {
                return "#F5FAEF";
              }
            case "undefined":
              return "#f7cdd6";
          }
          return "#F5FAEF";
        } else {
          return "#F5FAEF";
        }
      case "Cancellation":
        if (
          props.cellData &&
          props.column.key === "data.cancellationInfoLMD" &&
          props.cellData.length < 12
        ) {
          return "#f7cdd6";
        }
        if (
          cancellationMandatoryFields.findIndex(
            (element) =>
              element === props.column.key.substring(5, props.column.key.length)
          ) > -1
        ) {
          switch (typeof props.cellData) {
            case "number":
              if (props.cellData > 0) {
                return "#F5FAEF";
              } else {
                return "#f7cdd6";
              }
            case "string":
              if (props.cellData && props.cellData.length > 0) {
                return "#F5FAEF";
              } else {
                return "#f7cdd6";
              }
            case "object":
              if (props.cellData === null) {
                return "#f7cdd6";
              } else {
                return "#F5FAEF";
              }
            case "undefined":
              return "#f7cdd6";
          }
          return "#F5FAEF";
        } else {
          return "#F5FAEF";
        }
      case "":
        return "#F5FAEF";
    }
  }
  function lmdColumnEdit(value: any) {
    if (
      value.statusLMD === undefined ||
      value.statusLMD === null ||
      value.statusLMD === "" ||
      value.statusLMD === "INCOMPLETE" ||
      value.statusLMD === "REJECTED"
    ) {
      return false;
    } else {
      return true;
    }
  }

  function cellReadonly(props: any) {
    let invoiceReadonlyFields: string[] = [
      "data.cancellationInfoLMD",
      "data.reasonLMD",
      "data.reasonCodeLMD",
      "data.vodLMD",
      "data.entryDateLMD",
      "data.reasonLMD",
      "data.reasonCodeLMD",
      "data.materialNumberLMD",
      "data.requestorLMD",
    ];
    let invoiceSubLineReadonlyFields: string[] = [
      "data.cancellationInfoLMD",
      "data.reasonLMD",
      "data.reasonCodeLMD",
      "data.materialNumberLMD",
      "data.vodLMD",
      "data.buLMD",
      "data.paymentMethodLMD",
      "data.dunningStopLMD",
      "data.sendToLMD",
      "data.invoiceTypeLMD",
      "data.requestorLMD",
      "data.entryDateLMD",
    ];
    let preInvoiceReadonlyFields: string[] = [
      "data.cancellationInfoLMD",
      "data.reasonLMD",
      "data.reasonCodeLMD",
      "data.vodLMD",
      "data.alsoMarketingProjectNumberLMD",
      "data.entryDateLMD",
      "data.reasonLMD",
      "data.reasonCodeLMD",
      "data.materialNumberLMD",
      "data.requestorLMD",
    ];

    let preInvoiceSubLineReadonlyFields: string[] = [
      "data.cancellationInfoLMD",
      "data.reasonLMD",
      "data.reasonCodeLMD",
      "data.vodLMD",
      "data.alsoMarketingProjectNumberLMD",
      "data.entryDateLMD",
      "data.invoiceTypeLMD",
      "data.reasonLMD",
      "data.reasonCodeLMD",
      "data.materialNumberLMD",
      "data.requestorLMD",
    ];

    let internalInvoiceReadonlyFields: string[] = [
      "data.cancellationInfoLMD",
      "data.entryDateLMD",
      "data.vodLMD",
      "data.reasonCodeLMD",
      "data.materialNumberLMD",
      "data.requestorLMD",
      "data.sendToLMD",
    ];
    let internalInvoiceSubLineReadonlyFields: string[] = [
      "data.cancellationInfoLMD",
      "data.entryDateLMD",
      "data.invoiceTypeLMD",
      "data.reasonCodeLMD",
      "data.vodLMD",
      "data.materialNumberLMD",
      "data.requestorLMD",
      "data.reasonLMD",
      "data.sendToLMD",
    ];
    let cancellationReadonlyFields: string[] = [
      "data.requestorLMD",
      "data.vendorLMD",
      "data.vodLMD",
      "data.buLMD",
      "data.entryDateLMD",
      "data.materialNumberLMD",
      "data.reasonLMD",
      "data.depositNumberLMD",
      "data.reasonCodeLMD",
      "data.referenceNumberFromVendor",
      "data.activityIdForPortalVendors",
      "data.alsoMarketingProjectNumberLMD",
      "data.invoiceTextLMD",
      "data.amountLMD",
      "data.linkToProofsLMD",
      "data.documentCurrencyLMD",
      "data.paymentMethodLMD",
      "data.dunningStopLMD",
      "data.dateOfServiceRenderedLMD",
    ];
    if (props === undefined) {
      return false;
    }
    switch (props.rowData.data.invoiceTypeLMD) {
      case "Invoice":
        if (props.column.key === "data.depositNumberLMD") {
          if (
            props.rowData.data.paymentMethodLMD === "Money in House" ||
            props.rowData.data.paymentMethodLMD === "Central CN"
          ) {
            return false;
          } else {
            return true;
          }
        }
        if (props.rowData.parentId) {
          if (
            invoiceSubLineReadonlyFields.findIndex(
              (element) => element === props.column.key
            ) > -1
          ) {
            return true;
          } else {
            return false;
          }
        } else {
          if (
            invoiceReadonlyFields.findIndex(
              (element) => element === props.column.key
            ) > -1
          ) {
            return true;
          } else {
            return false;
          }
        }
      case "Pre-Invoice":
        if (props.column.key === "data.depositNumberLMD") {
          if (
            props.rowData.data.paymentMethodLMD === "Money in House" ||
            props.rowData.data.paymentMethodLMD === "Central CN"
          ) {
            return false;
          } else {
            return true;
          }
        }
        if (props.rowData.parentId) {
          if (
            preInvoiceReadonlyFields.findIndex(
              (element) => element === props.column.key
            ) > -1
          ) {
            return true;
          } else {
            return false;
          }
        } else {
          if (
            preInvoiceSubLineReadonlyFields.findIndex(
              (element) => element === props.column.key
            ) > -1
          ) {
            return true;
          } else {
            return false;
          }
        }
      case "Internal Invoice":
        if (props.column.key === "data.depositNumberLMD") {
          if (
            props.rowData.data.paymentMethodLMD === "Money in House" ||
            props.rowData.data.paymentMethodLMD === "Central CN"
          ) {
            return false;
          } else {
            return true;
          }
        }
        if (props.rowData.parentId) {
          if (
            internalInvoiceSubLineReadonlyFields.findIndex(
              (element) => element === props.column.key
            ) > -1
          ) {
            return true;
          } else {
            return false;
          }
        } else {
          if (
            internalInvoiceReadonlyFields.findIndex(
              (element) => element === props.column.key
            ) > -1
          ) {
            return true;
          } else {
            return false;
          }
        }
      case "Cancellation":
        if (
          cancellationReadonlyFields.findIndex(
            (element) => element === props.column.key
          ) > -1
        ) {
          return true;
        } else {
          return false;
        }
    }
  }

  function projectColumnEdit(value: any) {
    if (
      value.data.status === "" ||
      value.data.status === "INCOMPLETE" ||
      value.data.status === "NEW" ||
      value.data.status === "Incomplete" ||
      value.data.status === "New" ||
      value.data.status === "REJECTED" ||
      value.data.status === "Rejected"
    ) {
      return false;
    } else {
      return true;
    }
  }

  const tableCells = [
    {
      key: "__expand",
      dataKey: "__expand",
      title: "",
      width: 50,
      frozen: Column.FrozenDirection.LEFT,
      resizable: false,
      cellRenderer: (props: any) => {
        if (props.rowData.parentId !== null) {
          return (
            <div
              style={{
                marginTop: 0,
                marginLeft: 0,
                position: "absolute",
              }}
            >
              <RiUserFill />
            </div>
          );
        }

        return <div></div>;
      },
      className: "expand",
    },
    {
      key: "data.companyCode",
      dataKey: "data.companyCode",
      title: "Company Code",
      header: "General Information",
      group: "General Information",
      width: columnWidth("data.companyCode", 150),
      resizable: true,
      hidden: visibilityController("generalInformation", "data.companyCode"),
      type: "string",
      // className: "dark-green-3-border",
      cellRenderer: (props: any) => (
        <EditableTableCell
          readonly={true}
          type={"text"}
          backgroundColor="#f4fcf9"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.projectNumber",
      dataKey: "data.projectNumber",
      title: "Project Number",
      width: columnWidth("data.projectNumber", 150),
      resizable: true,
      group: "General Information",

      hidden: visibilityController("generalInformation", "data.projectNumber"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          readonly={true}
          type={"text"}
          backgroundColor="#f4fcf9"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.localProjectNumber",
      dataKey: "data.localProjectNumber",
      title: "Local Project Number",
      width: columnWidth("data.localProjectNumber", 150),
      resizable: true,
      group: "General Information",

      hidden: visibilityController(
        "generalInformation",
        "data.localProjectNumber"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          readonly={true}
          type={"text"}
          backgroundColor="#f4fcf9"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.projectName",
      dataKey: "data.projectName",
      title: "Project Name",
      width: columnWidth("data.projectName", 200),
      resizable: true,
      group: "General Information",

      hidden: visibilityController("generalInformation", "data.projectName"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f4fcf9"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.campaignStartDate",
      dataKey: "data.campaignStartDate",
      title: "Campaign Start Date",
      group: "General Information",

      width: columnWidth("data.campaignStartDate", 200),
      resizable: true,
      hidden: visibilityController(
        "generalInformation",
        "data.campaignStartDate"
      ),
      type: "date",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"date"}
          readonly={true}
          backgroundColor="#f4fcf9"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.campaignEndDate",
      dataKey: "data.campaignEndDate",
      title: "Campaign End Date",
      group: "General Information",

      width: columnWidth("data.campaignEndDate", 200),
      resizable: true,
      hidden: visibilityController(
        "generalInformation",
        "data.campaignEndDate"
      ),
      type: "date",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"date"}
          readonly={true}
          backgroundColor="#f4fcf9"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.projectType",
      dataKey: "data.projectType",
      title: "Project Type/Purchase Order",
      group: "General Information",

      width: columnWidth("data.projectType", 250),
      resizable: true,
      hidden: visibilityController("generalInformation", "data.projectType"),
      type: "dropdown",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          readonly={true}
          backgroundColor="#f4fcf9"
          onUpdate={handleCellUpdate}
          loadOptions={loadOptions}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "author",
      dataKey: "author",
      title: "Author",
      group: "General Information",
      width: columnWidth("author", 250),
      resizable: true,
      hidden: visibilityController("generalInformation", "author"),
      type: "text",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f4fcf9"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.status",
      dataKey: "data.status",
      title: "Status",
      group: "General Information",
      width: columnWidth("data.status", 250),
      resizable: true,
      hidden: visibilityController("generalInformation", "data.status"),
      type: "text",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f4fcf9"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.country",
      dataKey: "data.country",
      title: "Countries EMEA",
      header: "Project Information",
      width: columnWidth("data.country", 250),
      resizable: true,
      group: "Project Information",

      hidden: visibilityController("projectInformation", "data.country"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.countryCodeEMEA",
      dataKey: "data.countryCodeEMEA",
      title: "Country Code EMEA",
      width: columnWidth("data.countryCodeEMEA", 250),
      resizable: true,
      group: "Project Information",

      hidden: visibilityController(
        "projectInformation",
        "data.countryCodeEMEA"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.parentProjectNumber",
      dataKey: "data.parentProjectNumber",
      title: "Parent Project Number",
      width: columnWidth("data.parentProjectNumber", 250),
      resizable: true,
      group: "Project Information",

      hidden: visibilityController(
        "projectInformation",
        "data.parentProjectNumber"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    //
    {
      key: "data.countryShare",
      dataKey: "data.countryShare",
      title: "% Country Share",
      width: columnWidth("data.countryShare", 200),
      resizable: true,
      group: "Project Information",
      type: "number",
      hidden: visibilityController("projectInformation", "data.countryShare"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.countryBudgetContributionCC",
      dataKey: "data.countryBudgetContributionCC",
      title: "Country Budget Contribution (CC)",
      width: columnWidth("data.countryBudgetContributionCC", 250),
      resizable: true,
      group: "Project Information",
      type: "number",
      hidden: visibilityController(
        "projectInformation",
        "data.countryBudgetContributionCC"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.countryCostEstimationCC",
      dataKey: "data.countryCostEstimationCC",
      title: "Country Cost Estimation (CC)",
      width: columnWidth("data.countryCostEstimationCC", 250),
      resizable: true,
      group: "Project Information",
      type: "number",
      hidden: visibilityController(
        "projectInformation",
        "data.countryCostEstimationCC"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    // {
    //   key: "data.manufacturerNumber",
    //   dataKey: "data.manufacturerNumber",
    //   title: "Manufacturer Number",
    //   group: "Project Information",

    //   width: columnWidth("data.manufacturerNumber", 200),
    //   resizable: true,
    //   hidden: visibilityController(
    //     "projectInformation",
    //     "data.manufacturerNumber"
    //   ),
    //   cellRenderer: (props: any) => (
    //     <EditableTableCell
    //       type={"text"}
    //       readonly={props.rowData.data.status !== "Incomplete"}
    //       backgroundColor={
    //         props.rowData.data.status === "Incomplete"
    //           ? props.cellData && props.cellData.length > 0
    //             ? "#f5faef"
    //             : "#f7cdd6"
    //           : "#f5faef"
    //       }
    //       onUpdate={handleCellUpdate}
    //       rowIndex={props.rowIndex}
    //       columnKey={props.column.dataKey}
    //       rowData={props.rowData}
    //       initialValue={props.cellData}
    //     />
    //   ),
    // },
    {
      key: "data.manufacturerNumber",
      dataKey: "data.manufacturerNumber",
      title: "Manufacturer Number",
      group: "Project Information",
      type: "text",
      width: columnWidth("data.manufacturerNumber", 200),
      resizable: true,
      hidden: visibilityController(
        "projectInformation",
        "data.manufacturerNumber"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"value-dropdown"}
          readonly={
            projectColumnEdit(props.rowData) &&
            !(
              userRoles.includes("Administrator") ||
              userRoles.includes("Accounting")
            )
          }
          // readonly={true}
          loadOptions={() => {
            return props.rowData.data.companyCode === "1550"
              ? InternationalVendorsNames
              : VendorsNames;
          }}
          backgroundColor={
            props.rowData.data.status === "Incomplete"
              ? props.cellData && props.cellData.length > 0
                ? "#f5faef"
                : "#f7cdd6"
              : "#f5faef"
          }
          onUpdate={(id: string, path: string, value: any) => {
            if (value === "") {
              handleCellUpdate(id, "data.status", "Incomplete");
            }
            if (typeof value === "object") {
              handleCellUpdate(id, "data.status", "New");
              handleCellUpdate(id, path, value.hersteller);
              toast(
                <Toast
                  title={"Vendor name was changed!"}
                  message={
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          "Vendor name was changed from <b>" +
                          props.rowData.data.vendorName +
                          "</b> to <b>" +
                          value.manufacturerName +
                          "</b> Please check the vendor number and the vendor name.",
                      }}
                    />
                  }
                  type={"warning"}
                />
              );
              handleCellUpdate(id, "data.vendorName", value.manufacturerName);

              handleCellUpdate(id, "data.debitorNumber", value.debitorischer);
            } else {
              handleCellUpdate(id, path, "");
              handleCellUpdate(id, "data.debitorNumber", "");
            }
          }}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.vendorName",
      dataKey: "data.vendorName",
      group: "Project Information",

      title: "Vendor Name",
      width: columnWidth("data.vendorName", 200),
      resizable: true,
      hidden: visibilityController("projectInformation", "data.vendorName"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          readonly={true}
          loadOptions={loadOptions}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.debitorNumber",
      dataKey: "data.debitorNumber",
      title: "SAP Debitor Number",
      group: "Project Information",

      width: columnWidth("data.debitorNumber", 200),
      resizable: true,
      hidden: visibilityController("projectInformation", "data.debitorNumber"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={
            props.rowData.data.status !== "Incomplete" ||
            !(
              userRoles.includes("Administrator") ||
              userRoles.includes("Accounting")
            )
          }
          backgroundColor={
            props.rowData.data.status === "Incomplete"
              ? props.cellData && props.cellData.length > 0
                ? "#f5faef"
                : "#f7cdd6"
              : "#f5faef"
          }
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    // {
    //   key: "data.creditorNumber",
    //   dataKey: "data.creditorNumber",
    //   group: "Project Information",

    //   title: "SAP Creditor Number",
    //   width: columnWidth("data.creditorNumber", 200),
    //   resizable: true,
    //   hidden: visibilityController("projectInformation", "data.creditorNumber"),
    //   cellRenderer: (props: any) => (
    //     <EditableTableCell
    //       type={"text"}
    //       readonly={props.rowData.data.status !== "Incomplete"}
    //       backgroundColor={
    //         props.rowData.data.status === "Incomplete"
    //           ? props.cellData && props.cellData.length > 0
    //             ? "#f5faef"
    //             : "#f7cdd6"
    //           : "#f5faef"
    //       }
    //       onUpdate={handleCellUpdate}
    //       rowIndex={props.rowIndex}
    //       columnKey={props.column.dataKey}
    //       rowData={props.rowData}
    //       initialValue={props.cellData}
    //     />
    //   ),
    // },
    {
      key: "data.budgetSource",
      dataKey: "data.budgetSource",
      title: "Budget Source",
      width: columnWidth("data.budgetSource", 200),
      resizable: true,
      group: "Project Information",

      hidden: visibilityController("projectInformation", "data.budgetSource"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          readonly={true}
          loadOptions={loadOptions}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.vendorBudgetCurrency",
      dataKey: "data.vendorBudgetCurrency",
      title: "Vendor Budget Currency",
      width: columnWidth("data.vendorBudgetCurrency", 200),
      group: "Project Information",

      resizable: true,
      hidden: visibilityController(
        "projectInformation",
        "data.vendorBudgetCurrency"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          readonly={true}
          loadOptions={loadOptions}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.vendorAmount",
      dataKey: "data.vendorAmount",
      group: "Project Information",

      title: "Vendor Amount",
      type: "number",
      width: columnWidth("data.vendorAmount", 200),
      resizable: true,
      hidden: visibilityController("projectInformation", "data.vendorAmount"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.campaignCurrency",
      dataKey: "data.campaignCurrency",
      title: "Campaign Currency",
      width: columnWidth("data.campaignCurrency", 200),
      group: "Project Information",

      resizable: true,
      hidden: visibilityController(
        "projectInformation",
        "data.campaignCurrency"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          readonly={true}
          loadOptions={loadOptions}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.estimatedIncomeCC",
      group: "Project Information",

      dataKey: "data.estimatedIncomeCC",
      title: "Estimated Income (Campaign Currency)",
      type: "number",
      width: columnWidth("data.estimatedIncomeCC", 200),
      resizable: true,
      hidden: visibilityController(
        "projectInformation",
        "data.estimatedIncomeCC"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.estimatedCostsCC",
      group: "Project Information",

      dataKey: "data.estimatedCostsCC",
      title: "Estimated Costs (Campaign Currency)",
      type: "number",
      width: columnWidth("data.estimatedCostsCC", 200),
      resizable: true,
      hidden: visibilityController(
        "projectInformation",
        "data.estimatedCostsCC"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    //
    {
      key: "data.estimatedResultCC",
      dataKey: "data.estimatedResultCC",
      title: "Estimated Result (Campaign Currency)",
      type: "number",
      group: "Project Information",

      width: columnWidth("data.estimatedResultCC", 200),
      resizable: true,
      hidden: visibilityController(
        "projectInformation",
        "data.estimatedResultCC"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.estimatedIncomeEUR",
      dataKey: "data.estimatedIncomeEUR",
      title: "Estimated Income EUR",
      group: "Project Information",
      type: "number",
      width: columnWidth("data.estimatedIncomeEUR", 200),
      resizable: true,
      hidden: visibilityController(
        "projectInformation",
        "data.estimatedIncomeEUR"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.estimatedCostsEUR",
      dataKey: "data.estimatedCostsEUR",
      title: "Estimated Costs EUR",
      group: "Project Information",
      type: "number",
      width: columnWidth("data.estimatedCostsEUR", 200),
      resizable: true,
      hidden: visibilityController(
        "projectInformation",
        "data.estimatedCostsEUR"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.estimatedResultEUR",
      dataKey: "data.estimatedResultEUR",
      title: "Estimated Result EUR",
      width: columnWidth("data.estimatedResultEUR", 200),
      group: "Project Information",
      type: "number",
      resizable: true,
      hidden: visibilityController(
        "projectInformation",
        "data.estimatedResultEUR"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.vendorShare",
      dataKey: "data.vendorShare",
      title: "% Vendor Share",
      group: "Project Information",
      type: "number",
      width: columnWidth("data.vendorShare", 200),
      resizable: true,
      hidden: visibilityController("projectInformation", "data.vendorShare"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.businessUnit",
      dataKey: "data.businessUnit",
      group: "Project Information",
      type: "text",
      title: "Business Unit",
      width: columnWidth("data.businessUnit", 200),
      resizable: true,
      hidden: visibilityController("projectInformation", "data.businessUnit"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.PH1",
      dataKey: "data.PH1",
      title: "PH1",
      width: columnWidth("data.PH1", 200),
      group: "Project Information",

      resizable: true,
      hidden: true, //visibilityController("projectInformation", "data.PH1"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.campaignChannel",
      dataKey: "data.campaignChannel",
      title: "Campaign Channel",
      width: columnWidth("data.campaignChannel", 200),
      resizable: true,
      group: "Project Information",

      hidden: visibilityController(
        "projectInformation",
        "data.campaignChannel"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.targetAudience",
      dataKey: "data.targetAudience",
      title: "Target Audience",
      group: "Project Information",

      width: columnWidth("data.targetAudience", 200),
      resizable: true,
      hidden: true,
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.marketingResponsible",
      group: "Project Information",
      dataKey: "data.marketingResponsible",
      title: "Marketing Responsible",
      width: columnWidth("data.marketingResponsible", 200),
      resizable: true,
      hidden: true,
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.projectApprover",
      dataKey: "data.projectApprover",
      group: "Project Information",
      title: "Project Approver",
      width: columnWidth("data.projectApprover", 200),
      resizable: true,
      hidden: true,
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.additionalInformation",
      dataKey: "data.additionalInformation",
      title: "Additional Information",
      group: "Project Information",

      width: columnWidth("data.additionalInformation", 200),
      resizable: true,
      hidden: visibilityController(
        "projectInformation",
        "data.additionalInformation"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.purchaseOrderServiceProvider",
      dataKey: "data.purchaseOrderServiceProvider",
      title: "Purchase Order Service Provider",
      group: "Purchase Order",
      type: "text",
      header: "Purchase Order",
      width: columnWidth("data.purchaseOrderServiceProvider", 200),
      resizable: true,
      hidden: visibilityController(
        "purchaseOrder",
        "data.purchaseOrderServiceProvider"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#fff7f1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.vendorNamePO",
      dataKey: "data.vendorNamePO",
      title: "Vendor Name",
      group: "Purchase Order",

      width: columnWidth("data.vendorNamePO", 200),
      resizable: true,
      hidden: visibilityController("purchaseOrder", "data.vendorNamePO"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"multiple-dropdown"}
          readonly={true}
          backgroundColor="#fff7f1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.netValueOfServiceOrderedLC",
      dataKey: "data.netValueOfServiceOrderedLC",
      group: "Purchase Order",
      type: "number",
      title: "Net Value of Service Ordered (LC)",
      width: columnWidth("data.netValueOfServiceOrderedLC", 200),
      resizable: true,
      hidden: visibilityController(
        "purchaseOrder",
        "data.netValueOfServiceOrderedLC"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#fff7f1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.localCurrency",
      dataKey: "data.localCurrency",
      title: "Local Currency",
      group: "Purchase Order",

      width: columnWidth("data.localCurrency", 200),
      resizable: true,
      hidden: visibilityController("purchaseOrder", "data.localCurrency"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#fff7f1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.netValuePOC",
      dataKey: "data.netValuePOC",
      title: "Net Value (Purchase Order Currency)",
      width: columnWidth("data.netValuePOC", 200),
      group: "Purchase Order",
      type: "number",
      resizable: true,
      hidden: visibilityController("purchaseOrder", "data.netValuePOC"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#fff7f1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.purchaseOrderCurrency",
      dataKey: "data.purchaseOrderCurrency",
      title: "Purchase Order Currency",
      width: columnWidth("data.purchaseOrderCurrency", 200),
      group: "Purchase Order",

      resizable: true,
      hidden: visibilityController(
        "purchaseOrder",
        "data.purchaseOrderCurrency"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#fff7f1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.netValueEur",
      dataKey: "data.netValueEur",
      title: "Net Value (EUR)",
      width: columnWidth("data.netValueEur", 200),
      group: "Purchase Order",
      type: "number",
      resizable: true,
      hidden: visibilityController("purchaseOrder", "data.netValueEur"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#fff7f1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.purchaseOrderStatus",
      dataKey: "data.purchaseOrderStatus",
      title: "Purchase Order Status",
      group: "Purchase Order",
      type: "dropdown",
      width: columnWidth("data.purchaseOrderStatus", 200),
      resizable: true,
      hidden: visibilityController("purchaseOrder", "data.purchaseOrderStatus"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          readonly={
            props.rowData.data.projectType !== "Purchase Order" &&
            (!userRoles.includes("Accounting") ||
              !userRoles.includes("Administrator"))
          }
          loadOptions={loadOptions}
          backgroundColor="#fff7f1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.yearMonth",
      dataKey: "data.yearMonth",
      title: "Year / Month",
      header: "Cost Invoices",
      group: "Cost Invoices",

      width: columnWidth("data.yearMonth", 200),
      resizable: true,
      hidden: visibilityController("costInvoices", "data.yearMonth"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.documentType",
      dataKey: "data.documentType",
      title: "Document Type",
      width: columnWidth("data.documentType", 200),
      group: "Cost Invoices",
      type: "text",
      resizable: true,
      hidden: visibilityController("costInvoices", "data.documentType"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.postingDate",
      dataKey: "data.postingDate",
      title: "Posting Date",
      width: columnWidth("data.postingDate", 200),
      group: "Cost Invoices",
      type: "date",
      resizable: true,
      hidden: visibilityController("costInvoices", "data.postingDate"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"date"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.documentDate",
      dataKey: "data.documentDate",
      title: "Document Date",
      group: "Cost Invoices",
      type: "date",
      width: columnWidth("data.documentDate", 200),
      resizable: true,
      hidden: visibilityController("costInvoices", "data.documentDate"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"date"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.documentNumber",
      dataKey: "data.documentNumber",
      title: "Document Number",
      width: columnWidth("data.documentNumber", 200),
      resizable: true,
      group: "Cost Invoices",
      type: "text",
      hidden: visibilityController("costInvoices", "data.documentNumber"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.invoiceNumber",
      dataKey: "data.invoiceNumber",
      title: "Invoice Number",
      width: columnWidth("data.invoiceNumber", 200),
      group: "Cost Invoices",
      type: "text",
      resizable: true,
      hidden: visibilityController("costInvoices", "data.invoiceNumber"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={props.rowData.data.budgetSource === "No budget"}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.costAccount",
      dataKey: "data.costAccount",
      title: "Cost Account",
      width: columnWidth("data.costAccount", 200),
      resizable: true,
      group: "Cost Invoices",
      type: "text",
      hidden: visibilityController("costInvoices", "data.costAccount"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.name1",
      dataKey: "data.name1",
      title: "Invoice Supplier",
      width: columnWidth("data.name1", 200),
      group: "Cost Invoices",
      type: "text",
      resizable: true,
      hidden: visibilityController("costInvoices", "data.name1"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.costAmountLC",
      dataKey: "data.costAmountLC",
      title: "Cost Amount (LC)",
      width: columnWidth("data.costAmountLC", 200),
      group: "Cost Invoices",
      type: "number",
      resizable: true,
      hidden: visibilityController("costInvoices", "data.costAmountLC"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#f2fcfc"
          bold={props.rowData.parentId === null}
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(totalCostAmountLC)}`
              : props.cellData
          }
        />
      ),
    },
    {
      key: "data.costAmountDC",
      dataKey: "data.costAmountDC",
      title: "Cost Amount (DC)",
      group: "Cost Invoices",
      type: "number",
      width: columnWidth("data.costAmountDC", 200),
      resizable: true,
      hidden: visibilityController("costInvoices", "data.costAmountDC"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.dc",
      dataKey: "data.dc",
      title: "DC",
      width: columnWidth("data.dc", 200),
      resizable: true,
      group: "Cost Invoices",
      type: "text",
      hidden: visibilityController("costInvoices", "data.dc"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.costAmountEUR",
      dataKey: "data.cosTotal Loss (EUR)AmountEUR",
      title: "Cost Amount (EUR)",
      width: columnWidth("data.costAmountEUR", 200),
      resizable: true,
      group: "Cost Invoices",
      type: "number",
      hidden: visibilityController("costInvoices", "data.costAmountEUR"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          backgroundColor="#f2fcfc"
          readonly={true}
          bold={props.rowData.parentId === null}
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(totalCostAmount)}`
              : props.cellData
          }
        />
      ),
    },
    {
      key: "data.costStatus",
      dataKey: "data.costStatus",
      title: "Cost Status",
      width: columnWidth("data.costStatus", 200),
      resizable: true,
      group: "Cost Invoices",
      type: "dropdown",
      hidden: visibilityController("costInvoices", "data.costStatus"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          loadOptions={loadOptions}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.yearMonthSI",
      dataKey: "data.yearMonthSI",
      title: "Year / Month",
      width: columnWidth("data.yearMonthSI", 200),
      group: "Sales Invoices",
      type: "text",
      header: "Sales Invoices",
      resizable: true,
      hidden: visibilityController("salesInvoices", "data.yearMonthSI"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#fff7f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.documentTypeSI",
      dataKey: "data.documentTypeSI",
      title: "Document Type",
      width: columnWidth("data.documentTypeSI", 200),
      group: "Sales Invoices",
      type: "text",
      resizable: true,
      hidden: visibilityController("salesInvoices", "data.documentTypeSI"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#fff7f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.postingDateSI",
      dataKey: "data.postingDateSI",
      title: "Posting Date",
      width: columnWidth("data.postingDateSI", 200),
      group: "Sales Invoices",
      type: "date",
      resizable: true,
      hidden: visibilityController("salesInvoices", "data.postingDateSI"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"date"}
          readonly={true}
          backgroundColor="#fff7f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.documentDateSI",
      dataKey: "data.documentDateSI",
      title: "Document Date",
      group: "Sales Invoices",
      type: "date",
      width: columnWidth("data.documentDateSI", 200),
      resizable: true,
      hidden: visibilityController("salesInvoices", "data.documentDateSI"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"date"}
          readonly={true}
          backgroundColor="#fff7f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.documentNumberSI",
      group: "Sales Invoices",
      dataKey: "data.documentNumberSI",
      title: "Document Number",
      type: "text",
      width: columnWidth("data.documentNumberSI", 200),
      resizable: true,
      hidden: visibilityController("salesInvoices", "data.documentNumberSI"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#fff7f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.invoiceNumberSI",
      dataKey: "data.invoiceNumberSI",
      group: "Sales Invoices",
      type: "text",
      title: "Invoice Number",
      width: columnWidth("data.invoiceNumberSI", 200),
      resizable: true,
      hidden: visibilityController("salesInvoices", "data.invoiceNumberSI"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={props.rowData.data.budgetSource === "No budget"}
          backgroundColor="#fff7f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.incomeAccountSI",
      dataKey: "data.incomeAccountSI",
      title: "Income Account",
      width: columnWidth("data.incomeAccountSI", 200),
      group: "Sales Invoices",
      type: "text",
      resizable: true,
      hidden: visibilityController("salesInvoices", "data.incomeAccountSI"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#fff7f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.name1SI",
      dataKey: "data.name1SI",
      title: "Invoice Recipient",
      group: "Sales Invoices",
      type: "text",
      width: columnWidth("data.name1SI", 200),
      resizable: true,
      hidden: visibilityController("salesInvoices", "data.name1SI"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#fff7f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.sapNumberSI",
      dataKey: "data.sapNumberSI",
      title: "Invoice Recipient Number",
      group: "Sales Invoices",
      type: "text",
      width: columnWidth("data.sapNumberSI", 200),
      resizable: true,
      hidden: visibilityController("salesInvoices", "data.sapNumberSI"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#fff7f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },

    {
      key: "data.incomeAmountLCSI",
      dataKey: "data.incomeAmountLCSI",
      title: "Income Amount (LC)",
      group: "Sales Invoices",
      type: "number",
      width: columnWidth("data.incomeAmountLCSI", 200),
      resizable: true,
      hidden: visibilityController("salesInvoices", "data.incomeAmountLCSI"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#fff7f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(totalIncomeAmountLC)}`
              : props.cellData
          }
        />
      ),
    },
    {
      key: "data.incomeAmountDCSI",
      dataKey: "data.incomeAmountDCSI",
      title: "Income Amount (DC)",
      group: "Sales Invoices",
      type: "number",
      width: columnWidth("data.incomeAmountDCSI", 200),
      resizable: true,
      hidden: visibilityController("salesInvoices", "data.incomeAmountDCSI"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#fff7f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.dcSI",
      dataKey: "data.dcSI",
      title: "DC",
      width: columnWidth("data.dcSI", 200),
      resizable: true,
      group: "Sales Invoices",
      type: "text",
      hidden: visibilityController("salesInvoices", "data.dcSI"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#fff7f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.incomeAmountEURSI",
      dataKey: "data.incomeAmountEURSI",
      title: "Income Amount (EUR)",
      width: columnWidth("data.incomeAmountEURSI", 200),
      group: "Sales Invoices",
      type: "number",
      resizable: true,
      hidden: visibilityController("salesInvoices", "data.incomeAmountEURSI"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#fff7f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(totalIncomeAmount)}`
              : props.cellData
          }
        />
      ),
    },
    {
      key: "data.invoiceStatusSI",
      dataKey: "data.invoiceStatusSI",
      title: "Invoice Status (Paid/Not Paid)",
      width: columnWidth("data.invoiceStatusSI", 200),
      group: "Sales Invoices",
      type: "dropdown",
      resizable: true,
      hidden: visibilityController("salesInvoices", "data.invoiceStatusSI"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          readonly={userRoles.includes("Administrator") ? false : true}
          loadOptions={loadOptions}
          backgroundColor="#fff7f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.activityIdSI",
      group: "Sales Invoices",
      dataKey: "data.activityIdSI",
      title: "Activity ID for Portal Vendors",
      width: columnWidth("data.activityIdSI", 200),
      resizable: true,
      type: "text",
      hidden: visibilityController("salesInvoices", "data.activityIdSI"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#fff7f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.additionalMarketingInformation",
      group: "Sales Invoices",
      dataKey: "data.additionalMarketingInformation",
      title: "Additional Marketing Information",
      type: "text",
      width: columnWidth("data.additionalMarketingInformation", 200),
      resizable: true,
      hidden: visibilityController(
        "salesInvoices",
        "data.additionalMarketingInformation"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#fff7f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.yearMonthCostGL",
      dataKey: "data.yearMonthCostGL",
      title: "Year / Month",
      header: "Cost GL Postings",
      group: "Cost GL Postings",
      type: "text",
      width: columnWidth("data.yearMonthCostGL", 200),
      resizable: true,
      hidden: visibilityController("costGlPostings", "data.yearMonthCostGL"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.documentTypeCostGL",
      dataKey: "data.documentTypeCostGL",
      group: "Cost GL Postings",
      type: "text",
      title: "Document Type",
      width: columnWidth("data.documentTypeCostGL", 200),
      resizable: true,
      hidden: visibilityController("costGlPostings", "data.documentTypeCostGL"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.postingDateCostGL",
      group: "Cost GL Postings",
      type: "date",
      dataKey: "data.postingDateCostGL",
      title: "Posting Date",
      width: columnWidth("data.postingDateCostGL", 200),
      resizable: true,
      hidden: visibilityController("costGlPostings", "data.postingDateCostGL"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"date"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.documentDateCostGL",
      dataKey: "data.documentDateCostGL",
      title: "Document Date",
      width: columnWidth("data.documentDateCostGL", 200),
      group: "Cost GL Postings",
      type: "date",
      resizable: true,
      hidden: visibilityController("costGlPostings", "data.documentDateCostGL"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"date"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.documentNumberCostGL",
      dataKey: "data.documentNumberCostGL",
      title: "Document Number",
      width: columnWidth("data.documentNumberCostGL", 200),
      group: "Cost GL Postings",
      type: "text",
      resizable: true,
      hidden: visibilityController(
        "costGlPostings",
        "data.documentNumberCostGL"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.textCostGL",
      dataKey: "data.textCostGL",
      title: "Text",
      width: columnWidth("data.textCostGL", 200),
      group: "Cost GL Postings",
      type: "text",
      resizable: true,
      hidden: visibilityController("costGlPostings", "data.textCostGL"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.costAccountCostGL",
      dataKey: "data.costAccountCostGL",
      title: "Cost Account",
      group: "Cost GL Postings",
      type: "text",
      width: columnWidth("data.costAccountCostGL", 200),
      resizable: true,
      hidden: visibilityController("costGlPostings", "data.costAccountCostGL"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.costAmountLCCostGL",
      dataKey: "data.costAmountLCCostGL",
      title: "Cost Amount (LC)",
      width: columnWidth("data.costAmountLCCostGL", 200),
      group: "Cost GL Postings",
      type: "number",
      resizable: true,
      hidden: visibilityController("costGlPostings", "data.costAmountLCCostGL"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(totalCostAmountLCCostGL)}`
              : props.cellData
          }
        />
      ),
    },
    {
      key: "data.costAmountDCCostGL",
      dataKey: "data.costAmountDCCostGL",
      title: "Cost Amount (DC)",
      width: columnWidth("data.costAmountDCCostGL", 200),
      group: "Cost GL Postings",
      type: "number",
      resizable: true,
      hidden: visibilityController("costGlPostings", "data.costAmountDCCostGL"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.dcCostGL",
      dataKey: "data.dcCostGL",
      title: "DC",
      group: "Cost GL Postings",
      type: "text",
      width: columnWidth("data.dcCostGL", 200),
      resizable: true,
      hidden: visibilityController("costGlPostings", "data.dcCostGL"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.costAmountEURCostGL",
      dataKey: "data.costAmountEURCostGL",
      title: "Cost Amount (EUR)",
      width: columnWidth("data.costAmountEURCostGL", 200),
      group: "Cost GL Postings",
      type: "number",
      resizable: true,
      hidden: visibilityController(
        "costGlPostings",
        "data.costAmountEURCostGL"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(totalCostAmountCostGL)}`
              : props.cellData
          }
        />
      ),
    },
    {
      key: "data.yearMonthIncomeGL",
      dataKey: "data.yearMonthIncomeGL",
      title: "Year / Month",
      width: columnWidth("data.yearMonthIncomeGL", 200),
      group: "Income GL Postings",
      type: "text",
      header: "Income GL Postings",
      resizable: true,
      hidden: visibilityController(
        "incomeGlPostings",
        "data.yearMonthIncomeGL"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#FFF7F1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.documentTypeIncomeGL",
      dataKey: "data.documentTypeIncomeGL",
      title: "Document Type",
      group: "Income GL Postings",
      type: "text",
      width: columnWidth("data.documentTypeIncomeGL", 200),
      resizable: true,
      hidden: visibilityController(
        "incomeGlPostings",
        "data.documentTypeIncomeGL"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#FFF7F1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.postingDateIncomeGL",
      dataKey: "data.postingDateIncomeGL",
      title: "Posting Date",
      group: "Income GL Postings",
      type: "date",
      width: columnWidth("data.postingDateIncomeGL", 200),
      resizable: true,
      hidden: visibilityController(
        "incomeGlPostings",
        "data.postingDateIncomeGL"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"date"}
          readonly={true}
          backgroundColor="#FFF7F1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.documentDateIncomeGL",
      dataKey: "data.documentDateIncomeGL",
      title: "Document Date",
      group: "Income GL Postings",
      type: "date",
      width: columnWidth("data.documentDateIncomeGL", 200),
      resizable: true,
      hidden: visibilityController(
        "incomeGlPostings",
        "data.documentDateIncomeGL"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"date"}
          readonly={true}
          backgroundColor="#FFF7F1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.documentNumberIncomeGL",
      dataKey: "data.documentNumberIncomeGL",
      group: "Income GL Postings",
      type: "text",
      title: "Document Number",
      width: columnWidth("data.documentNumberIncomeGL", 200),
      resizable: true,
      hidden: visibilityController(
        "incomeGlPostings",
        "data.documentNumberIncomeGL"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#FFF7F1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.textIncomeGL",
      dataKey: "data.textIncomeGL",
      group: "Income GL Postings",
      type: "text",
      title: "Text",
      width: columnWidth("data.textIncomeGL", 200),
      resizable: true,
      hidden: visibilityController("incomeGlPostings", "data.textIncomeGL"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#FFF7F1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.incomeAccountIncomeGL",
      dataKey: "data.incomeAccountIncomeGL",
      group: "Income GL Postings",
      type: "text",
      title: "Income Account",
      width: columnWidth("data.incomeAccountIncomeGL", 200),
      resizable: true,
      hidden: visibilityController(
        "incomeGlPostings",
        "data.incomeAccountIncomeGL"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#FFF7F1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.incomeAmountLCIncomeGL",
      dataKey: "data.incomeAmountLCIncomeGL",
      title: "Income Amount (LC)",
      width: columnWidth("data.incomeAmountLCIncomeGL", 200),
      resizable: true,
      group: "Income GL Postings",
      type: "number",
      hidden: visibilityController(
        "incomeGlPostings",
        "data.incomeAmountLCIncomeGL"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#FFF7F1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(totalIncomeAmountLCIncomeGL)}`
              : props.cellData
          }
        />
      ),
    },
    {
      key: "data.incomeAmountDCIncomeGL",
      dataKey: "data.incomeAmountDCIncomeGL",
      title: "Income Amount (DC)",
      group: "Income GL Postings",
      type: "number",
      width: columnWidth("data.incomeAmountDCIncomeGL", 200),
      resizable: true,
      hidden: visibilityController(
        "incomeGlPostings",
        "data.incomeAmountDCIncomeGL"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          backgroundColor="#FFF7F1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.dcIncomeGL",
      dataKey: "data.dcIncomeGL",
      title: "DC",
      group: "Income GL Postings",
      type: "text",
      width: columnWidth("data.dcIncomeGL", 200),
      resizable: true,
      hidden: visibilityController("incomeGlPostings", "data.dcIncomeGL"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#FFF7F1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.incomeAmountEurIncomeGL",
      dataKey: "data.incomeAmountEurIncomeGL",
      group: "Income GL Postings",
      type: "number",
      title: "Income Amount (EUR)",
      width: columnWidth("data.incomeAmountEurIncomeGL", 200),
      resizable: true,
      hidden: visibilityController(
        "incomeGlPostings",
        "data.incomeAmountEurIncomeGL"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#FFF7F1"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(totalIncomeAmountIncomeGL)}`
              : props.cellData
          }
        />
      ),
    },
    //
    {
      key: "data.totalIncomeLC",
      dataKey: "data.totalIncomeLC",
      title: "Total Income (LC)",
      header: "Project Results",
      width: columnWidth("data.totalIncomeLC", 200),
      resizable: true,
      group: "Project Results",
      type: "number",
      hidden: visibilityController("projectResults", "data.totalIncomeLC"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#f9f8f8"
          onUpdate={() => {}}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(totalIncomeInTool)}`
              : props.cellData
          }
        />
      ),
    },
    {
      key: "data.totalCostsLC",
      dataKey: "data.totalCostsLC",
      title: "Total Costs (LC)",
      width: columnWidth("data.totalCostsLC", 200),
      resizable: true,
      group: "Project Results",
      type: "number",
      hidden: visibilityController("projectResults", "data.totalCostsLC"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#f9f8f8"
          onUpdate={() => {}}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(totalCostsInTool)}`
              : props.cellData
          }
        />
      ),
    },
    {
      key: "data.totalProfitLC",
      dataKey: "data.totalProfitLC",
      title: "Total Profit (LC)",
      width: columnWidth("data.totalProfitLC", 200),
      resizable: true,
      group: "Project Results",
      type: "number",
      hidden: visibilityController("projectResults", "data.totalProfitLC"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#f9f8f8"
          onUpdate={() => {}}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(totalProfitInToolLC)}`
              : props.rowData.data.totalIncomeLC +
                  props.rowData.data.totalCostsLC >=
                0
              ? props.rowData.data.totalIncomeLC +
                props.rowData.data.totalCostsLC
              : ""
          }
        />
      ),
    },
    {
      key: "data.totalLossLC",
      dataKey: "data.totalLossLC",
      title: "Total Loss (LC)",
      width: columnWidth("data.totalLossLC", 200),
      resizable: true,
      group: "Project Results",
      type: "number",
      hidden: visibilityController("projectResults", "data.totalLossLC"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#f9f8f8"
          onUpdate={() => {}}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(totalLossInToolLC * -1)}`
              : props.rowData.data.totalIncomeLC +
                  props.rowData.data.totalCostsLC <
                0
              ? (props.rowData.data.totalIncomeLC +
                  props.rowData.data.totalCostsLC) *
                -1
              : ""
          }
        />
      ),
    },

    {
      key: "data.totalIncomeEUR",
      dataKey: "data.totalIncomeEUR",
      title: "Total Income (EUR)",
      width: columnWidth("data.totalIncomeEUR", 200),
      resizable: true,
      group: "Project Results",
      type: "number",
      hidden: visibilityController("projectResults", "data.totalIncomeEUR"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#f9f8f8"
          onUpdate={() => {}}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(totalIncomeInToolEUR)}`
              : props.cellData
          }
        />
      ),
    },
    {
      key: "data.totalCostsEUR",
      dataKey: "data.totalCostsEUR",
      title: "Total Costs (EUR)",
      width: columnWidth("data.totalCostsEUR", 200),
      resizable: true,
      group: "Project Results",
      type: "number",
      hidden: visibilityController("projectResults", "data.totalCostsEUR"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#f9f8f8"
          onUpdate={() => {}}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(totalCostsInToolEUR)}`
              : props.cellData
          }
        />
      ),
    },
    {
      key: "data.totalProfitEUR",
      dataKey: "data.totalProfitEUR",
      title: "Total Profit (EUR)",
      width: columnWidth("data.totalProfitEUR", 200),
      resizable: true,
      group: "Project Results",
      type: "number",
      hidden: visibilityController("projectResults", "data.totalProfitEUR"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#f9f8f8"
          onUpdate={() => {}}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            totalIncomeInToolEUR + totalCostsInToolEUR >= 0
              ? props.rowData.id === "total"
                ? `TOTAL: ${NumberWithCommas(totalProfitInToolEUR)}`
                : props.rowData.data.totalIncomeEUR +
                    props.rowData.data.totalCostsEUR >=
                  0
                ? props.rowData.data.totalIncomeEUR +
                  props.rowData.data.totalCostsEUR
                : ""
              : ""
          }
        />
      ),
    },
    {
      key: "data.totalLossEUR",
      dataKey: "data.totalLossEUR",
      title: "Total Loss (EUR)",
      width: columnWidth("data.totalLossEUR", 200),
      resizable: true,
      group: "Project Results",
      type: "number",
      hidden: visibilityController("projectResults", "data.totalLossEUR"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#f9f8f8"
          onUpdate={() => {}}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(totalLossInToolEUR * -1)}`
              : props.rowData.data.totalIncomeEUR +
                  props.rowData.data.totalCostsEUR <
                0
              ? (props.rowData.data.totalIncomeEUR +
                  props.rowData.data.totalCostsEUR) *
                -1
              : ""
          }
        />
      ),
    },

    ///
    {
      key: "data.totalCostsTool",
      dataKey: "data.totalCostsTool",
      title: "Total Costs In Tool (LC)",
      width: columnWidth("data.totalCostsTool", 200),
      resizable: true,
      header: "Control Checks",
      group: "Control Checks",
      type: "number",
      hidden: visibilityController("controlChecks", "data.totalCostsTool"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#f9f8f8"
          onUpdate={() => {}}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(
                  totalCostAmountLC + totalCostAmountLCCostGL
                )}`
              : props.cellData
          }
        />
      ),
    },
    {
      key: "data.totalCostsSAP",
      dataKey: "data.totalCostsSAP",
      title: "Total Costs In SAP (LC)",
      width: columnWidth("data.totalCostsSAP", 200),
      resizable: true,
      group: "Control Checks",
      type: "number",
      hidden: visibilityController("controlChecks", "data.totalCostsSAP"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#f9f8f8"
          onUpdate={() => {}}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(
                  totalCostAmountLC + totalCostAmountLCCostGL
                )}`
              : props.rowData.data.totalCostsTool
          }
        />
      ),
    },
    {
      key: "data.totalIncomeTool",
      dataKey: "data.totalIncomeTool",
      title: "Total Income In Tool (LC)",
      width: columnWidth("data.totalIncomeTool", 200),
      resizable: true,
      group: "Control Checks",
      type: "number",
      hidden: visibilityController("controlChecks", "data.totalIncomeTool"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#f9f8f8"
          onUpdate={() => {}}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(
                  totalIncomeAmountLC + totalIncomeAmountLCIncomeGL
                )}`
              : props.cellData
          }
        />
      ),
    },
    {
      key: "data.totalIncomeSAP",
      dataKey: "data.totalIncomeSAP",
      title: "Total Income In SAP (LC)",
      width: columnWidth("data.totalIncomeSAP", 200),
      resizable: true,
      group: "Control Checks",
      type: "number",
      hidden: visibilityController("controlChecks", "data.totalIncomeSAP"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          readonly={true}
          bold={props.rowData.parentId === null}
          backgroundColor="#f9f8f8"
          onUpdate={() => {}}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${NumberWithCommas(
                  totalIncomeAmountLC + totalIncomeAmountLCIncomeGL
                )}`
              : props.rowData.data.totalIncomeTool
          }
        />
      ),
    },
    ///

    {
      key: "__actions.sap",
      dataKey: "__actions.sap",
      title: "SAP",
      width: columnWidth("__actions.sap", 100),
      resizable: true,
      header: "Actions",
      className: "red-border",
      cellRenderer: (props: any) =>
        props.rowData.parentId === null &&
        props.rowData.data.status !== "Created" &&
        props.rowData.author !== "formiks" &&
        props.rowData.id !== "total" ? (
          <EditableTableCell
            type={"button"}
            readonly={
              !(
                (userRoles.includes("Accounting") ||
                  userRoles.includes("Administrator")) &&
                props.rowData.data.status === "New"
              )
            }
            backgroundColor="#fef9fa"
            textColor={"green"}
            onUpdate={callSap}
            rowIndex={props.rowIndex}
            columnKey={props.column.dataKey}
            rowData={props.rowData}
            initialValue={"create"}
          />
        ) : (
          <div
            style={{
              backgroundColor: "#F7FAFC",
              width: "100%",
              height: "100%",
            }}
          />
        ),
    },
    {
      key: "__actions.view",
      dataKey: "__actions.view",
      title: "View",
      width: columnWidth("__actions.view", 100),
      resizable: true,
      className: "red-border",
      cellRenderer: (props: any) =>
        props.rowData.parentId === null &&
        props.rowData.viewId !== null &&
        props.rowData.author !== "formiks" &&
        props.rowData.id !== "total" ? (
          <EditableTableCell
            type={"button"}
            backgroundColor="#fef9fa"
            textColor={"yellow"}
            onUpdate={() => {
              window.open(
                "/submissions/view/" + props.rowData.viewId,
                "_blank",
                "noopener,noreferrer"
              );
            }}
            rowIndex={props.rowIndex}
            columnKey={props.column.dataKey}
            rowData={props.rowData}
            initialValue={"view"}
          />
        ) : (
          <div
            style={{
              backgroundColor: "#F7FAFC",
              width: "100%",
              height: "100%",
            }}
          />
        ),
    },
    {
      key: "__actions.viewPO",
      dataKey: "__actions.viewPO",
      title: "View purchase order",
      width: columnWidth("__actions.viewPO", 100),
      resizable: true,
      className: "red-border",
      cellRenderer: (props: any) =>
        typeof props.rowData.data.purchaseOrderServiceProvider === "string" &&
        props.rowData.viewId !== null &&
        props.rowData.author !== "formiks" &&
        props.rowData.id !== "total" ? (
          <EditableTableCell
            type={"button"}
            backgroundColor="#fef9fa"
            textColor={"yellow"}
            onUpdate={() => {
              window.open(
                "/submissions/view/" + props.rowData.viewId,
                "_blank",
                "noopener,noreferrer"
              );
            }}
            rowIndex={props.rowIndex}
            columnKey={props.column.dataKey}
            rowData={props.rowData}
            initialValue={"view"}
          />
        ) : (
          <div
            style={{
              backgroundColor: "#F7FAFC",
              width: "100%",
              height: "100%",
            }}
          />
        ),
    },
    {
      key: "__actions.reject",
      dataKey: "__actions.reject",
      title: "Reject",
      width: columnWidth("__actions.reject", 65),
      resizable: true,
      className: "red-border",
      cellRenderer: (props: any) =>
        props.rowData.parentId === null &&
        props.rowData.data.status !== "Created" &&
        props.rowData.data.status !== "Rejected" &&
        props.rowData.author !== "formiks" &&
        props.rowData.id !== "total" ? (
          <EditableTableCell
            type={"button"}
            textColor={"red"}
            readonly={
              !(
                userRoles.includes("Accounting") ||
                userRoles.includes("Administrator")
              )
            }
            backgroundColor="#fef9fa"
            onUpdate={() => {
              setRejectedSubmission(props.rowData);
            }}
            rowIndex={props.rowIndex}
            columnKey={props.column.dataKey}
            rowData={props.rowData}
            initialValue={"reject"}
          />
        ) : (
          <div
            style={{
              backgroundColor: "#F7FAFC",
              width: "100%",
              height: "100%",
            }}
          />
        ),
    },
  ];

  const headerRendererForTable = useCallback(
    (props: {
      cells: ReactNode[];
      columns: ColumnShape<{
        [k: string]: string;
      }>;
      headerIndex: number;
    }) => {
      const { headerIndex, columns, cells } = props;
      if (headerIndex === 0) {
        return cells.map((cell, index) => {
          return cloneElement(cell as ReactElement, {
            className: "BaseTable__header-cell",
            children: (
              <span style={{ fontWeight: 650 }} key={index}>
                {columns[index].header ? columns[index].header : ""}
              </span>
            ),
          });
        });
      }
      return cells;
    },
    []
  );
  // function alterGetDisplsayedColumns() {
  //   var alterDisplayedColumns = []
  //   tableCells.forEach((cell) => {
  //     if (cell.group === "General Information") {
  //   });
  // }

  return (
    <div>
      <RejectModal
        submission={rejectedSubmission}
        onClose={() => {
          setRejectedSubmission(undefined);
        }}
        onReject={(comment: string) => {
          if (rejectedSubmission !== undefined) {
            reject(
              rejectedSubmission!.id!,
              rejectedSubmission!.viewId!,
              comment
            );
            setRejectedSubmission(undefined);
          }
        }}
      />
      <RejectModal
        submission={rejectedSubmissionComm}
        onClose={() => {
          setRejectedSubmissionComm(undefined);
        }}
        onReject={(comment: string) => {
          if (rejectedSubmissionComm !== undefined) {
            handleCommunicationCellUpdate(
              rejectedSubmissionComm.id!,
              "data.statusLMD",
              "REJECTED"
            );
            var targetChildSubs: any[] = [];
            targetChildSubs = communicationSubmissions.filter(
              (s) => s.parentId === rejectedSubmissionComm.id
            );
            targetChildSubs.forEach((s) => {
              handleCommunicationCellUpdate(
                s.id!,
                "data.statusLMD",
                "REJECTED"
              );
              handleCommunicationCellUpdate(
                rejectedSubmissionComm.id!,
                "data.rejectReasonLMD",
                comment
              );
            });
            handleCommunicationCellUpdate(
              rejectedSubmissionComm.id!,
              "data.rejectReasonLMD",
              comment
            );
            setRejectedSubmissionComm(undefined);
          }
        }}
      />
      <Text key={"Text2"} mb="8px">
        Financial year
      </Text>
      <Box width={"50%"} display="flex" alignItems="center">
        <Select
          key={"select1"}
          styles={{
            control: (provided) => ({
              ...provided,
              width: "200px", // or any specific pixel value you'd prefer
            }),
          }}
          theme={(theme) => ({
            ...theme,
            borderRadius: 6,
            colors: {
              ...theme.colors,
              primary: "#3082CE",
            },
          })}
          classNamePrefix="select"
          name="color"
          isClearable={false}
          options={[
            { label: " ", value: "" },
            { label: "2021", value: "21" },
            ...Year,
          ]}
          onChange={(value: any) => {
            setFinancialYear(value.value);
          }}
          value={
            financialYear === ""
              ? { label: " ", value: "" }
              : { label: "20" + financialYear, value: financialYear }
          }
        />
        <Button
          float="right"
          height="38px"
          ml="18px"
          color={"white"}
          _hover={{
            bg: useColorModeValue("blue.300", "#377bbf"),
          }}
          bg={useColorModeValue("blue.400", "#4D97E2")}
          onClick={() => {
            setFinancialYear("");
          }}
        >
          Clear
        </Button>
      </Box>

      <Box h="70px" textAlign={"end"}>
        <IconButton
          icon={<IoSave />}
          isDisabled={
            selectedTemplate === "local"
            // currentUser.displayName === "unknown"
          }
          onClick={() => {
            var template: Template = {
              name: selectedTemplate,
              columns: displayedColumns,
              filters,
            };
            RestAPI.updateTemplate(template).then(() => {
              toast(
                <Toast
                  title={"Preset updated"}
                  message={
                    <div
                      dangerouslySetInnerHTML={{
                        __html: "Preset successfully saved",
                      }}
                    />
                  }
                  type={"success"}
                />
              );
            });
          }}
          aria-label="save"
          colorScheme="blue"
          mr="10px"
        />
        <IconButton
          icon={onlyMine ? <RiAlbumFill /> : <RiAlbumLine />}
          onClick={() => {
            setOnlyMine(!onlyMine);
          }}
          // isDisabled={currentUser.displayName === "unknown"}
          aria-label="filter"
          colorScheme="blue"
          mr="10px"
        />
        <IconButton
          icon={expanded ? <RiUserFill /> : <RiGroupFill />}
          onClick={() => {
            if (!expanded) {
              expandAllRows();
              setExpanded(true);
            } else {
              setExpandedRowKeys([]);
              setExpanded(false);
            }
          }}
          // isDisabled={currentUser.displayName === "unknown"}
          aria-label="filter"
          colorScheme="blue"
          mr="10px"
        />
        <IconButton
          onClick={async () => {
            interface FD {
              [key: string]: any;
            }
            var formattedData: FD[] = [];
            let init = false;
            let header: FD[] = [
              {
                ID: "Summary",
                Parent: "",
                Group: "",
                Created: "",
                Title: "",
                Author: "",
              },
              {
                ID: "ID",
                Parent: "Parent",
                Group: "Group",
                Created: "Created",
                Title: "Title",
                Author: "Author",
              },
              {
                ID: "",
                Parent: "",
                Group: "",
                Created: "",
                Title: "",
                Author: "",
              },
            ];
            if (tabIndex === 0) {
              let sortedSubmissions: Submission[] =
                sortAndStructureData(filteredSubmissions);
              formattedData = sortedSubmissions.map((s) => {
                let doc: FD = {
                  ID: s.id || "unknown",
                  Parent: s.parentId === null,
                  Group: s.group,
                  Created: s.created,
                  Title: s.title,
                  Author: s.author,
                };
                DisplayedColumnsList.forEach((group: any) => {
                  if (
                    group.value === "CMCT" ||
                    group.value === "LMD" ||
                    group.value === "all" ||
                    group.value === "none"
                  ) {
                    return;
                  }

                  group.children.map((column: any, index: number) => {
                    if (
                      displayedColumns.includes(column.value) ||
                      displayedColumns.includes(group.value)
                    ) {
                      doc[column.value] = _.get(s, column.value);
                      if (column.type === "date") {
                        doc[column.value] = formatDate(doc[column.value]);
                      }

                      if (column.type === "number") {
                        doc[column.value] = NumberWithCommas(doc[column.value]);
                      }
                      if (!init) {
                        header[0][column.value] =
                          index === 0 ? group.label : "";
                        header[1][column.value] = `${column.label}`;
                      }
                    }
                  });
                });
                init = true;
                return doc;
              });
              header[2] = {
                "data.costAmountLC": `TOTAL: ${NumberWithCommas(
                  totalCostAmountLC
                )}`,
                "data.costAmountEUR": `TOTAL: ${NumberWithCommas(
                  totalCostAmount
                )}`,
                "data.incomeAmountLCSI": `TOTAL: ${NumberWithCommas(
                  totalIncomeAmountLC
                )}`,
                "data.incomeAmountEURSI": `TOTAL: ${NumberWithCommas(
                  totalIncomeAmount
                )}`,
                "data.costAmountLCCostGL": `TOTAL: ${NumberWithCommas(
                  totalCostAmountLCCostGL
                )}`,
                "data.costAmountEURCostGL": `TOTAL: ${NumberWithCommas(
                  totalCostAmountCostGL
                )}`,
                "data.incomeAmountLCIncomeGL": `TOTAL: ${NumberWithCommas(
                  totalIncomeAmountLCIncomeGL
                )}`,
                "data.incomeAmountEurIncomeGL": `TOTAL: ${NumberWithCommas(
                  totalIncomeAmountIncomeGL
                )}`,
                "data.totalIncomeLC": `TOTAL: ${NumberWithCommas(
                  totalIncomeInTool
                )}`,
                "data.totalCostsLC": `TOTAL: ${NumberWithCommas(
                  totalCostsInTool
                )}`,
                "data.totalProfitLC": `TOTAL: ${NumberWithCommas(
                  totalProfitInToolLC
                )}`,
                "data.totalLossLC": `TOTAL: ${NumberWithCommas(
                  totalLossInToolLC * -1
                )}`,
                "data.totalIncomeEUR": `TOTAL: ${NumberWithCommas(
                  totalIncomeInToolEUR
                )}`,
                "data.totalCostsEUR": `TOTAL: ${NumberWithCommas(
                  totalCostsInToolEUR
                )}`,
                "data.totalProfitEUR": `TOTAL: ${NumberWithCommas(
                  totalProfitInToolEUR
                )}`,
                "data.totalLossEUR": `TOTAL: ${NumberWithCommas(
                  totalLossInToolEUR * -1
                )}`,
                "data.totalCostsTool": `TOTAL: ${NumberWithCommas(
                  totalCostAmountLC + totalCostAmountLCCostGL
                )}`,
                "data.totalCostsSAP": `TOTAL: ${NumberWithCommas(
                  totalCostAmountLC + totalCostAmountLCCostGL
                )}`,
                "data.totalIncomeTool": `TOTAL: ${NumberWithCommas(
                  totalIncomeAmountLC + totalIncomeAmountLCIncomeGL
                )}`,
                "data.totalIncomeSAP": `TOTAL: ${NumberWithCommas(
                  totalIncomeAmountLC + totalIncomeAmountLCIncomeGL
                )}`,
              };
              formattedData.unshift(...header);
              const ws = XLSX.utils.json_to_sheet(formattedData, {
                skipHeader: true,
              });
              const columnsToFormat = [
                "T",
                "U",
                "AA",
                "AC",
                "AD",
                "AE",
                "AF",
                "AG",
                "AS",
                "AW",
                "AH",
                "BG",
                "BH",
                "BJ",
                "CS",
                "CT",
                "BT",
                "BU",
                "BW",
                "CH",
                "CI",
                "CK",
                "CR",
                "CS",
                "CV",
                "CT",
                "CW",
                "CX",
                "CY",
                "CZ",
                "DA",
                "DB",
                "DC",
                "DD",
                "DE",
                "DF",
                "DH",
                "DG",
              ]; // Add more columns as needed

              for (let i = 4; i <= formattedData.length + 1; i++) {
                columnsToFormat.forEach((column) => {
                  let cellAddress = column + i;
                  if (ws[cellAddress] && !isNaN(ws[cellAddress].v)) {
                    ws[cellAddress].z = "0.00"; // Number format
                    ws[cellAddress].t = "n"; // Cell type as number
                  }
                });
              }

              ws["!cols"] = Object.keys(formattedData[0]).map(() => {
                return { wch: 30 };
              });
              const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
              const excelBuffer = XLSX.write(wb, {
                bookType: "xlsx",
                type: "array",
              });
              const data = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
              });
              FileSaver.saveAs(data, "Projects" + ".xlsx");
            } else if (tabIndex === 1) {
              formattedData = filteredCommunicationSubmissions.map((s) => {
                let doc: FD = {
                  ID: s.id || "unknown",
                  Parent: s.parentId === null,
                  Group: s.group,
                  Created: s.created,
                  Title: s.title,
                  Author: s.author,
                };
                DisplayedColumnsList.forEach((group: any) => {
                  if (group.value === "CMCT" || group.value === "LMD") {
                    group.children.map((column: any, index: number) => {
                      doc[column.value] = _.get(s, column.value);
                      if (column.type === "number") {
                        doc[column.value] = NumberWithCommas(doc[column.value]);
                      }
                      if (column.type === "date") {
                        doc[column.value] = formatDate(doc[column.value]);
                      }
                      if (!init) {
                        header[0][column.value] =
                          index === 0 ? group.label : "";
                        header[1][column.value] = `${column.label}`;
                      }
                    });
                  } else {
                    return;
                  }
                });
                init = true;
                return doc;
              });
              formattedData.unshift(...header);
              const ws = XLSX.utils.json_to_sheet(formattedData, {
                skipHeader: true,
              });
              const columnsToFormat = ["AA"]; // Add more columns as needed
              for (let i = 3; i <= formattedData.length + 1; i++) {
                columnsToFormat.forEach((column) => {
                  let cellAddress = column + i;
                  if (ws[cellAddress]) {
                    ws[cellAddress].z = "0.00"; // Number format
                    ws[cellAddress].t = "n"; // Cell type as number
                  }
                });
              }
              ws["!cols"] = Object.keys(formattedData[0]).map(() => {
                return { wch: 30 };
              });
              const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
              const excelBuffer = XLSX.write(wb, {
                bookType: "xlsx",
                type: "array",
              });
              const data = new Blob([excelBuffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
              });
              FileSaver.saveAs(data, "Invoicing" + ".xlsx");
            }
          }}
          colorScheme="teal"
          aria-label="export"
          icon={<RiFileExcel2Line />}
        ></IconButton>
      </Box>

      <Box
        w={"100%"}
        bg={useColorModeValue("white", "#5b5b5b")}
        minH={"80vh"}
        mb={5}
        mt={"-20px"}
        border="1px"
        rounded="md"
        borderColor="gray.100"
      >
        <Tabs
          isLazy={false}
          onChange={handleTabsChange}
          index={tabIndex}
          variant="enclosed"
        >
          <TabList>
            <Tab>Projects</Tab>
            <Tab>Invoicing</Tab>
          </TabList>
          <TabPanels>
            <TabPanel w="100%" h="80vh">
              <AutoResizer
                onResize={({
                  width,
                  height,
                }: {
                  width: number;
                  height: number;
                }) => {
                  setTableWidth(width);
                }}
              >
                {({ width, height }) => (
                  <BaseTable
                    key={ignored}
                    scrollLeft={scrollLeft}
                    onScroll={onScroll}
                    onColumnResizeEnd={({
                      column,
                      width,
                    }: {
                      column: any;
                      width: number;
                    }) => {
                      // handleResize(column.dataKey, width);
                    }}
                    rowRenderer={rowRenderer}
                    overscanRowCount={10}
                    expandedRowKeys={expandedRowKeys}
                    onRowExpand={handleRowClick}
                    ignoreFunctionInColumnCompare={false}
                    expandColumnKey={"__expand"}
                    width={width}
                    height={height}
                    fixed
                    columns={tableCells}
                    headerRenderer={headerRendererForTable}
                    headerClassName="header-cells"
                    frozenData={
                      [
                        {
                          id: "total",
                          data: {},
                          parentId: null,
                        },
                      ] as any[]
                    }
                    data={unflatten([...filteredSubmissions] as any[])}
                    rowKey="id"
                    headerHeight={[50, 50]}
                    rowHeight={55}
                  ></BaseTable>
                )}
              </AutoResizer>
            </TabPanel>

            <TabPanel w="100%" h="80vh">
              <AutoResizer
                onResize={({
                  width,
                  height,
                }: {
                  width: number;
                  height: number;
                }) => {
                  setTableWidth(width);
                }}
              >
                {({ width, height }) => (
                  <BaseTable
                    scrollLeft={scrollLeft}
                    onScroll={onScroll}
                    onColumnResizeEnd={({
                      column,
                      width,
                    }: {
                      column: any;
                      width: number;
                    }) => {
                      // handleResize(column.dataKey, width);
                    }}
                    rowRenderer={rowRenderer}
                    overscanRowCount={10}
                    ignoreFunctionInColumnCompare={false}
                    expandColumnKey={"__expand"}
                    width={width}
                    height={height}
                    fixed
                    columns={[
                      {
                        key: "__expand",
                        dataKey: "__expand",
                        title: "",
                        width: 50,
                        frozen: Column.FrozenDirection.LEFT,
                        resizable: false,
                        cellRenderer: (props: any) => {
                          if (props.rowData.parentId !== null) {
                            return (
                              <div
                                style={{
                                  marginTop: 0,
                                  marginLeft: 0,
                                  position: "absolute",
                                }}
                              >
                                <RiUserFill />
                              </div>
                            );
                          }

                          return <div></div>;
                        },
                        className: "expand",
                      },
                      {
                        key: "__actions.rejectComm",
                        dataKey: "__actions.rejectComm",
                        title: "Reject",
                        group: "Input of Central Marketing Controlling Team",
                        header: "Input of Central Marketing Controlling Team",
                        width: columnWidth("__actions.rejectComm", 200),
                        resizable: true,
                        className: "red-border",
                        cellRenderer: (props: any) =>
                          props.rowData.parentId === null &&
                          props.rowData.data.statusLMD ===
                            "OK FOR INVOICING" ? (
                            <EditableTableCell
                              type={"button"}
                              textColor={"red"}
                              backgroundColor="#fef9fa"
                              invoiced={(() => {
                                const isInvoiced = !(
                                  props.rowData.data.statusLMD ===
                                    "OK FOR INVOICING" &&
                                  (userRoles.includes("Accounting") ||
                                    userRoles.includes("Administrator"))
                                );
                                return isInvoiced;
                              })()}
                              onUpdate={(submissionId: string) => {
                                setRejectedSubmissionComm(props.rowData);
                              }}
                              rowIndex={props.rowIndex}
                              columnKey={props.column.dataKey}
                              rowData={props.rowData}
                              initialValue={"reject"}
                            />
                          ) : (
                            <div
                              style={{
                                backgroundColor: "#F7FAFC",
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          ),
                      },
                      {
                        key: "data.documentNumberCMCT",
                        dataKey: "data.documentNumberCMCT",
                        title: "SAP Document Number",
                        width: columnWidth("data.documentNumberCMCT", 200),
                        resizable: true,
                        hidden: visibilityController(
                          "CMCT",
                          "data.documentNumberCMCT"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"text"}
                            readonly={
                              !(
                                (userRoles.includes("Accounting") ||
                                  userRoles.includes("Administrator")) &&
                                (props.rowData.data.statusLMD ===
                                  "FUTURE INVOICE" ||
                                  props.rowData.data.statusLMD ===
                                    "OK FOR INVOICING" ||
                                  props.rowData.data.statusLMD ===
                                    "INVOICED") &&
                                props.rowData.parentId === null
                              )
                            }
                            invoiced={
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            onUpdate={(
                              submission: string,
                              path: string,
                              value: any
                            ) => {
                              if (value.length !== 12) {
                                toast(
                                  <Toast
                                    title={
                                      "SAP document number must contain 12 digits"
                                    }
                                    message={
                                      "Please enter correct SAP document number"
                                    }
                                    type={"error"}
                                  />
                                );
                              }
                              handleCommunicationCellUpdate(
                                submission,
                                "data.operatorCMCT",
                                currentUser.displayName
                              );
                              handleCommunicationCellUpdate(
                                submission,
                                "data.dateCMCT",
                                new Date().toString()
                              );
                              var targetChildSubs =
                                communicationSubmissions.filter(
                                  (s) => s.parentId === props.rowData.id
                                );
                              if (value.length === 12) {
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.statusLMD",
                                  "INVOICED"
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.rejectReasonLMD",
                                  ""
                                );
                                var targetSubmission =
                                  communicationSubmissions.find(
                                    (s) => s.id === submission
                                  );
                                targetChildSubs.forEach((s: any) => {
                                  handleCommunicationCellUpdate(
                                    s !== undefined ? s.id : "",
                                    "data.documentNumberCMCT",
                                    value
                                  );
                                  handleCommunicationCellUpdate(
                                    s !== undefined ? s.id : "",
                                    "data.statusLMD",
                                    "INVOICED"
                                  );
                                  handleCommunicationCellUpdate(
                                    s !== undefined ? s.id : "",
                                    "data.operatorCMCT",
                                    targetSubmission !== undefined
                                      ? targetSubmission.data.operatorCMCT
                                      : ""
                                  );
                                  handleCommunicationCellUpdate(
                                    s !== undefined ? s.id : "",
                                    "data.dateCMCT",
                                    targetSubmission !== undefined
                                      ? targetSubmission.data.dateCMCT
                                      : ""
                                  );
                                });
                              }

                              var mi = submissions.findIndex(
                                (s) => s.data.documentNumberSI === value
                              );
                              if (mi > -1) {
                                handleCellUpdate(
                                  submissions[mi].id!,
                                  "data.activityIdSI",
                                  props.rowData.data.activityIdForPortalVendors
                                );
                                handleCellUpdate(
                                  submissions[mi].id!,
                                  "data.additionalMarketingInformation",
                                  props.rowData.data.additionalInformationLMD
                                );
                              }
                              handleCommunicationCellUpdate(
                                submission,
                                path,
                                value
                              );
                            }}
                            backgroundColor={
                              props.cellData &&
                              props.cellData.length !== 12 &&
                              props.rowData.data.statusLMD ===
                                "OK FOR INVOICING"
                                ? "#f7cdd6"
                                : "#f9f9ff"
                            }
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.dateCMCT",
                        dataKey: "data.dateCMCT",
                        title: "Date",
                        width: columnWidth("data.dateCMCT", 200),
                        resizable: true,
                        group: "Input of Central Marketing Controlling Team",
                        hidden: visibilityController("CMCT", "data.dateCMCT"),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"date"}
                            readonly={true}
                            backgroundColor="#f9f9ff"
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.operatorCMCT",
                        dataKey: "data.operatorCMCT",
                        title: "Operator",
                        width: columnWidth("data.operatorCMCT", 200),
                        resizable: true,
                        group: "Input of Central Marketing Controlling Team",
                        hidden: visibilityController(
                          "CMCT",
                          "data.operatorCMCT"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"text"}
                            readonly={true}
                            backgroundColor="#f9f9ff"
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },

                      {
                        key: "data.rejectReasonLMD",
                        dataKey: "data.rejectReasonLMD",
                        title: "Rejection reason",
                        width: columnWidth("data.rejectReasonLMD", 200),
                        group: "Input of Central Marketing Controlling Team",
                        resizable: true,

                        hidden: visibilityController(
                          "LMD",
                          "data.rejectReasonLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"text"}
                            readonly={true}
                            backgroundColor="#f9f9ff"
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={
                              props.rowData !== undefined ? props.rowData : ""
                            }
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.statusLMD",
                        dataKey: "data.statusLMD",
                        title: "Status",
                        width: columnWidth("data.statusLMD", 250),
                        resizable: true,
                        group: "Input of Local Marketing Department",
                        header: "Input of Local Marketing Department",
                        hidden: visibilityController("LMD", "data.statusLMD"),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"dropdown"}
                            readonly={true}
                            loadOptions={loadOptions}
                            backgroundColor={
                              props.rowData.data.statusLMD === "INCOMPLETE" ||
                              props.rowData.data.statusLMD === "REJECTED"
                                ? "#f7cdd6"
                                : "#F5FAEF"
                            }
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.invoicingDateLMD",
                        dataKey: "data.invoicingDateLMD",
                        title: "Date of document",
                        width: columnWidth("data.invoicingDateLMD", 200),
                        resizable: true,
                        group: "Input of Local Marketing Department",
                        type: "date",
                        hidden: visibilityController(
                          "LMD",
                          "data.invoicingDateLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"date"}
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            readonly={
                              props.rowData.parentId !== null ||
                              cellReadonly(props)
                            }
                            backgroundColor={mandatoryFieldValidation(props)}
                            onUpdate={(
                              submission: string,
                              path: string,
                              value: any
                            ) => {
                              handleCommunicationCellUpdate(
                                submission,
                                "data.requestorLMD",
                                currentUser.displayName
                              );
                              let updatedDateValue = value;
                              if (value instanceof Date) {
                                updatedDateValue = addHoursToDate(value, 12);
                              } else if (typeof value === "string") {
                                // Create a Date object if `value` is a string, and then add 12 hours
                                const dateObj = new Date(value);
                                if (!isNaN(dateObj.getTime())) {
                                  // Check if date is valid
                                  updatedDateValue = addHoursToDate(
                                    dateObj,
                                    12
                                  );
                                }
                              }
                              handleCommunicationCellUpdate(
                                submission,
                                path,
                                updatedDateValue
                              );
                            }}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.requestorLMD",
                        dataKey: "data.requestorLMD",
                        title: "Requestor",
                        group: "Input of Local Marketing Department",

                        width: columnWidth("data.requestorLMD", 200),
                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.requestorLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"text"}
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            backgroundColor="#F5FAEF"
                            readonly={cellReadonly(props)}
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.invoiceTypeLMD",
                        dataKey: "data.invoiceTypeLMD",
                        title: "Type of document",
                        group: "Input of Local Marketing Department",

                        width: columnWidth("data.invoiceTypeLMD", 200),
                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.invoiceTypeLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"dropdown"}
                            readonly={cellReadonly(props)}
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            loadOptions={() => {
                              return [
                                {
                                  label: "Invoice",
                                  value: "Invoice",
                                },
                                { label: "Pre-Invoice", value: "Pre-Invoice" },
                                {
                                  label: "Internal Invoice",
                                  value: "Internal Invoice",
                                },
                                {
                                  label: "Cancellation",
                                  value: "Cancellation",
                                },
                              ];
                            }}
                            backgroundColor={cellColor(props)}
                            onUpdate={(
                              submission: string,
                              path: string,
                              value: any
                            ) => {
                              if (value === "Invoice") {
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.materialNumberLMD",
                                  "7000100"
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.reasonLMD",
                                  "25"
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.reasonCodeLMD",
                                  "ZWKZ"
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.cancellationInfoLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.additionalInformationLMD",
                                  ""
                                );
                                if (
                                  props.rowData.data.paymentMethodLMD ===
                                  "Central CN"
                                ) {
                                  handleCommunicationCellUpdate(
                                    submission,
                                    "data.paymentMethodLMD",
                                    ""
                                  );
                                }
                              }
                              if (value === "Pre-Invoice") {
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.materialNumberLMD",
                                  "7000100"
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.alsoMarketingProjectNumberLMD",
                                  "6110VZ01"
                                );

                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.reasonLMD",
                                  "40"
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.reasonCodeLMD",
                                  "ZWKZ"
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.cancellationInfoLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.additionalInformationLMD",
                                  ""
                                );
                                if (
                                  props.rowData.data.paymentMethodLMD ===
                                  "Central CN"
                                ) {
                                  handleCommunicationCellUpdate(
                                    submission,
                                    "data.paymentMethodLMD",
                                    ""
                                  );
                                }
                              }
                              if (value === "Internal Invoice") {
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.materialNumberLMD",
                                  "7000100"
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.reasonCodeLMD",
                                  "ZWKZ"
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.reasonLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.cancellationInfoLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.additionalInformationLMD",
                                  ""
                                );
                              }
                              if (value === "Cancellation") {
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.materialNumberLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.alsoMarketingProjectNumberLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.vendorLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.amountLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.documentCurrencyLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.referenceNumberFromVendor",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.activityIdForPortalVendors",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.additionalInformationLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.dateOfServiceRenderedLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.linkToProofsLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.sendToLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.dunningStopLMD",
                                  ""
                                );

                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.paymentMethodLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.vodLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.buLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.invoiceTextLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.reasonCodeLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.reasonLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.alsoMarketingProjectNumberLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.paymentMethodLMD",
                                  ""
                                );
                              }
                              if (props.rowData.parentId === null) {
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.statusLMD",
                                  "INCOMPLETE"
                                );
                              }
                              handleCommunicationCellUpdate(
                                submission,
                                path,
                                value
                              );
                              handleCommunicationCellUpdate(
                                submission,
                                "data.sendToLMD",
                                ""
                              );
                            }}
                            // onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.cancellationInfoLMD",
                        dataKey: "data.cancellationInfoLMD",
                        title: "Document number to be cancelled",
                        group: "Input of Local Marketing Department",

                        width: columnWidth("data.cancellationInfoLMD", 200),
                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.cancellationInfoLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            invoiced={lmdColumnEdit(props.rowData.data)}
                            type={"text"}
                            readonly={
                              cellReadonly(props) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            backgroundColor={cellColor(props)}
                            onUpdate={(
                              submission: string,
                              path: string,
                              value: any
                            ) => {
                              if (value.length !== 12) {
                                toast(
                                  <Toast
                                    title={
                                      "SAP document number must contain 12 digits"
                                    }
                                    message={
                                      "Please enter correct SAP document number"
                                    }
                                    type={"error"}
                                  />
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  path,
                                  value
                                );
                              } else {
                                handleCommunicationCellUpdate(
                                  submission,
                                  path,
                                  value
                                );
                              }
                            }}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.alsoMarketingProjectNumberLMD",
                        dataKey: "data.alsoMarketingProjectNumberLMD",
                        group: "Input of Local Marketing Department",

                        title: "ALSO Marketing Project Number",
                        width: columnWidth(
                          "data.alsoMarketingProjectNumberLMD",
                          250
                        ),
                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.alsoMarketingProjectNumberLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"text"}
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            maxLength={12}
                            readonly={cellReadonly(props)}
                            backgroundColor={cellColor(props)}
                            onUpdate={(
                              submission: string,
                              path: string,
                              value: any
                            ) => {
                              handleCommunicationCellUpdate(
                                submission,
                                path,
                                value
                              );
                              handleCommunicationCellUpdate(
                                submission,
                                "data.newLine",
                                true
                              );
                              var vs = findSubmissionsByPO(value);
                              if (vs.length < 1) {
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.vendorLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.vodLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.buLMD",
                                  ""
                                );
                                toast(
                                  <Toast
                                    title={"Unknown Project Number"}
                                    message={"Project Number not found"}
                                    type={"error"}
                                  />
                                );
                              } else {
                                var currentVendor = "";
                                if (props.rowData.data.vendorLMD === "") {
                                  var parent = communicationSubmissions.find(
                                    ({ id }) => id === props.rowData.parentId
                                  );
                                  if (parent !== undefined) {
                                    currentVendor = parent?.data.vendorLMD;
                                  } else {
                                    currentVendor = "";
                                  }
                                } else {
                                  currentVendor = props.rowData.data.vendorLMD;
                                }
                                if (typeof currentVendor === "string") {
                                  var valid = false;
                                  vs.forEach((s) => {
                                    if (s.data.vendorName !== undefined) {
                                      var vendor: string = "";
                                      // var vendorBU: string = "";
                                      if (currentVendor.includes("BU")) {
                                        currentVendor = currentVendor
                                          .toString()
                                          .substring(
                                            0,
                                            currentVendor.toString().length - 7
                                          );
                                      }
                                      if (s.data.vendorName.includes("BU")) {
                                        vendor = s.data.vendorName
                                          .toString()
                                          .substring(
                                            0,
                                            s.data.vendorName.toString()
                                              .length - 7
                                          );
                                        // vendorBU = s.data.vendorName
                                        //   .toString()
                                        //   .substring(
                                        //     s.data.vendorName.toString()
                                        //       .length - 3,
                                        //     s.data.vendorName.toString().length
                                        //   );
                                      } else {
                                        vendor = s.data.vendorName;
                                      }
                                      if (currentVendor === vendor) {
                                        handleCommunicationCellUpdate(
                                          submission,
                                          "data.vendorLMD",
                                          s.data.vendorName.toString()
                                        );
                                        handleCommunicationCellUpdate(
                                          submission,
                                          "data.buLMD",
                                          s.data.businessUnit
                                        );
                                        handleCommunicationCellUpdate(
                                          submission,
                                          "data.vodLMD",
                                          s.data.debitorNumber
                                        );
                                        handleCommunicationCellUpdate(
                                          submission,
                                          "data.documentCurrencyLMD",
                                          s.data.vendorBudgetCurrency
                                        );
                                        handleCommunicationCellUpdate(
                                          submission,
                                          "data.amountLMD",
                                          s.data.vendorAmount
                                        );
                                        valid = true;
                                      }
                                    }
                                  });
                                  if (props.rowData.data.vendorLMD === "") {
                                    valid = true;
                                  }
                                  if (!valid) {
                                    handleCommunicationCellUpdate(
                                      submission,
                                      "data.vendorLMD",
                                      ""
                                    );
                                    handleCommunicationCellUpdate(
                                      submission,
                                      "data.vodLMD",
                                      ""
                                    );
                                    toast(
                                      <Toast
                                        title={"Unknown Vendor Selected"}
                                        message={
                                          "Vendor does not exist under this project"
                                        }
                                        type={"error"}
                                      />
                                    );
                                  }
                                }
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.invoiceTextLMD",
                                  vs[0].data.projectName
                                );
                                var amount = 0;
                                switch (vs[0].data.projectType) {
                                  case "Local One Vendor" ||
                                    "European One Vendor":
                                    amount =
                                      vs[0].data
                                        .campaignEstimatedIncomeBudgetsCurrency;
                                    break;
                                  case "Local Multi Vendor" ||
                                    "European Multi Vendor":
                                    vs.forEach((s) => {
                                      if (!isNaN(s.data.vendorBudgetAmount)) {
                                        amount += Number(
                                          s.data.vendorBudgetAmount
                                        );
                                      }
                                    });
                                    break;
                                  default:
                                    amount = NaN;
                                }
                                if (!isNaN(amount)) {
                                  handleCommunicationCellUpdate(
                                    submission,
                                    "data.amountLMD",
                                    amount
                                  );
                                }
                                if (props.rowData.data.newLine) {
                                  toast(
                                    <Toast
                                      title={"Project Found"}
                                      message={
                                        "Data copied from project-check amounts and currencies"
                                      }
                                      type={"success"}
                                    />
                                  );
                                } else {
                                  toast(
                                    <Toast
                                      title={"Project Found"}
                                      message={
                                        "Data copied from parent project"
                                      }
                                      type={"success"}
                                    />
                                  );
                                }
                              }
                            }}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.vendorLMD",
                        dataKey: "data.vendorLMD",
                        title: "Vendor",
                        width: columnWidth("data.vendorLMD", 250),
                        group: "Input of Local Marketing Department",
                        resizable: true,
                        hidden: visibilityController("LMD", "data.vendorLMD"),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"dropdown"}
                            readonly={
                              cellReadonly(props) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            invoiced={lmdColumnEdit(props.rowData.data)}
                            loadOptions={() => {
                              if (
                                props.rowData.data
                                  .alsoMarketingProjectNumberLMD !== undefined
                              ) {
                                var vs = findSubmissionsByPO(
                                  props.rowData.data
                                    .alsoMarketingProjectNumberLMD
                                );
                                submissionData = vs;
                                if (vs.length > 0) {
                                  var v: any[] = [];
                                  vs.forEach((s) => {
                                    if (
                                      s.data.vendorName !== undefined &&
                                      !v.find(
                                        (c: any) =>
                                          c.label === s.data.vendorName
                                      )
                                    ) {
                                      v.push({
                                        label: s.data.vendorName,
                                        value: s.data.vendorName,
                                      });
                                    }
                                  });
                                  if (v.length > 0) {
                                    return v;
                                  }
                                }
                              }

                              return VendorsNames;
                            }}
                            backgroundColor={mandatoryFieldValidation(props)}
                            onUpdate={(
                              submission: string,
                              path: string,
                              value: any
                            ) => {
                              handleCommunicationCellUpdate(
                                submission,
                                path,
                                value
                              );
                              var tmpValue = "";
                              var tmpBU = "";

                              if (value.toString().includes("BU")) {
                                tmpValue = value
                                  .toString()
                                  .substring(0, value.length - 7);
                                tmpBU = value
                                  .toString()
                                  .substring(value.length - 3, value.length);
                              } else {
                                tmpValue = value;
                              }
                              let set = false;
                              if (
                                props.rowData.data.alsoMarketingProjectNumberLMD.includes(
                                  "IS"
                                )
                              ) {
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.vodLMD",
                                  submissionData[0].data.debitorNumber
                                );
                                set = true;
                              } else {
                                VendorsNames.every((v) => {
                                  if (
                                    v.label === tmpValue ||
                                    v.label.substr(0, v.label.length - 10) ===
                                      tmpValue
                                  ) {
                                    handleCommunicationCellUpdate(
                                      submission,
                                      "data.vodLMD",
                                      v.value.debitorischer
                                    );
                                    set = true;

                                    return false;
                                  }
                                  return true;
                                });
                              }
                              if (!set) {
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.vodLMD",
                                  ""
                                );
                                handleCommunicationCellUpdate(
                                  submission,
                                  "data.buLMD",
                                  ""
                                );
                              } else {
                                if (submissionData) {
                                  if (
                                    props.rowData.data.alsoMarketingProjectNumberLMD.includes(
                                      "IS"
                                    )
                                  ) {
                                    submissionData.every((s: any) => {
                                      handleCommunicationCellUpdate(
                                        submission,
                                        "data.amountLMD",
                                        s.data.vendorAmount
                                      );
                                      handleCommunicationCellUpdate(
                                        submission,
                                        "data.documentCurrencyLMD",
                                        s.data.vendorBudgetCurrency
                                      );
                                      handleCommunicationCellUpdate(
                                        submission,
                                        "data.buLMD",
                                        s.data.businessUnit
                                      );
                                      return false;
                                    });
                                  } else {
                                    submissionData.every((s: any) => {
                                      if (s.group === "vendor") {
                                        if (tmpBU === "") {
                                          if (
                                            s.group === "vendor" &&
                                            s.data.debitorNumber ===
                                              props.rowData.data.vodLMD
                                          ) {
                                            handleCommunicationCellUpdate(
                                              submission,
                                              "data.amountLMD",
                                              s.data.vendorAmount
                                            );
                                            handleCommunicationCellUpdate(
                                              submission,
                                              "data.documentCurrencyLMD",
                                              s.data.vendorBudgetCurrency
                                            );
                                            handleCommunicationCellUpdate(
                                              submission,
                                              "data.buLMD",
                                              s.data.businessUnit
                                            );
                                            return false;
                                          }
                                        } else {
                                          if (
                                            s.group === "vendor" &&
                                            s.data.debitorNumber ===
                                              props.rowData.data.vodLMD &&
                                            s.data.businessUnit.substring(
                                              0,
                                              3
                                            ) === tmpBU
                                          ) {
                                            handleCommunicationCellUpdate(
                                              submission,
                                              "data.amountLMD",
                                              s.data.vendorAmount
                                            );
                                            handleCommunicationCellUpdate(
                                              submission,
                                              "data.documentCurrencyLMD",
                                              s.data.vendorBudgetCurrency
                                            );
                                            if (
                                              tmpBU ===
                                              s.data.businessUnit.substring(
                                                0,
                                                3
                                              )
                                            ) {
                                              handleCommunicationCellUpdate(
                                                submission,
                                                "data.buLMD",
                                                s.data.businessUnit
                                              );
                                            }

                                            return false;
                                          }
                                        }
                                      }
                                      return true;
                                    });
                                  }
                                }
                              }
                            }}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.vodLMD",
                        dataKey: "data.vodLMD",
                        group: "Input of Local Marketing Department",

                        title: "VOD",
                        width: columnWidth("data.vodLMD", 200),
                        resizable: true,
                        hidden: visibilityController("LMD", "data.vodLMD"),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            type={"text"}
                            backgroundColor={cellColor(props)}
                            readonly={
                              props.rowData.parentId !== null ||
                              cellReadonly(props)
                            }
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.buLMD",
                        dataKey: "data.buLMD",
                        title: "BU",
                        group: "Input of Local Marketing Department",

                        width: columnWidth("data.buLMD", 200),
                        resizable: true,
                        hidden: visibilityController("LMD", "data.buLMD"),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"dropdown"}
                            loadOptions={() => {
                              return BUs;
                            }}
                            readonly={cellReadonly(props)}
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            backgroundColor={cellColor(props)}
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      // FIXME: set after 'refresh status' clicked
                      {
                        key: "data.entryDateLMD",
                        dataKey: "data.entryDateLMD",
                        title: "Entry Date",
                        group: "Input of Local Marketing Department",
                        type: "date",
                        width: columnWidth("data.entryDateLMD", 200),
                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.entryDateLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            type={"date"}
                            readonly={cellReadonly(props)}
                            backgroundColor="#F5FAEF"
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.materialNumberLMD",
                        dataKey: "data.materialNumberLMD",
                        title: "Material Number",
                        width: columnWidth("data.materialNumberLMD", 200),
                        resizable: true,
                        group: "Input of Local Marketing Department",

                        hidden: visibilityController(
                          "LMD",
                          "data.materialNumberLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"text"}
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            readonly={cellReadonly(props)}
                            backgroundColor={cellColor(props)}
                            onUpdate={handleCommunicationCellUpdate}
                            // loadOptions={() => {
                            //   return VendorsNames.map((vendor) => {
                            //     return {
                            //       label: vendor.value.hersteller,
                            //       value: vendor.value.hersteller,
                            //     };
                            //   });
                            // }}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.reasonLMD",
                        dataKey: "data.reasonLMD",
                        title: "Reason",
                        group: "Input of Local Marketing Department",

                        width: columnWidth("data.reasonLMD", 200),
                        resizable: true,
                        hidden: visibilityController("LMD", "data.reasonLMD"),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"dropdown"}
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            readonly={cellReadonly(props)}
                            loadOptions={() => {
                              return [
                                {
                                  label: "25",
                                  value: "25",
                                },
                                { label: "40", value: "40" },
                              ];
                            }}
                            backgroundColor={cellColor(props)}
                            onUpdate={(
                              submission: string,
                              path: string,
                              value: any
                            ) => {
                              handleCommunicationCellUpdate(
                                submission,
                                path,
                                value
                              );
                            }}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.reasonCodeLMD",
                        dataKey: "data.reasonCodeLMD",
                        group: "Input of Local Marketing Department",

                        title: "Reason Code",
                        width: columnWidth("data.reasonCodeLMD", 200),
                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.reasonCodeLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            type={"text"}
                            backgroundColor={cellColor(props)}
                            readonly={cellReadonly(props)}
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.invoiceTextLMD",
                        dataKey: "data.invoiceTextLMD",
                        group: "Input of Local Marketing Department",

                        title: "Invoice Text",
                        width: columnWidth("data.invoiceTextLMD", 200),
                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.invoiceTextLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            type={"text"}
                            backgroundColor={mandatoryFieldValidation(props)}
                            readonly={cellReadonly(props)}
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.referenceNumberFromVendor",
                        dataKey: "data.referenceNumberFromVendor",
                        group: "Input of Local Marketing Department",

                        title: "Reference Number From Vendor",
                        width: columnWidth(
                          "data.referenceNumberFromVendor",
                          200
                        ),
                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.referenceNumberFromVendor"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"text"}
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            readonly={cellReadonly(props)}
                            backgroundColor="#F5FAEF"
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.activityIdForPortalVendors",
                        dataKey: "data.activityIdForPortalVendors",
                        group: "Input of Local Marketing Department",
                        title: "Activity ID for Portal Vendors",
                        width: columnWidth(
                          "data.activityIdForPortalVendors",
                          200
                        ),
                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.activityIdForPortalVendors"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            type={"text"}
                            backgroundColor={cellColor(props)}
                            readonly={cellReadonly(props)}
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.amountLMD",
                        dataKey: "data.amountLMD",
                        title: "Amount",
                        group: "Input of Local Marketing Department",

                        width: columnWidth("data.amountLMD", 200),
                        resizable: true,
                        hidden: visibilityController("LMD", "data.amountLMD"),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"number"}
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            backgroundColor={cellColor(props)}
                            onUpdate={handleCommunicationCellUpdate}
                            readonly={cellReadonly(props)}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      // {
                      //   key: "data.additionalInvoiceInfoLMD",
                      //   dataKey: "data.additionalInvoiceInfoLMD",
                      //   title: "Additional Info on Invoice",
                      //   group: "Input of Local Marketing Department",

                      //   width: columnWidth(
                      //     "data.additionalInvoiceInfoLMD",
                      //     200
                      //   ),
                      //   resizable: true,
                      //   hidden: visibilityController(
                      //     "LMD",
                      //     "data.additionalInvoiceInfoLMD"
                      //   ),
                      //   cellRenderer: (props: any) => (
                      //     <EditableTableCell
                      //       type={"text"}
                      //       backgroundColor="#F5FAEF"
                      //       onUpdate={handleCommunicationCellUpdate}
                      //       rowIndex={props.rowIndex}
                      //       columnKey={props.column.dataKey}
                      //       rowData={props.rowData}
                      //       initialValue={props.cellData}
                      //     />
                      //   ),
                      // },
                      {
                        key: "data.documentCurrencyLMD",
                        dataKey: "data.documentCurrencyLMD",
                        title: "Document Currency",
                        group: "Input of Local Marketing Department",

                        width: columnWidth("data.documentCurrencyLMD", 200),
                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.documentCurrencyLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            type={"dropdown"}
                            readonly={cellReadonly(props)}
                            loadOptions={() => {
                              return ExchangeRates;
                            }}
                            backgroundColor={cellColor(props)}
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.paymentMethodLMD",
                        group: "Input of Local Marketing Department",

                        dataKey: "data.paymentMethodLMD",
                        title: "Payment Method",
                        width: columnWidth("data.paymentMethodLMD", 200),
                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.paymentMethodLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"dropdown"}
                            readonly={cellReadonly(props)}
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            loadOptions={() => {
                              var res = [];
                              if (
                                props.rowData.data.invoiceTypeLMD !==
                                "Internal Invoice"
                              ) {
                                res = [
                                  { label: "Payment", value: "Payment" },
                                  {
                                    label: "Money in House",
                                    value: "Money in House",
                                  },
                                  {
                                    label: "Credit Note from Vendor",
                                    value: "Credit Note from Vendor",
                                  },
                                ];
                              } else {
                                res = [
                                  { label: "Payment", value: "Payment" },
                                  {
                                    label: "Money in House",
                                    value: "Money in House",
                                  },
                                  {
                                    label: "Credit Note from Vendor",
                                    value: "Credit Note from Vendor",
                                  },
                                  { label: "Central CN", value: "Central CN" },
                                ];
                              }
                              return res;
                            }}
                            backgroundColor={mandatoryFieldValidation(props)}
                            onUpdate={(
                              submission: string,
                              path: string,
                              value: any
                            ) => {
                              // handleCommunicationCellUpdate(
                              //   submission,
                              //   "data.statusLMD",
                              //   ""
                              // );
                              var dunningStop = "No";
                              switch (props.rowData.data.invoiceTypeLMD) {
                                case "Invoice":
                                  switch (value) {
                                    case "Payment":
                                      dunningStop = "No";
                                      break;
                                    case "Money in House":
                                      dunningStop = "Yes";
                                      break;
                                    case "Credit Note from Vendor":
                                      dunningStop = "Yes";
                                      break;
                                  }
                                  break;
                                case "Pre-Invoice":
                                  switch (value) {
                                    case "Payment":
                                      dunningStop = "No";
                                      break;
                                    case "Money in House":
                                      dunningStop = "Yes";
                                      break;
                                    case "Credit Note from Vendor":
                                      dunningStop = "Yes";
                                      break;
                                  }
                                  break;
                                case "Internal Invoice":
                                  switch (value) {
                                    case "Payment":
                                      dunningStop = "No";
                                      break;
                                    case "Money in House":
                                      dunningStop = "Yes";
                                      break;
                                    case "Credit Note from Vendor":
                                      dunningStop = "Yes";
                                      break;
                                    case "Central CN":
                                      dunningStop = "Yes";
                                      break;
                                  }
                                  break;
                                case "Cancelation":
                                  break;
                              }
                              //if (value !== "Money in House") {
                              handleCommunicationCellUpdate(
                                submission,
                                "data.depositNumberLMD",
                                ""
                              );
                              //}
                              handleCommunicationCellUpdate(
                                submission,
                                "data.dunningStopLMD",
                                dunningStop
                              );
                              handleCommunicationCellUpdate(
                                submission,
                                path,
                                value
                              );
                            }}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.dunningStopLMD",
                        dataKey: "data.dunningStopLMD",
                        group: "Input of Local Marketing Department",

                        title: "Dunning Stop?",
                        width: columnWidth("data.dunningStopLMD", 200),
                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.dunningStopLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"dropdown"}
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            readonly={
                              (props.rowData.data.invoiceTypeLMD ===
                                "Internal Invoice" &&
                                (props.rowData.data.paymentMethodLMD ===
                                  "Money in House" ||
                                  props.rowData.data.paymentMethodLMD ===
                                    "Credit Note from Vendor")) ||
                              cellReadonly(props)
                            }
                            loadOptions={() => {
                              return [
                                { label: "Yes", value: "Yes" },
                                { label: "No", value: "No" },
                              ];
                            }}
                            backgroundColor={mandatoryFieldValidation(props)}
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },

                      {
                        key: "data.depositNumberLMD",
                        dataKey: "data.depositNumberLMD",
                        group: "Input of Local Marketing Department",

                        title: "Deposit Number/Central CN Number",
                        width: columnWidth("data.depositNumberLMD", 200),
                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.depositNumberLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"text"}
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            // readonly={
                            //   !(
                            //     props.rowData.data.paymentMethodLMD ===
                            //       "Money in House" ||
                            //     props.rowData.data.paymentMethodLMD ===
                            //       "Central CN"
                            //   )
                            // }
                            readonly={cellReadonly(props)}
                            backgroundColor={cellColor(props)}
                            // backgroundColor={
                            //   props.rowData.data.invoiceTypeLMD ===
                            //   "Cancellation"
                            //     ? "#F5FAEF"
                            //     : props.rowData.data.paymentMethodLMD ===
                            //         "Money in House" ||
                            //       props.rowData.data.paymentMethodLMD ===
                            //         "Central CN"
                            //     ? props.cellData && props.cellData.length > 0
                            //       ? "#F5FAEF"
                            //       : "#f7cdd6"
                            //     : "#F5FAEF"
                            // }
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.additionalInformationLMD",
                        dataKey: "data.additionalInformationLMD",
                        title: "Additional Information",
                        width: columnWidth(
                          "data.additionalInformationLMD",
                          200
                        ),
                        group: "Input of Local Marketing Department",

                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.additionalInformationLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"text"}
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            readonly={cellReadonly(props)}
                            backgroundColor={mandatoryFieldValidation(props)}
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.sendToLMD",
                        dataKey: "data.sendToLMD",
                        title: "Send to",
                        width: columnWidth("data.sendToLMD", 200),
                        group: "Input of Local Marketing Department",

                        resizable: true,
                        hidden: visibilityController("LMD", "data.sendToLMD"),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            type={"text"}
                            backgroundColor={cellColor(props)}
                            readonly={cellReadonly(props)}
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.dateOfServiceRenderedLMD",
                        dataKey: "data.dateOfServiceRenderedLMD",
                        group: "Input of Local Marketing Department",

                        title: "Date of service rendered",
                        width: columnWidth(
                          "data.dateOfServiceRenderedLMD",
                          200
                        ),
                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.dateOfServiceRenderedLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            type={"text"}
                            backgroundColor={"#F5FAEF"}
                            readonly={cellReadonly(props)}
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "data.linkToProofsLMD",
                        dataKey: "data.linkToProofsLMD",
                        group: "Input of Local Marketing Department",

                        title: "Link to proof",
                        width: columnWidth("data.linkToProofsLMD", 200),
                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.linkToProofsLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            invoiced={
                              lmdColumnEdit(props.rowData.data) ||
                              !(
                                userRoles.includes("Marketing") ||
                                userRoles.includes("Administrator")
                              )
                            }
                            type={"text"}
                            backgroundColor={cellColor(props)}
                            readonly={cellReadonly(props)}
                            onUpdate={handleCommunicationCellUpdate}
                            rowIndex={props.rowIndex}
                            columnKey={props.column.dataKey}
                            rowData={props.rowData}
                            initialValue={props.cellData}
                          />
                        ),
                      },
                      {
                        key: "__actions.validate",
                        dataKey: "__actions.validate",
                        title: "",
                        width: columnWidth("__actions.validate", 100),
                        resizable: false,
                        header: "Actions",
                        className: "red-border",
                        cellRenderer: (props: any) =>
                          props.rowData.parentId === null &&
                          props.rowData.data.statusLMD !== "INVOICED" ? (
                            <EditableTableCell
                              invoiced={
                                lmdColumnEdit(props.rowData.data) ||
                                !(
                                  userRoles.includes("Marketing") ||
                                  userRoles.includes("Administrator")
                                )
                              }
                              type={"button"}
                              backgroundColor="#fef9fa"
                              textColor={"green"}
                              onUpdate={(submissionId: string) => {
                                var isInvoiceCorrect: number = 0;
                                var targetChildSubs: any[] = [];
                                var parent: any;
                                var targetSubmissionIndex =
                                  communicationSubmissions.findIndex(
                                    (s) => s.id === submissionId
                                  );
                                getColumnName(
                                  "data.depositNumberLMD",
                                  "Input of Local Marketing Department"
                                );
                                if (
                                  props.rowData.data.invoiceTypeLMD === "" ||
                                  !props.rowData.data.invoiceTypeLMD
                                ) {
                                  isInvoiceCorrect += 1;
                                  toast(
                                    <Toast
                                      title={"Incomplete Request"}
                                      message={"Invoice type cannot be emtpy"}
                                      type={"error"}
                                    />
                                  );
                                  return isInvoiceCorrect;
                                }
                                if (
                                  communicationSubmissions[
                                    targetSubmissionIndex
                                  ].data.invoiceTypeLMD === "Cancellation"
                                ) {
                                  parent =
                                    communicationSubmissions[
                                      targetSubmissionIndex
                                    ];
                                  // if (
                                  //   communicationSubmissions[
                                  //     targetSubmissionIndex
                                  //   ].data.additionalInformationLMD.length >
                                  //     0 &&
                                  //   communicationSubmissions[
                                  //     targetSubmissionIndex
                                  //   ].data.cancellationInfoLMD.length > 0 &&
                                  //   communicationSubmissions[
                                  //     targetSubmissionIndex
                                  //   ].data.sendTo.length > 0
                                  // )
                                  if (hasRequiredFields(parent)) {
                                    isInvoiceCorrect = 0;
                                  } else {
                                    isInvoiceCorrect = 1;
                                  }
                                } else {
                                  if (
                                    communicationSubmissions[
                                      targetSubmissionIndex
                                    ].data.invoiceTypeLMD !== "Cancellation"
                                  ) {
                                    targetChildSubs =
                                      communicationSubmissions.filter(
                                        (s) => s.parentId === submissionId
                                      );

                                    if (targetSubmissionIndex > -1) {
                                      var is: Submission[] = [];
                                      is.push(
                                        communicationSubmissions[
                                          targetSubmissionIndex
                                        ]
                                      );

                                      if (is[0].parentId === null) {
                                        communicationSubmissions.forEach(
                                          (s) => {
                                            if (s.parentId === submissionId) {
                                              is.push(s);
                                            }
                                          }
                                        );
                                      }
                                      isInvoiceCorrect = 0;

                                      is.forEach((ts, tsi) => {
                                        handleCommunicationCellUpdate(
                                          ts.id!,
                                          "data.newLine",
                                          false
                                        );
                                        if (ts.parentId === null) {
                                          parent = ts;
                                        }
                                        if (!hasRequiredFields(ts)) {
                                          isInvoiceCorrect += 1;
                                        }
                                      });

                                      var targetChildSameVOD =
                                        targetChildSubs.filter(
                                          (s) =>
                                            s.data.vodLMD === parent.data.vodLMD
                                        );
                                      if (
                                        targetChildSameVOD.length !==
                                        targetChildSubs.length
                                      ) {
                                        isInvoiceCorrect += 1;
                                        toast(
                                          <Toast
                                            title={"Incomplete Request"}
                                            message={
                                              "Invoice contains two different VOD numbers, and invoice can be requested only for one vendor"
                                            }
                                            type={"error"}
                                          />
                                        );
                                      }
                                      var targetChildSameCurr =
                                        targetChildSubs.filter(
                                          (s) =>
                                            s.data.documentCurrencyLMD ===
                                            parent.data.documentCurrencyLMD
                                        );
                                      if (
                                        targetChildSameCurr.length !==
                                        targetChildSubs.length
                                      ) {
                                        isInvoiceCorrect += 1;
                                        toast(
                                          <Toast
                                            title={"Incomplete Request"}
                                            message={
                                              "Invoice contains two different currencies, and invoice can be requested only for one currency"
                                            }
                                            type={"error"}
                                          />
                                        );
                                      }
                                    }
                                  }
                                }
                                if (isInvoiceCorrect === 0) {
                                  var today = new Date();
                                  today.setHours(23, 59, 59, 998);
                                  var statusToBeSet = "";
                                  if (
                                    parent.data.invoicingDateLMD &&
                                    new Date(parent.data.invoicingDateLMD) >
                                      today
                                  ) {
                                    statusToBeSet = "FUTURE INVOICE";
                                  } else {
                                    statusToBeSet = "OK FOR INVOICING";
                                  }
                                  handleCommunicationCellUpdate(
                                    parent.id!,
                                    "data.statusLMD",
                                    statusToBeSet
                                  );
                                  targetChildSubs.forEach((element) => {
                                    handleCommunicationCellUpdate(
                                      element.id!,
                                      "data.statusLMD",
                                      statusToBeSet
                                    );
                                  });
                                  toast(
                                    <Toast
                                      title={"Successful Validation"}
                                      message={
                                        "Parent submission validated successfully"
                                      }
                                      type={"success"}
                                    />
                                  );
                                } else {
                                  toast(
                                    <Toast
                                      title={"Incomplete Request"}
                                      message={
                                        "Parent submission could not be validated: incomplete data"
                                      }
                                      type={"error"}
                                    />
                                  );

                                  handleCommunicationCellUpdate(
                                    parent.id!,
                                    "data.statusLMD",
                                    "INCOMPLETE"
                                  );
                                }
                              }}
                              rowIndex={props.rowIndex}
                              columnKey={props.column.dataKey}
                              rowData={props.rowData}
                              initialValue={"validate"}
                            />
                          ) : (
                            <div
                              style={{
                                backgroundColor: "#F7FAFC",
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          ),
                      },
                      {
                        key: "__actions.create",
                        dataKey: "__actions.create",
                        title: "",
                        width: columnWidth("__actions.create", 150),
                        resizable: false,
                        className: "red-border",
                        cellRenderer: (props: any) =>
                          props.rowData.data.invoiceTypeLMD !==
                            "Cancellation" &&
                          props.rowData.parentId === null &&
                          props.rowData.data.statusLMD !== "INVOICED" ? (
                            <EditableTableCell
                              type={"button"}
                              invoiced={
                                props.rowData.data.statusLMD === "INVOICED" ||
                                props.rowData.data.statusLMD ===
                                  "OK FOR INVOICING" ||
                                props.rowData.data.invoiceTypeLMD ===
                                  "Cancellation" ||
                                !(
                                  userRoles.includes("Marketing") ||
                                  userRoles.includes("Administrator")
                                )
                              }
                              backgroundColor="#fef9fa"
                              textColor={"blue"}
                              onUpdate={(submissionId: string) => {
                                if (hasRequiredFields(props.rowData)) {
                                  var submissionNew: Submission = {
                                    project: props.rowData.project,
                                    parentId: submissionId,
                                    viewId: null,
                                    group: "communication",
                                    created: new Date(),
                                    updated: new Date(),
                                    title: "",
                                    author: "",
                                    status: "",
                                    data: {
                                      newLine: true,
                                      documentCurrencyLMD:
                                        props.rowData.data.documentCurrencyLMD,
                                      invoicingDateLMD:
                                        props.rowData.data.invoicingDateLMD,
                                      requestorLMD:
                                        props.rowData.data.requestorLMD,
                                      vendorLMD: props.rowData.data.vendorLMD,
                                      vodLMD: props.rowData.data.vodLMD,
                                      buLMD:
                                        props.rowData.data.invoiceTypeLMD ===
                                        "Pre-Invoice"
                                          ? null
                                          : props.rowData.data.buLMD,
                                      invoiceTypeLMD:
                                        props.rowData.data.invoiceTypeLMD,
                                      cancellationInfoLMD:
                                        props.rowData.data.cancellationInfoLMD,
                                      materialNumberLMD:
                                        props.rowData.data.materialNumberLMD,
                                      reasonLMD: props.rowData.data.reasonLMD,
                                      reasonCodeLMD:
                                        props.rowData.data.reasonCodeLMD,
                                      depositNumberLMD: "",
                                      paymentMethodLMD:
                                        props.rowData.data.paymentMethodLMD,
                                      dunningStopLMD:
                                        props.rowData.data.dunningStopLMD,
                                      sendToLMD: props.rowData.data.sendToLMD,
                                      alsoMarketingProjectNumberLMD:
                                        props.rowData.data.invoiceTypeLMD ===
                                        "Pre-Invoice"
                                          ? props.rowData.data
                                              .alsoMarketingProjectNumberLMD
                                          : null,
                                    },
                                  };
                                  RestAPI.createSubmission(submissionNew).then(
                                    (response) => {
                                      var temp = [...communicationSubmissions];

                                      temp.push(response.data);
                                      setCommunicationSubmissions(temp);
                                    }
                                  );
                                } else {
                                  toast(
                                    <Toast
                                      title={"Not all field entered"}
                                      message={
                                        "You need to enter all obligatory fields before you can add invoice lines"
                                      }
                                      type={"error"}
                                    />
                                  );
                                }
                              }}
                              rowIndex={props.rowIndex}
                              columnKey={props.column.dataKey}
                              rowData={props.rowData}
                              initialValue={"create new line"}
                            />
                          ) : (
                            <div
                              style={{
                                backgroundColor: "#F7FAFC",
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          ),
                      },
                      {
                        key: "__actions.delete",
                        dataKey: "__actions.delete",
                        title: "",
                        width: columnWidth("__actions.delete", 100),
                        resizable: false,
                        className: "red-border",
                        cellRenderer: (props: any) =>
                          props.rowData.data &&
                          props.rowData.data.statusLMD !== "INVOICED" ? (
                            <EditableTableCell
                              invoiced={
                                lmdColumnEdit(props.rowData.data) ||
                                !(
                                  userRoles.includes("Marketing") ||
                                  userRoles.includes("Administrator")
                                )
                              }
                              type={"button"}
                              textColor={"red"}
                              backgroundColor="#fef9fa"
                              onUpdate={(submissionId: string) => {
                                var tbd: string[] = [submissionId];
                                var submissionIndex =
                                  communicationSubmissions.findIndex(
                                    (s) => s.id === submissionId
                                  );
                                if (submissionIndex > -1) {
                                  var temp = [...communicationSubmissions];
                                  temp.splice(submissionIndex, 1);
                                  temp.forEach((s, index) => {
                                    if (
                                      s.parentId !== null &&
                                      s.parentId === submissionId
                                    ) {
                                      if (s.id) {
                                        temp.splice(index, 1);
                                        tbd.push(s.id);
                                      }
                                    }
                                  });
                                  setCommunicationSubmissions(temp);
                                  RestAPI.deleteSubmission(submissionId);
                                }
                              }}
                              rowIndex={props.rowIndex}
                              columnKey={props.column.dataKey}
                              rowData={props.rowData}
                              initialValue={"delete"}
                            />
                          ) : (
                            <div
                              style={{
                                backgroundColor: "#F7FAFC",
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          ),
                      },
                    ]}
                    headerRenderer={headerRendererForTable}
                    headerClassName="header-cells"
                    data={unflatten([
                      ...filteredCommunicationSubmissions,
                    ] as any[])}
                    rowKey="id"
                    headerHeight={[50, 50]}
                    rowHeight={55}
                    overlayRenderer={
                      <div
                        style={{
                          position: "absolute",
                          width: "200px",
                          bottom: "20px",
                          right: "20px",
                          padding: "5px 15px",
                        }}
                      >
                        <Button
                          disabled={
                            !(
                              userRoles.includes("Administrator") ||
                              userRoles.includes("Marketing")
                            )
                          }
                          onClick={() => {
                            var submission: Submission = {
                              // FIXME
                              project: "619515b754e61c8dd33daa52",
                              parentId: null,
                              viewId: null,
                              group: "communication",
                              created: new Date(),
                              updated: new Date(),
                              title: "",
                              author: "",
                              status: "",
                              data: {
                                newLine: true,
                                paymentMethodLMD: "",
                                dunningStopLMD: "",
                                sendToLMD: "",
                                invoiceTextLMD: "",
                                vendorLMD: "",
                                invoicingDateLMD: "",
                                amountLMD: "",
                                documentCurrencyLMD: "",
                                alsoMarketingProjectNumberLMD: "",
                                materialNumberLMD: "7000100",
                                invoiceTypeLMD: "Invoice",
                                reasonLMD: "25",
                                reasonCodeLMD: "ZWKZ",
                              },
                            };
                            RestAPI.createSubmission(submission).then(
                              (response) => {
                                var temp = [...communicationSubmissions];
                                temp.unshift(response.data);
                                setCommunicationSubmissions(temp);
                              }
                            );
                          }}
                        >
                          Create Submission
                        </Button>
                      </div>
                    }
                  ></BaseTable>
                )}
              </AutoResizer>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      <Box
        w={"100%"}
        bg={useColorModeValue("white", "#5b5b5b")}
        p={4}
        mb={5}
        border="1px"
        rounded="md"
        borderColor="gray.100"
        color={"gray.500"}
      >
        <Box mb={"1em"} w="100%">
          <Text mb="8px">Displayed Columns</Text>
          <CheckTreePicker
            cleanable={false}
            defaultExpandAll={false}
            block
            onChange={(value) => {
              var values: string[] = [];
              let previousValues: string[] = [];
              if (tabIndex === 0) {
                previousValues = previousValuesProject;
              } else if (tabIndex === 1) {
                previousValues = previousValuesComm;
              }
              if (
                !previousValues.includes(noneValue) &&
                value.includes(noneValue)
              ) {
                if (!values.includes(noneValue)) {
                  values.push(noneValue);
                }
                values.push("data.projectNumber");
              } else if (
                !previousValues.includes(allValue) &&
                value.includes(allValue)
              ) {
                if (!values.includes(allValue)) {
                  values.push(allValue);
                }
                defaultColumns.forEach((c) => {
                  values.push(c);
                });
              } else {
                value.forEach((v) => {
                  values.push(v.toString());
                });
              }
              const hasOnlyProjectNumber =
                values.length <= 2 && values.includes("data.projectNumber");
              if (!hasAllColumns(values)) {
                const index = values.indexOf(allValue);
                if (index > -1) {
                  values.splice(index, 1);
                }
              } else {
                if (!values.includes(allValue)) {
                  values.push(allValue);
                }
              }

              if (values.length !== 0 && !hasOnlyProjectNumber) {
                const index = values.indexOf(noneValue);
                if (index > -1) {
                  values.splice(index, 1);
                }
              } else {
                values.push(noneValue);
              }

              if (selectedTemplate === "local") {
                localStorage.setItem(
                  "vendors.displayedColumns",
                  JSON.stringify(values)
                );
              }
              if (tabIndex === 0) {
                setPreviousValuesProject(values);
              } else if (tabIndex === 1) {
                setPreviousValuesComm(values);
              }
              setDisplayedColumns(values);
            }}
            value={displayedColumns}
            data={getFilteredColumns(tabIndex)}
            // data={DisplayedColumnsList}
            placeholder="Groups"
            size="lg"
          />
        </Box>
        <Stack
          mb={"1em"}
          w="100%"
          spacing={"2em"}
          direction={{ base: "column", lg: "row" }}
        >
          <Box w="100%">
            <Text mb="8px">Statuses</Text>
            <TagPicker
              cleanable
              style={{
                minHeight: "40px",
                paddingTop: "2px",
              }}
              data={[]}
              block
            />
          </Box>
          <Box w="100%">
            <Text mb="8px">Preset</Text>
            <Creatable
              menuPortalTarget={document.body}
              styles={{
                menu: (provided) => ({
                  ...provided,
                  zIndex: 1000000,
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "#718196",
                }),
                control: (base, state) => ({
                  ...base,
                  minHeight: 40,
                  border: "1px solid #E2E8F0",
                  transition: "0.3s",
                  "&:hover": {
                    border: "1px solid #CBD5E0",
                  },
                }),
              }}
              theme={(theme) => ({
                ...theme,
                borderRadius: 6,
                colors: {
                  ...theme.colors,
                  primary: "#3082CE",
                },
              })}
              classNamePrefix="select"
              isClearable
              onCreateOption={(name) => {
                if (name.toLowerCase() === "local" || name.trim().length < 1) {
                  return;
                }
                setSelectedTemplate(name);
                var template: Template = {
                  name,
                  columns: displayedColumns,
                  filters: filters,
                };
                RestAPI.updateTemplate(template).then(() => {
                  setTemplates([...templates, template]);
                });
              }}
              value={{ label: selectedTemplate, value: selectedTemplate }}
              onChange={(name) => {
                if (name === null || name.label === "local") {
                  setSelectedTemplate("local");
                  setDisplayedColumns(defaultColumns);
                  setFilters([]);
                  return;
                }
                setSelectedTemplate(name.label);
                var template = templates.find((t) => t.name === name.label);
                if (template) {
                  setDisplayedColumns(template.columns);
                  setFilters(template.filters);
                }
              }}
              name="presets"
              options={[
                { label: "local", value: "local" },
                ...templates.map((t) => {
                  return { label: t.name, value: t.name };
                }),
              ]}
            />
          </Box>
        </Stack>
      </Box>
      <Box
        shadow="md"
        color="gray.600"
        backgroundColor="white"
        mb={10}
        p={8}
        pb={0}
        rounded="md"
        w={"100%"}
      >
        <VStack spacing={8} fontSize="md" align="stretch" color={"gray.500"}>
          <Box w={"100%"}>
            <Box w={"100%"}>
              {filters.map((filter, index) => {
                var valuesField: JSX.Element = <div></div>;
                switch (filter.type) {
                  case "text":
                    valuesField = (
                      <Input
                        onChange={(event) => {
                          var temp = [...filters];

                          temp[index].selectedValues[0] = event.target.value;
                          setFilters(temp);
                        }}
                        value={filter.selectedValues[0]}
                      />
                    );
                    break;
                  case "string":
                    valuesField = (
                      <Input
                        onChange={(event) => {
                          var temp = [...filters];
                          temp[index].selectedValues[0] = event.target.value;
                          setFilters(temp);
                        }}
                        value={filter.selectedValues[0]}
                      />
                    );
                    break;
                  case "number":
                    switch (filter.filter) {
                      case "exact":
                        valuesField = (
                          // <NumberInput
                          //   precision={2}
                          //   //defaultValue={filter.selectedValues[0]}
                          //   onChange={(_, value) => {
                          //     console.log(value);
                          //     var temp = [...filters];
                          //     temp[index].selectedValues[0] = value;
                          //     setFilters(temp);
                          //   }}
                          //   value={Number(filter.selectedValues[0].toFixed(2))}
                          //   w="100%"
                          // >
                          //   <NumberInputField />
                          //   {/* <NumberInputStepper>
                          //     <NumberIncrementStepper />
                          //     <NumberDecrementStepper />
                          //   </NumberInputStepper> */}
                          // </NumberInput>
                          <NumberInput
                            onChange={(strValue: string, value: number) => {
                              var temp = [...filters];
                              temp[index].selectedValues[0] = strValue;
                              setFilters(temp);
                            }}
                            value={filter.selectedValues[0]}
                          >
                            <NumberInputField />
                            {/* <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper> */}
                          </NumberInput>
                        );
                        break;
                      case "range":
                        valuesField = (
                          <Stack direction={{ base: "column", md: "row" }}>
                            <NumberInput
                              w="100%"
                              onChange={(strValue, value) => {
                                var temp = [...filters];
                                temp[index].selectedValues[0] = strValue;
                                setFilters(temp);
                              }}
                              value={filter.selectedValues[0]}
                            >
                              <NumberInputField />
                              {/* <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper> */}
                            </NumberInput>
                            <Box textAlign="center" w="20px">
                              <ArrowForwardIcon
                                alignSelf="center"
                                w={5}
                                h="100%"
                              />
                            </Box>
                            <NumberInput
                              w="100%"
                              onChange={(strValue, value) => {
                                var temp = [...filters];
                                temp[index].selectedValues[1] = strValue;
                                setFilters(temp);
                              }}
                              value={filter.selectedValues[1]}
                            >
                              <NumberInputField />
                              {/* <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper> */}
                            </NumberInput>
                          </Stack>
                        );
                        break;
                    }
                    break;
                  case "dropdown":
                  case "multiple-dropdown":
                    valuesField = (
                      <TagPicker
                        cleanable
                        style={{
                          minHeight: "40px",
                          paddingTop: "2px",
                        }}
                        onChange={(value) => {
                          var temp = [...filters];

                          temp[index].selectedValues = value;
                          setFilters(temp);
                        }}
                        value={filters[index].selectedValues}
                        data={loadOptions(filter.columnValue)}
                        block
                      />
                    );
                    break;
                  case "date":
                    switch (filter.filter) {
                      case "exact":
                        valuesField = (
                          <DateSingleInput
                            allowEditableInputs={true}
                            displayFormat="dd.MM.yyyy"
                            onChange={(value) => {
                              if (value !== filters[index].selectedValues[0]) {
                                var temp = [...filters];
                                temp[index].selectedValues = [value];
                                setFilters(temp);
                              }
                            }}
                          />
                        );
                        break;
                      case "range":
                        valuesField = (
                          <DateRangeInput
                            allowEditableInputs={true}
                            displayFormat="dd.MM.yyyy"
                            onDatesChange={(value) => {
                              var temp = [...filters];
                              temp[index].selectedValues = [
                                value.startDate,
                                value.endDate,
                              ];
                              setFilters(temp);
                            }}
                          />
                        );
                        break;
                    }
                }

                return (
                  <Box
                    w={"100%"}
                    backgroundColor="white"
                    p={4}
                    mb={5}
                    border="1px"
                    rounded="md"
                    borderColor="gray.100"
                  >
                    <CloseButton
                      onClick={() => {
                        var temp = [...filters];
                        temp.splice(index, 1);
                        setFilters(temp);
                      }}
                      float="right"
                    />
                    <VStack
                      mt={"20px"}
                      spacing={8}
                      fontSize="md"
                      align="stretch"
                      color={"gray.500"}
                    >
                      <Box>
                        <Stack
                          direction={{ base: "column", xl: "row" }}
                          w="100%"
                          spacing={{ base: "20px", xl: "50px" }}
                        >
                          <Box w="100%">
                            <Text mb="8px">Column</Text>
                            <Select
                              styles={{
                                menu: (provided) => ({
                                  ...provided,
                                  zIndex: 1000000,
                                }),
                                singleValue: (provided) => ({
                                  ...provided,
                                  color: "#718196",
                                }),
                                control: (base, state) => ({
                                  ...base,
                                  minHeight: 40,
                                  border: "1px solid #E2E8F0",
                                  transition: "0.3s",
                                  "&:hover": {
                                    border: "1px solid #CBD5E0",
                                  },
                                }),
                              }}
                              theme={(theme) => ({
                                ...theme,
                                borderRadius: 6,
                                colors: {
                                  ...theme.colors,
                                  primary: "#3082CE",
                                },
                              })}
                              value={{
                                label: filter.columnLabel,
                                value: filter.columnValue,
                              }}
                              onChange={(value: any) => {
                                var temp = [...filters];
                                temp[index].columnValue = value.value;
                                temp[index].columnLabel = value.label;
                                temp[index].type = value.type;
                                temp[index].filter = "exact";
                                var tv: any = [];
                                switch (value.type) {
                                  case "string":
                                    tv = [""];
                                    break;
                                  case "number":
                                    if (temp[index].filter === "exact") {
                                      tv = [0];
                                    } else {
                                      tv = [0, 0];
                                    }
                                    break;
                                  case "date":
                                    if (temp[index].filter === "exact") {
                                      tv = [new Date()];
                                    } else {
                                      tv = [new Date(), new Date()];
                                    }
                                }
                                temp[index].selectedValues = tv;
                                setFilters(temp);
                              }}
                              classNamePrefix="select"
                              isClearable={false}
                              name="color"
                              // options={displayedColumns}
                              options={tableCells
                                .filter((cell: any) => cell.dataKey[0] !== "_")
                                .map((cell: any) => {
                                  return {
                                    label: `${cell.title} (${cell.group})`,
                                    value: cell.dataKey,
                                    type: cell.type ? cell.type : "text",
                                  };
                                })}
                            />
                          </Box>
                          <Box w="100%">
                            <Text mb="8px">Type</Text>
                            <Input
                              onChange={() => {}}
                              value={filter.type}
                              readOnly
                            />
                          </Box>
                          <Box w="100%">
                            <Text mb="8px">Filter</Text>
                            <Select
                              styles={{
                                menu: (provided) => ({
                                  ...provided,
                                  zIndex: 1000000,
                                }),
                                singleValue: (provided) => ({
                                  ...provided,
                                  color: "#718196",
                                }),
                                control: (base, state) => ({
                                  ...base,
                                  minHeight: 40,
                                  border: "1px solid #E2E8F0",
                                  transition: "0.3s",
                                  "&:hover": {
                                    border: "1px solid #CBD5E0",
                                  },
                                }),
                              }}
                              theme={(theme) => ({
                                ...theme,
                                borderRadius: 6,
                                colors: {
                                  ...theme.colors,
                                  primary: "#3082CE",
                                },
                              })}
                              value={{
                                label:
                                  filter.filter.charAt(0).toUpperCase() +
                                  filter.filter.slice(1),
                                value: filter.filter,
                              }}
                              onChange={(value: any) => {
                                var temp = [...filters];
                                temp[index].filter = value.value;
                                setFilters(temp);
                              }}
                              classNamePrefix="select"
                              isClearable={false}
                              name="filter"
                              options={
                                filterTypes[
                                  filter.type as keyof typeof filterTypes
                                ]
                              }
                            />
                          </Box>
                        </Stack>
                      </Box>
                      <Stack
                        direction={{ base: "column", xl: "row" }}
                        w="100%"
                        spacing={{ base: "20px", xl: "50px" }}
                      >
                        <Box w="100%">
                          <Text mb="8px">Values</Text>
                          {valuesField}
                        </Box>
                      </Stack>
                    </VStack>
                  </Box>
                );
              })}
              <IconButton
                onClick={() => {
                  setFilters([
                    ...filters,
                    {
                      columnValue: "",
                      columnLabel: "",
                      type: "",
                      filter: "exact",
                      values: [],
                      selectedValues: [],
                    } as FilterField,
                  ]);
                }}
                my={5}
                float="right"
                variant="outline"
                aria-label="add-port"
                icon={<BiPlusMedical />}
              />
            </Box>
          </Box>
        </VStack>
      </Box>
    </div>
  );
}

export default SubmissionsTable;
