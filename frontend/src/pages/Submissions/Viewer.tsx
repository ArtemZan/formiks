import {
  Box,
  HStack,
  CloseButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  VStack,
  StackDivider,
  Stack,
  Text,
  Tag,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Project from "../../types/project";
import { RestAPI } from "../../api/rest";

import Ermv from "../../components/projects/ermv";
import Elmv from "../../components/projects/elmv";
import Elov from "../../components/projects/elov";
import Por from "../../components/projects/por";
import Cerov from "../../components/projects/cerov";

interface Props {
  history: any;
  create: boolean;
  match: any;
  isAdmin: boolean;
  isDraft?: boolean;
}

export function Viewer(props: Props) {
  const [predefinedProject, setPredefinedProject] = useState<any>(null);
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

  function getProject(id: string) {
    RestAPI.getProject(id).then((response) => {
      setProject(response.data);
    });
  }

  useEffect(() => {
    if (props.match.params.id) {
      if (props.isDraft) {
        RestAPI.getDraft(props.match.params.id).then((response) => {
          getProject(response.data.submission.project);
          if (response.data.submission.project === "629dfb3f55d209262194a3e6") {
            setPredefinedProject(
              <Cerov
                project={project}
                submission={response.data.submission}
                children={response.data.children}
                history={props.history}
                isDraft={true}
              />
            );
          }
          if (response.data.submission.project === "624ac98682eeddf1a9b6a622") {
            setPredefinedProject(
              <Elov
                project={project}
                submission={response.data.submission}
                children={response.data.children}
                history={props.history}
                isDraft={true}
              />
            );
          }
          if (response.data.submission.project === "6246ec8efa2a446faadb8d9b") {
            setPredefinedProject(
              <Elmv
                project={project}
                submission={response.data.submission}
                children={response.data.children}
                history={props.history}
                isDraft={true}
              />
            );
          }
        });
      } else {
        RestAPI.getView(props.match.params.id).then((response) => {
          getProject(response.data.submission.project);
          if (response.data.submission.project === "629dfb3f55d209262194a3e6") {
            setPredefinedProject(
              <Cerov
                project={project}
                submission={response.data.submission}
                children={response.data.children}
                history={props.history}
                isDraft={true}
              />
            );
          }
          if (response.data.submission.project === "619515b754e61c8dd33daa52") {
            setPredefinedProject(
              <Ermv
                project={project}
                submission={response.data.submission}
                children={response.data.children}
                history={props.history}
              />
            );
          }
          if (response.data.submission.project === "6246ec8efa2a446faadb8d9b") {
            setPredefinedProject(
              <Elmv
                project={project}
                submission={response.data.submission}
                children={response.data.children}
                history={props.history}
              />
            );
          }
          if (response.data.submission.project === "624ac98682eeddf1a9b6a622") {
            setPredefinedProject(
              <Elov
                project={project}
                submission={response.data.submission}
                children={response.data.children}
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
    }
  }, []);

  return (
    <Box mx={{ base: 0, xl: "5em" }}>
      <HStack display={{ base: "none", md: "flex" }} mb={10} w="100%">
        <Box w="70%"></Box>
        <Box w="30%">
          <CloseButton
            onClick={() => {
              props.history.goBack();
            }}
            float="right"
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

      <Alert
        display={props.isDraft ? "none" : "block"}
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="180px"
        mb="2em"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          You are viewing existing project!
        </AlertTitle>
        <AlertDescription maxWidth="sm">
          Please note that submitting this form will create a new project
        </AlertDescription>
      </Alert>

      {/* FIXME: replace null with error alert */}
      {predefinedProject !== null ? predefinedProject : null}
    </Box>
  );
}

export default Viewer;
