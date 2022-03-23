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

import { useFps } from "react-fps";
import Select from "react-select";
import { Submission } from "../../types/submission";
import styled from "styled-components";
import DatePicker from "react-datepicker";
import Toast from "../../components/Toast";
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
import { BiPlusMedical } from "react-icons/all";
import moment from "moment";
import { toast } from "react-toastify";
import { CheckTreePicker, TagPicker } from "rsuite";
import { DateRangeInput, DateSingleInput } from "../../components/DatePicker";
import { numberWithCommas } from "../../utils/utils";

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
var CampaignChannel: any[] = [];
var TargetAudience: any[] = [];
var Budget: any[] = [];
var ExchangeRates: any[] = [];
var FiscalQuarter: any[] = [];
var Year: any[] = [];
var ProjectStartQuarter: any[] = [];
var SapStatus: any[] = [
  { label: "Created", value: "created" },
  { label: "None", value: "none" },
];
var CostStatuses: any[] = [
  { label: "Cost Invoiced", value: "Cost Invoiced" },
  { label: "Cost Not Invoiced", value: "Cost Not Invoiced" },
  { label: "Not Relevant", value: "Not Relevant" },
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
}

const loadOptions = (identifier: string) => {
  switch (identifier) {
    case "data.projectType":
      return ProjectType;
    case "data.ph1":
      return PH1;
    case "data.campaignChannel":
      return CampaignChannel;
    case "data.targetAudience":
      return TargetAudience;
    case "data.budgetCurrency":
      return ExchangeRates;
    case "data.sapStatus":
      return SapStatus;
    case "data.caVendorName":
    case "data.vendorName":
    case "data.vendorNameSA":
      return VendorsNames;
    case "data.costStatus":
      return CostStatuses;
  }
  return [];
};

