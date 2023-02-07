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
  AlertTitle,
  AlertDescription,
  AlertIcon,
  Alert,
} from "@chakra-ui/react";
import Project from "../../types/project";
import Select from "react-select";
import { getAccountInfo } from "../../utils/MsGraphApiCall";
import isEqual from "lodash/isEqual";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import Toast from "../../components/Toast";
import { Table, Uploader } from "rsuite";
import { Submission, SubmissionWithChildren } from "../../types/submission";
import { RestAPI } from "../../api/rest";
import { isDisabled } from "@chakra-ui/utils";

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
  isDraft?: boolean;
  children?: any[];
  submission?: any;
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
  const [inputErrors, setInputErrors] = useState<string[]>([]);
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

  function submissionValidation(submission: SubmissionWithChildren) {
    var fieldKeys: string[] = [];
    var nonMandatoryFields: string[] = [
      "targetAudience",
      "projectApprover",
      "totalEstimatedCostsLC",
      "projectApproval",
      "creditorNumber",
      "manufacturersFiscalQuarter",
      "comments",
      "productionProjectManager",
      "additionalInformation",
      "status",
      "campaignDescription",
      "debitorNumber",
      "manufacturerNumber",
      "PH1",
    ];
    var sub = submission.submission;
    var vendor = submission.children.filter((el) => el.group === "vendor")[0];
    Object.keys(sub.data).forEach((key: any) => {
      if (!nonMandatoryFields.includes(key)) {
        switch (typeof sub.data[key]) {
          case "number":
            if (isNaN(sub.data[key])) {
              fieldKeys.push(key);
            }
            break;
          case "object":
            if (sub.data[key] === null) {
              fieldKeys.push(key);
            }
            break;
          case "string":
            if (sub.data[key] === "") {
              fieldKeys.push(key);
            }
            break;
          case "undefined":
            fieldKeys.push(key);
            break;
        }
      }
    });
    Object.keys(vendor.data).forEach((key: any) => {
      if (!nonMandatoryFields.includes(key)) {
        switch (typeof vendor.data[key]) {
          case "number":
            if (isNaN(vendor.data[key])) {
              fieldKeys.push(key);
            }
            break;
          case "object":
            if (vendor.data[key] === null) {
              fieldKeys.push(key);
            }
            break;
          case "string":
            if (vendor.data[key] === "") {
              fieldKeys.push(key);
            }
            break;
          case "undefined":
            fieldKeys.push(key);
            break;
        }
      }
    });
    console.log(fieldKeys);
    setInputErrors(fieldKeys);
    return fieldKeys;
  }

  function createSubmission(draft: boolean) {
    var projectId = "62610ab73a88d397b05cea12";
    var parent: Submission = {
      project: projectId,
      parentId: null,
      viewId: null,
      group: null,
      title: campaignName,
      status: "New",
      created: new Date(),
      updated: new Date(),
      author: requestorsName,
      data: {
        status: "New",
        requestorsCompanyName: requestorsCompanyName.label,
        companyCode: requestorsCompanyName.value.code,
        requestorsCountry: requestorsCompanyName.value.country,
        campaignName: campaignName,
        projectName: campaignName,
        serviceProvider: serviceProvider,
        vendor: vendorsNames[0],
      },
    };
    var children: Submission[] = [];

    var submission: SubmissionWithChildren = {
      submission: parent,
      children,
      local: null,
    };

    if (props.isDraft) {
      if (draft) {
        submission.submission.id = props.submission.id;

        RestAPI.updateDraft(submission).then((response) => {
          toast(
            <Toast
              title={"Draft save"}
              message={`Draft has been successfully saved.`}
              type={"info"}
            />
          );
        });
      } else {
        if (submissionValidation(submission).length !== 0) {
          toast(
            <Toast
              title={"Mandatory fields are not filled"}
              message={"not all fields that are required were provided"}
              type={"error"}
            />
          );
          return;
        }
        RestAPI.deleteDraft(props.submission.id).then(() => {
          RestAPI.createSubmissionWithChildren(submission).then((response) => {
            if (response.data.hasChanged) {
              toast(
                <Toast
                  title={"Project Number has been adjusted"}
                  message={
                    <p>
                      Project Number changed to:{" "}
                      <b>{response.data.submission.data.projectNumber}</b>
                    </p>
                  }
                  type={"info"}
                />
              );
            }
            toast(
              <Toast
                title={"Project has been transferred"}
                message={
                  <p>
                    Project ({" "}
                    <b>{response.data.submission.data.projectNumber}</b> ) has
                    been transferred into the tool
                  </p>
                }
                type={"success"}
              />
            );
            props.history.push("/submissions");
          });
        });
      }
    } else {
      if (draft) {
        RestAPI.createDraft(submission).then((response) => {
          toast(
            <Toast
              title={"Draft save"}
              message={`Draft has been successfully saved.`}
              type={"info"}
            />
          );
        });
      } else {
        if (submissionValidation(submission).length !== 0) {
          toast(
            <Toast
              title={"Mandatory fields are not filled"}
              message={"not all fields that are required were provided"}
              type={"error"}
            />
          );
          return;
        }
        RestAPI.createSubmissionWithChildren(submission).then((response) => {
          if (response.data.hasChanged) {
            toast(
              <Toast
                title={"Project Number has been adjusted"}
                message={
                  <p>
                    Project Number changed to:{" "}
                    <b>{response.data.submission.data.projectNumber}</b>
                  </p>
                }
                type={"info"}
              />
            );
          }
          toast(
            <Toast
              title={"Project has been transferred"}
              message={
                <p>
                  Project ( <b>{response.data.submission.data.projectNumber}</b>{" "}
                  ) has been transferred into the tool
                </p>
              }
              type={"success"}
            />
          );
          props.history.push("/submissions");
        });
      }
    }
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

  useEffect(() => {
    console.log(props.submission);
    if (props.submission) {
      setProjectName(props.submission.data.requestorsCompanyName ?? "");
    }
  }, [props.submission]);
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
        <Alert
          status="error"
          display={
            requestorsCompanyName.value.code !== "6110" &&
            requestorsCompanyName.value.code !== ""
              ? "flex"
              : "none"
          }
        >
          <AlertIcon />
          <AlertTitle>Please change Requestor`s Company Name!</AlertTitle>
          <AlertDescription>
            Currently, only companies with '6110' code are allowed ('ALSO
            Schweiz AG')
          </AlertDescription>
        </Alert>

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
                      temp[index!].serviceType = event.target.value;
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
                      temp[index!].netValueLC = event.target.value;
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
                      label: rowData.localCurrency,
                      value: rowData.localCurrency,
                    }}
                    onChange={(value) => {
                      var temp = [...services];
                      temp[index!].localCurrency =
                        value === null ? "" : value.label;
                      setServices(temp);
                    }}
                    placeholder=""
                    classNamePrefix="select"
                    isClearable={false}
                    name="localCurrency"
                    options={ExchangeRates}
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
                      temp[index!].netValuePO = event.target.value;
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
                      label: rowData.poCurrencyCode,
                      value: rowData.poCurrencyCode,
                    }}
                    onChange={(value) => {
                      var temp = [...services];
                      temp[index!].poCurrencyCode =
                        value === null ? "" : value.label;
                      setServices(temp);
                    }}
                    placeholder=""
                    classNamePrefix="select"
                    isClearable={false}
                    name="poCurrencyCode"
                    options={ExchangeRates}
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
                      temp[index!].netValueEUR = event.target.value;
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
                      temp[index!].externalPurchaseOrderNumber =
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
                  <DatePicker
                    portalId="root-portal"
                    isClearable={false}
                    selected={rowData.purchaseOrderDate}
                    customInput={<Input value={rowData.purchaseOrderDate} />}
                    onChange={(date) => {
                      var temp = [...services];
                      temp[index!].purchaseOrderDate = date;
                      setServices(temp);
                    }}
                    dateFormat="dd.MM.yyyy"
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
                      temp[index!].orderingPerson = event.target.value;
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
                      temp[index!].approvingPerson = event.target.value;
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
                      temp[index!].contactPerson = event.target.value;
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
                      temp[index!].contactDetails = event.target.value;
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
        // onClick={() => {
        //   var projectId = "62610ab73a88d397b05cea12";

        //   var parent: Submission = {
        //     project: projectId,
        //     title: campaignName,
        //     parentId: null,
        //     group: null,
        //     created: new Date(),
        //     updated: new Date(),
        //     status: "New",
        //     author: requestorsName,
        //     data: {
        //       purchaseOrderServiceProvider: serviceProvider,
        //       requestorsCompanyName: requestorsCompanyName.label,
        //       companyCode: requestorsCompanyName.value.code,
        //       requestorsCountry: requestorsCompanyName.value.country,
        //       campaignName: campaignName,
        //       projectNumber: projectNumber,
        //       projectName: projectName,
        //       comments: comments,
        //       projectType: "Purchase Order Request",
        //     },
        //   };
        //   var children: Submission[] = [];

        //   services.forEach((service: any) => {
        //     children.push({
        //       project: projectId,
        //       title: "",
        //       parentId: "",
        //       group: "vendor",
        //       created: new Date(),
        //       updated: new Date(),
        //       status: "New",
        //       author: requestorsName,
        //       data: {
        //         netValueOfServiceOrderedLC: service.netValueLC,
        //         localCurrency: service.localCurrency,
        //         netValuePOC: service.netValuePO,
        //         purchaseOrderCurrency: service.poCurrencyCode,
        //         netValueEur: service.netValueEUR,
        //       },
        //     });
        //   });

        //   var submission: SubmissionWithChildren = {
        //     submission: parent,
        //     children,
        //   };
        //   RestAPI.createSubmissionWithChildren(submission).then((response) => {
        //     props.history.push("/submissions");
        //   });
        // }}
        onClick={async () => {
          RestAPI.getSubmissions().then((response) => {
            var subs = response.data;
            var targetId = "";
            for (let sub of subs) {
              if (
                sub.parentId === null &&
                sub.data.projectNumber === projectNumber
              ) {
                targetId = sub.id || "";
                break;
              }
            }
            if (targetId.length > 0) {
              RestAPI.updateSubmissionPartial(
                targetId,
                "data.purchaseOrderServiceProvider",
                serviceProvider
              );
              RestAPI.updateSubmissionPartial(
                targetId,
                "data.vendorNamePO",
                vendorsNames.map((v: any) => v.label).join(", ")
              );
              services.forEach(async (service: any) => {
                await RestAPI.createSubmission({
                  project: "62610ab73a88d397b05cea12",
                  title: "",
                  parentId: targetId,
                  viewId: null,
                  group: "vendor",
                  created: new Date(),
                  updated: new Date(),
                  status: "New",
                  author: requestorsName,
                  data: {
                    netValueOfServiceOrderedLC: service.netValueLC,
                    localCurrency: service.localCurrency,
                    netValuePOC: service.netValuePO,
                    purchaseOrderCurrency: service.poCurrencyCode,
                    netValueEur: service.netValueEUR,
                  },
                });
              });
              setTimeout(() => {
                props.history.push("/submissions");
              }, 2000);
            }
          });
        }}
        isDisabled={requestorsCompanyName.value.code !== "6110"}
      >
        Submit
      </Button>
      <Button
        float="right"
        mr="15px"
        color={"white"}
        bg={useColorModeValue("blue.400", "#4D97E2")}
        _hover={{
          bg: useColorModeValue("blue.300", "#377bbf"),
        }}
        onClick={() => {
          createSubmission(true);
        }}
      >
        {props.isDraft ? "Save to draft" : "Save to draft"}
      </Button>
    </Box>
  );
}
