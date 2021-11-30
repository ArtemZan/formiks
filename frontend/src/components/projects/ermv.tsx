/* eslint-disable react-hooks/rules-of-hooks */
import React from "react";
import { useEffect, useState } from "react";
import {
  useColorModeValue,
  Input,
  Box,
  VStack,
  Text,
  HStack,
  Textarea,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
} from "@chakra-ui/react";
import CreatableSelect from "react-select/creatable";
import Project from "../../types/project";
import Select from "react-select";
import { msalInstance } from "../../index";
import { getAccountInfo } from "../../utils/MsGraphApiCall";
import DatePicker from "react-datepicker";
import isEqual from "lodash/isEqual";

import { Table } from "rsuite";
import { Submission, SubmissionWithChildren } from "../../types/submission";
import { RestAPI } from "../../api/rest";
import { v4 as uuidv4 } from "uuid";

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

const { Column, HeaderCell, Cell } = Table;

interface Props {
  history: any;
  project: Project;
}

export default function CreateBookmark(props: Props) {
  const [requestorsCompanyName, setRequestorsCompanyName] = useState<any>({
    label: "",
    value: { name: "", code: "", country: "" },
  });
  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [campaignChannel, setCampaignChannel] = useState<any>({
    label: "",
    value: "",
  });
  const [vendorsNames, setVendorsNames] = useState<any>([]);
  const [year, setYear] = useState<any>({
    label: "",
    value: "",
  });
  const [projectStartQuarter, setProjectStartQuarter] = useState<any>({
    label: "",
    value: "",
  });
  const [projectNumber, setProjectNumber] = useState("");
  const [requestorsName, setRequestorsName] = useState("");
  const [projectApproval, setProjectApproval] = useState("");
  const [fiscalQuarter, setFiscalQuarter] = useState<any>({
    label: "",
    value: "",
  });
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [budgetSource, setBudgetSource] = useState<any>({
    label: "",
    value: "",
  });
  const [budgetApprovedByVendor, setBudgetApprovedByVendor] = useState("");
  const [exchangeRates, setExchangeRates] = useState<any>({
    label: "",
    value: "",
  });
  const [estimatedIncomeBudgetCurrency, setEstimatedIncomeBudgetCurrency] =
    useState("");
  const [estimatedCostsBudgetCurrency, setEstimatedCostsBudgetCurrency] =
    useState("");
  const [netProfitTargetBudgetCurrency, setNetProfitTargetBudgetCurrency] =
    useState("");
  const [estimatedIncome, setEstimatedIncome] = useState("");
  const [estimatedCosts, setEstimatedCosts] = useState("");
  const [netProfitTarget, setNetProfitTarget] = useState("");
  const [companiesParticipating, setCompaniesParticipating] = useState<any>([]);
  const [comments, setComments] = useState("");
  const [vendors, setVendors] = useState<any>([]);
  const [costBreakdown, setCostBreakdown] = useState<any>([]);

  const [totalVendorBudgetInLC, setTotalVendorBudgetInLC] = useState(0);
  const [totalVendorBudgetInEUR, setTotalVendorBudgetInEUR] = useState(0);

  const [totalEstimatedCostsCC, setTotalEstimatedCostsCC] = useState("");
  const [totalEstimatedCostsLC, setTotalEstimatedCostsLC] = useState("");
  const [totalEstimatedCostsEur, setTotalEstimatedCostsEur] = useState("");

  async function fetchDropdowns() {
    RestAPI.getDropdownValues("619b630a9a5a2bb37a93b23b").then((response) => {
      PH1 = response.data;
    });
    RestAPI.getDropdownValues("619b61419a5a2bb37a93b237").then((response) => {
      Companies = response.data;
    });
    RestAPI.getDropdownValues("619b63429a5a2bb37a93b23d").then((response) => {
      VendorsNames = response.data;
    });
    RestAPI.getDropdownValues("619b62d79a5a2bb37a93b239").then((response) => {
      CampaignChannel = response.data;
    });
    RestAPI.getDropdownValues("619b632c9a5a2bb37a93b23c").then((response) => {
      TargetAudience = response.data;
    });
    RestAPI.getDropdownValues("619b62959a5a2bb37a93b238").then((response) => {
      Budget = response.data;
    });
    RestAPI.getDropdownValues("619b62f29a5a2bb37a93b23a").then((response) => {
      ExchangeRates = response.data;
    });
    RestAPI.getDropdownValues("619b66defe27d06ad17d75ac").then((response) => {
      FiscalQuarter = response.data;
    });
    RestAPI.getDropdownValues("619b6754fe27d06ad17d75ad").then((response) => {
      Year = response.data;
    });
    RestAPI.getDropdownValues("619b6799fe27d06ad17d75ae").then((response) => {
      ProjectStartQuarter = response.data;
    });
  }

  useEffect(() => {
    getAccountInfo().then((response) => {
      if (response) {
        setRequestorsName(response.mail);
      }
    });
    fetchDropdowns();
  }, []);

  useEffect(() => {
    var data: any = [];
    vendorsNames.map((vendor: any) => {
      data.push({
        vendor: vendor.label,
        projectManager: "",
        creditor: vendor.value.kreditor,
        debitor: vendor.value.debitorischer,
        manufacturer: vendor.value.hersteller,
        bu: vendor.value.bu,
        ph: { label: "", value: "" },
      });
    });
    setVendors(data);
  }, [vendorsNames]);
  useEffect(() => {
    var data: any = [];
    companiesParticipating.map((company: any) => {
      data.push({
        companyName: company.label,
        companyCode: company.value.code,
        country: company.value.country,
        contactEmail: "",
        projectNumber: "",
        contribution: "",
        estimatedCosts: "",
        budgetCurrency: { label: "", value: "" },
        budgetAmount: "",
        localBudget: "",
        eurBudget: "",
        share: "",
        estimatedCostsCC: "",
        estimatedCostsLC: "",
        estimatedCostsEUR: "",
        netProfitTargetVC: "",
        netProfitTargetLC: "",
        netProfitTargetEUR: "",
      });
    });
    setCostBreakdown(data);
  }, [companiesParticipating]);

  useEffect(() => {
    setEstimatedCosts(
      (
        parseFloat(estimatedCostsBudgetCurrency) /
        parseFloat(exchangeRates.value)
      )
        .toFixed(2)
        .toString()
    );
    if (budgetSource.value !== "noBudget") {
      setEstimatedIncome(
        (
          parseFloat(estimatedIncomeBudgetCurrency) /
          parseFloat(exchangeRates.value)
        )
          .toFixed(2)
          .toString()
      );
      setNetProfitTarget(
        (parseFloat(estimatedIncome) - parseFloat(estimatedCosts))
          .toFixed(2)
          .toString()
      );
      setNetProfitTargetBudgetCurrency(
        (
          parseFloat(estimatedIncomeBudgetCurrency) -
          parseFloat(estimatedCostsBudgetCurrency)
        )
          .toFixed(2)
          .toString()
      );
    } else {
      setNetProfitTarget(estimatedCosts);
      setNetProfitTargetBudgetCurrency(estimatedCostsBudgetCurrency);
    }
  }, [
    budgetSource,
    estimatedIncome,
    estimatedCosts,
    exchangeRates,
    estimatedIncomeBudgetCurrency,
    estimatedCostsBudgetCurrency,
  ]);

  useEffect(() => {
    setProjectNumber(
      (requestorsCompanyName.value.code === ""
        ? "????"
        : requestorsCompanyName.value.code) +
        (requestorsCompanyName.value.country === ""
          ? "??"
          : requestorsCompanyName.value.country) +
        (year.value === "" ? "??" : year.value) +
        (campaignChannel.value === "" ? "?" : campaignChannel.value) +
        (projectStartQuarter.value === ""
          ? "?"
          : projectStartQuarter.value.slice(1)) +
        "01"
    );
  }, [year, campaignChannel, projectStartQuarter, requestorsCompanyName]);

  useEffect(() => {
    var totalBudgetEur = 0;
    var totalBudgetLC = 0;
    var totalCostsCC = parseFloat(totalEstimatedCostsCC);
    var totalCostsLC = parseFloat(totalEstimatedCostsLC);
    var totalCostsEur = parseFloat(totalEstimatedCostsEur);
    var netProfitEur = parseFloat(netProfitTarget);
    var netProfiLC = parseFloat(netProfitTargetBudgetCurrency);

    var temp = [...costBreakdown];
    temp.map((row: any) => {
      var eb = parseFloat(row.eurBudget);
      var lb = parseFloat(row.localBudget);

      if (!isNaN(eb)) {
        totalBudgetEur += eb;
      }
      if (!isNaN(lb)) {
        totalBudgetLC += lb;
      }
    });
    temp.map((row: any) => {
      var vbEur = parseFloat(row.eurBudget);
      if (!isNaN(vbEur) && totalBudgetEur !== 0) {
        var share = vbEur / totalBudgetEur;
        row.share = (share * 100).toFixed(2);

        if (!isNaN(totalCostsCC)) {
          row.estimatedCostsCC = (share * totalCostsCC).toFixed(2);
        }
        if (!isNaN(totalCostsLC)) {
          row.estimatedCostsLC = (share * totalCostsLC).toFixed(2);
        }
        if (!isNaN(totalCostsEur)) {
          row.estimatedCostsEUR = (share * totalCostsEur).toFixed(2);
        }
        var vendorCurr = parseFloat(row.budgetCurrency.value);
        if (!isNaN(netProfitEur)) {
          row.netProfitTargetEUR = (share * netProfitEur).toFixed(2);
          if (!isNaN(vendorCurr)) {
            row.netProfitTargetVC = (
              vendorCurr *
              (share * netProfitEur)
            ).toFixed(2);
          }
        }
        if (!isNaN(netProfiLC)) {
          row.netProfitTargetLC = (share * netProfiLC).toFixed(2);
        }
      }
    });
    setTotalVendorBudgetInEUR(totalBudgetEur);
    setTotalVendorBudgetInLC(totalBudgetLC);
    if (!isEqual(costBreakdown, temp)) {
      setCostBreakdown(temp);
    }
  }, [
    costBreakdown,
    totalEstimatedCostsCC,
    totalEstimatedCostsLC,
    totalEstimatedCostsEur,
  ]);

  return (
    <Box>
      <VStack spacing="20px" mb={"40px"} align="start">
        <Text as="b">Requestor`s Details</Text>
        <Box w="100%">
          <Text mb="8px">Requestor`s Company Name</Text>
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
              label: requestorsCompanyName.label,
              value: requestorsCompanyName.value,
            }}
            onChange={(value: any) => {
              setRequestorsCompanyName(value);
            }}
            classNamePrefix="select"
            isClearable={false}
            name="requestorsCompanyName"
            options={Companies}
          />
        </Box>
        <HStack w="100%">
          <Box w="100%">
            <Text mb="8px">Requestor`s Company Code</Text>
            <Input
              defaultValue={requestorsCompanyName.value.code}
              disabled
              bg={useColorModeValue("white", "#2C313C")}
              color={useColorModeValue("gray.800", "#ABB2BF")}
            />
          </Box>
          <Box w="100%">
            <Text mb="8px">Requestor`s Country</Text>
            <Input
              defaultValue={requestorsCompanyName.value.country}
              disabled
              bg={useColorModeValue("white", "#2C313C")}
              color={useColorModeValue("gray.800", "#ABB2BF")}
            />
          </Box>
        </HStack>
        <Text as="b">Campaign`s Details</Text>
        <Box w="100%">
          <Text mb="8px">Campaign Name</Text>
          <Input
            value={campaignName}
            onChange={(event) => {
              setCampaignName(event.target.value);
            }}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Campaign Description</Text>
          <Textarea
            value={campaignDescription}
            onChange={(event) => {
              setCampaignDescription(event.target.value);
            }}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
            size="md"
            resize={"vertical"}
            rows={5}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Target Audience</Text>
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
              setTargetAudience(value.label);
            }}
            classNamePrefix="select"
            isClearable={false}
            name="targetAudience"
            options={TargetAudience}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Campaign Channel</Text>
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
              setCampaignChannel(value);
            }}
            classNamePrefix="select"
            isClearable={false}
            name="campaignChannel"
            options={CampaignChannel}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Vendor`s Names</Text>
          <Select
            isMulti
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
            value={vendorsNames}
            placeholder=""
            onChange={(value: any) => {
              setVendorsNames(value);
            }}
            classNamePrefix="select"
            isClearable={false}
            name="vendorsName"
            options={VendorsNames}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Vendors (new)</Text>
          <Table
            shouldUpdateScroll={false}
            hover={false}
            autoHeight
            rowHeight={65}
            data={costBreakdown}
          >
            <Column width={200} resizable>
              <HeaderCell>Country</HeaderCell>
              <Cell dataKey="country">
                {(rowData, index) => (
                  <Input
                    value={rowData.companyName}
                    onChange={(event) => {
                      var temp = [...costBreakdown];
                      temp[index].companyName = event.target.value;
                      setCostBreakdown(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={200} resizable>
              <HeaderCell>Share %</HeaderCell>
              <Cell dataKey="share">
                {(rowData, index) => (
                  <Input
                    value={rowData.creditor}
                    onChange={(event) => {
                      var temp = [...vendors];
                      temp[index].creditor = event.target.value;
                      setVendors(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>

            <Column width={200} resizable>
              <HeaderCell>Budget Contribution (EUR)</HeaderCell>
              <Cell dataKey="debitor">
                {(rowData, index) => (
                  <Input
                    value={rowData.debitor}
                    onChange={(event) => {
                      var temp = [...vendors];
                      temp[index].debitor = event.target.value;
                      setVendors(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>

            <Column width={200} resizable>
              <HeaderCell>Cost Estimation (EUR)</HeaderCell>
              <Cell dataKey="manufacturer">
                {(rowData, index) => (
                  <Input
                    value={rowData.manufacturer}
                    onChange={(event) => {
                      var temp = [...vendors];
                      temp[index].manufacturer = event.target.value;
                      setVendors(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
          </Table>
        </Box>
        <Box w="100%">
          <Text mb="8px">Vendors</Text>
          <Table
            shouldUpdateScroll={false}
            hover={false}
            autoHeight
            rowHeight={65}
            data={vendors}
          >
            <Column flexGrow={2}>
              <HeaderCell>Vendor</HeaderCell>
              <Cell dataKey="vendor">
                {(rowData, index) => (
                  <Input
                    value={rowData.vendor}
                    onChange={(event) => {
                      var temp = [...vendors];
                      temp[index].vendor = event.target.value;
                      setVendors(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>

            <Column flexGrow={1}>
              <HeaderCell>ALSO Project Manager</HeaderCell>
              <Cell dataKey="projectManager">
                {(rowData, index) => (
                  <Input
                    value={rowData.projectManager}
                    onChange={(event) => {
                      var temp = [...vendors];
                      temp[index].projectManager = event.target.value;
                      setVendors(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>

            <Column flexGrow={1}>
              <HeaderCell>Creditor</HeaderCell>
              <Cell dataKey="creditor">
                {(rowData, index) => (
                  <Input
                    value={rowData.creditor}
                    onChange={(event) => {
                      var temp = [...vendors];
                      temp[index].creditor = event.target.value;
                      setVendors(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>

            <Column flexGrow={1}>
              <HeaderCell>Debitor</HeaderCell>
              <Cell dataKey="debitor">
                {(rowData, index) => (
                  <Input
                    value={rowData.debitor}
                    onChange={(event) => {
                      var temp = [...vendors];
                      temp[index].debitor = event.target.value;
                      setVendors(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>

            <Column flexGrow={1}>
              <HeaderCell>Manufacturer</HeaderCell>
              <Cell dataKey="manufacturer">
                {(rowData, index) => (
                  <Input
                    value={rowData.manufacturer}
                    onChange={(event) => {
                      var temp = [...vendors];
                      temp[index].manufacturer = event.target.value;
                      setVendors(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>

            <Column flexGrow={2}>
              <HeaderCell>Business Unit</HeaderCell>
              <Cell dataKey="bu">
                {(rowData, index) => (
                  <Input
                    value={rowData.bu}
                    onChange={(event) => {
                      var temp = [...vendors];
                      temp[index].bu = event.target.value;
                      setVendors(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column flexGrow={1}>
              <HeaderCell>PH1</HeaderCell>
              <Cell dataKey="ph">
                {(rowData, index) => (
                  <Select
                    styles={{
                      menu: (provided) => ({
                        ...provided,
                        zIndex: 1000000000,
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
                    menuPortalTarget={document.body}
                    value={rowData.ph}
                    onChange={(value) => {
                      var temp = [...vendors];
                      temp[index].ph = value;
                      setVendors(temp);
                    }}
                    placeholder=""
                    classNamePrefix="select"
                    isClearable={false}
                    name="PH1"
                    options={PH1}
                  />
                )}
              </Cell>
            </Column>
          </Table>
        </Box>
        <Box w="100%">
          <Text mb="8px">Year</Text>
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
            value={{ label: year.label, value: year.value }}
            placeholder=""
            onChange={(value: any) => {
              setYear(value);
            }}
            classNamePrefix="select"
            isClearable={false}
            name="year"
            options={Year}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Campaign/Project Start Quarter (ALSO Quarter)</Text>
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
              label: projectStartQuarter.label,
              value: projectStartQuarter.value,
            }}
            placeholder=""
            onChange={(value: any) => {
              setProjectStartQuarter(value);
            }}
            classNamePrefix="select"
            isClearable={false}
            name="projectStartQuarter"
            options={ProjectStartQuarter}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Project Number</Text>
          <Input
            placeholder="____________"
            defaultValue={projectNumber}
            disabled
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Requestor`s Name</Text>
          <Input
            defaultValue={requestorsName}
            disabled
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">ALSO Project Approver</Text>
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
            value={{ label: "", value: "" }}
            placeholder=""
            classNamePrefix="select"
            isClearable={false}
            name="projectApprover"
            options={[]}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">ALSO Project Approval (link)</Text>
          <Input
            value={projectApproval}
            onChange={(event) => {
              setProjectApproval(event.target.value);
            }}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Manufacturer`s Fiscal Quarter</Text>
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
            value={fiscalQuarter}
            onChange={(value) => {
              setFiscalQuarter(value);
            }}
            placeholder=""
            classNamePrefix="select"
            isClearable={false}
            name="fiscalQuarter"
            options={FiscalQuarter}
          />
        </Box>

        <HStack w="100%">
          <Box w="100%">
            <Text mb="8px">Campaign Start Date</Text>
            <DatePicker
              customInput={
                <Input
                  bg={useColorModeValue("white", "#2C313C")}
                  color={useColorModeValue("gray.800", "#ABB2BF")}
                />
              }
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
              }}
              dateFormat="dd.MM.yyyy"
            />
          </Box>
          <Box w="100%">
            <Text mb="8px">Campaign End Date</Text>
            <DatePicker
              customInput={
                <Input
                  bg={useColorModeValue("white", "#2C313C")}
                  color={useColorModeValue("gray.800", "#ABB2BF")}
                />
              }
              selected={endDate}
              onChange={(date) => {
                setEndDate(date);
              }}
              dateFormat="dd.MM.yyyy"
            />
          </Box>
        </HStack>
        <Text as="b">Financial details</Text>
        <Box w="100%">
          <Text mb="8px">Budget Source</Text>
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
            value={budgetSource}
            onChange={(value) => {
              setBudgetSource(value);
            }}
            placeholder=""
            classNamePrefix="select"
            isClearable={false}
            name="fiscalQuarter"
            options={Budget}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Budget Approved by Vendor (name and surname)</Text>
          <Input
            value={budgetApprovedByVendor}
            onChange={(event) => {
              setBudgetApprovedByVendor(event.target.value);
            }}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Campaign Budget`s Currency / Campaign Currency</Text>
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
            value={exchangeRates}
            onChange={(value) => {
              setExchangeRates(value);
            }}
            placeholder=""
            classNamePrefix="select"
            isClearable={false}
            name="campaignCurrency"
            options={ExchangeRates}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Campaign Estimated Income in Budget`s currency</Text>
          <Input
            value={estimatedIncomeBudgetCurrency}
            onChange={(event) => {
              setEstimatedIncomeBudgetCurrency(event.target.value);
            }}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Campaign Estimated Costs in Budget`s currency</Text>
          <Input
            value={estimatedCostsBudgetCurrency}
            onChange={(event) => {
              setEstimatedCostsBudgetCurrency(event.target.value);
            }}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">
            {budgetSource.value === "noBudget"
              ? "Campaign Loss in Budget`s currency"
              : "Campaign Net Profit Target in Budget`s currency"}
          </Text>
          <Input
            value={netProfitTargetBudgetCurrency}
            onChange={(event) => {
              setNetProfitTargetBudgetCurrency(event.target.value);
            }}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Campaign Estimated Income in EUR</Text>
          <Input
            disabled={budgetSource.value === "noBudget"}
            value={estimatedIncome}
            onChange={(event) => {
              setEstimatedIncome(event.target.value);
            }}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Campaign Estimated Costs in EUR</Text>
          <Input
            value={estimatedCosts}
            onChange={(event) => {
              setEstimatedCosts(event.target.value);
            }}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">
            {budgetSource.value === "noBudget"
              ? "Campaign Loss in EUR"
              : "Campaign Net Profit Target in EUR"}
          </Text>
          <Input
            // value={netProfitTarget}
            value={netProfitTarget}
            onChange={(event) => {
              setNetProfitTarget(event.target.value);
            }}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Total Estimated Costs in Campaign Currency</Text>
          <Input
            value={totalEstimatedCostsCC}
            onChange={(event) => {
              setTotalEstimatedCostsCC(event.target.value);
            }}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Total Estimated Costs in Local Currency</Text>
          <Input
            value={totalEstimatedCostsLC}
            onChange={(event) => {
              setTotalEstimatedCostsLC(event.target.value);
            }}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Total Estimated Costs in EUR</Text>
          <Input
            value={totalEstimatedCostsEur}
            onChange={(event) => {
              setTotalEstimatedCostsEur(event.target.value);
            }}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Companies Participating</Text>
          <Select
            isMulti
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
            value={companiesParticipating}
            placeholder=""
            onChange={(value: any) => {
              setCompaniesParticipating(value);
            }}
            classNamePrefix="select"
            isClearable={false}
            name="companiesParticipating"
            options={Companies}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Cost Breakdown</Text>
          <Table
            shouldUpdateScroll={false}
            hover={false}
            autoHeight
            rowHeight={65}
            data={costBreakdown}
          >
            <Column width={300} resizable>
              <HeaderCell>Company Name</HeaderCell>
              <Cell dataKey="companyName">
                {(rowData, index) => (
                  <Input
                    value={rowData.companyName}
                    onChange={(event) => {
                      var temp = [...costBreakdown];
                      temp[index].companyName = event.target.value;
                      setCostBreakdown(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>

            <Column width={150} resizable>
              <HeaderCell>Company Code</HeaderCell>
              <Cell dataKey="companyCode">
                {(rowData, index) => (
                  <Input
                    value={rowData.companyCode}
                    onChange={(event) => {
                      var temp = [...costBreakdown];
                      temp[index].companyCode = event.target.value;
                      setCostBreakdown(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>

            <Column width={100} resizable>
              <HeaderCell>Country</HeaderCell>
              <Cell dataKey="country">
                {(rowData, index) => (
                  <Input
                    value={rowData.country}
                    onChange={(event) => {
                      var temp = [...costBreakdown];
                      temp[index].country = event.target.value;
                      setCostBreakdown(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>

            <Column width={250} resizable>
              <HeaderCell>Contact Person's Email</HeaderCell>
              <Cell dataKey="contactEmail">
                {(rowData, index) => (
                  <Input
                    value={rowData.contactEmail}
                    onChange={(event) => {
                      var temp = [...costBreakdown];
                      temp[index].contactEmail = event.target.value;
                      setCostBreakdown(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>

            <Column width={200} resizable>
              <HeaderCell>Local Project Number</HeaderCell>
              <Cell dataKey="projectNumber">
                {(rowData, index) => (
                  <Input
                    value={rowData.projectNumber}
                    onChange={(event) => {
                      var temp = [...costBreakdown];
                      temp[index].projectNumber = event.target.value;
                      setCostBreakdown(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={150} resizable>
              <HeaderCell>Budget Contribution</HeaderCell>
              <Cell dataKey="contribution">
                {(rowData, index) => (
                  <Input
                    value={rowData.contribution}
                    onChange={(event) => {
                      var temp = [...costBreakdown];
                      temp[index].contribution = event.target.value;
                      setCostBreakdown(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={200} resizable>
              <HeaderCell>Total Estimated Costs</HeaderCell>
              <Cell dataKey="estimatedCosts">
                {(rowData, index) => (
                  <Input
                    value={rowData.estimatedCosts}
                    onChange={(event) => {
                      var temp = [...costBreakdown];
                      temp[index].estimatedCosts = event.target.value;
                      setCostBreakdown(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={200} resizable>
              <HeaderCell>Vendor Budget Currency</HeaderCell>
              <Cell dataKey="budgetCurrency">
                {(rowData, index) => (
                  <Select
                    styles={{
                      menu: (provided) => ({
                        ...provided,
                        zIndex: 1000000000,
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
                    menuPortalTarget={document.body}
                    value={rowData.budgetCurrency}
                    onChange={(value) => {
                      var temp = [...costBreakdown];
                      temp[index].budgetCurrency = value;
                      setCostBreakdown(temp);
                    }}
                    placeholder=""
                    classNamePrefix="select"
                    isClearable={false}
                    name="budgetCurrency"
                    options={ExchangeRates}
                  />
                )}
              </Cell>
            </Column>
            <Column width={200} resizable>
              <HeaderCell>Vendor Budget Amount</HeaderCell>
              <Cell dataKey="budgetAmount">
                {(rowData, index) => (
                  <Input
                    value={rowData.budgetAmount}
                    onChange={(event) => {
                      var temp = [...costBreakdown];
                      temp[index].budgetAmount = event.target.value;
                      setCostBreakdown(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={200} resizable>
              <HeaderCell>Vendor Budget in LC</HeaderCell>
              <Cell dataKey="localBudget">
                {(rowData, index) => (
                  <Input
                    value={rowData.localBudget}
                    onChange={(event) => {
                      var temp = [...costBreakdown];
                      temp[index].localBudget = event.target.value;
                      setCostBreakdown(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={200} resizable>
              <HeaderCell>Vendor Budget in EUR</HeaderCell>
              <Cell dataKey="eurBudget">
                {(rowData, index) => (
                  <Input
                    value={rowData.eurBudget}
                    onChange={(event) => {
                      var temp = [...costBreakdown];
                      temp[index].eurBudget = event.target.value;
                      setCostBreakdown(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={100} resizable>
              <HeaderCell>Share %</HeaderCell>
              <Cell dataKey="share">
                {(rowData, index) => (
                  <Input disabled defaultValue={rowData.share} />
                )}
              </Cell>
            </Column>
            <Column width={300} resizable>
              <HeaderCell>Vendor Estimated Costs in CC</HeaderCell>
              <Cell dataKey="estimatedCostsCC">
                {(rowData, index) => (
                  <Input disabled defaultValue={rowData.estimatedCostsCC} />
                )}
              </Cell>
            </Column>
            <Column width={300} resizable>
              <HeaderCell>Vendor Estimated Costs in LC</HeaderCell>
              <Cell dataKey="estimatedCostsLC">
                {(rowData, index) => (
                  <Input disabled defaultValue={rowData.estimatedCostsLC} />
                )}
              </Cell>
            </Column>
            <Column width={300} resizable>
              <HeaderCell>Vendor Estimated Costs in EUR</HeaderCell>
              <Cell dataKey="estimatedCostsEUR">
                {(rowData, index) => (
                  <Input disabled defaultValue={rowData.estimatedCostsEUR} />
                )}
              </Cell>
            </Column>
            <Column width={300} resizable>
              <HeaderCell>Net Profit Target in Vendor Currency</HeaderCell>
              <Cell dataKey="netProfitTargetVC">
                {(rowData, index) => (
                  <Input disabled defaultValue={rowData.netProfitTargetVC} />
                )}
              </Cell>
            </Column>
            <Column width={300} resizable>
              <HeaderCell>Net Profit Target in LC</HeaderCell>
              <Cell dataKey="netProfitTargetLC">
                {(rowData, index) => (
                  <Input disabled defaultValue={rowData.netProfitTargetLC} />
                )}
              </Cell>
            </Column>
            <Column width={300} resizable>
              <HeaderCell>Net Profit Target in EUR</HeaderCell>
              <Cell dataKey="netProfitTargetEUR">
                {(rowData, index) => (
                  <Input disabled defaultValue={rowData.netProfitTargetEUR} />
                )}
              </Cell>
            </Column>
          </Table>
        </Box>
        <Box w="100%">
          <Text mb="8px">Comments</Text>
          <Textarea
            value={comments}
            onChange={(event) => {
              setComments(event.target.value);
            }}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
            size="md"
            resize={"vertical"}
            rows={5}
          />
        </Box>
      </VStack>
      <Button
        float="right"
        mb={"80px"}
        color={"white"}
        bg={useColorModeValue("blue.400", "#4D97E2")}
        _hover={{
          bg: useColorModeValue("blue.300", "#377bbf"),
        }}
        onClick={() => {
          var projectId = "619515b754e61c8dd33daa52";

          var parent: Submission = {
            project: projectId,
            title: campaignName,
            parentId: null,
            created: new Date(),
            updated: new Date(),
            status: "New",
            author: requestorsName,
            data: {
              requestorsCompanyName: requestorsCompanyName.label,
              companyCode: requestorsCompanyName.value.code,
              requestorsCountry: requestorsCompanyName.value.country,
              campaignName: campaignName,
              campaignDescription: campaignDescription,
              targetAudience: targetAudience,
              campaignChannel: campaignChannel.label,
              year: year.label,
              projectStartQuarter: projectStartQuarter.label,
              projectNumber: projectNumber,
              requestorsName: requestorsName,
              projectApprover: "",
              projectApproval: projectApproval,
              manufacturersFiscalQuarter: fiscalQuarter.label,
              campaignStartDate:
                startDate === null ? null : startDate.toString(),
              campaignEndDate: endDate === null ? null : endDate.toString(),
              budgetSource: budgetSource.label,
              budgetApprovedByVendor: budgetApprovedByVendor,
              campaignBudgetsCurrency: exchangeRates.label,
              campaignEstimatedIncomeBudgetsCurrency: parseFloat(
                estimatedIncomeBudgetCurrency
              ),
              campaignEstimatedCostsBudgetsCurrency: parseFloat(
                estimatedCostsBudgetCurrency
              ),
              campaignNetProfitTargetBudgetsCurrency: parseFloat(
                netProfitTargetBudgetCurrency
              ),
              campaignEstimatedIncomeEur: parseFloat(estimatedIncome),
              campaignEstimatedCostsEur: parseFloat(estimatedCosts),
              campaignNetProfitTargetEur: parseFloat(netProfitTarget),
              totalEstimatedCostsCC: parseFloat(totalEstimatedCostsCC),
              totalEstimatedCostsLC: parseFloat(totalEstimatedCostsLC),
              totalEstimatedCostsEur: parseFloat(totalEstimatedCostsEur),
              comments: comments,
              projectType: "Regional Multi Vendor",
            },
          };
          var children: Submission[] = [];
          vendors.map((vendor: any) => {
            children.push({
              project: projectId,
              title: "",
              parentId: "",
              created: new Date(),
              updated: new Date(),
              status: "New",
              author: requestorsName,
              data: {
                vendorName: vendor.vendor,
                productionProjectManager: vendor.projectManager,
                sapCreditorNumber: vendor.creditor,
                sapDebitorNumber: vendor.debitor,
                manufacturerNumber: vendor.manufacturer,
                bu: vendor.bu,
                ph1: vendor.ph.label,
              },
            });
          });
          costBreakdown.map((vendor: any) => {
            children.push({
              project: projectId,
              title: "",
              parentId: "",
              created: new Date(),
              updated: new Date(),
              status: "New",
              author: requestorsName,
              data: {
                companyName: vendor.companyName,
                companyCode: vendor.companyCode,
                country: vendor.country,
                cbcontactEmail: vendor.contactEmail,
                projectNumber: vendor.projectNumber,
                countryBudgetContributionEur: vendor.contribution,
                countryCostEstimationEur: vendor.estimatedCosts,
                budgetCurrency: vendor.budgetCurrency.label,
                cbbudgetAmount: parseFloat(vendor.budgetAmount),
                cbbudgetLC: parseFloat(vendor.localBudget),
                cbbudgetEur: parseFloat(vendor.eurBudget),
                countryShare: parseFloat(vendor.share),
                cbestimatedCostsCC: parseFloat(vendor.estimatedCostsCC),
                cbestimatedCostsLC: parseFloat(vendor.estimatedCostsLC),
                estimatedCostsEur: parseFloat(vendor.estimatedCostsEUR),
                cbnetProfitTargetVC: parseFloat(vendor.netProfitTargetVC),
                cbnetProfitTargetLC: parseFloat(vendor.netProfitTargetLC),
                estimatedResultEur: parseFloat(vendor.netProfitTargetEUR),
              },
            });
          });
          var submission: SubmissionWithChildren = {
            submission: parent,
            children,
          };
          RestAPI.createSubmissionWithChildren(submission).then((response) => {
            console.log(response.data);
            props.history.push("/vendors");
          });
        }}
      >
        Submit
      </Button>
    </Box>
  );
}
