import { Box, Text } from "@chakra-ui/react";
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
import Select from "react-select";
import { PAreport } from "../types/submission";
import { reduce } from "lodash";

interface Props {
  history: any;
}

export default function ReportsTable(props: Props) {
  const [reports, setReports] = useState<PAreport[]>([]);
  const [filteredReports, setFilteredReports] = useState<PAreport[]>([]);
  const [allReports, setAllReports] = useState<PAreport[]>([]);

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
  interface Option {
    value: string;
    label: string;
  }

  const [options, setOptions] = useState<Option[]>([]);

  const headerRendererForTable = useCallback(
    (props: {
      cells: ReactNode[];
      columns: ColumnShape<{
        [k: string]: string;
      }>;
      headerIndex: number;
    }) => {
      const { headerIndex, columns, cells } = props;
      // const customStyle = headerIndex === 6 ? { border: "2px solid red" } : {};
      if (headerIndex === 0) {
        return cells.map((cell, index) => {
          console.log(index);
          return cloneElement(cell as ReactElement, {
            className: "BaseTable__header-cell",
            children: (
              <span style={{ fontWeight: 650 }}>
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

  // const headerRendererForTable = useCallback(
  //   (props: {
  //     cells: ReactNode[];
  //     columns: ColumnShape<{
  //       [k: string]: string;
  //     }>;
  //     headerIndex: number;
  //   }) => {
  //     console.log("AAAA");
  //     const { cells, columns } = props;

  //     return cells.map((cell, index) => {
  //       const column = columns[index];
  //       console.log(columns);
  //       // Apply custom style to the column with wider right border
  //       const customStyle =
  //         column.dataKey === "companyCode"
  //           ? { borderRight: "2px solid red" }
  //           : {};

  //       return cloneElement(cell as ReactElement, {
  //         className: "BaseTable__header-cell",
  //         style: { ...customStyle },
  //         children: (
  //           <span style={{ fontWeight: 650 }} key={index}>
  //             {column.header ? column.header : ""}
  //           </span>
  //         ),
  //       });
  //     });
  //   },
  //   []
  // );

  useEffect(() => {
    RestAPI.getPAreport().then((response) => {
      setAllReports(response.data);
      setReports(response.data);
    });
  }, []);

  useEffect(() => {
    const uniqueYearMonths = Array.from(
      new Set(allReports.map((report) => report.yearMonth))
    );
    const optionsData = uniqueYearMonths.map((yearMonth) => ({
      value: yearMonth,
      label: yearMonth,
    }));
    setOptions(optionsData);
  }, [allReports]);

  return (
    <div>
      <Box
        key="ASD233"
        shadow="md"
        color="gray.600"
        height={"170"}
        backgroundColor="white"
        mb={10}
        p={8}
        pb={0}
        rounded="md"
        w={"100%"}
      >
        <Text key="ASD" mb="8px">
          Period
        </Text>
        <Select
          key={"DSADSA"}
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
          options={options}
          onChange={(value: any) => {
            var b = allReports.filter((report) => {
              return report.yearMonth === value.value;
            });
            setReports(b);
          }}
        />
      </Box>
      <Box
        w={"100%"}
        key={"123213"}
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
          onResize={({
            width,
            height,
          }: {
            width: number;
            height: number;
          }) => {}}
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
              headerHeight={[50, 50]}
              headerRenderer={headerRendererForTable}
              headerClassName="header-cells"
              fixed
              columns={[
                {
                  key: "companyCode",
                  header: "Data pulled from Sales Invoice Section",

                  dataKey: "companyCode",
                  className: "red-border",
                  group: "Data pulled from Sales Invoice Section",
                  title: "Company Code",
                  style: { borderRight: "2px solid red" },
                  width: 200,
                  resizable: true,
                  align: "center",
                },
                {
                  key: "yearMonth",
                  dataKey: "yearMonth",
                  className: "red-border",
                  group: "Data pulled from Sales Invoice Section",
                  title: "Year/Month",
                  width: 150,
                  resizable: true,
                  align: "center",
                },
                {
                  key: "projectNumber",
                  dataKey: "projectNumber",
                  className: "red-border",
                  group: "Data pulled from Sales Invoice Section",
                  title: "Project Number",
                  width: 150,
                  resizable: true,
                  align: "center",
                },

                {
                  key: "projectName",
                  dataKey: "projectName",
                  className: "red-border",
                  group: "Data pulled from Sales Invoice Section",
                  title: "Project Name",
                  width: 250,
                  resizable: true,
                  align: "center",
                },
                {
                  key: "invoiceNumber",
                  dataKey: "invoiceNumber",
                  className: "red-border",
                  group: "Data pulled from Sales Invoice Section",
                  title: "Invoice Number",
                  width: 150,
                  resizable: true,
                  align: "center",
                },
                {
                  key: "incomeAccount",
                  dataKey: "incomeAccount",
                  className: "red-border",
                  group: "Data pulled from Sales Invoice Section",
                  title: "Income Account",
                  width: 150,
                  resizable: true,
                  align: "center",
                },
                {
                  key: "incomeAmountLCSI",
                  dataKey: "incomeAmountLCSI",
                  className: "red-border",
                  group: "Data pulled from Sales Invoice Section",
                  title: "Income Amount",
                  width: 150,
                  resizable: true,
                  align: "center",
                },
                {
                  key: "invoiceRecipientName",
                  dataKey: "invoiceRecipientName",
                  className: "red-border",
                  group: "Data pulled from Sales Invoice Section",
                  title: "Invoice Recipient Name",
                  width: 150,
                  resizable: true,
                  align: "center",
                },
                {
                  key: "invoiceRecipientNumber",
                  dataKey: "invoiceRecipientNumber",
                  className: "red-border",
                  title: "Invoice Recipient`s Account",
                  width: 150,
                  resizable: true,
                  align: "center",
                },
                {
                  key: "validation",
                  header: "Validation",
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
                  header: "OK External Sales",
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
                  header: "Intercompany Sales",
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
                  key: "vendorManufacturerNumber2",
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
                  key: "vendorManufacturerName2",
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
                  key: "vendorBU2",
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
    </div>
  );
}
