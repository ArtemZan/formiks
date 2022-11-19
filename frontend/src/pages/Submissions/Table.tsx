/* eslint-disable react-hooks/rules-of-hooks */
import {
  Box,
  Button,
  HStack,
  Input,
  Text,
  useColorModeValue,
  Divider,
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
import EditableTableCell from "../../components/EditableTableCell";
import Creatable from "react-select/creatable";

import { useFps } from "react-fps";
import Select from "react-select";
import { Submission } from "../../types/submission";
import styled from "styled-components";
import DatePicker from "react-datepicker";
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
import _ from "lodash";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import {
  BiPlusMedical,
  RiFileExcel2Line,
  RiUserFill,
  RiGroupFill,
  IoSave,
} from "react-icons/all";
import moment from "moment";
import { toast } from "react-toastify";
import { CheckTreePicker, TagPicker } from "rsuite";
import { DateRangeInput, DateSingleInput } from "../../components/DatePicker";
import { numberWithCommas } from "../../utils/utils";

import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import { FilterField, Template } from "../../types/template";

interface Props {
  history: any;
}

const numRegex = /[0-9]|\./;

const DebugOverlay = styled.div`
  width: 300px;
  background: lightgray;
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 5px 15px;
  border-radius: 10px;
  color: white;
`;

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
var CostStatuses: any[] = [
  { label: "Cost Invoiced", value: "Cost Invoiced" },
  { label: "Cost Not Invoiced", value: "Cost Not Invoiced" },
  { label: "Not Relevant", value: "Not Relevant" },
];

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

async function fetchDropdowns() {
  var dropdownsIds: string[] = [
    "619b630a9a5a2bb37a93b23b",
    "619b61419a5a2bb37a93b237",
    "619b63429a5a2bb37a93b23d",
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

const DisplayedColumnsList = [
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
      // {
      //   label: "SAP Creditor Number",
      //   value: "data.creditorNumber",
      //   type: "string",
      // },
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
        type: "number",
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
        type: "number",
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
        type: "number",
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
        type: "number",
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
        type: "number",
      },
      {
        label: "Total Costs (LC)",
        value: "data.totalCostsLC",
        type: "number",
      },
      {
        label: "Total Profit (LC)",
        value: "data.totalProfitLC",
        type: "number",
      },
      {
        label: "Total Loss (LC)",
        value: "data.totalLossLC",
        type: "number",
      },
      {
        label: "Total Income (EUR)",
        value: "data.totalIncomeEUR",
        type: "number",
      },
      {
        label: "Total Costs (EUR)",
        value: "data.totalCostsEUR",
        type: "number",
      },
      {
        label: "Total Profit (EUR)",
        value: "data.totalProfitEUR",
        type: "number",
      },
      {
        label: "Total Loss (EUR)",
        value: "data.totalLossEUR",
        type: "number",
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
        type: "number",
      },
      {
        label: "Total Costs in SAP (LC)",
        value: "data.totalCostsSAP",
        type: "number",
      },
      {
        label: "Total Income in Tool (LC)",
        value: "data.totalIncomeTool",
        type: "number",
      },
      {
        label: "Total Income in SAP (LC)",
        value: "data.totalIncomeSAP",
        type: "number",
      },
    ],
  },
  {
    label: "Input of Central Marketing Controlling Team",
    value: "CMCT",
    children: [
      {
        label: "Status",
        value: "data.statusCMCT",
        type: "dropdown",
      },
      {
        label: "SAP Document Number",
        value: "data.documentNumberCMCT",
        type: "string",
      },
      {
        label: "Additional Information",
        value: "data.infoCMCT",
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
        label: "Date of Invoicing",
        value: "data.invoicingDateLMD",
        type: "string",
      },
      {
        label: "Requestor",
        value: "data.requestorLMD",
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
        label: "Request Date",
        value: "data.requestDateLMD",
        type: "string",
      },
      {
        label: "Invoice Type",
        value: "data.invoiceTypeLMD",
        type: "string",
      },
      {
        label: "Cancellation Information",
        value: "data.cancellationInfoLMD",
        type: "string",
      },
      {
        label: "Document Currency",
        value: "data.documentCurrencyLMD",
        type: "string",
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
        label: "Text",
        value: "data.textLMD",
        type: "string",
      },
      {
        label: "Amount",
        value: "data.amountLMD",
        type: "number",
      },
      {
        label: "Additional Info on Invoice",
        value: "data.additionalInvoiceInfoLMD",
        type: "string",
      },
      {
        label: "Dunning Stop?",
        value: "data.dunningStopLMD",
        type: "string",
      },
      {
        label: "Payment Method",
        value: "data.paymentMethodLMD",
        type: "string",
      },
      {
        label: "Deposit Number",
        value: "data.depositNumberLMD",
        type: "string",
      },
      {
        label: "Send to",
        value: "data.sendToLMD",
        type: "string",
      },
      {
        label: "Additional Comment",
        value: "data.additionalCommentLMD",
        type: "string",
      },
    ],
  },
];

