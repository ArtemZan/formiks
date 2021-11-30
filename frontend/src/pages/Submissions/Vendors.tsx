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
} from "@chakra-ui/react";
import {
  cloneElement,
  createRef,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
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

function getFormattedDate(date: any) {
  if (date === null) {
    return "";
  }
  let year = date.getFullYear();
  let month = (1 + date.getMonth()).toString().padStart(2, "0");
  let day = date.getDate().toString().padStart(2, "0");

  return month + "/" + day + "/" + year;
}

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
            selected={this.state.cellValue}
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

RestAPI.getDropdownValues("619b7b9efe27d06ad17d75af").then((response) => {
  ProjectType = response.data;
});
RestAPI.getDropdownValues("619b630a9a5a2bb37a93b23b").then((response) => {
  PH1 = response.data;
});
RestAPI.getDropdownValues("619b61419a5a2bb37a93b237").then((response) => {
  Companies = response.data;
});
RestAPI.getDropdownValues("619b63429a5a2bb37a93b23d").then((response) => {
  VendorsNames = response.data;
});
RestAPI.getDropdownValues("619b62d79a5a2bb37a93b239").then((response) => {
  CampaignChannel = response.data;
});
RestAPI.getDropdownValues("619b632c9a5a2bb37a93b23c").then((response) => {
  TargetAudience = response.data;
});
RestAPI.getDropdownValues("619b62959a5a2bb37a93b238").then((response) => {
  Budget = response.data;
});
RestAPI.getDropdownValues("619b62f29a5a2bb37a93b23a").then((response) => {
  ExchangeRates = response.data;
});
RestAPI.getDropdownValues("619b66defe27d06ad17d75ac").then((response) => {
  FiscalQuarter = response.data;
});
RestAPI.getDropdownValues("619b6754fe27d06ad17d75ad").then((response) => {
  Year = response.data;
});
RestAPI.getDropdownValues("619b6799fe27d06ad17d75ae").then((response) => {
  ProjectStartQuarter = response.data;
});

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
    // children: [
    //   { label: "Company Name", value: "companyName" },
    //   { label: "Company Code", value: "companyCode" },
    //   { label: "Project Number", value: "projectNumber" },
    //   {
    //     label: "Campaign Start Date",
    //     value: "campaignStartDate",
    //   },
    //   { label: "Project Type", value: "projectType" },
    //   { label: "SAP Status", value: "sapStatus" },
    // ],
  },
  {
    label: "Project Information",
    value: "projectInformation",
  },
  {
    label: "Purchase Order",
    value: "purchaseOrder",
  },
  {
    label: "Cost Actuals",
    value: "costActuals",
  },
  {
    label: "Sales Actuals",
    value: "salesActuals",
  },
  {
    label: "Actuals in EUR",
    value: "actualsInEur",
  },
  {
    label: "Cost GL Postings",
    value: "costGlPostings",
  },
  {
    label: "Income GL Postings",
    value: "incomeGlPostings",
  },
];

