import { toast } from "react-toastify";
import { RestAPI } from "../../../api/rest";
import Toast from "../../../components/Toast";
import { Submission } from "../../../types/submission";


export const alsoProjectNumberUpdate = (
    submission: string,
    path: string,
    value: any,
    handleCommunicationCellUpdate: Function,
    findSubmissionsByPO: Function,
    props: any,
    checkCountryPrefixEqual: Function,
    communicationSubmissions: Submission[]
) => {
    handleCommunicationCellUpdate(
        submission,
        path,
        value
    );
    handleCommunicationCellUpdate(
        submission,
        'data.newLine',
        true
    );
    var vs =
        findSubmissionsByPO(
            value
        );
    
    if (vs.length < 1) {
        handleCommunicationCellUpdate(
            submission,
            'data.vendorLMD',
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
        toast(
            <Toast
                title={
                    'Unknown Project Number'
                }
                message={
                    'Project Number not found'
                }
                type={
                    'error'
                }
            />
        );
    } else {
        if (
            props
                .rowData
                .data
                .newLine
        ) {
            toast(
                <Toast
                    title={
                        'Project Found'
                    }
                    message={
                        'Data copied from project-check amounts and currencies'
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
                        'Project Found'
                    }
                    message={
                        'Data copied from parent project'
                    }
                    type={
                        'success'
                    }
                />
            );
        }

        const {
            equal: countryPrefixEqual,
            country,
            code: companyCode,
        } = checkCountryPrefixEqual(
            value
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

        // RestAPI.getSubmissionWithChildrenByProject(value).then(submission => {
        //     console.log('submission', submission.data)
        // })


        // return;

        console.log('====================================');
        console.log('.rowData.data.vendorLMD', props.rowData.data);
        console.log('====================================');

        var currentVendor =
            '';
            
        if (
            props
                .rowData
                .data
                .vendorLMD ===
            ''
        ) {
            var parent =
                communicationSubmissions.find(
                    ({
                        id,
                    }) =>
                        id ===
                        props
                            .rowData
                            .parentId
                );
            if (
                parent !==
                undefined
            ) {
                currentVendor =
                    parent
                        ?.data
                        .vendorLMD;
            } else {
                currentVendor =
                    '';
            }
        } else {
            currentVendor =
                props
                    .rowData
                    .data
                    .vendorLMD;
        }

        console.log('currentVendor', currentVendor);
        

        if (
            typeof currentVendor ===
            'string'
        ) {
            var valid =
                false;
            vs.forEach(
                (s: any) => {
                    if (
                        s
                            .data
                            .vendorName !==
                        undefined
                    ) {
                        var vendor: string =
                            '';
                        // var vendorBU: string = "";
                        if (
                            currentVendor.includes(
                                'BU'
                            )
                        ) {
                            currentVendor =
                                currentVendor
                                    .toString()
                                    .substring(
                                        0,
                                        currentVendor.toString()
                                            .length -
                                            7
                                    );
                        }
                        if (
                            s.data.vendorName.includes(
                                'BU'
                            )
                        ) {
                            vendor =
                                s.data.vendorName
                                    .toString()
                                    .substring(
                                        0,
                                        s.data.vendorName.toString()
                                            .length -
                                            7
                                    );
                            // vendorBU = s.data.vendorName
                            //   .toString()
                            //   .substring(
                            //     s.data.vendorName.toString()
                            //       .length - 3,
                            //     s.data.vendorName.toString().length
                            //   );
                        } else {
                            vendor =
                                s
                                    .data
                                    .vendorName;
                        }
                        if (
                            currentVendor ===
                            vendor
                        ) {
                            handleCommunicationCellUpdate(
                                submission,
                                'data.vendorLMD',
                                s.data.vendorName.toString()
                            );
                            handleCommunicationCellUpdate(
                                submission,
                                'data.buLMD',
                                s
                                    .data
                                    .businessUnit
                            );
                            handleCommunicationCellUpdate(
                                submission,
                                'data.vodLMD',
                                s
                                    .data
                                    .debitorNumber
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
                                'data.amountLMD',
                                s
                                    .data
                                    .vendorAmount
                            );
                            valid =
                                true;
                        }

                        console.log('currentVendor', currentVendor)
                    }
                }
            );
            if (
                props
                    .rowData
                    .data
                    .vendorLMD ===
                ''
            ) {
                valid =
                    true;
            }
            if (
                !valid
            ) {
                handleCommunicationCellUpdate(
                    submission,
                    'data.vendorLMD',
                    ''
                );
                handleCommunicationCellUpdate(
                    submission,
                    'data.vodLMD',
                    ''
                );
                toast(
                    <Toast
                        title={
                            'Unknown Vendor Selected'
                        }
                        message={
                            'Vendor does not exist under this project'
                        }
                        type={
                            'error'
                        }
                    />
                );
            }
        }
        handleCommunicationCellUpdate(
            submission,
            'data.invoiceTextLMD',
            vs[0].data
                .projectName
        );
        var amount = 0;
        switch (
            vs[0].data
                .projectType
        ) {
            case 'Local One Vendor' ||
                'European One Vendor':
                amount =
                    vs[0]
                        .data
                        .campaignEstimatedIncomeBudgetsCurrency;
                break;
            case 'Local Multi Vendor' ||
                'European Multi Vendor':
                vs.forEach(
                    (
                        s: any
                    ) => {
                        if (
                            !isNaN(
                                s
                                    .data
                                    .vendorBudgetAmount
                            )
                        ) {
                            amount +=
                                Number(
                                    s
                                        .data
                                        .vendorBudgetAmount
                                );
                        }
                    }
                );
                break;
            default:
                amount =
                    NaN;
        }
        if (
            !isNaN(
                amount
            )
        ) {
            handleCommunicationCellUpdate(
                submission,
                'data.amountLMD',
                amount
            );
        }
    }
}