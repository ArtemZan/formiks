import { Column } from 'react-base-table';
import { RiUserFill } from 'react-icons/ri';
import { toast } from 'react-toastify';
import { RestAPI } from '../../../api/rest';
import EditableTableCell from '../../../components/EditableTableCell'
import Toast, { ToastType } from '../../../components/Toast';
import { NumberWithCommas } from '../../../utils/Numbers';

export const getProjectColumns = (
    columnWidth: Function,
    visibilityController: Function,
    handleCellUpdate: Function,
    loadOptions: Function,
    userRoles: string[],
    totalCostAmountLC: number,
    InternationalVendorsNames: any[],
    VendorsNames: any[],
    totalCostAmount: number,
    totalIncomeInTool: number,
    totalIncomeAmountLC: number,
    totalIncomeAmount: number,
    totalCostAmountCostGL: number,
    totalCostAmountLCCostGL: number,
    totalCostsInTool: number,
    totalIncomeAmountLCIncomeGL: number,
    totalIncomeAmountIncomeGL: number,
    totalProfitInToolLC: number,
    totalCostsInToolEUR: number,
    totalIncomeInToolEUR: number,
    totalLossInToolLC: number,
    totalProfitInToolEUR: number,
    totalLossInToolEUR: number,
    setRejectedSubmission: Function
) => {
    function projectColumnEdit(value: any) {
        if (
            value.data.status === '' ||
            value.data.status === 'INCOMPLETE' ||
            value.data.status === 'NEW' ||
            value.data.status === 'Incomplete' ||
            value.data.status === 'New' ||
            value.data.status === 'REJECTED' ||
            value.data.status === 'Rejected'
        ) {
            return false;
        } else {
            return true;
        }
    }


    function callSap(submissionId: string) {
        RestAPI.callSapSubmission(submissionId)
            .then((response) => {
                var message = `Order ${response.data.IntOrderOut.EX_ORDERID} has been successfully created`;
                var type: ToastType = 'success';
                switch (response.data.IntOrderOut.EX_SUBRC) {
                    case 4:
                        message = `Order ${response.data.IntOrderOut.EX_ORDERID} already exists`;
                        type = 'error';
                        break;
                    case 0:
                        message = `Order ${response.data.IntOrderOut.EX_ORDERID} created in SAP`;
                        break;
                }
                toast(
                    <Toast
                        title={'SAP Response'}
                        message={message}
                        type={type}
                    />
                );

                if (type === 'success') {
                    handleCellUpdate(submissionId, 'data.status', 'Created');
                }
            })
            .catch((error) => {
                toast(
                    <Toast
                        title={'SAP Response'}
                        message={
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: 'Failed to create order',
                                }}
                            />
                        }
                        type={'error'}
                    />
                );
            });
    }


    return [
        {
            key: '__expand',
            dataKey: '__expand',
            title: '',
            width: 50,
            frozen: Column.FrozenDirection.LEFT,
            resizable: false,
            cellRenderer: (props: any) => {
                if (props.rowData.parentId !== null) {
                    return (
                        <div
                            style={{
                                marginTop: 0,
                                marginLeft: 0,
                                position: 'absolute',
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
            key: 'data.companyCode',
            dataKey: 'data.companyCode',
            title: 'Company Code',
            header: 'General Information',
            group: 'General Information',
            width: columnWidth('data.companyCode', 150),
            resizable: true,
            hidden: visibilityController(
                'generalInformation',
                'data.companyCode'
            ),
            type: 'string',
            // className: "dark-green-3-border",
            cellRenderer: (props: any) => (
                <EditableTableCell
                    readonly={true}
                    type={'text'}
                    backgroundColor="#f4fcf9"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.projectNumber',
            dataKey: 'data.projectNumber',
            title: 'Project Number',
            width: columnWidth('data.projectNumber', 150),
            resizable: true,
            group: 'General Information',

            hidden: visibilityController(
                'generalInformation',
                'data.projectNumber'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    readonly={true}
                    type={'text'}
                    backgroundColor="#f4fcf9"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.localProjectNumber',
            dataKey: 'data.localProjectNumber',
            title: 'Local Project Number',
            width: columnWidth('data.localProjectNumber', 150),
            resizable: true,
            group: 'General Information',

            hidden: visibilityController(
                'generalInformation',
                'data.localProjectNumber'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    readonly={true}
                    type={'text'}
                    backgroundColor="#f4fcf9"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.projectName',
            dataKey: 'data.projectName',
            title: 'Project Name',
            width: columnWidth('data.projectName', 200),
            resizable: true,
            group: 'General Information',

            hidden: visibilityController(
                'generalInformation',
                'data.projectName'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f4fcf9"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.campaignStartDate',
            dataKey: 'data.campaignStartDate',
            title: 'Campaign Start Date',
            group: 'General Information',

            width: columnWidth('data.campaignStartDate', 200),
            resizable: true,
            hidden: visibilityController(
                'generalInformation',
                'data.campaignStartDate'
            ),
            type: 'date',
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'date'}
                    readonly={true}
                    backgroundColor="#f4fcf9"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.campaignEndDate',
            dataKey: 'data.campaignEndDate',
            title: 'Campaign End Date',
            group: 'General Information',

            width: columnWidth('data.campaignEndDate', 200),
            resizable: true,
            hidden: visibilityController(
                'generalInformation',
                'data.campaignEndDate'
            ),
            type: 'date',
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'date'}
                    readonly={true}
                    backgroundColor="#f4fcf9"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.projectType',
            dataKey: 'data.projectType',
            title: 'Project Type/Purchase Order',
            group: 'General Information',

            width: columnWidth('data.projectType', 250),
            resizable: true,
            hidden: visibilityController(
                'generalInformation',
                'data.projectType'
            ),
            type: 'dropdown',
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'dropdown'}
                    readonly={true}
                    backgroundColor="#f4fcf9"
                    onUpdate={handleCellUpdate}
                    loadOptions={loadOptions}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'author',
            dataKey: 'author',
            title: 'Author',
            group: 'General Information',
            width: columnWidth('author', 250),
            resizable: true,
            hidden: visibilityController('generalInformation', 'author'),
            type: 'text',
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f4fcf9"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.status',
            dataKey: 'data.status',
            title: 'Status',
            group: 'General Information',
            width: columnWidth('data.status', 250),
            resizable: true,
            hidden: visibilityController('generalInformation', 'data.status'),
            type: 'text',
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f4fcf9"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.country',
            dataKey: 'data.country',
            title: 'Countries EMEA',
            header: 'Project Information',
            width: columnWidth('data.country', 250),
            resizable: true,
            group: 'Project Information',

            hidden: visibilityController('projectInformation', 'data.country'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.countryCodeEMEA',
            dataKey: 'data.countryCodeEMEA',
            title: 'Country Code EMEA',
            width: columnWidth('data.countryCodeEMEA', 250),
            resizable: true,
            group: 'Project Information',

            hidden: visibilityController(
                'projectInformation',
                'data.countryCodeEMEA'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.parentProjectNumber',
            dataKey: 'data.parentProjectNumber',
            title: 'Parent Project Number',
            width: columnWidth('data.parentProjectNumber', 250),
            resizable: true,
            group: 'Project Information',

            hidden: visibilityController(
                'projectInformation',
                'data.parentProjectNumber'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        //
        {
            key: 'data.countryShare',
            dataKey: 'data.countryShare',
            title: '% Country Share',
            width: columnWidth('data.countryShare', 200),
            resizable: true,
            group: 'Project Information',
            type: 'number',
            hidden: visibilityController(
                'projectInformation',
                'data.countryShare'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.countryBudgetContributionCC',
            dataKey: 'data.countryBudgetContributionCC',
            title: 'Country Budget Contribution (CC)',
            width: columnWidth('data.countryBudgetContributionCC', 250),
            resizable: true,
            group: 'Project Information',
            type: 'number',
            hidden: visibilityController(
                'projectInformation',
                'data.countryBudgetContributionCC'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.countryCostEstimationCC',
            dataKey: 'data.countryCostEstimationCC',
            title: 'Country Cost Estimation (CC)',
            width: columnWidth('data.countryCostEstimationCC', 250),
            resizable: true,
            group: 'Project Information',
            type: 'number',
            hidden: visibilityController(
                'projectInformation',
                'data.countryCostEstimationCC'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        // {
        //   key: "data.manufacturerNumber",
        //   dataKey: "data.manufacturerNumber",
        //   title: "Manufacturer Number",
        //   group: "Project Information",

        //   width: columnWidth("data.manufacturerNumber", 200),
        //   resizable: true,
        //   hidden: visibilityController(
        //     "projectInformation",
        //     "data.manufacturerNumber"
        //   ),
        //   cellRenderer: (props: any) => (
        //     <EditableTableCell
        //       type={"text"}
        //       readonly={props.rowData.data.status !== "Incomplete"}
        //       backgroundColor={
        //         props.rowData.data.status === "Incomplete"
        //           ? props.cellData && props.cellData.length > 0
        //             ? "#f5faef"
        //             : "#f7cdd6"
        //           : "#f5faef"
        //       }
        //       onUpdate={handleCellUpdate}
        //       rowIndex={props.rowIndex}
        //       columnKey={props.column.dataKey}
        //       rowData={props.rowData}
        //       initialValue={props.cellData}
        //     />
        //   ),
        // },
        {
            key: 'data.manufacturerNumber',
            dataKey: 'data.manufacturerNumber',
            title: 'Manufacturer Number',
            group: 'Project Information',
            type: 'text',
            width: columnWidth('data.manufacturerNumber', 200),
            resizable: true,
            hidden: visibilityController(
                'projectInformation',
                'data.manufacturerNumber'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'value-dropdown'}
                    readonly={
                        projectColumnEdit(props.rowData) ||
                        !(
                            userRoles.includes('Administrator') ||
                            userRoles.includes('Accounting')
                        )
                    }
                    // readonly={true}
                    loadOptions={() => {
                        return props.rowData.data.companyCode === '1550'
                            ? InternationalVendorsNames
                            : VendorsNames;
                    }}
                    backgroundColor={
                        props.rowData.data.status === 'Incomplete'
                            ? props.cellData && props.cellData.length > 0
                                ? '#f5faef'
                                : '#f7cdd6'
                            : '#f5faef'
                    }
                    onUpdate={(id: string, path: string, value: any) => {
                        if (value === '') {
                            handleCellUpdate(id, 'data.status', 'Incomplete');
                        }
                        if (typeof value === 'object') {
                            handleCellUpdate(id, 'data.status', 'New');
                            handleCellUpdate(id, path, value.hersteller);
                            toast(
                                <Toast
                                    title={'Vendor name was changed!'}
                                    message={
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html:
                                                    'Vendor name was changed from <b>' +
                                                    props.rowData.data
                                                        .vendorName +
                                                    '</b> to <b>' +
                                                    value.manufacturerName +
                                                    '</b> Please check the vendor number and the vendor name.',
                                            }}
                                        />
                                    }
                                    type={'warning'}
                                />
                            );
                            handleCellUpdate(
                                id,
                                'data.vendorName',
                                value.manufacturerName
                            );

                            handleCellUpdate(
                                id,
                                'data.debitorNumber',
                                value.debitorischer
                            );
                        } else {
                            handleCellUpdate(id, path, '');
                            handleCellUpdate(id, 'data.debitorNumber', '');
                        }
                    }}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.vendorName',
            dataKey: 'data.vendorName',
            group: 'Project Information',

            title: 'Vendor Name',
            width: columnWidth('data.vendorName', 200),
            resizable: true,
            hidden: visibilityController(
                'projectInformation',
                'data.vendorName'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'dropdown'}
                    readonly={true}
                    loadOptions={loadOptions}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.debitorNumber',
            dataKey: 'data.debitorNumber',
            title: 'SAP Debitor Number',
            group: 'Project Information',

            width: columnWidth('data.debitorNumber', 200),
            resizable: true,
            hidden: visibilityController(
                'projectInformation',
                'data.debitorNumber'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={
                        props.rowData.data.status !== 'Incomplete' ||
                        !(
                            userRoles.includes('Administrator') ||
                            userRoles.includes('Accounting')
                        )
                    }
                    backgroundColor={
                        props.rowData.data.status === 'Incomplete'
                            ? props.cellData && props.cellData.length > 0
                                ? '#f5faef'
                                : '#f7cdd6'
                            : '#f5faef'
                    }
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        // {
        //   key: "data.creditorNumber",
        //   dataKey: "data.creditorNumber",
        //   group: "Project Information",

        //   title: "SAP Creditor Number",
        //   width: columnWidth("data.creditorNumber", 200),
        //   resizable: true,
        //   hidden: visibilityController("projectInformation", "data.creditorNumber"),
        //   cellRenderer: (props: any) => (
        //     <EditableTableCell
        //       type={"text"}
        //       readonly={props.rowData.data.status !== "Incomplete"}
        //       backgroundColor={
        //         props.rowData.data.status === "Incomplete"
        //           ? props.cellData && props.cellData.length > 0
        //             ? "#f5faef"
        //             : "#f7cdd6"
        //           : "#f5faef"
        //       }
        //       onUpdate={handleCellUpdate}
        //       rowIndex={props.rowIndex}
        //       columnKey={props.column.dataKey}
        //       rowData={props.rowData}
        //       initialValue={props.cellData}
        //     />
        //   ),
        // },
        {
            key: 'data.budgetSource',
            dataKey: 'data.budgetSource',
            title: 'Budget Source',
            width: columnWidth('data.budgetSource', 200),
            resizable: true,
            group: 'Project Information',

            hidden: visibilityController(
                'projectInformation',
                'data.budgetSource'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'dropdown'}
                    readonly={true}
                    loadOptions={loadOptions}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.vendorBudgetCurrency',
            dataKey: 'data.vendorBudgetCurrency',
            title: 'Vendor Budget Currency',
            width: columnWidth('data.vendorBudgetCurrency', 200),
            group: 'Project Information',

            resizable: true,
            hidden: visibilityController(
                'projectInformation',
                'data.vendorBudgetCurrency'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'dropdown'}
                    readonly={true}
                    loadOptions={loadOptions}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.vendorAmount',
            dataKey: 'data.vendorAmount',
            group: 'Project Information',

            title: 'Vendor Amount',
            type: 'number',
            width: columnWidth('data.vendorAmount', 200),
            resizable: true,
            hidden: visibilityController(
                'projectInformation',
                'data.vendorAmount'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.campaignCurrency',
            dataKey: 'data.campaignCurrency',
            title: 'Campaign Currency',
            width: columnWidth('data.campaignCurrency', 200),
            group: 'Project Information',

            resizable: true,
            hidden: visibilityController(
                'projectInformation',
                'data.campaignCurrency'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'dropdown'}
                    readonly={true}
                    loadOptions={loadOptions}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.estimatedIncomeCC',
            group: 'Project Information',

            dataKey: 'data.estimatedIncomeCC',
            title: 'Estimated Income (CC)',
            type: 'number',
            width: columnWidth('data.estimatedIncomeCC', 200),
            resizable: true,
            hidden: visibilityController(
                'projectInformation',
                'data.estimatedIncomeCC'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.estimatedCostsCC',
            group: 'Project Information',

            dataKey: 'data.estimatedCostsCC',
            title: 'Estimated Costs (CC)',
            type: 'number',
            width: columnWidth('data.estimatedCostsCC', 200),
            resizable: true,
            hidden: visibilityController(
                'projectInformation',
                'data.estimatedCostsCC'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        //
        {
            key: 'data.estimatedResultCC',
            dataKey: 'data.estimatedResultCC',
            title: 'Estimated Result (CC)',
            type: 'number',
            group: 'Project Information',

            width: columnWidth('data.estimatedResultCC', 200),
            resizable: true,
            hidden: visibilityController(
                'projectInformation',
                'data.estimatedResultCC'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.estimatedIncomeEUR',
            dataKey: 'data.estimatedIncomeEUR',
            title: 'Estimated Income (EUR)',
            group: 'Project Information',
            type: 'number',
            width: columnWidth('data.estimatedIncomeEUR', 200),
            resizable: true,
            hidden: visibilityController(
                'projectInformation',
                'data.estimatedIncomeEUR'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.estimatedCostsEUR',
            dataKey: 'data.estimatedCostsEUR',
            title: 'Estimated Costs (EUR)',
            group: 'Project Information',
            type: 'number',
            width: columnWidth('data.estimatedCostsEUR', 200),
            resizable: true,
            hidden: visibilityController(
                'projectInformation',
                'data.estimatedCostsEUR'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.estimatedResultEUR',
            dataKey: 'data.estimatedResultEUR',
            title: 'Estimated Result (EUR)',
            width: columnWidth('data.estimatedResultEUR', 200),
            group: 'Project Information',
            type: 'number',
            resizable: true,
            hidden: visibilityController(
                'projectInformation',
                'data.estimatedResultEUR'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.vendorShare',
            dataKey: 'data.vendorShare',
            title: '% Vendor Share',
            group: 'Project Information',
            type: 'number',
            width: columnWidth('data.vendorShare', 200),
            resizable: true,
            hidden: visibilityController(
                'projectInformation',
                'data.vendorShare'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.businessUnit',
            dataKey: 'data.businessUnit',
            group: 'Project Information',
            type: 'text',
            title: 'Business Unit',
            width: columnWidth('data.businessUnit', 200),
            resizable: true,
            hidden: visibilityController(
                'projectInformation',
                'data.businessUnit'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.PH1',
            dataKey: 'data.PH1',
            title: 'PH1',
            width: columnWidth('data.PH1', 200),
            group: 'Project Information',

            resizable: true,
            hidden: true, //visibilityController("projectInformation", "data.PH1"),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.campaignChannel',
            dataKey: 'data.campaignChannel',
            title: 'Campaign Channel',
            width: columnWidth('data.campaignChannel', 200),
            resizable: true,
            group: 'Project Information',

            hidden: visibilityController(
                'projectInformation',
                'data.campaignChannel'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.targetAudience',
            dataKey: 'data.targetAudience',
            title: 'Target Audience',
            group: 'Project Information',

            width: columnWidth('data.targetAudience', 200),
            resizable: true,
            hidden: true,
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.marketingResponsible',
            group: 'Project Information',
            dataKey: 'data.marketingResponsible',
            title: 'Marketing Responsible',
            width: columnWidth('data.marketingResponsible', 200),
            resizable: true,
            hidden: true,
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.projectApprover',
            dataKey: 'data.projectApprover',
            group: 'Project Information',
            title: 'Project Approver',
            width: columnWidth('data.projectApprover', 200),
            resizable: true,
            hidden: true,
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.additionalInformation',
            dataKey: 'data.additionalInformation',
            title: 'Additional Information',
            group: 'Project Information',

            width: columnWidth('data.additionalInformation', 200),
            resizable: true,
            hidden: visibilityController(
                'projectInformation',
                'data.additionalInformation'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f5faef"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.purchaseOrderServiceProvider',
            dataKey: 'data.purchaseOrderServiceProvider',
            title: 'Purchase Order Service Provider',
            group: 'Purchase Order',
            type: 'text',
            header: 'Purchase Order',
            width: columnWidth('data.purchaseOrderServiceProvider', 200),
            resizable: true,
            hidden: visibilityController(
                'purchaseOrder',
                'data.purchaseOrderServiceProvider'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#fff7f1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.vendorNamePO',
            dataKey: 'data.vendorNamePO',
            title: 'Vendor Name',
            group: 'Purchase Order',

            width: columnWidth('data.vendorNamePO', 200),
            resizable: true,
            hidden: visibilityController('purchaseOrder', 'data.vendorNamePO'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'multiple-dropdown'}
                    readonly={true}
                    backgroundColor="#fff7f1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.netValueOfServiceOrderedLC',
            dataKey: 'data.netValueOfServiceOrderedLC',
            group: 'Purchase Order',
            type: 'number',
            title: 'Net Value of Service Ordered (LC)',
            width: columnWidth('data.netValueOfServiceOrderedLC', 200),
            resizable: true,
            hidden: visibilityController(
                'purchaseOrder',
                'data.netValueOfServiceOrderedLC'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#fff7f1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.localCurrency',
            dataKey: 'data.localCurrency',
            title: 'Local Currency (LC)',
            group: 'Purchase Order',

            width: columnWidth('data.localCurrency', 200),
            resizable: true,
            hidden: visibilityController('purchaseOrder', 'data.localCurrency'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#fff7f1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.netValuePOC',
            dataKey: 'data.netValuePOC',
            title: 'Net Value (Purchase Order Currency)',
            width: columnWidth('data.netValuePOC', 200),
            group: 'Purchase Order',
            type: 'number',
            resizable: true,
            hidden: visibilityController('purchaseOrder', 'data.netValuePOC'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#fff7f1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.purchaseOrderCurrency',
            dataKey: 'data.purchaseOrderCurrency',
            title: 'Purchase Order Currency',
            width: columnWidth('data.purchaseOrderCurrency', 200),
            group: 'Purchase Order',

            resizable: true,
            hidden: visibilityController(
                'purchaseOrder',
                'data.purchaseOrderCurrency'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#fff7f1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.netValueEur',
            dataKey: 'data.netValueEur',
            title: 'Net Value (EUR)',
            width: columnWidth('data.netValueEur', 200),
            group: 'Purchase Order',
            type: 'number',
            resizable: true,
            hidden: visibilityController('purchaseOrder', 'data.netValueEur'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#fff7f1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.purchaseOrderStatus',
            dataKey: 'data.purchaseOrderStatus',
            title: 'Purchase Order Status',
            group: 'Purchase Order',
            type: 'dropdown',
            width: columnWidth('data.purchaseOrderStatus', 200),
            resizable: true,
            hidden: visibilityController(
                'purchaseOrder',
                'data.purchaseOrderStatus'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'dropdown'}
                    readonly={
                        props.rowData.data.projectType !== 'Purchase Order' &&
                        (!userRoles.includes('Accounting') ||
                            !userRoles.includes('Administrator'))
                    }
                    loadOptions={loadOptions}
                    backgroundColor="#fff7f1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.yearMonth',
            dataKey: 'data.yearMonth',
            title: 'Year / Month',
            header: 'Cost Invoices',
            group: 'Cost Invoices',

            width: columnWidth('data.yearMonth', 200),
            resizable: true,
            hidden: visibilityController('costInvoices', 'data.yearMonth'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.documentType',
            dataKey: 'data.documentType',
            title: 'Document Type',
            width: columnWidth('data.documentType', 200),
            group: 'Cost Invoices',
            type: 'text',
            resizable: true,
            hidden: visibilityController('costInvoices', 'data.documentType'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.postingDate',
            dataKey: 'data.postingDate',
            title: 'Posting Date',
            width: columnWidth('data.postingDate', 200),
            group: 'Cost Invoices',
            type: 'date',
            resizable: true,
            hidden: visibilityController('costInvoices', 'data.postingDate'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'date'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.documentDate',
            dataKey: 'data.documentDate',
            title: 'Document Date',
            group: 'Cost Invoices',
            type: 'date',
            width: columnWidth('data.documentDate', 200),
            resizable: true,
            hidden: visibilityController('costInvoices', 'data.documentDate'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'date'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.documentNumber',
            dataKey: 'data.documentNumber',
            title: 'Document Number',
            width: columnWidth('data.documentNumber', 200),
            resizable: true,
            group: 'Cost Invoices',
            type: 'text',
            hidden: visibilityController('costInvoices', 'data.documentNumber'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.invoiceNumber',
            dataKey: 'data.invoiceNumber',
            title: 'Invoice Number',
            width: columnWidth('data.invoiceNumber', 200),
            group: 'Cost Invoices',
            type: 'text',
            resizable: true,
            hidden: visibilityController('costInvoices', 'data.invoiceNumber'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={props.rowData.data.budgetSource === 'No budget'}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.costAccount',
            dataKey: 'data.costAccount',
            title: 'Cost Account',
            width: columnWidth('data.costAccount', 200),
            resizable: true,
            group: 'Cost Invoices',
            type: 'text',
            hidden: visibilityController('costInvoices', 'data.costAccount'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.name1',
            dataKey: 'data.name1',
            title: 'Invoice Supplier',
            width: columnWidth('data.name1', 200),
            group: 'Cost Invoices',
            type: 'text',
            resizable: true,
            hidden: visibilityController('costInvoices', 'data.name1'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.costAmountLC',
            dataKey: 'data.costAmountLC',
            title: 'Cost Amount (LC)',
            width: columnWidth('data.costAmountLC', 200),
            group: 'Cost Invoices',
            type: 'number',
            resizable: true,
            hidden: visibilityController('costInvoices', 'data.costAmountLC'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    bold={props.rowData.parentId === null}
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(totalCostAmountLC)}`
                            : props.cellData
                    }
                />
            ),
        },
        {
            key: 'data.costAmountDC',
            dataKey: 'data.costAmountDC',
            title: 'Cost Amount (DC)',
            group: 'Cost Invoices',
            type: 'number',
            width: columnWidth('data.costAmountDC', 200),
            resizable: true,
            hidden: visibilityController('costInvoices', 'data.costAmountDC'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.dc',
            dataKey: 'data.dc',
            title: 'Document Currency (DC)',
            width: columnWidth('data.dc', 200),
            resizable: true,
            group: 'Cost Invoices',
            type: 'text',
            hidden: visibilityController('costInvoices', 'data.dc'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.costAmountEUR',
            dataKey: 'data.cosTotal Loss (EUR)AmountEUR',
            title: 'Cost Amount (EUR)',
            width: columnWidth('data.costAmountEUR', 200),
            resizable: true,
            group: 'Cost Invoices',
            type: 'number',
            hidden: visibilityController('costInvoices', 'data.costAmountEUR'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    backgroundColor="#f2fcfc"
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(totalCostAmount)}`
                            : props.cellData
                    }
                />
            ),
        },
        // {
        //   key: "data.costStatus",
        //   dataKey: "data.costStatus",
        //   title: "Cost Status",
        //   width: columnWidth("data.costStatus", 200),
        //   resizable: true,
        //   group: "Cost Invoices",
        //   type: "dropdown",
        //   hidden: visibilityController("costInvoices", "data.costStatus"),
        //   cellRenderer: (props: any) => (
        //     <EditableTableCell
        //       type={"dropdown"}
        //       loadOptions={loadOptions}
        //       backgroundColor="#f2fcfc"
        //       onUpdate={handleCellUpdate}
        //       rowIndex={props.rowIndex}
        //       columnKey={props.column.dataKey}
        //       rowData={props.rowData}
        //       initialValue={props.cellData}
        //     />
        //   ),
        // },
        {
            key: 'data.yearMonthSI',
            dataKey: 'data.yearMonthSI',
            title: 'Year / Month',
            width: columnWidth('data.yearMonthSI', 200),
            group: 'Sales Invoices',
            type: 'text',
            header: 'Sales Invoices',
            resizable: true,
            hidden: visibilityController('salesInvoices', 'data.yearMonthSI'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#fff7f8"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.documentTypeSI',
            dataKey: 'data.documentTypeSI',
            title: 'Document Type',
            width: columnWidth('data.documentTypeSI', 200),
            group: 'Sales Invoices',
            type: 'text',
            resizable: true,
            hidden: visibilityController(
                'salesInvoices',
                'data.documentTypeSI'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#fff7f8"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.postingDateSI',
            dataKey: 'data.postingDateSI',
            title: 'Posting Date',
            width: columnWidth('data.postingDateSI', 200),
            group: 'Sales Invoices',
            type: 'date',
            resizable: true,
            hidden: visibilityController('salesInvoices', 'data.postingDateSI'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'date'}
                    readonly={true}
                    backgroundColor="#fff7f8"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.documentDateSI',
            dataKey: 'data.documentDateSI',
            title: 'Document Date',
            group: 'Sales Invoices',
            type: 'date',
            width: columnWidth('data.documentDateSI', 200),
            resizable: true,
            hidden: visibilityController(
                'salesInvoices',
                'data.documentDateSI'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'date'}
                    readonly={true}
                    backgroundColor="#fff7f8"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.documentNumberSI',
            group: 'Sales Invoices',
            dataKey: 'data.documentNumberSI',
            title: 'Document Number',
            type: 'text',
            width: columnWidth('data.documentNumberSI', 200),
            resizable: true,
            hidden: visibilityController(
                'salesInvoices',
                'data.documentNumberSI'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#fff7f8"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.invoiceNumberSI',
            dataKey: 'data.invoiceNumberSI',
            group: 'Sales Invoices',
            type: 'text',
            title: 'Invoice Number',
            width: columnWidth('data.invoiceNumberSI', 200),
            resizable: true,
            hidden: visibilityController(
                'salesInvoices',
                'data.invoiceNumberSI'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={props.rowData.data.budgetSource === 'No budget'}
                    backgroundColor="#fff7f8"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.incomeAccountSI',
            dataKey: 'data.incomeAccountSI',
            title: 'Income Account',
            width: columnWidth('data.incomeAccountSI', 200),
            group: 'Sales Invoices',
            type: 'text',
            resizable: true,
            hidden: visibilityController(
                'salesInvoices',
                'data.incomeAccountSI'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#fff7f8"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.name1SI',
            dataKey: 'data.name1SI',
            title: 'Invoice Recipient',
            group: 'Sales Invoices',
            type: 'text',
            width: columnWidth('data.name1SI', 200),
            resizable: true,
            hidden: visibilityController('salesInvoices', 'data.name1SI'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#fff7f8"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.sapNumberSI',
            dataKey: 'data.sapNumberSI',
            title: 'Invoice Recipient Number',
            group: 'Sales Invoices',
            type: 'text',
            width: columnWidth('data.sapNumberSI', 200),
            resizable: true,
            hidden: visibilityController('salesInvoices', 'data.sapNumberSI'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#fff7f8"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },

        {
            key: 'data.incomeAmountLCSI',
            dataKey: 'data.incomeAmountLCSI',
            title: 'Income Amount (LC)',
            group: 'Sales Invoices',
            type: 'number',
            width: columnWidth('data.incomeAmountLCSI', 200),
            resizable: true,
            hidden: visibilityController(
                'salesInvoices',
                'data.incomeAmountLCSI'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#fff7f8"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(totalIncomeAmountLC)}`
                            : props.cellData
                    }
                />
            ),
        },
        {
            key: 'data.incomeAmountDCSI',
            dataKey: 'data.incomeAmountDCSI',
            title: 'Income Amount (DC)',
            group: 'Sales Invoices',
            type: 'number',
            width: columnWidth('data.incomeAmountDCSI', 200),
            resizable: true,
            hidden: visibilityController(
                'salesInvoices',
                'data.incomeAmountDCSI'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#fff7f8"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.dcSI',
            dataKey: 'data.dcSI',
            title: 'Document Currency (DC)',
            width: columnWidth('data.dcSI', 200),
            resizable: true,
            group: 'Sales Invoices',
            type: 'text',
            hidden: visibilityController('salesInvoices', 'data.dcSI'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#fff7f8"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.incomeAmountEURSI',
            dataKey: 'data.incomeAmountEURSI',
            title: 'Income Amount (EUR)',
            width: columnWidth('data.incomeAmountEURSI', 200),
            group: 'Sales Invoices',
            type: 'number',
            resizable: true,
            hidden: visibilityController(
                'salesInvoices',
                'data.incomeAmountEURSI'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#fff7f8"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(totalIncomeAmount)}`
                            : props.cellData
                    }
                />
            ),
        },
        // {
        //   key: "data.invoiceStatusSI",
        //   dataKey: "data.invoiceStatusSI",
        //   title: "Invoice Status (Paid/Not Paid)",
        //   width: columnWidth("data.invoiceStatusSI", 200),
        //   group: "Sales Invoices",
        //   type: "dropdown",
        //   resizable: true,
        //   hidden: visibilityController("salesInvoices", "data.invoiceStatusSI"),
        //   cellRenderer: (props: any) => (
        //     <EditableTableCell
        //       type={"dropdown"}
        //       readonly={userRoles.includes("Administrator") ? false : true}
        //       loadOptions={loadOptions}
        //       backgroundColor="#fff7f8"
        //       onUpdate={handleCellUpdate}
        //       rowIndex={props.rowIndex}
        //       columnKey={props.column.dataKey}
        //       rowData={props.rowData}
        //       initialValue={props.cellData}
        //     />
        //   ),
        // },
        // {
        //   key: "data.activityIdSI",
        //   group: "Sales Invoices",
        //   dataKey: "data.activityIdSI",
        //   title: "Activity ID for Portal Vendors",
        //   width: columnWidth("data.activityIdSI", 200),
        //   resizable: true,
        //   type: "text",
        //   hidden: visibilityController("salesInvoices", "data.activityIdSI"),
        //   cellRenderer: (props: any) => (
        //     <EditableTableCell
        //       type={"text"}
        //       readonly={true}
        //       backgroundColor="#fff7f8"
        //       onUpdate={handleCellUpdate}
        //       rowIndex={props.rowIndex}
        //       columnKey={props.column.dataKey}
        //       rowData={props.rowData}
        //       initialValue={props.cellData}
        //     />
        //   ),
        // },
        // {
        //   key: "data.additionalMarketingInformation",
        //   group: "Sales Invoices",
        //   dataKey: "data.additionalMarketingInformation",
        //   title: "Additional Marketing Information",
        //   type: "text",
        //   width: columnWidth("data.additionalMarketingInformation", 200),
        //   resizable: true,
        //   hidden: visibilityController(
        //     "salesInvoices",
        //     "data.additionalMarketingInformation"
        //   ),
        //   cellRenderer: (props: any) => (
        //     <EditableTableCell
        //       type={"text"}
        //       readonly={true}
        //       backgroundColor="#fff7f8"
        //       onUpdate={handleCellUpdate}
        //       rowIndex={props.rowIndex}
        //       columnKey={props.column.dataKey}
        //       rowData={props.rowData}
        //       initialValue={props.cellData}
        //     />
        //   ),
        // },
        {
            key: 'data.yearMonthCostGL',
            dataKey: 'data.yearMonthCostGL',
            title: 'Year / Month',
            header: 'Cost GL Postings',
            group: 'Cost GL Postings',
            type: 'text',
            width: columnWidth('data.yearMonthCostGL', 200),
            resizable: true,
            hidden: visibilityController(
                'costGlPostings',
                'data.yearMonthCostGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.documentTypeCostGL',
            dataKey: 'data.documentTypeCostGL',
            group: 'Cost GL Postings',
            type: 'text',
            title: 'Document Type',
            width: columnWidth('data.documentTypeCostGL', 200),
            resizable: true,
            hidden: visibilityController(
                'costGlPostings',
                'data.documentTypeCostGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.postingDateCostGL',
            group: 'Cost GL Postings',
            type: 'date',
            dataKey: 'data.postingDateCostGL',
            title: 'Posting Date',
            width: columnWidth('data.postingDateCostGL', 200),
            resizable: true,
            hidden: visibilityController(
                'costGlPostings',
                'data.postingDateCostGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'date'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.documentDateCostGL',
            dataKey: 'data.documentDateCostGL',
            title: 'Document Date',
            width: columnWidth('data.documentDateCostGL', 200),
            group: 'Cost GL Postings',
            type: 'date',
            resizable: true,
            hidden: visibilityController(
                'costGlPostings',
                'data.documentDateCostGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'date'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.documentNumberCostGL',
            dataKey: 'data.documentNumberCostGL',
            title: 'Document Number',
            width: columnWidth('data.documentNumberCostGL', 200),
            group: 'Cost GL Postings',
            type: 'text',
            resizable: true,
            hidden: visibilityController(
                'costGlPostings',
                'data.documentNumberCostGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.textCostGL',
            dataKey: 'data.textCostGL',
            title: 'Text',
            width: columnWidth('data.textCostGL', 200),
            group: 'Cost GL Postings',
            type: 'text',
            resizable: true,
            hidden: visibilityController('costGlPostings', 'data.textCostGL'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.costAccountCostGL',
            dataKey: 'data.costAccountCostGL',
            title: 'Cost Account',
            group: 'Cost GL Postings',
            type: 'text',
            width: columnWidth('data.costAccountCostGL', 200),
            resizable: true,
            hidden: visibilityController(
                'costGlPostings',
                'data.costAccountCostGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.costAmountLCCostGL',
            dataKey: 'data.costAmountLCCostGL',
            title: 'Cost Amount (LC)',
            width: columnWidth('data.costAmountLCCostGL', 200),
            group: 'Cost GL Postings',
            type: 'number',
            resizable: true,
            hidden: visibilityController(
                'costGlPostings',
                'data.costAmountLCCostGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(
                                  totalCostAmountLCCostGL
                              )}`
                            : props.cellData
                    }
                />
            ),
        },
        {
            key: 'data.costAmountDCCostGL',
            dataKey: 'data.costAmountDCCostGL',
            title: 'Cost Amount (DC)',
            width: columnWidth('data.costAmountDCCostGL', 200),
            group: 'Cost GL Postings',
            type: 'number',
            resizable: true,
            hidden: visibilityController(
                'costGlPostings',
                'data.costAmountDCCostGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.dcCostGL',
            dataKey: 'data.dcCostGL',
            title: 'Document Currency (DC)',
            group: 'Cost GL Postings',
            type: 'text',
            width: columnWidth('data.dcCostGL', 200),
            resizable: true,
            hidden: visibilityController('costGlPostings', 'data.dcCostGL'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.costAmountEURCostGL',
            dataKey: 'data.costAmountEURCostGL',
            title: 'Cost Amount (EUR)',
            width: columnWidth('data.costAmountEURCostGL', 200),
            group: 'Cost GL Postings',
            type: 'number',
            resizable: true,
            hidden: visibilityController(
                'costGlPostings',
                'data.costAmountEURCostGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#f2fcfc"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(
                                  totalCostAmountCostGL
                              )}`
                            : props.cellData
                    }
                />
            ),
        },
        {
            key: 'data.yearMonthIncomeGL',
            dataKey: 'data.yearMonthIncomeGL',
            title: 'Year / Month',
            width: columnWidth('data.yearMonthIncomeGL', 200),
            group: 'Income GL Postings',
            type: 'text',
            header: 'Income GL Postings',
            resizable: true,
            hidden: visibilityController(
                'incomeGlPostings',
                'data.yearMonthIncomeGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#FFF7F1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.documentTypeIncomeGL',
            dataKey: 'data.documentTypeIncomeGL',
            title: 'Document Type',
            group: 'Income GL Postings',
            type: 'text',
            width: columnWidth('data.documentTypeIncomeGL', 200),
            resizable: true,
            hidden: visibilityController(
                'incomeGlPostings',
                'data.documentTypeIncomeGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#FFF7F1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.postingDateIncomeGL',
            dataKey: 'data.postingDateIncomeGL',
            title: 'Posting Date',
            group: 'Income GL Postings',
            type: 'date',
            width: columnWidth('data.postingDateIncomeGL', 200),
            resizable: true,
            hidden: visibilityController(
                'incomeGlPostings',
                'data.postingDateIncomeGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'date'}
                    readonly={true}
                    backgroundColor="#FFF7F1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.documentDateIncomeGL',
            dataKey: 'data.documentDateIncomeGL',
            title: 'Document Date',
            group: 'Income GL Postings',
            type: 'date',
            width: columnWidth('data.documentDateIncomeGL', 200),
            resizable: true,
            hidden: visibilityController(
                'incomeGlPostings',
                'data.documentDateIncomeGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'date'}
                    readonly={true}
                    backgroundColor="#FFF7F1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.documentNumberIncomeGL',
            dataKey: 'data.documentNumberIncomeGL',
            group: 'Income GL Postings',
            type: 'text',
            title: 'Document Number',
            width: columnWidth('data.documentNumberIncomeGL', 200),
            resizable: true,
            hidden: visibilityController(
                'incomeGlPostings',
                'data.documentNumberIncomeGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#FFF7F1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.textIncomeGL',
            dataKey: 'data.textIncomeGL',
            group: 'Income GL Postings',
            type: 'text',
            title: 'Text',
            width: columnWidth('data.textIncomeGL', 200),
            resizable: true,
            hidden: visibilityController(
                'incomeGlPostings',
                'data.textIncomeGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#FFF7F1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.incomeAccountIncomeGL',
            dataKey: 'data.incomeAccountIncomeGL',
            group: 'Income GL Postings',
            type: 'text',
            title: 'Income Account',
            width: columnWidth('data.incomeAccountIncomeGL', 200),
            resizable: true,
            hidden: visibilityController(
                'incomeGlPostings',
                'data.incomeAccountIncomeGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#FFF7F1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.incomeAmountLCIncomeGL',
            dataKey: 'data.incomeAmountLCIncomeGL',
            title: 'Income Amount (LC)',
            width: columnWidth('data.incomeAmountLCIncomeGL', 200),
            resizable: true,
            group: 'Income GL Postings',
            type: 'number',
            hidden: visibilityController(
                'incomeGlPostings',
                'data.incomeAmountLCIncomeGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#FFF7F1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(
                                  totalIncomeAmountLCIncomeGL
                              )}`
                            : props.cellData
                    }
                />
            ),
        },
        {
            key: 'data.incomeAmountDCIncomeGL',
            dataKey: 'data.incomeAmountDCIncomeGL',
            title: 'Income Amount (DC)',
            group: 'Income GL Postings',
            type: 'number',
            width: columnWidth('data.incomeAmountDCIncomeGL', 200),
            resizable: true,
            hidden: visibilityController(
                'incomeGlPostings',
                'data.incomeAmountDCIncomeGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    backgroundColor="#FFF7F1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.dcIncomeGL',
            dataKey: 'data.dcIncomeGL',
            title: 'Document Currency (DC)',
            group: 'Income GL Postings',
            type: 'text',
            width: columnWidth('data.dcIncomeGL', 200),
            resizable: true,
            hidden: visibilityController('incomeGlPostings', 'data.dcIncomeGL'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'text'}
                    readonly={true}
                    backgroundColor="#FFF7F1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={props.cellData}
                />
            ),
        },
        {
            key: 'data.incomeAmountEurIncomeGL',
            dataKey: 'data.incomeAmountEurIncomeGL',
            group: 'Income GL Postings',
            type: 'number',
            title: 'Income Amount (EUR)',
            width: columnWidth('data.incomeAmountEurIncomeGL', 200),
            resizable: true,
            hidden: visibilityController(
                'incomeGlPostings',
                'data.incomeAmountEurIncomeGL'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#FFF7F1"
                    onUpdate={handleCellUpdate}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(
                                  totalIncomeAmountIncomeGL
                              )}`
                            : props.cellData
                    }
                />
            ),
        },
        //
        {
            key: 'data.totalIncomeLC',
            dataKey: 'data.totalIncomeLC',
            title: 'Total Income (LC)',
            header: 'Project Results',
            width: columnWidth('data.totalIncomeLC', 200),
            resizable: true,
            group: 'Project Results',
            type: 'number',
            hidden: visibilityController(
                'projectResults',
                'data.totalIncomeLC'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#f9f8f8"
                    onUpdate={() => {}}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(totalIncomeInTool)}`
                            : props.cellData
                    }
                />
            ),
        },
        {
            key: 'data.totalCostsLC',
            dataKey: 'data.totalCostsLC',
            title: 'Total Costs (LC)',
            width: columnWidth('data.totalCostsLC', 200),
            resizable: true,
            group: 'Project Results',
            type: 'number',
            hidden: visibilityController('projectResults', 'data.totalCostsLC'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#f9f8f8"
                    onUpdate={() => {}}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(totalCostsInTool)}`
                            : props.cellData
                    }
                />
            ),
        },
        {
            key: 'data.totalProfitLC',
            dataKey: 'data.totalProfitLC',
            title: 'Total Profit (LC)',
            width: columnWidth('data.totalProfitLC', 200),
            resizable: true,
            group: 'Project Results',
            type: 'number',
            hidden: visibilityController(
                'projectResults',
                'data.totalProfitLC'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#f9f8f8"
                    onUpdate={() => {}}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(totalProfitInToolLC)}`
                            : props.rowData.data.totalIncomeLC +
                                  props.rowData.data.totalCostsLC >=
                              0
                            ? props.rowData.data.totalIncomeLC +
                              props.rowData.data.totalCostsLC
                            : ''
                    }
                />
            ),
        },
        {
            key: 'data.totalLossLC',
            dataKey: 'data.totalLossLC',
            title: 'Total Loss (LC)',
            width: columnWidth('data.totalLossLC', 200),
            resizable: true,
            group: 'Project Results',
            type: 'number',
            hidden: visibilityController('projectResults', 'data.totalLossLC'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#f9f8f8"
                    onUpdate={() => {}}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(
                                  totalLossInToolLC * -1
                              )}`
                            : props.rowData.data.totalIncomeLC +
                                  props.rowData.data.totalCostsLC <
                              0
                            ? (props.rowData.data.totalIncomeLC +
                                  props.rowData.data.totalCostsLC) *
                              -1
                            : ''
                    }
                />
            ),
        },

        {
            key: 'data.totalIncomeEUR',
            dataKey: 'data.totalIncomeEUR',
            title: 'Total Income (EUR)',
            width: columnWidth('data.totalIncomeEUR', 200),
            resizable: true,
            group: 'Project Results',
            type: 'number',
            hidden: visibilityController(
                'projectResults',
                'data.totalIncomeEUR'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#f9f8f8"
                    onUpdate={() => {}}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(totalIncomeInToolEUR)}`
                            : props.cellData
                    }
                />
            ),
        },
        {
            key: 'data.totalCostsEUR',
            dataKey: 'data.totalCostsEUR',
            title: 'Total Costs (EUR)',
            width: columnWidth('data.totalCostsEUR', 200),
            resizable: true,
            group: 'Project Results',
            type: 'number',
            hidden: visibilityController(
                'projectResults',
                'data.totalCostsEUR'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#f9f8f8"
                    onUpdate={() => {}}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(totalCostsInToolEUR)}`
                            : props.cellData
                    }
                />
            ),
        },
        {
            key: 'data.totalProfitEUR',
            dataKey: 'data.totalProfitEUR',
            title: 'Total Profit (EUR)',
            width: columnWidth('data.totalProfitEUR', 200),
            resizable: true,
            group: 'Project Results',
            type: 'number',
            hidden: visibilityController(
                'projectResults',
                'data.totalProfitEUR'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#f9f8f8"
                    onUpdate={() => {}}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        totalIncomeInToolEUR + totalCostsInToolEUR >= 0
                            ? props.rowData.id === 'total'
                                ? `TOTAL: ${NumberWithCommas(
                                      totalProfitInToolEUR
                                  )}`
                                : props.rowData.data.totalIncomeEUR +
                                      props.rowData.data.totalCostsEUR >=
                                  0
                                ? props.rowData.data.totalIncomeEUR +
                                  props.rowData.data.totalCostsEUR
                                : ''
                            : ''
                    }
                />
            ),
        },
        {
            key: 'data.totalLossEUR',
            dataKey: 'data.totalLossEUR',
            title: 'Total Loss (EUR)',
            width: columnWidth('data.totalLossEUR', 200),
            resizable: true,
            group: 'Project Results',
            type: 'number',
            hidden: visibilityController('projectResults', 'data.totalLossEUR'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#f9f8f8"
                    onUpdate={() => {}}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(
                                  totalLossInToolEUR * -1
                              )}`
                            : props.rowData.data.totalIncomeEUR +
                                  props.rowData.data.totalCostsEUR <
                              0
                            ? (props.rowData.data.totalIncomeEUR +
                                  props.rowData.data.totalCostsEUR) *
                              -1
                            : ''
                    }
                />
            ),
        },

        ///
        {
            key: 'data.totalCostsTool',
            dataKey: 'data.totalCostsTool',
            title: 'Total Costs In Tool (LC)',
            width: columnWidth('data.totalCostsTool', 200),
            resizable: true,
            header: 'Control Checks',
            group: 'Control Checks',
            type: 'number',
            hidden: visibilityController(
                'controlChecks',
                'data.totalCostsTool'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#f9f8f8"
                    onUpdate={() => {}}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(
                                  totalCostAmountLC + totalCostAmountLCCostGL
                              )}`
                            : props.cellData
                    }
                />
            ),
        },
        {
            key: 'data.totalCostsSAP',
            dataKey: 'data.totalCostsSAP',
            title: 'Total Costs In SAP (LC)',
            width: columnWidth('data.totalCostsSAP', 200),
            resizable: true,
            group: 'Control Checks',
            type: 'number',
            hidden: visibilityController('controlChecks', 'data.totalCostsSAP'),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#f9f8f8"
                    onUpdate={() => {}}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(
                                  totalCostAmountLC + totalCostAmountLCCostGL
                              )}`
                            : props.rowData.data.totalCostsTool
                    }
                />
            ),
        },
        {
            key: 'data.totalIncomeTool',
            dataKey: 'data.totalIncomeTool',
            title: 'Total Income In Tool (LC)',
            width: columnWidth('data.totalIncomeTool', 200),
            resizable: true,
            group: 'Control Checks',
            type: 'number',
            hidden: visibilityController(
                'controlChecks',
                'data.totalIncomeTool'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#f9f8f8"
                    onUpdate={() => {}}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(
                                  totalIncomeAmountLC +
                                      totalIncomeAmountLCIncomeGL
                              )}`
                            : props.cellData
                    }
                />
            ),
        },
        {
            key: 'data.totalIncomeSAP',
            dataKey: 'data.totalIncomeSAP',
            title: 'Total Income In SAP (LC)',
            width: columnWidth('data.totalIncomeSAP', 200),
            resizable: true,
            group: 'Control Checks',
            type: 'number',
            hidden: visibilityController(
                'controlChecks',
                'data.totalIncomeSAP'
            ),
            cellRenderer: (props: any) => (
                <EditableTableCell
                    type={'number'}
                    readonly={true}
                    bold={props.rowData.parentId === null}
                    backgroundColor="#f9f8f8"
                    onUpdate={() => {}}
                    rowIndex={props.rowIndex}
                    columnKey={props.column.dataKey}
                    rowData={props.rowData}
                    initialValue={
                        props.rowData.id === 'total'
                            ? `TOTAL: ${NumberWithCommas(
                                  totalIncomeAmountLC +
                                      totalIncomeAmountLCIncomeGL
                              )}`
                            : props.rowData.data.totalIncomeTool
                    }
                />
            ),
        },
        ///

        {
            key: '__actions.sap',
            dataKey: '__actions.sap',
            title: 'SAP',
            width: columnWidth('__actions.sap', 100),
            resizable: true,
            header: 'Actions',
            className: 'red-border',
            cellRenderer: (props: any) =>
                props.rowData.parentId === null &&
                props.rowData.data.status !== 'Created' &&
                props.rowData.author !== 'formiks' &&
                props.rowData.id !== 'total' ? (
                    <EditableTableCell
                        type={'button'}
                        readonly={
                            !(
                                (userRoles.includes('Accounting') ||
                                    userRoles.includes('Administrator')) &&
                                props.rowData.data.status === 'New'
                            )
                        }
                        backgroundColor="#fef9fa"
                        textColor={'green'}
                        onUpdate={callSap}
                        rowIndex={props.rowIndex}
                        columnKey={props.column.dataKey}
                        rowData={props.rowData}
                        initialValue={'create'}
                    />
                ) : (
                    <div
                        style={{
                            backgroundColor: '#F7FAFC',
                            width: '100%',
                            height: '100%',
                        }}
                    />
                ),
        },
        {
            key: '__actions.view',
            dataKey: '__actions.view',
            title: 'View',
            width: columnWidth('__actions.view', 100),
            resizable: true,
            className: 'red-border',
            cellRenderer: (props: any) =>
                props.rowData.parentId === null &&
                props.rowData.viewId !== null &&
                props.rowData.author !== 'formiks' &&
                props.rowData.id !== 'total' ? (
                    <EditableTableCell
                        type={'button'}
                        backgroundColor="#fef9fa"
                        textColor={'yellow'}
                        onUpdate={() => {
                            window.open(
                                '/submissions/view/' + props.rowData.viewId,
                                '_blank',
                                'noopener,noreferrer'
                            );
                        }}
                        rowIndex={props.rowIndex}
                        columnKey={props.column.dataKey}
                        rowData={props.rowData}
                        initialValue={'view'}
                    />
                ) : (
                    <div
                        style={{
                            backgroundColor: '#F7FAFC',
                            width: '100%',
                            height: '100%',
                        }}
                    />
                ),
        },
        {
            key: '__actions.viewPO',
            dataKey: '__actions.viewPO',
            title: 'View purchase order',
            width: columnWidth('__actions.viewPO', 100),
            resizable: true,
            className: 'red-border',
            cellRenderer: (props: any) =>
                typeof props.rowData.data.purchaseOrderServiceProvider ===
                    'string' &&
                props.rowData.viewId !== null &&
                props.rowData.author !== 'formiks' &&
                props.rowData.id !== 'total' ? (
                    <EditableTableCell
                        type={'button'}
                        backgroundColor="#fef9fa"
                        textColor={'yellow'}
                        onUpdate={() => {
                            window.open(
                                '/submissions/view/' + props.rowData.viewId,
                                '_blank',
                                'noopener,noreferrer'
                            );
                        }}
                        rowIndex={props.rowIndex}
                        columnKey={props.column.dataKey}
                        rowData={props.rowData}
                        initialValue={'view'}
                    />
                ) : (
                    <div
                        style={{
                            backgroundColor: '#F7FAFC',
                            width: '100%',
                            height: '100%',
                        }}
                    />
                ),
        },
        {
            key: '__actions.reject',
            dataKey: '__actions.reject',
            title: 'Reject',
            width: columnWidth('__actions.reject', 65),
            resizable: true,
            className: 'red-border',
            cellRenderer: (props: any) =>
                props.rowData.parentId === null &&
                props.rowData.data.status !== 'Created' &&
                props.rowData.data.status !== 'Rejected' &&
                props.rowData.author !== 'formiks' &&
                props.rowData.id !== 'total' ? (
                    <EditableTableCell
                        type={'button'}
                        textColor={'red'}
                        readonly={
                            !(
                                userRoles.includes('Accounting') ||
                                userRoles.includes('Administrator')
                            )
                        }
                        backgroundColor="#fef9fa"
                        onUpdate={() => {
                            setRejectedSubmission(props.rowData);
                        }}
                        rowIndex={props.rowIndex}
                        columnKey={props.column.dataKey}
                        rowData={props.rowData}
                        initialValue={'reject'}
                    />
                ) : (
                    <div
                        style={{
                            backgroundColor: '#F7FAFC',
                            width: '100%',
                            height: '100%',
                        }}
                    />
                ),
        },
    ];
};

export const isReadonlyCell = (
    cellType: String,
    userRoles: String[],
    props: any
) => {
    switch (cellType) {
        case 'data.documentNumberCMCT':
            let isEdit = true;

            //TODO Test if this works after updating the value from Self-Invoice number
            if (props.rowData.data.invoiceTypeLMD === 'Internal Invoice') {
                if (!!props.rowData.data.selfInvoiceNumber) {
                    isEdit = true;
                } else {
                    isEdit = false;
                }
            } else {
                isEdit =
                    (props.rowData.data.statusLMD === 'FUTURE INVOICE' ||
                        props.rowData.data.statusLMD === 'OK FOR INVOICING' ||
                        props.rowData.data.statusLMD === 'INVOICED') &&
                    props.rowData.parentId === null;
            }

            return !(
                (userRoles.includes('Accounting') ||
                    userRoles.includes('Administrator')) &&
                isEdit
            );
        default:
            return true;
    }
};
