import { InteractionRequiredAuthError } from "@azure/msal-browser";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import moment from "moment";
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
  Tag,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { DateRangeInput, DateSingleInput } from "../../components/DatePicker";
import { TagPicker } from "rsuite";
import { Table, RangeSlider } from "rsuite";
import { msalInstance } from "../../index";
import { AiOutlineDelete, BiPlusMedical } from "react-icons/all";
import { useEffect, useState } from "react";
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
  selectedValues: any[];
}

const fields = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

const statuses = ["New", "In Progress", "Completed", "On Hold", "Canceled"];

const columns = [
  {
    name: "Text Field",
    type: "text",
    values: ["hello"],
  },
  {
    name: "Dropdown Field",
    type: "dropdown",
    values: ["hello", "world", "!"],
  },
  {
    name: "Number Field",
    type: "number",
    values: [1],
  },
  {
    name: "First Field",
    type: "text",
    values: [
      "hello-1",
      "hello-2",
      "hello-3",
      "hello-4",
      "hello-5",
      "hello-6",
      "hello-7",
      "hello-8",
      "hello-9",
      "hello-10",
      "hello-11",
      "hello-12",
      "hello-13",
      "hello-14",
      "hello-15",
      "hello-16",
      "hello-17",
      "hello-18",
      "hello-19",
      "hello-20",
    ],
  },
  {
    name: "Second Field",
    type: "text",
    values: ["world"],
  },
  {
    name: "Third Field",
    type: "number",
    values: [
      124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138,
      139, 140, 141, 142, 143,
    ],
  },
  {
    name: "Fourth Field",
    type: "dropdown",
    values: [1, 2, 3],
  },
  {
    name: "Fifth Field",
    type: "number",
    values: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
  },
];
var submissions: any[] = [];
for (var i = 1; i < 21; i++) {
  submissions.push({
    title: "Test Form #" + i,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    data: {
      "Text Field": "hello",
      "Dropdown Field": ["hello", "world", "!"],
      "Number Field": 1,
      "First Field": "hello-" + i,
      "Second Field": "world",
      "Third Field": 123 + i,
      "Fourth Field": [1, 2, 3],
      "Fifth Field": i % 2 === 0 ? i : 1,
    },
    created: new Date(Date.now() - 1000 * i * 60 * 60 * 24),
    author: "Guest",
  });
}

