/* eslint-disable react-hooks/rules-of-hooks */
import {
  Box,
  Button,
  HStack,
  Input,
  Tooltip,
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
  Checkbox,
} from "@chakra-ui/react";
import {
  cloneElement,
  createRef,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import EditableTableCell from "../../components/EditableTableCell";

import { FpsView, useFps } from "react-fps";
import Select from "react-select";
import Project from "../../types/project";
import { Submission } from "../../types/submission";
import { createGlobalStyle } from "styled-components";
import styled from "styled-components";
import { Overlay } from "react-overlays";
import DatePicker from "react-datepicker";
import Toast from "../../components/Toast";

import BaseTable, {
  AutoResizer,
  Column,
  ColumnShape,
  unflatten,
} from "react-base-table";
import ContentEditable from "react-contenteditable";
import "react-base-table/styles.css";
import { RestAPI } from "../../api/rest";
import React from "react";
import _ from "lodash";
import { ArrowForwardIcon, SearchIcon } from "@chakra-ui/icons";
import { BiPlusMedical, VscDebugRerun, VscDebugStart } from "react-icons/all";
import moment from "moment";
import { toast } from "react-toastify";
import { CheckTreePicker, TagPicker } from "rsuite";
import { DateRangeInput, DateSingleInput } from "../../components/DatePicker";
import { SubmissionsTransformer } from "../../utils/SubmissionsTransformer";

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

// Use React.Component because of https://github.com/lovasoa/react-contenteditable/issues/161
class Cell extends React.Component<
  {
    onUpdate: any;
    rowIndex: number;
    rowData: any;
    columnKey: string | undefined;
    type: string;
    initialValue: any;
    textColor?: any;
    readonly?: boolean;
  },
  {
    cellValue: any;
    options: any[];
    editing: boolean;
  }
> {
  constructor(props: any) {
    super(props);

    this.state = {
      options: [],
      cellValue: undefined,
      editing: false,
    };
  }
  componentDidUpdate(prevProps: any) {
    if (prevProps.initialValue !== this.props.initialValue) {
      this.setState({ cellValue: this.props.initialValue });
    }
  }

  componentDidMount() {
    var value: any = undefined;
    switch (this.props.type) {
      case "text":
      case "number":
      case "button":
        value = this.props.initialValue
          ? this.props.initialValue.toString()
          : "";
        break;
      case "date":
        value =
          this.props.initialValue && this.props.initialValue !== null
            ? new Date(this.props.initialValue)
            : null;
        break;
      case "dropdown":
        value =
          typeof this.props.initialValue === "string"
            ? { label: this.props.initialValue, value: this.props.initialValue }
            : { label: "", value: "" };
        break;
      case "multiple-dropdown":
        value = [];
        if (this.props.initialValue && Array.isArray(this.props.initialValue)) {
          this.props.initialValue.map((value: any) => {
            value.push({ label: value, value: value });
          });
        }
        break;
      default:
        break;
    }
    this.setState({ cellValue: value });
  }

  render() {
    return (
      <div
        style={{
          textAlign: this.props.type === "button" ? "center" : "inherit",
        }}
        className={
          this.state.editing
            ? "vendors-table-cell active"
            : `content-preview ${
                this.props.textColor ? this.props.textColor : ""
              } ${this.props.readonly ? "readonly" : ""}`
        }
        onClick={() => {
          if (!this.state.editing && !this.props.readonly) {
            this.setState({ editing: true });
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          this.setState({ editing: false });
        }}
      >
        {!this.state.editing ? (
          this.props.type === "date" ? (
            this.state.cellValue && this.state.cellValue !== null ? (
              moment(this.state.cellValue).format("DD.MM.yyyy")
            ) : (
              ""
            )
          ) : typeof this.state.cellValue === "object" ? (
            this.state.cellValue !== null ? (
              `${this.state.cellValue.label}`
            ) : (
              ""
            )
          ) : (
            `${this.state.cellValue}`
          )
        ) : this.props.type === "text" || this.props.type === "number" ? (
          <textarea
            autoFocus
            style={{ resize: "none" }}
            value={this.state.cellValue ?? ""}
            onChange={(event) => {
              this.setState({ cellValue: event.target.value });
            }}
            onFocus={(e) => {
              setTimeout(() => {
                document.execCommand("selectAll", false);
              }, 0);
            }}
            onKeyPress={
              this.props.type === "number"
                ? (event) => {
                    const keyCode = event.keyCode || event.which;
                    const string = String.fromCharCode(keyCode);
                    if (!numRegex.test(string)) {
                      event.defaultPrevented = false;
                      if (event.preventDefault) event.preventDefault();
                    }
                  }
                : undefined
            }
            onBlur={(event) => {
              this.props.onUpdate(
                this.props.rowData.id,
                this.props.columnKey,
                this.props.type === "number"
                  ? Number(this.state.cellValue)
                  : this.state.cellValue
              );
              this.setState({ editing: false });
            }}
            className="content-editable"
          />
        ) : this.props.type === "date" ? (
          <DatePicker
            autoFocus
            // showTimeInput
            isClearable
            customInput={<input className="datepicker-input"></input>}
            // selected={this.state.cellValue}
            onChange={(date) => {
              this.setState({ cellValue: date, editing: false });
              this.props.onUpdate(
                this.props.rowData.id,
                this.props.columnKey,
                date !== null ? date.toString() : null
              );
            }}
            onCalendarClose={() => {
              this.setState({ editing: false });
            }}
            dateFormat="dd.MM.yyyy"
          />
        ) : this.props.type === "dropdown" ||
          this.props.type === "multiple-dropdown" ? (
          //   FIXME: use http://bvaughn.github.io/react-virtualized-select/
          <Select
            menuIsOpen={this.state.editing}
            autoFocus
            isMulti={this.props.type === "multiple-dropdown"}
            styles={{
              menu: (provided) => ({
                ...provided,
                zIndex: 1000000,
              }),
              singleValue: (provided) => ({
                ...provided,
                color: "black",
              }),
              control: (base, state) => ({
                ...base,
                paddingLeft: "5px",
                boxShadow: "none",
                outlineWidth: 0,
                border: 0,
                minHeight: 52,
                backgroundColor: "transparent",
                // border: "1px solid transparent",
                transition: "0.3s",
                // "&:hover": {
                //   border: "1px solid transparent",
                // },
              }),
            }}
            theme={(theme) => ({
              ...theme,
              borderRadius: 0,
              colors: {
                ...theme.colors,
                primary: "#a0bfe3",
              },
            })}
            menuPortalTarget={document.body}
            value={this.state.cellValue}
            onChange={(value) => {
              this.setState({
                cellValue: value !== null ? value : { label: "", value: "" },
              });
              var v: any = "";
              if (value !== null && Array.isArray(value)) {
                v = [];
                value.map((dv: any) => v.push(dv.label));
              }
              if (value !== null && !Array.isArray(value)) {
                v = value.label;
              }
              this.props.onUpdate(
                this.props.rowData.id,
                this.props.columnKey,
                v
              );
              this.setState({ editing: false });
            }}
            onFocus={async () => {
              this.setState({
                options: loadOptions(this.props.columnKey ?? ""),
              });
            }}
            onBlur={() => {
              this.setState({
                options: [],
                editing: false,
              });
            }}
            placeholder=""
            classNamePrefix="table-select"
            isClearable
            isSearchable
            options={this.state.options}
          />
        ) : this.props.type === "button" ? (
          <div className="table-button-container">
            <Button
              colorScheme={this.props.textColor}
              onClick={() => {
                this.props.onUpdate(
                  this.props.rowData.id,
                  "data.companyName",
                  "Updated Name"
                );
                this.setState({ editing: false });
              }}
              size="sm"
              color="white"
              className="table-button"
            >
              {this.state.cellValue}
            </Button>
          </div>
        ) : (
          <div>unknown</div>
        )}
      </div>
    );
  }
}

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
      { label: "Company Name", value: "data.companyName" },
      { label: "Company Code", value: "data.companyCode" },
      { label: "Project Number", value: "data.projectNumber" },
      { label: "Project Name", value: "data.projectName" },
      {
        label: "Campaign Start Date",
        value: "data.campaignStartDate",
      },
      { label: "Project Type", value: "data.projectType" },
      { label: "SAP Status", value: "data.sapStatus" },
      { label: "Campaign Channel", value: "data.campaignChannel" },
      { label: "Target Audience", value: "data.targetAudience" },
      { label: "Marketing Responsible", value: "data.marketingResponsible" },
      { label: "Project Approver", value: "data.projectApprover" },
      { label: "Additional Information", value: "data.additionalInformation" },
    ],
  },

  {
    label: "Countries Participating",
    value: "countries",
    children: [
      { label: "Country", value: "data.country" },
      { label: "Country Share %", value: "data.countryShare" },
      {
        label: "Country Budget Contribution (EUR)",
        value: "data.countryBudgetContributionEur",
      },
      {
        label: "Country Cost Estimation (EUR)",
        value: "data.manufacturerNumber",
      },
    ],
  },
  {
    label: "Vendors Participating",
    value: "vendors",
    children: [
      { label: "Vendor Name", value: "data.vendorName" },
      { label: "SAP Debitor Number", value: "data.sapDebitorNumber" },
      { label: "SAP Creditor Number", value: "data.sapCreditorNumber" },
      { label: "Manufacturer Number", value: "data.manufacturerNumber" },
      { label: "MDF Level", value: "data.mdfLevel" },
      { label: "Budget Currency", value: "data.budgetCurrency" },
      {
        label: "Estimated Income (Budget Currency)",
        value: "data.estimatedIncomeBC",
      },
      {
        label: "Estimated Costs (Budget Currency)",
        value: "data.estimatedCostsBC",
      },
      {
        label: "Estimated Result (Budget Currency)",
        value: "data.estimatedResultBC",
      },
      { label: "Estimated Income (EUR)", value: "data.estimatedIncomeEur" },
      { label: "Estimated Costs (EUR)", value: "data.estimatedCostsEur" },
      { label: "Estimated Result (EUR)", value: "data.estimatedResultEur" },
      { label: "Vendor Share %", value: "data.vendorShare" },
      { label: "Business Unit", value: "data.bu" },
      { label: "PH1", value: "data.ph1" },
    ],
  },
  {
    label: "Purchase Order",
    value: "purchaseOrder",
    children: [
      {
        label: "Purchase Order Service Provider",
        value: "data.purchaseOrderServiceProvider",
      },
      {
        label: "Net Value of Service Ordered (LC)",
        value: "data.netValueOfServiceOrderedLC",
      },
      { label: "Local Currency", value: "data.localCurrency" },
      {
        label: "Net Value (Purchase Order Currency)",
        value: "data.netValuePOC",
      },
      { label: "Purchase Order Currency", value: "data.purchaseOrderCurrency" },
      { label: "Net Value (EUR)", value: "data.netValueEur" },
      { label: "Purchase Order Status", value: "data.purchaseOrderStatus" },
    ],
  },
  {
    label: "Cost Actuals",
    value: "costActuals",
    children: [
      { label: "Year / Month", value: "data.yearMonth" },
      { label: "Document Type", value: "data.documentType" },
      { label: "Posting Date", value: "data.postingDate" },
      { label: "Document Date", value: "data.documentDate" },
      { label: "Document Number", value: "data.documentNumber" },
      { label: "Invoice Number", value: "data.invoiceNumber" },
      { label: "Cost Account", value: "data.costAccount" },
      { label: "Name 1", value: "data.name1" },
      { label: "Vendor Name", value: "data.caVendorName" },
      { label: "Cost Amount (LC)", value: "data.costAmountLC" },
      { label: "Cost Amount (DC)", value: "data.costAmountDC" },
      { label: "DC", value: "data.dc" },
      { label: "Cost Status", value: "data.costStatus" },
    ],
  },
  {
    label: "Sales Actuals",
    value: "salesActuals",
    children: [
      { label: "Year / Month", value: "data.yearMonthSA" },
      { label: "Document Type", value: "data.documentTypeSA" },
      { label: "Posting Date", value: "data.postingDateSA" },
      { label: "Document Date", value: "data.documentDateSA" },
      { label: "Document Number", value: "data.documentNumberSA" },
      { label: "Invoice Number", value: "data.invoiceNumberSA" },
      { label: "Income Account", value: "data.incomeAccountSA" },
      { label: "Name 1", value: "data.name1SA" },
      { label: "Income Amount (LC)", value: "data.incomeAmountLC" },
      { label: "Income Amount (DC)", value: "data.incomeAmountDC" },
      { label: "Income Status", value: "data.incomeStatus" },
      { label: "Actual Result (LC)", value: "data.actualResultLC" },
    ],
  },
  {
    label: "Actuals in EUR",
    value: "actualsInEur",
    children: [
      { label: "Income Amount (EUR)", value: "data.incomeAmountEur" },
      { label: "Cost Amount (EUR)", value: "data.costAmountEur" },
      { label: "Actual Result (EUR)", value: "data.actualResultEur" },
    ],
  },
  {
    label: "Cost GL Postings",
    value: "costGlPostings",
    children: [
      { label: "Year / Month", value: "data.yearMonthCostGL" },
      { label: "Document Type", value: "data.documentTypeCostGL" },
      { label: "Posting Date", value: "data.postingDateCostGL" },
      { label: "Document Date", value: "data.documentDateCostGL" },
      { label: "Document Number", value: "data.documentNumberCostGL" },
      { label: "Cost Account", value: "data.costAccountCostGL" },
      { label: "Cost Amount (LC)", value: "data.costAmountLCCostGL" },
      { label: "Cost Amount (DC)", value: "data.costAmountDCCostGL" },
      { label: "DC", value: "data.dcCostGL" },
      { label: "Cost Amount (EUR)", value: "data.costAmountEurCostGL" },
    ],
  },
  {
    label: "Income GL Postings",
    value: "incomeGlPostings",
    children: [
      { label: "Year / Month", value: "data.yearMonthIncomeGL" },
      { label: "Document Type", value: "data.documentTypeIncomeGL" },
      { label: "Posting Date", value: "data.postingDateIncomeGL" },
      { label: "Document Date", value: "data.documentDateIncomeGL" },
      { label: "Document Number", value: "data.documentNumberIncomeGL" },
      { label: "Income Account", value: "data.incomeAccountIncomeGL" },
      { label: "Income Amount (LC)", value: "data.incomeAmountLCIncomeGL" },
      { label: "Income Amount (DC)", value: "data.incomeAmountDCIncomeGL" },
      { label: "DC", value: "data.dcIncomeGL" },
      { label: "Income Amount (EUR)", value: "data.incomeAmountEurIncomeGL" },
    ],
  },
];

