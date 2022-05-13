import { Form } from "@formio/react";
import { renderToString } from "react-dom/server";

import {
  Text,
  Box,
  Button,
  HStack,
  Input,
  Stack,
  Textarea,
  StackDivider,
  VStack,
  CloseButton,
  IconButton,
  useColorModeValue,
  Tag,
} from "@chakra-ui/react";
import CreatableSelect from "react-select/creatable";
import { useEffect, useState } from "react";
import Project from "../../types/project";
import { Submission } from "../../types/submission";
import { API, RestAPI } from "../../api/rest";
import { FiSettings, FiRefreshCw } from "react-icons/all";

import Ermv from "../../components/projects/ermv";
import Erov from "../../components/projects/erov";
import Elmv from "../../components/projects/elmv";
import Elov from "../../components/projects/elov";
import Por from "../../components/projects/por";

interface Props {
  history: any;
  create: boolean;
  match: any;
  isAdmin: boolean;
}

export function Viewer(props: Props) {
  const [predefinedProject, setPredefinedProject] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [project, setProject] = useState<Project>({
    title: "",
    created: new Date(),
    updated: new Date(),
    author: "",
    description: "",
    statuses: [] as string[],
    defaultStatus: "",
    tags: [] as string[],
    roles: [] as string[],
    components: [] as any[],
    type: "formio",
    code: "",
  });
  useEffect(() => {
    if (props.match.params.id) {
      RestAPI.getProject(props.match.params.id).then((response) => {
        setProject(response.data);
        setForm({ display: "form", components: response.data.components });
        if (props.match.params.id === "619515b754e61c8dd33daa52") {
          setPredefinedProject(
            <Ermv project={project} history={props.history} />
          );
        }
        if (props.match.params.id === "6246bc93fa2a446faadb8d9a") {
          setPredefinedProject(
            <Erov project={project} history={props.history} />
          );
        }
        if (props.match.params.id === "6246ec8efa2a446faadb8d9b") {
          setPredefinedProject(
            <Elmv project={project} history={props.history} />
          );
        }
        if (props.match.params.id === "624ac98682eeddf1a9b6a622") {
          setPredefinedProject(
            <Elov
              project={project}
              submission={{}}
              children={[]}
              history={props.history}
            />
          );
        }
        if (props.match.params.id === "62610ab73a88d397b05cea12") {
          setPredefinedProject(
            <Por project={project} history={props.history} />
          );
        }
      });
    }
  }, []);

  return (
    <Box mx={{ base: 0, xl: "5em" }}>
      <HStack display={{ base: "none", md: "flex" }} mb={10} w="100%">
        <Box w="70%"></Box>
        <Box w="30%">
          <CloseButton
            onClick={() => {
              props.history.push("/projects");
            }}
            float="right"
          />
          <IconButton
            display={props.isAdmin ? "grid" : "none"}
            onClick={() => {
              props.history.push(`/projects/edit/${project.id}`);
            }}
            mr={2}
            border="none"
            variant="outline"
            size="sm"
            aria-label="settings"
            float="right"
            icon={<FiSettings />}
          />
        </Box>
      </HStack>
      <Box color={useColorModeValue("gray.800", "#ABB2BF")} w="100%" mb={10}>
        <VStack
          mb={"40px"}
          pr={{ base: 0, md: "10px" }}
          divider={<StackDivider />}
          spacing={4}
          fontSize="md"
          align="stretch"
        >
          <Box>
            <Stack
              direction={{ base: "column", md: "row" }}
              w="100%"
              spacing={{ base: "20px", md: "100px" }}
            >
              <Box w="100%">
                <Text float="left" as="b">
                  Title
                </Text>
                <Text float="right">{project.title}</Text>
              </Box>
              <Box w="100%">
                <Text float="left" as="b">
                  Tags
                </Text>
                <HStack spacing={3} float="right">
                  {project.tags.map((tag) => {
                    return (
                      <Tag
                        key={tag}
                        fontWeight={"400"}
                        colorScheme="cyan"
                        cursor="pointer"
                      >
                        {tag}
                      </Tag>
                    );
                  })}
                </HStack>
              </Box>
            </Stack>
          </Box>
          <Box>
            <Text as="b">Description</Text>
            <Text mt={3}>{project.description}</Text>
          </Box>
        </VStack>
      </Box>
      {predefinedProject === null ? (
        <Form
          // onChange={(event: any) => {
          //   console.log(event);
          // }}
          onSubmit={(formio: any) => {
            delete formio.data["submit"];
            var submission: Submission = {
              project: project.id ?? "",
              parentId: null,
              group: null,
              created: new Date(),
              updated: new Date(),
              title: "",
              author: "",
              status: project.defaultStatus,
              data: formio.data,
            };
            RestAPI.createSubmission(submission).then((response) => {
              props.history.push(`/submissions/view/${response.data.id}`);
            });
          }}
          form={form}
        />
      ) : (
        predefinedProject
      )}
    </Box>
  );
}

export default Viewer;
