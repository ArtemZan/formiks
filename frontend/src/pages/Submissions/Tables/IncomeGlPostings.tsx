import BaseTable, { AutoResizer, Column, unflatten } from "react-base-table";
import EditableTableCell from "../../../components/EditableTableCell";

export function IncomeGlPostingsTable(gprops: any) {
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
      key: "data.yearMonthIncomeGL",
      dataKey: "data.yearMonthIncomeGL",
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
      key: "data.documentTypeIncomeGL",
      dataKey: "data.documentTypeIncomeGL",
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
      key: "data.postingDateIncomeGL",
      dataKey: "data.postingDateIncomeGL",
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
      key: "data.documentDateIncomeGL",
      dataKey: "data.documentDateIncomeGL",
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
      key: "data.documentNumberIncomeGL",
      dataKey: "data.documentNumberIncomeGL",
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
      key: "data.incomeAccountIncomeGL",
      dataKey: "data.incomeAccountIncomeGL",
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
      key: "data.incomeAmountLCIncomeGL",
      dataKey: "data.incomeAmountLCIncomeGL",
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
      key: "data.incomeAmountDCIncomeGL",
      dataKey: "data.incomeAmountDCIncomeGL",
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
      key: "data.dcIncomeGL",
      dataKey: "data.dcIncomeGL",
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
      key: "data.incomeAmountEurIncomeGL",
      dataKey: "data.incomeAmountEurIncomeGL",
      title: "Income Amount (EUR)",
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
