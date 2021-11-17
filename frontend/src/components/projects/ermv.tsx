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

import "react-datepicker/dist/react-datepicker.css";
import { Table } from "rsuite";

const PH1 = require("./ph.json");
const Companies = require("./companies.json");
const VendorsNames = require("./vendors.json");
const CampaignChannel = require("./campaignChannel.json");
const TargetAudience = require("./targetAudience.json");
const Budget = require("./budget.json");
const ExchangeRates = require("./exchangeRates.json");

const { Column, HeaderCell, Cell } = Table;

export const ErmvProject = {
  id: "european-regional-multi-vendor",
  title: "Regional Multi Vendor",
  created: new Date("2021-11-13 23:11"),
  updated: new Date("2021-11-15 16:31"),
  author: "sk@innovatio.lv",
  description:
    "European Regional Multi Vendor Form. Contact administrator if anything works incorrectly. Form is still under development and will be released soon. Form is available only for administrator accounts, visit formiks.innovatio.dev if you are looking for old version.",
  statuses: ["New", "In Progress", "Completed", "On Hold", "Cancelled"],
  defaultStatus: "New",
  tags: ["dev", "testing", "marketing", "european regional"],
  roles: ["administrator"],
  components: [],
  type: "code",
  code: "",
} as Project;

interface Props {
  //   onSubmit: any;
}

export default function CreateBookmark(props: Props) {
  const [requestorsCompanyName, setRequestorsCompanyName] = useState<any>({
    label: "",
    value: { name: "", code: "", country: "" },
  });
  const [campaignName, setCampaignName] = useState("");
  const [campaignDescription, setCampaignDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [campaignChannel, setCampaignChannel] = useState("");
  const [vendorsNames, setVendorsNames] = useState<any>([]);
  const [ph, setPh] = useState<any>({
    label: "",
    value: "",
  });
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

  useEffect(() => {
    getAccountInfo().then((response) => {
      if (response) {
        setRequestorsName(response.mail);
      }
    });
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
        ph: "",
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
        (campaignChannel === "" ? "?" : campaignChannel) +
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
        row.share = (share * 100).toFixed(2).toString();

        if (!isNaN(totalCostsCC)) {
          row.estimatedCostsCC = (share * totalCostsCC).toFixed(2).toString();
        }
        if (!isNaN(totalCostsLC)) {
          row.estimatedCostsLC = (share * totalCostsLC).toFixed(2).toString();
        }
        if (!isNaN(totalCostsEur)) {
          row.estimatedCostsEUR = (share * totalCostsEur).toFixed(2).toString();
        }
        var vendorCurr = parseFloat(row.budgetCurrency.value);
        if (!isNaN(netProfitEur)) {
          row.netProfitTargetEUR = (share * netProfitEur).toFixed(2).toString();
          if (!isNaN(vendorCurr)) {
            row.netProfitTargetVC = (vendorCurr * (share * netProfitEur))
              .toFixed(2)
              .toString();
          }
        }
        if (!isNaN(netProfiLC)) {
          row.netProfitTargetLC = (share * netProfiLC).toFixed(2).toString();
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
              setTargetAudience(value.value);
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
              setCampaignChannel(value.value);
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
                  <Input
                    value={rowData.ph}
                    onChange={(event) => {
                      var temp = [...vendors];
                      temp[index].ph = event.target.value;
                      setVendors(temp);
                    }}
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
            options={[
              { label: "2019", value: "19" },
              { label: "2020", value: "20" },
              { label: "2021", value: "21" },
            ]}
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
            options={[
              { label: "Q1 (Jan. - March)", value: "Q1" },
              { label: "Q2 (April - June)", value: "Q2" },
              { label: "Q3 (July - Sep.)", value: "Q3" },
              { label: "Q4 (Oct. - Dec.)", value: "Q4" },
            ]}
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
            options={[
              { label: "Q1", value: "Q1" },
              { label: "Q2", value: "Q2" },
              { label: "Q3", value: "Q3" },
              { label: "Q4", value: "Q4" },
            ]}
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
        onClick={() => {}}
      >
        Submit
      </Button>
    </Box>
  );
}
