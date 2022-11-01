import BaseTable, { AutoResizer, Column, unflatten } from "react-base-table";
import EditableTableCell from "../../../components/EditableTableCell";

export function SalesActualsTable(gprops: any) {
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
      key: "data.yearMonthSA",
      dataKey: "data.yearMonthSA",
      title: "Year / Month",
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
      key: "data.documentTypeSA",
      dataKey: "data.documentTypeSA",
      title: "Document Type",
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
      key: "data.postingDateSA",
      dataKey: "data.postingDateSA",
      title: "Posting Date",
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
      key: "data.documentDateSA",
      dataKey: "data.documentDateSA",
      title: "Document Date",
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
      key: "data.documentNumberSA",
      dataKey: "data.documentNumberSA",
      title: "Document Number",
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
      key: "data.invoiceNumberSA",
      dataKey: "data.invoiceNumberSA",
      title: "Invoice Number",
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
      key: "data.incomeAccountSA",
      dataKey: "data.incomeAccountSA",
      title: "Income Account",
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
      key: "data.name1SA",
      dataKey: "data.name1SA",
      title: "Name 1",
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
      key: "data.incomeAmountLC",
      dataKey: "data.incomeAmountLC",
      title: "Income Amount (LC)",
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
      key: "data.incomeAmountDC",
      dataKey: "data.incomeAmountDC",
      title: "Income Amount (DC)",
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
      key: "data.incomeStatus",
      dataKey: "data.incomeStatus",
      title: "Income Status",
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
      key: "data.actualResultLC",
      dataKey: "data.actualResultLC",
      title: "Actual Result (LC)",
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
