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

import Select from "react-select";
import Project from "../../types/project";
import { Submission } from "../../types/submission";
import { createGlobalStyle } from "styled-components";
import styled from "styled-components";
import { Overlay } from "react-overlays";
import DatePicker from "react-datepicker";

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
import { SearchIcon } from "@chakra-ui/icons";
import { VscDebugRerun, VscDebugStart } from "react-icons/all";

interface Props {
  history: any;
}

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
  },
  {
    cellValue: any;
    options: any[];
  }
> {
  constructor(props: any) {
    super(props);

    this.state = {
      options: [],
      cellValue: undefined,
    };
  }
  //   componentDidUpdate(prevProps: any) {
  //     if (prevProps.initialValue !== this.props.initialValue) {
  //       this.setState({ cellValue: this.props.initialValue });
  //     }
  //   }

  componentDidMount() {
    var value: any = undefined;
    switch (this.props.type) {
      case "text":
      case "number":
        value = this.props.initialValue
          ? this.props.initialValue.toString()
          : "";
        break;
      case "date":
        value =
          this.props.initialValue && this.props.initialValue !== null
            ? Date.parse(this.props.initialValue)
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
      <div className="vendors-table-cell">
        {this.props.type === "text" || this.props.type === "number" ? (
          <ContentEditable
            html={this.state.cellValue ?? ""}
            onChange={(event) => {
              this.setState({ cellValue: event.target.value });
            }}
            onFocus={() => {
              setTimeout(() => {
                document.execCommand("selectAll", false);
              }, 0);
            }}
            onKeyPress={
              this.props.type === "number"
                ? (event) => {
                    const keyCode = event.keyCode || event.which;
                    const string = String.fromCharCode(keyCode);
                    const regex = /[0-9]|\./;

                    if (!regex.test(string)) {
                      event.defaultPrevented = false;
                      if (event.preventDefault) event.preventDefault();
                    }
                  }
                : undefined
            }
            onBlur={(event) => {
              this.props.onUpdate(
                this.props.rowData.id,
                `[${this.props.rowIndex}].${this.props.columnKey}`,
                this.props.type === "number"
                  ? Number(this.state.cellValue)
                  : this.state.cellValue
              );
            }}
            className="content-editable"
          />
        ) : this.props.type === "date" ? (
          <DatePicker
            showTimeInput
            isClearable
            customInput={<input className="datepicker-input"></input>}
            selected={this.state.cellValue}
            onChange={(date) => {
              this.setState({ cellValue: date });
            }}
            onCalendarClose={() => {
              this.props.onUpdate(
                this.props.rowData.id,
                `[${this.props.rowIndex}].${this.props.columnKey}`,
                this.state.cellValue !== null
                  ? this.state.cellValue.toString()
                  : null
              );
            }}
            dateFormat="dd.MM.yyyy HH:mm"
          />
        ) : this.props.type === "dropdown" ||
          this.props.type === "multiple-dropdown" ? (
          //   FIXME: use http://bvaughn.github.io/react-virtualized-select/
          <Select
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
                minHeight: 52,
                backgroundColor: "transparent",
                border: "1px solid transparent",
                transition: "0.3s",
                "&:hover": {
                  border: "1px solid transparent",
                },
              }),
            }}
            theme={(theme) => ({
              ...theme,
              borderRadius: 0,
              colors: {
                ...theme.colors,
                primary: "#3082CE",
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
                `[${this.props.rowIndex}].${this.props.columnKey}`,
                v
              );
            }}
            onFocus={async () => {
              this.setState({
                options: loadOptions(this.props.columnKey ?? ""),
              });
            }}
            onBlur={() => {
              this.setState({
                options: [],
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
              onClick={() => {
                this.props.onUpdate(
                  this.props.rowData.id,
                  `[${this.props.rowIndex}].data.companyName`,
                  "Updated Name"
                );
              }}
              size="sm"
              color="white"
              backgroundColor="#4dcc9d"
              className="table-button"
              //   aria-label="Search database"
              //   icon={<VscDebugStart />}
            >
              update
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
  }
  return [];
};

function bytesToSize(bytes: number) {
  var sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes == 0) return "0 Byte";
  var i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
}

export function VendorsTable(props: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
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

  const getHeapInfo = () => {
    var memory = (window.performance as any).memory;
    var info: any = {
      total: memory.jsHeapSizeLimit,
      allocated: memory.totalJSHeapSize,
      current: memory.usedJSHeapSize,
      domSize: document.getElementsByTagName("*").length,
    };
    setHeapInfo(info);
  };

  async function partialUpdate(submission: string, path: string, value: any) {
    setTotalRequests(totalRequests + 1);
    var s = path.split(".");
    s.shift();
    RestAPI.updateSubmissionPartial(submission, s.join("."), value);
  }

  function handleCellUpdate(submission: string, path: string, value: any) {
    if (_.get(submissions, path) !== value) {
      _.set(submissions, path, value);
      partialUpdate(submission, path, value);
    }
  }
  function handleCellUpdateRedraw(
    submission: string,
    path: string,
    value: any
  ) {
    var temp = [...submissions];
    _.set(temp, path, value);
    setSubmissions(temp);
    // if (_.get(submissions, path) !== value) {
    //   _.set(submissions, path, value);
    //   partialUpdate(submission, path, value);
    // }
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
    });
  }, []);

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
            case index < 6:
              colorClass = index === 0 ? "" : "green";
              break;
            case index < 30:
              colorClass = "lgreen";
              break;
            case index < 37:
              colorClass = "lorange";
              break;
            case index < 49:
              colorClass = "orange";
              break;
            case index < 61:
              colorClass = "red";
              break;
            case index < 64:
              colorClass = "purple";
              break;
            case index < 74:
              colorClass = "blue";
              break;
            default:
              colorClass = "lblue";
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
        minH={"85vh"}
        // p={4}
        mb={5}
        border="1px"
        rounded="md"
        borderColor="gray.100"
      >
        <AutoResizer>
          {({ width, height }) => (
            <BaseTable
              //   onColumnResize={({
              //     column,
              //     width,
              //   }: {
              //     column: any;
              //     width: number;
              //   }) => saveCellWidth(column.key, width)}
              overscanRowCount={0}
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
                  cellRenderer: (props) => <div />,
                  className: "expand",
                },
                {
                  key: "data.companyName",
                  dataKey: "data.companyName",
                  title: "Company Name",
                  width: 200,
                  resizable: true,
                  header: "General Information",
                  cellRenderer: (props) => (
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
                // {
                //   key: "__action",
                //   dataKey: "__action",
                //   title: "Action",
                //   width: 100,
                //   resizable: true,
                //   cellRenderer: (props) => (
                //     <Cell
                //       type={"button"}
                //       onUpdate={handleCellUpdateRedraw}
                //       rowIndex={props.rowIndex}
                //       columnKey={props.column.dataKey}
                //       rowData={props.rowData}
                //       initialValue={props.cellData}
                //     />
                //   ),
                // },
                {
                  key: "data.companyCode",
                  dataKey: "data.companyCode",
                  title: "Company Code",
                  width: 150,
                  resizable: true,
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  key: "data.country",
                  dataKey: "data.country",
                  title: "Country",
                  width: 200,
                  resizable: true,
                  header: "Project Information",
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
                  cellRenderer: (props) => (
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
              ]}
              headerRenderer={headerRendererForTable}
              headerClassName="header-cells"
              data={unflatten([...submissions] as any[])}
              rowKey="id"
              headerHeight={[50, 50]}
              rowHeight={55}
              overlayRenderer={
                <div>
                  <DebugOverlay>
                    <HStack spacing={0}>
                      <Text w="120%" float="left">
                        Requested Heap Size:
                      </Text>
                      <Text w="80%" textAlign="right">
                        {bytesToSize(heapInfo.total)}
                      </Text>
                    </HStack>
                    <HStack spacing={0}>
                      <Text w="120%" float="left">
                        Allocated Heap Size:
                      </Text>
                      <Text w="80%" textAlign="right">
                        {bytesToSize(heapInfo.allocated)}
                      </Text>
                    </HStack>
                    <HStack spacing={0}>
                      <Text w="120%" float="left">
                        Active Heap Size:
                      </Text>
                      <Text w="80%" textAlign="right">
                        {bytesToSize(heapInfo.current)}
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
              //   components={{ TableCell: TableCelll }}
              //   estimatedRowHeight={50}
            ></BaseTable>
          )}
        </AutoResizer>
      </Box>
    </div>
  );
}

export default VendorsTable;
