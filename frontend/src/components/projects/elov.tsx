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
  const [vendorName, setVendorName] = useState<any>({});
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
  const [vendor, setVendor] = useState<any>({});
  const [costBreakdown, setCostBreakdown] = useState<any>([]);

  const [totalVendorBudgetInLC, setTotalVendorBudgetInLC] = useState(0);
  const [totalVendorBudgetInEUR, setTotalVendorBudgetInEUR] = useState(0);

  const [totalEstimatedCostsLC, setTotalEstimatedCostsLC] = useState("");

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
    setTotalEstimatedCostsLC(
      (parseFloat(estimatedCosts) * localExchangeRate).toFixed(2)
    );
  }, [estimatedCosts, localExchangeRate]);

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
    var data: any = [];
    companiesParticipating.forEach((company: any) => {
      data.push({
        companyName: company.label,
        companyCode: company.value.code,
        country: company.value.country,
        contactEmail: "",
        projectNumber: "",
        contribution: "",
        estimatedCosts: "",
        share: "",
      });
    });
    setCostBreakdown(data);
  }, [companiesParticipating]);

  useEffect(() => {
    var temp = [...costBreakdown];
    temp.forEach((row: any) => {
      if (budgetSource.value === "noBudget") {
        row.contribution = "0.00";
      } else {
        row.contribution = (
          parseFloat(row.share) *
          0.01 *
          parseFloat(estimatedIncomeBudgetCurrency)
        ).toFixed(2);
      }

      row.estimatedCosts = (
        parseFloat(row.share) *
        0.01 *
        parseFloat(estimatedCostsBudgetCurrency)
      ).toFixed(2);
    });
    if (!isEqual(costBreakdown, temp)) {
      setCostBreakdown(temp);
    }
  }, [
    costBreakdown,
    estimatedIncomeBudgetCurrency,
    estimatedCostsBudgetCurrency,
  ]);

  useEffect(() => {
    if (vendorName.value) {
      setVendor({
        vendor: vendorName.label,
        projectManager: "",
        creditor: vendorName.value.kreditor,
        debitor: vendorName.value.debitorischer,
        manufacturer: vendorName.value.hersteller,
        bu: vendorName.value.bu,
        ph: { label: "", value: "" },
        budgetCurrency: { label: "", value: "" },
        budgetAmount: "",
        localBudget: "",
        eurBudget: "",
        share: "",
        estimatedCostsCC: "",
        estimatedIncomeCC: "",
        estimatedCostsLC: "",
        estimatedCostsEUR: "",
        netProfitTargetVC: "",
        netProfitTargetLC: "",
        netProfitTargetEUR: "",
      });
    }
  }, [vendorName]);

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

  // useEffect(() => {
  //   var totalBudgetEur = 0;
  //   var totalBudgetLC = 0;
  //   var totalCostsCC = parseFloat(estimatedCostsBudgetCurrency);
  //   var totalIncomeCC = parseFloat(estimatedIncomeBudgetCurrency);
  //   var totalCostsLC = parseFloat(totalEstimatedCostsLC);
  //   var totalCostsEur = parseFloat(estimatedCosts);

  //   var temp = [...vendor];
  //   temp.slice(0, -1).forEach((row: any) => {
  //     row.eurBudget = (
  //       parseFloat(row.budgetAmount) / parseFloat(row.budgetCurrency.value)
  //     ).toFixed(2);
  //     row.localBudget = (parseFloat(row.eurBudget) * localExchangeRate).toFixed(
  //       2
  //     );

  //     var eb = parseFloat(row.eurBudget);
  //     var lb = parseFloat(row.localBudget);

  //     if (!isNaN(eb)) {
  //       totalBudgetEur += eb;
  //     }
  //     if (!isNaN(lb)) {
  //       totalBudgetLC += lb;
  //     }
  //   });
  //   var totalVendorBudgetInLC = 0;
  //   var totalVendorBudgetInEUR = 0;
  //   var totalVendorShare = 0;
  //   var totalEstimatedIncomeInCC = 0;
  //   var totalEstimatedCostsInCC = 0;
  //   var totalEstimatedCostsInLC = 0;
  //   var totalEstimatedCostsInEUR = 0;
  //   var totalNetProfitTargetInCC = 0;
  //   var totalNetProfitTargetInLC = 0;
  //   var totalNetProfitTargetInEUR = 0;
  //   temp.slice(0, -1).forEach((row: any, index: number) => {
  //     var vbEur = parseFloat(row.eurBudget);
  //     var share = 0;
  //     if (budgetSource.value === "noBudget") {
  //       row.budgetAmount = "0.00";
  //       row.localBudget = "0.00";
  //       row.eurBudget = "0.00";
  //       row.estimatedIncomeCC = "0.00";
  //       share = parseFloat(row.share) * 0.01;

  //       row.estimatedCostsCC = (
  //         share * parseFloat(estimatedCostsBudgetCurrency)
  //       ).toFixed(2);

  //       row.estimatedCostsEUR = (share * parseFloat(estimatedCosts)).toFixed(2);
  //       row.estimatedCostsLC = (
  //         parseFloat(row.estimatedCostsEUR) * localExchangeRate
  //       ).toFixed(2);
  //     } else {
  //       share = vbEur / totalBudgetEur;
  //       row.share = (share * 100).toFixed(2);
  //       if (index === temp.length - 1) {
  //         var totalShare = 0.0;
  //         temp
  //           .slice(0, temp.length - 2)
  //           .forEach((t) => (totalShare += parseFloat(t.share)));
  //         row.share = (100 - totalShare).toFixed(2);
  //         share = (100 - totalShare) * 0.01;
  //       }
  //       if (!isNaN(vbEur) && totalBudgetEur !== 0) {
  //         if (!isNaN(totalCostsCC)) {
  //           row.estimatedCostsCC = (share * totalCostsCC).toFixed(2);
  //         }
  //         if (!isNaN(totalIncomeCC)) {
  //           row.estimatedIncomeCC = (share * totalIncomeCC).toFixed(2);
  //         }
  //         if (!isNaN(totalCostsLC)) {
  //           row.estimatedCostsLC = (share * totalCostsLC).toFixed(2);
  //         }
  //         if (!isNaN(totalCostsEur)) {
  //           row.estimatedCostsEUR = (share * totalCostsEur).toFixed(2);
  //         }
  //       }
  //     }
  //     row.netProfitTargetEUR =
  //       `${budgetSource.value === "noBudget" ? "-" : ""}` +
  //       (parseFloat(row.share) * 0.01 * parseFloat(netProfitTarget)).toFixed(2);

  //     row.netProfitTargetLC =
  //       `${budgetSource.value === "noBudget" ? "-" : ""}` +
  //       (parseFloat(row.netProfitTargetEUR) * localExchangeRate).toFixed(2);
  //     row.netProfitTargetVC =
  //       `${budgetSource.value === "noBudget" ? "-" : ""}` +
  //       (share * parseFloat(netProfitTargetBudgetCurrency)).toFixed(2);

  //     totalVendorBudgetInLC += parseFloat(row.localBudget);
  //     totalVendorBudgetInEUR += parseFloat(row.eurBudget);
  //     totalVendorShare += parseFloat(row.share);
  //     totalEstimatedIncomeInCC += parseFloat(row.estimatedIncomeCC);
  //     totalEstimatedCostsInCC += parseFloat(row.estimatedCostsCC);
  //     totalEstimatedCostsInLC += parseFloat(row.estimatedCostsLC);
  //     totalEstimatedCostsInEUR += parseFloat(row.estimatedCostsEUR);
  //     totalNetProfitTargetInCC += parseFloat(row.netProfitTargetVC);
  //     totalNetProfitTargetInLC += parseFloat(row.netProfitTargetLC);
  //     totalNetProfitTargetInEUR += parseFloat(row.netProfitTargetEUR);
  //   });

  //   temp[temp.length - 1] = {
  //     vendor: "TOTAL",
  //     projectManager: "",
  //     creditor: "",
  //     debitor: "",
  //     manufacturer: "",
  //     bu: "",
  //     ph: { label: "", value: "" },
  //     budgetCurrency: { label: "", value: "" },
  //     budgetAmount: "",
  //     localBudget: totalVendorBudgetInLC.toFixed(2),
  //     eurBudget: totalVendorBudgetInEUR.toFixed(2),
  //     share: totalVendorShare.toFixed(2),
  //     estimatedCostsCC: totalEstimatedCostsInCC.toFixed(2),
  //     estimatedIncomeCC: totalEstimatedIncomeInCC.toFixed(2),
  //     estimatedCostsLC: totalEstimatedCostsInLC.toFixed(2),
  //     estimatedCostsEUR: totalEstimatedCostsInEUR.toFixed(2),
  //     netProfitTargetVC: totalNetProfitTargetInCC.toFixed(2),
  //     netProfitTargetLC: totalNetProfitTargetInLC.toFixed(2),
  //     netProfitTargetEUR: totalNetProfitTargetInEUR.toFixed(2),
  //   };

  //   setTotalVendorBudgetInEUR(totalBudgetEur);
  //   setTotalVendorBudgetInLC(totalBudgetLC);
  //   if (!isEqual(vendor, temp)) {
  //     setVendor(temp);
  //   }
  // }, [
  //   vendor,
  //   estimatedCostsBudgetCurrency,
  //   totalEstimatedCostsLC,
  //   budgetSource,
  // ]);

  return (
    <Box>
      <VStack spacing="20px" mb={"40px"} align="start">
        <Text as="b">Requestor`s Details</Text>
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
        <Text as="b">Campaign`s Details</Text>

        <Box w="100%">
          <Text mb="8px">
            Campaign Name (40 characters limit. Naming Convention: 'Vendor Name
            1' 'Vendor Name 2'... 'Campaign Name')
          </Text>
          <Input
            maxLength={40}
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
          <Text mb="8px">Year</Text>
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
          <Text mb="8px">Requestor`s Name</Text>
          <Input
            value={requestorsName}
            onChange={(event) => setRequestorsName(event.target.value)}
            // disabled
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">ALSO Project Approver</Text>
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
            value={{ label: "", value: "" }}
            placeholder=""
            classNamePrefix="select"
            isClearable={false}
            name="projectApprover"
            options={[]}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">ALSO Project Approval (attachments)</Text>
          <Uploader action="" draggable>
            <div style={{ lineHeight: "200px" }}>
              Click or Drag files to this area to upload
            </div>
          </Uploader>
        </Box>
        <Box w="100%">
          <Text mb="8px">Manufacturer`s Fiscal Period</Text>
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
            disabled={budgetSource.value === "noBudget"}
            value={budgetApprovedByVendor}
            onChange={(event) => {
              setBudgetApprovedByVendor(event.target.value);
            }}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Budget Approved by Vendor (attachments)</Text>
          <Uploader
            action=""
            disabled={budgetSource.value === "noBudget"}
            draggable
          >
            <div style={{ lineHeight: "200px" }}>
              Click or Drag files to this area to upload
            </div>
          </Uploader>
        </Box>
        <Box w="100%">
          <Text mb="8px">Local Currency</Text>
          <Input
            defaultValue={requestorsCompanyName.value.currency}
            disabled
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Campaign Currency</Text>
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
          <Text mb="8px">Campaign Estimated Income in Campaign Currency</Text>
          <Input
            disabled={budgetSource.value === "noBudget"}
            value={estimatedIncomeBudgetCurrency}
            onChange={(event) => {
              setEstimatedIncomeBudgetCurrency(event.target.value);
            }}
            bg={useColorModeValue("white", "#2C313C")}
            color={useColorModeValue("gray.800", "#ABB2BF")}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Campaign Estimated Costs in Campaign Currency</Text>
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
              ? "Campaign Loss in Campaign currency"
              : "Campaign Net Profit Target in Campaign Currency"}
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
          <Text mb="8px">Vendor Name</Text>
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
            value={vendorName}
            placeholder=""
            onChange={(value: any) => {
              setVendorName(value);
            }}
            classNamePrefix="select"
            isClearable={false}
            name="vendorsName"
            options={VendorsNames}
          />
        </Box>
        {/*  */}
        <Box w="100%">
          <Text mb="8px">ALSO Marketing Manager</Text>
          <Input
            bgColor={"white"}
            value={vendor.projectManager}
            onChange={(event) => {
              var temp = { ...vendor };
              temp.projectManager = event.target.value;
              setVendor(temp);
              console.log(vendor);
            }}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">VOD</Text>
          <Input
            bgColor={"white"}
            value={vendor.debitor}
            onChange={(event) => {
              var temp = { ...vendor };
              temp.debitor = event.target.value;
              setVendor(temp);
            }}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Creditor</Text>
          <Input
            isDisabled
            bgColor={"white"}
            value={vendor.creditor}
            onChange={(event) => {
              var temp = { ...vendor };
              temp.creditor = event.target.value;
              setVendor(temp);
            }}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Manufacturer</Text>
          <Input
            bgColor={"white"}
            value={vendor.manufacturer}
            onChange={(event) => {
              var temp = { ...vendor };
              temp.manufacturer = event.target.value;
              setVendor(temp);
            }}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Business Unit</Text>
          <Input
            bgColor={"white"}
            value={vendor.bu}
            onChange={(event) => {
              var temp = { ...vendor };
              temp.bu = event.target.value;
              setVendor(temp);
            }}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">PH1</Text>
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
            value={vendor.ph}
            onChange={(value) => {
              var temp = { ...vendor };
              temp.ph = value;
              setVendor(temp);
            }}
            placeholder=""
            classNamePrefix="select"
            isClearable={false}
            name="PH1"
            options={PH1}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Vendor Budget Currency</Text>
          <Select
            isDisabled={budgetSource.value === "noBudget"}
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
            value={vendor.budgetCurrency}
            onChange={(value) => {
              var temp = { ...vendor };
              temp.budgetCurrency = value;
              setVendor(temp);
            }}
            placeholder=""
            classNamePrefix="select"
            isClearable={false}
            name="budgetCurrency"
            options={ExchangeRates}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Vendor Budget Amount</Text>
          <Input
            bgColor={"white"}
            disabled={budgetSource.value === "noBudget"}
            value={vendor.budgetAmount}
            onChange={(event) => {
              var temp = { ...vendor };
              temp.budgetAmount = event.target.value;
              setVendor(temp);
            }}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Vendor Budget in LC</Text>
          <Input
            bgColor={"white"}
            disabled={budgetSource.value === "noBudget"}
            value={vendor.localBudget}
            onChange={(event) => {
              var temp = { ...vendor };
              temp.localBudget = event.target.value;
              setVendor(temp);
            }}
          />
        </Box>
        <Box w="100%">
          <Text mb="8px">Vendor Budget in EUR</Text>
          <Input
            bgColor={"white"}
            disabled={budgetSource.value === "noBudget"}
            value={vendor.eurBudget}
            onChange={(event) => {
              var temp = { ...vendor };
              temp.eurBudget = event.target.value;
              setVendor(temp);
            }}
          />
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
          var projectId = "624ac98682eeddf1a9b6a622";

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
              totalEstimatedCostsLC: parseFloat(totalEstimatedCostsLC),
              comments: comments,
              projectType: "Local One Vendor",
            },
          };
          var children: Submission[] = [];

          children.push({
            project: projectId,
            title: "",
            parentId: "",
            group: "vendor",
            created: new Date(),
            updated: new Date(),
            status: "New",
            author: requestorsName,
            data: {
              vendorName: vendorName.label,
              productionProjectManager: vendor.projectManager,
              sapCreditorNumber: vendor.creditor,
              sapDebitorNumber: vendor.debitor,
              manufacturerNumber: vendor.manufacturer,
              businessUnit: vendor.bu,
              PH1: vendor.ph.label,
              budgetCurrency: vendor.budgetCurrency.label,
              estimatedIncomeEur: parseFloat(vendor.budgetAmount),
              estimatedIncomeBC: parseFloat(vendor.localBudget),
              // cbbudgetEur: parseFloat(vendor.eurBudget),
              vendorShare: 100,
              estimatedCostsCC: parseFloat(vendor.estimatedCostsCC),
              estimatedIncomeCC: parseFloat(vendor.estimatedIncomeCC),
              // cbestimatedCostsLC: parseFloat(vendor.estimatedCostsLC),
              estimatedCostsEur: parseFloat(vendor.estimatedCostsEUR),
              estimatedResultBC: parseFloat(netProfitTargetBudgetCurrency),
              // cbnetProfitTargetLC: parseFloat(vendor.netProfitTargetLC),
              estimatedResultEur: parseFloat(vendor.netProfitTargetEUR),
            },
          });

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
