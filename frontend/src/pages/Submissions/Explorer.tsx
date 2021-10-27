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

const { Column, HeaderCell, Cell } = Table;

interface Props {
  history: any;
}

interface FilterField {
  name: string;
  type: string;
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
            w="100%"
            shadow="md"
            color="gray.600"
            backgroundColor="white"
            mb={10}
            p={8}
            rounded="md"
          >
            <VStack
              mb={"20px"}
              spacing={8}
              fontSize="md"
              align="stretch"
              color={"gray.500"}
            >
              <Box w={"100%"}>
                <Table
                  rowHeight={70}
                  hover={false}
                  height={filters.length * 70 + 80}
                  //   autoHeight
                  style={{ width: "100%" }}
                  data={filters}
                  key="filter-table"
                >
                  <Column verticalAlign="middle" flexGrow={2}>
                    <HeaderCell>Name</HeaderCell>
                    <Cell dataKey="name">
                      {(row: any, index: number) => {
                        return <Input w={"95%"} value={row.name} />;
                      }}
                    </Cell>
                  </Column>
                  <Column verticalAlign="middle" flexGrow={2}>
                    <HeaderCell>Type</HeaderCell>
                    <Cell dataKey="type">
                      {(row: any) => {
                        return (
                          <Input readOnly w={"95%"} defaultValue={"dropdown"} />
                        );
                      }}
                    </Cell>
                  </Column>

                  <Column verticalAlign="middle" flexGrow={4}>
                    <HeaderCell>Values</HeaderCell>
                    <Cell dataKey="values">
                      {(row: any, index: number) => {
                        return <Input w={"100%"} value={row.name} />;
                      }}
                    </Cell>
                  </Column>
                </Table>

                <IconButton
                  onClick={() => {
                    setFilters([
                      ...filters,
                      { name: "", type: "", values: [] } as FilterField,
                    ]);
                  }}
                  my={5}
                  float="right"
                  variant="outline"
                  aria-label="add-filter"
                  icon={<BiPlusMedical />}
                />
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
