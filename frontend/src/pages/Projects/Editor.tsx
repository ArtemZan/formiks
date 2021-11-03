/* eslint-disable react-hooks/rules-of-hooks */
import { FormBuilder } from "@formio/react";
import {
  Text,
  Box,
  Button,
  HStack,
  Input,
  Stack,
  Textarea,
  CloseButton,
  IconButton,
  useColorModeValue,
} from "@chakra-ui/react";
import CreatableSelect from "react-select/creatable";
import { useEffect, useState } from "react";
import Project from "../../types/project";
import { API, RestAPI } from "../../api/rest";
import { FiTrash2 } from "react-icons/all";

interface Props {
  history: any;
  create: boolean;
  match: any;
}

export function Editor(props: Props) {
  const [project, setProject] = useState<Project>({
    title: "",
    created: new Date(),
    updated: new Date(),
    author: "",
    description: "",
    tags: [] as string[],
    roles: [] as string[],
    components: [] as any[],
  });
  useEffect(() => {
    if (!props.create && props.match.params.id) {
      RestAPI.getProject(props.match.params.id).then((response) =>
        setProject(response.data)
      );
    }
  }, []);

  return (
    <Box mx={{ base: 0, xl: "5em" }}>
      <HStack mb={5} w="100%">
        <Box w="70%"></Box>

        <Box w="30%">
          <CloseButton
            onClick={() => {
              props.history.goBack();
            }}
            float="right"
          />
          <IconButton
            display={!props.create ? "grid" : "none"}
            onClick={() => {
              // FIXME: delete project
            }}
            mr={2}
            border="none"
            variant="outline"
            size="sm"
            aria-label="settings"
            float="right"
            color={"#ed636e"}
            icon={<FiTrash2 />}
          />
        </Box>
      </HStack>
      <Box color={useColorModeValue("gray.600", "#ABB2BF")} mb={10}>
        <Stack spacing={4} mb={4} direction={{ base: "column", xl: "row" }}>
          <Box w="100%">
            <Text mb="8px">Title</Text>
            <Input
              value={project.title}
              onChange={(event) => {
                setProject((prev) => ({
                  ...prev,
                  title: event.target.value,
                }));
              }}
              bg={useColorModeValue("white", "#2C313C")}
              color={useColorModeValue("gray.800", "#ABB2BF")}
            />
          </Box>
          <Box w="100%">
            <Text mb="8px">Tags</Text>
            <CreatableSelect
              placeholder=""
              styles={{
                control: (base, state) => ({
                  ...base,
                  background: useColorModeValue("white", "#2C313C"),
                  minHeight: 40,
                  border: useColorModeValue(
                    "1px solid #E2E8F0",
                    "1px solid #4E525C"
                  ),
                  transition: "0.3s",
                  "&:hover": {
                    border: useColorModeValue(
                      "1px solid #CBD5E0",
                      "1px solid #5E626B"
                    ),
                  },
                }),
                option: (
                  styles,
                  { data, isDisabled, isFocused, isSelected }
                ) => {
                  return {
                    ...styles,
                    backgroundColor: useColorModeValue("white", "#2C313C"),
                    color: useColorModeValue("#4A5667", "white"),
                    transition: "0.3s",
                    "&:hover": {
                      backgroundColor: useColorModeValue("#DEEBFF", "#343945"),
                    },
                  };
                },
                menu: (styles) => ({
                  ...styles,
                  color: useColorModeValue("#4A5667", "white"),
                  background: useColorModeValue("white", "#2C313C"),
                }),
                multiValue: (styles, { data }) => ({
                  ...styles,
                  color: "white",
                  background: useColorModeValue("#E6E6E6", "#464A51"),
                }),
                multiValueLabel: (styles, { data }) => ({
                  ...styles,
                  color: useColorModeValue("#464646", "white"),
                  background: useColorModeValue("#E6E6E6", "#464A51"),
                }),
                multiValueRemove: (styles, { data }) => ({
                  ...styles,
                  color: useColorModeValue("#4A5667", "white"),
                  background: useColorModeValue("#E6E6E6", "#464A51"),
                  "&:hover": {
                    color: useColorModeValue("#DE360C", "#ed636e"),
                    backgroundColor: useColorModeValue("#FFBDAD", "#4f5259"),
                  },
                }),
              }}
              theme={(theme) => ({
                ...theme,
                borderRadius: 6,
                colors: {
                  ...theme.colors,
                  primary: "#3082CE",
                },
              })}
              isMulti
              value={project.tags.map((tag) => {
                return { label: tag, value: tag };
              })}
              onChange={(values) => {
                var tags: string[] = [];
                values.map((element: any) => tags.push(element.value));
                setProject((prev) => ({
                  ...prev,
                  tags,
                }));
              }}
              options={[
                { label: "test", value: "test" },
                { label: "test2", value: "test2" },
              ]}
            />
          </Box>
          <Box w="100%">
            <Text mb="8px">Roles</Text>
            <CreatableSelect
              placeholder=""
              styles={{
                control: (base, state) => ({
                  ...base,
                  background: useColorModeValue("white", "#2C313C"),
                  minHeight: 40,
                  border: useColorModeValue(
                    "1px solid #E2E8F0",
                    "1px solid #4E525C"
                  ),
                  transition: "0.3s",
                  "&:hover": {
                    border: useColorModeValue(
                      "1px solid #CBD5E0",
                      "1px solid #5E626B"
                    ),
                  },
                }),
                option: (
                  styles,
                  { data, isDisabled, isFocused, isSelected }
                ) => {
                  return {
                    ...styles,
                    backgroundColor: useColorModeValue("white", "#2C313C"),
                    color: useColorModeValue("#4A5667", "white"),
                    transition: "0.3s",
                    "&:hover": {
                      backgroundColor: useColorModeValue("#DEEBFF", "#343945"),
                    },
                  };
                },
                menu: (styles) => ({
                  ...styles,
                  color: useColorModeValue("#4A5667", "white"),
                  background: useColorModeValue("white", "#2C313C"),
                }),
                multiValue: (styles, { data }) => ({
                  ...styles,
                  color: "white",
                  background: useColorModeValue("#E6E6E6", "#464A51"),
                }),
                multiValueLabel: (styles, { data }) => ({
                  ...styles,
                  color: useColorModeValue("#464646", "white"),
                  background: useColorModeValue("#E6E6E6", "#464A51"),
                }),
                multiValueRemove: (styles, { data }) => ({
                  ...styles,
                  color: useColorModeValue("#4A5667", "white"),
                  background: useColorModeValue("#E6E6E6", "#464A51"),
                  "&:hover": {
                    color: useColorModeValue("#DE360C", "#ed636e"),
                    backgroundColor: useColorModeValue("#FFBDAD", "#4f5259"),
                  },
                }),
              }}
              theme={(theme) => ({
                ...theme,
                borderRadius: 6,
                colors: {
                  ...theme.colors,
                  primary: "#3082CE",
                },
              })}
              isMulti
              value={project.roles.map((role) => {
                return { label: role, value: role };
              })}
              onChange={(values) => {
                var roles: string[] = [];
                values.map((element: any) => roles.push(element.value));
                setProject((prev) => ({
                  ...prev,
                  roles,
                }));
              }}
              options={[
                { label: "administrator", value: "administrator" },
                { label: "user", value: "user" },
                { label: "guest", value: "guest" },
              ]}
            />
          </Box>
        </Stack>
        <Box w="100%">
          <Text mb="8px">Description</Text>
          <Textarea
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
            rows={5}
            value={project.description}
            onChange={(event) => {
              setProject((prev) => ({
                ...prev,
                description: event.target.value,
              }));
            }}
          ></Textarea>
        </Box>
      </Box>
      <FormBuilder
        options={{
          builder: {
            basic: {
              components: {
                excelTable: true,
              },
            },
            advanced: {
              components: {
                file: true,
              },
            },
            premium: false,
          },
        }}
        form={{ display: "form", components: project.components }}
        onChange={(schema: any) => {
          console.log(schema);
          setProject((prev) => ({
            ...prev,
            components: schema.components,
          }));
        }}
      />
      <HStack spacing={4} float="right">
        <Button
          variant="outline"
          color={useColorModeValue("blue.400", "#4D97E2")}
          borderColor={useColorModeValue("blue.400", "#4D97E2")}
          onClick={() => {
            props.history.goBack();
          }}
        >
          Cancel
        </Button>
        <Button
          color={"white"}
          bg={useColorModeValue("blue.400", "#4D97E2")}
          _hover={{
            bg: useColorModeValue("blue.300", "#377bbf"),
          }}
          onClick={async () => {
            if (props.create) {
              var response = await RestAPI.createProject(project);
              if (response.data.id) {
                props.history.push(`/projects/edit/${response.data.id}`);
              }
            } else {
              await RestAPI.updateProject(project);
              // TODO: show notification
            }
          }}
        >
          {props.create ? "Create" : "Save"}
        </Button>
      </HStack>
    </Box>
  );
}

export default Editor;
