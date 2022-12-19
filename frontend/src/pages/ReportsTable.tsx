import { Box } from "@chakra-ui/react";
import BaseTable, {
  AutoResizer,
  Column,
  ColumnShape,
  unflatten,
} from "react-base-table";
import "react-base-table/styles.css";

interface Props {
  history: any;
}

export default function ReportsTable(props: Props) {
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
                key: "hello",
                dataKey: "hello",
                title: "Hello",
                width: 150,
                resizable: true,
                align: "center",
              },
              {
                key: "world",
                dataKey: "world",
                title: "World",
                width: 150,
                resizable: true,
                align: "center",
              },
            ]}
            data={[
              { hello: "hello", world: "world" },
              { hello: "hello 2", world: "world 2" },
            ]}
          ></BaseTable>
        )}
      </AutoResizer>
    </Box>
  );
}
