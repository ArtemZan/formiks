/* eslint-disable react-hooks/rules-of-hooks */
import React, { Children, useReducer } from 'react';
import { useEffect, useState } from 'react';
import {
    useColorModeValue,
    Input,
    Box,
    VStack,
    Text,
    HStack,
    Textarea,
    Button,
    AlertDescription,
    AlertIcon,
    Alert,
} from '@chakra-ui/react';
import { toast } from 'react-toastify';
import Toast from '../Toast';
import Project from '../../types/project';
import Select from 'react-select';
import { getAccountInfo } from '../../utils/MsGraphApiCall';
import DatePicker from 'react-datepicker';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import moment from 'moment';

import { Table } from 'rsuite';
import { Submission, SubmissionWithChildren } from '../../types/submission';
import { RestAPI } from '../../api/rest';
import { DefaultSelectStyles } from '../../utils/Styles';
import { RiCoinsLine } from 'react-icons/ri';
import { stringToObject } from 'rsuite/esm/utils';
import { CgToday } from 'react-icons/cg';
import { checkIsNan } from '../../utils/functions';

var PH1: any[] = [];
var Companies: any[] = [];
var VendorsNames: any[] = [];
var AlsoInternationalVendorsNames: any[] = [];
var BUs: any[] = [];
var CampaignChannel: any[] = [];
var TargetAudience: any[] = [];
var Budget: any[] = [];
var ExchangeRates: any[] = [];
var FiscalQuarter: any[] = [];
var Year: any[] = [];
var ProjectStartQuarter: any[] = [];
var vendorsAfterCompanySelect: string[] = [];

const { Column, HeaderCell, Cell } = Table;

interface Props {
    history: any;
    project: Project;
    submission?: any;
    children?: any[];
    isDraft?: boolean;
}

