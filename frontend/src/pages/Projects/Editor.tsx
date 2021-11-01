import { FormBuilder } from "@formio/react";
import {
  Text,
  Box,
  Button,
  HStack,
  Input,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import CreatableSelect from "react-select/creatable";
import { useState } from "react";

interface Props {
  history: any;
  create: boolean;
}

export function Editor(props: Props) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: [] as string[],
    roles: [] as string[],
    components: [] as any[],
  });
  // const [title, setTitle] = useState("");
  // const [description, setDescription] = useState("");
  // const [tags, setTags] = useState([]);
  // const [roles, setRoles] = useState([]);
  // const [components, setComponents] = useState([]);

  return (
    <Box mx={{ base: 0, xl: "5em" }}>
      <Box color={"gray.600"} mb={10}>
        <Stack spacing={4} mb={4} direction={{ base: "column", xl: "row" }}>
          <Box w="100%">
            <Text mb="8px">Title</Text>
            <Input
              value={form.title}
              onChange={(event) => {
                setForm((prev) => ({
                  ...prev,
                  title: event.target.value,
                }));
              }}
              bg="white"
            />
          </Box>
          <Box w="100%">
            <Text mb="8px">Tags</Text>
            <CreatableSelect
              placeholder=""
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: 40,
                  border: "1px solid #E2E8F0",
                  transition: "0.3s",
                  "&:hover": {
                    border: "1px solid #CBD5E0",
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
              value={form.tags.map((tag) => {
                return { label: tag, value: tag };
              })}
              onChange={(values) => {
                var tags: string[] = [];
                values.map((element: any) => tags.push(element.value));
                setForm((prev) => ({
                  ...prev,
                  tags,
                }));
              }}
              options={[]}
            />
          </Box>
          <Box w="100%">
            <Text mb="8px">Roles</Text>
            <CreatableSelect
              placeholder=""
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: 40,
                  border: "1px solid #E2E8F0",
                  transition: "0.3s",
                  "&:hover": {
                    border: "1px solid #CBD5E0",
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
              value={form.roles.map((role) => {
                return { label: role, value: role };
              })}
              onChange={(values) => {
                var roles: string[] = [];
                values.map((element: any) => roles.push(element.value));
                setForm((prev) => ({
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
            bg="white"
            rows={5}
            value={form.description}
            onChange={(event) => {
              setForm((prev) => ({
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
        form={{ display: "form" }}
        onChange={(schema: any) => console.log(schema)}
      />
      <HStack float="right">
        <Button
          variant="outline"
          colorScheme="twitter"
          onClick={() => {
            props.history.goBack();
          }}
        >
          Cancel
        </Button>
        <Button
          color={"white"}
          bg={"blue.400"}
          onClick={() => {
            props.history.push("/login");
          }}
          _hover={{
            bg: "blue.300",
          }}
        >
          {props.create ? "Create" : "Save"}
        </Button>
      </HStack>
    </Box>
  );
}

export default Editor;
