/* eslint-disable react-hooks/rules-of-hooks */
import React, { useReducer } from 'react';
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
    AlertTitle,
    AlertDescription,
    AlertIcon,
    Alert,
} from '@chakra-ui/react';
import Project from '../../../types/project';
import Select from 'react-select';
import { getAccountInfo } from '../../../utils/MsGraphApiCall';
import DatePicker from 'react-datepicker';
import isEqual from 'lodash/isEqual';
import { toast } from 'react-toastify';
import Toast from '../../Toast';

import { Table, Uploader } from 'rsuite';
import { Submission, SubmissionWithChildren } from '../../../types/submission';
import { RestAPI } from '../../../api/rest';
import moment from 'moment';
import FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import RequestorCompanyName from './RequestorCompanyName/RequestorCompanyName';
import CountryBreakdown from './CountryBreakdown/CountryBreakdown';
import { DefaultSelectStyles } from '../../../utils/Styles';
import VendorNames from '../LocalMulti/VendorNames/VendorNames';
import VendorsTable from '../LocalMulti/VendorsTable/VendorsTable';

var VendorsNames: any[] = [];
var AlsoInternationalVendorsNames: any[] = [];
var vendorsAfterCompanySelect: string[] = [];

var PH1: any[] = [];
var Companies: any[] = [];
var CampaignChannel: any[] = [];
var TargetAudience: any[] = [];
var Budget: any[] = [];
var ExchangeRates: any[] = [];
var FiscalQuarter: any[] = [];
var Year: any[] = [];
var ProjectStartQuarter: any[] = [];
var BUs: any[] = [];

const { Column, HeaderCell, Cell } = Table;

interface Props {
    history: any;
    project: Project;
    submission?: any;
    children?: any[];
    isDraft?: boolean;
}