export function Explorer(props: Props) {
  const [filters, setFilters] = useState<FilterField[]>([]);
  const [displayedColumns, setDisplayedColumns] = useState<any[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([]);

  useEffect(() => {
    var subm: any[] = [];
    if (filters.length > 0) {
      submissions.map((submission) => {
        var valid = true;
        filters.map((filter) => {
          if (
            filter.selectedValues !== null &&
            filter.selectedValues.length > 0
          ) {
            var value = submission.data[filter.column];
            if (filter.filter === "exact") {
              switch (typeof value) {
                case "string":
                case "number":
                  if (filter.selectedValues[0] !== value) {
                    valid = false;
                  }
                  break;
                case "object":
                  filter.selectedValues.map((selectedValue) => {
                    if (!value.includes(selectedValue)) {
                      valid = false;
                    }
                  });
                  break;
                default:
                  break;
              }
            } else if (filter.filter === "includes") {
              switch (typeof value) {
                case "string":
                case "number":
                  var t = value.toString();
                  if (!t.includes(filter.selectedValues[0])) {
                    valid = false;
                  }
                  break;
                case "object":
                  var incl = false;
                  filter.selectedValues.map((selectedValue) => {
                    if (value.includes(selectedValue)) {
                      incl = true;
                    }
                  });
                  valid = incl;
                  break;
                default:
                  break;
              }
            } else if (filter.filter === "range" && typeof value === "number") {
              if (
                value < filter.selectedValues[0] ||
                value > filter.selectedValues[1]
              ) {
                valid = false;
              }
            }
          }
        });
        if (valid) {
          subm.push(submission);
        }
      });
    } else {
      subm = [...submissions];
    }
    setFilteredSubmissions(subm);
  }, [filters]);

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
                <Text mb="8px">Displayed Columns</Text>
                <TagPicker
                  cleanable
                  style={{
                    minHeight: "40px",
                    paddingTop: "2px",
                  }}
                  value={displayedColumns}
                  onChange={(values) => {
                    setDisplayedColumns(values);
                  }}
                  data={columns.map((value) => {
                    return { label: value.name, value: value.name };
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
                  disabled
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
                  disabled
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
                                    temp[index].values = value.values;
                                    setFilters(temp);
                                  }}
                                  classNamePrefix="select"
                                  isClearable={false}
                                  name="color"
                                  options={columns.map((value) => {
                                    return {
                                      label: value.name,
                                      value: value.name,
                                      type: value.type,
                                      values: value.values,
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
                                  <NumberInput
                                    onChange={(value) => {
                                      var temp = [...filters];
                                      temp[index].selectedValues[0] = value;
                                      setFilters(temp);
                                    }}
                                    value={filter.selectedValues[0]}
                                    w="100%"
                                  >
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
                                  <NumberInput
                                    onChange={(value) => {
                                      var temp = [...filters];
                                      temp[index].selectedValues[1] = value;
                                      setFilters(temp);
                                    }}
                                    value={filter.selectedValues[1]}
                                    w="100%"
                                  >
                                    <NumberInputField />
                                    <NumberInputStepper>
                                      <NumberIncrementStepper />
                                      <NumberDecrementStepper />
                                    </NumberInputStepper>
                                  </NumberInput>
                                </Stack>
                              ) : (filter.filter === "includes" ||
                                  filter.filter === "exact") &&
                                filter.type !== "text" ? (
                                <TagPicker
                                  cleanable
                                  style={{
                                    minHeight: "40px",
                                    paddingTop: "2px",
                                  }}
                                  onChange={(values) => {
                                    var temp = [...filters];
                                    temp[index].selectedValues = values;
                                    setFilters(temp);
                                  }}
                                  value={filter.selectedValues}
                                  data={filter.values.map((value) => {
                                    return { label: value, value };
                                  })}
                                  block
                                />
                              ) : (
                                <Input
                                  onChange={(event) => {
                                    var temp = [...filters];
                                    temp[index].selectedValues[0] =
                                      event.target.value;
                                    setFilters(temp);
                                  }}
                                  value={filter.selectedValues[0]}
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
                          selectedValues: [],
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
            <Text mb={"40px"} color="gray.700" fontWeight={400} fontSize="sm">
              <b>
                {filteredSubmissions.length} of {submissions.length}
              </b>{" "}
              items
            </Text>
            <Table autoHeight data={filteredSubmissions}>
              <Column width={200} fixed="left" align="center" resizable>
                <HeaderCell>Title</HeaderCell>
                <Cell dataKey="title" />
              </Column>
              <Column width={110} align="center" resizable>
                <HeaderCell>Status</HeaderCell>
                <Cell dataKey="status">
                  {(row: any, index: number) => {
                    return <Tag colorScheme="cyan">{row.status}</Tag>;
                  }}
                </Cell>
              </Column>
              <Column width={110} align="center" resizable>
                <HeaderCell>Created</HeaderCell>
                <Cell dataKey="created">
                  {(row: any, index: number) => {
                    return moment(new Date(row.created)).fromNow();
                  }}
                </Cell>
              </Column>
              {columns.map((column) => {
                if (
                  displayedColumns === null ||
                  displayedColumns.length < 1 ||
                  displayedColumns.includes(column.name)
                ) {
                  return (
                    <Column width={200} align="center" resizable>
                      <HeaderCell>{column.name}</HeaderCell>
                      <Cell dataKey={column.name}>
                        {(row: any, index: number) => {
                          var value = row.data[column.name];
                          switch (typeof value) {
                            case "number":
                              return value.toFixed(2);
                            case "object":
                              var tags: any[] = [];
                              value.map((element: any) => {
                                tags.push(<Tag mr={"5px"}>{element}</Tag>);
                              });
                              return tags;

                            default:
                              return value;
                          }
                        }}
                      </Cell>
                    </Column>
                  );
                }
              })}
              <Column width={200} align="center">
                <HeaderCell>Actions</HeaderCell>
                <Cell dataKey="actions">
                  {(row: any, index: number) => {
                    return (
                      <span>
                        <a
                          style={{ color: "#4399E1", cursor: "pointer" }}
                          onClick={() => {}}
                        >
                          {" "}
                          Edit{" "}
                        </a>{" "}
                        |{" "}
                        <a
                          style={{ color: "#4399E1", cursor: "pointer" }}
                          onClick={() => {}}
                        >
                          {" "}
                          Remove{" "}
                        </a>
                      </span>
                    );
                  }}
                </Cell>
              </Column>
            </Table>
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
