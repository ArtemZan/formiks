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
import { DefaultSelectStyles } from "../../utils/Styles";
import isEqual from "lodash/isEqual";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import Toast from "../../components/Toast";
import { Table, Uploader } from "rsuite";
import { Submission, SubmissionWithChildren } from "../../types/submission";
import { RestAPI } from "../../api/rest";
import { isDisabled } from "@chakra-ui/utils";
import { SubscriptionManager } from "framer-motion/types/utils/subscription-manager";

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
  const [serviceType, setServiceType] = useState("");
  const [serviceNetValueLC, setServiceNetValueLC] = useState("");
  const [serviceLC, setServiceLC] = useState<any>({
    label: "",
    value: "",
  });
  const [serviceNetValuePOCurrency, setServiceNetValuePOCurrency] =
    useState("");
  const [servicePOCurrency, setServicePOCurrency] = useState<any>({
    label: "",
    value: "",
  });
  const [serviceNetValueEUR, setServiceNetValueEUR] = useState("");
  const [serviceExtPONumber, setServiceExtPONumber] = useState("");
  const [servicePODate, setServicePODate] = useState<any>(null);
  const [serviceOrderingPerson, setServiceOrderingPerson] = useState("");
  const [serviceApprovingPerson, setServiceApprovingPerson] = useState("");
  const [serviceContactPerson, setServiceContactPerson] = useState("");
  const [serviceContactDetails, setServiceContactDetails] = useState("");
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
  const [vensorNames, setVendorNames] = useState<any>([]);
  const [costBreakdown, setCostBreakdown] = useState<any>([]);

  const [totalVendorBudgetInLC, setTotalVendorBudgetInLC] = useState(0);
  const [totalVendorBudgetInEUR, setTotalVendorBudgetInEUR] = useState(0);

  const [totalEstimatedCostsLC, setTotalEstimatedCostsLC] = useState("");
  const [services, setServices] = useState<any>([]);
  const [submissions, setSubmissions] = useState<any>([]);
  const [sub, setSub] = useState<any>();

  const [render, rerender] = useState(0);

  async function fetchDropdowns() {
    var dropdownsIds: string[] = [
      "619b630a9a5a2bb37a93b23b",
      "619b61419a5a2bb37a93b237",
      "6391eea09a3d043b9a89d767",
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
    Object.keys(sub.data).forEach((key: any) => {
      if (!nonMandatoryFields.includes(key)) {
        switch (typeof sub.data[key]) {
          case "object":
            if (!sub.data[key]) {
              fieldKeys.push(key);
              break;
            }
            if (sub.data[key].length === 0) {
              fieldKeys.push(key);
            }
            break;
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
    setInputErrors(fieldKeys);
    return fieldKeys;
  }

  function createSubmission(draft: boolean) {
    var targetId = "";

    for (let sub of submissions) {
      if (sub.parentId === null && sub.data.projectNumber === projectNumber) {
        targetId = sub.id || "";
        break;
      }
    }
    var projectId = "62610ab73a88d397b05cea12";
    var parent: Submission = {
      project: projectId,
      title: "",
      parentId: targetId,
      viewId: null,
      group: "vendor",
      created: new Date(),
      updated: new Date(),
      status: "New",
      author: requestorsName,
      data: {
        projectNumber: projectNumber,
        projectName1: projectName,
        purchaseOrderStatus: "Invoice Not Received",
        servicePODate: servicePODate === null ? null : servicePODate.toString(),
        serviceType: serviceType,
        requestorsCompanyName: requestorsCompanyName.label,
        companyCode: requestorsCompanyName.value.code,
        requestorsCountry: requestorsCompanyName.value.country,
        netValueOfServiceOrderedLC: parseFloat(serviceNetValueLC),
        localCurrency: serviceLC.label,
        netValuePOC: parseFloat(serviceNetValuePOCurrency),
        purchaseOrderCurrency: servicePOCurrency.label,
        netValueEur: parseFloat(serviceNetValueEUR),
        vendorNamePO: vendorsNames.map((vendor: any) => vendor.label),
        comments: comments,
        serviceProvider: serviceProvider,
        serviceExtPONumber: serviceExtPONumber,
        serviceApprovingPerson: serviceApprovingPerson,
        serviceOrderingPerson: serviceOrderingPerson,
        serviceContactPerson: serviceContactPerson,
        serviceContactDetails: serviceContactDetails,

        purchaseOrderServiceProvider: serviceProvider,
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
          RestAPI.createSubmission(submission.submission).then((response) => {
            toast(
              <Toast
                title={"Purchase order  has been transferred"}
                message={
                  <p>Purchase order has been transferred into the tool</p>
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
        } else {
          RestAPI.createSubmission(submission.submission).then((response) => {
            toast(
              <Toast
                title={"Purchase order has been transferred"}
                message={
                  <p>Purchae order has been transferred into the tool</p>
                }
                type={"success"}
              />
            );
            props.history.push("/submissions");
          });
        }
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
    setVendorNames(VendorsNames);
    RestAPI.getSubmissions().then((response) => {
      var subs = response.data;
      if (subs.length > 0) {
        setSubmissions(subs);
      }
    });
  }, []);
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    if (props.submission) {
      setRequestorsCompanyName({
        label: props.submission.data.requestorsCompanyName ?? "",
        value: {
          name: props.submission.data.requestorsCompanyName ?? "",
          code: props.submission.data.companyCode ?? "",
          country: props.submission.data.requestorsCountry ?? "",
          currency: props.submission.data.localCurrency ?? "",
        },
      });
      setProjectName(props.submission.data.projectName1 ?? "");
      setCampaignName(props.submission.data.campaignName ?? "");
      setProjectNumber(props.submission.data.projectNumber ?? "");
      setVendorsNames(
        (props.submission.data.vendorNamePO ?? []).map((vendor: string) => {
          return { label: vendor, value: vendor };
        })
      );
      setServiceType(props.submission.data.serviceType ?? "");
      setServiceProvider(props.submission.data.serviceProvider ?? "");
      setServiceNetValueLC(
        props.submission.data.netValueOfServiceOrderedLC
          ? props.submission.data.netValueOfServiceOrderedLC.toFixed(2)
          : "0.00"
      );
      setServiceLC({
        label: props.submission.data.localCurrency ?? "",
        value: props.submission.data.localCurrency ?? "",
      });
      setServiceNetValuePOCurrency(
        props.submission.data.netValuePOC
          ? props.submission.data.netValuePOC.toFixed(2)
          : "0.00"
      );
      setServicePOCurrency({
        label: props.submission.data.purchaseOrderCurrency ?? "",
        value: props.submission.data.purchaseOrderCurrency ?? "",
      });
      setServiceNetValueEUR(
        props.submission.data.netValueEur
          ? props.submission.data.netValueEur
          : "0.00"
      );
      setServiceExtPONumber(props.submission.data.serviceExtPONumber ?? "");
      setServicePODate(
        props.submission.data.servicePODate === null
          ? null
          : new Date(props.submission.data.servicePODate) ?? null
      );
      setServiceOrderingPerson(
        props.submission.data.serviceOrderingPerson ?? ""
      );
      setServiceApprovingPerson(
        props.submission.data.serviceApprovingPerson ?? ""
      );
      setServiceContactPerson(props.submission.data.serviceContactPerson ?? "");
      setServiceContactDetails(
        props.submission.data.serviceContactDetails ?? ""
      );
      setComments(props.submission.data.comments ?? "");
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
                  setServiceLC(rate);
                }
              });
              // setServiceLC(ler);
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
            isInvalid={inputErrors.includes("projectNumber")}
            onChange={(event) => {
              if (event.target.value.length < 13) {
                setProjectNumber(event.target.value);
                if (event.target.value.length === 12) {
                  for (let sub of submissions) {
                    if (
                      sub.parentId === null &&
                      sub.data.projectNumber === event.target.value
                    ) {
                      var children: any[] = [];
                      var vendorNew: any[] = [];
                      for (let child of submissions) {
                        if (child.parentId === sub.id) {
                          children.push(child);

                          if (child.group === "vendor") {
                            vendorNew.push({
                              label: child.data.vendorName ?? "",
                              value: child.data.vendorName ?? "",
                            });
                          }
                        }
                      }
                      VendorsNames = vendorNew;
                      sub.children = children;
                      setSub(sub);
                      setProjectName(sub.data.projectName);
                      break;
                    }
                  }
                }
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
            isInvalid={inputErrors.includes("projectName1")}
            onChange={(event) => setProjectName(event.target.value)}
            // disabled
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>

        <Box w="100%">
          <Text mb="8px">Vendors</Text>
          <Select
            styles={DefaultSelectStyles(
              useColorModeValue,
              inputErrors.includes("vendorNamePO")
            )}
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
            isInvalid={inputErrors.includes("serviceProvider")}
            onChange={(event) => setServiceProvider(event.target.value)}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Service Type</Text>
          <Textarea
            value={serviceType}
            isInvalid={inputErrors.includes("serviceType")}
            onChange={(event) => setServiceType(event.target.value)}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
            size="md"
            resize={"vertical"}
            rows={5}
          />
        </Box>
        <HStack w="100%">
          <Box w="100%">
            <Text mb="8px">Net Value (LC Currency)</Text>
            <Input
              value={serviceNetValueLC}
              isInvalid={inputErrors.includes("netValueOfServiceOrderedLC")}
              onChange={(event) => setServiceNetValueLC(event.target.value)}
              bg={useColorModeValue("white", "#2C313C")}
              color={useColorModeValue("gray.800", "#ABB2BF")}
            />
          </Box>
          <Box w="100%">
            <Text mb="8px">Local Currency</Text>
            <Select
              menuPortalTarget={document.body}
              styles={DefaultSelectStyles(
                useColorModeValue,
                inputErrors.includes("localCurrency")
              )}
              theme={(theme) => ({
                ...theme,
                borderRadius: 6,
                colors: {
                  ...theme.colors,
                  primary: "#3082CE",
                },
              })}
              value={{
                label: serviceLC.label,
                value: serviceLC.value,
              }}
              onChange={(value) => {
                setServiceLC(value);
              }}
              placeholder=""
              classNamePrefix="select"
              isClearable={false}
              name="serviceLC"
              options={ExchangeRates}
            />
          </Box>
        </HStack>
        <HStack w="100%">
          <Box w="100%">
            <Text mb="8px">Net Value (Purchase Order Currency)</Text>
            <Input
              value={serviceNetValuePOCurrency}
              isInvalid={inputErrors.includes("netValuePOC")}
              onChange={(event) =>
                setServiceNetValuePOCurrency(event.target.value)
              }
              bg={useColorModeValue("white", "#2C313C")}
              color={useColorModeValue("gray.800", "#ABB2BF")}
            />
          </Box>
          <Box w="100%">
            <Text mb="8px">Purchase Order Currency Code</Text>
            <Select
              menuPortalTarget={document.body}
              styles={DefaultSelectStyles(
                useColorModeValue,
                inputErrors.includes("purchaseOrderCurrency")
              )}
              theme={(theme) => ({
                ...theme,
                borderRadius: 6,
                colors: {
                  ...theme.colors,
                  primary: "#3082CE",
                },
              })}
              value={{
                label: servicePOCurrency.label,
                value: servicePOCurrency.value,
              }}
              onChange={(value) => {
                setServicePOCurrency(value);
              }}
              placeholder=""
              classNamePrefix="select"
              isClearable={false}
              name="servicePOCurrency"
              options={ExchangeRates}
            />
          </Box>
        </HStack>
        <Box w="50%">
          <Text mb="8px">Net Value (EUR)</Text>
          <Input
            value={serviceNetValueEUR}
            isInvalid={inputErrors.includes("netValueEur")}
            onChange={(event) => setServiceNetValueEUR(event.target.value)}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <HStack w="100%">
          <Box w="100%">
            <Text mb="8px">External Purchase Order Number</Text>
            <Input
              value={serviceExtPONumber}
              isInvalid={inputErrors.includes("serviceExtPONumber")}
              onChange={(event) => setServiceExtPONumber(event.target.value)}
              bg={useColorModeValue("white", "#2C313C")}
              color={useColorModeValue("gray.800", "#ABB2BF")}
            />
          </Box>
          <Box w="100%">
            <Text mb="8px">Purchase Order Date</Text>
            <DatePicker
              customInput={
                <Input
                  isInvalid={inputErrors.includes("servicePODate")}
                  bg={useColorModeValue("white", "#2C313C")}
                  color={useColorModeValue("gray.800", "#ABB2BF")}
                />
              }
              selected={servicePODate}
              onChange={(date) => {
                setServicePODate(date);
              }}
              dateFormat="dd.MM.yyyy"
            />
          </Box>
        </HStack>
        <HStack w="100%">
          <Box w="100%">
            <Text mb="8px">Name of Person Ordering the Service (ALSO)</Text>
            <Input
              value={serviceOrderingPerson}
              isInvalid={inputErrors.includes("serviceOrderingPerson")}
              onChange={(event) => setServiceOrderingPerson(event.target.value)}
              bg={useColorModeValue("white", "#2C313C")}
              color={useColorModeValue("gray.800", "#ABB2BF")}
            />
          </Box>
          <Box w="100%">
            <Text mb="8px">
              Name of Person Approving the Purchase Order (ALSO)
            </Text>
            <Input
              value={serviceApprovingPerson}
              isInvalid={inputErrors.includes("serviceApprovingPerson")}
              onChange={(event) =>
                setServiceApprovingPerson(event.target.value)
              }
              bg={useColorModeValue("white", "#2C313C")}
              color={useColorModeValue("gray.800", "#ABB2BF")}
            />
          </Box>
        </HStack>
        <HStack w="100%">
          <Box w="100%">
            <Text mb="8px">Contact Person from Service Provider Side</Text>
            <Input
              value={serviceContactPerson}
              isInvalid={inputErrors.includes("serviceContactPerson")}
              onChange={(event) => setServiceContactPerson(event.target.value)}
              bg={useColorModeValue("white", "#2C313C")}
              color={useColorModeValue("gray.800", "#ABB2BF")}
            />
          </Box>
          <Box w="100%">
            <Text mb="8px">
              Contact Details of Person from Service Provider Side (e-mail,
              phone)
            </Text>
            <Input
              value={serviceContactDetails}
              isInvalid={inputErrors.includes("serviceContactDetails")}
              onChange={(event) => setServiceContactDetails(event.target.value)}
              bg={useColorModeValue("white", "#2C313C")}
              color={useColorModeValue("gray.800", "#ABB2BF")}
            />
          </Box>
        </HStack>
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
          createSubmission(false);
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
