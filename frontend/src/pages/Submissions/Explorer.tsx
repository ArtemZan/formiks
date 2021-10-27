import { InteractionRequiredAuthError } from "@azure/msal-browser";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import {
  Box,
  Text,
  GridItem,
  Stack,
  VStack,
  HStack,
  Input,
  IconButton,
  CloseButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { DateRangeInput, DateSingleInput } from "../../components/DatePicker";
import { TagPicker } from "rsuite";
import { Table, RangeSlider } from "rsuite";
import { msalInstance } from "../../index";
import { AiOutlineDelete, BiPlusMedical } from "react-icons/all";
import { useState } from "react";
import { ArrowForwardIcon } from "@chakra-ui/icons";

const { Column, HeaderCell, Cell } = Table;

interface Props {
  history: any;
}

interface FilterField {
  column: string;
  type: string;
  filter: string;
  values: any[];
}

const data = [];
const fields = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

export function Explorer(props: Props) {
  const [filters, setFilters] = useState<FilterField[]>([]);

  return (
    <>
      <AuthenticatedTemplate>
        <Box mb="3em" float="right" w={{ base: "100%", md: "400px" }}>
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
            value={{}}
            onChange={(value) => {}}
            classNamePrefix="select"
            isClearable={false}
            name="color"
            options={[]}
          />
        </Box>

        <VStack mb={"2em"} w="100%" spacing={"2em"}>
          <Box w="100%" boxShadow={"md"} rounded={"md"} bg="white" p="2em">
            <Stack
              mb={"1em"}
              w="100%"
              spacing={{ base: "2em", xl: "4em" }}
              direction={{ base: "column", lg: "row" }}
              color={"gray.500"}
            >
              <Box w="100%">
                <Text mb="8px">Displayed Fields</Text>
                <TagPicker
                  cleanable
                  style={{
                    minHeight: "40px",
                    paddingTop: "2px",
                  }}
                  data={fields.map((value) => {
                    return { label: value, value };
                  })}
                  block
                />
              </Box>
              <Box w="100%">
                <Text mb="8px">Date Range</Text>
                <DateRangeInput
                  allowEditableInputs={true}
                  displayFormat="dd.MM.yyyy"
                  maxBookingDate={new Date()}
                />
              </Box>
            </Stack>
            <Stack
              w="100%"
              spacing={{ base: "2em", xl: "4em" }}
              direction={{ base: "column", lg: "row" }}
              color={"gray.500"}
            >
              <Box w="100%">
                <Text mb="8px">Statuses</Text>
                <TagPicker
                  cleanable
                  style={{
                    minHeight: "40px",
                    paddingTop: "2px",
                  }}
                  data={fields.map((value) => {
                    return { label: value, value };
                  })}
                  block
                />
              </Box>
              <Box w="100%">
                <Text mb="8px">Authors</Text>
                <TagPicker
                  cleanable
                  style={{
                    minHeight: "40px",
                    paddingTop: "2px",
                  }}
                  data={fields.map((value) => {
                    return { label: value, value };
                  })}
                  block
                />
              </Box>
            </Stack>
          </Box>

          <Box
            shadow="md"
            color="gray.600"
            backgroundColor="white"
            mb={10}
            p={8}
            pb={0}
            rounded="md"
            w={"100%"}
          >
            <VStack
              spacing={8}
              fontSize="md"
              align="stretch"
              color={"gray.500"}
            >
              <Box w={"100%"}>
                <Box w={"100%"}>
                  {filters.map((filter, index) => {
                    return (
                      <Box
                        w={"100%"}
                        backgroundColor="white"
                        p={4}
                        mb={5}
                        border="1px"
                        rounded="md"
                        borderColor="gray.100"
                      >
                        <CloseButton
                          onClick={() => {
                            var temp = [...filters];
                            temp.splice(index, 1);
                            setFilters(temp);
                          }}
                          float="right"
                        />
                        <VStack
                          mt={"20px"}
                          spacing={8}
                          fontSize="md"
                          align="stretch"
                          color={"gray.500"}
                        >
                          <Box>
                            <Stack
                              direction={{ base: "column", xl: "row" }}
                              w="100%"
                              spacing={{ base: "20px", xl: "50px" }}
                            >
                              <Box w="100%">
                                <Text mb="8px">Column</Text>
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
                                  value={{
                                    label: filter.column,
                                    value: filter.column,
                                  }}
                                  onChange={(value: any) => {
                                    var temp = [...filters];
                                    temp[index].column = value.value;
                                    temp[index].type = value.type;
                                    setFilters(temp);
                                  }}
                                  classNamePrefix="select"
                                  isClearable={false}
                                  name="color"
                                  options={fields.map((field) => {
                                    return {
                                      label: field,
                                      value: field,
                                      type: field,
                                    };
                                  })}
                                />
                              </Box>
                              <Box w="100%">
                                <Text mb="8px">Type</Text>
                                <Input
                                  onChange={() => {}}
                                  value={filter.type}
                                  readOnly
                                />
                              </Box>
                              <Box w="100%">
                                <Text mb="8px">Filter</Text>
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
                                  value={{
                                    label:
                                      filter.filter.charAt(0).toUpperCase() +
                                      filter.filter.slice(1),
                                    value: filter.filter,
                                  }}
                                  onChange={(value: any) => {
                                    var temp = [...filters];
                                    temp[index].filter = value.value;
                                    setFilters(temp);
                                  }}
                                  classNamePrefix="select"
                                  isClearable={false}
                                  name="filter"
                                  options={
                                    filter.type === "number"
                                      ? [
                                          { label: "Exact", value: "exact" },
                                          {
                                            label: "Includes",
                                            value: "includes",
                                          },
                                          { label: "Range", value: "range" },
                                        ]
                                      : [
                                          { label: "Exact", value: "exact" },
                                          {
                                            label: "Includes",
                                            value: "includes",
                                          },
                                        ]
                                  }
                                />
                              </Box>
                            </Stack>
                          </Box>
                          <Stack
                            direction={{ base: "column", xl: "row" }}
                            w="100%"
                            spacing={{ base: "20px", xl: "50px" }}
                          >
                            <Box w="100%">
                              <Text mb="8px">
                                {filter.filter === "range" ? "Range" : "Values"}
                              </Text>
                              {filter.filter === "range" ? (
                                <Stack
                                  direction={{ base: "column", md: "row" }}
                                >
                                  <NumberInput w="100%">
                                    <NumberInputField />
                                    <NumberInputStepper>
                                      <NumberIncrementStepper />
                                      <NumberDecrementStepper />
                                    </NumberInputStepper>
                                  </NumberInput>
                                  <Box textAlign="center" w="20px">
                                    <ArrowForwardIcon
                                      alignSelf="center"
                                      w={5}
                                      h="100%"
                                    />
                                  </Box>
                                  <NumberInput w="100%">
                                    <NumberInputField />
                                    <NumberInputStepper>
                                      <NumberIncrementStepper />
                                      <NumberDecrementStepper />
                                    </NumberInputStepper>
                                  </NumberInput>
                                </Stack>
                              ) : (
                                <TagPicker
                                  cleanable
                                  style={{
                                    minHeight: "40px",
                                    paddingTop: "2px",
                                  }}
                                  data={fields.map((value) => {
                                    return { label: value, value };
                                  })}
                                  block
                                />
                              )}
                            </Box>
                          </Stack>
                        </VStack>
                      </Box>
                    );
                  })}
                  <IconButton
                    onClick={() => {
                      setFilters([
                        ...filters,
                        {
                          column: "",
                          type: "",
                          filter: "exact",
                          values: [],
                        } as FilterField,
                      ]);
                    }}
                    my={5}
                    float="right"
                    variant="outline"
                    aria-label="add-port"
                    icon={<BiPlusMedical />}
                  />
                </Box>
              </Box>
            </VStack>
          </Box>

          <Box
            color={"gray.500"}
            w="100%"
            boxShadow={"md"}
            rounded={"md"}
            bg="white"
            p="2em"
          >
            <Text color="gray.700" fontWeight={400} fontSize="sm">
              <b>0 of 416</b> items
            </Text>
          </Box>
        </VStack>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Box boxShadow="md" bg="white" p="2em" h="80vh"></Box>
      </UnauthenticatedTemplate>
    </>
  );
}

export default Explorer;