function bytesToSize(bytes: number) {
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  var i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

interface FilterField {
  columnValue: string;
  columnLabel: string;
  type: string;
  filter: string;
  values: any[];
  selectedValues: any[];
}
const filterTypes = {
  text: [
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
      { label: "Project Name", value: "data.projectName", type: "string" },
      {
        label: "Campaign Start Date",
        value: "data.campaignStartDate",
        type: "date",
      },
      { label: "Project Type", value: "data.projectType", type: "dropdown" },
    ],
  },
  {
    label: "Project Information",
    value: "projectInformation",
    children: [
      { label: "Countries EMEA", value: "data.countriesEMEA", type: "string" },
      { label: "% Country Share", value: "data.countryShare", type: "number" },
      {
        label: "Country Budget Contribution (EUR)",
        value: "data.countryBudgetContributionEUR",
        type: "number",
      },
      {
        label: "Country Cost Estimation (EUR)",
        value: "data.countryCostEstimationEUR",
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
      {
        label: "SAP Creditor Number",
        value: "data.creditorNumber",
        type: "string",
      },
      { label: "MDF Level", value: "data.mdfLevel", type: "dropdown" },
      {
        label: "Vendor Budget Currency",
        value: "data.vendorBudgetCurrency",
        type: "dropdown",
      },
      {
        label: "Estimated Income (Budget Currency)",
        value: "data.estimatedIncomeBC",
        type: "number",
      },
      {
        label: "Estimated Costs (Budget Currency)",
        value: "data.estimatedCostsBC",
        type: "number",
      },
      {
        label: "Estimated Result (Budget Currency)",
        value: "data.estimatedResultBC",
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
      { label: "Posting Date", value: "data.postingDate", type: "string" },
      { label: "Document Date", value: "data.documentDate", type: "string" },
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
      { label: "Posting Date", value: "data.postingDateSI", type: "string" },
      { label: "Document Date", value: "data.documentDateSI", type: "string" },
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
      { label: "Income Status", value: "data.incomeStatusSI", type: "string" },
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
        type: "string",
      },
      {
        label: "Document Date",
        value: "data.documentDateCostGL",
        type: "string",
      },
      {
        label: "Document Number",
        value: "data.documentNumberCostGL",
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
        type: "string",
      },
      {
        label: "Document Date",
        value: "data.documentDateIncomeGL",
        type: "string",
      },
      {
        label: "Document Number",
        value: "data.documentNumberIncomeGL",
        type: "string",
      },
      {
        label: "Income Account",
        value: "data.incomeAccountIncomeGL",
        type: "string",
      },
      {
        label: "Name 1",
        value: "data.name1IncomeGL",
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
      { label: "Result (LC)", value: "data.resultLCPR", type: "string" },
      { label: "Result (EUR)", value: "data.resultEURPR", type: "string" },
    ],
  },
  {
    label: "Control Checks",
    value: "controlChecks",
    children: [
      {
        label: "Total Costs in Tool",
        value: "data.totalCostsInTool",
        type: "formula",
      },
      {
        label: "Total Costs in SAP",
        value: "data.totalCostsInSAP",
        type: "string",
      },
      {
        label: "Total Income in Tool",
        value: "data.totalIncomeInTool",
        type: "string",
      },
      {
        label: "Total Income in SAP",
        value: "data.totalIncomeInSAP",
        type: "string",
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
        type: "string",
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
        type: "string",
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
        type: "string",
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

export function VendorsTable(props: Props) {
  const [currentUser, setCurrentUser] = useState({ displayName: "unknown" });
  const [debugOverlayHidden, hideDebugOverlay] = useState(false);
  const [filters, setFilters] = useState<FilterField[]>([]);
  const [displayedColumns, setDisplayedColumns] = useState<string[]>([
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
  ]);
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
  const { fps, avgFps } = useFps(20);
  const [tableWidth, setTableWidth] = useState(1000);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(
    []
  );
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
  const [heapInfo, setHeapInfo] = useState<any>({
    total: 0,
    allocated: 0,
    current: 0,
    domSize: 0,
  });
  const [totalRequests, setTotalRequests] = useState(1);

  useEffect(() => {
    fetchDropdowns().then(() => forceUpdate());
  }, []);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    getHeapInfo();
    const interval = setInterval(() => {
      getHeapInfo();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let tca = 0;
    let tcal = 0;
    let tcit = 0;
    let tcacgl = 0;
    let tia = 0;
    let tial = 0;
    let tcalcgl = 0;
    let tialigl = 0;
    let tiaigl = 0;
    filteredSubmissions.forEach((subm) => {
      if (subm.parentId !== null) {
        tcit +=
          subm.data.costAmountEUR || 0 + subm.data.costAmountEURCostGL || 0;
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
    setTotalCostAmount(tca);
    setTotalCostAmountCostGL(tcacgl);
    setTotalCostAmountLC(tcal);
    setTotalCostAmountLCCostGL(tcalcgl);
    setTotalIncomeAmount(tia);
    setTotalIncomeAmountLCIncomeGL(tialigl);
    setTotalIncomeAmountLC(tial);
    setTotalIncomeAmountIncomeGL(tiaigl);
    setTotalCostsInTool(tcit);
  }, [filteredSubmissions]);
  // useEffect(() => {
  //   RestAPI.getVendorTableDefaultConfig().then((response) => {
  //     if (response.data.columnsWidth !== null) {
  //       setDefaultColumnsWidth(response.data.columnsWidth);
  //     }
  //     if (response.data.displayedColumns !== null) {
  //       if (response.data.displayedColumns.length > 0) {
  //         setDisplayedColumns(response.data.displayedColumns);
  //       }
  //     }

  //     var cw = localStorage.getItem("vendors.columns");
  //     if (cw !== null) {
  //       setDefaultColumnsWidth(JSON.parse(cw));
  //     }
  //     var dc = localStorage.getItem("vendors.displayedColumns");
  //     if (dc !== null) {
  //       setDisplayedColumns(JSON.parse(dc));
  //     }
  //   });
  // }, []);
  useEffect(() => {
    var filtered: Submission[] = [];
    if (filters.length > 0 && submissions.length > 0) {
      submissions.forEach((submission) => {
        var valid = true;
        filters.forEach((filter) => {
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
              case "text":
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
          filtered.push(submission);
        }
      });
      setFilteredSubmissions(filtered);
    } else {
      setFilteredSubmissions(submissions);
    }
  }, [filters, submissions]);

  const getHeapInfo = () => {
    var memory = (window.performance as any).memory;
    if (memory !== undefined) {
      var info: any = {
        total: memory.jsHeapSizeLimit,
        allocated: memory.totalJSHeapSize,
        current: memory.usedJSHeapSize,
        domSize: document.getElementsByTagName("*").length,
      };
      setHeapInfo(info);
    }
  };
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
        const visibleCells = visibleIndices.map((x) => cells[x]);

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
        toast(
          <Toast
            title={"SAP Response"}
            message={
              <div dangerouslySetInnerHTML={{ __html: response.data }} />
            }
            type={"success"}
          />
        );
        var submissionIndex = submissions.findIndex(
          (s) => s.id === submissionId
        );
        if (submissionIndex > -1) {
          var temp = [...submissions];
          temp[submissionIndex].data["sapStatus"] = "created";
          partialUpdate(submissionId, "data.sapStatus", "created");
          setSubmissions(temp);
        }
      })
      .catch((error) => {
        toast(
          <Toast
            title={"SAP Response"}
            message={
              <div dangerouslySetInnerHTML={{ __html: error.response.data }} />
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
    RestAPI.getSubmissions().then((response) => {
      var vSubs: Submission[] = [];
      var subs = response.data;
      subs.forEach((sub) => {
        if (sub.project === "619515b754e61c8dd33daa52") {
          vSubs.push(sub);
        }
      });

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
          type={"number"}
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
      key: "data.countriesEMEA",
      dataKey: "data.countriesEMEA",
      title: "Countries EMEA",
      header: "Project Information",
      width: columnWidth("data.countriesEMEA", 250),
      resizable: true,
      group: "Project Information",

      hidden: visibilityController("projectInformation", "data.countriesEMEA"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
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
      key: "data.countryShare",
      dataKey: "data.countryShare",
      title: "% Country Share",
      width: columnWidth("data.countryShare", 200),
      resizable: true,
      group: "Project Information",

      hidden: visibilityController("projectInformation", "data.countryShare"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
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
      key: "data.countryBudgetContributionEUR",
      dataKey: "data.countryBudgetContributionEUR",
      title: "Country Budget Contribution (EUR)",
      width: columnWidth("data.countryBudgetContributionEUR", 250),
      resizable: true,
      group: "Project Information",

      hidden: visibilityController(
        "projectInformation",
        "data.countryBudgetContributionEUR"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
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
      key: "data.countryCostEstimationEUR",
      dataKey: "data.countryCostEstimationEUR",
      title: "Country Cost Estimation (EUR)",
      width: columnWidth("data.countryCostEstimationEUR", 250),
      resizable: true,
      group: "Project Information",

      hidden: visibilityController(
        "projectInformation",
        "data.countryCostEstimationEUR"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
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
          type={"text"}
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
      key: "data.creditorNumber",
      dataKey: "data.creditorNumber",
      group: "Project Information",

      title: "SAP Creditor Number",
      width: columnWidth("data.creditorNumber", 200),
      resizable: true,
      hidden: visibilityController("projectInformation", "data.creditorNumber"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
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
      key: "data.mdfLevel",
      dataKey: "data.mdfLevel",
      title: "MDF Level",
      width: columnWidth("data.mdfLevel", 200),
      resizable: true,
      group: "Project Information",

      hidden: visibilityController("projectInformation", "data.mdfLevel"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
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
          type={"text"}
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
      key: "data.estimatedIncomeBC",
      dataKey: "data.estimatedIncomeBC",
      group: "Project Information",

      title: "Estimated Income (Budget Currency)",
      width: columnWidth("data.estimatedIncomeBC", 200),
      resizable: true,
      hidden: visibilityController(
        "projectInformation",
        "data.estimatedIncomeBC"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
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
      key: "data.estimatedCostsBC",
      group: "Project Information",

      dataKey: "data.estimatedCostsBC",
      title: "Estimated Costs (Budget Currency)",
      width: columnWidth("data.estimatedCostsBC", 200),
      resizable: true,
      hidden: visibilityController(
        "projectInformation",
        "data.estimatedCostsBC"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
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
      key: "data.estimatedResultBC",
      dataKey: "data.estimatedResultBC",
      title: "Estimated Result (Budget Currency)",
      group: "Project Information",

      width: columnWidth("data.estimatedResultBC", 200),
      resizable: true,
      hidden: visibilityController(
        "projectInformation",
        "data.estimatedResultBC"
      ),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
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
          type={"text"}
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
          type={"text"}
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
          type={"text"}
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
          type={"text"}
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
          type={"text"}
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
          type={"text"}
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
          type={"text"}
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
          type={"text"}
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
      key: "data.postingDate",
      dataKey: "data.postingDate",
      title: "Posting Date",
      width: columnWidth("data.postingDate", 200),
      group: "Cost Invoices",

      resizable: true,
      hidden: visibilityController("costInvoices", "data.postingDate"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
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
      key: "data.documentDate",
      dataKey: "data.documentDate",
      title: "Document Date",
      group: "Cost Invoices",

      width: columnWidth("data.documentDate", 200),
      resizable: true,
      hidden: visibilityController("costInvoices", "data.documentDate"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
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
          backgroundColor="#fff7f8"
          readonly={true}
          bold={props.rowData.parentId === null}
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${numberWithCommas(totalCostAmountLC)}`
              : props.rowData.parentId === null
              ? filteredSubmissions.reduce(
                  (a, b) =>
                    a +
                    (b.parentId === props.rowData.id
                      ? b.data.costAmountLC || 0
                      : 0),
                  0
                )
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
          backgroundColor="#fff7f8"
          readonly={true}
          bold={props.rowData.parentId === null}
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${numberWithCommas(totalCostAmount)}`
              : props.rowData.parentId === null
              ? filteredSubmissions.reduce(
                  (a, b) =>
                    a +
                    (b.parentId === props.rowData.id
                      ? b.data.costAmountEUR || 0
                      : 0),
                  0
                )
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
          type={"text"}
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
          backgroundColor="#f2f5fa"
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
          backgroundColor="#f2f5fa"
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
          type={"text"}
          backgroundColor="#f2f5fa"
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
          type={"text"}
          backgroundColor="#f2f5fa"
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
          backgroundColor="#f2f5fa"
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
          backgroundColor="#f2f5fa"
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
          backgroundColor="#f2f5fa"
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
          backgroundColor="#f2f5fa"
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
          backgroundColor="#f2f5fa"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${numberWithCommas(totalIncomeAmountLC)}`
              : props.rowData.parentId === null
              ? filteredSubmissions.reduce(
                  (a, b) =>
                    a +
                    (b.parentId === props.rowData.id
                      ? b.data.incomeAmountLCSI || 0
                      : 0),
                  0
                )
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
          type={"text"}
          backgroundColor="#f2f5fa"
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
          backgroundColor="#f2f5fa"
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
          backgroundColor="#f2f5fa"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${numberWithCommas(totalIncomeAmount)}`
              : props.rowData.parentId === null
              ? filteredSubmissions.reduce(
                  (a, b) =>
                    a +
                    (b.parentId === props.rowData.id
                      ? b.data.incomeAmountEURSI || 0
                      : 0),
                  0
                )
              : props.cellData
          }
        />
      ),
    },
    {
      key: "data.incomeStatusSI",
      dataKey: "data.incomeStatusSI",
      title: "Income Status",
      width: columnWidth("data.incomeStatusSI", 200),
      group: "Sales Invoices",

      resizable: true,
      hidden: visibilityController("salesInvoices", "data.incomeStatusSI"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          backgroundColor="#f2f5fa"
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
          backgroundColor="#fcfcfe"
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
          backgroundColor="#fcfcfe"
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
          type={"text"}
          backgroundColor="#fcfcfe"
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
          type={"text"}
          backgroundColor="#fcfcfe"
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
          backgroundColor="#fcfcfe"
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
          backgroundColor="#fcfcfe"
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
          backgroundColor="#fcfcfe"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${numberWithCommas(totalCostAmountLCCostGL)}`
              : props.rowData.parentId === null
              ? filteredSubmissions.reduce(
                  (a, b) =>
                    a +
                    (b.parentId === props.rowData.id
                      ? b.data.costAmountLCCostGL || 0
                      : 0),
                  0
                )
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
          backgroundColor="#fcfcfe"
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
          backgroundColor="#fcfcfe"
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
          backgroundColor="#fcfcfe"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${numberWithCommas(totalCostAmountCostGL)}`
              : props.rowData.parentId === null
              ? filteredSubmissions.reduce(
                  (a, b) =>
                    a +
                    (b.parentId === props.rowData.id
                      ? b.data.costAmountEURCostGL || 0
                      : 0),
                  0
                )
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
          type={"text"}
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
          type={"text"}
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
      key: "data.name1IncomeGL",
      dataKey: "data.name1IncomeGL",
      title: "Name 1",
      width: columnWidth("data.name1IncomeGL", 200),
      group: "Income GL Postings",

      resizable: true,
      hidden: visibilityController("incomeGlPostings", "data.name1IncomeGL"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
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
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${numberWithCommas(totalIncomeAmountLCIncomeGL)}`
              : props.rowData.parentId === null
              ? filteredSubmissions.reduce(
                  (a, b) =>
                    a +
                    (b.parentId === props.rowData.id
                      ? b.data.incomeAmountLCIncomeGL || 0
                      : 0),
                  0
                )
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
          type={"text"}
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
          backgroundColor="#f2fcfc"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={
            props.rowData.id === "total"
              ? `TOTAL: ${numberWithCommas(totalIncomeAmountIncomeGL)}`
              : props.rowData.parentId === null
              ? filteredSubmissions.reduce(
                  (a, b) =>
                    a +
                    (b.parentId === props.rowData.id
                      ? b.data.incomeAmountEurIncomeGL || 0
                      : 0),
                  0
                )
              : props.cellData
          }
        />
      ),
    },
    {
      key: "data.resultLCPR",
      dataKey: "data.resultLCPR",
      title: "Result (LC)",
      header: "Project Results",
      group: "Project Results",

      width: columnWidth("data.resultLCPR", 200),
      resizable: true,
      hidden: visibilityController("projectResults", "data.resultLCPR"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          backgroundColor="#f9f8f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.resultEURPR",
      dataKey: "data.resultEURPR",
      title: "Result (EUR)",
      width: columnWidth("data.resultEURPR", 200),
      group: "Project Results",

      resizable: true,
      hidden: visibilityController("projectResults", "data.resultEURPR"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          backgroundColor="#f9f8f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.totalCostsInTool",
      dataKey: "data.totalCostsInTool",
      title: "Total Costs in Tool",
      header: "Control Checks",
      width: columnWidth("data.totalCostsInTool", 200),
      group: "Control Checks",

      resizable: true,
      hidden: visibilityController("controlChecks", "data.totalCostsInTool"),
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
              : props.rowData.parentId === null
              ? filteredSubmissions.reduce(
                  (a, b) =>
                    a +
                    (b.parentId === props.rowData.id
                      ? b.data.costAmountEUR ||
                        0 + b.data.costAmountEURCostGL ||
                        0
                      : 0),
                  0
                )
              : props.cellData
          }
        />
      ),
    },
    {
      key: "data.totalCostsInSAP",
      dataKey: "data.totalCostsInSAP",
      title: "Total Costs in SAP",
      width: columnWidth("data.totalCostsInSAP", 200),
      resizable: true,
      group: "Control Checks",

      hidden: visibilityController("controlChecks", "data.totalCostsInSAP"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          backgroundColor="#f9f8f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.totalIncomeInTool",
      dataKey: "data.totalIncomeInTool",
      title: "Total Income in Tool",
      width: columnWidth("data.totalIncomeInTool", 200),
      resizable: true,
      group: "Control Checks",

      hidden: visibilityController("controlChecks", "data.totalIncomeInTool"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly={true}
          backgroundColor="#f9f8f8"
          onUpdate={() => {}}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={numberWithCommas(
            props.rowData.data.incomeAmountEURSI +
              props.rowData.data.incomeAmountEurIncomeGL
          )}
        />
      ),
    },
    {
      key: "data.totalIncomeInSAP",
      dataKey: "data.totalIncomeInSAP",
      title: "Total Income in SAP",
      width: columnWidth("data.totalIncomeInSAP", 200),
      resizable: true,
      group: "Control Checks",

      hidden: visibilityController("controlChecks", "data.totalIncomeInSAP"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          backgroundColor="#f9f8f8"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.statusCMCT",
      dataKey: "data.statusCMCT",
      title: "Status",
      width: columnWidth("data.statusCMCT", 300),
      resizable: true,
      group: "Input of Central Marketing Controlling Team",

      header: "Input of Central Marketing Controlling Team",
      hidden: visibilityController("CMCT", "data.statusCMCT"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          backgroundColor="#f9f9ff"
          onUpdate={(submission: string, path: string, value: any) => {
            handleCellUpdate(submission, "data.dateCMCT", new Date());
            handleCellUpdate(
              submission,
              "data.operatorCMCT",
              currentUser.displayName
            );
            handleCellUpdate(submission, path, value);
          }}
          loadOptions={() => {
            return [
              { label: "INVOICED", value: "INVOICED" },
              { label: "REJECTED", value: "REJECTED" },
            ];
          }}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.documentNumberCMCT",
      dataKey: "data.documentNumberCMCT",
      title: "SAP Document Number",
      group: "Input of Central Marketing Controlling Team",

      width: columnWidth("data.documentNumberCMCT", 200),
      resizable: true,
      hidden: visibilityController("CMCT", "data.documentNumberCMCT"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          backgroundColor="#f9f9ff"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.infoCMCT",
      dataKey: "data.infoCMCT",
      title: "Additional Information",
      width: columnWidth("data.infoCMCT", 200),
      group: "Input of Central Marketing Controlling Team",

      resizable: true,
      hidden: visibilityController("CMCT", "data.infoCMCT"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          backgroundColor="#f9f9ff"
          onUpdate={handleCellUpdate}
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
          backgroundColor="#f9f9ff"
          onUpdate={handleCellUpdate}
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

      hidden: visibilityController("CMCT", "data.operatorCMCT"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          backgroundColor="#f9f9ff"
          onUpdate={handleCellUpdate}
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
          type={"text"}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
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

      hidden: visibilityController("LMD", "data.invoicingDateLMD"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"date"}
          backgroundColor="#F5FAEF"
          onUpdate={(submission: string, path: string, value: any) => {
            handleCellUpdate(
              submission,
              "data.requestorLMD",
              currentUser.displayName
            );
            handleCellUpdate(submission, path, value);
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
      hidden: visibilityController("LMD", "data.requestorLMD"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
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
      width: columnWidth("data.vendorLMD", 200),
      group: "Input of Local Marketing Department",

      resizable: true,
      hidden: visibilityController("LMD", "data.vendorLMD"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          loadOptions={() => {
            let childVendors: any[] = [];
            submissions.forEach((submission) => {
              if (submission.parentId === props.rowData.id) {
                childVendors.push({
                  label: submission.data.vendorName,
                  value: submission.data.vendorName,
                });
              }
            });
            return childVendors;
          }}
          backgroundColor="#F5FAEF"
          onUpdate={(submission: string, path: string, value: any) => {
            handleCellUpdate(submission, path, value);
            let set = false;
            VendorsNames.every((v) => {
              if (v.label === value) {
                handleCellUpdate(
                  submission,
                  "data.vodLMD",
                  v.value.debitorischer
                );
                handleCellUpdate(submission, "data.buLMD", v.value.bu);
                set = true;
                return false;
              }
              return true;
            });
            if (!set) {
              handleCellUpdate(submission, "data.vodLMD", "");
              handleCellUpdate(submission, "data.buLMD", "");
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
          type={"text"}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
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
          type={"text"}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.requestDateLMD",
      dataKey: "data.requestDateLMD",
      title: "Request Date",
      group: "Input of Local Marketing Department",

      width: columnWidth("data.requestDateLMD", 200),
      resizable: true,
      hidden: visibilityController("LMD", "data.requestDateLMD"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"date"}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
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
      hidden: visibilityController("LMD", "data.invoiceTypeLMD"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          loadOptions={() => {
            return [
              { label: "Marketing Invoice", value: "Marketing Invoice" },
              { label: "Pre-Invoice", value: "Pre-Invoice" },
              { label: "Credit Note", value: "Credit Note" },
              { label: "Cancellation", value: "Cancellation" },
              { label: "Internal Invoice", value: "Internal Invoice" },
            ];
          }}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
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
      hidden: visibilityController("LMD", "data.cancellationInfoLMD"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.documentCurrencyLMD",
      dataKey: "data.documentCurrencyLMD",
      title: "Document Currency",
      group: "Input of Local Marketing Department",

      width: columnWidth("data.documentCurrencyLMD", 200),
      resizable: true,
      hidden: visibilityController("LMD", "data.documentCurrencyLMD"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          loadOptions={() => {
            return ExchangeRates;
          }}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
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

      hidden: visibilityController("LMD", "data.materialNumberLMD"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
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
      width: columnWidth("data.reasonLMD", 200),
      group: "Input of Local Marketing Department",

      resizable: true,
      hidden: visibilityController("LMD", "data.reasonLMD"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.textLMD",
      dataKey: "data.textLMD",
      group: "Input of Local Marketing Department",

      title: "Text",
      width: columnWidth("data.textLMD", 200),
      resizable: true,
      hidden: visibilityController("LMD", "data.textLMD"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
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
          type={"text"}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.additionalInvoiceInfoLMD",
      dataKey: "data.additionalInvoiceInfoLMD",
      title: "Additional Info on Invoice",
      group: "Input of Local Marketing Department",

      width: columnWidth("data.additionalInvoiceInfoLMD", 200),
      resizable: true,
      hidden: visibilityController("LMD", "data.additionalInvoiceInfoLMD"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
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
      hidden: visibilityController("LMD", "data.dunningStopLMD"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          loadOptions={() => {
            return [
              { label: "Yes", value: "Yes" },
              { label: "No", value: "No" },
            ];
          }}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
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
      hidden: visibilityController("LMD", "data.paymentMethodLMD"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          loadOptions={() => {
            return [
              { label: "Payment", value: "Payment" },
              { label: "Money in the House", value: "Money in the House" },
              {
                label: "Credit Note from Vendor",
                value: "Credit Note from Vendor",
              },
            ];
          }}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
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
      hidden: visibilityController("LMD", "data.depositNumberLMD"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
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
          type={"text"}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.additionalCommentLMD",
      dataKey: "data.additionalCommentLMD",
      title: "Additional Comment",
      width: columnWidth("data.additionalCommentLMD", 200),
      group: "Input of Local Marketing Department",

      resizable: true,
      hidden: visibilityController("LMD", "data.additionalCommentLMD"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          backgroundColor="#F5FAEF"
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    ///

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
        props.rowData.parentId === null ? (
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
      key: "__actions.edit",
      dataKey: "__actions.edit",
      title: "Edit",
      width: columnWidth("__actions.edit", 100),
      resizable: true,
      className: "red-border",
      cellRenderer: (props: any) =>
        props.rowData.parentId === null ? (
          <EditableTableCell
            type={"button"}
            backgroundColor="#fef9fa"
            textColor={"yellow"}
            onUpdate={handleCellUpdate}
            rowIndex={props.rowIndex}
            columnKey={props.column.dataKey}
            rowData={props.rowData}
            initialValue={"edit"}
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
      title: "Delete",
      width: columnWidth("__actions.delete", 100),
      resizable: true,
      className: "red-border",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"button"}
          textColor={"red"}
          backgroundColor="#fef9fa"
          onUpdate={deleteSubmission}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={"delete"}
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
          var colorClass: string = "";
          // switch (true) {
          //   case index < 12:
          //     colorClass = index === 0 ? "" : "dark-green-3";
          //     break;
          //   case index < 16:
          //     colorClass = "white";
          //     break;
          //   case index < 31:
          //     colorClass = "white";
          //     break;
          //   case index < 38:
          //     colorClass = "orange";
          //     break;
          //   case index < 51:
          //     colorClass = "blue-2";
          //     break;
          //   case index < 64:
          //     colorClass = "warm-gray";
          //     break;
          //   case index < 67:
          //     colorClass = "yellow";
          //     break;
          //   case index < 77:
          //     colorClass = "purple";
          //     break;
          //   case index < 87:
          //     colorClass = "salmon";
          //     break;
          //   default:
          //     colorClass = "red";
          //     break;
          // }

          return cloneElement(cell as ReactElement, {
            className: "BaseTable__header-cell " + colorClass,
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
                values = [
                  "generalInformation",
                  "purchaseOrder",
                  "costActuals",
                  "salesActuals",
                  "actualsInEur",
                  "costGlPostings",
                  "incomeGlPostings",
                  "CMCT",
                  "LMD",
                ];
              } else {
                value.forEach((v) => {
                  values.push(v.toString());
                });
              }

              localStorage.setItem(
                "vendors.displayedColumns",
                JSON.stringify(values)
              );
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
            <Select
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
              value={{
                label: "",
                value: "",
              }}
              onChange={(value: any) => {}}
              classNamePrefix="select"
              isClearable={false}
              name="presets"
              options={[]}
            />
          </Box>
        </Stack>
        {/* <Box w="100%" textAlign="right">
          <Button>Save</Button>
        </Box> */}
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
                                  case "text":
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
      <Box
        w={"100%"}
        bg={useColorModeValue("white", "#21252A")}
        minH={"85vh"}
        mb={5}
        border="1px"
        rounded="md"
        borderColor="gray.100"
      >
        <AutoResizer
          onResize={({ width, height }: { width: number; height: number }) => {
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
                handleResize(column.dataKey, width);
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
              overlayRenderer={
                <div>
                  <DebugOverlay hidden={debugOverlayHidden}>
                    <Box h="40px" w="100%">
                      <CloseButton
                        onClick={() => {
                          hideDebugOverlay(true);
                        }}
                        mr="-10px"
                        float="right"
                      />
                    </Box>
                    <HStack spacing={0}>
                      <Text w="120%" float="left">
                        Requested Heap Size:
                      </Text>
                      <Text w="80%" textAlign="right">
                        {heapInfo.total > 0
                          ? bytesToSize(heapInfo.total)
                          : "none"}
                      </Text>
                    </HStack>
                    <HStack spacing={0}>
                      <Text w="120%" float="left">
                        Allocated Heap Size:
                      </Text>
                      <Text w="80%" textAlign="right">
                        {heapInfo.total > 0
                          ? bytesToSize(heapInfo.allocated)
                          : "none"}
                      </Text>
                    </HStack>
                    <HStack spacing={0}>
                      <Text w="120%" float="left">
                        Active Heap Size:
                      </Text>
                      <Text w="80%" textAlign="right">
                        {heapInfo.total > 0
                          ? bytesToSize(heapInfo.current)
                          : "none"}
                      </Text>
                    </HStack>
                    <HStack spacing={0}>
                      <Text w="120%" float="left">
                        DOM Elements:
                      </Text>
                      <Text w="80%" textAlign="right">
                        {heapInfo.domSize}
                      </Text>
                    </HStack>
                    <HStack spacing={0}>
                      <Text w="120%" float="left">
                        Virtualization:
                      </Text>
                      <Text w="80%" textAlign="right">
                        partial
                      </Text>
                    </HStack>
                    <HStack spacing={0}>
                      <Text w="120%" float="left">
                        Table Mode:
                      </Text>
                      <Text w="80%" textAlign="right">
                        editable
                      </Text>
                    </HStack>
                    <HStack spacing={0}>
                      <Text w="120%" float="left">
                        Avg FPS:
                      </Text>
                      <Text w="80%" textAlign="right">
                        {avgFps}
                      </Text>
                    </HStack>
                    <HStack spacing={0}>
                      <Text w="120%" float="left">
                        FPS:
                      </Text>
                      <Text w="80%" textAlign="right">
                        {fps[fps.length - 1]}
                      </Text>
                    </HStack>
                    <Divider mt={"10px"} />
                    <HStack spacing={0}>
                      <Text w="120%" float="left">
                        Active Sessions:
                      </Text>
                      <Text w="80%" textAlign="right">
                        1
                      </Text>
                    </HStack>
                    <HStack spacing={0}>
                      <Text w="120%" float="left">
                        Total Requests:
                      </Text>
                      <Text w="80%" textAlign="right">
                        {totalRequests}
                      </Text>
                    </HStack>
                    <HStack spacing={0}>
                      <Text w="120%" float="left">
                        Sync Protocol:
                      </Text>
                      <Text w="80%" textAlign="right">
                        HTTP
                      </Text>
                    </HStack>
                    <VStack align="end" mt="10px">
                      <Button
                        float="right"
                        onClick={() => {
                          RestAPI.updateVendorTableDefaultConfig(
                            JSON.parse(
                              localStorage.getItem(
                                "vendors.displayedColumns"
                              ) || "[]"
                            ),
                            JSON.parse(
                              localStorage.getItem("vendors.columns") || "{}"
                            )
                          );
                        }}
                        colorScheme="blue"
                      >
                        update preset
                      </Button>
                      <Button
                        float="left"
                        onClick={() => {
                          localStorage.removeItem("vendors.displayedColumns");
                          localStorage.removeItem("vendors.columns");
                          window.location.reload();
                        }}
                        colorScheme="red"
                      >
                        clear cache
                      </Button>
                    </VStack>
                  </DebugOverlay>
                </div>
              }
            ></BaseTable>
          )}
        </AutoResizer>
      </Box>
    </div>
  );
}

export default VendorsTable;
