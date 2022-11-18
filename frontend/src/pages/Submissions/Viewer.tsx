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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import CreatableSelect from "react-select/creatable";
import { useEffect, useState } from "react";
import Project from "../../types/project";
import { Submission } from "../../types/submission";
import { API, RestAPI } from "../../api/rest";
import { FiSettings, FiRefreshCw } from "react-icons/all";

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
      if (props.isDraft) {
        RestAPI.getDraft(props.match.params.id).then((response) => {
          setForm({ display: "form", components: [] });
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
          setForm({ display: "form", components: [] });
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

      {predefinedProject === null ? (
        <Form
          onSubmit={(formio: any) => {
            delete formio.data["submit"];
            var submission: Submission = {
              project: project.id ?? "",
              parentId: null,
              viewId: null,
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
