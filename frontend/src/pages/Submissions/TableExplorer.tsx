import { InteractionRequiredAuthError } from "@azure/msal-browser";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import moment from "moment";
import {
  Box,
  Text,
  Table as CTable,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
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
  Portal,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { DateRangeInput, DateSingleInput } from "../../components/DatePicker";
import { TagPicker } from "rsuite";
import { Table, IconButton as RIconButton } from "rsuite";
import { msalInstance } from "../../index";
import {
  AiOutlineDelete,
  AiOutlineMinus,
  AiOutlinePlus,
  BiPlusMedical,
} from "react-icons/all";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useState } from "react";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { RestAPI } from "../../api/rest";
import Project from "../../types/project";
import Submission from "../../types/submission";

const { ColumnGroup, Column, HeaderCell, Cell } = Table;

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

const filterTypes = {
  textfield: [
    { label: "Exact", value: "exact" },
    { label: "Includes", value: "includes" },
  ],
  textarea: [
    { label: "Exact", value: "exact" },
    { label: "Includes", value: "includes" },
  ],
  number: [
    { label: "Exact", value: "exact" },
    { label: "Range", value: "range" },
  ],
  select: [
    { label: "Exact", value: "exact" },
    { label: "Includes", value: "includes" },
  ],
  datetime: [{ label: "Range", value: "range" }],
};