export function VendorsTable(props: Props) {
  const [filters, setFilters] = useState<FilterField[]>([]);
  const [displayedColumns, setDisplayedColumns] = useState<string[]>([
    "generalInformation",
    "projectInformation",
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
            // filter
            var value = _.get(submission, filter.columnValue); // submission.data[filter.column];
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
                  case "exact":
                    filter.selectedValues.map((filterValue) => {
                      var exists = false;
                      value.map((v: any) => {
                        if (v.toString() === filterValue) {
                          exists = true;
                        }
                      });
                      if (!exists) {
                        valid = false;
                      }
                    });
                    break;
                  case "includes":
                    valid = filter.selectedValues.some((fv) =>
                      value.includes(fv)
                    );
                    break;
                }
                break;
              case "date":
                if (
                  filter.filter === "range" &&
                  filter.selectedValues.length === 2
                ) {
                  var v = new Date(value);
                  valid =
                    v >= filter.selectedValues[0] &&
                    v <= filter.selectedValues[1];
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
    // build the net offset for each column
    var netOffsets: any[] = [],
      offsetSum = 0,
      leftBound = offset,
      rightBound = offset + tableWidth,
      visibleIndices: any[] = [];

    // derive the column net offsets
    columns.forEach((col: any) => {
      netOffsets.push(offsetSum); // the current offsetsum is the column offset
      offsetSum += col.width; // increase the offset sum by the width of the column
    });

    // which column offsets are outside the left and right bounds?
    netOffsets.forEach((columnOffset, colIdx) => {
      var isOutside = columnOffset < leftBound || columnOffset > rightBound;
      if (!isOutside) {
        visibleIndices.push(colIdx);
      }
    });

    return visibleIndices;
  };
  const rowRenderer = React.useCallback(
    ({ cells, columns }) => {
      // this could be rendering the table body row, the fixed columns row, the header row.
      // if we have the full complement of columns in the cell array (which includes placeholders
      // for frozen columns), then we have the header or body
      // plus, only want to null out hidden content when scrolling vertically

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
      setSubmissions(vSubs);
      setFilteredSubmissions(vSubs);
    });
  }, []);

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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("generalInformation"),
      header: "General Information",
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 150,
      resizable: true,
      hidden: !displayedColumns.includes("generalInformation"),
      type: "number",
      cellRenderer: (props: any) => (
        <Cell
          type={"number"}
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
      width: 150,
      resizable: true,
      hidden: !displayedColumns.includes("generalInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("generalInformation"),
      type: "date",
      cellRenderer: (props: any) => (
        <Cell
          type={"date"}
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
      width: 250,
      resizable: true,
      hidden: !displayedColumns.includes("generalInformation"),
      type: "dropdown",
      cellRenderer: (props: any) => (
        <Cell
          type={"dropdown"}
          onUpdate={handleCellUpdate}
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
      width: 120,
      resizable: true,
      hidden: !displayedColumns.includes("generalInformation"),
      cellRenderer: (props: any) => (
        <Cell
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
      key: "data.country",
      dataKey: "data.country",
      title: "Country",
      width: 200,
      resizable: true,
      header: "Project Information",
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 150,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 250,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 250,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      title: "Vendor Name",
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      type: "dropdown",
      cellRenderer: (props: any) => (
        <Cell
          type={"dropdown"}
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
      title: "Estimated Income (Budget Currency)",
      width: 300,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 250,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 250,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 150,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      type: "dropdown",
      cellRenderer: (props: any) => (
        <Cell
          type={"dropdown"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      type: "dropdown",
      cellRenderer: (props: any) => (
        <Cell
          type={"dropdown"}
          onUpdate={handleCellUpdate}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      type: "dropdown",
      cellRenderer: (props: any) => (
        <Cell
          type={"dropdown"}
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
      dataKey: "data.marketingResponsible",
      title: "Marketing Responsible",
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.productionProjectManager",
      dataKey: "data.productionProjectManager",
      title: "Production Project Manager",
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("projectInformation"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 250,
      resizable: true,
      header: "Purchase Order",
      hidden: !displayedColumns.includes("purchaseOrder"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 250,
      resizable: true,
      hidden: !displayedColumns.includes("purchaseOrder"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 150,
      resizable: true,
      hidden: !displayedColumns.includes("purchaseOrder"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 300,
      resizable: true,
      hidden: !displayedColumns.includes("purchaseOrder"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("purchaseOrder"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("purchaseOrder"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("purchaseOrder"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      header: "Cost Actuals",
      hidden: !displayedColumns.includes("costActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 150,
      resizable: true,
      hidden: !displayedColumns.includes("costActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
          onUpdate={handleCellUpdate}
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
      width: 200,
      resizable: true,
      header: "Sales Actuals",
      hidden: !displayedColumns.includes("salesActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("salesActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("salesActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("salesActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("salesActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("salesActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("salesActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("salesActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("salesActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("salesActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("salesActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("salesActuals"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      header: "Actuals in EUR",
      hidden: !displayedColumns.includes("actualsInEur"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("actualsInEur"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("actualsInEur"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      header: "Cost GL Postings",
      hidden: !displayedColumns.includes("costGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 150,
      resizable: true,
      hidden: !displayedColumns.includes("costGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("costGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      header: "Income GL Postings",
      hidden: !displayedColumns.includes("incomeGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("incomeGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("incomeGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("incomeGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("incomeGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("incomeGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("incomeGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("incomeGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 150,
      resizable: true,
      hidden: !displayedColumns.includes("incomeGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 200,
      resizable: true,
      hidden: !displayedColumns.includes("incomeGlPostings"),
      cellRenderer: (props: any) => (
        <Cell
          type={"text"}
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
      width: 100,
      resizable: true,
      header: "Actions",
      cellRenderer: (props: any) =>
        props.rowData.parentId === null ? (
          <Cell
            type={"button"}
            textColor={"green"}
            onUpdate={callSap}
            rowIndex={props.rowIndex}
            columnKey={props.column.dataKey}
            rowData={props.rowData}
            initialValue={"submit"}
          />
        ) : null,
    },
    {
      key: "__actions.edit",
      dataKey: "__actions.edit",
      title: "Edit",
      width: 100,
      resizable: true,
      cellRenderer: (props: any) =>
        props.rowData.parentId === null ? (
          <Cell
            type={"button"}
            textColor={"yellow"}
            onUpdate={handleCellUpdate}
            rowIndex={props.rowIndex}
            columnKey={props.column.dataKey}
            rowData={props.rowData}
            initialValue={"edit"}
          />
        ) : null,
    },
    {
      key: "__actions.parentize",
      dataKey: "__actions.parentize",
      title: "Parentize",
      width: 100,
      resizable: true,
      cellRenderer: (props: any) =>
        props.rowData.parentId === null ? null : (
          <Cell
            type={"button"}
            textColor={"blue"}
            onUpdate={parentizeSubmission}
            rowIndex={props.rowIndex}
            columnKey={props.column.dataKey}
            rowData={props.rowData}
            initialValue={"parentize"}
          />
        ),
    },
    {
      key: "__actions.delete",
      dataKey: "__actions.delete",
      title: "Delete",
      width: 100,
      resizable: true,
      cellRenderer: (props: any) => (
        <Cell
          type={"button"}
          textColor={"red"}
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
            case index < 50:
              colorClass = "orange";
              break;
            case index < 62:
              colorClass = "red";
              break;
            case index < 65:
              colorClass = "purple";
              break;
            case index < 75:
              colorClass = "blue";
              break;
            case index < 85:
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
            cleanable
            defaultExpandAll={false}
            block
            onChange={(value) => {
              var values: string[] = [];
              if (value.length < 1) {
                values = [
                  "generalInformation",
                  "projectInformation",
                  "purchaseOrder",
                  "costActuals",
                  "salesActuals",
                  "actualsInEur",
                  "costGlPostings",
                  "incomeGlPostings",
                ];
              } else {
                value.map((v) => {
                  values.push(v.toString());
                });
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
            <Text mb="8px">Authors</Text>
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
                        data={filter.selectedValues}
                        block
                      />
                    );
                    break;
                  case "date":
                    valuesField = (
                      <DateRangeInput
                        allowEditableInputs={true}
                        displayFormat="dd.MM.yyyy"
                      />
                    );
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
              // scrollLeft={scrollLeft}
              // onScroll={onScroll}
              // rowRenderer={rowRenderer}
              // overscanRowCount={10}
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
                  <DebugOverlay hidden={true}>
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
