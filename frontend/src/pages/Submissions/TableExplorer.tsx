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

const ExpandCell = ({
  rowData,
  dataKey,
  expandedRowKeys,
  onChange,
  ...props
}: any) => (
  <Cell {...props}>
    <RIconButton
      appearance="subtle"
      size="xs"
      onClick={() => {
        onChange(rowData);
      }}
      icon={
        expandedRowKeys.some((key: string) => key === rowData["id"]) ? (
          <AiOutlineMinus />
        ) : (
          <AiOutlinePlus />
        )
      }
    />
  </Cell>
);

const renderRowExpanded = (rowData: any) => {
  return (
    <Box overflow="scroll" w="100%" borderRadius="5px" h="380px">
      <CTable>
        <Thead>
          <Tr>
            <Th>To convert</Th>
            <Th>into</Th>
            <Th isNumeric>multiply by</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>inches</Td>
            <Td>millimetres (mm)</Td>
            <Td isNumeric>25.4</Td>
          </Tr>
          <Tr>
            <Td>feet</Td>
            <Td>centimetres (cm)</Td>
            <Td isNumeric>30.48</Td>
          </Tr>
          <Tr>
            <Td>yards</Td>
            <Td>metres (m)</Td>
            <Td isNumeric>0.91444</Td>
          </Tr>
          <Tr>
            <Td>yards</Td>
            <Td>metres (m)</Td>
            <Td isNumeric>0.91444</Td>
          </Tr>
          <Tr>
            <Td>yards</Td>
            <Td>metres (m)</Td>
            <Td isNumeric>0.91444</Td>
          </Tr>
        </Tbody>
      </CTable>
    </Box>
  );
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
              // isTree
              // defaultExpandAllRows={false}
              rowExpandedHeight={400}
              rowKey="id"
              expandedRowKeys={expandedRowKeys}
              renderRowExpanded={renderRowExpanded}
              // height={800}
              autoHeight
              data={filteredSubmissions}
            >
              <Column width={50} fixed="left" align="center">
                <HeaderCell>
                  <Text></Text>
                </HeaderCell>
                <ExpandCell
                  dataKey="id"
                  expandedRowKeys={expandedRowKeys}
                  onChange={handleExpanded}
                />
              </Column>
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
                                if (component.type === "datetime") {
                                  var d = new Date(value);
                                  return d.toLocaleString();
                                }
                                return value;
                            }
                          }}
                        </Cell>
                      </Column>
                    );
                  }
                }
              })}
              <Column width={150}>
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