const DisplayedColumnsListOptions = DisplayedColumnsList.map((group: any) => {
  return group.children.map((column: any) => {
    return {
      label: `${column.label} (${group.label})`,
      value: column.value,
      type: column.type,
    };
  });
}).flat(1);

export function SubmissionsTable(props: Props) {
  const [selectedTemplate, setSelectedTemplate] = useState("local");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [sourceSubmissions, setSourceSubmissions] = useState(new Map());
  const [currentUser, setCurrentUser] = useState({ displayName: "unknown" });
  const [debugOverlayHidden, hideDebugOverlay] = useState(true);
  const [filters, setFilters] = useState<FilterField[]>([]);
  const [displayedColumns, setDisplayedColumns] =
    useState<string[]>(defaultColumns);
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
  // const { fps, avgFps } = useFps(20);
  const [tableWidth, setTableWidth] = useState(1000);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(
    []
  );
  const [
    filteredCommunicationSubmissions,
    setFilteredCommunicationSubmissions,
  ] = useState<Submission[]>([]);
  const [communicationSubmissions, setCommunicationSubmissions] = useState<
    Submission[]
  >([]);
  const [onlyMine, setOnlyMine] = useState(false);
  const [scrollLeft, setScrollLeft] = React.useState(0);
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
    if (f.length > 0 && submissions.length > 0) {
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
            var value = _.get(submission, filter.columnValue);
            if (value === undefined) {
              valid = false;
              return;
            }
            switch (filter.type) {
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
                        .includes(filter.selectedValues[0].toString())
                    ) {
                      valid = false;
                    }
                    break;
                }
                break;
              case "number":
                switch (filter.filter) {
                  case "exact":
                    valid = filter.selectedValues[0] === value;
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
            if (value === undefined) {
              valid = false;
              return;
            }
            switch (filter.type) {
              case "string":
                switch (filter.filter) {
                  case "exact":
                    valid =
                      filter.selectedValues[0].toString() === value.toString();
                    break;
                  case "includes":
                    valid = value
                      .toString()
                      .includes(filter.selectedValues[0].toString());
                    break;
                }
                break;
              case "number":
                switch (filter.filter) {
                  case "exact":
                    valid = filter.selectedValues[0] === value;
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

      cFilteredMap.forEach((value) => {
        if (value.parentId !== null) {
          if (!cFilteredMap.has(value.parentId)) {
            value.parentId = null;
          }
        }
        filteredCommunication.push(value);
      });
      filteredMap.forEach((value) => {
        if (value.parentId !== null) {
          if (!filteredMap.has(value.parentId)) {
            value.parentId = null;
          }
        }
        filtered.push(value);
      });

      setFilteredCommunicationSubmissions(filteredCommunication);
      setFilteredSubmissions(filtered);
    } else {
      setFilteredSubmissions(submissions);
      setFilteredCommunicationSubmissions(communicationSubmissions);
    }
  }, [filters, submissions, communicationSubmissions, onlyMine]);

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

  async function partialUpdate(submission: string, path: string, value: any) {
    setTotalRequests(totalRequests + 1);
    if (path.includes("[")) {
      var s = path.split(".");
      s.shift();
      path = s.join(".");
    }
    RestAPI.updateSubmissionPartial(submission, path, value);
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
  function callSap(submissionId: string) {
    RestAPI.callSapSubmission(submissionId)
      .then((response) => {
        var message = `Order ${response.data.IntOrderOut.EX_ORDERID} has been successfully created`;
        var type = "success";

        switch (response.data.IntOrderOut.EX_SUBRC) {
          case 4:
            message = `Order ${response.data.IntOrderOut.EX_ORDERID} already exists`;
            type = "error";
        }

        toast(
          <Toast
            title={"SAP Response"}
            message={<div dangerouslySetInnerHTML={{ __html: message }} />}
            type={type as ToastType}
          />
        );
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
  //   async function saveCellWidth(cell: string, width: number) {
  //     localStorage.setItem(cell, width.toString());
  //   }
  //   function getCellWidth(cell: string, defaultWidth: number) {
  //     console.log("get");
  //     var value = localStorage.getItem(cell);
  //     if (value !== null) {
  //       return Number(value);
  //     }
  //     return defaultWidth;
  //   }

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
              sub.data.totalIncomeLC += -(
                cs.data.incomeAmountLCSI ||
                0 + cs.data.incomeAmountLCIncomeGL ||
                0
              );
              sub.data.totalCostsLC += -(
                cs.data.costAmountLC ||
                0 + cs.data.costAmountLCCostGL ||
                0
              );
              sub.data.totalIncomeEUR += -(
                cs.data.incomeAmountEURSI ||
                0 + cs.data.incomeAmountEURIncomeGL ||
                0
              );
              sub.data.totalCostsEUR += -(
                cs.data.costAmountEUR ||
                0 + cs.data.costAmountEURCostGL ||
                0
              );
              sub.data.totalCostsTool +=
                cs.data.costAmountLC || 0 + cs.data.costAmountLCCostGL || 0;
              sub.data.totalIncomeTool +=
                cs.data.incomeAmountLCSI ||
                0 + cs.data.incomeAmountLCIncomeGL ||
                0;
            });
        }
      });

      setCommunicationSubmissions(cSubs);
      setFilteredCommunicationSubmissions(cSubs);
      setSourceSubmissions(ss);
      setSubmissions(vSubs);
      setFilteredSubmissions(vSubs);
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

  const tableCells = [
    {
      key: "__expand",
      dataKey: "__expand",
      title: "",
      width: 50,
      frozen: Column.FrozenDirection.LEFT,
      resizable: false,
      cellRenderer: () => <div />,
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
      type: "number",
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
      title: "Project Type",
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

      width: columnWidth("data.manufacturerNumber", 200),
      resizable: true,
      hidden: visibilityController(
        "projectInformation",
        "data.manufacturerNumber"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"value-dropdown"}
          readonly={props.rowData.data.status !== "Incomplete"}
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
            if (typeof value === "object") {
              handleCellUpdate(id, "data.status", "New");
              handleCellUpdate(id, path, value.hersteller);
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
          readonly={props.rowData.data.status !== "Incomplete"}
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
      hidden: visibilityController("projectInformation", "data.PH1"),
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
      hidden: visibilityController("projectInformation", "data.targetAudience"),
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
      hidden: visibilityController(
        "projectInformation",
        "data.marketingResponsible"
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
      key: "data.projectApprover",
      dataKey: "data.projectApprover",
      group: "Project Information",
      title: "Project Approver",
      width: columnWidth("data.projectApprover", 200),
      resizable: true,
      hidden: visibilityController(
        "projectInformation",
        "data.projectApprover"
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
      key: "data.netValueOfServiceOrderedLC",
      dataKey: "data.netValueOfServiceOrderedLC",
      group: "Purchase Order",

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

      width: columnWidth("data.purchaseOrderStatus", 200),
      resizable: true,
      hidden: visibilityController("purchaseOrder", "data.purchaseOrderStatus"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
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
              ? `TOTAL: ${numberWithCommas(totalCostAmountLC)}`
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
      dataKey: "data.costAmountEUR",
      title: "Cost Amount (EUR)",
      width: columnWidth("data.costAmountEUR", 200),
      resizable: true,
      group: "Cost Invoices",

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
              ? `TOTAL: ${numberWithCommas(totalCostAmount)}`
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
      key: "data.incomeAmountLCSI",
      dataKey: "data.incomeAmountLCSI",
      title: "Income Amount (LC)",
      group: "Sales Invoices",

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
              ? `TOTAL: ${numberWithCommas(totalIncomeAmountLC)}`
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
              ? `TOTAL: ${numberWithCommas(totalIncomeAmount)}`
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

      resizable: true,
      hidden: visibilityController("salesInvoices", "data.invoiceStatusSI"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
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
              ? `TOTAL: ${numberWithCommas(totalCostAmountLCCostGL)}`
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
              ? `TOTAL: ${numberWithCommas(totalCostAmountCostGL)}`
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
              ? `TOTAL: ${numberWithCommas(totalIncomeAmountLCIncomeGL)}`
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
              ? `TOTAL: ${numberWithCommas(totalIncomeAmountIncomeGL)}`
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
              ? `TOTAL: ${numberWithCommas(totalIncomeInTool)}`
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
              ? `TOTAL: ${numberWithCommas(totalCostsInTool)}`
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
            totalIncomeInTool + totalCostsInTool >= 0
              ? props.rowData.id === "total"
                ? `TOTAL: ${numberWithCommas(
                    totalIncomeInTool + totalCostsInTool
                  )}`
                : props.rowData.data.totalIncomeLC +
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
            totalIncomeInTool + totalCostsInTool < 0
              ? props.rowData.id === "total"
                ? `TOTAL: ${numberWithCommas(
                    (totalIncomeInTool + totalCostsInTool) * -1
                  )}`
                : (props.rowData.data.totalIncomeLC +
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
              ? `TOTAL: ${numberWithCommas(totalIncomeInToolEUR)}`
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
              ? `TOTAL: ${numberWithCommas(totalCostsInToolEUR)}`
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
                ? `TOTAL: ${numberWithCommas(
                    totalIncomeInToolEUR + totalCostsInToolEUR
                  )}`
                : props.rowData.data.totalIncomeEUR +
                  props.rowData.data.totalCostsEUR
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
            totalIncomeInToolEUR + totalCostsInToolEUR < 0
              ? props.rowData.id === "total"
                ? `TOTAL: ${numberWithCommas(
                    (totalIncomeInToolEUR + totalCostsInToolEUR) * -1
                  )}`
                : (props.rowData.data.totalIncomeEUR +
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
              ? `TOTAL: ${numberWithCommas(
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
              ? `TOTAL: ${numberWithCommas(
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
              ? `TOTAL: ${numberWithCommas(
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
              ? `TOTAL: ${numberWithCommas(
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
      key: "__actions.reject",
      dataKey: "__actions.reject",
      title: "Reject",
      width: columnWidth("__actions.reject", 100),
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
            backgroundColor="#fef9fa"
            onUpdate={(submissionId: string) => {
              handleCellUpdate(submissionId, "data.status", "Rejected");
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
  return (
    <div>
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
          icon={onlyMine ? <RiUserFill /> : <RiGroupFill />}
          onClick={() => {
            setOnlyMine(!onlyMine);
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
            formattedData = filteredSubmissions.map((s) => {
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
                  return;
                }
                group.children.map((column: any, index: number) => {
                  doc[column.value] = _.get(s, column.value);
                  if (column.type === "number") {
                    doc[column.value] = numberWithCommas(doc[column.value]);
                  }
                  if (!init) {
                    header[0][column.value] = index === 0 ? group.label : "";
                    header[1][column.value] = `${column.label}`;
                  }
                });
              });
              init = true;
              return doc;
            });
            header[2] = {
              "data.costAmountLC": `TOTAL: ${numberWithCommas(
                totalCostAmountLC
              )}`,
              "data.costAmountEUR": `TOTAL: ${numberWithCommas(
                totalCostAmount
              )}`,
              "data.incomeAmountLCSI": `TOTAL: ${numberWithCommas(
                totalIncomeAmountLC
              )}`,
              "data.incomeAmountEURSI": `TOTAL: ${numberWithCommas(
                totalIncomeAmount
              )}`,
              "data.costAmountLCCostGL": `TOTAL: ${numberWithCommas(
                totalCostAmountLCCostGL
              )}`,
              "data.costAmountEURCostGL": `TOTAL: ${numberWithCommas(
                totalCostAmountCostGL
              )}`,
              "data.incomeAmountLCIncomeGL": `TOTAL: ${numberWithCommas(
                totalIncomeAmountLCIncomeGL
              )}`,
              "data.incomeAmountEurIncomeGL": `TOTAL: ${numberWithCommas(
                totalIncomeAmountIncomeGL
              )}`,
              "data.totalIncomeLC": `TOTAL: ${numberWithCommas(
                totalIncomeInTool
              )}`,
              "data.totalCostsLC": `TOTAL: ${numberWithCommas(
                totalCostsInTool
              )}`,
              "data.totalProfitLC": `TOTAL: ${numberWithCommas(
                totalIncomeInTool + totalCostsInTool
              )}`,
              "data.totalLossLC": `TOTAL: ${numberWithCommas(
                (totalIncomeInTool + totalCostsInTool) * -1
              )}`,
              "data.totalIncomeEUR": `TOTAL: ${numberWithCommas(
                totalIncomeInToolEUR
              )}`,
              "data.totalCostsEUR": `TOTAL: ${numberWithCommas(
                totalCostsInToolEUR
              )}`,
              "data.totalProfitEUR": `TOTAL: ${numberWithCommas(
                totalIncomeInToolEUR + totalCostsInToolEUR
              )}`,
              "data.totalLossEUR": `TOTAL: ${numberWithCommas(
                (totalIncomeInToolEUR + totalCostsInToolEUR) * -1
              )}`,
              "data.totalCostsTool": `TOTAL: ${numberWithCommas(
                totalCostAmountLC + totalCostAmountLCCostGL
              )}`,
              "data.totalCostsSAP": `TOTAL: ${numberWithCommas(
                totalCostAmountLC + totalCostAmountLCCostGL
              )}`,
              "data.totalIncomeTool": `TOTAL: ${numberWithCommas(
                totalIncomeAmountLC + totalIncomeAmountLCIncomeGL
              )}`,
              "data.totalIncomeSAP": `TOTAL: ${numberWithCommas(
                totalIncomeAmountLC + totalIncomeAmountLCIncomeGL
              )}`,
            };
            formattedData.unshift(...header);
            const ws = XLSX.utils.json_to_sheet(formattedData, {
              skipHeader: true,
            });
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
            FileSaver.saveAs(data, "exported_submissions" + ".xlsx");
          }}
          colorScheme="teal"
          aria-label="export"
          icon={<RiFileExcel2Line />}
        ></IconButton>
      </Box>

      <Box
        w={"100%"}
        bg={useColorModeValue("white", "#21252A")}
        minH={"80vh"}
        mb={5}
        mt={"-20px"}
        border="1px"
        rounded="md"
        borderColor="gray.100"
      >
        <Tabs isLazy={false} variant="enclosed">
          <TabList>
            <Tab>Submissions</Tab>
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
                    // overlayRenderer={
                    //   <div>
                    //     <DebugOverlay hidden={debugOverlayHidden}>
                    //       <Box h="40px" w="100%">
                    //         <CloseButton
                    //           onClick={() => {
                    //             hideDebugOverlay(true);
                    //           }}
                    //           mr="-10px"
                    //           float="right"
                    //         />
                    //       </Box>
                    //       <HStack spacing={0}>
                    //         <Text w="120%" float="left">
                    //           Requested Heap Size:
                    //         </Text>
                    //         <Text w="80%" textAlign="right">
                    //           {heapInfo.total > 0
                    //             ? bytesToSize(heapInfo.total)
                    //             : "none"}
                    //         </Text>
                    //       </HStack>
                    //       <HStack spacing={0}>
                    //         <Text w="120%" float="left">
                    //           Allocated Heap Size:
                    //         </Text>
                    //         <Text w="80%" textAlign="right">
                    //           {heapInfo.total > 0
                    //             ? bytesToSize(heapInfo.allocated)
                    //             : "none"}
                    //         </Text>
                    //       </HStack>
                    //       <HStack spacing={0}>
                    //         <Text w="120%" float="left">
                    //           Active Heap Size:
                    //         </Text>
                    //         <Text w="80%" textAlign="right">
                    //           {heapInfo.total > 0
                    //             ? bytesToSize(heapInfo.current)
                    //             : "none"}
                    //         </Text>
                    //       </HStack>
                    //       <HStack spacing={0}>
                    //         <Text w="120%" float="left">
                    //           DOM Elements:
                    //         </Text>
                    //         <Text w="80%" textAlign="right">
                    //           {heapInfo.domSize}
                    //         </Text>
                    //       </HStack>
                    //       <HStack spacing={0}>
                    //         <Text w="120%" float="left">
                    //           Virtualization:
                    //         </Text>
                    //         <Text w="80%" textAlign="right">
                    //           partial
                    //         </Text>
                    //       </HStack>
                    //       <HStack spacing={0}>
                    //         <Text w="120%" float="left">
                    //           Table Mode:
                    //         </Text>
                    //         <Text w="80%" textAlign="right">
                    //           editable
                    //         </Text>
                    //       </HStack>
                    //       <HStack spacing={0}>
                    //         <Text w="120%" float="left">
                    //           Avg FPS:
                    //         </Text>
                    //         <Text w="80%" textAlign="right">
                    //           {avgFps}
                    //         </Text>
                    //       </HStack>
                    //       <HStack spacing={0}>
                    //         <Text w="120%" float="left">
                    //           FPS:
                    //         </Text>
                    //         <Text w="80%" textAlign="right">
                    //           {fps[fps.length - 1]}
                    //         </Text>
                    //       </HStack>
                    //       <Divider mt={"10px"} />
                    //       <HStack spacing={0}>
                    //         <Text w="120%" float="left">
                    //           Active Sessions:
                    //         </Text>
                    //         <Text w="80%" textAlign="right">
                    //           1
                    //         </Text>
                    //       </HStack>
                    //       <HStack spacing={0}>
                    //         <Text w="120%" float="left">
                    //           Total Requests:
                    //         </Text>
                    //         <Text w="80%" textAlign="right">
                    //           {totalRequests}
                    //         </Text>
                    //       </HStack>
                    //       <HStack spacing={0}>
                    //         <Text w="120%" float="left">
                    //           Sync Protocol:
                    //         </Text>
                    //         <Text w="80%" textAlign="right">
                    //           HTTP
                    //         </Text>
                    //       </HStack>
                    //       <VStack align="end" mt="10px">
                    //         <Button
                    //           float="right"
                    //           onClick={() => {
                    //             RestAPI.updateVendorTableDefaultConfig(
                    //               JSON.parse(
                    //                 localStorage.getItem(
                    //                   "vendors.displayedColumns"
                    //                 ) || "[]"
                    //               ),
                    //               JSON.parse(
                    //                 localStorage.getItem("vendors.columns") ||
                    //                   "{}"
                    //               )
                    //             );
                    //           }}
                    //           colorScheme="blue"
                    //         >
                    //           update preset
                    //         </Button>
                    //         <Button
                    //           float="left"
                    //           onClick={() => {
                    //             localStorage.removeItem(
                    //               "vendors.displayedColumns"
                    //             );
                    //             localStorage.removeItem("vendors.columns");
                    //             window.location.reload();
                    //           }}
                    //           colorScheme="red"
                    //         >
                    //           clear cache
                    //         </Button>
                    //       </VStack>
                    //     </DebugOverlay>
                    //   </div>
                    // }
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
                        cellRenderer: () => <div />,
                        className: "expand",
                      },
                      {
                        key: "data.documentNumberCMCT",
                        dataKey: "data.documentNumberCMCT",
                        title: "SAP Document Number",
                        group: "Input of Central Marketing Controlling Team",
                        header: "Input of Central Marketing Controlling Team",
                        width: columnWidth("data.documentNumberCMCT", 300),
                        resizable: true,
                        hidden: visibilityController(
                          "CMCT",
                          "data.documentNumberCMCT"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"text"}
                            readonly={
                              props.rowData.data.statusLMD !==
                                "OK FOR INVOICING" &&
                              props.rowData.data.statusLMD !== "INVOICED"
                            }
                            invoiced={
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            onUpdate={(
                              submission: string,
                              path: string,
                              value: any
                            ) => {
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
                              handleCommunicationCellUpdate(
                                submission,
                                "data.statusLMD",
                                "INVOICED"
                              );

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
                        key: "data.statusLMD",
                        dataKey: "data.statusLMD",
                        title: "Status",
                        width: columnWidth("data.statusLMD", 300),
                        resizable: true,
                        group: "Input of Local Marketing Department",
                        header: "Input of Local Marketing Department",
                        hidden: visibilityController("LMD", "data.statusLMD"),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"dropdown"}
                            readonly={true}
                            loadOptions={loadOptions}
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
                        key: "data.invoicingDateLMD",
                        dataKey: "data.invoicingDateLMD",
                        title: "Date of Invoicing",
                        width: columnWidth("data.invoicingDateLMD", 200),
                        resizable: true,
                        group: "Input of Local Marketing Department",

                        hidden: visibilityController(
                          "LMD",
                          "data.invoicingDateLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"date"}
                            invoiced={
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            backgroundColor={
                              props.cellData && props.cellData.length > 0
                                ? "#F5FAEF"
                                : "#f7cdd6"
                            }
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
                              props.rowData.data.statusLMD === "INVOICED"
                            }
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
                            invoiced={
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            loadOptions={() => {
                              if (
                                props.rowData.data
                                  .alsoMarketingProjectNumberLMD !== undefined
                              ) {
                                var vs = findSubmissionsByPO(
                                  props.rowData.data
                                    .alsoMarketingProjectNumberLMD
                                );
                                if (vs.length > 0) {
                                  var v: any[] = [];
                                  vs.forEach((s) => {
                                    if (s.data.vendorName !== undefined) {
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
                            backgroundColor={
                              props.cellData && props.cellData.length > 0
                                ? "#F5FAEF"
                                : "#f7cdd6"
                            }
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
                              let set = false;
                              VendorsNames.every((v) => {
                                if (v.label === value) {
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
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            type={"text"}
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
                            invoiced={
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            backgroundColor="#F5FAEF"
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

                        width: columnWidth("data.entryDateLMD", 200),
                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.entryDateLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            type={"date"}
                            readonly
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
                        key: "data.invoiceTypeLMD",
                        dataKey: "data.invoiceTypeLMD",
                        title: "Invoice Type",
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
                            invoiced={
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            readonly={props.rowData.parentId !== null}
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
                            backgroundColor={
                              (props.cellData && props.cellData.length > 0) ||
                              props.rowData.parentId !== null
                                ? "#F5FAEF"
                                : "#f7cdd6"
                            }
                            onUpdate={(
                              submission: string,
                              path: string,
                              value: any
                            ) => {
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
                              }
                              handleCommunicationCellUpdate(
                                submission,
                                "data.statusLMD",
                                ""
                              );
                              handleCommunicationCellUpdate(
                                submission,
                                path,
                                value
                              );
                              handleCommunicationCellUpdate(
                                submission,
                                "data.sendToLMD",
                                "none"
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
                        title: "Cancellation Information",
                        group: "Input of Local Marketing Department",

                        width: columnWidth("data.cancellationInfoLMD", 200),
                        resizable: true,
                        hidden: visibilityController(
                          "LMD",
                          "data.cancellationInfoLMD"
                        ),
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            invoiced={
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            type={"text"}
                            readonly={
                              props.rowData.data.invoiceTypeLMD !==
                              "Cancellation"
                            }
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
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            backgroundColor={
                              props.cellData && props.cellData.length > 0
                                ? "#F5FAEF"
                                : "#f7cdd6"
                            }
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
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            maxLength={12}
                            backgroundColor={
                              props.cellData && props.cellData.length > 0
                                ? "#F5FAEF"
                                : "#f7cdd6"
                            }
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
                              var vs = findSubmissionsByPO(value);
                              if (vs.length < 1) {
                                toast(
                                  <Toast
                                    title={"Unknown Project Number"}
                                    message={"Project Number not found"}
                                    type={"error"}
                                  />
                                );
                              } else {
                                var currentVendor =
                                  props.rowData.data.vendorLMD;
                                if (typeof currentVendor === "string") {
                                  var valid = false;
                                  vs.forEach((s) => {
                                    if (
                                      s.data.vendorName !== undefined &&
                                      currentVendor === s.data.vendorName
                                    ) {
                                      valid = true;
                                    }
                                  });
                                  if (!valid) {
                                    handleCommunicationCellUpdate(
                                      submission,
                                      "data.vendorLMD",
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
                                  vs[0].data.campaignDescription
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
                                    vs.map((s) => {
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
                                toast(
                                  <Toast
                                    title={"Project Found"}
                                    message={"Data copied from parent project"}
                                    type={"success"}
                                  />
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
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            type={"text"}
                            backgroundColor={
                              props.cellData && props.cellData.length > 0
                                ? "#F5FAEF"
                                : "#f7cdd6"
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
                              props.rowData.data.statusLMD === "INVOICED"
                            }
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
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            type={"text"}
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
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            backgroundColor={
                              props.cellData &&
                              props.cellData !== 0 &&
                              props.cellData.toString().trim().length > 0
                                ? "#F5FAEF"
                                : "#f7cdd6"
                            }
                            onUpdate={handleCommunicationCellUpdate}
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
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            type={"dropdown"}
                            loadOptions={() => {
                              return ExchangeRates;
                            }}
                            backgroundColor={
                              props.cellData && props.cellData.length > 0
                                ? "#F5FAEF"
                                : "#f7cdd6"
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
                            invoiced={
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            loadOptions={() => {
                              return [
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
                            }}
                            backgroundColor={
                              props.cellData && props.cellData.length > 0
                                ? "#F5FAEF"
                                : "#f7cdd6"
                            }
                            onUpdate={(
                              submission: string,
                              path: string,
                              value: any
                            ) => {
                              handleCommunicationCellUpdate(
                                submission,
                                "data.statusLMD",
                                ""
                              );
                              var dunningStop = "No";
                              if (
                                value === "Money in House" ||
                                value === "Credit Note from Vendor"
                              ) {
                                dunningStop = "Yes";
                              }
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
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            loadOptions={() => {
                              return [
                                { label: "Yes", value: "Yes" },
                                { label: "No", value: "No" },
                              ];
                            }}
                            backgroundColor={
                              props.cellData && props.cellData.length > 0
                                ? "#F5FAEF"
                                : "#f7cdd6"
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
                        key: "data.depositNumberLMD",
                        dataKey: "data.depositNumberLMD",
                        group: "Input of Local Marketing Department",

                        title: "Deposit Number",
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
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            readonly={
                              typeof props.rowData.data.dunningStopLMD ===
                                "string" &&
                              props.rowData.data.dunningStopLMD.toLowerCase() ===
                                "no"
                            }
                            backgroundColor={
                              props.rowData.data.paymentMethodLMD ===
                              "Money in House"
                                ? props.cellData && props.cellData.length > 0
                                  ? "#F5FAEF"
                                  : "#f7cdd6"
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
                              props.rowData.data.statusLMD === "INVOICED"
                            }
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
                              props.rowData.data.statusLMD === "INVOICED"
                            }
                            type={"text"}
                            backgroundColor={
                              props.cellData && props.cellData.length > 0
                                ? "#F5FAEF"
                                : "#f7cdd6"
                            }
                            readonly={
                              props.rowData.data.invoiceTypeLMD ===
                              "Internal Invoice"
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
                        key: "__actions.validate",
                        dataKey: "__actions.validate",
                        title: "",
                        width: columnWidth("__actions.validate", 100),
                        resizable: false,
                        header: "Actions",
                        className: "red-border",
                        cellRenderer: (props: any) =>
                          props.rowData.parentId === null ? (
                            <EditableTableCell
                              invoiced={
                                props.rowData.data.statusLMD === "INVOICED"
                              }
                              type={"button"}
                              backgroundColor="#fef9fa"
                              textColor={"green"}
                              onUpdate={(submissionId: string) => {
                                var targetSubmissionIndex =
                                  communicationSubmissions.findIndex(
                                    (s) => s.id === submissionId
                                  );
                                if (targetSubmissionIndex > -1) {
                                  var is: Submission[] = [];
                                  is.push(
                                    communicationSubmissions[
                                      targetSubmissionIndex
                                    ]
                                  );

                                  if (is[0].parentId === null) {
                                    communicationSubmissions.forEach((s) => {
                                      if (s.parentId === submissionId) {
                                        is.push(s);
                                      }
                                    });
                                  }

                                  is.forEach((ts, tsi) => {
                                    if (
                                      ts.data.invoicingDateLMD &&
                                      ts.data.invoicingDateLMD.length > 0 &&
                                      ts.data.vendorLMD &&
                                      ts.data.vendorLMD.length > 0 &&
                                      ts.data.invoiceTypeLMD &&
                                      ts.data.invoiceTypeLMD.length > 0 &&
                                      ts.data.materialNumberLMD &&
                                      ts.data.materialNumberLMD.length > 0 &&
                                      ts.data.alsoMarketingProjectNumberLMD &&
                                      ts.data.alsoMarketingProjectNumberLMD
                                        .length > 0 &&
                                      ts.data.invoiceTextLMD &&
                                      ts.data.invoiceTextLMD.length > 0 &&
                                      ts.data.amountLMD &&
                                      typeof ts.data.amountLMD === "number" &&
                                      ts.data.documentCurrencyLMD &&
                                      ts.data.documentCurrencyLMD.length > 0 &&
                                      ts.data.paymentMethodLMD &&
                                      ts.data.paymentMethodLMD.length > 0 &&
                                      ts.data.dunningStopLMD &&
                                      ts.data.dunningStopLMD.length > 0 &&
                                      ts.data.sendToLMD &&
                                      ts.data.sendToLMD.length > 0 &&
                                      (ts.data.paymentMethodLMD ===
                                      "Money in House"
                                        ? ts.data.depositNumberLMD &&
                                          ts.data.depositNumberLMD.length > 0
                                        : true)
                                    ) {
                                      var today = new Date();
                                      today.setHours(23, 59, 59, 998);
                                      if (
                                        ts.data.invoicingDateLMD &&
                                        new Date(ts.data.invoicingDateLMD) >
                                          today
                                      ) {
                                        handleCommunicationCellUpdate(
                                          ts.id!,
                                          "data.statusLMD",
                                          "FUTURE INVOICE"
                                        );
                                      } else {
                                        handleCommunicationCellUpdate(
                                          ts.id!,
                                          "data.statusLMD",
                                          "OK FOR INVOICING"
                                        );
                                      }
                                      toast(
                                        <Toast
                                          title={"Successful Validation"}
                                          message={
                                            (tsi === 0 ? `Parent` : "Child") +
                                            " submission validated successfully"
                                          }
                                          type={"success"}
                                        />
                                      );
                                    } else {
                                      toast(
                                        <Toast
                                          title={"Incomplete Request"}
                                          message={
                                            (tsi === 0 ? `Parent` : "Child") +
                                            " submission could not be validated: incomplete data"
                                          }
                                          type={"error"}
                                        />
                                      );

                                      handleCommunicationCellUpdate(
                                        ts.id!,
                                        "data.statusLMD",
                                        "INCOMPLETE"
                                      );
                                    }
                                  });
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
                        width: columnWidth("__actions.create", 100),
                        resizable: false,
                        className: "red-border",
                        cellRenderer: (props: any) =>
                          props.rowData.parentId === null ? (
                            <EditableTableCell
                              type={"button"}
                              invoiced={
                                props.rowData.data.statusLMD === "INVOICED"
                              }
                              backgroundColor="#fef9fa"
                              textColor={"blue"}
                              onUpdate={(submissionId: string) => {
                                var submission: Submission = {
                                  project: props.rowData.project,
                                  parentId: submissionId,
                                  viewId: null,
                                  group: "communication",
                                  created: new Date(),
                                  updated: new Date(),
                                  title: "",
                                  author: "",
                                  status: "",
                                  data: {},
                                };
                                RestAPI.createSubmission(submission).then(
                                  (response) => {
                                    var temp = [...communicationSubmissions];
                                    temp.push(response.data);
                                    setCommunicationSubmissions(temp);
                                  }
                                );
                              }}
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
                        key: "__actions.delete",
                        dataKey: "__actions.delete",
                        title: "",
                        width: columnWidth("__actions.delete", 100),
                        resizable: false,
                        className: "red-border",
                        cellRenderer: (props: any) => (
                          <EditableTableCell
                            invoiced={
                              props.rowData.data.statusLMD === "INVOICED"
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
                                materialNumberLMD: "7000100",
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
        bg={useColorModeValue("white", "#21252A")}
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
              if (value.length < 1) {
                values = defaultColumns;
              } else {
                value.forEach((v) => {
                  values.push(v.toString());
                });
              }

              if (selectedTemplate === "local") {
                localStorage.setItem(
                  "vendors.displayedColumns",
                  JSON.stringify(values)
                );
              }
              setDisplayedColumns(values);
            }}
            value={displayedColumns}
            data={DisplayedColumnsList}
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
                var template = templates.find((t) => t.name == name.label);
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
                          <NumberInput
                            onChange={(_, value) => {
                              var temp = [...filters];
                              temp[index].selectedValues[0] = value;
                              setFilters(temp);
                            }}
                            value={filter.selectedValues[0]}
                            w="100%"
                          >
                            <NumberInputField />
                            <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper>
                          </NumberInput>
                        );
                        break;
                      case "range":
                        valuesField = (
                          <Stack direction={{ base: "column", md: "row" }}>
                            <NumberInput
                              w="100%"
                              onChange={(_, value) => {
                                var temp = [...filters];
                                temp[index].selectedValues[0] = value;
                                setFilters(temp);
                              }}
                              value={filter.selectedValues[0]}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
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
                              onChange={(_, value) => {
                                var temp = [...filters];
                                temp[index].selectedValues[1] = value;
                                setFilters(temp);
                              }}
                              value={filter.selectedValues[1]}
                            >
                              <NumberInputField />
                              <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper>
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
                                }
                                temp[index].selectedValues = tv;
                                setFilters(temp);
                              }}
                              classNamePrefix="select"
                              isClearable={false}
                              name="color"
                              options={DisplayedColumnsListOptions}
                              // options={tableCells
                              //   .filter((cell: any) => cell.dataKey[0] !== "_")
                              //   .map((cell: any) => {
                              //     console.log(cell.cellRenderer.arguments[0]);
                              //     return {
                              //       label: `${cell.title} (${cell.group})`,
                              //       value: cell.dataKey,
                              //       type: cell.type ? cell.type : "text",
                              //     };
                              //   })}
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
