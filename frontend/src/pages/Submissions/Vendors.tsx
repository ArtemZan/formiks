import { Box, Button, HStack } from "@chakra-ui/react";
import {
  cloneElement,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Text } from "@chakra-ui/react";
import Project from "../../types/project";
import { Submission } from "../../types/submission";

import BaseTable, {
  AutoResizer,
  Column,
  ColumnShape,
  unflatten,
} from "react-base-table";
import ContentEditable from "react-contenteditable";
import "react-base-table/styles.css";
import styled from "@emotion/styled";
import { RestAPI } from "../../api/rest";
import React from "react";
import _ from "lodash";

interface Props {
  history: any;
}

const Overlay = styled.div`
  width: 300px;
  background: lightgray;
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 5px 15px;
  border-radius: 10px;
  color: white;
`;

// frozen: Column.FrozenDirection.LEFT,

// Use React.Component because of https://github.com/lovasoa/react-contenteditable/issues/161
class Cell extends React.Component<
  {
    onUpdate: any;
    rowIndex: number;
    columnKey: string | undefined;
    // type: string;
    initialValue: any;
  },
  { cellValue: string }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      cellValue: props.initialValue ? props.initialValue.toString() : "",
    };
  }
  render() {
    return (
      <ContentEditable
        html={this.state.cellValue}
        onChange={(event) => {
          this.setState({ cellValue: event.target.value });
        }}
        onFocus={() => {
          setTimeout(() => {
            document.execCommand("selectAll", false);
          }, 0);
        }}
        //   onKeyPress={(event) => {
        //     const keyCode = event.keyCode || event.which;
        //     const string = String.fromCharCode(keyCode);
        //     const regex = /[0-9,]|\./;

        //     if (!regex.test(string)) {
        //       event.defaultPrevented = false;
        //       if (event.preventDefault) event.preventDefault();
        //     }
        //   }}
        onBlur={(event) => {
          this.props.onUpdate(
            `[${this.props.rowIndex}].${this.props.columnKey}`,
            this.state.cellValue
          );
        }}
        className="content-editable"
      />
    );
  }
}

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

  function handleCellUpdate(path: string, value: any) {
    _.set(submissions, path, value);
  }

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
        return cells.map((cell, index) =>
          cloneElement(cell as ReactElement, {
            // style: { background: "red" },
            children: (
              <span key={index}>
                {columns[index].header ? columns[index].header : ""}
              </span>
            ),
          })
        );
      }
      return cells;
    },
    []
  );
  return (
    <div>
      <Button
        onClick={() => {
          console.log(submissions);
        }}
        mb={5}
      >
        Extract State
      </Button>
      <Box
        w={"100%"}
        backgroundColor="white"
        minH={"1000px"}
        p={4}
        mb={5}
        border="1px"
        rounded="md"
        borderColor="gray.100"
      >
        <AutoResizer>
          {({ width, height }) => (
            <BaseTable
              ignoreFunctionInColumnCompare={false}
              expandColumnKey={"data.companyName"}
              width={width}
              height={height}
              fixed
              columns={[
                {
                  key: "data.companyName",
                  dataKey: "data.companyName",
                  title: "Company Name",
                  width: 200,
                  resizable: true,
                  header: "General Information",
                  cellRenderer: (props) => (
                    <Cell
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                  cellRenderer: (props) => (
                    <Cell
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
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
                      onUpdate={handleCellUpdate}
                      rowIndex={props.rowIndex}
                      columnKey={props.column.dataKey}
                      initialValue={props.cellData}
                    />
                  ),
                },
              ]}
              headerRenderer={headerRendererForTable}
              data={unflatten([...submissions] as any[])}
              rowKey="id"
              headerHeight={[50, 50]}
              rowHeight={55}
              overlayRenderer={
                <div>
                  <Overlay>
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
                  </Overlay>
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
