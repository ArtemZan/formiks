/* eslint-disable react-hooks/rules-of-hooks */
import {
  Box,
  Button,
  HStack,
  Input,
  Tooltip,
  Text,
  useColorModeValue,
  Divider,
  IconButton,
  Stack,
  VStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  CloseButton,
  MenuButton,
  Menu,
  MenuList,
  MenuItem,
  TabList,
  Tabs,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import {
  cloneElement,
  createRef,
  ReactElement,
  ReactNode,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import { FpsView, useFps } from "react-fps";
import Select from "react-select";
import Project from "../../types/project";
import { Submission } from "../../types/submission";
import { createGlobalStyle } from "styled-components";
import styled from "styled-components";
import { Overlay } from "react-overlays";
import DatePicker from "react-datepicker";
import Toast from "../../components/Toast";

import BaseTable, {
  AutoResizer,
  Column,
  ColumnShape,
  unflatten,
} from "react-base-table";
import ContentEditable from "react-contenteditable";
import "react-base-table/styles.css";
import { RestAPI } from "../../api/rest";
import React from "react";
import _ from "lodash";
import { ArrowForwardIcon, SearchIcon } from "@chakra-ui/icons";
import { BiPlusMedical, VscDebugRerun, VscDebugStart } from "react-icons/all";
import moment from "moment";
import { toast } from "react-toastify";
import { CheckTreePicker, TagPicker } from "rsuite";
import { DateRangeInput, DateSingleInput } from "../../components/DatePicker";
import EditableTableCell from "../../components/EditableTableCell";
import { ProjectInformationTable } from "./Tables/ProjectInformation";
import { PurchaseOrderTable } from "./Tables/PurchaseOrder";

interface Props {
  history: any;
}

var ProjectType: any[] = [];
var PH1: any[] = [];
var Companies: any[] = [];
var VendorsNames: any[] = [];
var CampaignChannel: any[] = [];
var TargetAudience: any[] = [];
var Budget: any[] = [];
var ExchangeRates: any[] = [];
var FiscalQuarter: any[] = [];
var Year: any[] = [];
var ProjectStartQuarter: any[] = [];
var SapStatus: any[] = [
  { label: "Created", value: "created" },
  { label: "None", value: "none" },
];

async function fetchDropdowns() {
  var dropdownsIds: string[] = [
    "619b630a9a5a2bb37a93b23b",
    "619b61419a5a2bb37a93b237",
    "619b63429a5a2bb37a93b23d",
    "619b62d79a5a2bb37a93b239",
    "619b632c9a5a2bb37a93b23c",
    "619b62959a5a2bb37a93b238",
    "619b62f29a5a2bb37a93b23a",
    "619b66defe27d06ad17d75ac",
    "619b6754fe27d06ad17d75ad",
    "619b6799fe27d06ad17d75ae",
    "619b7b9efe27d06ad17d75af",
  ];
  var responses = await Promise.all(
    dropdownsIds.map((di) => {
      return RestAPI.getDropdownValues(di);
    })
  );
  PH1 = responses[0].data;
  Companies = responses[1].data;
  VendorsNames = responses[2].data;
  CampaignChannel = responses[3].data;
  TargetAudience = responses[4].data;
  Budget = responses[5].data;
  ExchangeRates = responses[6].data;
  FiscalQuarter = responses[7].data;
  Year = responses[8].data;
  ProjectStartQuarter = responses[9].data;
  ProjectType = responses[10].data;
}

const loadOptions = (identifier: string) => {
  switch (identifier) {
    case "data.projectType":
      return ProjectType;
    case "data.ph1":
      return PH1;
    case "data.campaignChannel":
      return CampaignChannel;
    case "data.targetAudience":
      return TargetAudience;
    case "data.budgetCurrency":
      return ExchangeRates;
    case "data.sapStatus":
      return SapStatus;
  }
  return [];
};

interface FilterField {
  columnValue: string;
  columnLabel: string;
  type: string;
  filter: string;
  values: any[];
  selectedValues: any[];
}
const filterTypes = {
  text: [
    { label: "Exact", value: "exact" },
    { label: "Includes", value: "includes" },
  ],
  number: [
    { label: "Exact", value: "exact" },
    { label: "Range", value: "range" },
  ],
  dropdown: [
    { label: "Exact", value: "exact" },
    { label: "Includes", value: "includes" },
  ],
  "multiple-dropdown": [
    { label: "Exact", value: "exact" },
    { label: "Includes", value: "includes" },
  ],
  date: [
    { label: "Exact", value: "exact" },
    { label: "Range", value: "range" },
  ],
};

export function SVendorsTable(props: Props) {
  const [selectedSubmission, setSelectedSubmission] = useState<null | string>(
    null
  );
  const [filters, setFilters] = useState<FilterField[]>([]);

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>(
    []
  );

  const [totalRequests, setTotalRequests] = useState(1);

  useEffect(() => {
    fetchDropdowns().then(() => forceUpdate());
  }, []);
  const [forceUpdateCount, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    var filtered: Submission[] = [];
    if (filters.length > 0 && submissions.length > 0) {
      submissions.map((submission) => {
        var valid = true;
        filters.map((filter) => {
          if (
            filter.selectedValues !== null &&
            filter.selectedValues.length > 0
          ) {
            var value = _.get(submission, filter.columnValue);
            if (value === undefined) {
              valid = false;
              return;
            }
            switch (filter.type) {
              case "text":
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
              case "dropdown":
              case "multiple-dropdown":
                switch (filter.filter) {
                  case "includes":
                    var exists = false;
                    filter.selectedValues.map((filterValue) => {
                      if (filterValue.toString() === value) {
                        exists = true;
                      }
                    });
                    if (!exists) {
                      valid = false;
                    }
                    break;
                  case "exact":
                    valid = false;
                    break;
                }
                break;
              case "date":
                var v = new Date(value).setHours(0, 0, 0, 0);
                if (
                  v !== null &&
                  filter.filter === "range" &&
                  filter.selectedValues.length === 2 &&
                  filter.selectedValues[0] !== null &&
                  filter.selectedValues[1] !== null
                ) {
                  valid =
                    v >= filter.selectedValues[0].setHours(0, 0, 0, 0) &&
                    v <= filter.selectedValues[1].setHours(0, 0, 0, 0);
                } else if (
                  v !== null &&
                  filter.selectedValues[0] !== null &&
                  filter.filter === "exact" &&
                  filter.selectedValues.length === 1
                ) {
                  valid = v === filter.selectedValues[0].setHours(0, 0, 0, 0);
                }
                break;
            }
          }
        });
        if (valid) {
          filtered.push(submission);
        }
      });
      setFilteredSubmissions(filtered);
    } else {
      setFilteredSubmissions([...submissions]);
    }
  }, [filters, submissions]);

  async function partialUpdate(submission: string, path: string, value: any) {
    setTotalRequests(totalRequests + 1);
    if (path.includes("[")) {
      var s = path.split(".");
      s.shift();
      path = s.join(".");
    }
    RestAPI.updateSubmissionPartial(submission, path, value);
  }

  function handleCellUpdate(submission: string, path: string, value: any) {
    var submissionIndex = submissions.findIndex((s) => s.id === submission);
    if (submissionIndex > -1) {
      path = `[${submissionIndex}].${path}`;
      if (_.get(submissions, path) !== value) {
        _.set(submissions, path, value);
        partialUpdate(submission, path, value);
      }
    }
  }
  function deleteSubmission(submissionId: string) {
    var tbd: string[] = [submissionId];
    var submissionIndex = submissions.findIndex((s) => s.id === submissionId);
    if (submissionIndex > -1) {
      var temp = [...submissions];
      temp.splice(submissionIndex, 1);
      temp.map((s, index) => {
        if (s.parentId !== null && s.parentId === submissionId) {
          if (s.id) {
            temp.splice(index, 1);
            tbd.push(s.id);
          }
        }
      });
      setSubmissions(temp);
      tbd.forEach((ds) => {
        RestAPI.deleteSubmission(ds);
      });
    }
  }

  useEffect(() => {
    RestAPI.getSubmissions().then((response) => {
      var vSubs: Submission[] = [];
      var subs = response.data;
      subs.map((sub) => {
        if (sub.project === "619515b754e61c8dd33daa52") {
          vSubs.push(sub);
        }
      });
      setSubmissions(vSubs);
      setFilteredSubmissions(vSubs);
    });
  }, []);

  const tableCells = [
    {
      key: "data.companyName",
      dataKey: "data.companyName",
      title: "Company Name",
      width: 200,
      resizable: true,
      header: "General Information",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.companyCode",
      dataKey: "data.companyCode",
      title: "Company Code",
      width: 150,
      resizable: true,
      type: "number",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"number"}
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.projectNumber",
      dataKey: "data.projectNumber",
      title: "Project Number",
      width: 150,
      resizable: true,
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"text"}
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.campaignStartDate",
      dataKey: "data.campaignStartDate",
      title: "Campaign Start Date",
      width: 200,
      resizable: true,
      type: "date",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"date"}
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "data.projectType",
      dataKey: "data.projectType",
      title: "Project Type",
      width: 250,
      resizable: true,
      type: "dropdown",
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"dropdown"}
          loadOptions={loadOptions}
          onUpdate={handleCellUpdate}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={props.cellData}
        />
      ),
    },
    {
      key: "__actions.view",
      dataKey: "__actions.view",
      title: "View",
      width: 100,
      resizable: true,
      header: "Actions",
      cellRenderer: (props: any) =>
        props.rowData.parentId === null ? (
          <EditableTableCell
            type={"button"}
            textColor={"blue"}
            onUpdate={(submission: string) => {
              setSelectedSubmission(submission);
            }}
            rowIndex={props.rowIndex}
            columnKey={props.column.dataKey}
            rowData={props.rowData}
            initialValue={"view"}
          />
        ) : null,
    },
    {
      key: "__actions.delete",
      dataKey: "__actions.delete",
      title: "Delete",
      width: 100,
      resizable: true,
      cellRenderer: (props: any) => (
        <EditableTableCell
          type={"button"}
          textColor={"red"}
          onUpdate={deleteSubmission}
          rowIndex={props.rowIndex}
          columnKey={props.column.dataKey}
          rowData={props.rowData}
          initialValue={"delete"}
        />
      ),
    },
  ];

  return (
    <div>
      <Box
        w={"100%"}
        bg={useColorModeValue("white", "#21252A")}
        minH={"85vh"}
        mb={5}
        border="1px"
        rounded="md"
        borderColor="gray.100"
        p={"20px"}
      >
        <Tabs variant="enclosed" w={"100%"}>
          <TabList align="start">
            <Tab>General Information</Tab>
            <Tab hidden={selectedSubmission === null}>Project Information</Tab>
            <Tab hidden={selectedSubmission === null}>Purchase Order</Tab>
            <Tab hidden={selectedSubmission === null}>Cost Actuals</Tab>
            <Tab hidden={selectedSubmission === null}>Sales Actuals</Tab>
            <Tab hidden={selectedSubmission === null}>Actuals in EUR</Tab>
            <Tab hidden={selectedSubmission === null}>Cost GL Postings</Tab>
            <Tab hidden={selectedSubmission === null}>Income GL Postings</Tab>
          </TabList>
          <TabPanels>
            <TabPanel w="100%" h="80vh">
              <AutoResizer>
                {({ width, height }) => (
                  <BaseTable
                    ignoreFunctionInColumnCompare={false}
                    width={width}
                    height={height}
                    fixed
                    columns={tableCells}
                    headerClassName="header-cells"
                    data={unflatten([...filteredSubmissions] as any[])}
                    rowKey="id"
                    headerHeight={50}
                    rowHeight={55}
                  ></BaseTable>
                )}
              </AutoResizer>
            </TabPanel>
            <TabPanel w="100%" h="80vh">
              <ProjectInformationTable
                submissions={unflatten([
                  ...filteredSubmissions.filter(
                    (s) =>
                      //   s.group === "projectInformation" &&
                      s.id === selectedSubmission ||
                      s.parentId === selectedSubmission
                  ),
                ] as any[])}
                handleCellUpdate={handleCellUpdate}
                selectedSubmission={selectedSubmission}
              />
            </TabPanel>
            <TabPanel w="100%" h="80vh">
              <PurchaseOrderTable
                submissions={unflatten([
                  ...filteredSubmissions.filter(
                    (s) =>
                      //   s.group === "projectInformation" &&
                      s.id === selectedSubmission ||
                      s.parentId === selectedSubmission
                  ),
                ] as any[])}
                handleCellUpdate={handleCellUpdate}
                selectedSubmission={selectedSubmission}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      {/* <Box
        shadow="md"
        color="gray.600"
        backgroundColor="white"
        mb={10}
        p={8}
        pb={0}
        rounded="md"
        w={"100%"}
      >
        <VStack spacing={8} fontSize="md" align="stretch" color={"gray.500"}>
          <Box w={"100%"}>
            <Box w={"100%"}>
              {filters.map((filter, index) => {
                var valuesField: JSX.Element = <div></div>;

                switch (filter.type) {
                  case "text":
                    valuesField = (
                      <Input
                        onChange={(event) => {
                          var temp = [...filters];
                          temp[index].selectedValues[0] = event.target.value;
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
                            onChange={(vstring, value) => {
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
                              onChange={(vstring, value) => {
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
                              onChange={(vstring, value) => {
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
                  case "dropdown":
                  case "multiple-dropdown":
                    valuesField = (
                      <TagPicker
                        cleanable
                        style={{
                          minHeight: "40px",
                          paddingTop: "2px",
                        }}
                        onChange={(value) => {
                          console.log(value);
                          var temp = [...filters];
                          temp[index].selectedValues = value;
                          setFilters(temp);
                        }}
                        data={loadOptions(filter.columnValue)}
                        block
                      />
                    );
                    break;
                  case "date":
                    switch (filter.filter) {
                      case "exact":
                        valuesField = (
                          <DateSingleInput
                            allowEditableInputs={true}
                            displayFormat="dd.MM.yyyy"
                            onChange={(value) => {
                              if (value !== filters[index].selectedValues[0]) {
                                var temp = [...filters];
                                temp[index].selectedValues = [value];
                                setFilters(temp);
                              }
                            }}
                          />
                        );
                        break;
                      case "range":
                        valuesField = (
                          <DateRangeInput
                            allowEditableInputs={true}
                            displayFormat="dd.MM.yyyy"
                            onDatesChange={(value) => {
                              var temp = [...filters];
                              temp[index].selectedValues = [
                                value.startDate,
                                value.endDate,
                              ];
                              setFilters(temp);
                            }}
                          />
                        );
                        break;
                    }
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
                                label: filter.columnLabel,
                                value: filter.columnValue,
                              }}
                              onChange={(value: any) => {
                                var temp = [...filters];
                                temp[index].columnValue = value.value;
                                temp[index].columnLabel = value.label;
                                temp[index].type = value.type;
                                temp[index].filter = "exact";
                                var tv: any = [];
                                switch (value.type) {
                                  case "text":
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
                              options={tableCells
                                .filter((cell: any) => cell.dataKey[0] !== "_")
                                .map((cell: any) => {
                                  return {
                                    label: cell.title,
                                    value: cell.dataKey,
                                    type: cell.type ? cell.type : "text",
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
                      columnValue: "",
                      columnLabel: "",
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
      </Box> */}
    </div>
  );
}

export default SVendorsTable;
