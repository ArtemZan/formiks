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
import { Submission } from "../../types/submission";

interface Props {
  history: any;
  create: boolean;
  match: any;
  isAdmin: boolean;
  isDraft?: boolean;
}

export function Viewer(props: Props) {
  const [predefinedProject, setPredefinedProject] = useState<any>(null);
  const [warningText, setWarningText] = useState<any>(null);
  const [warningText2, setWarningText2] = useState<any>(null);
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
  const [draft, setDraft] = useState<Submission | undefined>(undefined);

  function getProject(id: string) {
    RestAPI.getProject(id).then((response) => {
      setProject(response.data);
    });
  }

  useEffect(() => {
    if (props.match.params.id) {
      if (props.isDraft) {
        RestAPI.getDraft(props.match.params.id).then((response) => {
          setDraft(response.data.submission);
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
          if (response.data.submission.project === "62610ab73a88d397b05cea12") {
            setPredefinedProject(
              <Por
                project={project}
                submission={response.data.submission}
                children={response.data.children}
                history={props.history}
                isDraft={true}
              />
            );
            setWarningText("You are viewing existing purchase order form!");
            setWarningText2(
              "Please note that submitting this form will create new purchase order."
            );
          }
        });
      } else {
        RestAPI.getView(props.match.params.id).then((response) => {
          var projectId = response.data.submission.project;
          if (projectId === "" && response.data.children.length > 0) {
            projectId = response.data.children[0].project;
          }
          getProject(projectId);
          if (projectId === "629dfb3f55d209262194a3e6") {
            setPredefinedProject(
              <Cerov
                project={project}
                submission={response.data.submission}
                children={response.data.children}
                history={props.history}
                isDraft={true}
              />
            );
            setWarningText("You are viewing existing project!");
            setWarningText2(
              "Please note that submitting this form will create a new project"
            );
          }
          if (projectId === "619515b754e61c8dd33daa52") {
            setPredefinedProject(
              <Ermv
                project={project}
                submission={response.data.submission}
                children={response.data.children}
                history={props.history}
              />
            );
            setWarningText("You are viewing existing project!");
            setWarningText2(
              "Please note that submitting this form will create a new project"
            );
          }
          if (projectId === "6246ec8efa2a446faadb8d9b") {
            setPredefinedProject(
              <Elmv
                project={project}
                submission={response.data.submission}
                children={response.data.children}
                history={props.history}
              />
            );
            setWarningText("You are viewing existing project!");
            setWarningText2(
              "Please note that submitting this form will create a new project"
            );
          }
          if (projectId === "624ac98682eeddf1a9b6a622") {
            setPredefinedProject(
              <Elov
                project={project}
                submission={response.data.submission}
                children={response.data.children}
                history={props.history}
              />
            );
            setWarningText("You are viewing existing project!");
            setWarningText2(
              "Please note that submitting this form will create a new project"
            );
          }
          if (
            projectId === "62610ab73a88d397b05cea12" &&
            response.data.children.length > 0
          ) {
            setPredefinedProject(
              <Por
                project={project}
                submission={response.data.children[0]}
                children={[]}
                history={props.history}
              />
            );
            setWarningText("You are viewing existing purchase order form!");
            setWarningText2(
              "Please note that submitting this form will create new purchase order."
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
          {warningText ?? ""}
        </AlertTitle>
        <AlertDescription maxWidth="sm">{warningText2 ?? ""}</AlertDescription>
      </Alert>

      <Alert
        display={
          draft !== undefined && draft.data["_rejected"] === true
            ? "block"
            : "none"
        }
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        mb="2em"
        paddingBottom={"1em"}
        paddingTop={"2em"}
      >
        <AlertTitle fontSize="lg">Project was rejected</AlertTitle>
        <AlertDescription>
          <div style={{ whiteSpace: "pre-line", marginTop: "1em" }}>
            {draft ? draft.data["_rejectedComment"] : ""}
          </div>
        </AlertDescription>
      </Alert>

      {predefinedProject !== null ? predefinedProject : null}
    </Box>
  );
}

export default Viewer;
