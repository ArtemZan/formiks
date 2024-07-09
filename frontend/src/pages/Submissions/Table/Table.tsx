/* eslint-disable react-hooks/rules-of-hooks */
import {
    Box,
    Button,
    Input,
    Text,
    useColorModeValue,
    // Icon,
    IconButton,
    Stack,
    VStack,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    CloseButton,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
} from '@chakra-ui/react';
import {
    cloneElement,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useReducer,
    useState,
} from 'react';
// import { MdEmail } from "react-icons/md";
// import styled from "styled-components";
import EditableTableCell from '../../../components/EditableTableCell';
// import ThemedEditableTableCell from "../../components/ThemedEditableTableCell";
import Creatable from 'react-select/creatable';
// import { keyframes } from "styled-components";
// import CreateModal from "../../components/RejectModal";
import Select from 'react-select';
import { Submission } from '../../../types/submission';
// import { FaChevronRight, FaChevronDown } from "react-icons/fa";
import Toast, { ToastType } from '../../../components/Toast';
import { getAccountInfo } from '../../../utils/MsGraphApiCall';

import BaseTable, {
    AutoResizer,
    Column,
    ColumnShape,
    unflatten,
} from 'react-base-table';
import 'react-base-table/styles.css';
import { RestAPI } from '../../../api/rest';
import React from 'react';
import _, { has } from 'lodash';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import {
    BiPlusMedical,
    RiFileExcel2Line,
    RiUserFill,
    RiGroupFill,
    IoSave,
    // FaSleigh,
    RiAlbumFill,
    RiAlbumLine,
} from 'react-icons/all';
import { toast } from 'react-toastify';
import { CheckTreePicker, TagPicker } from 'rsuite';
import {
    DateRangeInput,
    DateSingleInput,
} from '../../../components/DatePicker';
import { NumberWithCommas } from '../../../utils/Numbers';

import * as FileSaver from 'file-saver';
// import * as XLSX from "xlsx";
import * as XLSX from 'sheetjs-style';
import { FilterField, Template } from '../../../types/template';
import RejectModal from '../../../components/RejectModal';
import {
    cancellationMandatoryFields,
    defaultColumns,
    invoiceMandatoryFields,
    DisplayedColumnsList,
} from './vars';
import moment from 'moment';
import { alsoProjectNumberUpdate } from './cellUpdateFunctions';
import { isReadonlyCell, getProjectColumns, cellReadonly } from './functions';
import SaveFilters from './SaveFilters';
// import { types } from "util";
// import { modalPropTypes } from "rsuite/esm/Overlay/Modal";
// import { table } from "console";

interface Props {
    history: any;
    roles: string[];
}

const allValue = 'all';
const noneValue = 'none';

var ProjectType: any[] = [];
var PH1: any[] = [];
var Companies: any[] = [];
var VendorsNames: any[] = [];
var InternationalVendorsNames: any[] = [];
var CampaignChannel: any[] = [];
var TargetAudience: any[] = [];
var Budget: any[] = [];
var ExchangeRates: any[] = [];
var FiscalQuarter: any[] = [];
var Year: any[] = [];
var ProjectStartQuarter: any[] = [];
var BUs: any[] = [];
var SapStatus: any[] = [
    { label: 'Created', value: 'created' },
    { label: 'None', value: 'none' },
];
// var CostStatuses: any[] = [
//   { label: "Cost Invoiced", value: "Cost Invoiced" },
//   { label: "Cost Not Invoiced", value: "Cost Not Invoiced" },
//   { label: "Not Relevant", value: "Not Relevant" },
// ];

export const checkCountryPrefixEqual = (projectNum: String) => {
    let equal = true;
    const prefix = projectNum.substring(0, 4);
    const country = projectNum.substring(4, 6);
    let code = null;
    // console.log('projectNum', projectNum)
    Companies.forEach((company) => {
        if (company.value.country === country) {
            equal = company.value.code === prefix;
            code = company.value.code;
        }
    });
    return { equal, country, code };
};

var submissionData: any;

let invoiceBlueFields: string[] = [
    'invoiceTypeLMD',
    'amountLMD',
    'activityIdForPortalVendors',
    'documentCurrencyLMD',
];

let preInvoiceMandatoryFields: string[] = [
    'invoicingDateLMD',
    'requestorLMD',
    'vendorLMD',
    'linkToProofsLMD',
    'vodLMD',
    'buLMD',
    'entryDateLMD',
    'invoiceTypeLMD',
    'reasonLMD',
    'reasonCodeLMD',
    'alsoMarketingProjectNumberLMD',
    'invoiceTextLMD',
    'amountLMD',
    'documentCurrencyLMD',
    'paymentMethodLMD',
    'dunningStopLMD',
    'sendToLMD',
    'materialNumberLMD',
];
let internalInvoiceMandatoryFields: string[] = [
    'invoicingDateLMD',
    'requestorLMD',
    'vendorLMD',
    'vodLMD',
    'linkToProofsLMD',
    'buLMD',
    'entryDateLMD',
    'invoiceTypeLMD',
    'reasonLMD',
    'reasonCodeLMD',
    'alsoMarketingProjectNumberLMD',
    'invoiceTextLMD',
    'amountLMD',
    'documentCurrencyLMD',
    'paymentMethodLMD',
    'dunningStopLMD',
    'materialNumberLMD',
];

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
        '619b7b9efe27d06ad17d75af',
        '619b7b9efe27d06ad17d75af',
        // "633e93ed5a7691ac30c977fc",
        '63295a2ef26db37a14557092',
        '636abbd43927f9c7703b19c4',
    ];
    try {
        const responses = await Promise.all(
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
        ProjectType = responses[10].data;
        BUs = responses[12].data;
        InternationalVendorsNames = responses[13].data;
    } catch (err) {
        console.log(err);
    }
}

const loadOptions = (identifier: string) => {
    switch (identifier) {
        case 'data.budgetSource':
            return Budget;
        case 'data.projectType':
            return ProjectType;
        case 'data.ph1':
            return PH1;
        case 'data.campaignChannel':
            return CampaignChannel;
        case 'data.targetAudience':
            return TargetAudience;
        case 'data.budgetCurrency' ||
            'data.vendorBudgetCurrency' ||
            'data.campaignCurrency':
            return ExchangeRates;
        case 'data.buLMD':
            return BUs;
        case 'data.sapStatus':
            return SapStatus;
        case 'data.caVendorName':
        case 'data.vendorName':
        case 'data.vendorNameSA':
            return VendorsNames;
        case 'data.statusLMD':
            return [
                { label: 'OK FOR INVOICING', value: 'OK FOR INVOICING' },
                { label: 'FUTURE INVOICE', value: 'FUTURE INVOICE' },
                { label: 'INVOICED', value: 'INVOICED' },
                { label: 'INCOMPLETE', value: 'INCOMPLETE' },
                { label: 'OK FOR CANCELLATION', value: 'OK FOR CANCELLATION' },
                { label: 'CANCELLED', value: 'CANCELLED' },
            ];
        case 'data.purchaseOrderStatus':
            return [
                { label: 'Invoice Received', value: 'Invoice Received' },
                {
                    label: 'Invoice Not Received',
                    value: 'Invoice Not Received',
                },
            ];
        case 'data.costStatus':
            return [
                { label: 'Cost Invoiced', value: 'Cost Invoiced' },
                { label: 'Cost Not Invoiced', value: 'Cost Not Invoiced' },
            ];
        case 'data.invoiceStatusSI':
            return [
                { label: 'Paid', value: 'Paid' },
                { label: 'Not Paid', value: 'Not Paid' },
            ];
    }
    return [];
};

function bytesToSize(bytes: number) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return '0 Byte';
    var i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

const filterTypes = {
    text: [
        { label: 'Exact', value: 'exact' },
        { label: 'Includes', value: 'includes' },
    ],
    string: [
        { label: 'Exact', value: 'exact' },
        { label: 'Includes', value: 'includes' },
    ],
    number: [
        { label: 'Exact', value: 'exact' },
        { label: 'Range', value: 'range' },
    ],
    dropdown: [
        { label: 'Exact', value: 'exact' },
        { label: 'Includes', value: 'includes' },
    ],
    'multiple-dropdown': [
        { label: 'Exact', value: 'exact' },
        { label: 'Includes', value: 'includes' },
    ],
    date: [
        { label: 'Exact', value: 'exact' },
        { label: 'Range', value: 'range' },
    ],
};

const expandIconProps = ({ rowData }: { rowData: any }) => ({
    expanding: !rowData.children || rowData.children.length === 0,
});

const hasAllColumns = (values: string[]): boolean => {
    const exceptions = ['CTCM', 'LDM', 'CMCT', 'LMD'];
    const filteredDefaultColumns = defaultColumns.filter(
        (col) => !exceptions.includes(col)
    );

    return filteredDefaultColumns.every((col) => values.includes(col));
};

