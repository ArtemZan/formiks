/* eslint-disable react-hooks/rules-of-hooks */
import React from "react";
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
import Project from "../types/project";
import { RestAPI } from "../api/rest";
import Bookmark from "../types/bookmark";
import { DefaultSelectStyles } from "../utils/Color";

interface Props {
  isOpen: boolean;
  onClose: any;
  addBookmark: any;
  projects: Project[];
  bookmarks: Bookmark[];
}

export default function CreateBookmark(props: Props) {
  const [matchingProjects, setMatchingProjects] = useState(0);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  useEffect(() => {
    var tags: string[] = [];
    props.projects.map((project) => {
      project.tags.map((tag) => {
        if (tags.indexOf(tag) === -1) {
          tags.push(tag);
        }
      });
      setAvailableTags(tags);
    });
  }, [props.projects]);
  useEffect(() => {
    var matchingProjects = 0;
    props.projects.map((project) => {
      if (
        project.tags &&
        project.tags.some((item) => selectedTags.includes(item))
      ) {
        matchingProjects++;
      }
    });
    setMatchingProjects(matchingProjects);
  }, [selectedTags]);
  return (
    <Modal
      isOpen={props.isOpen}
      onClose={() => {
        props.onClose();
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create new bookmark</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Box w="100%">
              <Text mb="8px">Title</Text>
              <Input
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                }}
                bg={useColorModeValue("white", "#2C313C")}
                color={useColorModeValue("gray.800", "#ABB2BF")}
              />
            </Box>
            <Box w="100%">
              <Text mb="8px">Tags</Text>
              <CreatableSelect
                placeholder=""
                styles={DefaultSelectStyles(useColorModeValue)}
                theme={(theme) => ({
                  ...theme,
                  borderRadius: 6,
                  colors: {
                    ...theme.colors,
                    primary: "#3082CE",
                  },
                })}
                isMulti
                value={selectedTags.map((tag) => {
                  return { label: tag, value: tag };
                })}
                onChange={(values) => {
                  var tags: string[] = [];
                  values.map((element: any) => tags.push(element.value));
                  setSelectedTags(tags);
                }}
                options={availableTags.map((tag) => {
                  return {
                    label: tag,
                    value: tag,
                  };
                })}
              />
            </Box>
            <Box w="100%">
              <Text float="right" color="gray.400" mb="10px">
                Matching {matchingProjects} projects
              </Text>
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            isDisabled={
              title.length < 1 ||
              (props.bookmarks &&
                props.bookmarks.some((bookmark) => bookmark.title === title))
            }
            color={"white"}
            bg={useColorModeValue("blue.400", "#4D97E2")}
            _hover={{
              bg: useColorModeValue("blue.300", "#377bbf"),
            }}
            onClick={() => {
              RestAPI.createBookmark({
                title,
                tags: selectedTags,
              } as Bookmark).then((response) => {
                props.addBookmark(response.data);
                props.onClose();
              });
            }}
          >
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
