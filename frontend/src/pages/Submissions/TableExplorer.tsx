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
  Divider,
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
import { RestAPI } from "../../api/rest";
import Project from "../../types/project";
import Submission from "../../types/submission";

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

export function TableExplorer(props: Props) {
  const [project, setProject] = useState<Project>({
    id: "",
    title: "",
    created: new Date(),
    updated: new Date(),
    author: "",
    description: "",
    defaultStatus: "",
    tags: [] as string[],
    roles: [] as string[],
    components: [] as any[],
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filters, setFilters] = useState<FilterField[]>([]);
  const [displayedColumns, setDisplayedColumns] = useState<any[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([]);

  useEffect(() => {
    if (project.id) {
      RestAPI.getSubmissions(project.id).then((response) => {
        var submissions = response.data;
        submissions.reverse();
        setSubmissions(submissions);
        setFilteredSubmissions(submissions);
      });
    }
  }, [project]);
  useEffect(() => {
    RestAPI.getProjects().then((response) => {
      setProjects(response.data);
    });
  }, []);

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
            value={{
              label: project.title,
              value: project.id,
              project: project,
            }}
            onChange={(value: any) => {
              setProject(value.project);
            }}
            classNamePrefix="select"
            isClearable={false}
            name="projects"
            options={projects.map((project) => {
              return {
                label: project.title,
                value: project.id,
                project: project,
              };
            })}
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
                  data={project.components
                    .filter(
                      (component: any) =>
                        component.input && component.type !== "button"
                    )
                    .map((component: any) => {
                      return { label: component.label, value: component.key };
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
                  data={[]}
                  // data={fields.map((value) => {
                  //   return { label: value, value };
                  // })}
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
                  data={[]}
                  // data={fields.map((value) => {
                  //   return { label: value, value };
                  // })}
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
                                    temp[index].values = ["hello", "world"];
                                    setFilters(temp);
                                  }}
                                  classNamePrefix="select"
                                  isClearable={false}
                                  name="color"
                                  options={project.components
                                    .filter(
                                      (component: any) =>
                                        component.input &&
                                        component.type !== "button"
                                    )
                                    .map((component: any) => {
                                      return {
                                        label: component.label,
                                        value: component.key,
                                        type: component.type,
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
              {project.components.map((component: any) => {
                if (
                  displayedColumns === null ||
                  displayedColumns.length < 1 ||
                  displayedColumns.includes(component.key)
                ) {
                  if (component.type !== "button") {
                    return (
                      <Column width={200} align="center" resizable>
                        <HeaderCell>{component.label}</HeaderCell>
                        <Cell dataKey={component.key}>
                          {(row: any, index: number) => {
                            var value = row.data[component.key];
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
                }
              })}
              <Column width={200} align="center">
                <HeaderCell>Actions</HeaderCell>
                <Cell dataKey="actions">
                  {(row: any, index: number) => {
                    return (
                      <HStack>
                        <Text color="#4399E1" cursor="pointer">
                          Edit
                        </Text>
                        <Divider height="10px" orientation="vertical" />
                        <Text color="#4399E1" cursor="pointer">
                          Remove
                        </Text>
                      </HStack>
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

export default TableExplorer;
