/* eslint-disable react-hooks/rules-of-hooks */
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Center,
} from "@chakra-ui/react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { useEffect, useState } from "react";
import Project from "../../types/project";
import { API, RestAPI } from "../../api/rest";
import { FiTrash2, VscDebugStart } from "react-icons/all";
import { toast } from "react-toastify";
import Toast from "../../components/Toast";

import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/snippets/javascript";
import "ace-builds/src-noconflict/theme-tomorrow";
import "ace-builds/src-min-noconflict/ext-searchbox";
import "ace-builds/src-min-noconflict/ext-language_tools";
import Dropdown from "../../types/dropdown";

interface Props {
  history: any;
  create: boolean;
  match: any;
}

export function Editor(props: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debug, setDebug] = useState("");
  const [rawValues, setRawValues] = useState("");
  const [dropdown, setDropdown] = useState<Dropdown>({
    title: "",
    created: new Date(),
    description: "",
    type: "js",
    url: "",
    processor: "",
    values: [] as any[],
    syncInterval: 60,
    lastSync: new Date(),
    private: false,
  });
  useEffect(() => {
    if (!props.create && props.match.params.id) {
      RestAPI.getDropdown(props.match.params.id).then((response) => {
        setDropdown(response.data);
        setRawValues(JSON.stringify(response.data.values, null, 2));
      });
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
              value={dropdown.title}
              onChange={(event) => {
                setDropdown((prev) => ({
                  ...prev,
                  title: event.target.value,
                }));
              }}
              bg={useColorModeValue("white", "#2C313C")}
              color={useColorModeValue("gray.800", "#ABB2BF")}
            />
          </Box>
          <Box w="100%">
            <Text mb="8px">Type</Text>
            <Select
              styles={{
                menu: (provided) => ({
                  ...provided,
                  zIndex: 1000000,
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: "#718196",
                }),
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
              placeholder=""
              onChange={(value: any) => {
                setDropdown((prev) => ({
                  ...prev,
                  type: value.value,
                }));
              }}
              value={{ label: dropdown.type, value: dropdown.type }}
              classNamePrefix="select"
              isClearable={false}
              name="dropdownType"
              options={[
                { label: "js", value: "js" },
                { label: "json", value: "json" },
              ]}
            />
          </Box>
          <Box w="100%">
            <Text mb="8px">Sync Interval (minutes)</Text>
            <NumberInput
              value={dropdown.syncInterval}
              onChange={(_, value) => {
                setDropdown((prev) => ({
                  ...prev,
                  syncInterval: value,
                }));
              }}
              min={5}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
        </Stack>
        <Box w="100%">
          <Text mb="8px">Description</Text>
          <Textarea
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
            rows={5}
            value={dropdown.description}
            onChange={(event) => {
              setDropdown((prev) => ({
                ...prev,
                description: event.target.value,
              }));
            }}
          ></Textarea>
        </Box>
      </Box>
      <Box mb={5} display={dropdown.type === "json" ? "flex" : "none"} w="100%">
        <AceEditor
          width="100%"
          height="900px"
          style={{
            borderRadius: "5px",
          }}
          mode="json"
          theme="tomorrow"
          name="json-editor"
          onChange={(value) => {
            setRawValues(value);
          }}
          fontSize={14}
          showPrintMargin={false}
          showGutter={true}
          highlightActiveLine={true}
          value={rawValues}
          setOptions={{
            enableBasicAutocompletion: true,
            enableLiveAutocompletion: true,
            showLineNumbers: true,
            tabSize: 2,
          }}
        />
      </Box>
      <Stack
        display={dropdown.type === "js" ? "flex" : "none"}
        spacing={4}
        mb={4}
        direction={{ base: "column", xl: "row" }}
      >
        <Box w="100%">
          <AceEditor
            width="100%"
            height="900px"
            style={{
              borderRadius: "5px",
            }}
            mode="javascript"
            theme="tomorrow"
            name="js-editor"
            onChange={(value) => {
              setDropdown((prev) => ({
                ...prev,
                processor: value,
              }));
            }}
            fontSize={14}
            showPrintMargin={false}
            showGutter={true}
            highlightActiveLine={true}
            value={dropdown.processor}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
            }}
          />
        </Box>
        <Box w="100%">
          <AceEditor
            width="100%"
            height="900px"
            style={{
              borderRadius: "5px",
            }}
            mode="json"
            theme="tomorrow"
            name="console"
            fontSize={12}
            showPrintMargin={false}
            showGutter={false}
            highlightActiveLine={false}
            value={debug}
            readOnly={true}
            setOptions={{
              tabSize: 2,
            }}
          />
        </Box>
      </Stack>
      <Center
        display={dropdown.type === "js" ? "flex" : "none"}
        mt={"10px"}
        mb="60px"
        h="60px"
        w="100%"
      >
        <IconButton
          color={"white"}
          bg={useColorModeValue("blue.400", "#4D97E2")}
          _hover={{
            bg: useColorModeValue("blue.300", "#377bbf"),
          }}
          aria-label="Debug"
          icon={<VscDebugStart />}
          onClick={async () => {
            setDebug("");
            var result = eval(dropdown.processor);
            if (typeof result === "object") {
              setDebug(JSON.stringify(result, null, 4));
            } else {
              setDebug(String(result));
            }
          }}
        />
      </Center>

      <HStack mb={"40px"} spacing={4} float="right">
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
          isLoading={isSubmitting}
          onClick={async () => {
            if (dropdown.type === "json") {
              dropdown.values = JSON.parse(rawValues);
            }
            setIsSubmitting(true);
            if (props.create) {
              var response = await RestAPI.createDropdown(dropdown);
              if (response.data.id) {
                props.history.push(`/dropdowns/edit/${response.data.id}`);
              }
            } else {
              console.log(dropdown);
              await RestAPI.updateDropdown(dropdown)
                .then(() => {
                  toast(
                    <Toast
                      title={"Success"}
                      message={
                        <div>Dropdown has been successfully updated</div>
                      }
                      type={"success"}
                    />
                  );
                })
                .catch(() => {
                  toast(
                    <Toast
                      title={"Error"}
                      message={
                        <div>
                          Failed to update dropdown
                          <br />
                          Try again after few seconds
                        </div>
                      }
                      type={"error"}
                    />
                  );
                });
              setIsSubmitting(false);
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
