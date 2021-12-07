import BaseTable, { AutoResizer, Column, unflatten } from "react-base-table";
import EditableTableCell from "../../../components/EditableTableCell";

export function EurActualsTable(gprops: any) {
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
      key: "data.incomeAmountEur",
      dataKey: "data.incomeAmountEur",
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
    {
      key: "data.costAmountEur",
      dataKey: "data.costAmountEur",
      title: "Cost Amount (EUR)",
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
      key: "data.actualResultEur",
      dataKey: "data.actualResultEur",
      title: "Actual Result (EUR)",
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
