/* eslint-disable react-hooks/rules-of-hooks */
import React, { useReducer } from "react";
import { useEffect, useState } from "react";
import {
  useColorModeValue,
  Input,
  Box,
  VStack,
  Text,
  HStack,
  Textarea,
  Button,
} from "@chakra-ui/react";
import Project from "../../types/project";
import Select from "react-select";
import { getAccountInfo } from "../../utils/MsGraphApiCall";
import DatePicker from "react-datepicker";
import isEqual from "lodash/isEqual";

import { Table, Uploader } from "rsuite";
import { Submission, SubmissionWithChildren } from "../../types/submission";
import { RestAPI } from "../../api/rest";

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

export default function Elov(props: Props) {
  const [requestorsCompanyName, setRequestorsCompanyName] = useState<any>({
    label: "",
    value: { name: "", code: "", country: "" },
  });
  const [localExchangeRate, setLocalExchangeRate] = useState(0.0);
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
  const [projectName, setProjectName] = useState("");
  const [serviceProvider, setServiceProvider] = useState("");
  const [estimatedCostsBudgetCurrency, setEstimatedCostsBudgetCurrency] =
    useState("");
  const [netProfitTargetBudgetCurrency, setNetProfitTargetBudgetCurrency] =
    useState("");
  const [estimatedIncome, setEstimatedIncome] = useState("");
  const [estimatedCosts, setEstimatedCosts] = useState("");
  const [netProfitTarget, setNetProfitTarget] = useState("");
  const [companiesParticipating, setCompaniesParticipating] = useState<any>([]);
  const [comments, setComments] = useState("");
  const [vendor, setVendor] = useState<any>({});
  const [costBreakdown, setCostBreakdown] = useState<any>([]);

  const [totalVendorBudgetInLC, setTotalVendorBudgetInLC] = useState(0);
  const [totalVendorBudgetInEUR, setTotalVendorBudgetInEUR] = useState(0);

  const [totalEstimatedCostsLC, setTotalEstimatedCostsLC] = useState("");
  const [services, setServices] = useState<any>([]);

  const [render, rerender] = useState(0);

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
  }

  useEffect(() => {
    getAccountInfo().then((response) => {
      if (response) {
        setRequestorsName(response.displayName);
      }
    });
    fetchDropdowns().then(() => forceUpdate());
  }, []);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);

  return (
    <Box>
      <VStack spacing="20px" mb={"40px"} align="start">
        <Box w="100%">
          <Text mb="8px">Requestor`s Company Name</Text>
          <Select
            menuPortalTarget={document.body}
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
              var ler = 0.0;
              ExchangeRates.forEach((rate) => {
                if (rate.label === value.value.currency) {
                  ler = parseFloat(rate.value);
                }
              });
              setLocalExchangeRate(ler);
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

        <Box w="100%">
          <Text mb="8px">Project Number</Text>
          <Input
            placeholder="____________"
            value={projectNumber}
            onChange={(event) => {
              if (event.target.value.length < 13) {
                setProjectNumber(event.target.value);
              }
            }}
            // disabled
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Project Name</Text>
          <Input
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            // disabled
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>

        <Box w="100%">
          <Text mb="8px">Vendors</Text>
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
            value={vendorsNames}
            placeholder=""
            onChange={(value: any) => {
              setVendorsNames(value);
            }}
            classNamePrefix="select"
            isClearable={false}
            name="vendorsNames"
            isMulti
            options={VendorsNames}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Service Provider</Text>
          <Input
            value={serviceProvider}
            onChange={(event) => setServiceProvider(event.target.value)}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Services</Text>
          <Table
            shouldUpdateScroll={false}
            hover={false}
            autoHeight
            rowHeight={65}
            data={services}
          >
            <Column width={200} resizable>
              <HeaderCell>Service Type</HeaderCell>
              <Cell dataKey="serviceType">
                {(rowData, index) => (
                  <Input
                    value={rowData.serviceType}
                    onChange={(event) => {
                      var temp = [...services];
                      temp[index].serviceType = event.target.value;
                      setServices(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={200} resizable>
              <HeaderCell>Net Value (LC Currency)</HeaderCell>
              <Cell dataKey="netValueLC">
                {(rowData, index) => (
                  <Input
                    value={rowData.netValueLC}
                    onChange={(event) => {
                      var temp = [...services];
                      temp[index].netValueLC = event.target.value;
                      setServices(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={200} resizable>
              <HeaderCell>Local Currency</HeaderCell>
              <Cell dataKey="localCurrency">
                {(rowData, index) => (
                  <Input
                    value={rowData.localCurrency}
                    onChange={(event) => {
                      var temp = [...services];
                      temp[index].localCurrency = event.target.value;
                      setServices(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={200} resizable>
              <HeaderCell>Net Value (Purchase Order Currency)</HeaderCell>
              <Cell dataKey="netValuePO">
                {(rowData, index) => (
                  <Input
                    value={rowData.netValuePO}
                    onChange={(event) => {
                      var temp = [...services];
                      temp[index].netValuePO = event.target.value;
                      setServices(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={200} resizable>
              <HeaderCell>Purchase Order Currency Code</HeaderCell>
              <Cell dataKey="poCurrencyCode">
                {(rowData, index) => (
                  <Input
                    value={rowData.poCurrencyCode}
                    onChange={(event) => {
                      var temp = [...services];
                      temp[index].poCurrencyCode = event.target.value;
                      setServices(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={200} resizable>
              <HeaderCell>Net Value (EUR)</HeaderCell>
              <Cell dataKey="netValueEUR">
                {(rowData, index) => (
                  <Input
                    value={rowData.netValueEUR}
                    onChange={(event) => {
                      var temp = [...services];
                      temp[index].netValueEUR = event.target.value;
                      setServices(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={200} resizable>
              <HeaderCell>External Purchase Order Number</HeaderCell>
              <Cell dataKey="externalPurchaseOrderNumber">
                {(rowData, index) => (
                  <Input
                    value={rowData.externalPurchaseOrderNumber}
                    onChange={(event) => {
                      var temp = [...services];
                      temp[index].externalPurchaseOrderNumber =
                        event.target.value;
                      setServices(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={200} resizable>
              <HeaderCell>Purchase Order Date</HeaderCell>
              <Cell dataKey="purchaseOrderDate">
                {(rowData, index) => (
                  <Input
                    value={rowData.purchaseOrderDate}
                    onChange={(event) => {
                      var temp = [...services];
                      temp[index].purchaseOrderDate = event.target.value;
                      setServices(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={200} resizable>
              <HeaderCell>
                Name of Person Ordering the Service (ALSO)
              </HeaderCell>
              <Cell dataKey="orderingPerson">
                {(rowData, index) => (
                  <Input
                    value={rowData.orderingPerson}
                    onChange={(event) => {
                      var temp = [...services];
                      temp[index].orderingPerson = event.target.value;
                      setServices(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={200} resizable>
              <HeaderCell>
                Name of Person Approving the Purchase Order (ALSO)
              </HeaderCell>
              <Cell dataKey="approvingPerson">
                {(rowData, index) => (
                  <Input
                    value={rowData.approvingPerson}
                    onChange={(event) => {
                      var temp = [...services];
                      temp[index].approvingPerson = event.target.value;
                      setServices(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={200} resizable>
              <HeaderCell>Contact Person from Service Provider Side</HeaderCell>
              <Cell dataKey="contactPerson">
                {(rowData, index) => (
                  <Input
                    value={rowData.contactPerson}
                    onChange={(event) => {
                      var temp = [...services];
                      temp[index].contactPerson = event.target.value;
                      setServices(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
            <Column width={200} resizable>
              <HeaderCell>
                Contact Details of Person from Service Provider Side (e-mail,
                phone)
              </HeaderCell>
              <Cell dataKey="contactDetails">
                {(rowData, index) => (
                  <Input
                    value={rowData.contactDetails}
                    onChange={(event) => {
                      var temp = [...services];
                      temp[index].contactDetails = event.target.value;
                      setServices(temp);
                    }}
                  />
                )}
              </Cell>
            </Column>
          </Table>
          <Button
            float="right"
            marginTop="20px"
            onClick={() => {
              var temp = [...services];
              temp.push({});
              setServices(temp);
            }}
          >
            add
          </Button>
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
          var projectId = "62610ab73a88d397b05cea12";

          var parent: Submission = {
            project: projectId,
            title: campaignName,
            parentId: null,
            group: null,
            created: new Date(),
            updated: new Date(),
            status: "New",
            author: requestorsName,
            data: {
              // requestorsCompanyName: requestorsCompanyName.label,
              // companyCode: requestorsCompanyName.value.code,
              // requestorsCountry: requestorsCompanyName.value.country,
              // campaignName: campaignName,
              // campaignDescription: campaignDescription,
              // targetAudience: targetAudience,
              // campaignChannel: campaignChannel.label,
              // year: year.label,
              // projectStartQuarter: projectStartQuarter.label,
              // projectNumber: projectNumber,
              // requestorsName: requestorsName,
              // projectApprover: "",
              // projectApproval: projectApproval,
              // manufacturersFiscalQuarter: fiscalQuarter.label,
              // campaignStartDate:
              //   startDate === null ? null : startDate.toString(),
              // campaignEndDate: endDate === null ? null : endDate.toString(),
              // budgetSource: budgetSource.label,
              // budgetApprovedByVendor: budgetApprovedByVendor,
              // campaignBudgetsCurrency: exchangeRates.label,
              // campaignEstimatedIncomeBudgetsCurrency: parseFloat(
              //   estimatedIncomeBudgetCurrency
              // ),
              // campaignEstimatedCostsBudgetsCurrency: parseFloat(
              //   estimatedCostsBudgetCurrency
              // ),
              // campaignNetProfitTargetBudgetsCurrency: parseFloat(
              //   netProfitTargetBudgetCurrency
              // ),
              // campaignEstimatedIncomeEur: parseFloat(estimatedIncome),
              // campaignEstimatedCostsEur: parseFloat(estimatedCosts),
              // campaignNetProfitTargetEur: parseFloat(netProfitTarget),
              // totalEstimatedCostsLC: parseFloat(totalEstimatedCostsLC),
              comments: comments,
              projectType: "Purchase Order Request",
            },
          };
          var children: Submission[] = [];

          var submission: SubmissionWithChildren = {
            submission: parent,
            children,
          };
          RestAPI.createSubmissionWithChildren(submission).then((response) => {
            props.history.push("/vendors");
          });
        }}
      >
        Submit
      </Button>
    </Box>
  );
}
