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
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import moment from 'moment';

import { Table, Uploader } from 'rsuite';
import { Submission, SubmissionWithChildren } from '../../../types/submission';
import { RestAPI } from '../../../api/rest';
import { DefaultSelectStyles } from '../../../utils/Styles';
import { GiConsoleController } from 'react-icons/gi';
import VendorNames from './VendorNames/VendorNames';
import VendorsTable from './VendorsTable/VendorsTable';

var PH1: any[] = [];
var Companies: any[] = [];
var VendorsNames: any[] = [];
var BUs: any[] = [];
var CampaignChannel: any[] = [];
var TargetAudience: any[] = [];
var Budget: any[] = [];
var ExchangeRates: any[] = [];
var FiscalQuarter: any[] = [];

var vendorsAfterCompanySelect: string[] = [];
var Year: any[] = [];
var AlsoInternationalVendorsNames: any[] = [];
var ProjectStartQuarter: any[] = [];

const { Column, HeaderCell, Cell } = Table;

interface Props {
    history: any;
    project: Project;
    submission?: any;
    children?: any[];
    isDraft?: boolean;
}

export default function Elmv(props: Props) {
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
    const [vendor, setVendor] = useState<any>({
        ph: {
            label: '',
            value: '',
        },
    });

    const [costBreakdown, setCostBreakdown] = useState<any>([]);
    const [organizingCompany, setOrganizingCompany] = useState('');

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
                        .campaignEstimatedIncomeBudgetsCurrency ?? ''
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
                        .campaignEstimatedCostsBudgetsCurrency ?? ''
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
                                props.submission.data.localCurrency
                        ) || '0'
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
                setVendorsNames(
                    props.children
                        .filter((s) => s.group === 'vendor')
                        .map((s) => {
                            return {
                                label: s.data.vendorName,
                                value: {
                                    alsoMarketingConsultant: s.data
                                        .marketingResponsible
                                        ? s.data.marketingConsultant
                                        : '',
                                    bu: s.data.businessUnit
                                        ? s.data.businessUnit
                                        : '',
                                    city: s.data.city ? s.data.city : '',
                                    cityCode: s.data.cityCode
                                        ? s.data.cityCode
                                        : '',
                                    debitorischer: s.data.debitorNumber
                                        ? s.data.debitorNumber
                                        : '',
                                    email: s.data.email ? s.data.email : '',
                                    hersteller: s.data.debitorNumber
                                        ? s.data.debitorNumber
                                        : '',
                                    kreditor: s.data.creditorNumber
                                        ? s.data.creditorNumber
                                        : '',
                                    manufacturer: s.data.manufacturerNumber
                                        ? s.data.manufacturerNumber
                                        : '',
                                    telephone: s.data.telephone
                                        ? s.data.telephone
                                        : '',
                                    vendorAddress: s.data.adress
                                        ? s.data.adress
                                        : '',
                                },
                            };
                        })
                );
                var v: any[] = [];
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
                            ph: s.data.PH1,
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
                            localBudget: (s.data.vendorAmountLC || 0).toFixed(
                                2
                            ),
                            eurBudget: (s.data.estimatedIncomeEUR || 0).toFixed(
                                2
                            ),
                            share: (s.data.vendorShare || 0).toFixed(2),
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
        setTimeout(() => {
            setInjectionReady(true);
        }, 3000);
    }, [props.submission, props.children, ExchangeRates]);

    useEffect(() => {
        if (props.submission && !injectionReady) {
            return;
        }
        var data: any = [];
        vendorsNames.forEach((vendor: any) => {
            var ex = vendors.find((v: any) => v.vendor === vendor.label);
            if (ex) {
                data.push(ex);
            } else {
                data.push({
                    vendor: vendor.label,
                    marketingResponsible: vendor.value.alsoMarketingConsultant,
                    creditor: vendor.value.kreditor,
                    debitor: vendor.value.debitorischer,
                    manufacturer: vendor.value.hersteller,
                    city: vendor.value.city,
                    cityCode: vendor.value.cityCode,
                    email: vendor.value.email,
                    telephone: vendor.value.telephone,
                    vendorAddress: vendor.value.vendorAddress,
                    budgetCurrency: '',
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
                    ph1: { label: '', value: '' },
                    bu: '',
                });
            }
        });
        data.push({
            vendor: 'TOTAL',
            marketingResponsible: '',
            creditor: '',
            debitor: '',
            manufacturerNumber: '',
            city: '',
            cityCode: '',
            email: '',
            telephone: '',
            vendorAddress: '',
            budgetCurrency: '',
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
            ph1: { label: '', value: '' },
            bu: '',
        });
        setVendors(data);
    }, [vendorsNames]);

    function createSubmission(draft: boolean) {
        var projectId = '6246ec8efa2a446faadb8d9b';
        var parent: Submission = {
            project: projectId,
            title: campaignName,
            parentId: null,
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
                    startDate === null || startDate === ''
                        ? null
                        : startDate.toString(),
                campaignEndDate:
                    endDate === null || endDate === ''
                        ? null
                        : endDate.toString(),
                budgetSource: budgetSource.label,
                campaignBudgetsCurrency: exchangeRates.label,
                campaignCurrency: exchangeRates.label,
                localCurrency: requestorsCompanyName.value['currency'],
                campaignEstimatedIncomeBudgetsCurrency: isNaN(
                    parseFloat(estimatedIncomeBudgetCurrency)
                )
                    ? ''
                    : parseFloat(estimatedIncomeBudgetCurrency),
                campaignEstimatedCostsBudgetsCurrency: isNaN(
                    parseFloat(estimatedCostsBudgetCurrency)
                )
                    ? ''
                    : parseFloat(estimatedCostsBudgetCurrency),
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
                projectType: 'Local Multi Vendor',
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

        vendors
            //.slice(0, -1)
            .filter((vendor: any) => vendor.vendor !== 'TOTAL')
            .forEach((vendor: any) => {
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
                        vendorName: vendor.vendor,
                        marketingResponsible: vendor.projectManager,
                        companyCode: requestorsCompanyName.value.code,
                        projectNumber: projectNumber,
                        creditorNumber: '',
                        debitorNumber: vendor.debitor,
                        manufacturerNumber: vendor.manufacturer,
                        businessUnit: vendor.bu,
                        // PH1: vendor.ph ? vendor.ph : "",
                        vendorBudgetCurrency:
                            vendor.budgetCurrency === ''
                                ? ''
                                : vendor.budgetCurrency.label,
                        vendorAmountLC:
                            isNaN(parseFloat(vendor.localBudget)) ||
                            budgetSource.value === 'noBudget'
                                ? 0.0
                                : parseFloat(vendor.localBudget),
                        vendorAmount:
                            isNaN(parseFloat(vendor.budgetAmount)) ||
                            budgetSource.value === 'noBudget'
                                ? 0.0
                                : parseFloat(vendor.budgetAmount),
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
                        estimatedResultEUR: parseFloat(
                            vendor.netProfitTargetEUR
                        ),
                        estimatedResultBC: parseFloat(vendor.netProfitTargetLC),
                        projectType: 'Local Multi Vendor',
                    },
                });
            });
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

    function cellNumberAlert(value: any, row: any) {
        if (!Number.isNaN(value) && value !== '' && value !== 'NaN') {
        } else {
            if (row.vendor !== 'TOTAL') {
                return useColorModeValue('red.300', '#ABB2BF');
            }
        }
    }

    function cellTextAlert(value: any, row: any) {
        if (value !== '') {
        } else {
            if (row.vendor !== 'TOTAL') {
                return useColorModeValue('red.300', '#ABB2BF');
            }
        }
    }

    function cellDropDownAlert(value: any, row: any) {
        if (value !== '') {
            return false;
        } else {
            if (row.vendor !== 'TOTAL') {
                return true;
            } else return false;
        }
    }

    function submissionValidation(submission: SubmissionWithChildren) {
        var fieldKeys: string[] = [];
        var nonMandatoryFields: string[] = [
            'targetAudience',
            'projectApprover',
            'projectApproval',
            'vendorBudgetCurrency',
            'manufacturersFiscalQuarter',
            'comments',
            'additionalInformation',
            'status',
            'marketingResponsible',
            'manufacturerNumber',
            'PH1',
            'vendor',
            'creditorNumber',
            'vendorShare',
            'estimatedCostsCC',
            'estimatedResultCC',
            'estimatedIncomeEUR',
            'estimatedCostsEUR',
            'estimatedResultEUR',
            'estimatedResultBC',
            'marketingResponsible',
            'creditorNumber',
        ];

        var totalBudget = 0;
        submission.children.forEach((e) => {
            if (e.group === 'vendor') {
                Object.keys(e.data).forEach((key: any) => {
                    if (key === 'estimatedIncomeEUR') {
                        totalBudget = totalBudget + e.data[key];
                    }
                    if (!nonMandatoryFields.includes(key)) {
                        if (key !== 'businessUnit') {
                            switch (typeof e.data[key]) {
                                case 'number':
                                    if (
                                        isNaN(e.data[key]) ||
                                        e.data[key] === 0 ||
                                        e.data[key] === 0.0
                                    ) {
                                        fieldKeys.push(key);
                                    }
                                    break;
                                case 'object':
                                    if (e.data[key] === null) {
                                        fieldKeys.push(key);
                                    } else {
                                        if (e.data[key].length !== 0) {
                                            fieldKeys.push(key);
                                        }
                                    }
                                    break;
                                case 'string':
                                    if (e.data[key] === '') {
                                        fieldKeys.push(key);
                                    }
                                    break;
                                case 'undefined':
                                    fieldKeys.push(key);
                                    break;
                            }
                        }
                    }
                });
            }
        });
        if (totalBudget !== parseFloat(estimatedIncome)) {
            fieldKeys.push('totalVendorBudgetInEUR');
        }

        var sub = submission.submission;
        if (
            sub.data.budgetSource === 'No budget' ||
            sub.data.budgetSource === 'noBudget'
        ) {
            nonMandatoryFields.push('debitorNumber');
        }
        var vendor = submission.children.filter(
            (el) => el.group === 'vendor'
        )[0];
        Object.keys(sub.data).forEach((key: any) => {
            if (!nonMandatoryFields.includes(key)) {
                if (key !== 'businessUnit') {
                    switch (typeof sub.data[key]) {
                        case 'number':
                            if (isNaN(sub.data[key]) || sub.data[key] === 0) {
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
            }
        });
        if (vendor !== undefined) {
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
        } else {
            fieldKeys.push('vendorName');
        }
        setInputErrors(fieldKeys);
        return fieldKeys;
    }

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
        BUs = responses[10].data;
        AlsoInternationalVendorsNames= responses[11].data
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
                share =
                    row.budgetAmount /
                    row.budgetCurrency.value /
                    totalBudgetEur;
                row.share = (share * 100).toFixed(0);
                if (index === temp.length - 1) {
                    var totalShare = 0.0;
                    temp.slice(0, temp.length - 2).forEach((t) => {
                        totalShare += parseFloat(t.eurBudget) / totalBudgetEur;
                    });

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
            row.netProfitTargetEUR = (
                parseFloat(row.eurBudget) - parseFloat(row.estimatedCostsEUR)
            ).toFixed(2);

            row.netProfitTargetLC = (
                parseFloat(row.localBudget) - parseFloat(row.estimatedCostsLC)
            ).toFixed(2);
            row.netProfitTargetVC = (
                parseFloat(row.estimatedIncomeCC) -
                parseFloat(row.estimatedCostsCC)
            ).toFixed(2);

            totalVendorBudgetInLC +=
                parseFloat(row.budgetAmount) /
                row.budgetCurrency.value /
                localExchangeRate;
            totalVendorBudgetInEUR +=
                parseFloat(row.budgetAmount) / row.budgetCurrency.value;
            totalVendorShare +=
                (parseFloat(row.eurBudget) / totalBudgetEur) * 100;
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
            share: totalVendorShare.toFixed(0),
            estimatedCostsCC: totalEstimatedCostsInCC.toFixed(2),
            estimatedIncomeCC: totalEstimatedIncomeInCC.toFixed(2),
            estimatedCostsLC: totalEstimatedCostsInLC.toFixed(2),
            estimatedCostsEUR: totalEstimatedCostsInEUR.toFixed(2),
            netProfitTargetVC: totalNetProfitTargetInCC.toFixed(2),
            netProfitTargetLC: totalNetProfitTargetInLC.toFixed(2),
            netProfitTargetEUR: totalNetProfitTargetInEUR.toFixed(2),
        };

        setTotalVendorBudgetInEUR(totalBudgetEur);
        setTotalVendorBudgetInLC(totalBudgetLC);
        if (!isEqual(vendors, temp)) {
            setVendors(temp);
        }
    }, [
        vendors,
        estimatedCostsBudgetCurrency,
        totalEstimatedCostsLC,
        budgetSource,
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
                        styles={DefaultSelectStyles(
                            useColorModeValue,
                            inputErrors.includes('requestorsCompanyName')
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
                            switch (value.value.code) {
                                case '1550':
                                    vendorsAfterCompanySelect =
                                        AlsoInternationalVendorsNames;
                                    break;
                                    case '1010':
                                        vendorsAfterCompanySelect =
                                            AlsoInternationalVendorsNames;
                                        break;
                                case '6110':
                                    vendorsAfterCompanySelect = VendorsNames;
                                    break;
                                default:
                                    var temp = { ...vendor };
                                    temp.manufacturer = '';
                                    temp.creditor = '';
                                    temp.debitor = '';
                                    temp.bu = '';
                                    temp.ph = { label: '', value: '' };
                                    setVendor(temp);
                                    setVendorsNames([]);
                                    vendorsAfterCompanySelect = [];
                            }
                            setLocalExchangeRate(ler);
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
                <Box w="100%">
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
                        maxLength={40}
                        isInvalid={inputErrors.includes('campaignName')}
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
                        isInvalid={inputErrors.includes(
                            'campaignEstimatedIncomeBudgetsCurrency'
                        )}
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
                        value={netProfitTargetBudgetCurrency}
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
                        disabled={budgetSource.value === 'noBudget'}
                        isInvalid={inputErrors.includes('estimatedIncomeCC')}
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
                        value={netProfitTarget}
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
                        value={totalEstimatedCostsLC}
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

                <VendorNames
                    vendorsNames={vendorsNames}
                    hasErrors={inputErrors.includes('vendorName')}
                    vendors={vendors}
                    VendorsNames={VendorsNames}
                    setVendorsNames={setVendorsNames}
                    vendorsAfterCompanySelect={vendorsAfterCompanySelect}
                />

                <VendorsTable
                    vendors={vendors}
                    setVendors={setVendors}
                    cellTextAlert={cellTextAlert}
                    cellDropDownAlert={cellDropDownAlert}
                    vendorsNames={vendorsNames}
                    VendorsNames={VendorsNames}
                    setVendorsNames={setVendorsNames}
                    BUs={BUs}
                    budgetSource={budgetSource}
                    ExchangeRates={ExchangeRates}
                    budgetAmountError={inputErrors.includes('budgetAmount')}
                    cellNumberAlert={cellNumberAlert}
                    totalAlert={totalAlert}
                    totalVendorBudgetInEUR={totalVendorBudgetInEUR}
                    estimatedIncome={estimatedIncome}
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
            <Box h="3em">
                <Button
                    float="right"
                    colorScheme={'blue'}
                    onClick={() => {
                        createSubmission(false);
                    }}
                    isDisabled={requestorsCompanyName.value.code !== '6110'}
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
                    float="right"
                    mr="15px"
                    color={'white'}
                    bg={useColorModeValue('blue.400', '#4D97E2')}
                    _hover={{
                        bg: useColorModeValue('blue.300', '#377bbf'),
                    }}
                    onClick={() => {
                        createSubmission(true);
                    }}
                >
                    {props.isDraft ? 'Save to draft' : 'Save to draft'}
                </Button>
            </Box>
        </Box>
    );
}