export function VendorsTable(props: Props) {
  const [debugOverlayHidden, hideDebugOverlay] = useState(false);
  const [filters, setFilters] = useState<FilterField[]>([]);
  const [displayedColumns, setDisplayedColumns] = useState<string[]>([
    "generalInformation",
    "countries",
    "vendors",
    "purchaseOrder",
    "costActuals",
    "salesActuals",
    "actualsInEur",
    "costGlPostings",
    "incomeGlPostings",
  ]);
  const { fps, avgFps, maxFps, currentFps } = useFps(20);
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
    var dc = localStorage.getItem("vendors.displayedColumns");
    if (dc !== null) {
      setDisplayedColumns(JSON.parse(dc));
    }
    var cw = localStorage.getItem("vendors.columns");
    if (cw !== null) {
      setDefaultColumnsWidth(JSON.parse(cw));
    }
  }, []);

  useEffect(() => {
    getHeapInfo();
    const interval = setInterval(() => {
      getHeapInfo();
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    var filtered: Submission[] = [];
    if (filters.length > 0 && submissions.length > 0) {
      submissions.map((submission) => {
        var valid = true;
        filters.map((filter) => {
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
                    filter.selectedValues.map((filterValue) => {
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
      setFilteredSubmissions(SubmissionsTransformer(filtered));
    } else {
      setFilteredSubmissions(SubmissionsTransformer([...submissions]));
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
      tbd.forEach((ds) => {
        RestAPI.deleteSubmission(ds);
      });
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
  function handleCellUpdateRedraw(
    submission: string,
    path: string,
    value: any
  ) {
    var submissionIndex = submissions.findIndex((s) => s.id === submission);
    if (submissionIndex > -1) {
      path = `[${submissionIndex}].${path}`;
      if (_.get(submissions, path) !== value) {
        var temp = [...submissions];
        _.set(temp, path, value);
        setSubmissions(temp);
        partialUpdate(submission, path, value);
      }
    }
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
      subs.map((sub) => {
        if (sub.project === "619515b754e61c8dd33daa52") {
          vSubs.push(sub);
        }
      });
      var transformed = SubmissionsTransformer(vSubs);
      setSubmissions(transformed);
      setFilteredSubmissions(transformed);
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
      key: "data.companyName",
      dataKey: "data.companyName",
      title: "Company Name",
      width: columnWidth("data.companyName", 200),
      resizable: true,
      hidden: visibilityController("generalInformation", "data.companyName"),
      header: "General Information",
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
      key: "data.companyCode",
      dataKey: "data.companyCode",
      title: "Company Code",
      width: columnWidth("data.companyCode", 150),
      resizable: true,
      hidden: visibilityController("generalInformation", "data.companyCode"),
      type: "number",
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
      key: "data.sapStatus",
      dataKey: "data.sapStatus",
      title: "SAP Status",
      width: columnWidth("data.sapStatus", 120),
      resizable: true,
      hidden: visibilityController("generalInformation", "data.sapStatus"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          readonly
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
      hidden: visibilityController(
        "generalInformation",
        "data.campaignChannel"
      ),
      type: "dropdown",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          backgroundColor="#f5faef"
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
      key: "data.data.targetAudience",
      dataKey: "data.targetAudience",
      title: "Target Audience",
      width: columnWidth("data.targetAudience", 200),
      resizable: true,
      hidden: visibilityController("generalInformation", "data.targetAudience"),
      type: "dropdown",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          backgroundColor="#f5faef"
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
      key: "data.marketingResponsible",
      dataKey: "data.marketingResponsible",
      title: "Marketing Responsible",
      width: columnWidth("data.marketingResponsible", 200),
      resizable: true,
      hidden: visibilityController(
        "generalInformation",
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
      title: "Project Approver",
      width: columnWidth("data.projectApprover", 200),
      resizable: true,
      hidden: visibilityController(
        "generalInformation",
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
      width: columnWidth("data.additionalInformation", 250),
      resizable: true,
      hidden: visibilityController(
        "generalInformation",
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
      key: "data.country",
      dataKey: "data.country",
      title: "Country",
      width: columnWidth("data.country", 200),
      resizable: true,
      header: "Countries Participating",
      hidden: visibilityController("countries", "data.country"),
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
      title: "Country Share %",
      width: columnWidth("data.countryShare", 150),
      resizable: true,
      hidden: visibilityController("countries", "data.countryShare"),
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
      key: "data.countryBudgetContributionEur",
      dataKey: "data.countryBudgetContributionEur",
      title: "Country Budget Contribution (EUR)",
      width: columnWidth("data.countryBudgetContributionEur", 250),
      resizable: true,
      hidden: visibilityController(
        "countries",
        "data.countryBudgetContributionEur"
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
      key: "data.countryCostEstimationEur",
      dataKey: "data.countryCostEstimationEur",
      title: "Country Cost Estimation (EUR)",
      width: columnWidth("data.countryCostEstimationEur", 250),
      resizable: true,
      hidden: visibilityController(
        "countries",
        "data.countryCostEstimationEur"
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
    //
    {
      key: "data.vendorName",
      dataKey: "data.vendorName",
      title: "Vendor Name",
      width: columnWidth("data.vendorName", 250),
      resizable: true,
      hidden: visibilityController("vendors", "data.vendorName"),
      header: "Vendors Participating",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          backgroundColor="#f5faef"
          loadOptions={loadOptions}
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.sapDebitorNumber",
      dataKey: "data.sapDebitorNumber",
      title: "SAP Debitor Number",
      width: columnWidth("data.sapDebitorNumber", 200),
      resizable: true,
      hidden: visibilityController("vendors", "data.sapDebitorNumber"),
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
      key: "data.sapCreditorNumber",
      dataKey: "data.sapCreditorNumber",
      title: "SAP Creditor Number",
      width: columnWidth("data.sapCreditorNumber", 200),
      resizable: true,
      hidden: visibilityController("vendors", "data.sapCreditorNumber"),
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
      width: columnWidth("data.manufacturerNumber", 200),
      resizable: true,
      hidden: visibilityController("vendors", "data.manufacturerNumber"),
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
      hidden: visibilityController("vendors", "data.mdfLevel"),
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
      key: "data.budgetCurrency",
      dataKey: "data.budgetCurrency",
      title: "Budget Currency",
      width: columnWidth("data.budgetCurrency", 200),
      resizable: true,
      hidden: visibilityController("vendors", "data.budgetCurrency"),
      type: "dropdown",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          backgroundColor="#f5faef"
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
      key: "data.estimatedIncomeBC",
      dataKey: "data.estimatedIncomeBC",
      title: "Estimated Income (Budget Currency)",
      width: columnWidth("data.estimatedIncomeBC", 300),
      resizable: true,
      hidden: visibilityController("vendors", "data.estimatedIncomeBC"),
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
      dataKey: "data.estimatedCostsBC",
      title: "Estimated Costs (Budget Currency)",
      width: columnWidth("data.estimatedCostsBC", 250),
      resizable: true,
      hidden: visibilityController("vendors", "data.estimatedCostsBC"),
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
      width: columnWidth("data.estimatedResultBC", 250),
      resizable: true,
      hidden: visibilityController("vendors", "data.estimatedResultBC"),
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
      key: "data.estimatedIncomeEur",
      dataKey: "data.estimatedIncomeEur",
      title: "Estimated Income (EUR)",
      width: columnWidth("data.estimatedIncomeEur", 200),
      resizable: true,
      hidden: visibilityController("vendors", "data.estimatedIncomeEur"),
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
      key: "data.estimatedCostsEur",
      dataKey: "data.estimatedCostsEur",
      title: "Estimated Costs (EUR)",
      width: columnWidth("data.estimatedCostsEur", 200),
      resizable: true,
      hidden: visibilityController("vendors", "data.estimatedCostsEur"),
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
      key: "data.estimatedResultEur",
      dataKey: "data.estimatedResultEur",
      title: "Estimated Result (EUR)",
      width: columnWidth("data.estimatedResultEur", 200),
      resizable: true,
      hidden: visibilityController("vendors", "data.estimatedResultEur"),
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
      title: "Vendor Share %",
      width: columnWidth("data.vendorShare", 150),
      resizable: true,
      hidden: visibilityController("vendors", "data.vendorShare"),
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
      key: "data.bu",
      dataKey: "data.bu",
      title: "Business Unit",
      width: columnWidth("data.bu", 200),
      resizable: true,
      hidden: visibilityController("vendors", "data.bu"),
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
      key: "data.ph1",
      dataKey: "data.ph1",
      title: "PH1",
      width: columnWidth("data.ph1", 200),
      resizable: true,
      hidden: visibilityController("vendors", "data.ph1"),
      type: "dropdown",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          backgroundColor="#f5faef"
          onUpdate={handleCellUpdate}
          loadOptions={loadOptions}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    //
    {
      key: "data.purchaseOrderServiceProvider",
      dataKey: "data.purchaseOrderServiceProvider",
      title: "Purchase Order Service Provider",
      width: columnWidth("data.purchaseOrderServiceProvider", 250),
      resizable: true,
      header: "Purchase Order",
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
      key: "data.netValueOfServiceOrderedLC",
      dataKey: "data.netValueOfServiceOrderedLC",
      title: "Net Value of Service Ordered (LC)",
      width: columnWidth("data.netValueOfServiceOrderedLC", 250),
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
      width: columnWidth("data.localCurrency", 150),
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
      width: columnWidth("data.netValuePOC", 300),
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
      width: columnWidth("data.yearMonth", 200),
      resizable: true,
      header: "Cost Actuals",
      hidden: visibilityController("costActuals", "data.yearMonth"),
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
      key: "data.documentType",
      dataKey: "data.documentType",
      title: "Document Type",
      width: columnWidth("data.documentType", 200),
      resizable: true,
      hidden: visibilityController("costActuals", "data.documentType"),
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
      key: "data.postingDate",
      dataKey: "data.postingDate",
      title: "Posting Date",
      width: columnWidth("data.postingDate", 200),
      resizable: true,
      hidden: visibilityController("costActuals", "data.postingDate"),
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
      key: "data.documentDate",
      dataKey: "data.documentDate",
      title: "Document Date",
      width: columnWidth("data.documentDate", 200),
      resizable: true,
      hidden: visibilityController("costActuals", "data.documentDate"),
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
      key: "data.documentNumber",
      dataKey: "data.documentNumber",
      title: "Document Number",
      width: columnWidth("data.documentNumber", 200),
      resizable: true,
      hidden: visibilityController("costActuals", "data.documentNumber"),
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
      key: "data.invoiceNumber",
      dataKey: "data.invoiceNumber",
      title: "Invoice Number",
      width: columnWidth("data.invoiceNumber", 200),
      resizable: true,
      hidden: visibilityController("costActuals", "data.invoiceNumber"),
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
      key: "data.costAccount",
      dataKey: "data.costAccount",
      title: "Cost Account",
      width: columnWidth("data.costAccount", 200),
      resizable: true,
      hidden: visibilityController("costActuals", "data.costAccount"),
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
      key: "data.name1",
      dataKey: "data.name1",
      title: "Name 1",
      width: columnWidth("data.name1", 200),
      resizable: true,
      hidden: visibilityController("costActuals", "data.name1"),
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
      key: "data.caVendorName",
      dataKey: "data.caVendorName",
      title: "Vendor Name",
      width: columnWidth("data.caVendorName", 250),
      resizable: true,
      hidden: visibilityController("costActuals", "data.caVendorName"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          backgroundColor="#fff7f1"
          loadOptions={loadOptions}
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
      resizable: true,
      hidden: visibilityController("costActuals", "data.costAmountLC"),
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
      key: "data.costAmountDC",
      dataKey: "data.costAmountDC",
      title: "Cost Amount (DC)",
      width: columnWidth("data.costAmountDC", 200),
      resizable: true,
      hidden: visibilityController("costActuals", "data.costAmountDC"),
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
      key: "data.dc",
      dataKey: "data.dc",
      title: "DC",
      width: columnWidth("data.dc", 200),
      resizable: true,
      hidden: visibilityController("costActuals", "data.dc"),
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
      key: "data.costStatus",
      dataKey: "data.costStatus",
      title: "Cost Status",
      width: columnWidth("data.costStatus", 200),
      resizable: true,
      hidden: visibilityController("costActuals", "data.costStatus"),
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          backgroundColor="#fff7f1"
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
      key: "data.yearMonthSA",
      dataKey: "data.yearMonthSA",
      title: "Year / Month",
      width: columnWidth("data.yearMonthSA", 200),
      resizable: true,
      header: "Sales Actuals",
      hidden: visibilityController("salesActuals", "data.yearMonthSA"),
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
      key: "data.documentTypeSA",
      dataKey: "data.documentTypeSA",
      title: "Document Type",
      width: columnWidth("data.documentTypeSA", 200),
      resizable: true,
      hidden: visibilityController("salesActuals", "data.documentTypeSA"),
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
      key: "data.postingDateSA",
      dataKey: "data.postingDateSA",
      title: "Posting Date",
      width: columnWidth("data.postingDateSA", 200),
      resizable: true,
      hidden: visibilityController("salesActuals", "data.postingDateSA"),
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
      key: "data.documentDateSA",
      dataKey: "data.documentDateSA",
      title: "Document Date",
      width: columnWidth("data.documentDateSA", 200),
      resizable: true,
      hidden: visibilityController("salesActuals", "data.documentDateSA"),
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
      key: "data.documentNumberSA",
      dataKey: "data.documentNumberSA",
      title: "Document Number",
      width: columnWidth("data.documentNumberSA", 200),
      resizable: true,
      hidden: visibilityController("salesActuals", "data.documentNumberSA"),
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
      key: "data.invoiceNumberSA",
      dataKey: "data.invoiceNumberSA",
      title: "Invoice Number",
      width: columnWidth("data.invoiceNumberSA", 200),
      resizable: true,
      hidden: visibilityController("salesActuals", "data.invoiceNumberSA"),
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
      key: "data.incomeAccountSA",
      dataKey: "data.incomeAccountSA",
      title: "Income Account",
      width: columnWidth("data.incomeAccountSA", 200),
      resizable: true,
      hidden: visibilityController("salesActuals", "data.incomeAccountSA"),
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
      key: "data.name1SA",
      dataKey: "data.name1SA",
      title: "Name 1",
      width: columnWidth("data.name1SA", 200),
      resizable: true,
      hidden: visibilityController("salesActuals", "data.name1SA"),
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
      key: "data.incomeAmountLC",
      dataKey: "data.incomeAmountLC",
      title: "Income Amount (LC)",
      width: columnWidth("data.incomeAmountLC", 200),
      resizable: true,
      hidden: visibilityController("salesActuals", "data.incomeAmountLC"),
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
      key: "data.incomeAmountDC",
      dataKey: "data.incomeAmountDC",
      title: "Income Amount (DC)",
      width: columnWidth("data.incomeAmountDC", 200),
      resizable: true,
      hidden: visibilityController("salesActuals", "data.incomeAmountDC"),
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
      key: "data.incomeStatus",
      dataKey: "data.incomeStatus",
      title: "Income Status",
      width: columnWidth("data.incomeStatus", 200),
      resizable: true,
      hidden: visibilityController("salesActuals", "data.incomeStatus"),
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
      key: "data.actualResultLC",
      dataKey: "data.actualResultLC",
      title: "Actual Result (LC)",
      width: columnWidth("data.actualResultLC", 200),
      resizable: true,
      hidden: visibilityController("salesActuals", "data.actualResultLC"),
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
      key: "data.incomeAmountEur",
      dataKey: "data.incomeAmountEur",
      title: "Income Amount (EUR)",
      width: columnWidth("data.incomeAmountEur", 200),
      resizable: true,
      header: "Actuals in EUR",
      hidden: visibilityController("actualsInEur", "data.incomeAmountEur"),
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
      key: "data.costAmountEur",
      dataKey: "data.costAmountEur",
      title: "Cost Amount (EUR)",
      width: columnWidth("data.costAmountEur", 200),
      resizable: true,
      hidden: visibilityController("actualsInEur", "data.costAmountEur"),
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
      key: "data.actualResultEur",
      dataKey: "data.actualResultEur",
      title: "Actual Result (EUR)",
      width: columnWidth("data.actualResultEur", 200),
      resizable: true,
      hidden: visibilityController("actualsInEur", "data.actualResultEur"),
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
      width: columnWidth("data.yearMonthCostGL", 200),
      resizable: true,
      header: "Cost GL Postings",
      className: "blue-border",
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
      title: "Document Type",
      width: columnWidth("data.documentTypeCostGL", 200),
      resizable: true,
      className: "blue-border",
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
      dataKey: "data.postingDateCostGL",
      title: "Posting Date",
      width: columnWidth("data.postingDateCostGL", 200),
      resizable: true,
      className: "blue-border",
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
      resizable: true,
      className: "blue-border",
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
      resizable: true,
      className: "blue-border",
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
      width: columnWidth("data.costAccountCostGL", 200),
      resizable: true,
      className: "blue-border",
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
      resizable: true,
      className: "blue-border",
      hidden: visibilityController("costGlPostings", "data.costAmountLCCostGL"),
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
      key: "data.costAmountDCCostGL",
      dataKey: "data.costAmountDCCostGL",
      title: "Cost Amount (DC)",
      width: columnWidth("data.costAmountDCCostGL", 200),
      resizable: true,
      className: "blue-border",
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
      width: columnWidth("data.dcCostGL", 150),
      resizable: true,
      className: "blue-border",
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
      key: "data.costAmountEurCostGL",
      dataKey: "data.costAmountEurCostGL",
      title: "Cost Amount (EUR)",
      width: columnWidth("data.costAmountEurCostGL", 200),
      resizable: true,
      className: "blue-border",
      hidden: visibilityController(
        "costGlPostings",
        "data.costAmountEurCostGL"
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
      key: "data.yearMonthIncomeGL",
      dataKey: "data.yearMonthIncomeGL",
      title: "Year / Month",
      width: columnWidth("data.yearMonthIncomeGL", 200),
      resizable: true,
      header: "Income GL Postings",
      className: "light-blue-border",
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
      width: columnWidth("data.documentTypeIncomeGL", 200),
      resizable: true,
      className: "light-blue-border",
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
      width: columnWidth("data.postingDateIncomeGL", 200),
      resizable: true,
      className: "light-blue-border",
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
      width: columnWidth("data.documentDateIncomeGL", 200),
      resizable: true,
      className: "light-blue-border",
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
      title: "Document Number",
      width: columnWidth("data.documentNumberIncomeGL", 200),
      resizable: true,
      className: "light-blue-border",
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
      title: "Income Account",
      width: columnWidth("data.incomeAccountIncomeGL", 200),
      resizable: true,
      className: "light-blue-border",
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
      key: "data.incomeAmountLCIncomeGL",
      dataKey: "data.incomeAmountLCIncomeGL",
      title: "Income Amount (LC)",
      width: columnWidth("data.incomeAmountLCIncomeGL", 200),
      resizable: true,
      className: "light-blue-border",
      hidden: visibilityController(
        "incomeGlPostings",
        "data.incomeAmountLCIncomeGL"
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
      key: "data.incomeAmountDCIncomeGL",
      dataKey: "data.incomeAmountDCIncomeGL",
      title: "Income Amount (DC)",
      width: columnWidth("data.incomeAmountDCIncomeGL", 200),
      resizable: true,
      className: "light-blue-border",
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
      width: columnWidth("data.dcIncomeGL", 150),
      resizable: true,
      className: "light-blue-border",
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
      title: "Income Amount (EUR)",
      width: columnWidth("data.incomeAmountEurIncomeGL", 200),
      resizable: true,
      hidden: visibilityController(
        "incomeGlPostings",
        "data.incomeAmountEurIncomeGL"
      ),
      className: "light-blue-border",
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
            backgroundColor="#fff7f8"
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
            backgroundColor="#fff7f8"
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
          backgroundColor="#fff7f8"
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
          switch (true) {
            case index < 7:
              colorClass = index === 0 ? "" : "green";
              break;
            case index < 31:
              colorClass = "lgreen";
              break;
            case index < 38:
              colorClass = "lorange";
              break;
            case index < 51:
              colorClass = "orange";
              break;
            case index < 63:
              colorClass = "red";
              break;
            case index < 66:
              colorClass = "purple";
              break;
            case index < 76:
              colorClass = "blue";
              break;
            case index < 86:
              colorClass = "lblue";
              break;
            default:
              colorClass = "red";
              break;
          }

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
            <Text mb="8px">Template</Text>
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
              name="templates"
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
                          console.log(value);
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
                                    label: cell.title,
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