export function TableExplorer(props: Props) {
  const [project, setProject] = useState<Project>({
    id: "",
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filters, setFilters] = useState<FilterField[]>([]);
  const [displayedColumns, setDisplayedColumns] = useState<any[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<any[]>([]);

  const handleExpanded = (rowData: any, dataKey: any) => {
    let open = false;
    const nextExpandedRowKeys = [];

    expandedRowKeys.forEach((key) => {
      if (key === rowData["id"]) {
        open = true;
      } else {
        nextExpandedRowKeys.push(key);
      }
    });

    if (!open) {
      nextExpandedRowKeys.push(rowData["id"]);
    }

    setExpandedRowKeys(nextExpandedRowKeys);
  };

  useEffect(() => {
    if (project.id) {
      RestAPI.getSubmissions(project.id).then((response) => {
        var subm = response.data;
        if (subm == null) {
          subm = [];
        }
        subm.reverse();
        setSubmissions(subm);
        project.components.map((component: any) => {
          if (component.type === "customTable") {
            subm.map((sub) => {
              if (sub.children === undefined) {
                sub.children = [];
              }
              sub.data[component.key].map((tableRecord: any, index: number) => {
                sub.children.push({
                  id: uuidv4(),
                  title: `[${index + 1}] ${component.label}`,
                  data: tableRecord,
                });
              });
            });
          }
        });
        setFilteredSubmissions(subm);
      });
    }
  }, [project]);

  useEffect(() => {
    RestAPI.getProjects().then((response) => {
      setProjects(response.data);
    });
  }, []);

  useEffect(() => {
    var filtered: Submission[] = [];
    if (filters.length > 0) {
      submissions.map((submission) => {
        var valid = true;
        filters.map((filter) => {
          if (
            filter.selectedValues !== null &&
            filter.selectedValues.length > 0
          ) {
            // filter
            var value = submission.data[filter.column];
            switch (filter.type) {
              case "textfield":
              case "textarea":
                switch (filter.filter) {
                  case "exact":
                    valid =
                      filter.selectedValues[0].toString() === value.toString();
                    break;
                  case "includes":
                    valid = value
                      .toString()
                      .includes(filter.selectedValues[0].toString());
                    break;
                }
                break;
              case "number":
                switch (filter.filter) {
                  case "exact":
                    valid = filter.selectedValues[0] === value;
                    break;
                  case "range":
                    if (filter.selectedValues.length === 2) {
                      valid =
                        value >= filter.selectedValues[0] &&
                        value <= filter.selectedValues[1];
                    }
                    break;
                }
                break;
              case "select":
                switch (filter.filter) {
                  case "exact":
                    filter.selectedValues.map((filterValue) => {
                      var exists = false;
                      value.map((v: any) => {
                        if (v.toString() === filterValue) {
                          exists = true;
                        }
                      });
                      if (!exists) {
                        valid = false;
                      }
                    });
                    break;
                  case "includes":
                    valid = filter.selectedValues.some((fv) =>
                      value.includes(fv)
                    );
                    break;
                }
                break;
              case "datetime":
                if (
                  filter.filter === "range" &&
                  filter.selectedValues.length === 2
                ) {
                  var v = new Date(value);
                  valid =
                    v >= filter.selectedValues[0] &&
                    v <= filter.selectedValues[1];
                }
                break;
            }
          }
        });
        if (valid) {
          filtered.push(submission);
        }
      });
    }
    setFilteredSubmissions(filtered);
  }, [filters]);

  return (
    <>
      {/* <AuthenticatedTemplate> */}
      <div>
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
                <Text mb="8px">Submission Date</Text>
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
                  data={
                    project.statuses
                      ? project.statuses.map((status) => {
                          return { label: status, value: status };
                        })
                      : []
                  }
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
                  data={[]}
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
                    var valuesField: JSX.Element = <div></div>;

                    switch (filter.type) {
                      case "textfield":
                      case "textarea":
                        valuesField = (
                          <Input
                            onChange={(event) => {
                              var temp = [...filters];
                              temp[index].selectedValues[0] =
                                event.target.value;
                              setFilters(temp);
                            }}
                            value={filter.selectedValues[0]}
                          />
                        );
                        break;
                      case "number":
                        switch (filter.filter) {
                          case "exact":
                            valuesField = (
                              <NumberInput
                                onChange={(_, value) => {
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
                            );
                            break;
                          case "range":
                            valuesField = (
                              <Stack direction={{ base: "column", md: "row" }}>
                                <NumberInput
                                  w="100%"
                                  onChange={(_, value) => {
                                    var temp = [...filters];
                                    temp[index].selectedValues[0] = value;
                                    setFilters(temp);
                                  }}
                                  value={filter.selectedValues[0]}
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
                                  w="100%"
                                  onChange={(_, value) => {
                                    var temp = [...filters];
                                    temp[index].selectedValues[1] = value;
                                    setFilters(temp);
                                  }}
                                  value={filter.selectedValues[1]}
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              </Stack>
                            );
                            break;
                        }
                        break;
                      case "select":
                        valuesField = (
                          <TagPicker
                            cleanable
                            style={{
                              minHeight: "40px",
                              paddingTop: "2px",
                            }}
                            onChange={(value) => {
                              var temp = [...filters];
                              temp[index].selectedValues = value;
                              setFilters(temp);
                            }}
                            data={filter.selectedValues}
                            block
                          />
                        );
                        break;
                      case "datetime":
                        valuesField = (
                          <DateRangeInput
                            allowEditableInputs={true}
                            displayFormat="dd.MM.yyyy"
                          />
                        );
                    }

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
                                    var tv: any = [];
                                    switch (value.type) {
                                      case "textfield":
                                      case "textarea":
                                        tv = [""];
                                        break;
                                      case "number":
                                        if (temp[index].filter === "exact") {
                                          tv = [0];
                                        } else {
                                          tv = [0, 0];
                                        }
                                        break;
                                    }
                                    temp[index].selectedValues = tv;
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
                                    filterTypes[
                                      filter.type as keyof typeof filterTypes
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
                              <Text mb="8px">Values</Text>
                              {valuesField}
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

          {/* <Box
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
            <Table
              headerHeight={80}
              isTree
              defaultExpandAllRows
              bordered
              cellBordered
              rowKey="id"
              shouldUpdateScroll={false}
              onExpandChange={(isOpen, rowData) => {
                console.log(isOpen, rowData);
              }}
              renderTreeToggle={(icon, rowData) => {
                return icon;
              }}
              autoHeight
              data={filteredSubmissions}
            >
              <Column width={200} fixed="left" align="left" resizable>
                <HeaderCell verticalAlign="middle">Title</HeaderCell>
                <Cell dataKey="title" />
              </Column>
              <Column width={110} align="center" resizable>
                <HeaderCell verticalAlign="middle">Status</HeaderCell>
                <Cell dataKey="status">
                  {(row: any, index: number) => {
                    if (row.status) {
                      return <Tag colorScheme="cyan">{row.status}</Tag>;
                    }
                  }}
                </Cell>
              </Column>

              <Column width={110} align="center" resizable>
                <HeaderCell verticalAlign="middle">Created</HeaderCell>
                <Cell dataKey="created">
                  {(row: any, index: number) => {
                    if (row.created) {
                      return moment(new Date(row.created)).fromNow();
                    }
                  }}
                </Cell>
              </Column>
              {project.components.map((component: any) => {
                if (
                  displayedColumns === null ||
                  displayedColumns.length < 1 ||
                  displayedColumns.includes(component.key)
                ) {
                  if (component.type === "customTable") {
                    var columns: any[] = [];
                    Object.keys(component.columns).map((key) => {
                      console.log(key);
                      columns.push(
                        <Column
                          colSpan={0}
                          width={200}
                          align="center"
                          resizable
                        >
                          <HeaderCell
                            style={{
                              backgroundColor: "#EDF2F6",
                              color: "#718196",
                            }}
                          >
                            {component.columns[key]}
                          </HeaderCell>
                          <Cell dataKey={key}>
                            {(row: any, index: number) => {
                              if (row.data && row.data[key]) {
                                return row.data[key];
                              }
                            }}
                          </Cell>
                        </Column>
                      );
                    });
                    return (
                      <ColumnGroup
                        align="left"
                        header={<Text as="b">{component.label}</Text>}
                      >
                        {columns}
                      </ColumnGroup>
                    );
                  }
                  if (component.type !== "button") {
                    return (
                      <Column width={200} align="center" resizable>
                        <HeaderCell verticalAlign="middle">
                          {component.label}
                        </HeaderCell>
                        <Cell dataKey={component.key}>
                          {(row: any, index: number) => {
                            if (row.data) {
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
                                  if (component.type === "datetime" && value) {
                                    var d = new Date(value);
                                    return d.toLocaleString();
                                  }
                                  return value;
                              }
                            }
                          }}
                        </Cell>
                      </Column>
                    );
                  }
                }
              })}
              <Column width={150}>
                <HeaderCell verticalAlign="middle">Actions</HeaderCell>
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
          </Box> */}
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
            <Table
              // virtualized
              headerHeight={80}
              isTree
              defaultExpandAllRows
              bordered
              cellBordered
              rowKey="id"
              shouldUpdateScroll={false}
              onExpandChange={(isOpen, rowData) => {
                console.log(isOpen, rowData);
              }}
              renderTreeToggle={(icon, rowData) => {
                return icon;
              }}
              autoHeight
              data={[]}
            >
              <ColumnGroup header={<Text as="b">General Information</Text>}>
                <Column width={50} resizable>
                  <HeaderCell
                    style={{
                      backgroundColor: "#EDF2F6",
                      color: "#718196",
                    }}
                  >
                    <div></div>
                  </HeaderCell>
                  <Cell dataKey="none" />
                </Column>
                <Column width={150} resizable>
                  <HeaderCell>Company Code</HeaderCell>
                  <Cell dataKey="companyCode" />
                </Column>

                <Column width={200} resizable>
                  <HeaderCell>Project Number</HeaderCell>
                  <Cell dataKey="projectNumber" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Campaign Start Date</HeaderCell>
                  <Cell dataKey="campaignStartDate" />
                </Column>
                <Column width={250} resizable>
                  <HeaderCell>Project Type</HeaderCell>
                  <Cell dataKey="projectType" />
                </Column>
              </ColumnGroup>
              <ColumnGroup header={<Text as="b">Project Information</Text>}>
                <Column width={0} resizable>
                  <HeaderCell
                    style={{
                      backgroundColor: "#f2f6ed",
                      color: "#718196",
                    }}
                  >
                    <div></div>
                  </HeaderCell>
                  <Cell dataKey="none" />
                </Column>
                <Column width={150} resizable>
                  <HeaderCell>Country</HeaderCell>
                  <Cell dataKey="country" />
                </Column>

                <Column width={150} resizable>
                  <HeaderCell>Country Share %</HeaderCell>
                  <Cell dataKey="countryShare" />
                </Column>
                <Column width={250} resizable>
                  <HeaderCell>Country Budget Contribution (EUR)</HeaderCell>
                  <Cell dataKey="countryBudgetContributionEur" />
                </Column>
                <Column width={250} resizable>
                  <HeaderCell>Country Cost Estimation (EUR)</HeaderCell>
                  <Cell dataKey="countryCostEstimationEur" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Manufacturer Number</HeaderCell>
                  <Cell dataKey="manufacturerNumber" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Vendor Name</HeaderCell>
                  <Cell dataKey="vendorName" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>SAP Debitor Number</HeaderCell>
                  <Cell dataKey="sapDebitorNumber" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>SAP Creditor Number</HeaderCell>
                  <Cell dataKey="sapCreditorNumber" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>MDF Level</HeaderCell>
                  <Cell dataKey="mdfLevel" />
                </Column>
                <Column width={150} resizable>
                  <HeaderCell>Budget Currency</HeaderCell>
                  <Cell dataKey="budgetCurrency" />
                </Column>
                <Column width={250} resizable>
                  <HeaderCell>Estimated Income (Budget Currency)</HeaderCell>
                  <Cell dataKey="estimatedIncomeBC" />
                </Column>
                <Column width={250} resizable>
                  <HeaderCell>Estimated Costs (Budget Currency)</HeaderCell>
                  <Cell dataKey="estimatedCostsBC" />
                </Column>
                <Column width={250} resizable>
                  <HeaderCell>Estimated Result (Budget Currency)</HeaderCell>
                  <Cell dataKey="estimatedResultBC" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Estimated Income (EUR)</HeaderCell>
                  <Cell dataKey="estimatedIncomeEur" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Estimated Costs (EUR)</HeaderCell>
                  <Cell dataKey="estimatedCostsEur" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Estimated Result (EUR)</HeaderCell>
                  <Cell dataKey="estimatedResultEur" />
                </Column>
                <Column width={150} resizable>
                  <HeaderCell>Vendor Share %</HeaderCell>
                  <Cell dataKey="vendorShare" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Business Unit</HeaderCell>
                  <Cell dataKey="bu" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>PH1</HeaderCell>
                  <Cell dataKey="ph1" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Campaign Channel</HeaderCell>
                  <Cell dataKey="campaignChannel" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Target Audience</HeaderCell>
                  <Cell dataKey="targetAudience" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Marketing Responsible</HeaderCell>
                  <Cell dataKey="marketingResponsible" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Production Project Manager</HeaderCell>
                  <Cell dataKey="productionProjectManager" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Project Approver</HeaderCell>
                  <Cell dataKey="projectApprover" />
                </Column>
              </ColumnGroup>
              <ColumnGroup header={<Text as="b">Purchase Order</Text>}>
                <Column width={0} resizable>
                  <HeaderCell
                    style={{
                      backgroundColor: "#f6edf2",
                      color: "#718196",
                    }}
                  >
                    <div></div>
                  </HeaderCell>
                  <Cell dataKey="none" />
                </Column>
                <Column width={250} resizable>
                  <HeaderCell>Purchase Order Service Provider</HeaderCell>
                  <Cell dataKey="purchaseOrderServiceProvider" />
                </Column>
                <Column width={250} resizable>
                  <HeaderCell>Net Value of Service Ordered (LC)</HeaderCell>
                  <Cell dataKey="netValueOfServiceOrderedLC" />
                </Column>
                <Column width={150} resizable>
                  <HeaderCell>Local Currency</HeaderCell>
                  <Cell dataKey="localCurrency" />
                </Column>
                <Column width={250} resizable>
                  <HeaderCell>Net Value (Purchase Order Currency)</HeaderCell>
                  <Cell dataKey="netValuePOC" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Purchase Order Currency</HeaderCell>
                  <Cell dataKey="purchaseOrderCurrency" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Net Value (EUR)</HeaderCell>
                  <Cell dataKey="netValueEur" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Purchase Order Status</HeaderCell>
                  <Cell dataKey="purchaseOrderStatus" />
                </Column>
              </ColumnGroup>
              <ColumnGroup header={<Text as="b">Cost Actuals</Text>}>
                <Column width={0} resizable>
                  <HeaderCell
                    style={{
                      backgroundColor: "#f1edf6",
                      color: "#718196",
                    }}
                  >
                    <div></div>
                  </HeaderCell>
                  <Cell dataKey="none" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Year / Month</HeaderCell>
                  <Cell dataKey="yearMonth" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Document Type</HeaderCell>
                  <Cell dataKey="documentType" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Posting Date</HeaderCell>
                  <Cell dataKey="postingDate" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Document Date</HeaderCell>
                  <Cell dataKey="documentDate" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Document Number</HeaderCell>
                  <Cell dataKey="documentNumber" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Invoice Number</HeaderCell>
                  <Cell dataKey="invoiceNumber" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Cost Account</HeaderCell>
                  <Cell dataKey="costAccount" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Name 1</HeaderCell>
                  <Cell dataKey="name1" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Cost Amount (LC)</HeaderCell>
                  <Cell dataKey="costAmountLC" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Cost Amount (DC)</HeaderCell>
                  <Cell dataKey="costAmountDC" />
                </Column>
                <Column width={150} resizable>
                  <HeaderCell>DC</HeaderCell>
                  <Cell dataKey="dc" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Cost Status</HeaderCell>
                  <Cell dataKey="costStatus" />
                </Column>
              </ColumnGroup>
              <ColumnGroup header={<Text as="b">Sales Actuals</Text>}>
                <Column width={0} resizable>
                  <HeaderCell
                    style={{
                      backgroundColor: "#f5f4ec",
                      color: "#718196",
                    }}
                  >
                    <div></div>
                  </HeaderCell>
                  <Cell dataKey="none" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Year / Month</HeaderCell>
                  <Cell dataKey="yearMonthSA" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Document Type</HeaderCell>
                  <Cell dataKey="documentTypeSA" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Posting Date</HeaderCell>
                  <Cell dataKey="postingDateSA" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Document Date</HeaderCell>
                  <Cell dataKey="documentDateSA" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Document Number</HeaderCell>
                  <Cell dataKey="documentNumberSA" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Invoice Number</HeaderCell>
                  <Cell dataKey="invoiceNumberSA" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Income Account</HeaderCell>
                  <Cell dataKey="incomeAccount" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Name 1</HeaderCell>
                  <Cell dataKey="name1" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Income Amount (LC)</HeaderCell>
                  <Cell dataKey="incomeAmountLC" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Income Amount (DC)</HeaderCell>
                  <Cell dataKey="incomeAmountDC" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Income Status</HeaderCell>
                  <Cell dataKey="incomeStatus" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Actual Result (LC)</HeaderCell>
                  <Cell dataKey="actualResult" />
                </Column>
              </ColumnGroup>
              <ColumnGroup header={<Text as="b">Actuals in EUR</Text>}>
                <Column width={0} resizable>
                  <HeaderCell
                    style={{
                      backgroundColor: "#f5eced",
                      color: "#718196",
                    }}
                  >
                    <div></div>
                  </HeaderCell>
                  <Cell dataKey="none" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Income Amount (EUR)</HeaderCell>
                  <Cell dataKey="incomeAmountEur" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Cost Amount (EUR)</HeaderCell>
                  <Cell dataKey="costAmountEur" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Actual Result (EUR)</HeaderCell>
                  <Cell dataKey="actualResult" />
                </Column>
              </ColumnGroup>
              <ColumnGroup header={<Text as="b">Cost GL Postings</Text>}>
                <Column width={0} resizable>
                  <HeaderCell
                    style={{
                      backgroundColor: "#f0f0f0",
                      color: "#718196",
                    }}
                  >
                    <div></div>
                  </HeaderCell>
                  <Cell dataKey="none" />
                </Column>
                <Column width={150} resizable>
                  <HeaderCell>Year / Month</HeaderCell>
                  <Cell dataKey="yearMonthCostGL" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Document Type</HeaderCell>
                  <Cell dataKey="documentTypeCostGL" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Posting Date</HeaderCell>
                  <Cell dataKey="postingDateCostGL" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Document Date</HeaderCell>
                  <Cell dataKey="documentDateCostGL" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Document Number</HeaderCell>
                  <Cell dataKey="documentNumberCostGL" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Cost Account</HeaderCell>
                  <Cell dataKey="costAccountCostGL" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Cost Amount (LC)</HeaderCell>
                  <Cell dataKey="costAmountLCCostGL" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Cost Amount (DC)</HeaderCell>
                  <Cell dataKey="costAmountDCCostGL" />
                </Column>
                <Column width={150} resizable>
                  <HeaderCell>DC</HeaderCell>
                  <Cell dataKey="dcCostGL" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Cost Amount (EUR)</HeaderCell>
                  <Cell dataKey="costAmountEurCostGL" />
                </Column>
              </ColumnGroup>

              <ColumnGroup header={<Text as="b">Income GL Postings</Text>}>
                <Column width={0} resizable>
                  <HeaderCell
                    style={{
                      backgroundColor: "#dceee4",
                      color: "#718196",
                    }}
                  >
                    <div></div>
                  </HeaderCell>
                  <Cell dataKey="none" />
                </Column>
                <Column width={150} resizable>
                  <HeaderCell>Year / Month</HeaderCell>
                  <Cell dataKey="yearMonthIncomeGL" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Document Type</HeaderCell>
                  <Cell dataKey="documentTypeIncomeGL" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Posting Date</HeaderCell>
                  <Cell dataKey="postingDateIncomeGL" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Document Date</HeaderCell>
                  <Cell dataKey="documentDateIncomeGL" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Document Number</HeaderCell>
                  <Cell dataKey="documentNumberIncomeGL" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Income Account</HeaderCell>
                  <Cell dataKey="incomeAccountIncomeGL" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Income Amount (LC)</HeaderCell>
                  <Cell dataKey="incomeAmountLCIncomeGL" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Income Amount (DC)</HeaderCell>
                  <Cell dataKey="incomeAmountDCIncomeGL" />
                </Column>
                <Column width={150} resizable>
                  <HeaderCell>DC</HeaderCell>
                  <Cell dataKey="dcIncomeGL" />
                </Column>
                <Column width={200} resizable>
                  <HeaderCell>Income Amount (EUR)</HeaderCell>
                  <Cell dataKey="incomeAmountEurIncomeGL" />
                </Column>
              </ColumnGroup>
              <Column width={0} align="left" resizable>
                <HeaderCell verticalAlign="middle">
                  <div></div>
                </HeaderCell>
                <Cell dataKey="none" />
              </Column>
            </Table>
          </Box>
        </VStack>
      </div>
      {/* </AuthenticatedTemplate> */}
      {/* <UnauthenticatedTemplate>
        <Box boxShadow="md" bg="white" p="2em" h="80vh"></Box>
      </UnauthenticatedTemplate> */}
    </>
  );
}

export default TableExplorer;
