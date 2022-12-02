/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import {
  useColorModeValue,
  Input,
  Box,
  VStack,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Textarea,
} from "@chakra-ui/react";
import CreatableSelect from "react-select/creatable";
import { RestAPI } from "../api/rest";
import { DefaultSelectStyles } from "../utils/Styles";
import { Submission } from "../types/submission";

interface Props {
  submission: Submission | undefined;
  onClose: any;
  onReject: any;
}

export default function RejectModal(props: Props) {
  const [comment, setComment] = useState("");

  return (
    <Modal
      isOpen={props.submission !== undefined}
      onClose={() => {
        props.onClose();
      }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Specify rejection reason</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Box w="100%">
              <Text mb="8px">Comment</Text>
              <Textarea
                rows={4}
                value={comment}
                onChange={(event) => {
                  setComment(event.target.value);
                }}
                bg={useColorModeValue("white", "#2C313C")}
                color={useColorModeValue("gray.800", "#ABB2BF")}
              />
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme={"red"}
            onClick={() => {
              props.onReject(comment);
              setComment("");
            }}
          >
            Reject
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
