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
} from "@chakra-ui/react";
import CreatableSelect from "react-select/creatable";
import { RestAPI } from "../api/rest";
import { DefaultSelectStyles } from "../utils/Styles";

interface Props {
  isOpen: boolean;
  onClose: any;
  addComment: any;
}

export default function CreateModal(props: Props) {
  const [comment, setComment] = useState("");

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={() => {
        props.onClose();
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add reason for rejection</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Box w="100%">
              <Text mb="8px">Title</Text>
              <Input
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
          <Button onClick={() => {}}>Create</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