export default function Cerov(props: Props) {
    const [requestorsCompanyName, setRequestorsCompanyName] = useState<any>({
        label: '',
        value: { name: '', code: '', country: '' },
    });
    const [localSubmitted, setLocalSubmitted] = useState(false);
    const [localExchangeRate, setLocalExchangeRate] = useState(0.0);
    const [campaignName, setCampaignName] = useState('');
    const [campaignDescription, setCampaignDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [campaignChannel, setCampaignChannel] = useState<any>({
        label: '',
        value: '',
    });
    const [vendorName, setVendorName] = useState<any>({});
    const [year, setYear] = useState<any>({
        label: '',
        value: '',
    });
    const [projectStartQuarter, setProjectStartQuarter] = useState<any>({
        label: '',
        value: '',
    });
    const [projectNumber, setProjectNumber] = useState('');
    const [requestorsName, setRequestorsName] = useState('');
    const [projectApproval, setProjectApproval] = useState('');
    const [fiscalQuarter, setFiscalQuarter] = useState<any>({
        label: '',
        value: '',
    });
    const [organizingCompany, setOrganizingCompany] = useState('');
    const [startDate, setStartDate] = useState<any>(null);
    const [endDate, setEndDate] = useState<any>(null);
    const [budgetSource, setBudgetSource] = useState<any>({
        label: '',
        value: '',
    });
    const [exchangeRates, setExchangeRates] = useState<any>({
        label: '',
        value: '',
    });
    const [estimatedIncomeBudgetCurrency, setEstimatedIncomeBudgetCurrency] =
        useState('');
    const [estimatedCostsBudgetCurrency, setEstimatedCostsBudgetCurrency] =
        useState('');
    const [netProfitTargetBudgetCurrency, setNetProfitTargetBudgetCurrency] =
        useState('');
    const [estimatedIncome, setEstimatedIncome] = useState('');
    const [estimatedCosts, setEstimatedCosts] = useState('');
    const [netProfitTarget, setNetProfitTarget] = useState('');
    const [companiesParticipating, setCompaniesParticipating] = useState<any>(
        []
    );
    const [comments, setComments] = useState('');
    const [vendor, setVendor] = useState<any>({
        ph: {
            label: '',
            value: '',
        },
    });
    const [costBreakdown, setCostBreakdown] = useState<any>([]);
    const [inputError, setInputError] = useState('');
    const [totalcbShare, setTotalcbShare] = useState('0.00');
    const [totalcbContribution, setTotalcbContribution] = useState('0.00');
    const [totalcbCosts, setTotalcbCosts] = useState('0.00');

    const [totalcbContributionEur, setTotalcbContributionEur] =
        useState('0.00');
    const [totalcbCostsEur, setTotalcbCostsEur] = useState('0.00');

    const [totalVendorBudgetInLC, setTotalVendorBudgetInLC] = useState(0);
    const [totalVendorBudgetInEUR, setTotalVendorBudgetInEUR] = useState(0);

    const [totalEstimatedCostsLC, setTotalEstimatedCostsLC] = useState('');

    const [inputErrors, setInputErrors] = useState<string[]>([]);

    const [injectionReady, setInjectionReady] = useState(false);

    const [render, rerender] = useState(0);

    useEffect(() => {
        if (props.submission) {
            setRequestorsCompanyName({
                label: props.submission.data.requestorsCompanyName ?? '',
                value: {
                    name: props.submission.data.requestorsCompanyName ?? '',
                    code: props.submission.data.companyCode ?? '',
                    country: props.submission.data.requestorsCountry ?? '',
                    currency: props.submission.data.localCurrency ?? '',
                },
            });
            switch (props.submission.data.companyCode) {
                case '1550':
                    vendorsAfterCompanySelect = AlsoInternationalVendorsNames;
                    break;
                case '6110':
                    vendorsAfterCompanySelect = VendorsNames;
                    break;
            }
            setCampaignName(props.submission.data.campaignName ?? '');
            setCampaignDescription(
                props.submission.data.campaignDescription ?? ''
            );
            setTargetAudience(props.submission.data.targetAudience ?? '');
            setCampaignChannel({
                label: props.submission.data.campaignChannel ?? '',
                value:
                    props.submission.data.campaignChannel.length > 0
                        ? props.submission.data.campaignChannel.substr(0, 1)
                        : '',
            });
            setYear({
                label: props.submission.data.year ?? '',
                value: (props.submission.data.year ?? '').substring(2, 4),
            });
            setOrganizingCompany(props.submission.data.organizingCompany ?? '');
            setProjectStartQuarter({
                label: props.submission.data.projectStartQuarter ?? '',
                value:
                    props.submission.data.projectStartQuarter.length > 0
                        ? props.submission.data.projectStartQuarter.substr(0, 2)
                        : '',
            });
            setProjectNumber(props.submission.data.projectNumber ?? '');
            setRequestorsName(props.submission.data.requestorsName ?? '');
            setFiscalQuarter({
                label: props.submission.data.manufacturersFiscalQuarter ?? '',
                value: props.submission.data.manufacturersFiscalQuarter ?? '',
            });
            setStartDate(
                props.submission.data.campaignStartDate === null ||
                    props.submission.data.campaignStartDate === ''
                    ? ''
                    : new Date(props.submission.data.campaignStartDate)
            );
            setEndDate(
                props.submission.data.campaignEndDate === null ||
                    props.submission.data.campaignEndDate === ''
                    ? ''
                    : new Date(props.submission.data.campaignEndDate)
            );
            if (
                Budget.length > 0 &&
                props.submission.data.budgetSource !== ''
            ) {
                setBudgetSource({
                    label: props.submission.data.budgetSource ?? '',
                    value:
                        Budget.find(
                            (b) =>
                                b.label === props.submission.data.budgetSource
                        ).value ?? '',
                });
            }
            if (
                ExchangeRates.length > 0 &&
                props.submission.data.campaignBudgetsCurrency !== ''
            ) {
                setExchangeRates({
                    label: props.submission.data.campaignBudgetsCurrency ?? '',
                    value:
                        ExchangeRates.find(
                            (b) =>
                                b.label ===
                                props.submission.data.campaignBudgetsCurrency
                        ).value ?? '',
                });
            }
            setEstimatedIncomeBudgetCurrency(
                (
                    props.submission.data
                        .campaignEstimatedIncomeBudgetsCurrency ?? 0
                ).toString()
            );
            setEstimatedIncome(
                props.submission.data.campaignEstimatedIncomeEur
                    ? props.submission.data.campaignEstimatedIncomeEur.toFixed(
                          2
                      )
                    : 'NaN'
            );
            setEstimatedCosts(
                props.submission.data.campaignEstimatedCostsEur
                    ? props.submission.data.campaignEstimatedCostsEur.toFixed(2)
                    : 'NaN'
            );
            setNetProfitTarget(
                props.submission.data.campaignNetProfitTargetEur
                    ? props.submission.data.campaignNetProfitTargetEur.toFixed(
                          2
                      )
                    : 'NaN'
            );
            setEstimatedCostsBudgetCurrency(
                (
                    props.submission.data
                        .campaignEstimatedCostsBudgetsCurrency ?? 'NaN'
                ).toString()
            );
            setNetProfitTargetBudgetCurrency(
                (
                    props.submission.data
                        .campaignNetProfitTargetBudgetsCurrency ?? 'NaN'
                ).toString()
            );
            setLocalExchangeRate(
                parseFloat(
                    (
                        ExchangeRates.find(
                            (rate) =>
                                rate.label ===
                                props.submission.data.campaignCurrency
                        ) || 'NaN'
                    ).value
                )
            );
            setComments(props.submission.data.comments ?? '');
            setTotalEstimatedCostsLC(
                props.submission.data.totalEstimatedCostsLC
                    ? props.submission.data.totalEstimatedCostsLC.toFixed(2)
                    : 'NaN'
            );

            //

            if (props.children && props.children.length > 0) {
                var vs = props.children.find((s) => s.group === 'vendor');
                setVendorName({
                    label: vs.data.vendorName ?? '',
                    value: vs.data.vendorName ?? '',
                });
                setVendor({
                    vendor: vs.data.vendorName ?? '',
                    creditor: vs.data.creditorNumber ?? '',

                    debitor: vs.data.debitorNumber ?? '',
                    manufacturer: vs.data.manufacturerNumber ?? '',
                    bu: vs.data.businessUnit ?? '',
                    // ph: {
                    //   label: vs.data.PH1 ?? "",
                    //   value: vs.data.PH1 ?? "",
                    // },
                    budgetCurrency: {
                        label: vs.data.budgetCurrency || '',
                        value: vs.data.budgetCurrency || '',
                    },
                    budgetAmount: '',
                    localBudget: '',
                    eurBudget: '',
                    share: '100',
                    estimatedCostsCC: '',
                    estimatedIncomeCC: '',
                    estimatedCostsLC: '',
                    estimatedCostsEUR: '',
                    netProfitTargetVC: '',
                    netProfitTargetLC: '',
                    netProfitTargetEUR: '',
                });
                setCompaniesParticipating(
                    props.children
                        .filter((s) => s.group === 'country')
                        .map((s) => {
                            return {
                                label: s.data.companyName,
                                value: {
                                    code: s.data.countryCodeEMEA,
                                    country: s.data.countriesEMEA,
                                },
                            };
                        })
                );
                var c: any[] = [];
                var totalShare = 0.0;
                var totalCosts = 0.0;
                var totalCostsEur = 0.0;
                var totalContributionEur = 0.0;
                var totalContribution = 0.0;
                props.children
                    .filter((s) => s.group === 'country')
                    .forEach((s) => {
                        c.push({
                            companyName: s.data.companyName,
                            companyCode: s.data.countryCodeEMEA,
                            country: s.data.countriesEMEA,
                            contactEmail: s.data.productionProjectManager,
                            projectNumber: s.data.localProjectNumber,
                            share: (s.data.countryShare || 0).toFixed(2),
                            contribution: (
                                s.data.countryBudgetContributionCC || 0
                            ).toFixed(2),
                            estimatedCosts: (
                                s.data.countryCostEstimationCC || 0
                            ).toFixed(2),
                            estimatedCostsEur: (
                                s.data.estimatedCostsEUR || 0
                            ).toFixed(2),
                            contributionEur: (
                                s.data.estimatedIncomeEUR || 0
                            ).toFixed(2),
                        });
                        totalShare += s.data.countryShare || 0;
                        totalContribution +=
                            s.data.countryBudgetContributionCC || 0;
                        totalCosts += s.data.countryCostEstimationCC || 0;
                        totalContributionEur += s.data.estimatedIncomeEUR || 0;
                        totalCostsEur += s.data.estimatedCostsEUR || 0;
                    });

                setTotalcbShare(totalShare.toFixed(2).toString());
                setTotalcbContribution(totalContribution.toFixed(2).toString());
                setTotalcbCosts(totalCosts.toFixed(2).toString());
                setTotalcbCostsEur(totalCostsEur.toFixed(2).toString());
                setTotalcbContributionEur(
                    totalContributionEur.toFixed(2).toString()
                );

                setCostBreakdown([...c]);
            }

            setTimeout(() => {
                setInjectionReady(true);
            }, 3000);
        }
    }, [props.submission, props.children, ExchangeRates]);

    async function fetchDropdowns() {
        var dropdownsIds: string[] = [
            '619b630a9a5a2bb37a93b23b',
            '619b61419a5a2bb37a93b237',
            '6391eea09a3d043b9a89d767',
            '619b62d79a5a2bb37a93b239',
            '619b632c9a5a2bb37a93b23c',
            '619b62959a5a2bb37a93b238',
            '619b62f29a5a2bb37a93b23a',
            '619b66defe27d06ad17d75ac',
            '619b6754fe27d06ad17d75ad',
            '619b6799fe27d06ad17d75ae',
            // "633e93ed5a7691ac30c977fc",
            '63295a2ef26db37a14557092',
            '636abbd43927f9c7703b19c4',
        ];

        try {
            var responses = await Promise.all(
                dropdownsIds.map((di) => {
                    return RestAPI.getDropdownValues(di);
                })
            );
            // PH1 = responses[0].data;
            Companies = responses[1].data;
            VendorsNames = responses[2].data;
            CampaignChannel = responses[3].data;
            TargetAudience = responses[4].data;
            Budget = responses[5].data;
            ExchangeRates = responses[6].data;
            FiscalQuarter = responses[7].data;
            Year = responses[8].data;
            ProjectStartQuarter = responses[9].data;
            BUs = responses[10].data;
            AlsoInternationalVendorsNames = responses[11].data;
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        if (props.submission && !injectionReady) {
            return;
        }
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
        if (props.submission && !injectionReady) {
            return;
        }
        var data: any = [];
        companiesParticipating.forEach((company: any) => {
            var ex = costBreakdown.find(
                (country: any) => country.companyCode === company.value.code
            );
            data.push({
                companyName: company.label,
                companyCode: company.value.code,
                country: company.value.country,
                contactEmail: ex ? ex.contactEmail : '',
                projectNumber:
                    projectNumber.length > 0
                        ? company.value.code + projectNumber.substring(4)
                        : '',
                contribution: ex ? ex.contribution : '',
                estimatedCosts: ex ? ex.estimatedCosts : '',
                contributionEur: ex ? ex.contributionEur : '',
                estimatedCostsEur: ex ? ex.estimatedCostsEur : '',
                share: ex ? ex.share : '',
            });
        });
        setCostBreakdown(data);
    }, [companiesParticipating, projectNumber]);

    useEffect(() => {
        if (props.submission && !injectionReady) {
            return;
        }
        if (vendorName.value) {
            setVendor({
                vendor: vendorName.label,
                projectManager: vendorName.value.alsoMarketingConsultant,
                creditor: vendorName.value.kreditor,
                debitor: vendorName.value.debitorischer,
                manufacturer: vendorName.value.hersteller,
                bu: vendor.bu,
                ph: { label: '', value: '' },
                budgetCurrency: { label: '', value: '' },
                budgetAmount: '',
                localBudget: '',
                eurBudget: '',
                share: '',
                estimatedCostsCC: '',
                estimatedIncomeCC: '',
                estimatedCostsLC: '',
                estimatedCostsEUR: '',
                netProfitTargetVC: '',
                netProfitTargetLC: '',
                netProfitTargetEUR: '',
            });
        }
    }, [vendorName]);

    useEffect(() => {
        if (props.submission && !injectionReady) {
            return;
        }
        setEstimatedCosts(
            (
                parseFloat(estimatedCostsBudgetCurrency) /
                parseFloat(exchangeRates.value)
            )
                .toFixed(2)
                .toString()
        );
        var localCur = ExchangeRates.find(
            (s: any) => s.label === requestorsCompanyName.value.currency
        );
        setTotalEstimatedCostsLC(
            (
                parseFloat(estimatedCostsBudgetCurrency) /
                exchangeRates.value /
                (localCur !== undefined ? localCur.value : 1)
            )
                .toFixed(2)
                .toString()
        );
        if (budgetSource.value === 'noBudget') {
            costBreakdown.forEach((element: any) => {
                element['contribution'] = 0;
                element['contributionEur'] = 0;
            });
            setCostBreakdown(costBreakdown);
            setTotalcbContribution('0.00');
            setTotalcbContributionEur('0.00');
            setVendorName(VendorsNames[VendorsNames.length - 1]);
            var temp = { ...vendor };
            temp.manufacturer = '80056681';
            temp.bu = 'A12 (old) Bridge';
            temp.ph = { label: 'CON01-Bridge', value: 'CON01' };
            setVendor(temp);
        } else {
            if (costBreakdown.length > 0) {
                if (costBreakdown[0].estimatedCosts !== undefined) {
                    onCostBreakdownTableChange(
                        'share',
                        0,
                        costBreakdown[0].share
                    );
                }
            }
        }

        if (budgetSource.value !== 'noBudget') {
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
            setEstimatedIncome('0.00');
            setEstimatedIncomeBudgetCurrency('0.00');
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
        if (props.submission && !injectionReady) {
            return;
        }

        setProjectNumber(
            (requestorsCompanyName.value.code === ''
                ? '????'
                : requestorsCompanyName.value.code) +
                (organizingCompany === '' ? '??' : organizingCompany) +
                (year.value === '' ? '??' : year.value) +
                (campaignChannel.value === '' ? '?' : campaignChannel.value) +
                (projectStartQuarter.value === ''
                    ? '?'
                    : projectStartQuarter.value.slice(1)) +
                '01'
        );
    }, [
        year,
        organizingCompany,
        campaignChannel,
        projectStartQuarter,
        requestorsCompanyName,
    ]);

    async function createSubmission(draft: boolean, local: string | null) {
        var projectId = '629dfb3f55d209262194a3e6';
        var parent: Submission = {
            project: projectId,
            title: campaignName,
            parentId: null,
            projectNumber: projectNumber,
            viewId: null,
            group: null,
            status: 'New',
            created: new Date(),
            updated: new Date(),
            author: requestorsName,
            data: {
                status: 'New',
                requestorsCompanyName: requestorsCompanyName.label,
                companyCode: requestorsCompanyName.value.code,
                requestorsCountry: requestorsCompanyName.value.country,
                organizingCompany: organizingCompany,
                campaignName: campaignName,
                projectName: campaignName,
                campaignDescription: campaignDescription,
                targetAudience: targetAudience,
                campaignChannel: campaignChannel.label,
                year: year.label,
                projectStartQuarter: projectStartQuarter.label,
                projectNumber: projectNumber,
                requestorsName: requestorsName,
                projectApprover: projectApproval,
                businessUnit: vendor.bu,
                projectApproval: projectApproval,
                manufacturersFiscalQuarter: fiscalQuarter.label,

                campaignStartDate:
                    startDate === null ? null : startDate.toString(),
                campaignEndDate: endDate === null ? null : endDate.toString(),
                budgetSource: budgetSource.label,
                campaignBudgetsCurrency: exchangeRates.label,
                campaignCurrency: exchangeRates.label,
                localCurrency: requestorsCompanyName.value['currency'],
                campaignEstimatedIncomeBudgetsCurrency: isNaN(
                    parseFloat(estimatedIncomeBudgetCurrency)
                )
                    ? ''
                    : parseFloat(estimatedIncomeBudgetCurrency),
                campaignEstimatedCostsBudgetsCurrency: parseFloat(
                    estimatedCostsBudgetCurrency
                ),
                campaignNetProfitTargetBudgetsCurrency: parseFloat(
                    netProfitTargetBudgetCurrency
                ),
                campaignEstimatedIncomeEur: isNaN(parseFloat(estimatedIncome))
                    ? ''
                    : parseFloat(estimatedIncome),
                campaignEstimatedCostsEur: parseFloat(estimatedCosts),
                campaignNetProfitTargetEur: parseFloat(netProfitTarget),
                totalEstimatedCostsLC: parseFloat(totalEstimatedCostsLC),
                comments: comments,
                additionalInformation: comments,
                projectType: 'European One Vendor',
                countryShare: parseFloat(totalcbShare),
                countryBudgetContributionCC: parseFloat(totalcbContribution),
                countryCostEstimationCC: parseFloat(totalcbCosts),
                countryBudgetContributionEur: parseFloat(
                    totalcbContributionEur
                ),
                countryCostEstimationEur: parseFloat(totalcbCostsEur),
                estimatedCostsCC: parseFloat(estimatedCostsBudgetCurrency),
                estimatedIncomeCC:
                    budgetSource.value === 'noBudget'
                        ? 0.0
                        : parseFloat(estimatedIncomeBudgetCurrency),
                estimatedResultCC:
                    parseFloat(netProfitTargetBudgetCurrency) *
                    (budgetSource.value === 'noBudget' ? -1 : 1),
                // cbestimatedCostsLC: parseFloat(vendor.estimatedCostsLC),
                estimatedIncomeEUR:
                    budgetSource.value === 'noBudget'
                        ? 0.0
                        : parseFloat(estimatedIncome),
                estimatedCostsEUR: parseFloat(estimatedCosts),
                estimatedResultEUR:
                    parseFloat(netProfitTarget) *
                    (budgetSource.value === 'noBudget' ? -1 : 1),
                estimatedResultBC:
                    parseFloat(netProfitTargetBudgetCurrency) *
                    (budgetSource.value === 'noBudget' ? -1 : 1),
            },
        };
        var children: Submission[] = [];
        children.push({
            project: projectId,
            projectNumber: projectNumber,
            title: '',
            parentId: '',
            viewId: null,
            group: 'vendor',
            created: new Date(),
            updated: new Date(),
            status: 'New',
            author: requestorsName,
            data: {
                status: '',
                vendorName: vendorName.label,
                projectNumber: projectNumber,
                companyCode: requestorsCompanyName.value.code,
                creditorNumber: vendor.creditor,
                debitorNumber: vendor.debitor,
                manufacturerNumber: vendor.manufacturer,
                businessUnit: vendor.bu,
                // PH1: vendor.ph.label,
                vendorBudgetCurrency:
                    budgetSource.value === 'noBudget'
                        ? 'N/A'
                        : exchangeRates.label,
                vendorAmount:
                    isNaN(parseFloat(estimatedIncomeBudgetCurrency)) ||
                    budgetSource.value === 'noBudget'
                        ? 0.0
                        : parseFloat(estimatedIncomeBudgetCurrency),
                // cbbudgetEur: parseFloat(vendor.eurBudget),
                vendorShare: 100,
                projectType: 'European One Vendor',
            },
        });
        //comment that has no meaning
        costBreakdown.forEach((company: any) => {
            if (local !== null && local === company.companyCode) {
                children.push({
                    project: projectId,
                    title: '',
                    parentId: null,
                    viewId: null,
                    group: 'country',
                    projectNumber: projectNumber,
                    created: new Date(),
                    updated: new Date(),
                    status: 'Incomplete',
                    author: requestorsName,
                    data: {
                        status: 'Incomplete',
                        projectName: campaignName,
                        additionalInformation: comments,
                        campaignChannel: campaignChannel.label,
                        parentProjectNumber: projectNumber,
                        projectNumber: company.projectNumber,
                        campaignStartDate:
                            startDate === null ? null : startDate.toString(),
                        campaignEndDate:
                            endDate === null ? null : endDate.toString(),
                        budgetSource: budgetSource.label,
                        campaignCurrency: exchangeRates.label,
                        localCurrency: requestorsCompanyName.value['currency'],
                        vendorName: vendorName.label,
                        businessUnit: vendor.bu,
                        estimatedCostsCC: parseFloat(company.estimatedCosts),
                        estimatedIncomeCC:
                            budgetSource.value === 'noBudget'
                                ? 0.0
                                : parseFloat(company.contribution),
                        estimatedResultCC:
                            parseFloat(company.contribution) -
                            parseFloat(company.estimatedCosts),
                        estimatedIncomeEUR:
                            budgetSource.value === 'noBudget'
                                ? 0.0
                                : parseFloat(company.contributionEur),
                        estimatedCostsEUR: parseFloat(
                            company.estimatedCostsEur
                        ),
                        estimatedResultEUR:
                            parseFloat(company.contributionEur) -
                            parseFloat(company.estimatedCostsEur),
                        // PH1: vendor.ph.label,
                        vendorBudgetCurrency:
                            budgetSource.value === 'noBudget'
                                ? 'N/A'
                                : exchangeRates.label,
                        vendorAmount: parseFloat(company.contribution),
                        vendorShare: 100,
                        projectType: 'European One Vendor',
                        companyName: company.companyName,
                        companyCode: company.companyCode,
                        countryCodeEMEA: company.companyCode,
                        country: company.country,
                        countriesEMEA: company.country,
                        productionProjectManager: company.contactEmail,
                        countryShare: parseFloat(company.share),
                        countryBudgetContributionEur: company.contribution,
                        countryCostEstimationEur: company.estimatedCosts,
                        countryBudgetContributionCC: isNaN(
                            parseFloat(company.contribution)
                        )
                            ? 0.0
                            : parseFloat(company.contribution),
                        countryCostEstimationCC: parseFloat(
                            company.estimatedCosts
                        ),
                    },
                });
            } else {
                children.push({
                    project: projectId,
                    title: '',
                    parentId: '',
                    projectNumber: projectNumber,

                    viewId: null,
                    group: 'country',
                    created: new Date(),
                    updated: new Date(),
                    status: 'New',
                    author: requestorsName,
                    data: {
                        status: '',
                        //projectName: campaignName,
                        //additionalInformation: comments,
                        //campaignChannel: campaignChannel.label,
                        parentProjectNumber: projectNumber,
                        projectNumber: projectNumber,
                        companyCode:
                            company.companyCode === '6110' ? '6110' : '',
                        localProjectNumber: company.projectNumber,
                        //campaignStartDate: startDate === null ? null : startDate.toString(),
                        //campaignEndDate: endDate === null ? null : endDate.toString(),
                        budgetSource: budgetSource.label,
                        campaignCurrency: exchangeRates.label,
                        localCurrency: requestorsCompanyName.value['currency'],
                        vendorName: vendorName.label,
                        businessUnit: vendor.bu,
                        // PH1: vendor.ph.label,
                        vendorShare: 100,
                        estimatedResultBC:
                            parseFloat(netProfitTargetBudgetCurrency) *
                            (budgetSource.value === 'noBudget' ? -1 : 1),
                        projectType: 'European One Vendor',
                        companyName: company.companyName,
                        countryCodeEMEA: company.companyCode,
                        country: company.country,
                        countriesEMEA: company.country,
                        productionProjectManager: company.contactEmail,
                        estimatedCostsCC: parseFloat(company.estimatedCosts),
                        estimatedIncomeCC:
                            budgetSource.value === 'noBudget'
                                ? 0.0
                                : parseFloat(company.contribution),
                        estimatedResultCC:
                            parseFloat(company.contribution) -
                            parseFloat(company.estimatedCosts),
                        estimatedIncomeEUR:
                            budgetSource.value === 'noBudget'
                                ? 0.0
                                : parseFloat(company.contributionEur),
                        estimatedCostsEUR: parseFloat(
                            company.estimatedCostsEur
                        ),
                        estimatedResultEUR:
                            parseFloat(company.contributionEur) -
                            parseFloat(company.estimatedCostsEur),
                        countryShare: parseFloat(company.share),
                        countryBudgetContributionEur: parseFloat(
                            company.contribution
                        ),
                        countryCostEstimationEur: parseFloat(
                            company.estimatedCosts
                        ),
                        countryBudgetContributionCC: isNaN(
                            parseFloat(company.contribution)
                        )
                            ? 0.0
                            : parseFloat(company.contribution),
                        countryCostEstimationCC: parseFloat(
                            company.estimatedCosts
                        ),
                    },
                });
            }
        });

        var submission: SubmissionWithChildren = {
            submission: parent,
            children,
            local: local,
        };

        if (props.isDraft) {
            if (draft) {
                submission.submission.id = props.submission.id;

                try {
                    await RestAPI.updateDraft(submission);
                    toast(
                        <Toast
                            title={'Draft save'}
                            message={`Draft has been successfully saved.`}
                            type={'info'}
                        />
                    );
                } catch (err) {}
            } else {
                if (submissionValidation(submission).length !== 0) {
                    toast(
                        <Toast
                            title={'Mandatory fields are not filled'}
                            message={
                                'not all fields that are required were provided'
                            }
                            type={'error'}
                        />
                    );
                    return;
                }
                RestAPI.deleteDraft(props.submission.id).then(() => {
                    RestAPI.createSubmissionWithChildren(submission).then(
                        (response) => {
                            if (response.data.hasChanged) {
                                toast(
                                    <Toast
                                        title={
                                            'Project Number has been adjusted'
                                        }
                                        message={
                                            <p>
                                                Project Number changed to:{' '}
                                                <b>
                                                    {
                                                        response.data.submission
                                                            .data.projectNumber
                                                    }
                                                </b>
                                            </p>
                                        }
                                        type={'info'}
                                    />
                                );
                            }
                            toast(
                                <Toast
                                    title={'Project has been transferred'}
                                    message={
                                        <p>
                                            Project ({' '}
                                            <b>
                                                {
                                                    response.data.submission
                                                        .data.projectNumber
                                                }
                                            </b>{' '}
                                            ) has been transferred into the tool
                                        </p>
                                    }
                                    type={'success'}
                                />
                            );
                            props.history.push('/submissions');
                        }
                    );
                });
            }
        } else {
            if (draft) {
                RestAPI.createDraft(submission).then((response) => {
                    toast(
                        <Toast
                            title={'Draft save'}
                            message={`Draft has been successfully saved.`}
                            type={'info'}
                        />
                    );
                });
            } else {
                if (submissionValidation(submission).length !== 0) {
                    toast(
                        <Toast
                            title={'Mandatory fields are not filled'}
                            message={
                                'not all fields that are required were provided'
                            }
                            type={'error'}
                        />
                    );
                    return;
                }
                RestAPI.createSubmissionWithChildren(submission).then(
                    (response) => {
                        if (response.data.hasChanged) {
                            toast(
                                <Toast
                                    title={'Project Number has been adjusted'}
                                    message={
                                        <p>
                                            Project Number changed to:{' '}
                                            <b>
                                                {
                                                    response.data.submission
                                                        .data.projectNumber
                                                }
                                            </b>
                                        </p>
                                    }
                                    type={'info'}
                                />
                            );
                        }
                        toast(
                            <Toast
                                title={'Project has been transferred'}
                                message={
                                    <p>
                                        Project ({' '}
                                        <b>
                                            {
                                                response.data.submission.data
                                                    .projectNumber
                                            }
                                        </b>{' '}
                                        ) has been transferred into the tool
                                    </p>
                                }
                                type={'success'}
                            />
                        );
                        props.history.push('/submissions');
                    }
                );
            }
        }
    }

    function totalAlert(value: any, row: any, check: number, column: string) {
        if (value) {
            value = value.replace('%', '');
            var total = check - parseFloat(value);
            if (total < 0) {
                total = total * -1;
            }
            if (total > 0.02 && row === 'TOTAL') {
                setInputError(column);
                return useColorModeValue('red.300', '#ABB2BF');
            } else {
                if (inputError.indexOf(column) > -1) {
                    setInputError('');
                }
            }
        }
    }

    function onCostBreakdownTableChange(
        column: string,
        row: number,
        value: any
    ) {
        var table = [...costBreakdown];
        var sum = 0.0;
        var arr: string[] = [
            'contribution',
            'estimatedCosts',
            'contributionEur',
            'estimatedCostsEur',
        ];
        var total: number[] = [
            parseFloat(estimatedIncomeBudgetCurrency),
            parseFloat(estimatedCostsBudgetCurrency),
            parseFloat(estimatedIncome),
            parseFloat(estimatedCosts),
        ];
        var totalShare = 0.0;
        var totalContribution = 0.0;
        var totalCosts = 0.0;
        var totalContributionEur = 0.0;
        var totalCostsEur = 0.0;
        table[row][column] = value;
        table.forEach((c: any) => {
            sum += parseFloat(c[column]);
        });
        table.forEach((c: any) => {
            if (column === 'contribution') {
                c.share = ((c.contribution / sum) * 100).toFixed(2);
            }
            if (column === 'estimatedCosts') {
                c.share = ((c.estimatedCosts / sum) * 100).toFixed(2);
            }
        });
        table.forEach((row: any) => {
            arr.forEach((col: any, index: number) => {
                if (col !== column) {
                    if (
                        budgetSource.value === 'noBudget' &&
                        (col === 'contribution' || col === 'contributionEur')
                    ) {
                        row[col] = 0;
                    } else {
                        var s = row.share;

                        if (row[column] !== undefined) {
                            s = (row[column] / sum) * 100;
                        }
                        row[col] = ((s * total[index!]) / 100).toFixed(2);
                    }
                }
            });
            totalShare += parseFloat(row.share) || 0;
            totalContribution += parseFloat(row.contribution) || 0;
            totalCosts += parseFloat(row.estimatedCosts) || 0;
            totalContributionEur += parseFloat(row.contributionEur) || 0;
            totalCostsEur += parseFloat(row.estimatedCostsEur) || 0;
        });
        setTotalcbShare(totalShare.toFixed(2));
        setTotalcbContribution(totalContribution.toFixed(2));
        setTotalcbCosts(totalCosts.toFixed(2));
        setTotalcbContributionEur(totalContributionEur.toFixed(2));
        setTotalcbCostsEur(totalCostsEur.toFixed(2));
        setCostBreakdown(table);
    }
    function cellNumberAlert(value: any, row: any) {
        if (!Number.isNaN(value) && value !== '' && value !== 'NaN') {
            return;
        }
        if (row.vendor !== 'TOTAL') {
            return useColorModeValue('red.300', '#ABB2BF');
        }
    }
    function cellTextAlert(value: any, row: any) {
        if (value !== '') {
            return;
        }
        if (row.vendor !== 'TOTAL') {
            return useColorModeValue('red.300', '#ABB2BF');
        }
    }

    function cellDropDownAlert(value: any, row: any) {
        if (value !== '') {
            return false;
        }
        if (row.vendor !== 'TOTAL') {
            return true;
        } else return false;
    }

    function submissionValidation(submission: SubmissionWithChildren) {
        var fieldKeys: string[] = [];
        var nonMandatoryFields: string[] = [
            'targetAudience',
            'projectApprover',
            'projectApproval',
            'companyCode',
            'manufacturersFiscalQuarter',
            'comments',
            'countryCostEstimationEur',
            'countryBudgetContributionEur',
            'estimatedResultEUR',
            'estimatedCostsEUR',
            'estimatedResultCC',
            'additionalInformation',
            'status',
            'creditorNumber',
        ];
        var sub = submission.submission;
        if (sub.data.budgetSource === 'noBudget') {
            nonMandatoryFields.push('debitorNumber');
        }

        var countries = submission.children.filter(
            (el) => el.group === 'country'
        );
        countries.forEach((country: any) => {
            Object.keys(country.data).forEach((key: any) => {
                if (!nonMandatoryFields.includes(key)) {
                    if (key === 'estimatedIncomeEUR') {
                        if (
                            isNaN(country.data[key]) ||
                            country.data[key] === 0
                        ) {
                            fieldKeys.push('estimatedIncometable');
                        }
                    } else {
                        if (key === 'estimatedIncomeCC') {
                            if (
                                isNaN(country.data[key]) ||
                                country.data[key] === 0
                            ) {
                                fieldKeys.push('estimatedIncomeCCtable');
                            }
                        } else {
                            switch (typeof country.data[key]) {
                                case 'number':
                                    if (
                                        isNaN(country.data[key]) ||
                                        country.data[key] === 0
                                    ) {
                                        fieldKeys.push(key);
                                    }
                                    break;
                                case 'object':
                                    if (country.data[key] === null) {
                                        fieldKeys.push(key);
                                    }
                                    break;
                                case 'string':
                                    if (country.data[key] === '') {
                                        fieldKeys.push(key);
                                    }
                                    break;
                                case 'undefined':
                                    fieldKeys.push(key);
                                    break;
                            }
                        }
                    }
                }
            });
        });
        var vendor = submission.children.filter(
            (el) => el.group === 'vendor'
        )[0];
        Object.keys(sub.data).forEach((key: any) => {
            if (!nonMandatoryFields.includes(key)) {
                switch (typeof sub.data[key]) {
                    case 'number':
                        if (isNaN(sub.data[key])) {
                            fieldKeys.push(key);
                        }
                        break;
                    case 'object':
                        if (sub.data[key] === null) {
                            fieldKeys.push(key);
                        }
                        break;
                    case 'string':
                        if (sub.data[key] === '') {
                            fieldKeys.push(key);
                        }
                        break;
                    case 'undefined':
                        fieldKeys.push(key);
                        break;
                }
            }
        });
        Object.keys(vendor.data).forEach((key: any) => {
            if (!nonMandatoryFields.includes(key)) {
                switch (typeof vendor.data[key]) {
                    case 'number':
                        if (isNaN(vendor.data[key])) {
                            fieldKeys.push(key);
                        }
                        break;
                    case 'object':
                        if (vendor.data[key] === null) {
                            fieldKeys.push(key);
                        }
                        break;
                    case 'string':
                        if (vendor.data[key] === '') {
                            fieldKeys.push(key);
                        }
                        break;
                    case 'undefined':
                        fieldKeys.push(key);
                        break;
                }
            }
        });

        if (inputError !== '') {
            fieldKeys.push('total');
        }
        setInputErrors(fieldKeys);
        return fieldKeys;
    }

    return (
        <Box>
            <VStack spacing="20px" mb={'40px'} align="start">
                <Text mb="8px">
                    By using this form, the requestor confirms that the
                    requested marketing activity is officially approved by the
                    vendor/vendors and that requestor is able to provide such
                    approval for verification if needed
                </Text>
                <Text as="b">Requestor`s Details</Text>
                <Box w="100%">
                    <Text mb="8px">Requestor`s Company Name</Text>
                    <Select
                        menuPortalTarget={document.body}
                        styles={DefaultSelectStyles(useColorModeValue)}
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 6,
                            colors: {
                                ...theme.colors,
                                primary: '#3082CE',
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
                            switch (value.value.code) {
                                case '1550':
                                    vendorsAfterCompanySelect =
                                        AlsoInternationalVendorsNames;
                                    break;
                                case '6110':
                                    vendorsAfterCompanySelect = VendorsNames;
                                    break;
                                case '1010':
                                    vendorsAfterCompanySelect =
                                        AlsoInternationalVendorsNames;
                                    break;
                                default:
                                    var temp = { ...vendor };
                                    temp.manufacturer = '';
                                    temp.creditor = '';
                                    temp.debitor = '';
                                    temp.bu = '';
                                    temp.ph = { label: '', value: '' };
                                    setVendor(temp);
                                    setVendorName('');
                                    vendorsAfterCompanySelect = [];
                            }
                            setRequestorsCompanyName(value);
                            setOrganizingCompany(value.value.country);
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
                            bg={useColorModeValue('white', '#2C313C')}
                            color={useColorModeValue('gray.800', '#ABB2BF')}
                        />
                    </Box>
                    <Box w="100%">
                        <Text mb="8px">Requestor`s Country</Text>
                        <Input
                            defaultValue={requestorsCompanyName.value.country}
                            disabled
                            bg={useColorModeValue('white', '#2C313C')}
                            color={useColorModeValue('gray.800', '#ABB2BF')}
                        />
                    </Box>
                </HStack>
                <Alert
                    status="error"
                    display={
                        requestorsCompanyName.value.code !== '6110' &&
                        requestorsCompanyName.value.code !== ''
                            ? 'flex'
                            : 'none'
                    }
                >
                    <AlertIcon />
                    <AlertDescription>
                        Please note no actual project for 1550 will be created
                        in the tool just yet, this still needs to be done via
                        the usual process. But a project for Switzerland will be
                        created if they are part of the campaign, as they are
                        using the tool. Other countries and 1550 will follow.
                    </AlertDescription>
                </Alert>
                <Box w="100%" hidden={true}>
                    <Text mb="8px">Organizing Company</Text>
                    <Select
                        menuPortalTarget={document.body}
                        styles={DefaultSelectStyles(
                            useColorModeValue,
                            inputErrors.includes('organizingCompany')
                        )}
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 6,
                            colors: {
                                ...theme.colors,
                                primary: '#3082CE',
                            },
                        })}
                        value={{
                            label: organizingCompany,
                            value: organizingCompany,
                        }}
                        onChange={(selected: any) => {
                            setOrganizingCompany(selected.value);
                        }}
                        classNamePrefix="select"
                        isClearable={false}
                        name="organizingCompany"
                        options={Companies.map((company) => {
                            return {
                                label: company.value.country,
                                value: company.value.country,
                            };
                        })}
                    />
                </Box>
                <Text as="b">Campaign`s Details</Text>

                <Box w="100%">
                    <Text mb="8px">
                        Campaign Name (40 characters limit. Naming Convention:
                        'Vendor Name 1' 'Vendor Name 2'... 'Campaign Name')
                    </Text>
                    <Input
                        isInvalid={inputErrors.includes('campaignName')}
                        maxLength={40}
                        value={campaignName}
                        onChange={(event) => {
                            setCampaignName(event.target.value);
                            // setInputErrors(inputErrors.filter((e) => e !== "campaignName"));
                        }}
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
                    />
                </Box>

                <Box w="100%">
                    <Text mb="8px">Campaign Description</Text>
                    <Textarea
                        value={campaignDescription}
                        isInvalid={inputErrors.includes('campaignDescription')}
                        onChange={(event) => {
                            setCampaignDescription(event.target.value);
                        }}
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
                        size="md"
                        resize={'vertical'}
                        rows={5}
                    />
                </Box>
                <Box w="100%">
                    <Text mb="8px">Campaign Channel</Text>
                    <Select
                        menuPortalTarget={document.body}
                        styles={DefaultSelectStyles(
                            useColorModeValue,
                            inputErrors.includes('campaignChannel')
                        )}
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 6,
                            colors: {
                                ...theme.colors,
                                primary: '#3082CE',
                            },
                        })}
                        value={campaignChannel}
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
                        styles={DefaultSelectStyles(
                            useColorModeValue,
                            inputErrors.includes('year')
                        )}
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 6,
                            colors: {
                                ...theme.colors,
                                primary: '#3082CE',
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
                    <Text mb="8px">
                        Campaign/Project Start Quarter (ALSO Quarter)
                    </Text>
                    <Select
                        menuPortalTarget={document.body}
                        styles={DefaultSelectStyles(
                            useColorModeValue,
                            inputErrors.includes('projectStartQuarter')
                        )}
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 6,
                            colors: {
                                ...theme.colors,
                                primary: '#3082CE',
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
                        isInvalid={inputErrors.includes('projectNumber')}
                        value={projectNumber}
                        onChange={(event) => {
                            if (event.target.value.length < 13) {
                                setProjectNumber(event.target.value);
                            }
                        }}
                        // disabled
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
                    />
                </Box>
                <Box w="100%">
                    <Text mb="8px">Requestor`s Name</Text>
                    <Input
                        value={requestorsName}
                        isInvalid={inputErrors.includes('requestorsName')}
                        onChange={(event) =>
                            setRequestorsName(event.target.value)
                        }
                        // disabled
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
                    />
                </Box>
                <HStack w="100%">
                    <Box w="100%">
                        <Text mb="8px">Campaign Start Date</Text>
                        <DatePicker
                            customInput={
                                <Input
                                    isInvalid={inputErrors.includes(
                                        'campaignStartDate'
                                    )}
                                    bg={useColorModeValue('white', '#2C313C')}
                                    color={useColorModeValue(
                                        'gray.800',
                                        '#ABB2BF'
                                    )}
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
                            required={true}
                            customInput={
                                <Input
                                    isInvalid={inputErrors.includes(
                                        'campaignEndDate'
                                    )}
                                    bg={useColorModeValue('white', '#2C313C')}
                                    color={useColorModeValue(
                                        'gray.800',
                                        '#ABB2BF'
                                    )}
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
                        styles={DefaultSelectStyles(
                            useColorModeValue,
                            inputErrors.includes('budgetSource')
                        )}
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 6,
                            colors: {
                                ...theme.colors,
                                primary: '#3082CE',
                            },
                        })}
                        value={budgetSource}
                        onChange={(value) => {
                            setBudgetSource(value);
                            if (costBreakdown.length > 0) {
                                if (
                                    costBreakdown[0]['estimatedCosts'].value !==
                                    undefined
                                ) {
                                    onCostBreakdownTableChange(
                                        'estimatedCosts',
                                        0,
                                        costBreakdown[0]['estimatedCosts'].value
                                    );
                                }
                            }
                        }}
                        placeholder=""
                        classNamePrefix="select"
                        isClearable={false}
                        name="fiscalQuarter"
                        options={Budget}
                    />
                </Box>
                <Box w="100%">
                    <Text mb="8px">Local Currency</Text>
                    <Input
                        isInvalid={inputErrors.includes(
                            'requestorsCompanyName'
                        )}
                        defaultValue={requestorsCompanyName.value.currency}
                        disabled
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
                    />
                </Box>
                <Box w="100%">
                    <Text mb="8px">Campaign Currency</Text>
                    <Select
                        menuPortalTarget={document.body}
                        styles={DefaultSelectStyles(
                            useColorModeValue,
                            inputErrors.includes('campaignCurrency')
                        )}
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 6,
                            colors: {
                                ...theme.colors,
                                primary: '#3082CE',
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
                    <Text mb="8px">
                        Campaign Estimated Income in Campaign Currency
                    </Text>
                    <Input
                        isInvalid={inputErrors.includes('estimatedIncomeCC')}
                        disabled={budgetSource.value === 'noBudget'}
                        value={estimatedIncomeBudgetCurrency}
                        onChange={(event) => {
                            setEstimatedIncomeBudgetCurrency(
                                event.target.value
                            );
                        }}
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
                    />
                </Box>
                <Box w="100%">
                    <Text mb="8px">
                        Campaign Estimated Costs in Campaign Currency
                    </Text>
                    <Input
                        value={estimatedCostsBudgetCurrency}
                        isInvalid={inputErrors.includes(
                            'campaignEstimatedCostsBudgetsCurrency'
                        )}
                        onChange={(event) => {
                            setEstimatedCostsBudgetCurrency(event.target.value);
                        }}
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
                    />
                </Box>
                <Box w="100%">
                    <Text mb="8px">
                        {budgetSource.value === 'noBudget'
                            ? 'Campaign Loss in Campaign currency'
                            : 'Campaign Net Profit Target in Campaign Currency'}
                    </Text>
                    <Input
                        value={
                            netProfitTargetBudgetCurrency === 'NaN'
                                ? ''
                                : netProfitTargetBudgetCurrency
                        }
                        isInvalid={inputErrors.includes(
                            'campaignNetProfitTargetBudgetsCurrency'
                        )}
                        onChange={(event) => {
                            setNetProfitTargetBudgetCurrency(
                                event.target.value
                            );
                        }}
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
                    />
                </Box>
                <Box w="100%">
                    <Text mb="8px">Campaign Estimated Income in EUR</Text>
                    <Input
                        isInvalid={inputErrors.includes('estimatedIncomeEUR')}
                        value={estimatedIncome === 'NaN' ? '' : estimatedIncome}
                        onChange={(event) => {
                            setEstimatedIncome(event.target.value);
                        }}
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
                    />
                </Box>
                <Box w="100%">
                    <Text mb="8px">Campaign Estimated Costs in EUR</Text>
                    <Input
                        value={estimatedCosts === 'NaN' ? '' : estimatedCosts}
                        isInvalid={inputErrors.includes(
                            'campaignEstimatedCostsEur'
                        )}
                        onChange={(event) => {
                            setEstimatedCosts(event.target.value);
                        }}
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
                    />
                </Box>
                <Box w="100%">
                    <Text mb="8px">
                        {budgetSource.value === 'noBudget'
                            ? 'Campaign Loss in EUR'
                            : 'Campaign Net Profit Target in EUR'}
                    </Text>
                    <Input
                        // value={netProfitTarget}
                        value={netProfitTarget === 'NaN' ? '' : netProfitTarget}
                        isInvalid={inputErrors.includes(
                            'campaignNetProfitTargetEur'
                        )}
                        onChange={(event) => {
                            setNetProfitTarget(event.target.value);
                        }}
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
                    />
                </Box>
                <Box w="100%">
                    <Text mb="8px">
                        Total Estimated Costs in Local Currency
                    </Text>
                    <Input
                        value={
                            totalEstimatedCostsLC === 'NaN'
                                ? ''
                                : totalEstimatedCostsLC
                        }
                        isInvalid={inputErrors.includes(
                            'totalEstimatedCostsLC'
                        )}
                        onChange={(event) => {
                            setTotalEstimatedCostsLC(event.target.value);
                        }}
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
                    />
                </Box>

                <Box w="100%">
                    <Text mb="8px">Vendor Name</Text>
                    <Select
                        styles={DefaultSelectStyles(
                            useColorModeValue,
                            inputErrors.includes('vendorName')
                        )}
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 6,
                            colors: {
                                ...theme.colors,
                                primary: '#3082CE',
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
                        options={
                            vendorsAfterCompanySelect
                            // requestorsCompanyName.value.code === "1550"
                            //   ? AlsoInternationalVendorsNames
                            //   : VendorsNames
                        }
                    />
                </Box>
                <Box w="100%">
                    <Text mb="8px">VOD</Text>
                    <Input
                        value={vendor.debitor}
                        disabled={true}
                        isInvalid={inputErrors.includes('debitorNumber')}
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
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
                        disabled={budgetSource.value === 'noBudget'}
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
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
                        bg={useColorModeValue('white', '#2C313C')}
                        disabled={true}
                        isInvalid={inputErrors.includes('manufacturerNumber')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
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
                    <Select
                        styles={DefaultSelectStyles(
                            useColorModeValue,
                            inputErrors.includes('businessUnit')
                        )}
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 6,
                            colors: {
                                ...theme.colors,
                                primary: '#3082CE',
                            },
                        })}
                        value={{
                            label: vendor.bu,
                            value:
                                typeof vendor.bu === 'string'
                                    ? vendor.bu.substr(0, 3)
                                    : '',
                        }}
                        placeholder=""
                        onChange={(value: any) => {
                            var temp = { ...vendor };
                            temp.bu = value.label;
                            setVendor(temp);
                        }}
                        classNamePrefix="select"
                        isClearable={false}
                        name="BUs"
                        options={BUs}
                    />
                </Box>
                {/* <Box w="100%">
          <Text mb="8px">PH1</Text>
          <Select
            styles={DefaultSelectStyles(
              useColorModeValue,
              inputErrors.includes("PH1")
            )}
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
        </Box> */}

                <Box w="100%">
                    <Text mb="8px">Companies Participating</Text>
                    <Select
                        menuPortalTarget={document.body}
                        isMulti
                        styles={DefaultSelectStyles(
                            useColorModeValue,
                            inputErrors.includes('businessUnit')
                        )}
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 6,
                            colors: {
                                ...theme.colors,
                                primary: '#3082CE',
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
                    <Text mb="8px">Country Breakdown</Text>
                    <Table
                        className={`${useColorModeValue('', 'dark-table')}`}
                        rowClassName={(rowData: any) =>
                            `${useColorModeValue('', 'dark-table-row')}`
                        }
                        shouldUpdateScroll={false}
                        hover={false}
                        autoHeight
                        rowHeight={65}
                        data={[
                            ...costBreakdown,
                            {
                                companyName: 'TOTAL',
                                share: totalcbShare + '%',
                                contribution:
                                    totalcbContribution +
                                    ' ' +
                                    exchangeRates.label,
                                estimatedCosts:
                                    totalcbCosts + ' ' + exchangeRates.label,
                                contributionEur:
                                    totalcbContributionEur + ' EUR',
                                estimatedCostsEur: totalcbCostsEur + ' EUR',
                            },
                        ]}
                    >
                        <Column width={200} resizable>
                            <HeaderCell>Company Name</HeaderCell>
                            <Cell dataKey="companyName">
                                {(rowData, index) => (
                                    <Input
                                        disabled={
                                            rowData.companyName === 'TOTAL'
                                        }
                                        value={rowData.companyName}
                                        onChange={(event) => {
                                            var temp = [...costBreakdown];
                                            temp[index!].companyName =
                                                event.target.value;
                                            setCostBreakdown(temp);
                                        }}
                                        bg={cellTextAlert(
                                            rowData.companyName,
                                            rowData
                                        )}
                                    />
                                )}
                            </Cell>
                        </Column>

                        <Column width={200} resizable>
                            <HeaderCell>Company Code</HeaderCell>
                            <Cell dataKey="companyCode">
                                {(rowData, index) => (
                                    <Input
                                        disabled={
                                            rowData.companyName === 'TOTAL'
                                        }
                                        value={rowData.companyCode}
                                        onChange={(event) => {
                                            var temp = [...costBreakdown];
                                            temp[index!].companyCode =
                                                event.target.value;
                                            setCostBreakdown(temp);
                                        }}
                                        bg={cellTextAlert(
                                            rowData.companyCode,
                                            rowData
                                        )}
                                    />
                                )}
                            </Cell>
                        </Column>

                        <Column width={100} resizable>
                            <HeaderCell>Country</HeaderCell>
                            <Cell dataKey="country">
                                {(rowData, index) => (
                                    <Input
                                        disabled={
                                            rowData.companyName === 'TOTAL'
                                        }
                                        value={rowData.country}
                                        onChange={(event) => {
                                            var temp = [...costBreakdown];
                                            temp[index!].country =
                                                event.target.value;
                                            setCostBreakdown(temp);
                                        }}
                                        bg={cellTextAlert(
                                            rowData.country,
                                            rowData
                                        )}
                                    />
                                )}
                            </Cell>
                        </Column>

                        <Column width={200} resizable>
                            <HeaderCell>Contact Person's Email</HeaderCell>
                            <Cell dataKey="contactEmail">
                                {(rowData, index) => (
                                    <Input
                                        disabled={
                                            rowData.companyName === 'TOTAL'
                                        }
                                        value={rowData.contactEmail}
                                        onChange={(event) => {
                                            var temp = [...costBreakdown];
                                            temp[index!].contactEmail =
                                                event.target.value;
                                            setCostBreakdown(temp);
                                        }}
                                        bg={cellTextAlert(
                                            rowData.contactEmail,
                                            rowData
                                        )}
                                    />
                                )}
                            </Cell>
                        </Column>

                        <Column width={200} resizable>
                            <HeaderCell>Local Project Number</HeaderCell>
                            <Cell dataKey="projectNumber">
                                {(rowData, index) => (
                                    <Input
                                        disabled={
                                            rowData.companyName === 'TOTAL'
                                        }
                                        value={rowData.projectNumber}
                                        onChange={(event) => {
                                            var temp = [...costBreakdown];
                                            temp[index!].projectNumber =
                                                event.target.value;
                                            setCostBreakdown(temp);
                                        }}
                                        bg={cellTextAlert(
                                            rowData.projectNumber,
                                            rowData
                                        )}
                                    />
                                )}
                            </Cell>
                        </Column>
                        <Column width={100} resizable>
                            <HeaderCell>Share %</HeaderCell>
                            <Cell dataKey="share">
                                {(rowData, index) => (
                                    <Input
                                        disabled={
                                            rowData.companyName === 'TOTAL'
                                        }
                                        value={rowData.share}
                                        onChange={(event) => {
                                            onCostBreakdownTableChange(
                                                'share',
                                                index!,
                                                event.target.value
                                            );
                                        }}
                                        bg={totalAlert(
                                            rowData.share,
                                            rowData.companyName,
                                            100,
                                            'share'
                                        )}
                                        // onChange={(event) => {
                                        //   var temp = [...costBreakdown];
                                        //   temp[index!].share = event.target.value;
                                        //   setCostBreakdown(temp);
                                        // }}
                                    />
                                )}
                            </Cell>
                        </Column>
                        <Column width={400} resizable>
                            <HeaderCell>
                                Budget Contribution in Campaign Currency
                            </HeaderCell>
                            <Cell dataKey="contribution">
                                {(rowData, index) => (
                                    <Input
                                        disabled={
                                            budgetSource.value === 'noBudget' ||
                                            rowData.companyName === 'TOTAL'
                                        }
                                        value={
                                            checkIsNan(rowData.contribution)
                                                ? ''
                                                : rowData.contribution
                                        }
                                        onChange={(event) => {
                                            onCostBreakdownTableChange(
                                                'contribution',
                                                index!,
                                                event.target.value
                                            );
                                            // var temp = [...costBreakdown];
                                            // temp[index!].contribution = event.target.value;
                                            // setCostBreakdown(temp);
                                        }}
                                        bg={totalAlert(
                                            totalcbContribution,
                                            rowData.companyName,
                                            parseFloat(
                                                estimatedIncomeBudgetCurrency
                                            ),
                                            'contribution'
                                        )}
                                    />
                                )}
                            </Cell>
                        </Column>
                        <Column width={400} resizable>
                            <HeaderCell>
                                Total Estimated Costs in Campaign Currency
                            </HeaderCell>
                            <Cell dataKey="estimatedCosts">
                                {(rowData, index) => (
                                    <Input
                                        disabled={
                                            rowData.companyName === 'TOTAL'
                                        }
                                        value={
                                            checkIsNan(rowData.estimatedCosts)
                                                ? ''
                                                : rowData.estimatedCosts
                                        }
                                        onChange={(event) => {
                                            onCostBreakdownTableChange(
                                                'estimatedCosts',
                                                index!,
                                                event.target.value
                                            );
                                            // var temp = [...costBreakdown];
                                            // temp[index!].estimatedCosts = event.target.value;
                                            // setCostBreakdown(temp);
                                        }}
                                        bg={totalAlert(
                                            totalcbCosts,
                                            rowData.companyName,
                                            parseFloat(
                                                estimatedCostsBudgetCurrency
                                            ),
                                            'estimatedCosts'
                                        )}
                                    />
                                )}
                            </Cell>
                        </Column>
                        <Column width={400} resizable>
                            <HeaderCell>Budget contribution in Euro</HeaderCell>
                            <Cell dataKey="budgetContributionEur">
                                {(rowData, index) => (
                                    <Input
                                        disabled={
                                            rowData.companyName === 'TOTAL'
                                        }
                                        value={
                                            checkIsNan(rowData.contributionEur)
                                                ? ''
                                                : rowData.contributionEur
                                        }
                                        onChange={(event) => {}}
                                        bg={totalAlert(
                                            totalcbContributionEur,
                                            rowData.companyName,
                                            parseFloat(estimatedIncome),
                                            'budgetContributionEur'
                                        )}
                                    />
                                )}
                            </Cell>
                        </Column>
                        <Column width={400} resizable>
                            <HeaderCell>
                                Total estimated costs in Euro
                            </HeaderCell>
                            <Cell dataKey="estimatedCostsEur">
                                {(rowData, index) => (
                                    <Input
                                        disabled={
                                            rowData.companyName === 'TOTAL'
                                        }
                                        value={
                                            checkIsNan(
                                                rowData.estimatedCostsEur
                                            )
                                                ? ''
                                                : rowData.estimatedCostsEur
                                        }
                                        onChange={(event) => {}}
                                        bg={totalAlert(
                                            totalcbCostsEur,
                                            rowData.companyName,
                                            parseFloat(estimatedCosts),
                                            'estimatedCostsEur'
                                        )}
                                    />
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
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
                        size="md"
                        resize={'vertical'}
                        rows={5}
                    />
                </Box>
            </VStack>
            <Box h="3em">
                <Button
                    float="right"
                    colorScheme={'blue'}
                    onClick={() => {
                        if (requestorsCompanyName.value.code === '6110') {
                            createSubmission(false, null);
                        } else {
                            if (
                                costBreakdown.some(
                                    (company: any) =>
                                        company.companyCode === '6110'
                                )
                            ) {
                                createSubmission(false, '6110');
                            }
                        }
                    }}
                    isDisabled={
                        requestorsCompanyName.value.code !== '6110' &&
                        !costBreakdown.some(
                            (company: any) => company.companyCode === '6110'
                        )
                    }
                >
                    Submit
                </Button>
                <Button
                    float="right"
                    mr="15px"
                    color={'white'}
                    bg={useColorModeValue('green.400', '#4D97E2')}
                    _hover={{
                        bg: useColorModeValue('green.300', '#377bbf'),
                    }}
                    onClick={() => {
                        interface FD {
                            [key: string]: any;
                        }
                        var formattedData = [];
                        formattedData.push(['Request', 'European One Vendor']);
                        formattedData.push([
                            'Requestor`s Company Name',
                            requestorsCompanyName.label,
                        ]);
                        formattedData.push([
                            'Requestor`s Company Code',
                            requestorsCompanyName.value.code,
                        ]);
                        formattedData.push([
                            'Requestor`s Country',
                            requestorsCompanyName.value.country,
                        ]);
                        formattedData.push([
                            'Organizing Company',
                            organizingCompany,
                        ]);
                        formattedData.push(['Campaign Name', campaignName]);
                        formattedData.push([
                            'Campaign Description',
                            campaignDescription,
                        ]);
                        formattedData.push([
                            'Campaign Channel',
                            campaignChannel.label,
                        ]);
                        formattedData.push(['Year', year.label]);
                        formattedData.push([
                            'Campaign/Project Start Quarter (ALSO Quarter)',
                            projectStartQuarter.label,
                        ]);
                        formattedData.push(['Project Number', projectNumber]);
                        formattedData.push([
                            'Requestor`s Name',
                            requestorsName,
                        ]);
                        formattedData.push([
                            'Campaign Start Date',
                            moment(startDate).format('DD.MM.yyyy'),
                        ]);
                        formattedData.push([
                            'Campaign End Date',
                            moment(endDate).format('DD.MM.yyyy'),
                        ]);
                        formattedData.push([
                            'Budget Source',
                            budgetSource.label,
                        ]);
                        formattedData.push([
                            'Local Currency',
                            requestorsCompanyName.value.currency,
                        ]);
                        formattedData.push([
                            'Campaign Currency',
                            exchangeRates.label,
                        ]);
                        formattedData.push([
                            'Campaign Estimated Income in Campaign Currency',
                            estimatedIncomeBudgetCurrency === '' ||
                            isNaN(parseFloat(estimatedIncomeBudgetCurrency))
                                ? 'N/A'
                                : parseFloat(estimatedIncomeBudgetCurrency),
                        ]);
                        formattedData.push([
                            'Campaign Estimated Costs in Campaign Currency',
                            estimatedCostsBudgetCurrency === '' ||
                            isNaN(parseFloat(estimatedCostsBudgetCurrency))
                                ? 'N/A'
                                : parseFloat(estimatedCostsBudgetCurrency),
                        ]);
                        formattedData.push([
                            'Campaign Net Profit Target in Campaign Currency',
                            netProfitTargetBudgetCurrency === '' ||
                            isNaN(parseFloat(netProfitTargetBudgetCurrency))
                                ? 'N/A'
                                : parseFloat(netProfitTargetBudgetCurrency),
                        ]);
                        formattedData.push([
                            'Campaign Estimated Income in EUR',
                            estimatedIncome === '' ||
                            isNaN(parseFloat(estimatedIncome))
                                ? 'N/A'
                                : parseFloat(estimatedIncome),
                        ]);
                        formattedData.push([
                            'Campaign Estimated Costs in EUR',
                            estimatedCosts === '' ||
                            isNaN(parseFloat(estimatedCosts))
                                ? 'N/A'
                                : parseFloat(estimatedCosts),
                        ]);
                        formattedData.push([
                            'Campaign Net Profit Target in EUR',
                            netProfitTarget === '' ||
                            isNaN(parseFloat(netProfitTarget))
                                ? 'N/A'
                                : parseFloat(netProfitTarget),
                        ]);
                        formattedData.push([
                            'Total Estimated Costs in Local Currency',
                            totalEstimatedCostsLC === '' ||
                            isNaN(parseFloat(totalEstimatedCostsLC))
                                ? 'N/A'
                                : parseFloat(totalEstimatedCostsLC),
                        ]);
                        formattedData.push(['Vendor Name', vendorName.label]);
                        formattedData.push(['VOD', vendor.debitor]);
                        formattedData.push(['Creditor', vendor.creditor]);
                        formattedData.push([
                            'Manufacturer',
                            vendor.manufacturer,
                        ]);
                        formattedData.push(['Business Unit', vendor.bu]);
                        // formattedData.push(["PH1", vendor.ph.label]);
                        formattedData.push(['Comments', comments]);
                        formattedData.push([
                            'Companies Participating',
                            companiesParticipating
                                .map((v: any) => v.label)
                                .join(', '),
                        ]);
                        formattedData.push([]);
                        formattedData.push([
                            'Company Name',
                            'Company Code',
                            'Country',
                            "Contact Person's Email",
                            'Local Project Number',
                            'Share %',
                            'Budget Contribution in Campaign Currency',
                            'Total Estimated Costs in Campaign Currency',
                            'Budget Contribution in EUR',
                            'Total Estimated Costs in EUR',
                        ]);
                        costBreakdown.forEach((company: any) => {
                            formattedData.push([
                                company.companyName,
                                company.companyCode,
                                company.country,
                                company.contactEmail,
                                company.projectNumber,
                                parseFloat(company.share),
                                parseFloat(company.contribution),
                                parseFloat(company.estimatedCosts),
                                parseFloat(company.contributionEur),
                                parseFloat(company.estimatedCostsEur),
                            ]);
                        });
                        formattedData.push([
                            'TOTAL',
                            '',
                            '',
                            '',
                            '',
                            totalcbShare + '%',
                            totalcbContribution + ' ' + exchangeRates.label,
                            totalcbCosts + ' ' + exchangeRates.label,
                            totalcbContributionEur + ' EUR',
                            totalcbCostsEur + ' EUR',
                        ]);
                        var ws = XLSX.utils.aoa_to_sheet(formattedData);
                        const wb = {
                            Sheets: { data: ws },
                            SheetNames: ['data'],
                        };
                        const excelBuffer = XLSX.write(wb, {
                            bookType: 'xlsx',
                            type: 'array',
                        });
                        const data = new Blob([excelBuffer], {
                            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
                        });
                        FileSaver.saveAs(data, campaignName + '.xlsx');
                    }}
                >
                    Export
                </Button>
                <Button
                    float="right"
                    mr="15px"
                    color={'white'}
                    bg={useColorModeValue('blue.400', '#4D97E2')}
                    _hover={{
                        bg: useColorModeValue('blue.300', '#377bbf'),
                    }}
                    onClick={() => {
                        createSubmission(true, null);
                    }}
                >
                    {props.isDraft ? 'Save to draft' : 'Save to draft'}
                </Button>
            </Box>
        </Box>
    );
}
