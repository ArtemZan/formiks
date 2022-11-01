import BaseTable, { AutoResizer, Column, unflatten } from "react-base-table";
import EditableTableCell from "../../../components/EditableTableCell";

export function CostActualsTable(gprops: any) {
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
      key: "data.yearMonth",
      dataKey: "data.yearMonth",
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
      key: "data.documentType",
      dataKey: "data.documentType",
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
      key: "data.postingDate",
      dataKey: "data.postingDate",
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
      key: "data.documentDate",
      dataKey: "data.documentDate",
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
      key: "data.documentNumber",
      dataKey: "data.documentNumber",
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
      key: "data.invoiceNumber",
      dataKey: "data.invoiceNumber",
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
      key: "data.costAccount",
      dataKey: "data.costAccount",
      title: "Cost Account",
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
      key: "data.name1",
      dataKey: "data.name1",
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
      key: "data.costAmountLC",
      dataKey: "data.costAmountLC",
      title: "Cost Amount (LC)",
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
      key: "data.costAmountDC",
      dataKey: "data.costAmountDC",
      title: "Cost Amount (DC)",
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
      key: "data.dc",
      dataKey: "data.dc",
      title: "DC",
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
      key: "data.costStatus",
      dataKey: "data.costStatus",
      title: "Cost Status",
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
