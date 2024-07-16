import { useColorModeValue, Box, Text } from '@chakra-ui/react';
import Select from 'react-select';
import { DefaultSelectStyles } from '../../../../utils/Styles';

export default function VendorNames(props: any) {
    const {
        vendorsNames,
        hasErrors,
        vendors,
        VendorsNames,
        setVendorsNames,
        vendorsAfterCompanySelect,
    } = props;

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
                    if (value.length < vendors.length) {
                        var deletedElem = vendorsNames.filter(
                            (n: any) => !value.includes(n)
                        );
                        deletedElem.forEach((e: any) => {
                            VendorsNames.splice(
                                VendorsNames.findIndex(
                                    (s: any) => s.label === e.label
                                ),
                                1
                            );
                        });
                    }
                    setVendorsNames(value);
                }}
                classNamePrefix="select"
                isClearable={false}
                name="vendorsName"
                options={vendorsAfterCompanySelect}
            />
        </Box>
    );
}
