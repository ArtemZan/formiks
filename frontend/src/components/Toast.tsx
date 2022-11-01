import { Box, chakra, Flex, Icon, useColorModeValue } from "@chakra-ui/react";
import React from "react";
import {
  AiFillInfoCircle,
  BsLightningFill,
  IoMdCheckmarkCircle,
  MdError,
} from "react-icons/all";

export declare type ToastType = "info" | "success" | "warning" | "error";

interface Props {
  title: string;
  message: any;
  type: ToastType;
}

const Toast: React.FunctionComponent<Props> = (props) => {
  return (
    <Flex
      w="350px"
      bg={useColorModeValue("white", "gray.800")}
      shadow="md"
      rounded="lg"
      overflow="hidden"
    >
      <Flex
        justifyContent="center"
        alignItems="center"
        w={12}
        bg={
          props.type === "success"
            ? "green.500"
            : props.type === "error"
            ? "red.500"
            : props.type === "warning"
            ? "yellow.500"
            : "blue.500"
        }
      >
        <Icon
          as={
            props.type === "success"
              ? IoMdCheckmarkCircle
              : props.type === "error"
              ? BsLightningFill
              : props.type === "warning"
              ? MdError
              : AiFillInfoCircle
          }
          color="white"
          boxSize={6}
        />
      </Flex>

      <Box mx={-3} py={2} px={4}>
        <Box mx={3}>
          <chakra.span
            color={
              props.type === "success"
                ? "green.500"
                : props.type === "error"
                ? "red.500"
                : props.type === "warning"
                ? "yellow.500"
                : "blue.500"
            }
            fontWeight="bold"
            fontSize="md"
          >
            {props.title}
          </chakra.span>
          <chakra.div color={"gray.600"} fontSize="sm">
            {props.message}
          </chakra.div>
        </Box>
      </Box>
    </Flex>
  );
};

export default Toast;
