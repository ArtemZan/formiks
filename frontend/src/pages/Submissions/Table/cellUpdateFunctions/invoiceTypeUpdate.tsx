const invoiceTypeUpdate = (
    submission: string,
    path: string,
    value: any,
    handleCommunicationCellUpdate: Function,
    checkCountryPrefixEqual: Function,
    props: any
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
}

export default invoiceTypeUpdate;
