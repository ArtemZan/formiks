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

var PH1: any[] = [];
var Companies: any[] = [];
// var VendorsNames: any[] = [];
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
    const [estimatedIncome, setEstimatedIncome] = useState('');
    const [estimatedCosts, setEstimatedCosts] = useState('');
    const [netProfitTarget, setNetProfitTarget] = useState('');
    const [companiesParticipating, setCompaniesParticipating] = useState<any>(
        []
    );
    const [comments, setComments] = useState('');
    const [vendors, setVendors] = useState<any>([]);
    const [costBreakdown, setCostBreakdown] = useState<any>([]);

    // const [totalVendorBudgetInLC, setTotalVendorBudgetInLC] = useState(0);
    // const [totalVendorBudgetInEUR, setTotalVendorBudgetInEUR] = useState(0);

    const [totalEstimatedCostsLC, setTotalEstimatedCostsLC] = useState('');

    const [totalcbShare, setTotalcbShare] = useState('0');
    const [totalcbContribution, setTotalcbContribution] = useState('0.00');
    const [totalcbCosts, setTotalcbCosts] = useState('0.00');
    

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
            setEstimatedIncome(
                (props.submission.data.campaignEstimatedIncomeEur || 0).toFixed(
                    2
                )
            );
            setEstimatedCosts(
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
                setCostBreakdown([...c]);

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
        ];
        var responses = await Promise.all(
            dropdownsIds.map((di) => {
                return RestAPI.getDropdownValues(di);
            })
        );
        PH1 = responses[0].data;
        Companies = responses[1].data;
        // VendorsNames = responses[2].data;
        CampaignChannel = responses[3].data;
        TargetAudience = responses[4].data;
        Budget = responses[5].data;
        ExchangeRates = responses[6].data;
        FiscalQuarter = responses[7].data;
        Year = responses[8].data;
        ProjectStartQuarter = responses[9].data;
    }

    useEffect(() => {
        if (props.submission) {
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
        if (props.submission) {
            return;
        }
        var data: any = [];
        vendorsNames.forEach((vendor: any) => {
            data.push({
                vendor: vendor.label,
                projectManager: vendor.value.alsoMarketingConsultant,
                creditor: vendor.value.kreditor,
                debitor: vendor.value.debitorischer,
                manufacturer: vendor.value.hersteller,
                bu: vendor.value.bu,
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
        });
        data.push({
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
        setVendors(data);
    }, [vendorsNames]);
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
                projectNumber: '',
                contribution: '',
                estimatedCosts: '',
                share: '',
            });
        });
        setCostBreakdown(data);
    }, [companiesParticipating]);

    useEffect(() => {
        // if (props.submission) {
        //   return;
        // }
        var totalShare = 0.0;
        var totalContribution = 0.0;
        var totalCosts = 0.0;
        var temp = [...costBreakdown];
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
        if (!isEqual(costBreakdown, temp)) {
            setCostBreakdown(temp);
        }
        setTotalcbShare(totalShare.toFixed(0));
        setTotalcbContribution(totalContribution.toFixed(2));
        setTotalcbCosts(totalCosts.toFixed(2));
    }, [
        costBreakdown,
        estimatedIncomeBudgetCurrency,
        estimatedCostsBudgetCurrency,
    ]);

    useEffect(() => {
        if (props.submission) {
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
        var totalCostsEur = parseFloat(estimatedCosts);

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
                    share * parseFloat(estimatedCosts)
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
    }, [
        vendors,
        estimatedCostsBudgetCurrency,
        totalEstimatedCostsLC,
        budgetSource,
    ]);

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
                campaignEstimatedIncomeEur: parseFloat(estimatedIncome),
                campaignEstimatedCostsEur: parseFloat(estimatedCosts),
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
        costBreakdown.forEach((company: any) => {
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
                            : parseFloat(estimatedIncome),
                    estimatedCostsEUR: parseFloat(estimatedCosts),
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
                    setVendorOptions={setVendorOptions}
                />
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
                        menuPortalTarget={document.body}
                        styles={{
                            menu: (provided) => ({
                                ...provided,
                                zIndex: 1000000,
                            }),
                            singleValue: (provided) => ({
                                ...provided,
                                color: '#718196',
                            }),
                            control: (base, state) => ({
                                ...base,
                                minHeight: 40,
                                border: '1px solid #E2E8F0',
                                transition: '0.3s',
                                '&:hover': {
                                    border: '1px solid #CBD5E0',
                                },
                            }),
                        }}
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
                        styles={{
                            menu: (provided) => ({
                                ...provided,
                                zIndex: 1000000,
                            }),
                            singleValue: (provided) => ({
                                ...provided,
                                color: '#718196',
                            }),
                            control: (base, state) => ({
                                ...base,
                                minHeight: 40,
                                border: '1px solid #E2E8F0',
                                transition: '0.3s',
                                '&:hover': {
                                    border: '1px solid #CBD5E0',
                                },
                            }),
                        }}
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
                        styles={{
                            menu: (provided) => ({
                                ...provided,
                                zIndex: 1000000,
                            }),
                            singleValue: (provided) => ({
                                ...provided,
                                color: '#718196',
                            }),
                            control: (base, state) => ({
                                ...base,
                                minHeight: 40,
                                border: '1px solid #E2E8F0',
                                transition: '0.3s',
                                '&:hover': {
                                    border: '1px solid #CBD5E0',
                                },
                            }),
                        }}
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
                        styles={{
                            menu: (provided) => ({
                                ...provided,
                                zIndex: 1000000,
                            }),
                            singleValue: (provided) => ({
                                ...provided,
                                color: '#718196',
                            }),
                            control: (base, state) => ({
                                ...base,
                                minHeight: 40,
                                border: '1px solid #E2E8F0',
                                transition: '0.3s',
                                '&:hover': {
                                    border: '1px solid #CBD5E0',
                                },
                            }),
                        }}
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
                                setEstimatedIncome('');
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
                        styles={{
                            menu: (provided) => ({
                                ...provided,
                                zIndex: 1000000,
                            }),
                            singleValue: (provided) => ({
                                ...provided,
                                color: '#718196',
                            }),
                            control: (base, state) => ({
                                ...base,
                                minHeight: 40,
                                border: '1px solid #E2E8F0',
                                transition: '0.3s',
                                '&:hover': {
                                    border: '1px solid #CBD5E0',
                                },
                            }),
                        }}
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
                        value={estimatedIncome}
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
                        value={estimatedCosts}
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
                        value={totalEstimatedCostsLC}
                        onChange={(event) => {
                            setTotalEstimatedCostsLC(event.target.value);
                        }}
                        bg={useColorModeValue('white', '#2C313C')}
                        color={useColorModeValue('gray.800', '#ABB2BF')}
                    />
                </Box>

                <Box w="100%">
                    <Text mb="8px">Vendor`s Names</Text>
                    <Select
                        // menuPortalTarget={document.body}
                        isMulti
                        styles={{
                            menu: (provided) => ({
                                ...provided,
                                zIndex: 1000000,
                            }),
                            singleValue: (provided) => ({
                                ...provided,
                                color: '#718196',
                            }),
                            control: (base, state) => ({
                                ...base,
                                minHeight: 40,
                                border: '1px solid #E2E8F0',
                                transition: '0.3s',
                                '&:hover': {
                                    border: '1px solid #CBD5E0',
                                },
                            }),
                        }}
                        theme={(theme) => ({
                            ...theme,
                            borderRadius: 6,
                            colors: {
                                ...theme.colors,
                                primary: '#3082CE',
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
                        options={vendorsOptions?.map((option: any) => {
                            return {
                                label: `${option.label} (${option.value.debitorischer} - ${option.value.bu})`,
                                value: option.value,
                            };
                        })}
                    />
                </Box>

                <Box w="100%">
                    <Text mb="8px">Vendors</Text>
                    <Table
                        hover={false}
                        autoHeight
                        rowHeight={65}
                        data={vendors}
                    >
                        <Column width={200} resizable>
                            <HeaderCell>Vendor</HeaderCell>
                            <Cell dataKey="vendor">
                                {(rowData, index) => (
                                    <Input
                                        value={rowData.vendor}
                                        onChange={(event) => {
                                            var temp = [...vendors];
                                            temp[index!].vendor =
                                                event.target.value;
                                            setVendors(temp);
                                        }}
                                    />
                                )}
                            </Cell>
                        </Column>
                        <Column width={200} resizable>
                            <HeaderCell>VOD</HeaderCell>
                            <Cell dataKey="debitor">
                                {(rowData, index) => (
                                    <Input
                                        value={rowData.debitor}
                                        onChange={(event) => {
                                            var temp = [...vendors];
                                            temp[index!].debitor =
                                                event.target.value;
                                            setVendors(temp);
                                        }}
                                    />
                                )}
                            </Cell>
                        </Column>

                        <Column width={200} resizable>
                            <HeaderCell>Creditor</HeaderCell>
                            <Cell dataKey="creditor">
                                {(rowData, index) => (
                                    <Input
                                        isDisabled
                                        value={rowData.creditor}
                                        onChange={(event) => {
                                            var temp = [...vendors];
                                            temp[index!].creditor =
                                                event.target.value;
                                            setVendors(temp);
                                        }}
                                    />
                                )}
                            </Cell>
                        </Column>

                        <Column width={200} resizable>
                            <HeaderCell>Manufacturer</HeaderCell>
                            <Cell dataKey="manufacturer">
                                {(rowData, index) => (
                                    <Input
                                        value={rowData.manufacturer}
                                        onChange={(event) => {
                                            var temp = [...vendors];
                                            temp[index!].manufacturer =
                                                event.target.value;
                                            setVendors(temp);
                                        }}
                                    />
                                )}
                            </Cell>
                        </Column>

                        <Column width={200} resizable>
                            <HeaderCell>Business Unit</HeaderCell>
                            <Cell dataKey="bu">
                                {(rowData, index) => (
                                    <Input
                                        value={rowData.bu}
                                        onChange={(event) => {
                                            var temp = [...vendors];
                                            temp[index!].bu =
                                                event.target.value;
                                            setVendors(temp);
                                        }}
                                    />
                                )}
                            </Cell>
                        </Column>
                        <Column width={200} resizable>
                            <HeaderCell>PH1</HeaderCell>
                            <Cell dataKey="ph">
                                {(rowData, index) => (
                                    <Select
                                        styles={{
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 1000000000,
                                            }),
                                            menuPortal: (base) => ({
                                                ...base,
                                                zIndex: 10000000,
                                            }),
                                            singleValue: (provided) => ({
                                                ...provided,
                                                color: '#718196',
                                            }),
                                            control: (base, state) => ({
                                                ...base,
                                                minHeight: 40,
                                                border: '1px solid #E2E8F0',
                                                transition: '0.3s',
                                                '&:hover': {
                                                    border: '1px solid #CBD5E0',
                                                },
                                            }),
                                        }}
                                        theme={(theme) => ({
                                            ...theme,
                                            borderRadius: 6,
                                            colors: {
                                                ...theme.colors,
                                                primary: '#3082CE',
                                            },
                                        })}
                                        menuPortalTarget={document.body}
                                        value={rowData.ph}
                                        onChange={(value) => {
                                            var temp = [...vendors];
                                            temp[index!].ph = value;
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
                        <Column width={200} resizable>
                            <HeaderCell>Vendor Budget Currency</HeaderCell>
                            <Cell dataKey="budgetCurrency">
                                {(rowData, index) => (
                                    <Select
                                        isDisabled={
                                            budgetSource.value === 'noBudget'
                                        }
                                        styles={{
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 1000000000,
                                            }),
                                            menuPortal: (base) => ({
                                                ...base,
                                                zIndex: 10000000,
                                            }),
                                            singleValue: (provided) => ({
                                                ...provided,
                                                color: '#718196',
                                            }),
                                            control: (base, state) => ({
                                                ...base,
                                                minHeight: 40,
                                                border: '1px solid #E2E8F0',
                                                transition: '0.3s',
                                                '&:hover': {
                                                    border: '1px solid #CBD5E0',
                                                },
                                            }),
                                        }}
                                        theme={(theme) => ({
                                            ...theme,
                                            borderRadius: 6,
                                            colors: {
                                                ...theme.colors,
                                                primary: '#3082CE',
                                            },
                                        })}
                                        menuPortalTarget={document.body}
                                        value={rowData.budgetCurrency}
                                        onChange={(value) => {
                                            var temp = [...vendors];
                                            temp[index!].budgetCurrency = value;
                                            setVendors(temp);
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
                                        disabled={
                                            budgetSource.value === 'noBudget'
                                        }
                                        value={rowData.budgetAmount}
                                        onChange={(event) => {
                                            var temp = [...vendors];
                                            temp[index!].budgetAmount =
                                                event.target.value;
                                            setVendors(temp);
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
                                        disabled={
                                            budgetSource.value === 'noBudget'
                                        }
                                        value={rowData.localBudget}
                                        onChange={(event) => {
                                            var temp = [...vendors];
                                            temp[index!].localBudget =
                                                event.target.value;
                                            setVendors(temp);
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
                                        disabled={
                                            budgetSource.value === 'noBudget'
                                        }
                                        value={rowData.eurBudget}
                                        onChange={(event) => {
                                            var temp = [...vendors];
                                            temp[index!].eurBudget =
                                                event.target.value;
                                            setVendors(temp);
                                        }}
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
                                            budgetSource.value !== 'noBudget'
                                        }
                                        value={rowData.share}
                                        onChange={(event) => {
                                            var temp = [...vendors];
                                            temp[index!].share =
                                                event.target.value;
                                            setVendors(temp);
                                        }}
                                    />
                                )}
                            </Cell>
                        </Column>
                        {/* FIXME: calculate */}
                        <Column width={300} resizable>
                            <HeaderCell>
                                Vendor Estimated Income in Campaign Currency
                            </HeaderCell>
                            <Cell dataKey="estimatedIncomeCC">
                                {(rowData, index) => (
                                    <Input
                                        disabled={
                                            budgetSource.value === 'noBudget'
                                        }
                                        onChange={() => {}}
                                        value={rowData.estimatedIncomeCC}
                                    />
                                )}
                            </Cell>
                        </Column>
                        <Column width={300} resizable>
                            <HeaderCell>
                                Vendor Estimated Costs in Campaign Currency
                            </HeaderCell>
                            <Cell dataKey="estimatedCostsCC">
                                {(rowData, index) => (
                                    <Input
                                        disabled
                                        onChange={() => {}}
                                        value={rowData.estimatedCostsCC}
                                    />
                                )}
                            </Cell>
                        </Column>
                        <Column width={300} resizable>
                            <HeaderCell>
                                Vendor Estimated Costs in LC
                            </HeaderCell>
                            <Cell dataKey="estimatedCostsLC">
                                {(rowData, index) => (
                                    <Input
                                        disabled
                                        onChange={() => {}}
                                        value={rowData.estimatedCostsLC}
                                    />
                                )}
                            </Cell>
                        </Column>
                        <Column width={300} resizable>
                            <HeaderCell>
                                Vendor Estimated Costs in EUR
                            </HeaderCell>
                            <Cell dataKey="estimatedCostsEUR">
                                {(rowData, index) => (
                                    <Input
                                        disabled
                                        onChange={() => {}}
                                        value={rowData.estimatedCostsEUR}
                                    />
                                )}
                            </Cell>
                        </Column>
                        <Column width={300} resizable>
                            <HeaderCell>
                                Net Profit Target in Campaign Currency
                            </HeaderCell>
                            <Cell dataKey="netProfitTargetVC">
                                {(rowData, index) => (
                                    <Input
                                        disabled
                                        onChange={() => {}}
                                        value={rowData.netProfitTargetVC}
                                    />
                                )}
                            </Cell>
                        </Column>
                        <Column width={300} resizable>
                            <HeaderCell>Net Profit Target in LC</HeaderCell>
                            <Cell dataKey="netProfitTargetLC">
                                {(rowData, index) => (
                                    <Input
                                        disabled
                                        onChange={() => {}}
                                        value={rowData.netProfitTargetLC}
                                    />
                                )}
                            </Cell>
                        </Column>
                        <Column width={300} resizable>
                            <HeaderCell>Net Profit Target in EUR</HeaderCell>
                            <Cell dataKey="netProfitTargetEUR">
                                {(rowData, index) => (
                                    <Input
                                        disabled
                                        onChange={() => {}}
                                        value={rowData.netProfitTargetEUR}
                                    />
                                )}
                            </Cell>
                        </Column>
                    </Table>
                </Box>
                <Box w="100%">
                    <Text mb="8px">Companies Participating</Text>
                    <Select
                        menuPortalTarget={document.body}
                        isMulti
                        styles={{
                            menu: (provided) => ({
                                ...provided,
                                zIndex: 10000000,
                            }),
                            menuPortal: (base) => ({
                                ...base,
                                zIndex: 10000000,
                            }),
                            singleValue: (provided) => ({
                                ...provided,
                                color: '#718196',
                            }),
                            control: (base, state) => ({
                                ...base,
                                minHeight: 40,
                                border: '1px solid #E2E8F0',
                                transition: '0.3s',
                                '&:hover': {
                                    border: '1px solid #CBD5E0',
                                },
                            }),
                        }}
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

                <Box w="100%">
                    <Text mb="8px">Country Breakdown</Text>
                    <Table
                        shouldUpdateScroll={false}
                        hover={false}
                        autoHeight
                        rowHeight={65}
                        data={[
                            ...costBreakdown,
                            {
                                invalid: totalcbShare === '100' ? false : true,
                                companyName: 'TOTAL',
                                share: totalcbShare + '%',
                                contribution:
                                    totalcbContribution +
                                    ' ' +
                                    exchangeRates.label,
                                estimatedCosts:
                                    totalcbCosts + ' ' + exchangeRates.label,
                            },
                        ]}
                    >
                        <Column width={200} resizable>
                            <HeaderCell>Company Name</HeaderCell>
                            <Cell dataKey="companyName">
                                {(rowData, index) => (
                                    <Input
                                        value={rowData.companyName}
                                        onChange={(event) => {
                                            var temp = [...costBreakdown];
                                            temp[index!].companyName =
                                                event.target.value;
                                            setCostBreakdown(temp);
                                        }}
                                    />
                                )}
                            </Cell>
                        </Column>

                        <Column width={200} resizable>
                            <HeaderCell>Company Code</HeaderCell>
                            <Cell dataKey="companyCode">
                                {(rowData, index) => (
                                    <Input
                                        value={rowData.companyCode}
                                        onChange={(event) => {
                                            var temp = [...costBreakdown];
                                            temp[index!].companyCode =
                                                event.target.value;
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
                                            temp[index!].country =
                                                event.target.value;
                                            setCostBreakdown(temp);
                                        }}
                                    />
                                )}
                            </Cell>
                        </Column>

                        <Column width={200} resizable>
                            <HeaderCell>Contact Person's Email</HeaderCell>
                            <Cell dataKey="contactEmail">
                                {(rowData, index) => (
                                    <Input
                                        value={rowData.contactEmail}
                                        onChange={(event) => {
                                            var temp = [...costBreakdown];
                                            temp[index!].contactEmail =
                                                event.target.value;
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
                                            temp[index!].projectNumber =
                                                event.target.value;
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
                                    <Input
                                        color={rowData.invalid && 'red'}
                                        value={rowData.share}
                                        onChange={(event) => {
                                            var temp = [...costBreakdown];
                                            temp[index!].share =
                                                event.target.value;
                                            setCostBreakdown(temp);
                                        }}
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
                                            budgetSource.value === 'noBudget'
                                        }
                                        value={rowData.contribution}
                                        onChange={(event) => {
                                            var temp = [...costBreakdown];
                                            temp[index!].contribution =
                                                event.target.value;
                                            setCostBreakdown(temp);
                                        }}
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
                                        value={rowData.estimatedCosts}
                                        onChange={(event) => {
                                            var temp = [...costBreakdown];
                                            temp[index!].estimatedCosts =
                                                event.target.value;
                                            setCostBreakdown(temp);
                                        }}
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
                        formattedData.push(['Request', 'Local Multi Vendor']);
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
                            'PH1',
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
                                v.ph,
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
                            'VCompany Company Code',
                            'Country',
                            "Contact Person's Email",
                            'Local Project Number',
                            'Share %',
                            'Budget Contribution in Campaign Currency',
                            'Total Estimated Costs in Campaign Currency',
                        ]);
                        costBreakdown.forEach((c: any) => {
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