export default function Ermv(props: Props) {
    const [requestorsCompanyName, setRequestorsCompanyName] = useState<any>({
        label: '',
        value: { name: '', code: '', country: '' },
    });
    const [localExchangeRate, setLocalExchangeRate] = useState(0.0);
    const [campaignName, setCampaignName] = useState('');
    const [campaignDescription, setCampaignDescription] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [campaignChannel, setCampaignChannel] = useState<any>({
        label: '',
        value: '',
    });

    const [vendorsOptions, setVendorOptions] = useState<any>([]);
    const [vendorsSelectOptions, setVendorSelectOptions] = useState<any>([]);
    //selected vendors
    const [vendorsNames, setVendorsNames] = useState<any>([]);
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
    const [startDate, setStartDate] = useState<any>(null);
    const [endDate, setEndDate] = useState<any>(null);
    const [budgetSource, setBudgetSource] = useState<any>({
        label: '',
        value: '',
    });
    const [budgetApprovedByVendor, setBudgetApprovedByVendor] = useState('');
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
    const [estimatedIncomeEuro, setEstimatedIncomeEuro] = useState('');
    const [estimatedCostsEuro, setEstimatedCostsEuro] = useState('');
    const [netProfitTarget, setNetProfitTarget] = useState('');
    const [companiesParticipating, setCompaniesParticipating] = useState<any>(
        []
    );
    const [comments, setComments] = useState('');
    //selected vendors - table data
    const [vendors, setVendors] = useState<any>([]);
    const [countryBreakdown, setCountryBreakdown] = useState<any>([]);

    // const [totalVendorBudgetInLC, setTotalVendorBudgetInLC] = useState(0);
    // const [totalVendorBudgetInEUR, setTotalVendorBudgetInEUR] = useState(0);

    const [totalEstimatedCostsLC, setTotalEstimatedCostsLC] = useState('');

    const [totalcbShare, setTotalcbShare] = useState('0');
    const [totalcbContribution, setTotalcbContribution] = useState('0.00');
    const [totalcbCosts, setTotalcbCosts] = useState('0.00');
    const [showErrors, setShowErrors] = useState(false);

    const getTotalVendorsBudget = () => {
        let total = 0;
        vendors?.forEach((v: any, index: number) => {
            if (index === vendors.length - 1) {
                return;
            }
            const budgetNum = Number(v.eurBudget);

            if (!isNaN(budgetNum)) {
                total += budgetNum;
            }
        });
        return total;
    };

    const vendorBudgetInEUR = getTotalVendorsBudget();

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
            setCampaignName(props.submission.data.campaignName ?? '');
            setCampaignDescription(
                props.submission.data.campaignDescription ?? ''
            );
            setTargetAudience(props.submission.data.targetAudience ?? '');
            setCampaignChannel({
                label: props.submission.data.campaignChannel ?? '',
                value: props.submission.data.campaignChannel ?? '',
            });
            setYear({
                label: props.submission.data.year ?? '',
                value: props.submission.data.year ?? '',
            });
            setProjectStartQuarter({
                label: props.submission.data.projectStartQuarter ?? '',
                value: props.submission.data.projectStartQuarter ?? '',
            });
            setProjectNumber(props.submission.data.projectNumber ?? '');
            setRequestorsName(props.submission.data.requestorsName ?? '');
            setFiscalQuarter({
                label: props.submission.data.manufacturersFiscalQuarter ?? '',
                value: props.submission.data.manufacturersFiscalQuarter ?? '',
            });
            setStartDate(
                new Date(props.submission.data.campaignStartDate) || null
            );
            setEndDate(new Date(props.submission.data.campaignEndDate) || null);
            setBudgetSource({
                label: props.submission.data.budgetSource ?? '',
                value: props.submission.data.budgetSource ?? '',
            });
            setBudgetApprovedByVendor(
                props.submission.data.budgetApprovedByVendor ?? ''
            );
            setExchangeRates({
                label: props.submission.data.campaignBudgetsCurrency ?? '',
                value: props.submission.data.campaignBudgetsCurrency ?? '',
            });
            setEstimatedIncomeBudgetCurrency(
                (
                    props.submission.data
                        .campaignEstimatedIncomeBudgetsCurrency ?? 0
                ).toFixed(2)
            );
            setEstimatedIncomeEuro(
                (props.submission.data.campaignEstimatedIncomeEur || 0).toFixed(
                    2
                )
            );
            setEstimatedCostsEuro(
                (props.submission.data.campaignEstimatedCostsEur || 0).toFixed(
                    2
                )
            );
            setNetProfitTarget(
                (props.submission.data.campaignNetProfitTargetEur || 0).toFixed(
                    2
                )
            );
            setEstimatedCostsBudgetCurrency(
                (
                    props.submission.data
                        .campaignEstimatedCostsBudgetsCurrency ?? 0
                ).toFixed(2)
            );
            setNetProfitTargetBudgetCurrency(
                (
                    props.submission.data
                        .campaignNetProfitTargetBudgetsCurrency ?? 0
                ).toFixed(2)
            );
            setComments(props.submission.data.comments ?? '');
            setTotalEstimatedCostsLC(
                (props.submission.data.totalEstimatedCostsLC || 0).toFixed(2)
            );
            setLocalExchangeRate(
                parseFloat(
                    (
                        ExchangeRates.find(
                            (rate) =>
                                rate.label ===
                                props.submission.data.localCurrency
                        ) || '0'
                    ).value
                )
            );

            //
            if (props.children && props.children.length > 0) {
                setVendorsNames(
                    props.children
                        .filter((s) => s.group === 'vendor')
                        .map((s) => {
                            return {
                                label: s.data.vendorName,
                                value: s.data.vendorName,
                            };
                        })
                );
                setCompaniesParticipating(
                    props.children
                        .filter((s) => s.group === 'country')
                        .map((s) => {
                            return {
                                label: s.data.companyName,
                                value: s.data.companyName,
                            };
                        })
                );
                var v: any[] = [];
                var c: any[] = [];

                props.children
                    .filter((s) => s.group === 'country')
                    .forEach((s) => {
                        c.push({
                            companyName: s.data.companyName,
                            companyCode: s.data.countryCodeEMEA,
                            country: s.data.countriesEMEA,
                            contactEmail: s.data.productionProjectManager,
                            projectNumber: s.data.parentProjectNumber,
                            share: (s.data.countryShare || 0).toFixed(2),
                            contribution: (
                                s.data.countryBudgetContributionCC || 0
                            ).toFixed(2),
                            estimatedCosts: (
                                s.data.countryCostEstimationCC || 0
                            ).toFixed(2),
                        });
                    });
                setCountryBreakdown([...c]);

                props.children
                    .filter((s) => s.group === 'vendor')
                    .forEach((s) => {
                        v.push({
                            vendor: s.data.vendorName,
                            projectManager: s.data.marketingResponsible,
                            creditor: s.data.creditorNumber,
                            debitor: s.data.debitorNumber,
                            manufacturer: s.data.manufacturerNumber,
                            bu: s.data.businessUnit,
                            ph: { label: s.data.PH1, value: s.data.PH1 },
                            budgetCurrency: {
                                label: s.data.vendorBudgetCurrency,
                                value: (
                                    ExchangeRates.find(
                                        (er) =>
                                            er.label ===
                                            s.data.vendorBudgetCurrency
                                    ) || { value: '' }
                                ).value,
                            },
                            budgetAmount: (
                                s.data.vendorBudgetAmount || 0
                            ).toFixed(2),
                            localBudget: (s.data.vendorAmount || 0).toFixed(2),
                            eurBudget: (s.data.estimatedIncomeEUR || 0).toFixed(
                                2
                            ),
                            share: s.data.vendorShare.toFixed(0) || '0',
                            estimatedCostsCC: (
                                s.data.estimatedCostsCC || 0
                            ).toFixed(2),
                            estimatedIncomeCC: (
                                s.data.estimatedIncomeCC || 0
                            ).toFixed(2),
                            estimatedCostsLC: '0.00',
                            estimatedCostsEUR: (
                                s.data.estimatedCostsEUR || 0
                            ).toFixed(2),
                            netProfitTargetVC: (
                                s.data.estimatedResultCC || 0
                            ).toFixed(2),
                            netProfitTargetLC: (
                                s.data.estimatedResultBC || 0
                            ).toFixed(2),
                            netProfitTargetEUR: (
                                s.data.estimatedResultEUR || 0
                            ).toFixed(2),
                        });
                    });
                v.push({
                    vendor: 'TOTAL',
                    projectManager: '',
                    creditor: '',
                    debitor: '',
                    manufacturer: '',
                    bu: '',
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
                setVendors([...v]);
            }
        }
    }, [props.submission, props.children, ExchangeRates]);

    async function fetchDropdowns() {
        var dropdownsIds: string[] = [
            '619b630a9a5a2bb37a93b23b',
            '619b61419a5a2bb37a93b237',
            '619b63429a5a2bb37a93b23d',
            '619b62d79a5a2bb37a93b239',
            '619b632c9a5a2bb37a93b23c',
            '619b62959a5a2bb37a93b238',
            '619b62f29a5a2bb37a93b23a',
            '619b66defe27d06ad17d75ac',
            '619b6754fe27d06ad17d75ad',
            '619b6799fe27d06ad17d75ae',
            '63295a2ef26db37a14557092',
            '6391eea09a3d043b9a89d767',
            '636abbd43927f9c7703b19c4',
        ];
        var responses = await Promise.all(
            dropdownsIds.map((di) => {
                return RestAPI.getDropdownValues(di);
            })
        );
        PH1 = responses[0].data;
        Companies = responses[1].data;
        CampaignChannel = responses[3].data;
        TargetAudience = responses[4].data;
        Budget = responses[5].data;
        ExchangeRates = responses[6].data;
        FiscalQuarter = responses[7].data;
        Year = responses[8].data;
        ProjectStartQuarter = responses[9].data;
        BUs = responses[10].data;
        VendorsNames = responses[11].data;
        AlsoInternationalVendorsNames= responses[12].data;
    }

    useEffect(() => {
        if (countryBreakdown) {
            const temp = countryBreakdown.map((country: any) => {
                const firstPart = country.projectNumber.substring(0, 4);
                const secondPart = projectNumber.substring(4, 12);
                return {
                    ...country,
                    projectNumber: `${firstPart}${secondPart}`,
                };
            });

            setCountryBreakdown(temp);
        }
    }, [projectNumber]);

    useEffect(() => {
        if (props.submission) {
            return;
        }
        setTotalEstimatedCostsLC(
            (parseFloat(estimatedCostsEuro) * localExchangeRate).toFixed(2)
        );
    }, [estimatedCostsEuro, localExchangeRate]);

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
        switch (requestorsCompanyName?.value?.code) {
            case '6110':
                vendorsAfterCompanySelect = VendorsNames;
                break;
            case '1550':
                vendorsAfterCompanySelect = AlsoInternationalVendorsNames;
                break;
            case '1010':
                vendorsAfterCompanySelect = AlsoInternationalVendorsNames;
                break;
            default:
                vendorsAfterCompanySelect = [];
                break;
        }
    }, [requestorsCompanyName?.value?.code]);

    useEffect(() => {
        if (props.submission) {
            return;
        }
        var data: any = [];

        companiesParticipating.forEach((company: any) => {
            data.push({
                companyName: company.label,
                companyCode: company.value.code,
                country: company.value.country,
                contactEmail: '',
                projectNumber: `${company.value?.code}${projectNumber.substring(
                    4,
                    12
                )}`,
                contribution: '',
                estimatedCosts: '',
                share: '',
                contributionEur: '',
                estimatedCostsEur: '',
            });
        });
        setCountryBreakdown(data);
    }, [companiesParticipating]);

    useEffect(() => {
        // if (props.submission) {
        //   return;
        // }
        var totalShare = 0.0;
        var totalContribution = 0.0;
        var totalCosts = 0.0;
        var temp = [...countryBreakdown];
        temp.forEach((row: any) => {
            if (budgetSource.value === 'noBudget') {
                row.contribution = '0.00';
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

            totalShare += parseFloat(row.share) || 0;
            totalContribution += parseFloat(row.contribution) || 0;
            totalCosts += parseFloat(row.estimatedCosts) || 0;
        });
        if (!isEqual(countryBreakdown, temp)) {
            setCountryBreakdown(temp);
        }
        setTotalcbShare(totalShare.toFixed(0));
        setTotalcbContribution(totalContribution.toFixed(2));
        setTotalcbCosts(totalCosts.toFixed(2));
    }, [
        countryBreakdown,
        estimatedIncomeBudgetCurrency,
        estimatedCostsBudgetCurrency,
    ]);

    useEffect(() => {
        if (props.submission) {
            return;
        }
        const newEstimatedCostEuro =
            parseFloat(estimatedCostsBudgetCurrency) /
            parseFloat(exchangeRates.value);

        setEstimatedCostsEuro(newEstimatedCostEuro.toFixed(2));
        let tempCountryBreakdown = countryBreakdown.map((c: any) => {
            const shareNum = Number(c.share);

            if (
                shareNum &&
                !isNaN(c.share) &&
                newEstimatedCostEuro &&
                !isNaN(newEstimatedCostEuro)
            ) {
                const tempCostShare = newEstimatedCostEuro * (shareNum / 100);
                return { ...c, estimatedCostsEur: tempCostShare.toFixed(2) };
            }
            return c;
        });

        if (budgetSource.value === 'noBudget') {
            setCountryBreakdown(tempCountryBreakdown);
        }

        if (budgetSource.value !== 'noBudget') {
            const newEstimatedIncomeEuro =
                parseFloat(estimatedIncomeBudgetCurrency) /
                parseFloat(exchangeRates.value);
            setEstimatedIncomeEuro(newEstimatedIncomeEuro.toFixed(2));

            tempCountryBreakdown = tempCountryBreakdown.map((c: any) => {
                const shareNum = Number(c.share);

                if (
                    shareNum &&
                    !isNaN(c.share) &&
                    newEstimatedIncomeEuro &&
                    !isNaN(newEstimatedIncomeEuro)
                ) {
                    const tempContributionShare =
                        newEstimatedIncomeEuro * (shareNum / 100);
                    return {
                        ...c,
                        contributionEur: tempContributionShare.toFixed(2),
                    };
                }
                return c;
            });
            setCountryBreakdown(tempCountryBreakdown);

            setNetProfitTarget(
                (
                    parseFloat(estimatedIncomeEuro) -
                    parseFloat(estimatedCostsEuro)
                )
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
            setNetProfitTarget(estimatedCostsEuro);
            setNetProfitTargetBudgetCurrency(estimatedCostsBudgetCurrency);
        }
    }, [
        budgetSource,
        estimatedIncomeEuro,
        estimatedCostsEuro,
        exchangeRates,
        estimatedIncomeBudgetCurrency,
        estimatedCostsBudgetCurrency,
    ]);

    useEffect(() => {
        if (props.submission) {
            return;
        }
        setProjectNumber(
            (requestorsCompanyName.value.code === ''
                ? '????'
                : requestorsCompanyName.value.code) +
                (requestorsCompanyName.value.country === ''
                    ? '??'
                    : requestorsCompanyName.value.country) +
                (year.value === '' ? '??' : year.value) +
                (campaignChannel.value === '' ? '?' : campaignChannel.value) +
                (projectStartQuarter.value === ''
                    ? '?'
                    : projectStartQuarter.value.slice(1)) +
                '01'
        );
    }, [year, campaignChannel, projectStartQuarter, requestorsCompanyName]);

    useEffect(() => {
        // if (props.submission) {
        //   return;
        // }
        var totalBudgetEur = 0;
        var totalBudgetLC = 0;
        var totalCostsCC = parseFloat(estimatedCostsBudgetCurrency);
        var totalIncomeCC = parseFloat(estimatedIncomeBudgetCurrency);
        var totalCostsLC = parseFloat(totalEstimatedCostsLC);
        var totalCostsEur = parseFloat(estimatedCostsEuro);

        var temp = [...vendors];
        temp.slice(0, -1).forEach((row: any) => {
            row.eurBudget = (
                parseFloat(row.budgetAmount) /
                parseFloat(row.budgetCurrency.value)
            ).toFixed(2);
            row.localBudget = (
                parseFloat(row.eurBudget) * localExchangeRate
            ).toFixed(2);

            var eb = parseFloat(row.eurBudget);
            var lb = parseFloat(row.localBudget);

            if (!isNaN(eb)) {
                totalBudgetEur += eb;
            }
            if (!isNaN(lb)) {
                totalBudgetLC += lb;
            }
        });
        var totalVendorBudgetInLC = 0;
        var totalVendorBudgetInEUR = 0;
        var totalVendorShare = 0;
        var totalEstimatedIncomeInCC = 0;
        var totalEstimatedCostsInCC = 0;
        var totalEstimatedCostsInLC = 0;
        var totalEstimatedCostsInEUR = 0;
        var totalNetProfitTargetInCC = 0;
        var totalNetProfitTargetInLC = 0;
        var totalNetProfitTargetInEUR = 0;
        temp.slice(0, -1).forEach((row: any, index: number) => {
            var vbEur = parseFloat(row.eurBudget);
            var share = 0;
            if (budgetSource.value === 'noBudget') {
                row.budgetAmount = '0.00';
                row.localBudget = '0.00';
                row.eurBudget = '0.00';
                row.estimatedIncomeCC = '0.00';
                share = parseFloat(row.share) * 0.01;

                row.estimatedCostsCC = (
                    share * parseFloat(estimatedCostsBudgetCurrency)
                ).toFixed(2);

                row.estimatedCostsEUR = (
                    share * parseFloat(estimatedCostsEuro)
                ).toFixed(2);
                row.estimatedCostsLC = (
                    parseFloat(row.estimatedCostsEUR) * localExchangeRate
                ).toFixed(2);
            } else {
                share = vbEur / totalBudgetEur;
                row.share = (share * 100).toFixed(2);
                if (index === temp.length - 1) {
                    var totalShare = 0.0;
                    temp.slice(0, temp.length - 2).forEach(
                        (t) => (totalShare += parseFloat(t.share))
                    );
                    row.share = (100 - totalShare).toFixed(2);
                    share = (100 - totalShare) * 0.01;
                }
                if (!isNaN(vbEur) && totalBudgetEur !== 0) {
                    if (!isNaN(totalCostsCC)) {
                        row.estimatedCostsCC = (share * totalCostsCC).toFixed(
                            2
                        );
                    }
                    if (!isNaN(totalIncomeCC)) {
                        row.estimatedIncomeCC = (share * totalIncomeCC).toFixed(
                            2
                        );
                    }
                    if (!isNaN(totalCostsLC)) {
                        row.estimatedCostsLC = (share * totalCostsLC).toFixed(
                            2
                        );
                    }
                    if (!isNaN(totalCostsEur)) {
                        row.estimatedCostsEUR = (share * totalCostsEur).toFixed(
                            2
                        );
                    }
                }
            }
            row.netProfitTargetEUR =
                `${budgetSource.value === 'noBudget' ? '-' : ''}` +
                (
                    parseFloat(row.eurBudget) -
                    parseFloat(row.estimatedCostsEUR)
                ).toFixed(2);

            row.netProfitTargetLC = (
                parseFloat(row.localBudget) - parseFloat(row.estimatedCostsLC)
            ).toFixed(2);

            row.netProfitTargetVC =
                `${budgetSource.value === 'noBudget' ? '-' : ''}` +
                (share * parseFloat(netProfitTargetBudgetCurrency)).toFixed(2);

            totalVendorBudgetInLC += parseFloat(row.localBudget);
            totalVendorBudgetInEUR += parseFloat(row.eurBudget);
            totalVendorShare += parseFloat(row.share);
            totalEstimatedIncomeInCC += parseFloat(row.estimatedIncomeCC);
            totalEstimatedCostsInCC += parseFloat(row.estimatedCostsCC);
            totalEstimatedCostsInLC += parseFloat(row.estimatedCostsLC);
            totalEstimatedCostsInEUR += parseFloat(row.estimatedCostsEUR);
            totalNetProfitTargetInCC += parseFloat(row.netProfitTargetVC);
            totalNetProfitTargetInLC += parseFloat(row.netProfitTargetLC);
            totalNetProfitTargetInEUR += parseFloat(row.netProfitTargetEUR);
        });

        temp[temp.length - 1] = {
            vendor: 'TOTAL',
            projectManager: '',
            creditor: '',
            debitor: '',
            manufacturer: '',
            bu: '',
            ph: { label: '', value: '' },
            budgetCurrency: { label: '', value: '' },
            budgetAmount: '',
            localBudget: totalVendorBudgetInLC.toFixed(2),
            eurBudget: totalVendorBudgetInEUR.toFixed(2),
            share: totalVendorShare.toFixed(2),
            estimatedCostsCC: totalEstimatedCostsInCC.toFixed(2),
            estimatedIncomeCC: totalEstimatedIncomeInCC.toFixed(2),
            estimatedCostsLC: totalEstimatedCostsInLC.toFixed(2),
            estimatedCostsEUR: totalEstimatedCostsInEUR.toFixed(2),
            netProfitTargetVC: totalNetProfitTargetInCC.toFixed(2),
            netProfitTargetLC: totalNetProfitTargetInLC.toFixed(2),
            netProfitTargetEUR: totalNetProfitTargetInEUR.toFixed(2),
        };

        // setTotalVendorBudgetInEUR(totalBudgetEur);
        // setTotalVendorBudgetInLC(totalBudgetLC);
        if (!isEqual(vendors, temp)) {
            setVendors(temp);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        vendors,
        estimatedCostsBudgetCurrency,
        totalEstimatedCostsLC,
        budgetSource,
    ]);

    const isFormValid = () => {
        const requiredValues = [
            requestorsCompanyName?.label,
            campaignName,
            campaignDescription,
            campaignChannel?.label,
            year?.label,
            projectStartQuarter?.label,
            startDate,
            endDate,
            budgetSource?.label,
            exchangeRates?.label,
            estimatedIncomeBudgetCurrency,
            estimatedCostsBudgetCurrency,
            netProfitTargetBudgetCurrency,
            estimatedIncomeEuro,
            estimatedCostsEuro,
            totalEstimatedCostsLC,
            requestorsName,
            projectNumber,
            netProfitTarget,
        ];

        const numberValues = [
            netProfitTargetBudgetCurrency,
            netProfitTarget,
            totalEstimatedCostsLC,
            estimatedIncomeBudgetCurrency,
            estimatedCostsBudgetCurrency.replace,
            estimatedIncomeEuro,
            estimatedCostsEuro,
        ];

        const isNumbersValuesValid = numberValues.some(
            (v) => !isNaN(Number(v))
        );

        const vendorsNumValid = vendorsNames?.length >= 2;

        let vendorsBudgetSum = 0;
        let countryBreakdownPercents = 0;

        vendors.forEach((v: any, index: number) => {
            if (index === vendors.length - 1) {
                return;
            }

            // requiredValues.push(v.ph?.label);
            const budgetAmount = Number(v.eurBudget);
            if (!isNaN(budgetAmount) && v.eurBudget !== 'NaN') {
                vendorsBudgetSum += budgetAmount;
            }
            requiredValues.push(v.bu);
            requiredValues.push(v.budgetCurrency?.label);
        });

        countryBreakdown.forEach((v: any, index: number) => {
            const shareNum = Number(v.share);

            if (v.share && !isNaN(shareNum)) {
                countryBreakdownPercents += shareNum;
            }

            requiredValues.push(v.projectNumber);
            requiredValues.push(v.contactEmail);
            console.log('v.contactEmail', v.projectNumber);
        });

        const hasEmptyRequiredValues = requiredValues.some(
            (e) => !e || e === 'NaN'
        );
        const countryBreakdownPercentsValid = countryBreakdownPercents === 100;
        const vendorsBudgetValid =
            vendorsBudgetSum === Number(estimatedIncomeEuro);

        return (
            vendorsNumValid &&
            !hasEmptyRequiredValues &&
            vendorsBudgetValid &&
            countryBreakdownPercentsValid &&
            isNumbersValuesValid
        );
    };

    function cellTextAlert(value: any, row: any) {
        if (value !== '') {
        } else {
            if (row.vendor !== 'TOTAL') {
                return useColorModeValue('red.300', '#ABB2BF');
            }
        }
    }

    function cellDropDownAlert(value: any, row: any) {
        if (row.vendor === 'TOTAL') {
            return false;
        } 

        if(!value) {
            return true;
        }

        if (value?.label === '') {
            return true;
        } 

        return false;
    }

    function cellNumberAlert(value: any, row: any) {
        if (!Number.isNaN(value) && value !== '' && value !== 'NaN') {
        } else {
            if (row.vendor !== 'TOTAL') {
                return useColorModeValue('red.300', '#ABB2BF');
            }
        }
    }

    function totalAlert(value: any, row: any, check: number) {
        if (value) {
            if (
                (parseFloat(value) - check >= 0.02 ||
                    parseFloat(value) - check < -0.02) &&
                row === 'TOTAL'
            ) {
                return useColorModeValue('red.300', '#ABB2BF');
            }
        }
    }

    const draftSubmitHandler = (draft: boolean) => {
        var projectId = '619515b754e61c8dd33daa52';

        var parent: Submission = {
            project: projectId,
            title: campaignName,
            parentId: null,
            viewId: null,
            group: null,
            created: new Date(),
            updated: new Date(),
            status: 'New',
            author: requestorsName,
            data: {
                requestorsCompanyName: requestorsCompanyName.label,
                companyCode: requestorsCompanyName.value.code,
                requestorsCountry: requestorsCompanyName.value.country,
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
                projectApproval: projectApproval,
                manufacturersFiscalQuarter: fiscalQuarter.label,
                campaignStartDate:
                    startDate === null ? null : startDate.toString(),
                campaignEndDate: endDate === null ? null : endDate.toString(),
                budgetSource: budgetSource.label,
                budgetApprovedByVendor: budgetApprovedByVendor,
                campaignBudgetsCurrency: exchangeRates.label,
                campaignCurrency: exchangeRates.label,
                campaignEstimatedIncomeBudgetsCurrency: parseFloat(
                    estimatedIncomeBudgetCurrency
                ),
                campaignEstimatedCostsBudgetsCurrency: parseFloat(
                    estimatedCostsBudgetCurrency
                ),
                campaignNetProfitTargetBudgetsCurrency: parseFloat(
                    netProfitTargetBudgetCurrency
                ),
                campaignEstimatedIncomeEur: parseFloat(estimatedIncomeEuro),
                campaignEstimatedCostsEur: parseFloat(estimatedCostsEuro),
                campaignNetProfitTargetEur: parseFloat(netProfitTarget),
                totalEstimatedCostsLC: parseFloat(totalEstimatedCostsLC),
                comments: comments,
                additionalInformation: comments,
                localCurrency: requestorsCompanyName.value.currency,
                projectType: 'European Multi Vendor',
            },
        };
        var children: Submission[] = [];
        vendors.slice(0, -1).forEach((vendor: any) => {
            children.push({
                project: projectId,
                title: '',
                parentId: '',
                viewId: null,
                group: 'vendor',
                created: new Date(),
                updated: new Date(),
                status: 'New',
                author: requestorsName,
                data: {
                    projectType: 'European Multi Vendor',
                    vendorName: vendor.vendor,
                    projectNumber: projectNumber,
                    marketingResponsible: vendor.projectManager,
                    creditorNumber: vendor.creditor,
                    debitorNumber: vendor.debitor,
                    manufacturerNumber: vendor.manufacturer,
                    businessUnit: vendor.bu,
                    PH1: vendor.ph.label,
                    vendorBudgetCurrency:
                        budgetSource.value === 'noBudget'
                            ? 'N/A'
                            : vendor.budgetCurrency.label,
                    vendorAmount:
                        isNaN(parseFloat(vendor.localBudget)) ||
                        budgetSource.value === 'noBudget'
                            ? 0.0
                            : parseFloat(vendor.localBudget),
                    vendorBudgetAmount:
                        isNaN(parseFloat(vendor.budgetAmount)) ||
                        budgetSource.value === 'noBudget'
                            ? 0.0
                            : parseFloat(vendor.budgetAmount),
                    // cbbudgetEur: parseFloat(vendor.eurBudget),
                    vendorShare: parseFloat(vendor.share),
                    estimatedCostsCC: parseFloat(vendor.estimatedCostsCC),
                    estimatedIncomeCC:
                        budgetSource.value === 'noBudget'
                            ? 0.0
                            : parseFloat(vendor.estimatedIncomeCC),
                    estimatedResultCC: parseFloat(vendor.netProfitTargetVC),
                    // cbestimatedCostsLC: parseFloat(vendor.estimatedCostsLC),
                    estimatedIncomeEUR:
                        budgetSource.value === 'noBudget'
                            ? 0.0
                            : parseFloat(vendor.eurBudget),
                    estimatedCostsEUR: parseFloat(vendor.estimatedCostsEUR),
                    estimatedResultEUR: parseFloat(vendor.netProfitTargetEUR),
                    estimatedResultBC: parseFloat(vendor.netProfitTargetLC),
                },
            });
        });
        countryBreakdown.forEach((company: any) => {
            children.push({
                project: projectId,
                title: '',
                parentId: null,
                viewId: null,
                group: 'country',
                created: new Date(),
                updated: new Date(),
                status: 'New',
                author: requestorsName,
                data: {
                    projectName: campaignName,
                    additionalInformation: comments,
                    campaignChannel: campaignChannel.label,
                    parentProjectNumber:
                        company.companyCode + projectNumber.substring(4),
                    projectNumber: company.projectNumber,
                    campaignStartDate:
                        startDate === null ? null : startDate.toString(),
                    campaignEndDate:
                        endDate === null ? null : endDate.toString(),
                    budgetSource: budgetSource.label,
                    campaignCurrency: exchangeRates.label,
                    // vendorName: vendorName.label,
                    // businessUnit: vendor.bu,
                    // PH1: vendor.ph.label,
                    vendorShare: 100,
                    estimatedIncomeEUR:
                        budgetSource.value === 'noBudget'
                            ? 0.0
                            : parseFloat(estimatedIncomeEuro),
                    estimatedCostsEUR: parseFloat(estimatedCostsEuro),
                    estimatedResultEUR:
                        parseFloat(netProfitTarget) *
                        (budgetSource.value === 'noBudget' ? -1 : 1),
                    estimatedResultBC:
                        parseFloat(netProfitTargetBudgetCurrency) *
                        (budgetSource.value === 'noBudget' ? -1 : 1),
                    projectType: 'European Multi Vendor',
                    companyName: company.companyName,
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
                    countryCostEstimationCC: parseFloat(company.estimatedCosts),
                },
            });
        });
        var submission: SubmissionWithChildren = {
            submission: parent,
            children,
            local: null,
        };

        if (draft) {
            RestAPI.createDraft(submission).then(() => {
                toast(
                    <Toast
                        title={'Draft save'}
                        message={`Draft has been successfully saved.`}
                        type={'info'}
                    />
                );
            });
            return;
        }

        const isValid = isFormValid();

        if (!isValid) {
            setShowErrors(true);
            toast(
                <Toast
                    title={'Mandatory fields are not filled'}
                    message={'not all fields that are required were provided'}
                    type={'error'}
                />
            );
            return;
        }

        RestAPI.getSubmissions().then((response) => {
            var parentSubmissions = response.data.filter(
                (s) => s.parentId === null
            );
            let isUnique = false;
            let pn = projectNumber;
            while (!isUnique) {
                let found = false;
                for (let s of parentSubmissions) {
                    if (s.data.projectNumber === pn) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    isUnique = true;
                } else {
                    var newSuffix: any = parseInt(pn.slice(-2)) + 1;
                    newSuffix =
                        (newSuffix > 9 ? '' : '0') + newSuffix.toString();
                    pn = pn.slice(0, -2) + newSuffix;
                }
            }
            if (pn !== projectNumber) {
                // we changed project number. Notify user
                setProjectNumber(pn);
                toast(
                    <Toast
                        title={'SAP Response'}
                        message={`Project Number already exists. Changed to: ${pn}. Press submit again.`}
                        type={'info'}
                    />
                );
                return;
            } else {
                RestAPI.createSubmissionWithChildren(submission).then(
                    (response) => {
                        props.history.push('/submissions');
                    }
                );
            }
        });
    };

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
                <RequestorCompanyName
                    requestorsCompanyName={requestorsCompanyName}
                    ExchangeRates={ExchangeRates}
                    setLocalExchangeRate={setLocalExchangeRate}
                    setRequestorsCompanyName={setRequestorsCompanyName}
                    Companies={Companies}
                    setVendorOptions={(options: any) => {
                        setVendorOptions(options);
                        setVendorSelectOptions(options);
                    }}
                    setCountryBreakdown={setCountryBreakdown}
                />
                <HStack w="100%">
                    <Box w="100%">
                        <Text mb="8px">Requestor`s Company Code</Text>
                        <Input
                            defaultValue={requestorsCompanyName.value.code}
                            disabled
                            bg={useColorModeValue('white', '#2C313C')}
                            color={useColorModeValue('gray.800', '#ABB2BF')}
                            i
                        />
                    </Box>
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
                            Please note no actual project for 1550 will be
                            created in the tool just yet, this still needs to be
                            done via the usual process. But a project for
                            Switzerland will be created if they are part of the
                            campaign, as they are using the tool. Other
                            countries and 1550 will follow.
                        </AlertDescription>
                    </Alert>
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
                    <AlertTitle>
                        Please change Requestor`s Company Name!
                    </AlertTitle>
                    <AlertDescription>
                        Currently, only companies with '6110' code are allowed
                        ('ALSO Schweiz AG')
                    </AlertDescription>
                </Alert>
                <Text as="b">Campaign`s Details</Text>

                <Box w="100%">
                    <Text mb="8px">
                        Campaign Name (40 characters limit. Naming Convention:
                        'Vendor Name 1' 'Vendor Name 2'... 'Campaign Name')
                    </Text>
                    <Input
                        isInvalid={showErrors && !campaignName}
                        maxLength={40}
                        value={campaignName}
                        onChange={(event) => {
                            setCampaignName(event.target.value);
                        }}
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
                    />
                </Box>

                <Box w="100%">
                    <Text mb="8px">Campaign Description</Text>
                    <Textarea
                        isInvalid={showErrors && !campaignDescription}
                        value={campaignDescription}
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
                        // isInvalid={showErrors && !campaignDescription}
                        menuPortalTarget={document.body}
                        styles={DefaultSelectStyles(
                            useColorModeValue,
                            showErrors && !campaignChannel?.label
                        )}
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 6,
                            colors: {
                                ...theme.colors,
                                primary: '#3082CE',
                            },
                        })}
                        placeholder=""
                        onChange={(value: any) => {
                            setCampaignChannel(value);
                        }}
                        value={campaignChannel}
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
                            showErrors && !year?.label
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
                            showErrors && !projectStartQuarter.label
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
                        isInvalid={showErrors && !projectNumber}
                        placeholder="____________"
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
                        isInvalid={showErrors && !requestorsName}
                        value={requestorsName}
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
                                    isInvalid={showErrors && !startDate}
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
                            customInput={
                                <Input
                                    isInvalid={showErrors && !endDate}
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
                            showErrors && !budgetSource.label
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
                            if (value.value === 'noBudget') {
                                setEstimatedIncomeBudgetCurrency('');
                                setEstimatedIncomeEuro('');
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
                            showErrors && !exchangeRates.label
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
                        isInvalid={
                            showErrors &&
                            (!estimatedIncomeBudgetCurrency ||
                                isNaN(Number(estimatedIncomeBudgetCurrency)))
                        }
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
                        isInvalid={
                            showErrors &&
                            (!estimatedCostsBudgetCurrency ||
                                isNaN(Number(estimatedCostsBudgetCurrency)))
                        }
                        value={estimatedCostsBudgetCurrency}
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
                        value={netProfitTargetBudgetCurrency}
                        isInvalid={
                            showErrors &&
                            (!netProfitTargetBudgetCurrency ||
                                isNaN(Number(netProfitTargetBudgetCurrency)))
                        }
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
                        disabled={budgetSource.value === 'noBudget'}
                        value={estimatedIncomeEuro}
                        onChange={(event) => {
                            setEstimatedIncomeEuro(event.target.value);
                        }}
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
                    />
                </Box>
                <Box w="100%">
                    <Text mb="8px">Campaign Estimated Costs in EUR</Text>
                    <Input
                        value={estimatedCostsEuro}
                        onChange={(event) => {
                            setEstimatedCostsEuro(event.target.value);
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
                        isInvalid={
                            showErrors &&
                            (!netProfitTarget || isNaN(Number(netProfitTarget)))
                        }
                        value={netProfitTarget}
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
                        isInvalid={
                            showErrors &&
                            (!totalEstimatedCostsLC ||
                                isNaN(Number(totalEstimatedCostsLC)))
                        }
                        value={totalEstimatedCostsLC}
                        onChange={(event) => {
                            setTotalEstimatedCostsLC(event.target.value);
                        }}
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
                    />
                </Box>

                <VendorNames
                    vendorsNames={vendorsNames}
                    hasErrors={showErrors && vendorsNames?.length < 2}
                    vendors={vendors}
                    setVendorsNames={setVendorsNames}
                    vendorsAfterCompanySelect={vendorsAfterCompanySelect}
                    setVendors={setVendors}
                />

                <VendorsTable
                    vendors={vendors}
                    setVendors={setVendors}
                    cellTextAlert={cellTextAlert}
                    cellDropDownAlert={cellDropDownAlert}
                    vendorsNames={vendorsNames}
                    setVendorsNames={setVendorsNames}
                    BUs={BUs}
                    budgetSource={budgetSource}
                    ExchangeRates={ExchangeRates}
                    // budgetAmountError={  !rowData.budgetAmount &&
                    //     !(rowData.vendor === 'TOTAL')}
                    cellNumberAlert={cellNumberAlert}
                    totalAlert={totalAlert}
                    totalVendorBudgetInEUR={vendorBudgetInEUR}
                    estimatedIncome={estimatedIncomeEuro}
                    vendorsAfterCompanySelect={vendorsAfterCompanySelect}                
                />
                <Box w="100%">
                    <Text mb="8px">Companies Participating</Text>
                    <Select
                        menuPortalTarget={document.body}
                        isMulti
                        styles={DefaultSelectStyles(
                            useColorModeValue,
                            showErrors && !companiesParticipating?.length
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
                        // classNamePrefix="select"
                        isClearable={false}
                        name="companiesParticipating"
                        options={Companies}
                    />
                </Box>

                <CountryBreakdown
                    countryBreakdown={countryBreakdown}
                    totalcbShare={totalcbShare}
                    totalcbContribution={totalcbContribution}
                    exchangeRates={exchangeRates}
                    totalcbCosts={totalcbCosts}
                    setCountryBreakdown={setCountryBreakdown}
                    budgetSource={budgetSource}
                    estimatedCostsEuro={estimatedCostsEuro}
                    estimatedIncomeEuro={estimatedIncomeEuro}
                />

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
            <VStack justifyContent={'end'} flexDirection="row">
                <Button
                    float="right"
                    mr="15px"
                    color={'white'}
                    bg={useColorModeValue('blue.400', '#4D97E2')}
                    _hover={{
                        bg: useColorModeValue('blue.300', '#377bbf'),
                    }}
                    onClick={() => draftSubmitHandler(true)}
                >
                    Save to draft
                </Button>
                <Button
                    float="right"
                    mr="15px"
                    color={'white'}
                    bg={useColorModeValue('green.400', '#4D97E2')}
                    _hover={{
                        bg: useColorModeValue('green.300', '#377bbf'),
                    }}
                    className="btn-ermv export-btn-ermv"
                    onClick={() => {
                        interface FD {
                            [key: string]: any;
                        }
                        var formattedData = [];
                        formattedData.push(['Request', 'European Multi Vendor']);
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
                            estimatedIncomeEuro === '' ||
                            isNaN(parseFloat(estimatedIncomeEuro))
                                ? 'N/A'
                                : parseFloat(estimatedIncomeEuro),
                        ]);
                        formattedData.push([
                            'Campaign Estimated Costs in EUR',
                            estimatedCostsEuro === '' ||
                            isNaN(parseFloat(estimatedCostsEuro))
                                ? 'N/A'
                                : parseFloat(estimatedCostsEuro),
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
                        formattedData.push([
                            'Vendors',
                            vendorsNames.map((v: any) => v.label).join(', '),
                        ]);
                        formattedData.push([]);
                        formattedData.push([
                            'Vendor Name',
                            'VOD',
                            'Creditor',
                            'Manufacturer',
                            'Business Unit',
                            // 'PH1',
                            'Vendor Budget Currency',
                            'Vendor Budget Amount',
                            'Vendor Budget in LC',
                            'Vendor Budget in EUR',
                            'Share %',
                            'Vendor Estimated Income in Campaign Currency',
                            'Vendor Estimated Costs in Campaign Currency',
                            'Vendor Estimated Costs in LC',
                            'Vendor Estimated Costs in EUR',
                            'Net Profit Target in Campaign Currency',
                            'Net Profit Target in LC',
                            'Net Profit Target in EUR',
                        ]);
                        vendors.forEach((v: any) => {
                            formattedData.push([
                                v.vendor,
                                v.debitor,
                                v.creditor,
                                v.manufacturer,
                                v.bu,
                                // v.ph,
                                v.budgetCurrency.label,
                                isNaN(v.budgetAmount) || v.budgetAmount === ''
                                    ? 0.0
                                    : parseFloat(v.budgetAmount),
                                isNaN(v.localBudget) || v.localBudget === ''
                                    ? 0.0
                                    : parseFloat(v.localBudget),
                                isNaN(v.eurBudget) || v.eurBudget === ''
                                    ? 0.0
                                    : parseFloat(v.eurBudget),
                                isNaN(v.share) || v.share === ''
                                    ? 0.0
                                    : parseFloat(v.share),
                                isNaN(v.estimatedIncomeCC) ||
                                v.estimatedIncomeCC === ''
                                    ? 0.0
                                    : parseFloat(v.estimatedIncomeCC),
                                isNaN(v.estimatedCostsCC) ||
                                v.estimatedCostsCC === ''
                                    ? 0.0
                                    : parseFloat(v.estimatedCostsCC),
                                isNaN(v.estimatedCostsLC) ||
                                v.estimatedCostsLC === ''
                                    ? 0.0
                                    : parseFloat(v.estimatedCostsLC),
                                isNaN(v.estimatedCostsEUR) ||
                                v.estimatedCostsEUR === ''
                                    ? 0.0
                                    : parseFloat(v.estimatedCostsEUR),
                                isNaN(v.netProfitTargetVC) ||
                                v.netProfitTargetVC === ''
                                    ? 0.0
                                    : parseFloat(v.netProfitTargetVC),
                                isNaN(v.netProfitTargetLC) ||
                                v.netProfitTargetLC === ''
                                    ? 0.0
                                    : parseFloat(v.netProfitTargetLC),
                                isNaN(v.netProfitTargetEUR) ||
                                v.netProfitTargetEUR === ''
                                    ? 0.0
                                    : parseFloat(v.netProfitTargetEUR),
                            ]);
                        });
                        formattedData.push([]);
                        formattedData.push([
                            'Company Name',
                            'Company Company Code',
                            'Country',
                            "Contact Person's Email",
                            'Local Project Number',
                            'Share %',
                            'Budget Contribution in Campaign Currency',
                            'Total Estimated Costs in Campaign Currency',
                        ]);
                        countryBreakdown.forEach((c: any) => {
                            formattedData.push([
                                c.companyName,
                                c.companyCode,
                                c.country,
                                c.contactEmail,
                                c.projectNumber,
                                `${c.share || 0}%`,
                                isNaN(c.contribution) || c.contribution === ''
                                    ? 0.0
                                    : parseFloat(c.contribution),
                                isNaN(c.estimatedCosts) ||
                                c.estimatedCosts === ''
                                    ? 0.0
                                    : parseFloat(c.estimatedCosts),
                            ]);
                        });
                        formattedData.push([]);
                        formattedData.push(['Comments', comments]);
                        formattedData.push([]);

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
                    className="btn-ermv"
                    float="right"
                    color={'white'}
                    bg={useColorModeValue('blue.400', '#4D97E2')}
                    _hover={{
                        bg: useColorModeValue('blue.300', '#377bbf'),
                    }}
                    isDisabled={
                        requestorsCompanyName.value.code !== '6110' ||
                        props.submission
                    }
                    onClick={() => draftSubmitHandler(false)}
                >
                    Submit
                </Button>
            </VStack>
        </Box>
    );
}
