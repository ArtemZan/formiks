import { Input, Box, Text, useColorModeValue } from '@chakra-ui/react';
import { useEffect } from 'react';
import Select from 'react-select';
import { Table } from 'rsuite';
import { DefaultSelectStyles } from '../../../../utils/Styles';

const { Column, HeaderCell, Cell } = Table;

export default function VendorsTable(props: any) {
    const {
        vendors,
        setVendors,
        budgetSource,
        ExchangeRates,
        PH1,
        estimatedIncomeEuro,
        vendorsNames,
        VendorsNames,
        setVendorsNames,
        BUs,
        vendorsSelectOptions,
        firstEl,
        setVendorSelectOptions,
    } = props;

    function cellDropDownAlert(value: any, row: any) {
        if (value !== '') {
            return false;
        } else {
            if (row.vendor !== 'TOTAL') {
                return true;
            } else return false;
        }
    }

    return (
        <Box w="100%">
            <Text mb="8px">Vendors</Text>
            <Table hover={false} autoHeight rowHeight={65} data={vendors}>
                <Column width={200} resizable>
                    <HeaderCell>Vendor</HeaderCell>
                    <Cell dataKey="vendor">
                        {(rowData, index) => (
                            <Input
                                value={rowData.vendor}
                                onChange={(event) => {
                                    var temp = [...vendors];
                                    temp[index!].vendor = event.target.value;
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
                                    temp[index!].debitor = event.target.value;
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
                                    temp[index!].creditor = event.target.value;
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
                            // <Input
                            //     value={rowData.bu}
                            //     onChange={(event) => {
                            //         var temp = [...vendors];
                            //         temp[index!].bu = event.target.value;
                            //         setVendors(temp);
                            //     }}
                            // />

                            <Select
                                styles={DefaultSelectStyles(
                                    useColorModeValue,
                                    cellDropDownAlert(rowData.bu, rowData)
                                )}
                                theme={(theme) => ({
                                    ...theme,
                                    borderRadius: 6,
                                    colors: {
                                        ...theme.colors,
                                        primary: '#3082CE',
                                    },
                                })}
                                menuPortalTarget={document.body}
                                value={{
                                    label: rowData.bu,
                                    value:
                                        typeof rowData.bu === 'string'
                                            ? rowData.bu.substr(0, 3)
                                            : '',
                                }}
                                onChange={(value) => {
                                    if (value !== null) {
                                        var tempVendors = [...vendors];
                                        tempVendors[index!].bu = value.label;
                                        console.log('current', tempVendors[index!]);
                                        
                                        // console.log('vendorsSelectOptions', vendorsSelectOptions);
                                        
                                        const tempVendorSelectOptions = [...vendorsSelectOptions];

                                        tempVendorSelectOptions.unshift(firstEl);
                                        setVendorSelectOptions(tempVendorSelectOptions)
                                        setVendors(tempVendors);
                                        const tempVendorsNames = [
                                            ...vendorsNames,
                                        ];
                                        const currentVendorName =
                                            tempVendorsNames[index!]?.label;
                                        if (currentVendorName) {
                                            const buValue = tempVendorsNames[index!].value;
                                            tempVendorsNames[index!].value.bu = tempVendorsNames[index!].value.bu +' test'
                                            console.log('buValue', buValue);
                                            
                                            const splitted =
                                                currentVendorName.split(' BU ');
                                            tempVendorsNames[index!].label =
                                                splitted[0] +
                                                ` BU ${value.label}`;

                                            setVendorsNames(tempVendorsNames);
                                        }
                                    }
                                }}
                                placeholder=""
                                classNamePrefix="select"
                                isClearable={false}
                                name="BUs"
                                options={(() => {
                                    var tBUs = [...BUs];
                                    if (vendorsNames.length < 1) {
                                        return BUs;
                                    }
                                    vendors.forEach((element: any) => {
                                        if (
                                            element.debitor === rowData.debitor
                                        ) {
                                            var idx = tBUs.findIndex(
                                                (s: any) =>
                                                    s.label === element.bu
                                            );
                                            tBUs.splice(idx, 1);
                                        }
                                    });
                                    return tBUs;
                                })()}
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
                                isDisabled={budgetSource.value === 'noBudget'}
                                styles={DefaultSelectStyles(
                                    useColorModeValue,
                                    cellDropDownAlert(
                                        rowData.budgetCurrency?.label,
                                        rowData
                                    )
                                )}
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
                                disabled={budgetSource.value === 'noBudget'}
                                value={rowData.budgetAmount}
                                onChange={(event) => {
                                    var temp = [...vendors];
                                    temp[index!].budgetAmount =
                                        event.target.value;
                                    setVendors(temp);
                                }}
                                bg={
                                    !rowData.budgetAmount &&
                                    !(rowData.vendor === 'TOTAL')
                                        ? '#F3696F'
                                        : '#fff'
                                }
                            />
                        )}
                    </Cell>
                </Column>
                <Column width={200} resizable>
                    <HeaderCell>Vendor Budget in LC</HeaderCell>
                    <Cell dataKey="localBudget">
                        {(rowData, index) => (
                            <Input
                                disabled={budgetSource.value === 'noBudget'}
                                value={rowData.localBudget}
                                onChange={(event) => {
                                    var temp = [...vendors];
                                    temp[index!].localBudget =
                                        event.target.value;
                                    setVendors(temp);
                                }}
                                bg={
                                    !rowData.budgetAmount &&
                                    !(rowData.vendor === 'TOTAL')
                                        ? '#F3696F'
                                        : '#fff'
                                }
                            />
                        )}
                    </Cell>
                </Column>
                <Column width={200} resizable>
                    <HeaderCell>Vendor Budget in EUR</HeaderCell>
                    <Cell dataKey="eurBudget">
                        {(rowData, index) => (
                            <Input
                                disabled={budgetSource.value === 'noBudget'}
                                value={rowData.eurBudget}
                                onChange={(event) => {
                                    var temp = [...vendors];
                                    temp[index!].eurBudget = event.target.value;
                                    setVendors(temp);
                                }}
                                bg={
                                    rowData.vendor === 'TOTAL' &&
                                    rowData.eurBudget !== estimatedIncomeEuro
                                        ? '#F3696F'
                                        : '#fff'
                                }
                            />
                        )}
                    </Cell>
                </Column>
                <Column width={100} resizable>
                    <HeaderCell>Share %</HeaderCell>
                    <Cell dataKey="share">
                        {(rowData, index) => (
                            <Input
                                disabled={budgetSource.value !== 'noBudget'}
                                value={rowData.share}
                                onChange={(event) => {
                                    var temp = [...vendors];
                                    temp[index!].share = event.target.value;
                                    setVendors(temp);
                                }}
                            />
                        )}
                    </Cell>
                </Column>
                <Column width={300} resizable>
                    <HeaderCell>
                        Vendor Estimated Income in Campaign Currency
                    </HeaderCell>
                    <Cell dataKey="estimatedIncomeCC">
                        {(rowData, index) => (
                            <Input
                                disabled={budgetSource.value === 'noBudget'}
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
                    <HeaderCell>Vendor Estimated Costs in LC</HeaderCell>
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
                    <HeaderCell>Vendor Estimated Costs in EUR</HeaderCell>
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
    );
}
