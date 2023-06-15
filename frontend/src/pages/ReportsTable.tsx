import { Box } from "@chakra-ui/react";
import BaseTable, {
  AutoResizer,
  Column,
  ColumnShape,
  unflatten,
} from "react-base-table";
import "react-base-table/styles.css";
import React, { useEffect, useState } from "react";
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
            fixed
            columns={[
              {
                key: "companyCode",
                dataKey: "companyCode",
                title: "Company Code",
                width: 150,
                resizable: true,
                align: "center",
              },
              {
                key: "yearMonth",
                dataKey: "yearMonth",
                title: "Year/Month",
                width: 150,
                resizable: true,
                align: "center",
              },
              {
                key: "projectNumber",
                dataKey: "projectNumber",
                title: "Project Number",
                width: 150,
                resizable: true,
                align: "center",
              },

              {
                key: "projectName",
                dataKey: "projectName",
                title: "Project Name",
                width: 150,
                resizable: true,
                align: "center",
              },
              {
                key: "invoiceNumber",
                dataKey: "invoiceNumber",
                title: "Invoice Number",
                width: 150,
                resizable: true,
                align: "center",
              },
              {
                key: "incomeAccount",
                dataKey: "incomeAccount",
                title: "Income Account",
                width: 150,
                resizable: true,
                align: "center",
              },
              {
                key: "incomeAmountLCSI",
                dataKey: "incomeAmountLCSI",
                title: "Income Amount",
                width: 150,
                resizable: true,
                align: "center",
              },
              {
                key: "invoiceRecipientName",
                dataKey: "invoiceRecipientName",
                title: "Invoice Recipient Name",
                width: 150,
                resizable: true,
                align: "center",
              },
              {
                key: "invoiceRecipientNumber",
                dataKey: "invoiceRecipientNumber",
                title: "Invoice Recipient`s Account",
                width: 150,
                resizable: true,
                align: "center",
              },
              {
                key: "validation",
                dataKey: "validation",
                title: "Validation",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "value",
                dataKey: "value",
                title: "Value",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorVODNumber",
                dataKey: "vendorVODNumber",
                title: "VOD Number",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorManufacturerNumber",
                dataKey: "vendorManufacturerNumber",
                title: "Manufacturer Number",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorManucturerName",
                dataKey: "vendorManucturerName",
                title: "Manufacturer Name",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorBU",
                dataKey: "vendorBU",
                title: "Business Unit",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorShare",
                dataKey: "vendorShare",
                title: "Vendor % Share",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorValue",
                dataKey: "vendorValue",
                title: "Vendor Value",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorManufacturerNumber",
                dataKey: "vendorManufacturerNumber",
                title: "Manufacturer Number",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorManufacturerName",
                dataKey: "vendorManufacturerName",
                title: "Manufacturer Name",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
              {
                key: "vendorBU",
                dataKey: "vendorBU",
                title: "Business Unit",
                width: 150,
                resizable: true,
                align: "center",
                cellRenderer: RenderCell,
              },
            ]}
            data={reports}
          ></BaseTable>
        )}
      </AutoResizer>
    </Box>
  );
}
