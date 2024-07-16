import { Box, Text } from '@chakra-ui/react';
import Select from 'react-select';
import { RestAPI } from '../../../../api/rest';

const vendorIds = {
    'ALSO International Services GmbH': '636abbd43927f9c7703b19c4',
    'ALSO Schweiz AG': '6391eea09a3d043b9a89d767',
} as const;

type VendorIdKey = keyof typeof vendorIds;

export default function RequestorCompanyName(props: any) {
    const {
        requestorsCompanyName,
        ExchangeRates,
        setLocalExchangeRate,
        setRequestorsCompanyName,
        Companies,
        // setVendorOptions,
        showErrors,
    } = props;

    // const fetchVendors = async (vendorId: string) => {
    //     const res = await RestAPI.getDropdownValues(vendorId);
    //     setVendorOptions(res.data);
    // };

    const onChange = (value: any) => {
        const label = value.label;

        let vendorId = null;

        if (label in vendorIds) {
            vendorId = vendorIds[label as VendorIdKey];
        }

        // if (vendorId) {
        //     fetchVendors(vendorId);
        // } else {
        //     setVendorOptions([]);
        // }

        var ler = 0.0;
        ExchangeRates.forEach((rate: any) => {
            if (rate.label === value.value.currency) {
                ler = parseFloat(rate.value);
            }
        });
        setLocalExchangeRate(ler);
        setRequestorsCompanyName(value);
    };

    return (
        <Box w="100%">
            <Text mb="8px">Requestor`s Company Name</Text>
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
                    label: requestorsCompanyName.label,
                    value: requestorsCompanyName.value,
                }}
                onChange={onChange}
                classNamePrefix="select"
                isClearable={false}
                name="requestorsCompanyName"
                options={Companies}
            />
        </Box>
    );
}
