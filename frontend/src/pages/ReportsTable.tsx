import { Box } from "@chakra-ui/react";
import BaseTable, {
  AutoResizer,
  Column,
  ColumnShape,
  unflatten,
} from "react-base-table";
import "react-base-table/styles.css";
import React, {
  cloneElement,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { RestAPI } from "../api/rest";
import { PAreport } from "../types/submission";
import { reduce } from "lodash";

interface Props {
  history: any;
}

export default function ReportsTable(props: Props) {
  const [reports, setReports] = useState<PAreport[]>([]);

  const RenderCell = (p: any) => {
    return (
      <div
        style={{
          backgroundColor:
            p.rowData["validation"] === "NOT OK" ? "#F00000" : "#FFFF",
        }}
        className={"content-preview"}
      >
        {p.cellData}
      </div>
    );
  };

  const headerRendererForTable = useCallback(
    (props: {
      cells: ReactNode[];
      columns: ColumnShape<{
        [k: string]: string;
      }>;
      headerIndex: number;
    }) => {
      const { headerIndex, columns, cells } = props;
      console.log("headerIndex", columns);
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

  useEffect(() => {
    RestAPI.getPAreport().then((Response) => setReports(Response.data));
  }, []);

  return (
    <Box
      w={"100%"}
      bg={"white"}
      minH={"85vh"}
      mb={5}
      mt={"-20px"}
      p="30px"
      border="1px"
      rounded="md"
      borderColor="gray.100"
    >
      <AutoResizer
        onResize={({ width, height }: { width: number; height: number }) => {}}
      >
        {({ width, height }) => (
          <BaseTable
            onColumnResizeEnd={({
              column,
              width,
            }: {
              column: any;
              width: number;
            }) => {}}
            width={width}
            height={height}
            rowKey="id"
            headerRenderer={headerRendererForTable}
            headerClassName="header-cells"
            fixed
            columns={[
              {
                key: "companyCode",
                dataKey: "companyCode",
                className: "red-border",
                group: "Company",
                title: "Company Code",
                width: 150,
                resizable: true,
                align: "center",
              },
              {
                key: "yearMonth",
                dataKey: "yearMonth",
                className: "red-border",
                group: "Company",
                title: "Year/Month",
                width: 150,
                resizable: true,
                align: "center",
              },
              {
                key: "projectNumber",
                dataKey: "projectNumber",
                className: "red-border",
                group: "Company",
                title: "Project Number",
                width: 150,
                resizable: true,
                align: "center",
              },

              {
                key: "projectName",
                dataKey: "projectName",
                className: "red-border",
                group: "Company",
                title: "Project Name",
                width: 150,
                resizable: true,
                align: "center",
              },
              {
                key: "invoiceNumber",
                dataKey: "invoiceNumber",
                className: "red-border",
                group: "Company",
                title: "Invoice Number",
                width: 150,
                resizable: true,
                align: "center",
              },
              {
                key: "incomeAccount",
                dataKey: "incomeAccount",
                className: "red-border",
                group: "Company",
                title: "Income Account",
                width: 150,
                resizable: true,
                align: "center",
              },
              {
                key: "incomeAmountLCSI",
                dataKey: "incomeAmountLCSI",
                className: "red-border",
                group: "Data",
                title: "Income Amount",
                width: 150,
                resizable: true,
                align: "center",
              },
              {
                key: "invoiceRecipientName",
                dataKey: "invoiceRecipientName",
                className: "red-border",
                group: "Data",
                title: "Invoice Recipient Name",
                width: 150,
                resizable: true,
                align: "center",
              },
              {
                key: "invoiceRecipientNumber",
                dataKey: "invoiceRecipientNumber",
                className: "red-border",
                group: "Data",
                title: "Invoice Recipient`s Account",
                width: 150,
                resizable: true,
                align: "center",
              },
              {
                key: "validation",
                dataKey: "validation",
                className: "red-border",
                group: "Data",
                title: "Validation",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "value",
                dataKey: "value",
                className: "red-border",
                group: "Data",
                title: "Value",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorVODNumber",
                dataKey: "vendorVODNumber",
                className: "red-border",
                group: "Data",
                title: "VOD Number",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorManufacturerNumber",
                dataKey: "vendorManufacturerNumber",
                className: "red-border",
                group: "Data",
                title: "Manufacturer Number",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorManucturerName",
                dataKey: "vendorManucturerName",
                className: "red-border",
                group: "Data",
                title: "Manufacturer Name",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorBU",
                dataKey: "vendorBU",
                className: "red-border",
                group: "Data",
                title: "Business Unit",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorShare",
                dataKey: "vendorShare",
                className: "red-border",
                group: "Data",
                title: "Vendor % Share",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorValue",
                dataKey: "vendorValue",
                className: "red-border",
                group: "Data",
                title: "Vendor Value",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorManufacturerNumber",
                dataKey: "vendorManufacturerNumber",
                className: "red-border",
                group: "Data",
                title: "Manufacturer Number",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorManufacturerName",
                dataKey: "vendorManufacturerName",
                className: "red-border",
                group: "Data",
                title: "Manufacturer Name",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorBU",
                dataKey: "vendorBU",
                className: "red-border",
                group: "Data",
                title: "Business Unit",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
            ]}
            data={unflatten([...reports] as any[])}
          ></BaseTable>
        )}
      </AutoResizer>
    </Box>
  );
}
