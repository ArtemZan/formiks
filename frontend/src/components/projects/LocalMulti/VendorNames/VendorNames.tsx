import { useColorModeValue, Box, Text } from '@chakra-ui/react';
import Select from 'react-select';
import { DefaultSelectStyles } from '../../../../utils/Styles';

export default function VendorNames(props: any) {
    const {
        vendorsNames,
        hasErrors,
        vendors,
        setVendorsNames,
        vendorsAfterCompanySelect,
        setVendors,
    } = props;


    const selectHandler = (value: any) => {
        if (value.length < vendors.length) {
            var deletedElem = vendorsNames.filter(
                (n: any) => !value.includes(n)
            );

            deletedElem.forEach((e: any) => {
                vendorsAfterCompanySelect.splice(
                    vendorsAfterCompanySelect.findIndex(
                        (s: any) => s.label === e.label
                    ),
                    1
                );
            });
        }
        setVendorsNames(value);

        if (setVendors) {
            var data: any = [];

            value.forEach((vendor: any) => {
                data.push({
                    vendor: vendor.label,
                    projectManager: vendor.value.alsoMarketingConsultant,
                    creditor: vendor.value.kreditor,
                    debitor: vendor.value.debitorischer,
                    manufacturer: vendor.value.hersteller,
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
        }
    };

    return (
        <Box w="100%">
            <Text mb="8px">Vendor`s Names</Text>
            <Select
                // menuPortalTarget={document.body}
                isMulti
                styles={DefaultSelectStyles(
                    useColorModeValue,
                    hasErrors
                    // inputErrors.includes('vendorName')
                )}
                theme={(theme: any) => ({
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
                    selectHandler(value);
                }}
                classNamePrefix="select"
                isClearable={false}
                name="vendorsName"
                options={vendorsAfterCompanySelect}
            />
        </Box>
    );
}
