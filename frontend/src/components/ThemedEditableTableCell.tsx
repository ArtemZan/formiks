import { useColorModeValue } from "@chakra-ui/react";
import EditableTableCell from "./EditableTableCell";

const ThemedEditableTableCell = (props: any) => {
  const backgroundColor = useColorModeValue("#f4fcf9", "#5b5b5b");

  return <EditableTableCell {...props} backgroundColor={backgroundColor} />;
};

export default ThemedEditableTableCell;
