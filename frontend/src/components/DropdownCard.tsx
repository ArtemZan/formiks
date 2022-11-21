import {
  Box,
  Text,
  Stack,
  Heading,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import moment from "moment";
import Dropdown from "../types/dropdown";

interface Props {
  history: any;
  dropdown: Dropdown;
}

export default function DropdownCard(props: Props) {
  return (
    <Box
      key={props.dropdown.id}
      onClick={() => {
        props.history.push(`/dropdowns/edit/${props.dropdown.id}`);
      }}
      cursor={"pointer"}
      _hover={{ boxShadow: "2xl" }}
      w={"350px"}
      h={"360px"}
      bg={useColorModeValue("white", "#21252A")}
      boxShadow={"xl"}
      rounded={"md"}
      p={10}
      transition={"box-shadow 0.3s ease-in-out"}
      overflow={"hidden"}
    >
      <Stack spacing={8}>
        <Tooltip
          bg={useColorModeValue("white", "#373c45")}
          color={useColorModeValue("gray.600", "#c0c6d1")}
          p={4}
          hasArrow
          label={props.dropdown.title}
        >
          <Heading
            h={"28px"}
            color={useColorModeValue("gray.700", "#c0c6d1")}
            fontSize={"2xl"}
            fontFamily={"body"}
            whiteSpace="nowrap"
            textOverflow="ellipsis"
            overflow="hidden"
          >
            {props.dropdown.title}
          </Heading>
        </Tooltip>
        <Tooltip
          bg={useColorModeValue("white", "#373c45")}
          color={useColorModeValue("gray.600", "#c0c6d1")}
          p={4}
          hasArrow
          label={props.dropdown.description}
        >
          <Text overflow="hidden" h="145px" color={"gray.500"}>
            {props.dropdown.description}
          </Text>
        </Tooltip>
      </Stack>

      <Stack
        mt={"45px"}
        direction={"column"}
        textAlign="end"
        spacing={0}
        fontSize={"sm"}
        fontWeight={500}
        color={"gray.500"}
      >
        <Text>
          Total Records:{" "}
          {props.dropdown.values !== null ? props.dropdown.values.length : 0}
        </Text>
        <Tooltip
          bg={useColorModeValue("white", "#373c45")}
          color={useColorModeValue("gray.600", "#c0c6d1")}
          p={4}
          hasArrow
          label={moment(props.dropdown.created).format("DD.MM.YYYY HH:mm")}
        >
          <Text>
            Last Sync:{" "}
            {props.dropdown.type === "json"
              ? "manual"
              : moment(props.dropdown.lastSync).fromNow()}
          </Text>
        </Tooltip>
      </Stack>
    </Box>
  );
}
