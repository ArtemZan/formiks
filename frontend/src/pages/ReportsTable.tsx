import { Box, Text, IconButton, Flex } from "@chakra-ui/react";
import BaseTable, {
  AutoResizer,
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
  useState,
} from "react";
import {
  BiPlusMedical,
  RiFileExcel2Line,
  RiUserFill,
  RiGroupFill,
  IoSave,
  FaSleigh,
} from "react-icons/all";
import { RestAPI } from "../api/rest";
import EditableTableCell from "../components/EditableTableCell";
import { NumberWithCommas } from "../utils/Numbers";
import Select from "react-select";
import { PAreport } from "../types/submission";
import { random, reduce } from "lodash";
import { AiTwotoneFileZip } from "react-icons/ai";
import * as XLSX from "xlsx";

interface Props {
  history: any;
}

export default function ReportsTable(props: Props) {
  const [reports, setReports] = useState<PAreport[]>([]);
  const [allReports, setAllReports] = useState<PAreport[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [updateVersion, setUpdateVersion] = useState(0);
  const [columns, SetColumns] = useState<any[]>([]);

  const RenderCell = (p: any) => {
    if (
      p.rowData["id"] === "total" &&
      (p.columnIndex === 6 || p.columnIndex === 10)
    ) {
      return totalAmount.toFixed(2);
    }
    return (
      <div
        style={{
          backgroundColor: (() => {
            if (p.rowData["validation"] === "NOT OK" && p.columnIndex === 9) {
              return "#FF0000";
            } else if (
              p.rowData["validation"] === "NOT OK" &&
              p.columnIndex > 9
            ) {
              return "#FF0000";
            } else if (
              p.rowData["validation"] === "OK" &&
              p.columnIndex === 9
            ) {
              return "#c0bcbc";
            } else {
              return "FFFFFF";
            }
          })(),
        }}
        //   p.rowData["validation"] === "NOT OK" ? "#F00000" : "#z1",

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
          var className = "BaseTable__header-cell";
          if (index >= 0 && index <= 8) {
            className = "BaseTable__header-cell blue2";
          } else if (index === 9) {
            className = "BaseTable__header-cell grey2";
          } else if (index > 9 && index <= 14) {
            className = "BaseTable__header-cell biege2";
          } else if (index > 14 && index <= 19) {
            className = "BaseTable__header-cell orange2";
          }
          return cloneElement(cell as ReactElement, {
            className: className,
            children: (
              <span style={{ fontWeight: 650 }}>
                {columns[index].header ? columns[index].header : ""}
              </span>
            ),
          });
        });
      }
      if (headerIndex === 1) {
        return cells.map((cell, index) => {
          if (index >= 0 && index <= 8) {
            return cloneElement(cell as ReactElement, {
              className: "BaseTable__header-cell blue2",
            });
          } else if (index === 9) {
            return cloneElement(cell as ReactElement, {
              className: "BaseTable__header-cell grey2",
            });
          } else if (index > 9 && index <= 14) {
            return cloneElement(cell as ReactElement, {
              className: "BaseTable__header-cell biege2",
            });
          } else if (index > 14 && index <= 19) {
            return cloneElement(cell as ReactElement, {
              className: "BaseTable__header-cell orange2",
            });
          } else {
            return cell;
          }
        });
      }
      return cells;
    },
    []
  );

  useEffect(() => {
    RestAPI.getPAreport().then((response) => {
      let sum = 0;
      response.data.forEach((report) => {
        sum += parseFloat(report.incomeAmountLCSI);
      });
      setTotalAmount(sum);
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
    const sortedData = optionsData.sort((a, b) => {
      const [yearA, monthA] = a.label
        .split("/")
        .map((str) => parseInt(str, 10));
      const [yearB, monthB] = b.label
        .split("/")
        .map((str) => parseInt(str, 10));

      if (yearA !== yearB) {
        return yearB - yearA;
      }
      return monthB - monthA;
    });
    setOptions(sortedData);
  }, [allReports]);

  useEffect(() => {
    let sum = 0;
    reports.forEach((report) => {
      const incomeAmount = parseFloat(report.incomeAmountLCSI);

      if (!isNaN(incomeAmount)) {
        sum += incomeAmount;
      }
    });
    setTotalAmount(sum);
    setUpdateVersion((prevVersion) => prevVersion + 1);
  }, [reports]);

  return (
    <div>
      <Box
        key={"Box1"}
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
        <Text key={"Text1"} mb="8px">
          Period
        </Text>
        <Flex justifyContent={"space-between"}>
          <Box width={"50%"}>
            <Select
              key={"select1"}
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
          <IconButton
            colorScheme="teal"
            onClick={() => {
              const mapKeysToColumnNames = (data: any) => {
                return reports.map((item) => ({
                  Identificator: item.id,
                  "Comapny Code": item.companyCode,
                  "Year/Month": item.yearMonth,
                  "Project Number": item.projectNumber,
                  "Project Name": item.projectName,
                  "Invoice Number": item.invoiceNumber,
                  "Income Account": item.incomeAccount,
                  "Income Amount": item.incomeAmountLCSI,
                  "Invoice Recipient Name": item.invoiceRecipientName,
                  "Invoice Recipient`s Account": item.invoiceRecipientNumber,
                  Validation: item.validation,
                  "External Sales Value": isNaN(parseFloat(item.exSalesValue))
                    ? ""
                    : parseFloat(item.exSalesValue),
                  "External Sales VOD Number": item.exSalesVODNumber,
                  "External Sales Manufacturer Number":
                    item.exSalesManufacturerNumber,
                  "External Sales Manufacturer Name":
                    item.exSalesManufacturerName,
                  "External Sales BU": item.exSalesBU,
                  "Intercompany Sales Vendor Share": item.intSalesVendorShare,
                  "Intercompany Sales Vendor Amount": isNaN(
                    parseFloat(item.intSalesVendorAmount)
                  )
                    ? ""
                    : parseFloat(item.intSalesVendorAmount),

                  "Intercompany Sales Manufacturer Number":
                    item.intSalesManufacturerNumber,
                  "Intercompany Sales Manufacturer Name":
                    item.intSalesManufacturerName,
                  "Intercompany Sales BU": item.intSalesBU,
                  // add more mappings as per your needs
                }));
              };
              const formattedData = mapKeysToColumnNames(reports);
              const ws = XLSX.utils.json_to_sheet(formattedData);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
              XLSX.writeFile(wb, "Marketing Income PA Allocation Report.xlsx");
            }}
            aria-label="export"
            icon={<RiFileExcel2Line />}
          ></IconButton>
        </Flex>
        <Text textAlign="center" fontWeight="bold" fontSize="xl" mt="auto">
          Marketing Income PA Allocation Report
        </Text>
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
              key={updateVersion}
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
              frozenData={
                [
                  {
                    id: "total",
                    data: {},
                    parentId: null,
                  },
                ] as any[]
              }
              columns={[
                {
                  key: "companyCode",
                  header: "Data pulled from Sales Invoice Section",

                  dataKey: "companyCode",
                  className: "red-border",
                  group: "Data pulled from Sales Invoice Section",
                  title: "Company Code",
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
                  title: "Income Amoun (LC)",
                  width: 150,
                  resizable: true,
                  align: "center",
                  cellRenderer: RenderCell,
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
                  style: { borderRight: "2px solid red" },
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
                  style: { borderRight: "2px solid red" },
                  width: 150,
                  resizable: true,
                  align: "center",
                  cellRenderer: RenderCell,
                },
                {
                  key: "value",
                  header: "OK External Sales",
                  dataKey: "exSalesValue",
                  className: "red-border",
                  group: "Data",
                  title: "Value (LC)",
                  width: 150,
                  resizable: true,
                  align: "center",
                  cellRenderer: RenderCell,
                },
                {
                  key: "vendorVODNumber",
                  dataKey: "exSalesVODNumber",
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
                  dataKey: "exSalesManufacturerNumber",
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
                  dataKey: "exSalesManufacturerName",
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
                  dataKey: "exSalesBU",
                  className: "red-border",
                  group: "Data",
                  title: "Business Unit",
                  width: 150,
                  style: { borderRight: "2px solid red" },
                  resizable: true,
                  align: "center",
                  cellRenderer: RenderCell,
                },
                {
                  key: "vendorShare",
                  header: "Intercompany Sales",
                  dataKey: "intSalesVendorShare",
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
                  dataKey: "intSalesVendorAmount",
                  className: "red-border",
                  group: "Data",
                  title: "Vendor Value (LC)",
                  width: 150,
                  resizable: true,
                  align: "center",
                  cellRenderer: RenderCell,
                },
                {
                  key: "vendorManufacturerNumber2",
                  dataKey: "intSalesManufacturerNumber",
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
                  dataKey: "intSalesManufacturerName",
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
                  dataKey: "intSalesBU",
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