export function SubmissionsTable(props: Props) {
    const [rejectedSubmission, setRejectedSubmission] = useState<
        Submission | undefined
    >(undefined);

    const [rejectedSubmissionComm, setRejectedSubmissionComm] = useState<
        Submission | undefined
    >(undefined);
    const [selectedTemplate, setSelectedTemplate] = useState('local');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [sourceSubmissions, setSourceSubmissions] = useState(new Map());
    const [currentUser, setCurrentUser] = useState({ displayName: 'unknown' });
    const [debugOverlayHidden, hideDebugOverlay] = useState(true);
    // const [previousValues, setPreviousValues] = useState<string[]>([]);
    const [previousValuesProject, setPreviousValuesProject] = useState<
        string[]
    >([]);
    const [previousValuesComm, setPreviousValuesComm] = useState<string[]>([]);
    const [filters, setFilters] = useState<FilterField[]>([]);
    const [displayedColumns, setDisplayedColumns] =
        useState<string[]>(defaultColumns);
    const [tabIndex, setTabIndex] = useState(0);
    const [totalCostAmount, setTotalCostAmount] = useState(0);
    const [totalCostAmountCostGL, setTotalCostAmountCostGL] = useState(0);
    const [totalCostAmountLC, setTotalCostAmountLC] = useState(0);
    const [totalCostAmountLCCostGL, setTotalCostAmountLCCostGL] = useState(0);
    const [totalIncomeAmount, setTotalIncomeAmount] = useState(0);
    const [totalIncomeAmountLCIncomeGL, setTotalIncomeAmountLCIncomeGL] =
        useState(0);
    const [totalIncomeAmountIncomeGL, setTotalIncomeAmountIncomeGL] =
        useState(0);
    const [totalIncomeAmountLC, setTotalIncomeAmountLC] = useState(0);
    const [totalCostsInTool, setTotalCostsInTool] = useState(0);
    const [totalIncomeInTool, setTotalIncomeInTool] = useState(0);
    const [totalCostsInToolEUR, setTotalCostsInToolEUR] = useState(0);
    const [totalIncomeInToolEUR, setTotalIncomeInToolEUR] = useState(0);
    const [totalLossInToolEUR, setTotalLossInToolEUR] = useState(0);
    const [totalLossInToolLC, setTotalLossInToolLC] = useState(0);
    const [totalProfitInToolEUR, setTotalProfitInToolEUR] = useState(0);
    const [totalProfitInToolLC, setTotalProfitInToolLC] = useState(0);
    const [presetNewName, setPresetNewName] = useState('');

    // const { fps, avgFps } = useFps(20);
    const [tableWidth, setTableWidth] = useState(1000);

    //Projects submissions
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    //Invoicing submissions
    const [communicationSubmissions, setCommunicationSubmissions] = useState<
        Submission[]
    >([]);

    const [financialYear, setFinancialYear] = useState<string>('');
    const [filteredSubmissions, setFilteredSubmissions] = useState<
        Submission[]
    >([]);
    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
    const [
        filteredCommunicationSubmissions,
        setFilteredCommunicationSubmissions,
    ] = useState<Submission[]>([]);
    const [onlyMine, setOnlyMine] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [scrollLeft, setScrollLeft] = React.useState(0);
    const [userRoles, setUserRoles] = useState<string[]>(props.roles);
    const [defaultColumnsWidth, setDefaultColumnsWidth] = useState({});
    const onScroll = React.useCallback(
        (args) => {
            if (args.scrollLeft !== scrollLeft) {
                setScrollLeft(args.scrollLeft);
            }
        },
        [scrollLeft]
    );

    const [totalRequests, setTotalRequests] = useState(1);

    useEffect(() => {
        fetchDropdowns().then(() => forceUpdate());
    }, []);
    const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);


    useEffect(() => {
        setUserRoles(props.roles);
    }, [props.roles]);

    useEffect(() => {
        let tca = 0;
        let tcal = 0;
        let tcit = 0;
        let tiit = 0;
        let tcite = 0;
        let tiite = 0;
        let tcacgl = 0;
        let tia = 0;
        let tial = 0;
        let tcalcgl = 0;
        let tialigl = 0;
        let tiaigl = 0;
        let tcalit = 0;
        let tcaeit = 0;
        let tpit = 0;
        let tlit = 0;
        let tpite = 0;
        let tlite = 0;
        filteredSubmissions.forEach((subm) => {
            if (subm.parentId === null) {
                tca += subm.data.costAmountEUR || 0;
                tcacgl += subm.data.costAmountEURCostGL || 0;
                tcal += subm.data.costAmountLC || 0;
                tia += subm.data.incomeAmountEURSI || 0;
                tial += subm.data.incomeAmountLCSI || 0;
                tcalcgl += subm.data.costAmountLCCostGL || 0;
                tialigl += subm.data.incomeAmountLCIncomeGL || 0;
                tiaigl += subm.data.incomeAmountEurIncomeGL || 0;
                let sumLC =
                    (subm.data.incomeAmountLCSI +
                        subm.data.incomeAmountLCIncomeGL) *
                        -1 -
                    (subm.data.costAmountLC + subm.data.costAmountLCCostGL);
                if (sumLC < 0) {
                    tlit += sumLC;
                } else {
                    tpit += sumLC;
                }
                let sumEUR =
                    (subm.data.incomeAmountEURSI +
                        subm.data.incomeAmountEurIncomeGL) *
                        -1 -
                    (subm.data.costAmountEUR + subm.data.costAmountEURCostGL);
                if (sumEUR < 0) {
                    tlite += sumEUR;
                } else {
                    tpite += sumEUR;
                }
            }
        });
        tcit = -(tcal + tcalcgl);
        tiit = -(tial + tialigl);
        tcite = -(tca + tcacgl);
        tiite = -(tia + tiaigl);
        setTotalCostAmount(tca);
        setTotalCostAmountCostGL(tcacgl);
        setTotalCostAmountLC(tcal);
        setTotalCostAmountLCCostGL(tcalcgl);
        setTotalIncomeAmount(tia);
        setTotalIncomeAmountLCIncomeGL(tialigl);
        setTotalIncomeAmountLC(tial);
        setTotalIncomeAmountIncomeGL(tiaigl);
        setTotalCostsInTool(tcit);
        setTotalIncomeInTool(tiit);
        setTotalCostsInToolEUR(tcite);
        setTotalIncomeInToolEUR(tiite);
        // console.log(tpit, tlit, tpite, tlite);
        setTotalProfitInToolLC(tiit + tcite > 0 ? tiit + tcite : 0);
        setTotalProfitInToolEUR(tiite + tcite > 0 ? tiite + tcite : 0);
        setTotalLossInToolLC(tiit + tcite < 0 ? tiit + tcite : 0);
        setTotalLossInToolEUR(tiite + tcite < 0 ? tiite + tcite : 0);
        forceUpdate();
    }, [filteredSubmissions]);

    useEffect(() => {
        var filteredMap = new Map();
        var filtered: Submission[] = [];
        var cFilteredMap = new Map();
        var filteredCommunication: Submission[] = [];
        var f: FilterField[] = JSON.parse(JSON.stringify(filters));

        if (onlyMine) {
            f.push({
                columnValue: 'author',
                columnLabel: 'Author',
                type: 'string',
                filter: 'exact',
                values: [],
                selectedValues: [currentUser.displayName],
            } as FilterField);
        }

        if (financialYear !== '') {
            const fullYear = `20${financialYear}`;
            submissions.forEach((submission) => {
                let valid = true;
                let validCost = true;
                let validIncome = true;
                let validCostGL = true;
                let validIncomeGL = true;

                validCost = submission.data.yearMonth
                    ? submission.data.yearMonth.includes(fullYear)
                    : false;
                validIncome = submission.data.yearMonthSI
                    ? submission.data.yearMonthSI.includes(fullYear)
                    : false;
                validCostGL = submission.data.yearMonthCostGL
                    ? submission.data.yearMonthCostGL.includes(fullYear)
                    : false;
                validIncomeGL = submission.data.yearMonthIncomeGL
                    ? submission.data.yearMonthIncomeGL.includes(fullYear)
                    : false;
                valid =
                    validCost || validIncome || validCostGL || validIncomeGL;

                if (valid) {
                    filteredMap.set(submission.id, submission);
                }
            });
            f.push({
                columnValue: 'data.yearMonth',
                columnLabel: 'Year Month',
                type: 'string',
                filter: 'includes',
                values: [],
                selectedValues: [fullYear],
            } as FilterField);
        }
        //   const selectedValues = Array.from(
        //     { length: 12 },
        //     (_, i) => `${fullYear}/${i + 1}`
        //   );
        //   f.push({
        //     columnValue: "data.yearMonth",
        //     columnLabel: "Year Month",
        //     type: "string",
        //     filter: "includes",
        //     values: [],
        //     selectedValues: [selectedValues],
        //   } as FilterField);
        // }
        if (f.length > 0 && submissions.length > 0) {
            if (financialYear === '') {
                submissions.forEach((submission) => {
                    var valid = true;
                    for (let filter of f) {
                        if (
                            filter.columnLabel.includes(
                                'Input of Local Marketing Department'
                            ) ||
                            filter.columnLabel.includes(
                                'Input of Central Marketing Controlling Team'
                            )
                        ) {
                            return;
                        }

                        if (
                            filter.selectedValues !== null &&
                            filter.selectedValues.length > 0
                        ) {
                            var value = _.get(
                                submission,
                                filter.columnValue,
                                filter
                            );

                            if (value === undefined) {
                                valid = false;
                                return;
                            }
                            switch (filter.type) {
                                case 'text':
                                case 'string':
                                    switch (filter.filter) {
                                        case 'exact':
                                            if (
                                                filter.columnValue ===
                                                    'data.documentNumber' ||
                                                filter.columnValue ===
                                                    'data.costAccount' ||
                                                filter.columnValue ===
                                                    'data.documentNumberSI' ||
                                                filter.columnValue ===
                                                    'data.incomeAccountSI' ||
                                                filter.columnValue ===
                                                    'data.documentNumberCostGL' ||
                                                filter.columnValue ===
                                                    'data.costAccountCostGL' ||
                                                filter.columnValue ===
                                                    'data.documentNumberIncomeGL' ||
                                                filter.columnValue ===
                                                    'data.incomeAccountIncomeGL'
                                            ) {
                                                valid = value
                                                    .toString()
                                                    .endsWith(
                                                        filter.selectedValues[0].toString()
                                                    );
                                            } else {
                                                valid =
                                                    filter.selectedValues[0].toString() ===
                                                    value.toString();
                                            }
                                            break;
                                        case 'includes':
                                            if (
                                                !value
                                                    .toString()
                                                    .toLowerCase()
                                                    .includes(
                                                        filter.selectedValues[0]
                                                            .toString()
                                                            .toLowerCase()
                                                    )
                                            ) {
                                                valid = false;
                                            }
                                            break;
                                    }
                                    break;
                                case 'number':
                                    switch (filter.filter) {
                                        case 'exact':
                                            if (!isNaN(value)) {
                                                valid =
                                                    Number(
                                                        filter.selectedValues[0]
                                                    ) ===
                                                    Math.round(value * 100) /
                                                        100;
                                            } else {
                                                valid = false;
                                            }
                                            break;
                                        case 'range':
                                            if (
                                                filter.selectedValues.length ===
                                                2
                                            ) {
                                                if (!isNaN(value)) {
                                                    let roundValue =
                                                        Math.round(
                                                            value * 100
                                                        ) / 100;
                                                    if (
                                                        Number(
                                                            filter
                                                                .selectedValues[0]
                                                        ) >
                                                        Number(
                                                            filter
                                                                .selectedValues[1]
                                                        )
                                                    ) {
                                                        valid =
                                                            roundValue <=
                                                                Number(
                                                                    filter
                                                                        .selectedValues[0]
                                                                ) &&
                                                            roundValue >=
                                                                Number(
                                                                    filter
                                                                        .selectedValues[1]
                                                                );
                                                    } else {
                                                        valid =
                                                            roundValue >=
                                                                Number(
                                                                    filter
                                                                        .selectedValues[0]
                                                                ) &&
                                                            roundValue <=
                                                                Number(
                                                                    filter
                                                                        .selectedValues[1]
                                                                );
                                                    }
                                                } else {
                                                    valid = false;
                                                }
                                            }
                                            break;
                                    }
                                    break;
                                case 'dropdown':
                                    switch (filter.filter) {
                                        case 'exact':
                                            var exists = false;
                                            // eslint-disable-next-line no-loop-func
                                            const options = loadOptions(
                                                filter.columnValue
                                            );
                                            filter.selectedValues.forEach(
                                                (filterValue) => {
                                                    const tmp = options.find(
                                                        (option) => {
                                                            return (
                                                                option.value
                                                                    .debitorischer ===
                                                                filterValue.debitorischer
                                                            );
                                                        }
                                                    );
                                                    let selectedOption = '';
                                                    if (tmp) {
                                                        selectedOption =
                                                            tmp.label;
                                                    }

                                                    // const selectedLabel = selectedOption
                                                    //   ? selectedOption.label
                                                    //   : null;
                                                    // console.log(selectedLabel);
                                                    if (filterValue === value) {
                                                        exists = true;
                                                    }
                                                }
                                            );

                                            if (!exists) {
                                                valid = false;
                                            }
                                            break;
                                        case 'includes':
                                            valid = false;
                                            break;
                                    }
                                    break;
                                case 'multiple-dropdown':
                                    switch (filter.filter) {
                                        case 'includes':
                                            var exists = false;
                                            // eslint-disable-next-line no-loop-func
                                            filter.selectedValues.forEach(
                                                (filterValue) => {
                                                    if (
                                                        filterValue.toString() ===
                                                        value
                                                    ) {
                                                        exists = true;
                                                    }
                                                }
                                            );
                                            if (!exists) {
                                                valid = false;
                                            }
                                            break;
                                        case 'exact':
                                            valid = false;
                                            break;
                                    }
                                    break;
                                case 'date':
                                    var v = new Date(value).setHours(
                                        0,
                                        0,
                                        0,
                                        0
                                    );
                                    var filterDate = new Date(
                                        filter.selectedValues[0]
                                    ).setHours(0, 0, 0, 0);
                                    if (
                                        v !== null &&
                                        filter.filter === 'range' &&
                                        filter.selectedValues.length === 2 &&
                                        filter.selectedValues[0] !== null &&
                                        filter.selectedValues[1] !== null
                                    ) {
                                        var filterEndDate = new Date(
                                            filter.selectedValues[1]
                                        ).setHours(0, 0, 0, 0);
                                        valid =
                                            v >= filterDate &&
                                            v <= filterEndDate;
                                    } else if (
                                        v !== null &&
                                        filter.selectedValues[0] !== null &&
                                        filter.filter === 'exact' &&
                                        filter.selectedValues.length === 1
                                    ) {
                                        valid = v === filterDate;
                                    }
                                    break;
                            }
                        }
                        if (!valid) {
                            return;
                        }
                    }

                    if (valid) {
                        // submission.parentId = null;
                        // if (submission.parentId !== null) {
                        //   var parent = sourceSubmissions.get(submission.parentId);
                        //   if (parent !== undefined && parent.id !== undefined) {
                        //     filteredMap.set(parent.id, parent);
                        //   }
                        //   submissions.forEach((s) => {
                        //     if (s.parentId === submission.parentId) {
                        //       filteredMap.set(s.id, s);
                        //     }
                        //   });
                        // }
                        filteredMap.set(submission.id, submission);
                    }
                });
                ///
                communicationSubmissions.forEach((submission) => {
                    var valid = true;
                    filters.forEach((filter) => {
                        if (
                            !filter.columnLabel.includes(
                                'Input of Local Marketing Department'
                            ) &&
                            !filter.columnLabel.includes(
                                'Input of Central Marketing Controlling Team'
                            )
                        ) {
                            return;
                        }
                        if (
                            filter.selectedValues !== null &&
                            filter.selectedValues.length > 0
                        ) {
                            var value = _.get(submission, filter.columnValue);
                            if (value === undefined || value === null) {
                                value = '';
                            }
                            if (value === undefined) {
                                valid = false;
                                return;
                            }
                            switch (filter.type) {
                                case 'text':
                                case 'string':
                                    switch (filter.filter) {
                                        case 'exact':
                                            valid =
                                                filter.selectedValues[0].toString() ===
                                                value.toString();
                                            break;
                                        case 'includes':
                                            valid = value
                                                .toString()
                                                .toLowerCase()
                                                .includes(
                                                    filter.selectedValues[0]
                                                        .toString()
                                                        .toLowerCase()
                                                );
                                            break;
                                    }
                                    break;
                                case 'number':
                                    switch (filter.filter) {
                                        case 'exact':
                                            valid =
                                                filter.selectedValues[0].toFixed(
                                                    2
                                                ) === value.toFixed(2);
                                            break;
                                        case 'range':
                                            if (
                                                filter.selectedValues.length ===
                                                2
                                            ) {
                                                valid =
                                                    value >=
                                                        filter
                                                            .selectedValues[0] &&
                                                    value <=
                                                        filter
                                                            .selectedValues[1];
                                            }
                                            break;
                                    }
                                    break;
                                case 'dropdown':
                                case 'multiple-dropdown':
                                    switch (filter.filter) {
                                        case 'includes':
                                            var exists = false;
                                            filter.selectedValues.forEach(
                                                (filterValue) => {
                                                    if (
                                                        filterValue.toString() ===
                                                        value
                                                    ) {
                                                        exists = true;
                                                    }
                                                }
                                            );
                                            if (!exists) {
                                                valid = false;
                                            }
                                            break;
                                        case 'exact':
                                            valid = false;
                                            break;
                                    }
                                    break;
                                case 'date':
                                    var v = new Date(value).setHours(
                                        0,
                                        0,
                                        0,
                                        0
                                    );
                                    if (
                                        v !== null &&
                                        filter.filter === 'range' &&
                                        filter.selectedValues.length === 2 &&
                                        filter.selectedValues[0] !== null &&
                                        filter.selectedValues[1] !== null
                                    ) {
                                        valid =
                                            v >=
                                                filter.selectedValues[0].setHours(
                                                    0,
                                                    0,
                                                    0,
                                                    0
                                                ) &&
                                            v <=
                                                filter.selectedValues[1].setHours(
                                                    0,
                                                    0,
                                                    0,
                                                    0
                                                );
                                    } else if (
                                        v !== null &&
                                        filter.selectedValues[0] !== null &&
                                        filter.filter === 'exact' &&
                                        filter.selectedValues.length === 1
                                    ) {
                                        valid =
                                            v ===
                                            filter.selectedValues[0].setHours(
                                                0,
                                                0,
                                                0,
                                                0
                                            );
                                    }
                                    break;
                            }
                        }
                    });
                    if (valid) {
                        // submission.parentId = null;
                        // if (submission.parentId !== null) {
                        //   var parent = sourceSubmissions.get(submission.parentId);
                        //   if (parent !== undefined && parent.id !== undefined) {
                        //     cFilteredMap.set(parent.id, parent);
                        //   }
                        // }
                        cFilteredMap.set(submission.id, submission);
                    }
                });
                ///
            }
            communicationSubmissions.forEach((value) => {
                if (value.parentId !== null) {
                    if (!cFilteredMap.has(value.parentId)) {
                        value.data.temp = value.parentId;
                        value.parentId = null;
                    }
                }
                filteredCommunication.push(value);
            });
            filteredMap.forEach((value) => {
                if (value.parentId !== null) {
                    if (!filteredMap.has(value.parentId)) {
                        value.data.temp = value.parentId;
                        value.parentId = null;
                    }
                }
                filtered.push(value);
            });
            setFilteredCommunicationSubmissions(filteredCommunication);
            setFilteredSubmissions(filtered);
        } else {
            communicationSubmissions.forEach((value) => {
                if (value.data.temp !== undefined) {
                    value.parentId = value.data.temp;
                    value.data.temp = undefined;
                }
                filteredCommunication.push(value);
            });
            submissions.forEach((value) => {
                if (value.data.temp !== undefined) {
                    value.parentId = value.data.temp;
                    value.data.temp = undefined;
                }
                filtered.push(value);
            });
            setFilteredSubmissions(submissions);
            setFilteredCommunicationSubmissions(communicationSubmissions);
        }
    }, [
        filters,
        submissions,
        communicationSubmissions,
        onlyMine,
        financialYear,
    ]);

    const getVisibleColumnIndices = (offset: number, columns: any) => {
        var netOffsets: any[] = [],
            offsetSum = 0,
            leftBound = offset - 200,
            rightBound = offset + tableWidth,
            visibleIndices: any[] = [];

        columns.forEach((col: any) => {
            netOffsets.push(offsetSum);
            offsetSum += col.width;
        });

        netOffsets.forEach((columnOffset, colIdx) => {
            var isOutside =
                columnOffset < leftBound || columnOffset > rightBound;
            if (!isOutside) {
                visibleIndices.push(colIdx);
            }
        });

        return visibleIndices;
    };

    const rowRenderer = React.useCallback(
        ({ cells, columns }) => {
            // null out hidden content on scroll
            if (cells.length === 89) {
                const visibleIndices = getVisibleColumnIndices(
                    scrollLeft,
                    columns
                );
                const startIndex = visibleIndices[0];
                const visibleCells: any = visibleIndices.map((x) => cells[x]);

                if (startIndex > 0) {
                    let width = 0;
                    for (let i = 0; i < visibleIndices[0]; i++) {
                        width += cells[i].props.style.width;
                    }

                    const placeholder = (
                        <div key="placeholder" style={{ width }} />
                    );
                    return [placeholder, visibleCells];
                }
                return visibleCells;
            }

            return cells;
        },
        [scrollLeft]
    );
    const addHoursToDate = (date: Date, hoursToAdd: number): Date => {
        return new Date(date.getTime() + hoursToAdd * 60 * 60 * 1000);
    };
    const getFilteredColumns = (tabIndex: number) => {
        if (tabIndex === 0) {
            return DisplayedColumnsList.slice(0, 11);
        }
        return DisplayedColumnsList.slice(-2);
    };

    const handleTabsChange = (index: any) => {
        setTabIndex(index); // update the state

        if (index === 0) {
            if (previousValuesProject.length === 0) {
                setDisplayedColumns(defaultColumns);
                let columns = [
                    'all',
                    'generalInformation',
                    'projectInformation',
                    'purchaseOrder',
                    'costInvoices',
                    'salesInvoices',
                    'costGlPostings',
                    'incomeGlPostings',
                    'projectResults',
                    'controlChecks',
                ];
                setDisplayedColumns(columns);
            } else {
                setDisplayedColumns(previousValuesProject);
            }
        } else if (index === 1) {
            if (previousValuesComm.length === 0) {
                let columns = ['CMCT', 'LMD'];

                setDisplayedColumns(columns);
            } else {
                setDisplayedColumns(previousValuesComm);
            }
        }
    };

    async function partialUpdate(submission: string, path: string, value: any) {
        setTotalRequests(totalRequests + 1);
        if (path.includes('[')) {
            var s = path.split('.');
            s.shift();
            path = s.join('.');
        }
        RestAPI.updateSubmissionPartial(submission, path, value);
    }

    function hasRequiredFields(ts: any) {
        if (!ts || !ts.data) {
            return false;
        }
        let requiredFields: string[] = [];
        switch (ts.data['invoiceTypeLMD']) {
            case 'Invoice':
                requiredFields = invoiceMandatoryFields;
                break;
            case 'Pre-Invoice':
                requiredFields = preInvoiceMandatoryFields;
                break;
            case 'Internal Invoice':
                requiredFields = internalInvoiceMandatoryFields;
                break;
            case 'Cancellation':
                requiredFields = cancellationMandatoryFields;
                break;
        }
        // Check if all required fields are present and not empty
        for (let field of requiredFields) {
            if (!ts.data[field] || ts.data[field].length === 0) {
                return false;
            }
        }

        // Check if paymentMethodLMD is "Money in House" and depositNumberLMD is present and not empty
        if (
            (ts.data.paymentMethodLMD === 'Money in House' ||
                ts.data.paymentMethodLMD === 'Intercompany') &&
            (!ts.data.depositNumberLMD || ts.data.depositNumberLMD.length === 0)
        ) {
            return false;
        }

        return true;
    }

    function handleCellUpdate(submission: string, path: string, value: any) {
        var submissionIndex = submissions.findIndex((s) => s.id === submission);
        if (submissionIndex > -1) {
            path = `[${submissionIndex}].${path}`;
            if (_.get(submissions, path) !== value) {
                _.set(submissions, path, value);
                partialUpdate(submission, path, value);
            }
        }
    }

    const projectsTableColumns = getProjectColumns(
        columnWidth,
        visibilityController,
        handleCellUpdate,
        loadOptions,
        userRoles,
        totalCostAmountLC,
        InternationalVendorsNames,
        VendorsNames,
        totalCostAmount,
        totalIncomeInTool,
        totalIncomeAmountLC,
        totalIncomeAmount,
        totalCostAmountCostGL,
        totalCostAmountLCCostGL,
        totalCostsInTool,
        totalIncomeAmountLCIncomeGL,
        totalIncomeAmountIncomeGL,
        totalProfitInToolLC,
        totalCostsInToolEUR,
        totalIncomeInToolEUR,
        totalLossInToolLC,
        totalProfitInToolEUR,
        totalLossInToolEUR,
        setRejectedSubmission
    );

    function handleCommunicationCellUpdate(
        submission: string,
        path: string,
        value: any
    ) {
        //TODO Error handling
        var submissionIndex = communicationSubmissions.findIndex(
            (s) => s.id === submission
        );

        if (submissionIndex > -1) {
            path = `[${submissionIndex}].${path}`;

            if (_.get(communicationSubmissions, path) !== value) {
                _.set(communicationSubmissions, path, value);
                partialUpdate(submission, path, value);
                var datePath = `[${submissionIndex}].data.entryDateLMD`;
                if (_.get(communicationSubmissions, datePath) === undefined) {
                    _.set(communicationSubmissions, datePath, new Date());
                    partialUpdate(submission, datePath, new Date().toString());
                }
            }
        }
    }
    const toggleRowExpansion = (rowKey: string) => {
        setExpandedRowKeys((prevKeys) => {
            if (prevKeys.includes(rowKey)) {
                return prevKeys.filter((key) => key !== rowKey);
            } else {
                return [...prevKeys, rowKey];
            }
        });
    };

    const formatDate = (dateInput: string | Date): string => {
        const date = new Date(dateInput);

        if (!dateInput || isNaN(date.getTime())) {
            return '';
        }

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed in JavaScript
        const year = date.getFullYear();

        return `${day}.${month}.${year}`;
    };

    const expandAllRows = () => {
        const allRowKeys = submissions
            .map((row) => row.id?.toString())
            .filter((id): id is string => id !== undefined);

        setExpandedRowKeys(allRowKeys);
    };

    const handleRowClick = (event: any) => {
        toggleRowExpansion(event.rowData.id);
    };

    function fieldBackColor(props: any) {
        if (
            props.rowData.data.invoiceTypeLMD === 'Cancellation' ||
            (props.cellData && props.cellData.length > 0)
        ) {
            return '#F5FAEF';
        } else {
            return '#f7cdd6';
        }
    }

    function cellColor(props: any): string {
        //TODOrefactor this function
        var mandatoryFields: any = [];
        if (
            props.column.key === 'data.invoiceTypeLMD' &&
            props.cellData === ''
        ) {
            return '#f7cdd6';
        }
        const {
            equal: countryPrefixEqual
        } = checkCountryPrefixEqual(
            props.rowData.data.alsoMarketingProjectNumberLMD
        );

        if (props.rowData.data.invoiceTypeLMD === 'Invoice') {
            if (
                !countryPrefixEqual &&
                (props.column.key === 'data.vendorLMD' ||
                    props.column.key === 'data.buLMD')
            ) {
                return '#F5FAEF';
            }
        }

        if (props.column.key === 'data.selfInvoiceNumber') {
            if (
                props.rowData.data.invoiceTypeLMD === 'Internal Invoice' &&
                props.rowData.data.statusLMD === 'OK FOR INVOICING' &&
                !props.rowData.data.selfInvoiceNumber
            ) {
                return '#f7cdd6';
            } else {
                return '#f9f9ff';
            }
        }


        switch (props.rowData.data.invoiceTypeLMD) {
            case 'Invoice':
                mandatoryFields = invoiceMandatoryFields;
                break;
            // case 'Pre-Invoice':
            //     mandatoryFields = preInvoiceMandatoryFields;
            //     break;
            case 'Internal Invoice':
                mandatoryFields = internalInvoiceMandatoryFields;
                break;
            case 'Cancellation':
                mandatoryFields = cancellationMandatoryFields;
                break;
        }

        if (
            mandatoryFields.includes(
                props.column.key.substring(5, props.column.key.length)
            ) &&
            mandatoryFieldValidation(props) === '#f7cdd6'
        ) {
            return '#f7cdd6';
        } else {
            if (props.column.key === 'data.depositNumberLMD') {
                if (
                    (props.rowData.data.paymentMethodLMD === 'Money in House' ||
                        props.rowData.data.paymentMethodLMD ===
                            'Intercompany') &&
                    props.cellData === ''
                ) {
                    return '#f7cdd6';
                } else {
                    return '#F5FAEF';
                }
            }
        }

        if (
            invoiceBlueFields.includes(
                props.column.key.substring(5, props.column.key.length)
            ) &&
            props.rowData.data.newLine!
        ) {
            if (props.rowData.data.invoiceTypeLMD === 'Cancellation') {
                return '#F5FAEF';
            }
            return '#d0d0ff';
        } else {
            return '#F5FAEF';
        }
    }

    function reject(submissionId: string, viewId: string, comment: string) {
        RestAPI.getView(viewId).then((response) => {
            response.data.submission.data['_rejected'] = true;
            response.data.submission.data['_rejectedComment'] = comment;
            RestAPI.createDraft(response.data).then(() => {
                toast(
                    <Toast
                        title={'Project Rejected'}
                        message={
                            'Project was rejected and can now be found in drafts section'
                        }
                        type={'success'}
                    />
                );
            });
            RestAPI.deleteSubmission(submissionId);
            var temp = [...submissions];
            var submissionIndex = submissions.findIndex(
                (s) => s.id === submissionId
            );
            temp.splice(submissionIndex, 1);
            setSubmissions(temp);
        });
    }

    function sortAndStructureData(dataArray: Submission[]): Submission[] {
        // Separating parent and child items
        const parentItems = dataArray.filter((item) => item.parentId === null);
        const childItems = dataArray.filter((item) => item.parentId !== null);

        // Sorting parent items by 'created' date
        parentItems.sort(
            (a, b) =>
                new Date(b.created).getTime() - new Date(a.created).getTime()
        );

        // Structuring sorted array
        const sortedAndStructuredArray: Submission[] = [];

        parentItems.forEach((parentItem) => {
            sortedAndStructuredArray.push(parentItem); // Adding parent item
            // Extracting and sorting child items of the current parent
            const currentChildItems = childItems.filter(
                (childItem) => childItem.parentId === parentItem.id
            );
            // Optionally: Sort children by some property if needed
            // currentChildItems.sort((a, b) => someComparingFunction);
            sortedAndStructuredArray.push(...currentChildItems); // Adding child items
        });

        return sortedAndStructuredArray;
    }

    async function handleResize(column: string, width: number) {
        var c = localStorage.getItem('vendors.columns');
        var columns = {} as any;
        if (c !== null) {
            columns = JSON.parse(c);
        }
        columns[column] = width;
        localStorage.setItem('vendors.columns', JSON.stringify(columns));
    }

    function columnWidth(column: string, dw: number) {
        var sd = (defaultColumnsWidth as any)[column];
        return sd ? sd : dw;
    }

    useEffect(() => {
        var selected = localStorage.getItem('template') || 'local';
        setSelectedTemplate(selected);

        const match = presetNewName ? presetNewName : selected;
        var template = templates.find((t) => t.name === match);
        if (template) {
            setDisplayedColumns(template.columns);
            setFilters(template.filters);
        }
    }, [templates]);

    useEffect(() => {
        localStorage.setItem('template', presetNewName || selectedTemplate);
    }, [selectedTemplate, presetNewName]);

    const fetchTemplates = async () => {
        const templatesRes = await RestAPI.getTemplates();
        setTemplates(templatesRes.data);
    };

    const fetchData = async () => {
        try {
            fetchTemplates();

            const submissionsRes = await RestAPI.getSubmissions();
            var vSubs: Submission[] = [];
            var subs = submissionsRes.data;
            var ss = new Map();
            var cSubs: Submission[] = [];

            subs.forEach((sub) => {
                if (sub.group === 'communication') {
                    cSubs.push(sub);
                } else {
                    vSubs.push(sub);
                }
                ss.set(sub.id, sub);
            });

            vSubs.map((sub) => {
                if (sub.parentId === null) {
                    sub.data.costAmountLC = 0;
                    sub.data.costAmountEUR = 0;
                    sub.data.incomeAmountLCSI = 0;
                    sub.data.incomeAmountEURSI = 0;
                    sub.data.costAmountLCCostGL = 0;
                    sub.data.costAmountEURCostGL = 0;
                    sub.data.incomeAmountLCIncomeGL = 0;
                    sub.data.incomeAmountEurIncomeGL = 0;
                    sub.data.totalIncomeLC = 0;
                    sub.data.totalCostsLC = 0;
                    sub.data.totalIncomeEUR = 0;
                    sub.data.totalCostsEUR = 0;
                    sub.data.totalCostsTool = 0;
                    sub.data.totalIncomeTool = 0;
                    sub.data.totalIncomeSAP = 0;
                    sub.data.totalCostsSAP = 0;
                    vSubs
                        .filter((s) => s.parentId === sub.id)
                        .forEach((cs) => {
                            sub.data.costAmountLC += cs.data.costAmountLC || 0;
                            sub.data.costAmountEUR +=
                                cs.data.costAmountEUR || 0;
                            sub.data.incomeAmountLCSI +=
                                cs.data.incomeAmountLCSI || 0;
                            sub.data.incomeAmountEURSI +=
                                cs.data.incomeAmountEURSI || 0;
                            sub.data.costAmountLCCostGL +=
                                cs.data.costAmountLCCostGL || 0;
                            sub.data.costAmountEURCostGL +=
                                cs.data.costAmountEURCostGL || 0;
                            sub.data.incomeAmountLCIncomeGL +=
                                cs.data.incomeAmountLCIncomeGL || 0;
                            sub.data.incomeAmountEurIncomeGL +=
                                cs.data.incomeAmountEurIncomeGL || 0;

                            let incomeLC = cs.data.incomeAmountLCSI || 0;
                            let incomeLCGL =
                                cs.data.incomeAmountLCIncomeGL || 0;
                            sub.data.totalIncomeLC += -(incomeLC + incomeLCGL);
                            sub.data.totalCostsLC += -(
                                (cs.data.costAmountLC || 0) +
                                (cs.data.costAmountLCCostGL || 0)
                            );
                            let incomeEUR = cs.data.incomeAmountEURSI || 0;
                            let incomeEURGL =
                                cs.data.incomeAmountEurIncomeGL || 0;
                            sub.data.totalIncomeEUR += -(
                                incomeEUR + incomeEURGL
                            );

                            sub.data.totalCostsEUR += -(
                                (cs.data.costAmountEUR || 0) +
                                (cs.data.costAmountEURCostGL || 0)
                            );
                            sub.data.totalCostsTool +=
                                cs.data.costAmountLC ||
                                0 + cs.data.costAmountLCCostG ||
                                0;
                            sub.data.totalCostsSAP +=
                                cs.data.costAmountLC ||
                                0 + cs.data.costAmountLCCostG ||
                                0;
                            sub.data.totalProfitLC +=
                                (cs.data.costAmountLC || 0) +
                                (cs.data.costAmountLCCostGL || 0);
                            sub.data.totalIncomeTool +=
                                (cs.data.incomeAmountLCSI || 0) +
                                (cs.data.incomeAmountLCIncomeGL || 0);

                            sub.data.totalIncomeSAP +=
                                (cs.data.incomeAmountLCSI || 0) +
                                (cs.data.incomeAmountLCIncomeGL || 0);
                        });
                    if (sub.data.totalIncomeLC + sub.data.totalCostsLC >= 0) {
                        sub.data.totalProfitLC =
                            sub.data.totalIncomeLC + sub.data.totalCostsLC;
                    } else {
                        sub.data.totalProfitLC = 0;
                        sub.data.totalLossLC = -(
                            sub.data.totalIncomeLC + sub.data.totalCostsLC
                        );
                    }
                    if (sub.data.totalIncomeEUR + sub.data.totalCostsEUR >= 0) {
                        sub.data.totalProfitEUR =
                            sub.data.totalIncomeEUR + sub.data.totalCostsEUR;
                    } else {
                        sub.data.totalProfitEUR = 0;
                        sub.data.totalLossEUR = -(
                            sub.data.totalIncomeEUR + sub.data.totalCostsEUR
                        );
                    }
                    sub.data.totalCostsSAP = sub.data.totalCostsTool;
                }
            });
            let sortedSubs: Submission[] = [];
            sortedSubs = vSubs.sort((a, b) => {
                if (a.parentId === null && b.parentId === null) {
                    if (a.created > b.created) return -1;
                    if (a.created < b.created) return 1;
                }
                if (a.parentId === null && b.parentId !== null) return -1;
                if (a.parentId !== null && b.parentId === null) return 1;

                if (a.parentId !== null && b.parentId !== null) {
                    const projectTypeA = a.data['projectType'];
                    const projectTypeB = b.data['projectType'];

                    // Anything but Purchase Order and not undefined first
                    if (
                        projectTypeA !== 'Purchase Order' &&
                        projectTypeA !== undefined &&
                        (projectTypeB === 'Purchase Order' ||
                            projectTypeB === undefined)
                    )
                        return -1;
                    if (
                        projectTypeB !== 'Purchase Order' &&
                        projectTypeB !== undefined &&
                        (projectTypeA === 'Purchase Order' ||
                            projectTypeA === undefined)
                    )
                        return 1;

                    // Undefined ones next
                    if (
                        projectTypeA === undefined &&
                        projectTypeB !== undefined
                    )
                        return -1;
                    if (
                        projectTypeB === undefined &&
                        projectTypeA !== undefined
                    )
                        return 1;

                    // Purchase Order last
                    if (projectTypeA === 'Purchase Order') return 1;
                    if (projectTypeB === 'Purchase Order') return -1;
                }

                return 0;
            });

            setCommunicationSubmissions(cSubs);
            setFilteredCommunicationSubmissions(cSubs);
            setSourceSubmissions(ss);
            setSubmissions(sortedSubs);
            setFilteredSubmissions(sortedSubs);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    useEffect(() => {
        getAccountInfo().then((response) => {
            if (response) {
                setCurrentUser(response);
            }
        });
    }, []);

    function findSubmissionsByPO(po: string) {
        var s: Submission[] = [];
        var parent = submissions.find(
            (submission) =>
                submission.data.projectNumber === po &&
                submission.parentId === null
        );
        if (parent !== undefined) {
            s.push(parent);
            s.push(...submissions.filter((sub) => sub.parentId === parent?.id));
        }
        return s;
    }

    function visibilityController(group: string, key: string) {
        return (
            !displayedColumns.includes(group) && !displayedColumns.includes(key)
        );
    }

    function mandatoryFieldValidation(props: any) {
        if (props === undefined) {
            return '#F5FAEF';
        }

        const {
            equal: countryPrefixEqual
        } = checkCountryPrefixEqual(
            props.rowData.data.alsoMarketingProjectNumberLMD
        );

        if (props.rowData.data.invoiceTypeLMD === 'Invoice') {
            if (
                !countryPrefixEqual &&
                (props.column.key === 'data.vendorLMD' ||
                    props.column.key === 'data.buLMD')
            ) {
                return '#F5FAEF';
            }
        }

        switch (props.rowData.data.invoiceTypeLMD) {
            case 'Invoice':
                if (props.column.key === 'data.depositNumberLMD') {
                    if (
                        props.rowData.data.paymentMethodLMD ===
                            'Money in House' ||
                        props.rowData.data.paymentMethodLMD === 'Intercompany'
                    ) {
                        return '#f7cdd6';
                    } else {
                        return '#F5FAEF';
                    }
                }
                if (
                    invoiceMandatoryFields.findIndex(
                        (element) =>
                            element ===
                            props.column.key.substring(
                                5,
                                props.column.key.length
                            )
                    ) > -1
                ) {
                    switch (typeof props.cellData) {
                        case 'number':
                            if (!props.cellData) {
                                return '#f7cdd6';
                            }
                            if (props.cellData > 0) {
                                return '#F5FAEF';
                            } else {
                                return '#f7cdd6';
                            }
                        case 'string':
                            if (props.cellData && props.cellData.length > 0) {
                                return '#F5FAEF';
                            } else {
                                return '#f7cdd6';
                            }
                        case 'object':
                            if (props.cellData === null) {
                                return '#f7cdd6';
                            } else {
                                return '#F5FAEF';
                            }
                        case 'undefined':
                            return '#f7cdd6';
                    }
                    return '#F5FAEF';
                } else {
                    return '#F5FAEF';
                }
            case 'Pre-Invoice':
                if (props.column.key === 'data.depositNumberLMD') {
                    if (
                        props.rowData.data.paymentMethodLMD ===
                            'Money in House' ||
                        props.rowData.data.paymentMethodLMD === 'Intercompany'
                    ) {
                        return '#f7cdd6';
                    } else {
                        return '#F5FAEF';
                    }
                }
                if (
                    preInvoiceMandatoryFields.findIndex(
                        (element) =>
                            element ===
                            props.column.key.substring(
                                5,
                                props.column.key.length
                            )
                    ) > -1
                ) {
                    switch (typeof props.cellData) {
                        case 'number':
                            if (!props.cellData) {
                                return '#f7cdd6';
                            }
                            if (props.cellData > 0) {
                                return '#F5FAEF';
                            } else {
                                return '#f7cdd6';
                            }
                        case 'string':
                            if (props.cellData && props.cellData.length > 0) {
                                return '#F5FAEF';
                            } else {
                                return '#f7cdd6';
                            }
                        case 'object':
                            if (props.cellData === null) {
                                return '#f7cdd6';
                            } else {
                                return '#F5FAEF';
                            }
                        case 'undefined':
                            return '#f7cdd6';
                    }
                    return '#F5FAEF';
                } else {
                    return '#F5FAEF';
                }
            case 'Internal Invoice':
                if (props.column.key === 'data.depositNumberLMD') {
                    if (
                        (props.rowData.data.paymentMethodLMD ===
                            'Money in House' ||
                            props.rowData.data.paymentMethodLMD ===
                                'Intercompany') &&
                        props.cellData === ''
                    ) {
                        return '#f7cdd6';
                    } else {
                        return '#F5FAEF';
                    }
                }
                if (
                    internalInvoiceMandatoryFields.findIndex(
                        (element) =>
                            element ===
                            props.column.key.substring(
                                5,
                                props.column.key.length
                            )
                    ) > -1
                ) {
                    switch (typeof props.cellData) {
                        case 'number':
                            if (props.cellData > 0) {
                                return '#F5FAEF';
                            } else {
                                return '#f7cdd6';
                            }
                        case 'string':
                            if (props.cellData && props.cellData.length > 0) {
                                return '#F5FAEF';
                            } else {
                                return '#f7cdd6';
                            }
                        case 'object':
                            if (props.cellData === null) {
                                return '#f7cdd6';
                            } else {
                                return '#F5FAEF';
                            }
                        case 'undefined':
                            return '#f7cdd6';
                    }
                    return '#F5FAEF';
                } else {
                    return '#F5FAEF';
                }
            case 'Cancellation':
                if (
                    props.cellData &&
                    props.column.key === 'data.cancellationInfoLMD' &&
                    props.cellData.length < 12
                ) {
                    return '#f7cdd6';
                }
                if (
                    cancellationMandatoryFields.findIndex(
                        (element) =>
                            element ===
                            props.column.key.substring(
                                5,
                                props.column.key.length
                            )
                    ) > -1
                ) {
                    switch (typeof props.cellData) {
                        case 'number':
                            if (props.cellData > 0) {
                                return '#F5FAEF';
                            } else {
                                return '#f7cdd6';
                            }
                        case 'string':
                            if (props.cellData && props.cellData.length > 0) {
                                return '#F5FAEF';
                            } else {
                                return '#f7cdd6';
                            }
                        case 'object':
                            if (props.cellData === null) {
                                return '#f7cdd6';
                            } else {
                                return '#F5FAEF';
                            }
                        case 'undefined':
                            return '#f7cdd6';
                    }
                    return '#F5FAEF';
                } else {
                    return '#F5FAEF';
                }
            case '':
                return '#F5FAEF';
        }
    }
    function lmdColumnEdit(value: any) {
        if (
            value.statusLMD === undefined ||
            value.statusLMD === null ||
            value.statusLMD === '' ||
            value.statusLMD === 'INCOMPLETE' ||
            value.statusLMD === 'REJECTED'
        ) {
            return false;
        } else {
            return true;
        }
    }

    // console.log('Companies', Companies)

    const headerRendererForTable = useCallback(
        (props: {
            cells: ReactNode[];
            columns: ColumnShape<{
                [k: string]: string;
            }>;
            headerIndex: number;
        }) => {
            const { headerIndex, columns, cells } = props;
            if (headerIndex === 0) {
                return cells.map((cell, index) => {
                    return cloneElement(cell as ReactElement, {
                        className: 'BaseTable__header-cell',
                        children: (
                            <span style={{ fontWeight: 650 }} key={index}>
                                {columns[index].header
                                    ? columns[index].header
                                    : ''}
                            </span>
                        ),
                    });
                });
            }
            return cells;
        },
        []
    );
    // function alterGetDisplsayedColumns() {
    //   var alterDisplayedColumns = []
    //   projectsTableColumns.forEach((cell) => {
    //     if (cell.group === "General Information") {
    //   });
    // }

    // console.log('displayedColumns', displayedColumns);
    // console.log('submission 1', submissions && submissions[0])
    // console.log('submission 1', communicationSubmissions && communicationSubmissions[0]);

    return (
        <div>
            <RejectModal
                submission={rejectedSubmission}
                onClose={() => {
                    setRejectedSubmission(undefined);
                }}
                onReject={(comment: string) => {
                    if (rejectedSubmission !== undefined) {
                        reject(
                            rejectedSubmission!.id!,
                            rejectedSubmission!.viewId!,
                            comment
                        );
                        setRejectedSubmission(undefined);
                    }
                }}
            />
            <RejectModal
                submission={rejectedSubmissionComm}
                onClose={() => {
                    setRejectedSubmissionComm(undefined);
                }}
                onReject={(comment: string) => {
                    if (rejectedSubmissionComm !== undefined) {
                        handleCommunicationCellUpdate(
                            rejectedSubmissionComm.id!,
                            'data.statusLMD',
                            'REJECTED'
                        );
                        var targetChildSubs: any[] = [];
                        targetChildSubs = communicationSubmissions.filter(
                            (s) => s.parentId === rejectedSubmissionComm.id
                        );
                        targetChildSubs.forEach((s) => {
                            handleCommunicationCellUpdate(
                                s.id!,
                                'data.statusLMD',
                                'REJECTED'
                            );
                            handleCommunicationCellUpdate(
                                rejectedSubmissionComm.id!,
                                'data.rejectReasonLMD',
                                comment
                            );
                        });
                        handleCommunicationCellUpdate(
                            rejectedSubmissionComm.id!,
                            'data.rejectReasonLMD',
                            comment
                        );
                        setRejectedSubmissionComm(undefined);
                    }
                }}
            />
            <Text key={'Text2'} mb="8px">
                Financial year
            </Text>
            <Box width={'50%'} display="flex" alignItems="center">
                <Select
                    key={'select1'}
                    styles={{
                        control: (provided) => ({
                            ...provided,
                            width: '200px', // or any specific pixel value you'd prefer
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
                    classNamePrefix="select"
                    name="color"
                    isClearable={false}
                    options={[
                        { label: ' ', value: '' },
                        { label: '2021', value: '21' },
                        ...Year,
                    ]}
                    onChange={(value: any) => {
                        setFinancialYear(value.value);
                    }}
                    value={
                        financialYear === ''
                            ? { label: ' ', value: '' }
                            : {
                                  label: '20' + financialYear,
                                  value: financialYear,
                              }
                    }
                />
                <Button
                    float="right"
                    height="38px"
                    ml="18px"
                    color={'white'}
                    _hover={{
                        bg: useColorModeValue('blue.300', '#377bbf'),
                    }}
                    bg={useColorModeValue('blue.400', '#4D97E2')}
                    onClick={() => {
                        setFinancialYear('');
                    }}
                >
                    Clear
                </Button>
            </Box>

            <Box h="70px" textAlign={'end'}>
                {/* <IconButton
                    icon={<IoSave />}
                    isDisabled={
                        selectedTemplate === 'local'
                        // currentUser.displayName === "unknown"
                    }
                    onClick={() => {
                        var template: Template = {
                            name: selectedTemplate,
                            columns: displayedColumns,
                            filters,
                        };
                        RestAPI.updateTemplate(template).then(() => {
                            toast(
                                <Toast
                                    title={'Preset updated'}
                                    message={
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: 'Preset successfully saved',
                                            }}
                                        />
                                    }
                                    type={'success'}
                                />
                            );
                        });
                    }}
                    aria-label="save"
                    colorScheme="blue"
                    mr="10px"
                /> */}
                <IconButton
                    icon={onlyMine ? <RiAlbumFill /> : <RiAlbumLine />}
                    onClick={() => {
                        setOnlyMine(!onlyMine);
                    }}
                    // isDisabled={currentUser.displayName === "unknown"}
                    aria-label="filter"
                    colorScheme="blue"
                    mr="10px"
                />
                <IconButton
                    icon={expanded ? <RiUserFill /> : <RiGroupFill />}
                    onClick={() => {
                        if (!expanded) {
                            expandAllRows();
                            setExpanded(true);
                        } else {
                            setExpandedRowKeys([]);
                            setExpanded(false);
                        }
                    }}
                    // isDisabled={currentUser.displayName === "unknown"}
                    aria-label="filter"
                    colorScheme="blue"
                    mr="10px"
                />
                <IconButton
                    onClick={async () => {
                        interface FD {
                            [key: string]: any;
                        }
                        var formattedData: FD[] = [];
                        let init = false;
                        let header: FD[] = [
                            {
                                ID: 'Summary',
                                Parent: '',
                                Group: '',
                                Created: '',
                                Title: '',
                                Author: '',
                            },
                            {
                                ID: 'ID',
                                Parent: 'Parent',
                                Group: 'Group',
                                Created: 'Created',
                                Title: 'Title',
                                Author: 'Author',
                            },
                            {
                                ID: '',
                                Parent: '',
                                Group: '',
                                Created: '',
                                Title: '',
                                Author: '',
                            },
                        ];
                        if (tabIndex === 0) {
                            let sortedSubmissions: Submission[] =
                                sortAndStructureData(filteredSubmissions);
                            formattedData = sortedSubmissions.map((s) => {
                                let doc: FD = {
                                    ID: s.id || 'unknown',
                                    Parent: s.parentId === null,
                                    Group: s.group,
                                    Created: s.created,
                                    Title: s.title,
                                    Author: s.author,
                                };

                                DisplayedColumnsList.forEach((group: any) => {
                                    if (
                                        group.value === 'CMCT' ||
                                        group.value === 'LMD' ||
                                        group.value === 'all' ||
                                        group.value === 'none'
                                    ) {
                                        return;
                                    }

                                    group.children.map(
                                        (column: any, index: number) => {
                                            if (
                                                displayedColumns.includes(
                                                    column.value
                                                ) ||
                                                displayedColumns.includes(
                                                    group.value
                                                )
                                            ) {
                                                doc[column.value] = _.get(
                                                    s,
                                                    column.value
                                                );
                                                if (column.type === 'date') {
                                                    doc[column.value] =
                                                        formatDate(
                                                            doc[column.value]
                                                        );
                                                }

                                                if (column.type === 'number') {
                                                    doc[column.value] =
                                                        NumberWithCommas(
                                                            doc[column.value]
                                                        );
                                                }
                                                if (!init) {
                                                    header[0][column.value] =
                                                        index === 0
                                                            ? group.label
                                                            : '';
                                                    header[1][
                                                        column.value
                                                    ] = `${column.label}`;
                                                }
                                            }
                                        }
                                    );
                                });
                                init = true;
                                return doc;
                            });
                            // Initialize header[2] as an empty object
                            // header[2] = {};
                            if (displayedColumns.includes('projectResults')) {
                                header[2] = {
                                    ...header[2],
                                    'data.totalIncomeLC': totalIncomeInTool,
                                    'data.totalCostsLC': totalCostsInTool,
                                    'data.totalProfitLC': totalProfitInToolLC,
                                    'data.totalLossLC': totalLossInToolLC * -1,
                                    'data.totalIncomeEUR': totalIncomeInToolEUR,
                                    'data.totalCostsEUR': totalCostsInToolEUR,
                                    'data.totalProfitEUR': totalProfitInToolEUR,
                                    'data.totalLossEUR':
                                        totalLossInToolEUR * -1,
                                };
                            }
                            if (displayedColumns.includes('controlChecks')) {
                                header[2] = {
                                    ...header[2],
                                    'data.totalCostsTool':
                                        totalCostAmountLC +
                                        totalCostAmountLCCostGL,
                                    'data.totalCostsSAP':
                                        totalCostAmountLC +
                                        totalCostAmountLCCostGL,
                                    'data.totalIncomeTool':
                                        totalIncomeAmountLC +
                                        totalIncomeAmountLCIncomeGL,
                                    'data.totalIncomeSAP':
                                        totalIncomeAmountLC +
                                        totalIncomeAmountLCIncomeGL,
                                };
                            }
                            if (displayedColumns.includes('incomeGlPostings')) {
                                header[2] = {
                                    ...header[2],
                                    'data.incomeAmountLCIncomeGL':
                                        totalIncomeAmountLCIncomeGL,
                                    'data.incomeAmountEurIncomeGL':
                                        totalIncomeAmountIncomeGL,
                                };
                            }
                            if (displayedColumns.includes('costGlPostings')) {
                                header[2] = {
                                    ...header[2],
                                    'data.costAmountLCCostGL':
                                        totalCostAmountLCCostGL,
                                    'data.costAmountEURCostGL':
                                        totalCostAmountCostGL,
                                };
                            }
                            if (displayedColumns.includes('salesInvoices')) {
                                header[2] = {
                                    ...header[2],
                                    'data.incomeAmountLCSI':
                                        totalIncomeAmountLC,
                                    'data.incomeAmountEURSI': totalIncomeAmount,
                                };
                            }
                            if (displayedColumns.includes('costInvoices')) {
                                header[2] = {
                                    ...header[2],
                                    'data.costAmountLC': totalCostAmountLC,
                                    'data.costAmountEUR': totalCostAmount,
                                };
                            }
                            formattedData.unshift(...header);
                            const ws = XLSX.utils.json_to_sheet(formattedData, {
                                skipHeader: true,
                            });
                            const columnsToFormat: string[] = [];
                            const columnNames: Set<string> = new Set([
                                '% Country Share',
                                'Country Budget Contribution (CC)',
                                'Country Cost Estimation (CC)',
                                'Vendor Amount',
                                'Estimated Income (CC)',
                                'Estimated Costs (CC)',
                                'Estimated Result (CC)',
                                'Estimated Income (EUR)',
                                'Estimated Costs (EUR)',
                                'Estimated Result (EUR)',
                                '% Vendor Share',
                                'Net Value of Service Ordered (LC)',
                                'Net Value (Purchase Order Currency)',
                                'Net Value (EUR)',
                                'Cost Amount (LC)',
                                'Cost Amount (DC)',
                                'Cost Amount (EUR)',
                                'Income Amount (LC)',
                                'Income Amount (DC)',
                                'Income Amount (EUR)',
                                'Cost Amount (LC)',
                                'Cost Amount (DC)',
                                'Cost Amount (EUR)',
                                'Income Amount (LC)',
                                'Income Amount (DC)',
                                'Income Amount (EUR)',
                                'Total Income (LC)',
                                'Total Costs (LC)',
                                'Total Profit (LC)',
                                'Total Loss (LC)',
                                'Total Income (EUR)',
                                'Total Costs (EUR)',
                                'Total Profit (EUR)',
                                'Total Loss (EUR)',
                                'Total Costs In Tool (LC)',
                                'Total Costs in SAP (LC)',
                                'Total Income in Tool (LC)',
                                'Total Income in SAP (LC)',
                            ]);
                            //tmp
                            // Find the correct column
                            let targetColumn = '';

                            const secondRowNumber = 2; // Since the row index starts at 1 in xlsx

                            // Get the range of the second row
                            // Check if '!ref' is defined and is a string
                            if (typeof ws['!ref'] === 'string') {
                                // Get the range of the second row
                                const range = XLSX.utils.decode_range(
                                    ws['!ref']
                                );
                                const secondRowStart = XLSX.utils.encode_cell({
                                    c: range.s.c,
                                    r: secondRowNumber - 1,
                                });
                                const secondRowEnd = XLSX.utils.encode_cell({
                                    c: range.e.c,
                                    r: secondRowNumber - 1,
                                });

                                // Iterate over all cells in the second row
                                for (let C = range.s.c; C <= range.e.c; ++C) {
                                    const cellAddress = XLSX.utils.encode_cell({
                                        c: C,
                                        r: secondRowNumber - 1,
                                    });
                                    const cell = ws[cellAddress];

                                    // Check if the cell exists and its value is in the set of column names
                                    if (cell && columnNames.has(cell.v)) {
                                        // If the value is one of the column names, store the column letter
                                        columnsToFormat.push(
                                            XLSX.utils.encode_col(C)
                                        );
                                    }
                                }
                            } else {
                                console.error(
                                    'The worksheet does not have a reference range.'
                                );
                            }
                            //tmp
                            for (
                                let i = 4;
                                i <= formattedData.length + 1;
                                i++
                            ) {
                                columnsToFormat.forEach((column) => {
                                    let cellAddress = column + i;
                                    if (ws[cellAddress]) {
                                        if (!isNaN(ws[cellAddress].v)) {
                                            ws[cellAddress].z = '0.00'; // Number format
                                            ws[cellAddress].t = 'n'; // Cell type as number
                                        }
                                        if (ws[cellAddress].v !== undefined) {
                                            if (
                                                ws[cellAddress].v
                                                    .toString()
                                                    .includes(',')
                                            ) {
                                                ws[cellAddress].v = ws[
                                                    cellAddress
                                                ].v
                                                    .toString()
                                                    .replace(',', '');
                                            }
                                            ws[cellAddress].v = Number.isNaN(
                                                parseFloat(ws[cellAddress].v)
                                            )
                                                ? ws[cellAddress].v
                                                : parseFloat(ws[cellAddress].v);
                                            ws[cellAddress].z = '0.00'; // Number format
                                            ws[cellAddress].t = 'n'; // Cell type as number
                                            // console.log(parseFloat(ws[cellAddress].v));
                                        }
                                    }
                                });
                            }

                            ws['!cols'] = Object.keys(formattedData[0]).map(
                                () => {
                                    return { wch: 30 };
                                }
                            );
                            const thirdRow = 3; // Since the row index starts at 1 in xlsx
                            const cols = Object.keys(formattedData[0]); // Get all column keys from your data
                            // Define the bold style
                            const boldStyle = {
                                font: {
                                    name: 'arial',
                                    bold: true,
                                },
                            };
                            // Apply the bold style to each cell in the third row
                            cols.forEach((colKey, index) => {
                                const cellRef = XLSX.utils.encode_cell({
                                    r: thirdRow - 1,
                                    c: index,
                                }); // Encode cell ref for third row
                                ws[cellRef] = ws[cellRef] || { t: 's', v: '' }; // If cell doesn't exist, create a stub cell
                                // ws[cellRef].s = boldStyle; // Apply the bold style
                                ws[cellRef].s = {
                                    ...ws[cellRef].s,
                                    font: { bold: true },
                                };
                            });
                            // Update the worksheet reference to include any new cells
                            ws['!ref'] = XLSX.utils.encode_range({
                                s: { c: 0, r: 0 }, // Start at the first cell
                                e: {
                                    c: cols.length - 1,
                                    r: formattedData.length + 1,
                                }, // End at the last cell (plus header)
                            });
                            const wb = {
                                Sheets: { data: ws },
                                SheetNames: ['data'],
                            };
                            const excelBuffer = XLSX.write(wb, {
                                bookType: 'xlsx',
                                type: 'array',
                                cellStyles: true,
                            });
                            const data = new Blob([excelBuffer], {
                                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
                            });
                            FileSaver.saveAs(data, 'Projects' + '.xlsx');
                        } else if (tabIndex === 1) {
                            formattedData =
                                filteredCommunicationSubmissions.map((s) => {
                                    let doc: FD = {
                                        ID: s.id || 'unknown',
                                        Parent: s.parentId === null,
                                        Group: s.group,
                                        Created:
                                            s.created &&
                                            moment(new Date(s.created)).format(
                                                'DD.MM.YYYY'
                                            ),
                                        Title: s.title,
                                        Author: s.author,
                                    };
                                    DisplayedColumnsList.forEach(
                                        (group: any) => {
                                            if (
                                                group.value === 'CMCT' ||
                                                group.value === 'LMD'
                                            ) {
                                                group.children.map(
                                                    (
                                                        column: any,
                                                        index: number
                                                    ) => {
                                                        if (
                                                            displayedColumns.includes(
                                                                column.value
                                                            ) ||
                                                            displayedColumns.includes(
                                                                group.value
                                                            )
                                                        ) {
                                                            doc[column.value] =
                                                                _.get(
                                                                    s,
                                                                    column.value
                                                                );
                                                            if (
                                                                column.type ===
                                                                'number'
                                                            ) {
                                                                doc[
                                                                    column.value
                                                                ] =
                                                                    NumberWithCommas(
                                                                        doc[
                                                                            column
                                                                                .value
                                                                        ]
                                                                    );
                                                            }
                                                            if (
                                                                column.type ===
                                                                'date'
                                                            ) {
                                                                doc[
                                                                    column.value
                                                                ] = formatDate(
                                                                    doc[
                                                                        column
                                                                            .value
                                                                    ]
                                                                );
                                                            }
                                                            if (!init) {
                                                                header[0][
                                                                    column.value
                                                                ] =
                                                                    index === 0
                                                                        ? group.label
                                                                        : '';
                                                                header[1][
                                                                    column.value
                                                                ] = `${column.label}`;
                                                            }
                                                        }
                                                    }
                                                );
                                            } else {
                                                return;
                                            }
                                        }
                                    );
                                    init = true;
                                    return doc;
                                });
                            formattedData.unshift(...header);
                            const ws = XLSX.utils.json_to_sheet(formattedData, {
                                skipHeader: true,
                            });
                            const columnsToFormat = ['AA']; // Add more columns as needed
                            for (
                                let i = 3;
                                i <= formattedData.length + 1;
                                i++
                            ) {
                                columnsToFormat.forEach((column) => {
                                    let cellAddress = column + i;
                                    if (ws[cellAddress]) {
                                        ws[cellAddress].z = '0.00'; // Number format
                                        ws[cellAddress].t = 'n'; // Cell type as number
                                    }
                                });
                            }
                            ws['!cols'] = Object.keys(formattedData[0]).map(
                                () => {
                                    return { wch: 30 };
                                }
                            );

                            // Ensure the cells in the third row exist and apply the bold style
                            const thirdRow = 5; // Since the row index starts at 1 in xlsx
                            const cols = Object.keys(formattedData[0]); // Get all column keys from your data
                            // Define the bold style
                            const boldStyle = { font: { bold: true } };

                            // Apply the bold style to each cell in the third row
                            cols.forEach((colKey, index) => {
                                const cellRef = XLSX.utils.encode_cell({
                                    r: thirdRow - 1,
                                    c: index,
                                }); // Encode cell ref for third row
                                ws[cellRef] = ws[cellRef] || { t: 's', v: '' }; // If cell doesn't exist, create a stub cell
                                ws[cellRef].s = boldStyle; // Apply the bold style
                            });

                            // Update the worksheet reference to include any new cells
                            ws['!ref'] = XLSX.utils.encode_range({
                                s: { c: 0, r: 0 }, // Start at the first cell
                                e: {
                                    c: cols.length - 1,
                                    r: formattedData.length + 1,
                                }, // End at the last cell (plus header)
                            });

                            // Continue with the rest of your code to save the file
                            const wb = {
                                Sheets: { data: ws },
                                SheetNames: ['data'],
                            };
                            const excelBuffer = XLSX.write(wb, {
                                bookType: 'xlsx',
                                type: 'array',
                                cellStyles: true,
                            });
                            const data = new Blob([excelBuffer], {
                                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
                            });
                            FileSaver.saveAs(data, 'Invoicing' + '.xlsx');
                        }
                    }}
                    colorScheme="teal"
                    aria-label="export"
                    icon={<RiFileExcel2Line />}
                ></IconButton>
            </Box>

            <Box
                w={'100%'}
                bg={useColorModeValue('white', '#5b5b5b')}
                minH={'80vh'}
                mb={5}
                mt={'-20px'}
                border="1px"
                rounded="md"
                borderColor="gray.100"
            >
                <Tabs
                    isLazy={false}
                    onChange={handleTabsChange}
                    index={tabIndex}
                    variant="enclosed"
                >
                    <TabList>
                        <Tab>Projects</Tab>
                        <Tab>Invoicing</Tab>
                    </TabList>
                    <TabPanels>
                        {/* Projects Table */}
                        <TabPanel w="100%" h="80vh">
                            <AutoResizer
                                onResize={({
                                    width,
                                    height,
                                }: {
                                    width: number;
                                    height: number;
                                }) => {
                                    setTableWidth(width);
                                }}
                            >
                                {({ width, height }) => (
                                    <BaseTable
                                        key={ignored}
                                        scrollLeft={scrollLeft}
                                        onScroll={onScroll}
                                        onColumnResizeEnd={({
                                            column,
                                            width,
                                        }: {
                                            column: any;
                                            width: number;
                                        }) => {
                                            // handleResize(column.dataKey, width);
                                        }}
                                        rowRenderer={rowRenderer}
                                        overscanRowCount={10}
                                        expandedRowKeys={expandedRowKeys}
                                        onRowExpand={handleRowClick}
                                        ignoreFunctionInColumnCompare={false}
                                        expandColumnKey={'__expand'}
                                        width={width}
                                        height={height}
                                        fixed
                                        columns={projectsTableColumns}
                                        headerRenderer={headerRendererForTable}
                                        headerClassName="header-cells"
                                        frozenData={
                                            [
                                                {
                                                    id: 'total',
                                                    data: {},
                                                    parentId: null,
                                                },
                                            ] as any[]
                                        }
                                        data={unflatten([
                                            ...filteredSubmissions,
                                        ] as any[])}
                                        rowKey="id"
                                        headerHeight={[50, 50]}
                                        rowHeight={55}
                                    ></BaseTable>
                                )}
                            </AutoResizer>
                        </TabPanel>
                        {/* Invoicing Table */}

                        <TabPanel w="100%" h="80vh">
                            <AutoResizer
                                onResize={({
                                    width,
                                    height,
                                }: {
                                    width: number;
                                    height: number;
                                }) => {
                                    setTableWidth(width);
                                }}
                            >
                                {({ width, height }) => (
                                    <BaseTable
                                        scrollLeft={scrollLeft}
                                        onScroll={onScroll}
                                        onColumnResizeEnd={({
                                            column,
                                            width,
                                        }: {
                                            column: any;
                                            width: number;
                                        }) => {
                                            // handleResize(column.dataKey, width);
                                        }}
                                        rowRenderer={rowRenderer}
                                        overscanRowCount={10}
                                        ignoreFunctionInColumnCompare={false}
                                        expandColumnKey={'__expand'}
                                        width={width}
                                        height={height}
                                        fixed
                                        columns={[
                                            {
                                                key: '__expand',
                                                dataKey: '__expand',
                                                title: '',
                                                width: 50,
                                                frozen: Column.FrozenDirection
                                                    .LEFT,
                                                resizable: false,
                                                cellRenderer: (props: any) => {
                                                    if (
                                                        props.rowData
                                                            .parentId !== null
                                                    ) {
                                                        return (
                                                            <div
                                                                style={{
                                                                    marginTop: 0,
                                                                    marginLeft: 0,
                                                                    position:
                                                                        'absolute',
                                                                }}
                                                            >
                                                                <RiUserFill />
                                                            </div>
                                                        );
                                                    }

                                                    return <div></div>;
                                                },
                                                className: 'expand',
                                            },
                                            {
                                                key: '__actions.rejectComm',
                                                dataKey: '__actions.rejectComm',
                                                title: 'Reject',
                                                group: 'Input of Central Marketing Controlling Team',
                                                header: 'Input of Central Marketing Controlling Team',
                                                width: columnWidth(
                                                    '__actions.rejectComm',
                                                    200
                                                ),
                                                resizable: true,
                                                className: 'red-border',
                                                cellRenderer: (props: any) =>
                                                    props.rowData.parentId ===
                                                        null &&
                                                    props.rowData.data
                                                        .statusLMD ===
                                                        'OK FOR INVOICING' ? (
                                                        <EditableTableCell
                                                            type={'button'}
                                                            textColor={'red'}
                                                            backgroundColor="#fef9fa"
                                                            invoiced={(() => {
                                                                const isInvoiced =
                                                                    !(
                                                                        props
                                                                            .rowData
                                                                            .data
                                                                            .statusLMD ===
                                                                            'OK FOR INVOICING' &&
                                                                        (userRoles.includes(
                                                                            'Accounting'
                                                                        ) ||
                                                                            userRoles.includes(
                                                                                'Administrator'
                                                                            ))
                                                                    );
                                                                return isInvoiced;
                                                            })()}
                                                            onUpdate={(
                                                                submissionId: string
                                                            ) => {
                                                                setRejectedSubmissionComm(
                                                                    props.rowData
                                                                );
                                                            }}
                                                            rowIndex={
                                                                props.rowIndex
                                                            }
                                                            columnKey={
                                                                props.column
                                                                    .dataKey
                                                            }
                                                            rowData={
                                                                props.rowData
                                                            }
                                                            initialValue={
                                                                'reject'
                                                            }
                                                        />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                backgroundColor:
                                                                    '#F7FAFC',
                                                                width: '100%',
                                                                height: '100%',
                                                            }}
                                                        />
                                                    ),
                                            },
                                            {
                                                key: 'data.selfInvoiceNumber',
                                                dataKey:
                                                    'data.selfInvoiceNumber',
                                                title: 'Self-Invoice number',
                                                width: columnWidth(
                                                    'data.selfInvoiceNumber',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'CMCT',
                                                    'data.selfInvoiceNumber'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'text'}
                                                        readonly={
                                                            !(
                                                                (userRoles.includes(
                                                                    'Accounting'
                                                                ) ||
                                                                    userRoles.includes(
                                                                        'Administrator'
                                                                    )) &&
                                                                props.rowData
                                                                    .data
                                                                    .invoiceTypeLMD ===
                                                                    'Internal Invoice'
                                                            )
                                                        }
                                                        invoiced={
                                                            props.rowData.data
                                                                .statusLMD ===
                                                            'INVOICED'
                                                        }
                                                        onUpdate={(
                                                            submission: string,
                                                            path: string,
                                                            value: any
                                                        ) => {
                                                            handleCommunicationCellUpdate(
                                                                submission,
                                                                'data.selfInvoiceNumber',
                                                                value
                                                            );
                                                        }}
                                                        backgroundColor={cellColor(
                                                            props
                                                        )}
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.documentNumberCMCT',
                                                dataKey:
                                                    'data.documentNumberCMCT',
                                                title: 'SAP Document Number',
                                                width: columnWidth(
                                                    'data.documentNumberCMCT',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'CMCT',
                                                    'data.documentNumberCMCT'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'text'}
                                                        readonly={isReadonlyCell(
                                                            'data.documentNumberCMCT',
                                                            userRoles,
                                                            props
                                                        )}
                                                        invoiced={
                                                            props.rowData.data
                                                                .statusLMD ===
                                                            'INVOICED'
                                                        }
                                                        onUpdate={(
                                                            submission: string,
                                                            path: string,
                                                            value: any
                                                        ) => {
                                                            if (
                                                                value.length !==
                                                                12
                                                            ) {
                                                                toast(
                                                                    <Toast
                                                                        title={
                                                                            'SAP document number must contain 12 digits'
                                                                        }
                                                                        message={
                                                                            'Please enter correct SAP document number'
                                                                        }
                                                                        type={
                                                                            'error'
                                                                        }
                                                                    />
                                                                );
                                                            }
                                                            handleCommunicationCellUpdate(
                                                                submission,
                                                                'data.operatorCMCT',
                                                                currentUser.displayName
                                                            );
                                                            handleCommunicationCellUpdate(
                                                                submission,
                                                                'data.dateCMCT',
                                                                new Date().toString()
                                                            );
                                                            var targetChildSubs =
                                                                communicationSubmissions.filter(
                                                                    (s) =>
                                                                        s.parentId ===
                                                                        props
                                                                            .rowData
                                                                            .id
                                                                );
                                                            if (
                                                                value.length ===
                                                                12
                                                            ) {
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.statusLMD',
                                                                    'INVOICED'
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.rejectReasonLMD',
                                                                    ''
                                                                );
                                                                var targetSubmission =
                                                                    communicationSubmissions.find(
                                                                        (s) =>
                                                                            s.id ===
                                                                            submission
                                                                    );
                                                                targetChildSubs.forEach(
                                                                    (
                                                                        s: any
                                                                    ) => {
                                                                        handleCommunicationCellUpdate(
                                                                            s !==
                                                                                undefined
                                                                                ? s.id
                                                                                : '',
                                                                            'data.documentNumberCMCT',
                                                                            value
                                                                        );
                                                                        handleCommunicationCellUpdate(
                                                                            s !==
                                                                                undefined
                                                                                ? s.id
                                                                                : '',
                                                                            'data.statusLMD',
                                                                            'INVOICED'
                                                                        );
                                                                        handleCommunicationCellUpdate(
                                                                            s !==
                                                                                undefined
                                                                                ? s.id
                                                                                : '',
                                                                            'data.operatorCMCT',
                                                                            targetSubmission !==
                                                                                undefined
                                                                                ? targetSubmission
                                                                                      .data
                                                                                      .operatorCMCT
                                                                                : ''
                                                                        );
                                                                        handleCommunicationCellUpdate(
                                                                            s !==
                                                                                undefined
                                                                                ? s.id
                                                                                : '',
                                                                            'data.dateCMCT',
                                                                            targetSubmission !==
                                                                                undefined
                                                                                ? targetSubmission
                                                                                      .data
                                                                                      .dateCMCT
                                                                                : ''
                                                                        );
                                                                    }
                                                                );
                                                            }

                                                            var mi =
                                                                submissions.findIndex(
                                                                    (s) =>
                                                                        s.data
                                                                            .documentNumberSI ===
                                                                        value
                                                                );
                                                            if (mi > -1) {
                                                                handleCellUpdate(
                                                                    submissions[
                                                                        mi
                                                                    ].id!,
                                                                    'data.activityIdSI',
                                                                    props
                                                                        .rowData
                                                                        .data
                                                                        .activityIdForPortalVendors
                                                                );
                                                                handleCellUpdate(
                                                                    submissions[
                                                                        mi
                                                                    ].id!,
                                                                    'data.additionalMarketingInformation',
                                                                    props
                                                                        .rowData
                                                                        .data
                                                                        .additionalInformationLMD
                                                                );
                                                            }
                                                            handleCommunicationCellUpdate(
                                                                submission,
                                                                path,
                                                                value
                                                            );
                                                        }}
                                                        backgroundColor={
                                                            props.cellData &&
                                                            props.cellData
                                                                .length !==
                                                                12 &&
                                                            props.rowData.data
                                                                .statusLMD ===
                                                                'OK FOR INVOICING'
                                                                ? '#f7cdd6'
                                                                : '#f9f9ff'
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.dateCMCT',
                                                dataKey: 'data.dateCMCT',
                                                title: 'Date',
                                                width: columnWidth(
                                                    'data.dateCMCT',
                                                    200
                                                ),
                                                resizable: true,
                                                group: 'Input of Central Marketing Controlling Team',
                                                hidden: visibilityController(
                                                    'CMCT',
                                                    'data.dateCMCT'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'date'}
                                                        readonly={true}
                                                        backgroundColor="#f9f9ff"
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.operatorCMCT',
                                                dataKey: 'data.operatorCMCT',
                                                title: 'Operator',
                                                width: columnWidth(
                                                    'data.operatorCMCT',
                                                    200
                                                ),
                                                resizable: true,
                                                group: 'Input of Central Marketing Controlling Team',
                                                hidden: visibilityController(
                                                    'CMCT',
                                                    'data.operatorCMCT'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'text'}
                                                        readonly={true}
                                                        backgroundColor="#f9f9ff"
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },

                                            {
                                                key: 'data.rejectReasonLMD',
                                                dataKey: 'data.rejectReasonLMD',
                                                title: 'Rejection reason',
                                                width: columnWidth(
                                                    'data.rejectReasonLMD',
                                                    200
                                                ),
                                                group: 'Input of Central Marketing Controlling Team',
                                                resizable: true,

                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.rejectReasonLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'text'}
                                                        readonly={true}
                                                        backgroundColor="#f9f9ff"
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={
                                                            props.rowData !==
                                                            undefined
                                                                ? props.rowData
                                                                : ''
                                                        }
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.statusLMD',
                                                dataKey: 'data.statusLMD',
                                                title: 'Status',
                                                width: columnWidth(
                                                    'data.statusLMD',
                                                    250
                                                ),
                                                resizable: true,
                                                group: 'Input of Local Marketing Department',
                                                header: 'Input of Local Marketing Department',
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.statusLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'dropdown'}
                                                        readonly={true}
                                                        loadOptions={
                                                            loadOptions
                                                        }
                                                        backgroundColor={
                                                            props.rowData.data
                                                                .statusLMD ===
                                                                'INCOMPLETE' ||
                                                            props.rowData.data
                                                                .statusLMD ===
                                                                'REJECTED'
                                                                ? '#f7cdd6'
                                                                : '#F5FAEF'
                                                        }
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.invoicingDateLMD',
                                                dataKey:
                                                    'data.invoicingDateLMD',
                                                title: 'Date of document',
                                                width: columnWidth(
                                                    'data.invoicingDateLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                group: 'Input of Local Marketing Department',
                                                type: 'date',
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.invoicingDateLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'date'}
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        readonly={
                                                            props.rowData
                                                                .parentId !==
                                                                null ||
                                                            cellReadonly(props)
                                                        }
                                                        backgroundColor={mandatoryFieldValidation(
                                                            props
                                                        )}
                                                        onUpdate={(
                                                            submission: string,
                                                            path: string,
                                                            value: any
                                                        ) => {
                                                            handleCommunicationCellUpdate(
                                                                submission,
                                                                'data.requestorLMD',
                                                                currentUser.displayName
                                                            );
                                                            let updatedDateValue =
                                                                value;
                                                            if (
                                                                value instanceof
                                                                Date
                                                            ) {
                                                                updatedDateValue =
                                                                    addHoursToDate(
                                                                        value,
                                                                        12
                                                                    );
                                                            } else if (
                                                                typeof value ===
                                                                'string'
                                                            ) {
                                                                // Create a Date object if `value` is a string, and then add 12 hours
                                                                const dateObj =
                                                                    new Date(
                                                                        value
                                                                    );
                                                                if (
                                                                    !isNaN(
                                                                        dateObj.getTime()
                                                                    )
                                                                ) {
                                                                    // Check if date is valid
                                                                    updatedDateValue =
                                                                        addHoursToDate(
                                                                            dateObj,
                                                                            12
                                                                        );
                                                                }
                                                            }
                                                            handleCommunicationCellUpdate(
                                                                submission,
                                                                path,
                                                                updatedDateValue
                                                            );
                                                        }}
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.requestorLMD',
                                                dataKey: 'data.requestorLMD',
                                                title: 'Requestor',
                                                group: 'Input of Local Marketing Department',

                                                width: columnWidth(
                                                    'data.requestorLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.requestorLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'text'}
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        backgroundColor="#F5FAEF"
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.invoiceTypeLMD',
                                                dataKey: 'data.invoiceTypeLMD',
                                                title: 'Type of document',
                                                group: 'Input of Local Marketing Department',

                                                width: columnWidth(
                                                    'data.invoiceTypeLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.invoiceTypeLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'dropdown'}
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        loadOptions={() => {
                                                            return [
                                                                {
                                                                    label: 'Invoice',
                                                                    value: 'Invoice',
                                                                },
                                                                // {
                                                                //     label: 'Pre-Invoice',
                                                                //     value: 'Pre-Invoice',
                                                                // },
                                                                {
                                                                    label: 'Internal Invoice',
                                                                    value: 'Internal Invoice',
                                                                },
                                                                {
                                                                    label: 'Cancellation',
                                                                    value: 'Cancellation',
                                                                },
                                                            ];
                                                        }}
                                                        backgroundColor={cellColor(
                                                            props
                                                        )}
                                                        onUpdate={(
                                                            submission: string,
                                                            path: string,
                                                            value: any
                                                        ) => {
                                                            handleCommunicationCellUpdate(
                                                                submission,
                                                                path,
                                                                value
                                                            );

                                                            handleCommunicationCellUpdate(
                                                                submission,
                                                                'data.sendToLMD',
                                                                ''
                                                            );

                                                            if (
                                                                value ===
                                                                'Invoice'
                                                            ) {
                                                                const {
                                                                    equal: countryPrefixEqual,
                                                                    country,
                                                                    code: companyCode,
                                                                } = checkCountryPrefixEqual(
                                                                    props
                                                                        .rowData
                                                                        .data
                                                                        .alsoMarketingProjectNumberLMD
                                                                );
                                                                if (
                                                                    !countryPrefixEqual
                                                                ) {
                                                                    //Logic for case when country letters and prefix are different
                                                                    handleCommunicationCellUpdate(
                                                                        submission,
                                                                        'data.vendorLMD',
                                                                        ''
                                                                    );
                                                                    handleCommunicationCellUpdate(
                                                                        submission,
                                                                        'data.buLMD',
                                                                        ''
                                                                    );

                                                                    if (
                                                                        country ===
                                                                            'IS' ||
                                                                        country ===
                                                                            'DE'
                                                                    ) {
                                                                        handleCommunicationCellUpdate(
                                                                            submission,
                                                                            'data.vodLMD',
                                                                            '91010001'
                                                                        );
                                                                    } else {
                                                                        handleCommunicationCellUpdate(
                                                                            submission,
                                                                            'data.vodLMD',
                                                                            `9${companyCode}001`
                                                                        );
                                                                    }

                                                                    return;
                                                                }

                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.materialNumberLMD',
                                                                    '7000100'
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.reasonLMD',
                                                                    '40'
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.reasonCodeLMD',
                                                                    'ZWKZ'
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.cancellationInfoLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.additionalInformationLMD',
                                                                    ''
                                                                );
                                                                if (
                                                                    props
                                                                        .rowData
                                                                        .data
                                                                        .paymentMethodLMD ===
                                                                    'Intercompany'
                                                                ) {
                                                                    handleCommunicationCellUpdate(
                                                                        submission,
                                                                        'data.paymentMethodLMD',
                                                                        ''
                                                                    );
                                                                }
                                                            }

                                                            if (
                                                                value ===
                                                                'Internal Invoice'
                                                            ) {
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.materialNumberLMD',
                                                                    '7000100'
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.reasonCodeLMD',
                                                                    'ZWKZ'
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.reasonLMD',
                                                                    '40'
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.cancellationInfoLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.additionalInformationLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.vodLMD',
                                                                    ''
                                                                );
                                                            }
                                                            if (
                                                                value ===
                                                                'Cancellation'
                                                            ) {
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.materialNumberLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.alsoMarketingProjectNumberLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.vendorLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.amountLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.documentCurrencyLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.referenceNumberFromVendor',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.activityIdForPortalVendors',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.additionalInformationLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.dateOfServiceRenderedLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.linkToProofsLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.sendToLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.dunningStopLMD',
                                                                    ''
                                                                );

                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.paymentMethodLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.vodLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.buLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.invoiceTextLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.reasonCodeLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.reasonLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.alsoMarketingProjectNumberLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.paymentMethodLMD',
                                                                    ''
                                                                );
                                                            }
                                                            if (
                                                                props.rowData
                                                                    .parentId ===
                                                                null
                                                            ) {
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.statusLMD',
                                                                    'INCOMPLETE'
                                                                );
                                                            }
                                                        }}
                                                        // onUpdate={handleCommunicationCellUpdate}
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.cancellationInfoLMD',
                                                dataKey:
                                                    'data.cancellationInfoLMD',
                                                title: 'Document number to be cancelled',
                                                group: 'Input of Local Marketing Department',

                                                width: columnWidth(
                                                    'data.cancellationInfoLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.cancellationInfoLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        invoiced={lmdColumnEdit(
                                                            props.rowData.data
                                                        )}
                                                        type={'text'}
                                                        readonly={
                                                            cellReadonly(
                                                                props
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        backgroundColor={cellColor(
                                                            props
                                                        )}
                                                        onUpdate={(
                                                            submission: string,
                                                            path: string,
                                                            value: any
                                                        ) => {
                                                            if (
                                                                value.length !==
                                                                12
                                                            ) {
                                                                toast(
                                                                    <Toast
                                                                        title={
                                                                            'SAP document number must contain 12 digits'
                                                                        }
                                                                        message={
                                                                            'Please enter correct SAP document number'
                                                                        }
                                                                        type={
                                                                            'error'
                                                                        }
                                                                    />
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    path,
                                                                    value
                                                                );
                                                            } else {
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    path,
                                                                    value
                                                                );
                                                            }
                                                        }}
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.alsoMarketingProjectNumberLMD',
                                                dataKey:
                                                    'data.alsoMarketingProjectNumberLMD',
                                                group: 'Input of Local Marketing Department',

                                                title: 'ALSO Marketing Project Number',
                                                width: columnWidth(
                                                    'data.alsoMarketingProjectNumberLMD',
                                                    250
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.alsoMarketingProjectNumberLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'text'}
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        maxLength={12}
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        backgroundColor={cellColor(
                                                            props
                                                        )}
                                                        onUpdate={(
                                                            submission: string,
                                                            path: string,
                                                            value: any
                                                        ) => {
                                                            alsoProjectNumberUpdate(
                                                                submission,
                                                                path,
                                                                value,
                                                                handleCommunicationCellUpdate,
                                                                findSubmissionsByPO,
                                                                props,
                                                                checkCountryPrefixEqual,
                                                                communicationSubmissions
                                                            );
                                                        }}
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.vendorLMD',
                                                dataKey: 'data.vendorLMD',
                                                title: 'Vendor',
                                                width: columnWidth(
                                                    'data.vendorLMD',
                                                    250
                                                ),
                                                group: 'Input of Local Marketing Department',
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.vendorLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'dropdown'}
                                                        readonly={
                                                            cellReadonly(
                                                                props
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        invoiced={lmdColumnEdit(
                                                            props.rowData.data
                                                        )}
                                                        loadOptions={() => {
                                                            if (
                                                                props.rowData
                                                                    .data
                                                                    .alsoMarketingProjectNumberLMD !==
                                                                undefined
                                                            ) {
                                                                var vs =
                                                                    findSubmissionsByPO(
                                                                        props
                                                                            .rowData
                                                                            .data
                                                                            .alsoMarketingProjectNumberLMD
                                                                    );
                                                                submissionData =
                                                                    vs;
                                                                if (
                                                                    vs.length >
                                                                    0
                                                                ) {
                                                                    var v: any[] =
                                                                        [];
                                                                    vs.forEach(
                                                                        (s) => {
                                                                            if (
                                                                                s
                                                                                    .data
                                                                                    .vendorName !==
                                                                                    undefined &&
                                                                                !v.find(
                                                                                    (
                                                                                        c: any
                                                                                    ) =>
                                                                                        c.label ===
                                                                                        s
                                                                                            .data
                                                                                            .vendorName
                                                                                )
                                                                            ) {
                                                                                v.push(
                                                                                    {
                                                                                        label: s
                                                                                            .data
                                                                                            .vendorName,
                                                                                        value: s
                                                                                            .data
                                                                                            .vendorName,
                                                                                    }
                                                                                );
                                                                            }
                                                                        }
                                                                    );
                                                                    if (
                                                                        v.length >
                                                                        0
                                                                    ) {
                                                                        return v;
                                                                    }
                                                                }
                                                            }

                                                            return VendorsNames;
                                                        }}
                                                        backgroundColor={mandatoryFieldValidation(
                                                            props
                                                        )}
                                                        onUpdate={(
                                                            submission: string,
                                                            path: string,
                                                            value: any
                                                        ) => {
                                                            handleCommunicationCellUpdate(
                                                                submission,
                                                                path,
                                                                value
                                                            );
                                                            var tmpValue = '';
                                                            var tmpBU = '';

                                                            if (
                                                                value
                                                                    .toString()
                                                                    .includes(
                                                                        'BU'
                                                                    )
                                                            ) {
                                                                tmpValue = value
                                                                    .toString()
                                                                    .substring(
                                                                        0,
                                                                        value.length -
                                                                            7
                                                                    );
                                                                tmpBU = value
                                                                    .toString()
                                                                    .substring(
                                                                        value.length -
                                                                            3,
                                                                        value.length
                                                                    );
                                                            } else {
                                                                tmpValue =
                                                                    value;
                                                            }
                                                            let set = false;
                                                            if (
                                                                props.rowData.data.alsoMarketingProjectNumberLMD.includes(
                                                                    'IS'
                                                                )
                                                            ) {
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.vodLMD',
                                                                    submissionData[0]
                                                                        .data
                                                                        .debitorNumber
                                                                );
                                                                set = true;
                                                            } else {
                                                                VendorsNames.every(
                                                                    (v) => {
                                                                        if (
                                                                            v.label ===
                                                                                tmpValue ||
                                                                            v.label.substr(
                                                                                0,
                                                                                v
                                                                                    .label
                                                                                    .length -
                                                                                    10
                                                                            ) ===
                                                                                tmpValue
                                                                        ) {
                                                                            handleCommunicationCellUpdate(
                                                                                submission,
                                                                                'data.vodLMD',
                                                                                v
                                                                                    .value
                                                                                    .debitorischer
                                                                            );
                                                                            set =
                                                                                true;

                                                                            return false;
                                                                        }
                                                                        return true;
                                                                    }
                                                                );
                                                            }
                                                            if (!set) {
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.vodLMD',
                                                                    ''
                                                                );
                                                                handleCommunicationCellUpdate(
                                                                    submission,
                                                                    'data.buLMD',
                                                                    ''
                                                                );
                                                            } else {
                                                                if (
                                                                    submissionData
                                                                ) {
                                                                    if (
                                                                        props.rowData.data.alsoMarketingProjectNumberLMD.includes(
                                                                            'IS'
                                                                        )
                                                                    ) {
                                                                        submissionData.every(
                                                                            (
                                                                                s: any
                                                                            ) => {
                                                                                handleCommunicationCellUpdate(
                                                                                    submission,
                                                                                    'data.amountLMD',
                                                                                    s
                                                                                        .data
                                                                                        .vendorAmount
                                                                                );
                                                                                handleCommunicationCellUpdate(
                                                                                    submission,
                                                                                    'data.documentCurrencyLMD',
                                                                                    s
                                                                                        .data
                                                                                        .vendorBudgetCurrency
                                                                                );
                                                                                handleCommunicationCellUpdate(
                                                                                    submission,
                                                                                    'data.buLMD',
                                                                                    s
                                                                                        .data
                                                                                        .businessUnit
                                                                                );
                                                                                return false;
                                                                            }
                                                                        );
                                                                    } else {
                                                                        submissionData.every(
                                                                            (
                                                                                s: any
                                                                            ) => {
                                                                                if (
                                                                                    s.group ===
                                                                                    'vendor'
                                                                                ) {
                                                                                    if (
                                                                                        tmpBU ===
                                                                                        ''
                                                                                    ) {
                                                                                        if (
                                                                                            s.group ===
                                                                                                'vendor' &&
                                                                                            s
                                                                                                .data
                                                                                                .debitorNumber ===
                                                                                                props
                                                                                                    .rowData
                                                                                                    .data
                                                                                                    .vodLMD
                                                                                        ) {
                                                                                            handleCommunicationCellUpdate(
                                                                                                submission,
                                                                                                'data.amountLMD',
                                                                                                s
                                                                                                    .data
                                                                                                    .vendorAmount
                                                                                            );
                                                                                            handleCommunicationCellUpdate(
                                                                                                submission,
                                                                                                'data.documentCurrencyLMD',
                                                                                                s
                                                                                                    .data
                                                                                                    .vendorBudgetCurrency
                                                                                            );
                                                                                            handleCommunicationCellUpdate(
                                                                                                submission,
                                                                                                'data.buLMD',
                                                                                                s
                                                                                                    .data
                                                                                                    .businessUnit
                                                                                            );
                                                                                            return false;
                                                                                        }
                                                                                    } else {
                                                                                        if (
                                                                                            s.group ===
                                                                                                'vendor' &&
                                                                                            s
                                                                                                .data
                                                                                                .debitorNumber ===
                                                                                                props
                                                                                                    .rowData
                                                                                                    .data
                                                                                                    .vodLMD &&
                                                                                            s.data.businessUnit.substring(
                                                                                                0,
                                                                                                3
                                                                                            ) ===
                                                                                                tmpBU
                                                                                        ) {
                                                                                            handleCommunicationCellUpdate(
                                                                                                submission,
                                                                                                'data.amountLMD',
                                                                                                s
                                                                                                    .data
                                                                                                    .vendorAmount
                                                                                            );
                                                                                            handleCommunicationCellUpdate(
                                                                                                submission,
                                                                                                'data.documentCurrencyLMD',
                                                                                                s
                                                                                                    .data
                                                                                                    .vendorBudgetCurrency
                                                                                            );
                                                                                            if (
                                                                                                tmpBU ===
                                                                                                s.data.businessUnit.substring(
                                                                                                    0,
                                                                                                    3
                                                                                                )
                                                                                            ) {
                                                                                                handleCommunicationCellUpdate(
                                                                                                    submission,
                                                                                                    'data.buLMD',
                                                                                                    s
                                                                                                        .data
                                                                                                        .businessUnit
                                                                                                );
                                                                                            }

                                                                                            return false;
                                                                                        }
                                                                                    }
                                                                                }
                                                                                return true;
                                                                            }
                                                                        );
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.vodLMD',
                                                dataKey: 'data.vodLMD',
                                                group: 'Input of Local Marketing Department',

                                                title: 'VOD',
                                                width: columnWidth(
                                                    'data.vodLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.vodLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        type={'text'}
                                                        backgroundColor={cellColor(
                                                            props
                                                        )}
                                                        readonly={
                                                            props.rowData
                                                                .parentId !==
                                                                null ||
                                                            cellReadonly(props)
                                                        }
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.buLMD',
                                                dataKey: 'data.buLMD',
                                                title: 'BU',
                                                group: 'Input of Local Marketing Department',

                                                width: columnWidth(
                                                    'data.buLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.buLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'dropdown'}
                                                        loadOptions={() => {
                                                            return BUs;
                                                        }}
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        backgroundColor={cellColor(
                                                            props
                                                        )}
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            // FIXME: set after 'refresh status' clicked
                                            {
                                                key: 'data.entryDateLMD',
                                                dataKey: 'data.entryDateLMD',
                                                title: 'Entry Date',
                                                group: 'Input of Local Marketing Department',
                                                type: 'date',
                                                width: columnWidth(
                                                    'data.entryDateLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.entryDateLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        type={'date'}
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        backgroundColor="#F5FAEF"
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.materialNumberLMD',
                                                dataKey:
                                                    'data.materialNumberLMD',
                                                title: 'Material Number',
                                                width: columnWidth(
                                                    'data.materialNumberLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                group: 'Input of Local Marketing Department',

                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.materialNumberLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'text'}
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        backgroundColor={cellColor(
                                                            props
                                                        )}
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        // loadOptions={() => {
                                                        //   return VendorsNames.map((vendor) => {
                                                        //     return {
                                                        //       label: vendor.value.hersteller,
                                                        //       value: vendor.value.hersteller,
                                                        //     };
                                                        //   });
                                                        // }}
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.reasonLMD',
                                                dataKey: 'data.reasonLMD',
                                                title: 'Reason',
                                                group: 'Input of Local Marketing Department',

                                                width: columnWidth(
                                                    'data.reasonLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.reasonLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'dropdown'}
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        loadOptions={() => {
                                                            return [
                                                                {
                                                                    label: '25',
                                                                    value: '25',
                                                                },
                                                                {
                                                                    label: '40',
                                                                    value: '40',
                                                                },
                                                            ];
                                                        }}
                                                        backgroundColor={cellColor(
                                                            props
                                                        )}
                                                        onUpdate={(
                                                            submission: string,
                                                            path: string,
                                                            value: any
                                                        ) => {
                                                            handleCommunicationCellUpdate(
                                                                submission,
                                                                path,
                                                                value
                                                            );
                                                        }}
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.reasonCodeLMD',
                                                dataKey: 'data.reasonCodeLMD',
                                                group: 'Input of Local Marketing Department',

                                                title: 'Reason Code',
                                                width: columnWidth(
                                                    'data.reasonCodeLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.reasonCodeLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        type={'text'}
                                                        backgroundColor={cellColor(
                                                            props
                                                        )}
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.invoiceTextLMD',
                                                dataKey: 'data.invoiceTextLMD',
                                                group: 'Input of Local Marketing Department',

                                                title: 'Invoice Text',
                                                width: columnWidth(
                                                    'data.invoiceTextLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.invoiceTextLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        type={'text'}
                                                        backgroundColor={mandatoryFieldValidation(
                                                            props
                                                        )}
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.referenceNumberFromVendor',
                                                dataKey:
                                                    'data.referenceNumberFromVendor',
                                                group: 'Input of Local Marketing Department',

                                                title: 'Reference Number From Vendor',
                                                width: columnWidth(
                                                    'data.referenceNumberFromVendor',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.referenceNumberFromVendor'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'text'}
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        backgroundColor="#F5FAEF"
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.activityIdForPortalVendors',
                                                dataKey:
                                                    'data.activityIdForPortalVendors',
                                                group: 'Input of Local Marketing Department',
                                                title: 'Activity ID for Portal Vendors',
                                                width: columnWidth(
                                                    'data.activityIdForPortalVendors',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.activityIdForPortalVendors'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        type={'text'}
                                                        backgroundColor={cellColor(
                                                            props
                                                        )}
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.amountLMD',
                                                dataKey: 'data.amountLMD',
                                                title: 'Amount',
                                                group: 'Input of Local Marketing Department',

                                                width: columnWidth(
                                                    'data.amountLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.amountLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'number'}
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        backgroundColor={cellColor(
                                                            props
                                                        )}
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.documentCurrencyLMD',
                                                dataKey:
                                                    'data.documentCurrencyLMD',
                                                title: 'Document Currency (DC)',
                                                group: 'Input of Local Marketing Department',

                                                width: columnWidth(
                                                    'data.documentCurrencyLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.documentCurrencyLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        type={'dropdown'}
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        loadOptions={() => {
                                                            return ExchangeRates;
                                                        }}
                                                        backgroundColor={cellColor(
                                                            props
                                                        )}
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.paymentMethodLMD',
                                                group: 'Input of Local Marketing Department',

                                                dataKey:
                                                    'data.paymentMethodLMD',
                                                title: 'Payment Method',
                                                width: columnWidth(
                                                    'data.paymentMethodLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.paymentMethodLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'dropdown'}
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        loadOptions={() => {
                                                            var res = [];
                                                            if (
                                                                props.rowData
                                                                    .data
                                                                    .invoiceTypeLMD !==
                                                                'Internal Invoice'
                                                            ) {
                                                                res = [
                                                                    {
                                                                        label: 'Payment',
                                                                        value: 'Payment',
                                                                    },
                                                                    {
                                                                        label: 'Money in House',
                                                                        value: 'Money in House',
                                                                    },
                                                                    {
                                                                        label: 'Credit Note from Vendor',
                                                                        value: 'Credit Note from Vendor',
                                                                    },
                                                                ];
                                                            } else {
                                                                res = [
                                                                    {
                                                                        label: 'Payment',
                                                                        value: 'Payment',
                                                                    },
                                                                    {
                                                                        label: 'Money in House',
                                                                        value: 'Money in House',
                                                                    },
                                                                    {
                                                                        label: 'Credit Note from Vendor',
                                                                        value: 'Credit Note from Vendor',
                                                                    },
                                                                    {
                                                                        label: 'Intercompany',
                                                                        value: 'Intercompany',
                                                                    },
                                                                ];
                                                            }
                                                            return res;
                                                        }}
                                                        backgroundColor={mandatoryFieldValidation(
                                                            props
                                                        )}
                                                        onUpdate={(
                                                            submission: string,
                                                            path: string,
                                                            value: any
                                                        ) => {
                                                            // handleCommunicationCellUpdate(
                                                            //   submission,
                                                            //   "data.statusLMD",
                                                            //   ""
                                                            // );
                                                            var dunningStop =
                                                                'No';
                                                            switch (
                                                                props.rowData
                                                                    .data
                                                                    .invoiceTypeLMD
                                                            ) {
                                                                case 'Invoice':
                                                                    switch (
                                                                        value
                                                                    ) {
                                                                        case 'Payment':
                                                                            dunningStop =
                                                                                'No';
                                                                            break;
                                                                        case 'Money in House':
                                                                            dunningStop =
                                                                                'Yes';
                                                                            break;
                                                                        case 'Credit Note from Vendor':
                                                                            dunningStop =
                                                                                'Yes';
                                                                            break;
                                                                    }
                                                                    break;
                                                                case 'Pre-Invoice':
                                                                    switch (
                                                                        value
                                                                    ) {
                                                                        case 'Payment':
                                                                            dunningStop =
                                                                                'No';
                                                                            break;
                                                                        case 'Money in House':
                                                                            dunningStop =
                                                                                'Yes';
                                                                            break;
                                                                        case 'Credit Note from Vendor':
                                                                            dunningStop =
                                                                                'Yes';
                                                                            break;
                                                                    }
                                                                    break;
                                                                case 'Internal Invoice':
                                                                    switch (
                                                                        value
                                                                    ) {
                                                                        case 'Payment':
                                                                            dunningStop =
                                                                                'No';
                                                                            break;
                                                                        case 'Money in House':
                                                                            dunningStop =
                                                                                'Yes';
                                                                            break;
                                                                        case 'Credit Note from Vendor':
                                                                            dunningStop =
                                                                                'Yes';
                                                                            break;
                                                                        case 'Central CN':
                                                                            dunningStop =
                                                                                'Yes';
                                                                            break;
                                                                    }
                                                                    break;
                                                                case 'Cancelation':
                                                                    break;
                                                            }
                                                            //if (value !== "Money in House") {
                                                            handleCommunicationCellUpdate(
                                                                submission,
                                                                'data.depositNumberLMD',
                                                                ''
                                                            );
                                                            //}
                                                            handleCommunicationCellUpdate(
                                                                submission,
                                                                'data.dunningStopLMD',
                                                                dunningStop
                                                            );
                                                            handleCommunicationCellUpdate(
                                                                submission,
                                                                path,
                                                                value
                                                            );
                                                        }}
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.dunningStopLMD',
                                                dataKey: 'data.dunningStopLMD',
                                                group: 'Input of Local Marketing Department',

                                                title: 'Dunning Stop?',
                                                width: columnWidth(
                                                    'data.dunningStopLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.dunningStopLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'dropdown'}
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        readonly={
                                                            (props.rowData.data
                                                                .invoiceTypeLMD ===
                                                                'Internal Invoice' &&
                                                                (props.rowData
                                                                    .data
                                                                    .paymentMethodLMD ===
                                                                    'Money in House' ||
                                                                    props
                                                                        .rowData
                                                                        .data
                                                                        .paymentMethodLMD ===
                                                                        'Credit Note from Vendor')) ||
                                                            cellReadonly(props)
                                                        }
                                                        loadOptions={() => {
                                                            return [
                                                                {
                                                                    label: 'Yes',
                                                                    value: 'Yes',
                                                                },
                                                                {
                                                                    label: 'No',
                                                                    value: 'No',
                                                                },
                                                            ];
                                                        }}
                                                        backgroundColor={mandatoryFieldValidation(
                                                            props
                                                        )}
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },

                                            {
                                                key: 'data.depositNumberLMD',
                                                dataKey:
                                                    'data.depositNumberLMD',
                                                group: 'Input of Local Marketing Department',

                                                title: 'Deposit Number/Intercompany CN Number',
                                                width: columnWidth(
                                                    'data.depositNumberLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.depositNumberLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'text'}
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        // readonly={
                                                        //   !(
                                                        //     props.rowData.data.paymentMethodLMD ===
                                                        //       "Money in House" ||
                                                        //     props.rowData.data.paymentMethodLMD ===
                                                        //       "Central CN"
                                                        //   )
                                                        // }
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        backgroundColor={cellColor(
                                                            props
                                                        )}
                                                        // backgroundColor={
                                                        //   props.rowData.data.invoiceTypeLMD ===
                                                        //   "Cancellation"
                                                        //     ? "#F5FAEF"
                                                        //     : props.rowData.data.paymentMethodLMD ===
                                                        //         "Money in House" ||
                                                        //       props.rowData.data.paymentMethodLMD ===
                                                        //         "Central CN"
                                                        //     ? props.cellData && props.cellData.length > 0
                                                        //       ? "#F5FAEF"
                                                        //       : "#f7cdd6"
                                                        //     : "#F5FAEF"
                                                        // }
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.additionalInformationLMD',
                                                dataKey:
                                                    'data.additionalInformationLMD',
                                                title: 'Additional Information',
                                                width: columnWidth(
                                                    'data.additionalInformationLMD',
                                                    200
                                                ),
                                                group: 'Input of Local Marketing Department',

                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.additionalInformationLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        type={'text'}
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        backgroundColor={mandatoryFieldValidation(
                                                            props
                                                        )}
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.sendToLMD',
                                                dataKey: 'data.sendToLMD',
                                                title: 'Send to',
                                                width: columnWidth(
                                                    'data.sendToLMD',
                                                    200
                                                ),
                                                group: 'Input of Local Marketing Department',

                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.sendToLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        type={'text'}
                                                        backgroundColor={cellColor(
                                                            props
                                                        )}
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.dateOfServiceRenderedLMD',
                                                dataKey:
                                                    'data.dateOfServiceRenderedLMD',
                                                group: 'Input of Local Marketing Department',

                                                title: 'Date of service rendered',
                                                width: columnWidth(
                                                    'data.dateOfServiceRenderedLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.dateOfServiceRenderedLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        type={'text'}
                                                        backgroundColor={
                                                            '#F5FAEF'
                                                        }
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: 'data.linkToProofsLMD',
                                                dataKey: 'data.linkToProofsLMD',
                                                group: 'Input of Local Marketing Department',

                                                title: 'Link to proof',
                                                width: columnWidth(
                                                    'data.linkToProofsLMD',
                                                    200
                                                ),
                                                resizable: true,
                                                hidden: visibilityController(
                                                    'LMD',
                                                    'data.linkToProofsLMD'
                                                ),
                                                cellRenderer: (props: any) => (
                                                    <EditableTableCell
                                                        invoiced={
                                                            lmdColumnEdit(
                                                                props.rowData
                                                                    .data
                                                            ) ||
                                                            !(
                                                                userRoles.includes(
                                                                    'Marketing'
                                                                ) ||
                                                                userRoles.includes(
                                                                    'Administrator'
                                                                )
                                                            )
                                                        }
                                                        type={'text'}
                                                        backgroundColor={cellColor(
                                                            props
                                                        )}
                                                        readonly={cellReadonly(
                                                            props
                                                        )}
                                                        onUpdate={
                                                            handleCommunicationCellUpdate
                                                        }
                                                        rowIndex={
                                                            props.rowIndex
                                                        }
                                                        columnKey={
                                                            props.column.dataKey
                                                        }
                                                        rowData={props.rowData}
                                                        initialValue={
                                                            props.cellData
                                                        }
                                                    />
                                                ),
                                            },
                                            {
                                                key: '__actions.validate',
                                                dataKey: '__actions.validate',
                                                title: '',
                                                width: columnWidth(
                                                    '__actions.validate',
                                                    100
                                                ),
                                                resizable: false,
                                                header: 'Actions',
                                                className: 'red-border',
                                                cellRenderer: (props: any) =>
                                                    props.rowData.parentId ===
                                                        null &&
                                                    props.rowData.data
                                                        .statusLMD !==
                                                        'INVOICED' ? (
                                                        <EditableTableCell
                                                            invoiced={
                                                                lmdColumnEdit(
                                                                    props
                                                                        .rowData
                                                                        .data
                                                                ) ||
                                                                !(
                                                                    userRoles.includes(
                                                                        'Marketing'
                                                                    ) ||
                                                                    userRoles.includes(
                                                                        'Administrator'
                                                                    )
                                                                )
                                                            }
                                                            type={'button'}
                                                            backgroundColor="#fef9fa"
                                                            textColor={'green'}
                                                            onUpdate={(
                                                                submissionId: string
                                                            ) => {
                                                                var isInvoiceCorrect: number = 0;
                                                                var targetChildSubs: any[] =
                                                                    [];
                                                                var parent: any;
                                                                var targetSubmissionIndex =
                                                                    communicationSubmissions.findIndex(
                                                                        (s) =>
                                                                            s.id ===
                                                                            submissionId
                                                                    );

                                                                // getColumnName(
                                                                //     'data.depositNumberLMD',
                                                                //     'Input of Local Marketing Department'
                                                                // );

                                                                if (
                                                                    props
                                                                        .rowData
                                                                        .data
                                                                        .invoiceTypeLMD ===
                                                                        '' ||
                                                                    !props
                                                                        .rowData
                                                                        .data
                                                                        .invoiceTypeLMD
                                                                ) {
                                                                    isInvoiceCorrect += 1;
                                                                    toast(
                                                                        <Toast
                                                                            title={
                                                                                'Incomplete Request'
                                                                            }
                                                                            message={
                                                                                'Invoice type cannot be emtpy'
                                                                            }
                                                                            type={
                                                                                'error'
                                                                            }
                                                                        />
                                                                    );
                                                                    return isInvoiceCorrect;
                                                                }

                                                                if (
                                                                    communicationSubmissions[
                                                                        targetSubmissionIndex
                                                                    ].data
                                                                        .invoiceTypeLMD ===
                                                                    'Cancellation'
                                                                ) {
                                                                    parent =
                                                                        communicationSubmissions[
                                                                            targetSubmissionIndex
                                                                        ];
                                                                    // if (
                                                                    //   communicationSubmissions[
                                                                    //     targetSubmissionIndex
                                                                    //   ].data.additionalInformationLMD.length >
                                                                    //     0 &&
                                                                    //   communicationSubmissions[
                                                                    //     targetSubmissionIndex
                                                                    //   ].data.cancellationInfoLMD.length > 0 &&
                                                                    //   communicationSubmissions[
                                                                    //     targetSubmissionIndex
                                                                    //   ].data.sendTo.length > 0
                                                                    // )
                                                                    if (
                                                                        hasRequiredFields(
                                                                            parent
                                                                        )
                                                                    ) {
                                                                        isInvoiceCorrect = 0;
                                                                    } else {
                                                                        isInvoiceCorrect = 1;
                                                                    }
                                                                } else {
                                                                    if (
                                                                        communicationSubmissions[
                                                                            targetSubmissionIndex
                                                                        ].data
                                                                            .invoiceTypeLMD !==
                                                                        'Cancellation'
                                                                    ) {
                                                                        targetChildSubs =
                                                                            communicationSubmissions.filter(
                                                                                (
                                                                                    s
                                                                                ) =>
                                                                                    s.parentId ===
                                                                                    submissionId
                                                                            );

                                                                        if (
                                                                            targetSubmissionIndex >
                                                                            -1
                                                                        ) {
                                                                            var is: Submission[] =
                                                                                [];
                                                                            is.push(
                                                                                communicationSubmissions[
                                                                                    targetSubmissionIndex
                                                                                ]
                                                                            );

                                                                            if (
                                                                                is[0]
                                                                                    .parentId ===
                                                                                null
                                                                            ) {
                                                                                communicationSubmissions.forEach(
                                                                                    (
                                                                                        s
                                                                                    ) => {
                                                                                        if (
                                                                                            s.parentId ===
                                                                                            submissionId
                                                                                        ) {
                                                                                            is.push(
                                                                                                s
                                                                                            );
                                                                                        }
                                                                                    }
                                                                                );
                                                                            }
                                                                            isInvoiceCorrect = 0;

                                                                            is.forEach(
                                                                                (
                                                                                    ts,
                                                                                    tsi
                                                                                ) => {
                                                                                    handleCommunicationCellUpdate(
                                                                                        ts.id!,
                                                                                        'data.newLine',
                                                                                        false
                                                                                    );
                                                                                    if (
                                                                                        ts.parentId ===
                                                                                        null
                                                                                    ) {
                                                                                        parent =
                                                                                            ts;
                                                                                    }
                                                                                    if (
                                                                                        !hasRequiredFields(
                                                                                            ts
                                                                                        )
                                                                                    ) {
                                                                                        isInvoiceCorrect += 1;
                                                                                    }
                                                                                }
                                                                            );

                                                                            var targetChildSameVOD =
                                                                                targetChildSubs.filter(
                                                                                    (
                                                                                        s
                                                                                    ) =>
                                                                                        s
                                                                                            .data
                                                                                            .vodLMD ===
                                                                                        parent
                                                                                            .data
                                                                                            .vodLMD
                                                                                );
                                                                            if (
                                                                                targetChildSameVOD.length !==
                                                                                targetChildSubs.length
                                                                            ) {
                                                                                isInvoiceCorrect += 1;
                                                                                toast(
                                                                                    <Toast
                                                                                        title={
                                                                                            'Incomplete Request'
                                                                                        }
                                                                                        message={
                                                                                            'Invoice contains two different VOD numbers, and invoice can be requested only for one vendor'
                                                                                        }
                                                                                        type={
                                                                                            'error'
                                                                                        }
                                                                                    />
                                                                                );
                                                                            }
                                                                            var targetChildSameCurr =
                                                                                targetChildSubs.filter(
                                                                                    (
                                                                                        s
                                                                                    ) =>
                                                                                        s
                                                                                            .data
                                                                                            .documentCurrencyLMD ===
                                                                                        parent
                                                                                            .data
                                                                                            .documentCurrencyLMD
                                                                                );
                                                                            if (
                                                                                targetChildSameCurr.length !==
                                                                                targetChildSubs.length
                                                                            ) {
                                                                                isInvoiceCorrect += 1;
                                                                                toast(
                                                                                    <Toast
                                                                                        title={
                                                                                            'Incomplete Request'
                                                                                        }
                                                                                        message={
                                                                                            'Invoice contains two different currencies, and invoice can be requested only for one currency'
                                                                                        }
                                                                                        type={
                                                                                            'error'
                                                                                        }
                                                                                    />
                                                                                );
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                                if (
                                                                    isInvoiceCorrect ===
                                                                    0
                                                                ) {
                                                                    var today =
                                                                        new Date();
                                                                    today.setHours(
                                                                        23,
                                                                        59,
                                                                        59,
                                                                        998
                                                                    );
                                                                    var statusToBeSet =
                                                                        '';
                                                                    if (
                                                                        parent
                                                                            .data
                                                                            .invoicingDateLMD &&
                                                                        new Date(
                                                                            parent.data.invoicingDateLMD
                                                                        ) >
                                                                            today
                                                                    ) {
                                                                        statusToBeSet =
                                                                            'FUTURE INVOICE';
                                                                    } else {
                                                                        statusToBeSet =
                                                                            'OK FOR INVOICING';
                                                                    }
                                                                    handleCommunicationCellUpdate(
                                                                        parent.id!,
                                                                        'data.statusLMD',
                                                                        statusToBeSet
                                                                    );
                                                                    targetChildSubs.forEach(
                                                                        (
                                                                            element
                                                                        ) => {
                                                                            handleCommunicationCellUpdate(
                                                                                element.id!,
                                                                                'data.statusLMD',
                                                                                statusToBeSet
                                                                            );
                                                                        }
                                                                    );
                                                                    toast(
                                                                        <Toast
                                                                            title={
                                                                                'Successful Validation'
                                                                            }
                                                                            message={
                                                                                'Parent submission validated successfully'
                                                                            }
                                                                            type={
                                                                                'success'
                                                                            }
                                                                        />
                                                                    );
                                                                } else {
                                                                    toast(
                                                                        <Toast
                                                                            title={
                                                                                'Incomplete Request'
                                                                            }
                                                                            message={
                                                                                'Parent submission could not be validated: incomplete data'
                                                                            }
                                                                            type={
                                                                                'error'
                                                                            }
                                                                        />
                                                                    );

                                                                    handleCommunicationCellUpdate(
                                                                        parent.id!,
                                                                        'data.statusLMD',
                                                                        'INCOMPLETE'
                                                                    );
                                                                }
                                                            }}
                                                            rowIndex={
                                                                props.rowIndex
                                                            }
                                                            columnKey={
                                                                props.column
                                                                    .dataKey
                                                            }
                                                            rowData={
                                                                props.rowData
                                                            }
                                                            initialValue={
                                                                'validate'
                                                            }
                                                        />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                backgroundColor:
                                                                    '#F7FAFC',
                                                                width: '100%',
                                                                height: '100%',
                                                            }}
                                                        />
                                                    ),
                                            },
                                            {
                                                key: '__actions.create',
                                                dataKey: '__actions.create',
                                                title: '',
                                                width: columnWidth(
                                                    '__actions.create',
                                                    150
                                                ),
                                                resizable: false,
                                                className: 'red-border',
                                                cellRenderer: (props: any) =>
                                                    props.rowData.data
                                                        .invoiceTypeLMD !==
                                                        'Cancellation' &&
                                                    props.rowData.parentId ===
                                                        null &&
                                                    props.rowData.data
                                                        .statusLMD !==
                                                        'INVOICED' ? (
                                                        <EditableTableCell
                                                            type={'button'}
                                                            invoiced={
                                                                props.rowData
                                                                    .data
                                                                    .statusLMD ===
                                                                    'INVOICED' ||
                                                                props.rowData
                                                                    .data
                                                                    .statusLMD ===
                                                                    'OK FOR INVOICING' ||
                                                                props.rowData
                                                                    .data
                                                                    .invoiceTypeLMD ===
                                                                    'Cancellation' ||
                                                                !(
                                                                    userRoles.includes(
                                                                        'Marketing'
                                                                    ) ||
                                                                    userRoles.includes(
                                                                        'Administrator'
                                                                    )
                                                                )
                                                            }
                                                            backgroundColor="#fef9fa"
                                                            textColor={'blue'}
                                                            onUpdate={(
                                                                submissionId: string
                                                            ) => {
                                                                if (
                                                                    hasRequiredFields(
                                                                        props.rowData
                                                                    )
                                                                ) {
                                                                    var submissionNew: Submission =
                                                                        {
                                                                            project:
                                                                                props
                                                                                    .rowData
                                                                                    .project,
                                                                            parentId:
                                                                                submissionId,
                                                                            viewId: null,
                                                                            group: 'communication',
                                                                            created:
                                                                                new Date(),
                                                                            updated:
                                                                                new Date(),
                                                                            title: '',
                                                                            author: '',
                                                                            status: '',
                                                                            data: {
                                                                                newLine:
                                                                                    true,
                                                                                documentCurrencyLMD:
                                                                                    props
                                                                                        .rowData
                                                                                        .data
                                                                                        .documentCurrencyLMD,
                                                                                invoicingDateLMD:
                                                                                    props
                                                                                        .rowData
                                                                                        .data
                                                                                        .invoicingDateLMD,
                                                                                requestorLMD:
                                                                                    props
                                                                                        .rowData
                                                                                        .data
                                                                                        .requestorLMD,
                                                                                vendorLMD:
                                                                                    props
                                                                                        .rowData
                                                                                        .data
                                                                                        .vendorLMD,
                                                                                vodLMD: props
                                                                                    .rowData
                                                                                    .data
                                                                                    .vodLMD,
                                                                                buLMD:
                                                                                    props
                                                                                        .rowData
                                                                                        .data
                                                                                        .invoiceTypeLMD ===
                                                                                    'Pre-Invoice'
                                                                                        ? null
                                                                                        : props
                                                                                              .rowData
                                                                                              .data
                                                                                              .buLMD,
                                                                                invoiceTypeLMD:
                                                                                    props
                                                                                        .rowData
                                                                                        .data
                                                                                        .invoiceTypeLMD,
                                                                                cancellationInfoLMD:
                                                                                    props
                                                                                        .rowData
                                                                                        .data
                                                                                        .cancellationInfoLMD,
                                                                                materialNumberLMD:
                                                                                    props
                                                                                        .rowData
                                                                                        .data
                                                                                        .materialNumberLMD,
                                                                                reasonLMD:
                                                                                    props
                                                                                        .rowData
                                                                                        .data
                                                                                        .reasonLMD,
                                                                                reasonCodeLMD:
                                                                                    props
                                                                                        .rowData
                                                                                        .data
                                                                                        .reasonCodeLMD,
                                                                                depositNumberLMD:
                                                                                    '',
                                                                                paymentMethodLMD:
                                                                                    props
                                                                                        .rowData
                                                                                        .data
                                                                                        .paymentMethodLMD,
                                                                                dunningStopLMD:
                                                                                    props
                                                                                        .rowData
                                                                                        .data
                                                                                        .dunningStopLMD,
                                                                                sendToLMD:
                                                                                    props
                                                                                        .rowData
                                                                                        .data
                                                                                        .sendToLMD,
                                                                                alsoMarketingProjectNumberLMD:
                                                                                    props
                                                                                        .rowData
                                                                                        .data
                                                                                        .invoiceTypeLMD ===
                                                                                    'Pre-Invoice'
                                                                                        ? props
                                                                                              .rowData
                                                                                              .data
                                                                                              .alsoMarketingProjectNumberLMD
                                                                                        : null,
                                                                            },
                                                                        };
                                                                    RestAPI.createSubmission(
                                                                        submissionNew
                                                                    ).then(
                                                                        (
                                                                            response
                                                                        ) => {
                                                                            var temp =
                                                                                [
                                                                                    ...communicationSubmissions,
                                                                                ];

                                                                            temp.push(
                                                                                response.data
                                                                            );
                                                                            setCommunicationSubmissions(
                                                                                temp
                                                                            );
                                                                        }
                                                                    );
                                                                } else {
                                                                    toast(
                                                                        <Toast
                                                                            title={
                                                                                'Not all field entered'
                                                                            }
                                                                            message={
                                                                                'You need to enter all obligatory fields before you can add invoice lines'
                                                                            }
                                                                            type={
                                                                                'error'
                                                                            }
                                                                        />
                                                                    );
                                                                }
                                                            }}
                                                            rowIndex={
                                                                props.rowIndex
                                                            }
                                                            columnKey={
                                                                props.column
                                                                    .dataKey
                                                            }
                                                            rowData={
                                                                props.rowData
                                                            }
                                                            initialValue={
                                                                'create new line'
                                                            }
                                                        />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                backgroundColor:
                                                                    '#F7FAFC',
                                                                width: '100%',
                                                                height: '100%',
                                                            }}
                                                        />
                                                    ),
                                            },
                                            {
                                                key: '__actions.delete',
                                                dataKey: '__actions.delete',
                                                title: '',
                                                width: columnWidth(
                                                    '__actions.delete',
                                                    100
                                                ),
                                                resizable: false,
                                                className: 'red-border',
                                                cellRenderer: (props: any) =>
                                                    props.rowData.data &&
                                                    props.rowData.data
                                                        .statusLMD !==
                                                        'INVOICED' ? (
                                                        <EditableTableCell
                                                            invoiced={
                                                                lmdColumnEdit(
                                                                    props
                                                                        .rowData
                                                                        .data
                                                                ) ||
                                                                !(
                                                                    userRoles.includes(
                                                                        'Marketing'
                                                                    ) ||
                                                                    userRoles.includes(
                                                                        'Administrator'
                                                                    )
                                                                )
                                                            }
                                                            type={'button'}
                                                            textColor={'red'}
                                                            backgroundColor="#fef9fa"
                                                            onUpdate={(
                                                                submissionId: string
                                                            ) => {
                                                                var tbd: string[] =
                                                                    [
                                                                        submissionId,
                                                                    ];
                                                                var submissionIndex =
                                                                    communicationSubmissions.findIndex(
                                                                        (s) =>
                                                                            s.id ===
                                                                            submissionId
                                                                    );
                                                                if (
                                                                    submissionIndex >
                                                                    -1
                                                                ) {
                                                                    var temp = [
                                                                        ...communicationSubmissions,
                                                                    ];
                                                                    temp.splice(
                                                                        submissionIndex,
                                                                        1
                                                                    );
                                                                    temp.forEach(
                                                                        (
                                                                            s,
                                                                            index
                                                                        ) => {
                                                                            if (
                                                                                s.parentId !==
                                                                                    null &&
                                                                                s.parentId ===
                                                                                    submissionId
                                                                            ) {
                                                                                if (
                                                                                    s.id
                                                                                ) {
                                                                                    temp.splice(
                                                                                        index,
                                                                                        1
                                                                                    );
                                                                                    tbd.push(
                                                                                        s.id
                                                                                    );
                                                                                }
                                                                            }
                                                                        }
                                                                    );
                                                                    setCommunicationSubmissions(
                                                                        temp
                                                                    );
                                                                    RestAPI.deleteSubmission(
                                                                        submissionId
                                                                    );
                                                                }
                                                            }}
                                                            rowIndex={
                                                                props.rowIndex
                                                            }
                                                            columnKey={
                                                                props.column
                                                                    .dataKey
                                                            }
                                                            rowData={
                                                                props.rowData
                                                            }
                                                            initialValue={
                                                                'delete'
                                                            }
                                                        />
                                                    ) : (
                                                        <div
                                                            style={{
                                                                backgroundColor:
                                                                    '#F7FAFC',
                                                                width: '100%',
                                                                height: '100%',
                                                            }}
                                                        />
                                                    ),
                                            },
                                        ]}
                                        headerRenderer={headerRendererForTable}
                                        headerClassName="header-cells"
                                        data={unflatten([
                                            ...filteredCommunicationSubmissions,
                                        ] as any[])}
                                        rowKey="id"
                                        headerHeight={[50, 50]}
                                        rowHeight={55}
                                        overlayRenderer={
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    width: '200px',
                                                    bottom: '20px',
                                                    right: '20px',
                                                    padding: '5px 15px',
                                                }}
                                            >
                                                <Button
                                                    disabled={
                                                        !(
                                                            userRoles.includes(
                                                                'Administrator'
                                                            ) ||
                                                            userRoles.includes(
                                                                'Marketing'
                                                            )
                                                        )
                                                    }
                                                    onClick={() => {
                                                        var submission: Submission =
                                                            {
                                                                // FIXME
                                                                project:
                                                                    '619515b754e61c8dd33daa52',
                                                                parentId: null,
                                                                viewId: null,
                                                                group: 'communication',
                                                                created:
                                                                    new Date(),
                                                                updated:
                                                                    new Date(),
                                                                title: '',
                                                                author: '',
                                                                status: '',
                                                                data: {
                                                                    newLine:
                                                                        true,
                                                                    paymentMethodLMD:
                                                                        '',
                                                                    dunningStopLMD:
                                                                        '',
                                                                    sendToLMD:
                                                                        '',
                                                                    invoiceTextLMD:
                                                                        '',
                                                                    vendorLMD:
                                                                        '',
                                                                    invoicingDateLMD:
                                                                        '',
                                                                    amountLMD:
                                                                        '',
                                                                    documentCurrencyLMD:
                                                                        '',
                                                                    alsoMarketingProjectNumberLMD:
                                                                        '',
                                                                    materialNumberLMD:
                                                                        '7000100',
                                                                    invoiceTypeLMD:
                                                                        'Invoice',
                                                                    reasonLMD:
                                                                        '40',
                                                                    reasonCodeLMD:
                                                                        'ZWKZ',
                                                                },
                                                            };
                                                        RestAPI.createSubmission(
                                                            submission
                                                        ).then((response) => {
                                                            var temp = [
                                                                ...communicationSubmissions,
                                                            ];
                                                            temp.unshift(
                                                                response.data
                                                            );
                                                            setCommunicationSubmissions(
                                                                temp
                                                            );
                                                        });
                                                    }}
                                                >
                                                    Create Submission
                                                </Button>
                                            </div>
                                        }
                                    ></BaseTable>
                                )}
                            </AutoResizer>
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
            <Box
                w={'100%'}
                bg={useColorModeValue('white', '#5b5b5b')}
                p={4}
                mb={5}
                border="1px"
                rounded="md"
                borderColor="gray.100"
                color={'gray.500'}
            >
                <Box mb={'1em'} w="100%">
                    <Stack
                        style={{ marginBottom: '10px' }}
                        direction={'row'}
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Text mb="8px">Displayed Columns</Text>
                        <SaveFilters
                            selectedTemplate={selectedTemplate}
                            displayedColumns={displayedColumns}
                            filters={filters}
                            setPresetName={setPresetNewName}
                            presetName={presetNewName}
                            fetchTemplates={fetchTemplates}
                        />
                    </Stack>

                    <CheckTreePicker
                        cleanable={false}
                        defaultExpandAll={false}
                        block
                        onChange={(value) => {
                            var values: string[] = [];
                            let previousValues: string[] = [];
                            if (tabIndex === 0) {
                                previousValues = previousValuesProject;
                            } else if (tabIndex === 1) {
                                previousValues = previousValuesComm;
                            }
                            if (
                                !previousValues.includes(noneValue) &&
                                value.includes(noneValue)
                            ) {
                                if (!values.includes(noneValue)) {
                                    values.push(noneValue);
                                }
                                values.push('data.projectNumber');
                            } else if (
                                !previousValues.includes(allValue) &&
                                value.includes(allValue)
                            ) {
                                if (!values.includes(allValue)) {
                                    values.push(allValue);
                                }
                                defaultColumns.forEach((c) => {
                                    values.push(c);
                                });
                            } else {
                                value.forEach((v) => {
                                    values.push(v.toString());
                                });
                            }
                            const hasOnlyProjectNumber =
                                values.length <= 2 &&
                                values.includes('data.projectNumber');
                            if (!hasAllColumns(values)) {
                                const index = values.indexOf(allValue);
                                if (index > -1) {
                                    values.splice(index, 1);
                                }
                            } else {
                                if (!values.includes(allValue)) {
                                    values.push(allValue);
                                }
                            }

                            if (values.length !== 0 && !hasOnlyProjectNumber) {
                                const index = values.indexOf(noneValue);
                                if (index > -1) {
                                    values.splice(index, 1);
                                }
                            } else {
                                values.push(noneValue);
                            }

                            if (selectedTemplate === 'local') {
                                localStorage.setItem(
                                    'vendors.displayedColumns',
                                    JSON.stringify(values)
                                );
                            }
                            if (tabIndex === 0) {
                                setPreviousValuesProject(values);
                            } else if (tabIndex === 1) {
                                setPreviousValuesComm(values);
                            }
                            setDisplayedColumns(values);
                        }}
                        value={displayedColumns}
                        data={getFilteredColumns(tabIndex)}
                        // data={DisplayedColumnsList}
                        placeholder="Groups"
                        size="lg"
                    />
                </Box>
                <Stack
                    mb={'1em'}
                    w="100%"
                    spacing={'2em'}
                    direction={{ base: 'column', lg: 'row' }}
                >
                    <Box w="100%">
                        <Text mb="8px">Statuses</Text>
                        <TagPicker
                            cleanable
                            style={{
                                minHeight: '40px',
                                paddingTop: '2px',
                            }}
                            data={[]}
                            block
                        />
                    </Box>
                    <Box w="100%">
                        <Text mb="8px">Preset</Text>
                        <Creatable
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
                            classNamePrefix="select"
                            isClearable
                            onCreateOption={(name) => {
                                if (
                                    name.toLowerCase() === 'local' ||
                                    name.trim().length < 1
                                ) {
                                    return;
                                }
                                setSelectedTemplate(name);
                                var template: Template = {
                                    name,
                                    columns: displayedColumns,
                                    filters: filters,
                                };
                                RestAPI.updateTemplate(template).then(() => {
                                    setTemplates([...templates, template]);
                                });
                            }}
                            value={{
                                label: selectedTemplate,
                                value: selectedTemplate,
                            }}
                            onChange={(name) => {
                                if (name === null || name.label === 'local') {
                                    setSelectedTemplate('local');
                                    setDisplayedColumns(defaultColumns);
                                    setFilters([]);
                                    return;
                                }
                                setSelectedTemplate(name.label);
                                var template = templates.find(
                                    (t) => t.name === name.label
                                );
                                if (template) {
                                    setDisplayedColumns(template.columns);
                                    setFilters(template.filters);
                                }
                            }}
                            name="presets"
                            options={[
                                { label: 'local', value: 'local' },
                                ...templates.map((t) => {
                                    return { label: t.name, value: t.name };
                                }),
                            ]}
                        />
                    </Box>
                </Stack>
            </Box>
            <Box
                shadow="md"
                color="gray.600"
                backgroundColor="white"
                mb={10}
                p={8}
                pb={0}
                rounded="md"
                w={'100%'}
            >
                <VStack
                    spacing={8}
                    fontSize="md"
                    align="stretch"
                    color={'gray.500'}
                >
                    <Box w={'100%'}>
                        <Box w={'100%'}>
                            {filters.map((filter, index) => {
                                var valuesField: JSX.Element = <div></div>;
                                switch (filter.type) {
                                    case 'text':
                                        valuesField = (
                                            <Input
                                                onChange={(event) => {
                                                    var temp = [...filters];

                                                    temp[
                                                        index
                                                    ].selectedValues[0] =
                                                        event.target.value;
                                                    setFilters(temp);
                                                }}
                                                value={filter.selectedValues[0]}
                                            />
                                        );
                                        break;
                                    case 'string':
                                        valuesField = (
                                            <Input
                                                onChange={(event) => {
                                                    var temp = [...filters];
                                                    temp[
                                                        index
                                                    ].selectedValues[0] =
                                                        event.target.value;
                                                    setFilters(temp);
                                                }}
                                                value={filter.selectedValues[0]}
                                            />
                                        );
                                        break;
                                    case 'number':
                                        switch (filter.filter) {
                                            case 'exact':
                                                valuesField = (
                                                    // <NumberInput
                                                    //   precision={2}
                                                    //   //defaultValue={filter.selectedValues[0]}
                                                    //   onChange={(_, value) => {
                                                    //     console.log(value);
                                                    //     var temp = [...filters];
                                                    //     temp[index].selectedValues[0] = value;
                                                    //     setFilters(temp);
                                                    //   }}
                                                    //   value={Number(filter.selectedValues[0].toFixed(2))}
                                                    //   w="100%"
                                                    // >
                                                    //   <NumberInputField />
                                                    //   {/* <NumberInputStepper>
                                                    //     <NumberIncrementStepper />
                                                    //     <NumberDecrementStepper />
                                                    //   </NumberInputStepper> */}
                                                    // </NumberInput>
                                                    <NumberInput
                                                        onChange={(
                                                            strValue: string,
                                                            value: number
                                                        ) => {
                                                            var temp = [
                                                                ...filters,
                                                            ];
                                                            temp[
                                                                index
                                                            ].selectedValues[0] =
                                                                strValue;
                                                            setFilters(temp);
                                                        }}
                                                        value={
                                                            filter
                                                                .selectedValues[0]
                                                        }
                                                    >
                                                        <NumberInputField />
                                                        {/* <NumberInputStepper>
                              <NumberIncrementStepper />
                              <NumberDecrementStepper />
                            </NumberInputStepper> */}
                                                    </NumberInput>
                                                );
                                                break;
                                            case 'range':
                                                valuesField = (
                                                    <Stack
                                                        direction={{
                                                            base: 'column',
                                                            md: 'row',
                                                        }}
                                                    >
                                                        <NumberInput
                                                            w="100%"
                                                            onChange={(
                                                                strValue,
                                                                value
                                                            ) => {
                                                                var temp = [
                                                                    ...filters,
                                                                ];
                                                                temp[
                                                                    index
                                                                ].selectedValues[0] =
                                                                    strValue;
                                                                setFilters(
                                                                    temp
                                                                );
                                                            }}
                                                            value={
                                                                filter
                                                                    .selectedValues[0]
                                                            }
                                                        >
                                                            <NumberInputField />
                                                            {/* <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper> */}
                                                        </NumberInput>
                                                        <Box
                                                            textAlign="center"
                                                            w="20px"
                                                        >
                                                            <ArrowForwardIcon
                                                                alignSelf="center"
                                                                w={5}
                                                                h="100%"
                                                            />
                                                        </Box>
                                                        <NumberInput
                                                            w="100%"
                                                            onChange={(
                                                                strValue,
                                                                value
                                                            ) => {
                                                                var temp = [
                                                                    ...filters,
                                                                ];
                                                                temp[
                                                                    index
                                                                ].selectedValues[1] =
                                                                    strValue;
                                                                setFilters(
                                                                    temp
                                                                );
                                                            }}
                                                            value={
                                                                filter
                                                                    .selectedValues[1]
                                                            }
                                                        >
                                                            <NumberInputField />
                                                            {/* <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                              </NumberInputStepper> */}
                                                        </NumberInput>
                                                    </Stack>
                                                );
                                                break;
                                        }
                                        break;
                                    case 'dropdown':
                                    case 'multiple-dropdown':
                                        valuesField = (
                                            <TagPicker
                                                cleanable
                                                style={{
                                                    minHeight: '40px',
                                                    paddingTop: '2px',
                                                }}
                                                onChange={(value) => {
                                                    var temp = [...filters];

                                                    temp[index].selectedValues =
                                                        value;
                                                    setFilters(temp);
                                                }}
                                                value={
                                                    filters[index]
                                                        .selectedValues
                                                }
                                                data={loadOptions(
                                                    filter.columnValue
                                                )}
                                                block
                                            />
                                        );
                                        break;
                                    case 'date':
                                        switch (filter.filter) {
                                            case 'exact':
                                                valuesField = (
                                                    <DateSingleInput
                                                        allowEditableInputs={
                                                            true
                                                        }
                                                        displayFormat="dd.MM.yyyy"
                                                        onChange={(value) => {
                                                            if (
                                                                value !==
                                                                filters[index]
                                                                    .selectedValues[0]
                                                            ) {
                                                                var temp = [
                                                                    ...filters,
                                                                ];
                                                                temp[
                                                                    index
                                                                ].selectedValues =
                                                                    [value];
                                                                setFilters(
                                                                    temp
                                                                );
                                                            }
                                                        }}
                                                    />
                                                );
                                                break;
                                            case 'range':
                                                valuesField = (
                                                    <DateRangeInput
                                                        allowEditableInputs={
                                                            true
                                                        }
                                                        displayFormat="dd.MM.yyyy"
                                                        onDatesChange={(
                                                            value
                                                        ) => {
                                                            var temp = [
                                                                ...filters,
                                                            ];
                                                            temp[
                                                                index
                                                            ].selectedValues = [
                                                                value.startDate,
                                                                value.endDate,
                                                            ];
                                                            setFilters(temp);
                                                        }}
                                                    />
                                                );
                                                break;
                                        }
                                }

                                return (
                                    <Box
                                        w={'100%'}
                                        backgroundColor="white"
                                        p={4}
                                        mb={5}
                                        border="1px"
                                        rounded="md"
                                        borderColor="gray.100"
                                    >
                                        <CloseButton
                                            onClick={() => {
                                                var temp = [...filters];
                                                temp.splice(index, 1);
                                                setFilters(temp);
                                            }}
                                            float="right"
                                        />
                                        <VStack
                                            mt={'20px'}
                                            spacing={8}
                                            fontSize="md"
                                            align="stretch"
                                            color={'gray.500'}
                                        >
                                            <Box>
                                                <Stack
                                                    direction={{
                                                        base: 'column',
                                                        xl: 'row',
                                                    }}
                                                    w="100%"
                                                    spacing={{
                                                        base: '20px',
                                                        xl: '50px',
                                                    }}
                                                >
                                                    <Box w="100%">
                                                        <Text mb="8px">
                                                            Column
                                                        </Text>
                                                        <Select
                                                            styles={{
                                                                menu: (
                                                                    provided
                                                                ) => ({
                                                                    ...provided,
                                                                    zIndex: 1000000,
                                                                }),
                                                                singleValue: (
                                                                    provided
                                                                ) => ({
                                                                    ...provided,
                                                                    color: '#718196',
                                                                }),
                                                                control: (
                                                                    base,
                                                                    state
                                                                ) => ({
                                                                    ...base,
                                                                    minHeight: 40,
                                                                    border: '1px solid #E2E8F0',
                                                                    transition:
                                                                        '0.3s',
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
                                                                    primary:
                                                                        '#3082CE',
                                                                },
                                                            })}
                                                            value={{
                                                                label: filter.columnLabel,
                                                                value: filter.columnValue,
                                                            }}
                                                            onChange={(
                                                                value: any
                                                            ) => {
                                                                var temp = [
                                                                    ...filters,
                                                                ];
                                                                temp[
                                                                    index
                                                                ].columnValue =
                                                                    value.value;
                                                                temp[
                                                                    index
                                                                ].columnLabel =
                                                                    value.label;
                                                                temp[
                                                                    index
                                                                ].type =
                                                                    value.type;
                                                                temp[
                                                                    index
                                                                ].filter =
                                                                    'exact';
                                                                var tv: any =
                                                                    [];
                                                                switch (
                                                                    value.type
                                                                ) {
                                                                    case 'string':
                                                                        tv = [
                                                                            '',
                                                                        ];
                                                                        break;
                                                                    case 'number':
                                                                        if (
                                                                            temp[
                                                                                index
                                                                            ]
                                                                                .filter ===
                                                                            'exact'
                                                                        ) {
                                                                            tv =
                                                                                [
                                                                                    0,
                                                                                ];
                                                                        } else {
                                                                            tv =
                                                                                [
                                                                                    0,
                                                                                    0,
                                                                                ];
                                                                        }
                                                                        break;
                                                                    case 'date':
                                                                        if (
                                                                            temp[
                                                                                index
                                                                            ]
                                                                                .filter ===
                                                                            'exact'
                                                                        ) {
                                                                            tv =
                                                                                [
                                                                                    new Date(),
                                                                                ];
                                                                        } else {
                                                                            tv =
                                                                                [
                                                                                    new Date(),
                                                                                    new Date(),
                                                                                ];
                                                                        }
                                                                }
                                                                temp[
                                                                    index
                                                                ].selectedValues =
                                                                    tv;
                                                                setFilters(
                                                                    temp
                                                                );
                                                            }}
                                                            classNamePrefix="select"
                                                            isClearable={false}
                                                            name="color"
                                                            // options={displayedColumns}
                                                            options={projectsTableColumns
                                                                .filter(
                                                                    (
                                                                        cell: any
                                                                    ) =>
                                                                        cell
                                                                            .dataKey[0] !==
                                                                        '_'
                                                                )
                                                                .map(
                                                                    (
                                                                        cell: any
                                                                    ) => {
                                                                        return {
                                                                            label: `${cell.title} (${cell.group})`,
                                                                            value: cell.dataKey,
                                                                            type: cell.type
                                                                                ? cell.type
                                                                                : 'text',
                                                                        };
                                                                    }
                                                                )}
                                                        />
                                                    </Box>
                                                    <Box w="100%">
                                                        <Text mb="8px">
                                                            Type
                                                        </Text>
                                                        <Input
                                                            onChange={() => {}}
                                                            value={filter.type}
                                                            readOnly
                                                        />
                                                    </Box>
                                                    <Box w="100%">
                                                        <Text mb="8px">
                                                            Filter
                                                        </Text>
                                                        <Select
                                                            styles={{
                                                                menu: (
                                                                    provided
                                                                ) => ({
                                                                    ...provided,
                                                                    zIndex: 1000000,
                                                                }),
                                                                singleValue: (
                                                                    provided
                                                                ) => ({
                                                                    ...provided,
                                                                    color: '#718196',
                                                                }),
                                                                control: (
                                                                    base,
                                                                    state
                                                                ) => ({
                                                                    ...base,
                                                                    minHeight: 40,
                                                                    border: '1px solid #E2E8F0',
                                                                    transition:
                                                                        '0.3s',
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
                                                                    primary:
                                                                        '#3082CE',
                                                                },
                                                            })}
                                                            value={{
                                                                label:
                                                                    filter.filter
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase() +
                                                                    filter.filter.slice(
                                                                        1
                                                                    ),
                                                                value: filter.filter,
                                                            }}
                                                            onChange={(
                                                                value: any
                                                            ) => {
                                                                var temp = [
                                                                    ...filters,
                                                                ];
                                                                temp[
                                                                    index
                                                                ].filter =
                                                                    value.value;
                                                                setFilters(
                                                                    temp
                                                                );
                                                            }}
                                                            classNamePrefix="select"
                                                            isClearable={false}
                                                            name="filter"
                                                            options={
                                                                filterTypes[
                                                                    filter.type as keyof typeof filterTypes
                                                                ]
                                                            }
                                                        />
                                                    </Box>
                                                </Stack>
                                            </Box>
                                            <Stack
                                                direction={{
                                                    base: 'column',
                                                    xl: 'row',
                                                }}
                                                w="100%"
                                                spacing={{
                                                    base: '20px',
                                                    xl: '50px',
                                                }}
                                            >
                                                <Box w="100%">
                                                    <Text mb="8px">Values</Text>
                                                    {valuesField}
                                                </Box>
                                            </Stack>
                                        </VStack>
                                    </Box>
                                );
                            })}
                            <IconButton
                                onClick={() => {
                                    setFilters([
                                        ...filters,
                                        {
                                            columnValue: '',
                                            columnLabel: '',
                                            type: '',
                                            filter: 'exact',
                                            values: [],
                                            selectedValues: [],
                                        } as FilterField,
                                    ]);
                                }}
                                my={5}
                                float="right"
                                variant="outline"
                                aria-label="add-port"
                                icon={<BiPlusMedical />}
                            />
                        </Box>
                    </Box>
                </VStack>
            </Box>
        </div>
    );
}

export default SubmissionsTable;
