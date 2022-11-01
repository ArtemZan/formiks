import { useEffect } from "react";
import BaseTable, { AutoResizer, Column, unflatten } from "react-base-table";
import EditableTableCell from "../../../components/EditableTableCell";

export function ProjectInformationTable(gprops: any) {
  useEffect(() => {});
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
      key: "data.country",
      dataKey: "data.country",
      title: "Country",
      width: 200,
      resizable: true,
      header: "Project Information",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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

      type: "dropdown",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          onUpdate={gprops.handleCellUpdate}
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

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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

      type: "dropdown",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          onUpdate={gprops.handleCellUpdate}
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

      type: "dropdown",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          onUpdate={gprops.handleCellUpdate}
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

      type: "dropdown",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          onUpdate={gprops.handleCellUpdate}
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

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
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
      width: 300,
      resizable: true,

      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={gprops.handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
  ];

  return (
    <AutoResizer>
      {({ width, height }) => (
        <BaseTable
          ignoreFunctionInColumnCompare={false}
          defaultExpandedRowKeys={[]}
          width={width}
          height={height}
          expandColumnKey={"__expand"}
          fixed
          columns={tableCells}
          headerClassName="header-cells"
          data={unflatten([...gprops.submissions] as any[])}
          rowKey="id"
          headerHeight={50}
          rowHeight={55}
        ></BaseTable>
      )}
    </AutoResizer>
  );
}
