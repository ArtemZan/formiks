import { useColorModeValue, Input, Box, Text } from '@chakra-ui/react';
import { Table, Uploader } from 'rsuite';
import Select from 'react-select';
import { DefaultSelectStyles } from '../../../../utils/Styles';

const { Column, HeaderCell, Cell } = Table;

export default function VendorsTable(props: any) {
    const {
        vendors,
        setVendors,
        cellTextAlert,
        cellDropDownAlert,
        vendorsNames,
        VendorsNames,
        setVendorsNames,
        BUs,
        budgetSource,
        ExchangeRates,
        budgetAmountError,
        cellNumberAlert,
        totalAlert,
        totalVendorBudgetInEUR,
        estimatedIncome,
    } = props;

    const buSelectHandler = (value: any, index: number | undefined) => {
        if (value !== null) {
            var temp = [...vendors];
            if (
                temp[index!].vendor.substring(
                    temp[index!].vendor.toString().length - 6,
                    temp[index!].vendor.toString().length - 4
                ) === 'BU'
            ) {
                temp[index!].vendor =
                    temp[index!].vendor.substring(
                        0,
                        temp[index!].vendor.length - 6
                    ) +
                    'BU ' +
                    value.label.substring(0, 3);
            } else {
                var idxSelected = vendorsNames.findIndex(
                    (s: any) =>
                        s.label.substring(0, s.label.length) ===
                        temp[index!].vendor
                );
                var vend = vendorsNames[idxSelected];
                var lab = '';
                if (
                    vend.label.substring(
                        vend.label.length - 5,
                        vend.label.length - 3
                    ) === 'BU'
                ) {
                    lab =
                        vend.label.substring(0, vend.label.length - 5) +
                        ' (' +
                        vend.value.debitorischer +
                        ')';
                } else {
                    lab = vend.label;
                }

                var data = {
                    label: lab,
                    value: {
                        alsoMarketingConsultant:
                            vend.value.alsoMarketingConsultant,
                        bu: vend.value.bu,
                        city: vend.value.city,
                        cityCode: vend.value.cityCode,
                        debitorischer: vend.value.debitorischer,
                        email: vend.value.email,
                        hersteller: vend.value.hersteller,
                        kreditor: vend.value.kreditor,
                        manufacturerName: vend.value.manufacturerName,
                        vendorAddress: vend.value.vendorAddress,
                    },
                };
                VendorsNames.splice(
                    VendorsNames.findIndex(
                        (s: any) =>
                            s.label.substring(0, s.label.length) ===
                            temp[index!].vendor
                    ),
                    0,
                    data
                );
                temp[index!].vendor =
                    temp[index!].vendor + ' BU ' + value.label.substring(0, 3);
                vend.label = temp[index!].vendor;
                var v = [...vendorsNames];
                v[idxSelected] = vend;
                setVendorsNames(v);
            }
            temp[index!].bu = value.label;
            setVendors(temp);
        }
    };

    return (
        <Box w="100%">
            <Text mb="8px">Vendors</Text>
            <Table
                shouldUpdateScroll={false}
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
                                    temp[index!].vendor = event.target.value;
                                    setVendors(temp);
                                }}
                                bg={cellTextAlert(
                                    vendors[index!] !== undefined
                                        ? vendors[index!].vendor
                                        : '',
                                    rowData
                                )}
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
                                disabled={true}
                                onChange={(event) => {
                                    var temp = [...vendors];
                                    temp[index!].debitor = event.target.value;
                                    setVendors(temp);
                                }}
                                bg={cellTextAlert(
                                    vendors[index!] !== undefined
                                        ? vendors[index!].debitor
                                        : '',
                                    rowData
                                )}
                            />
                        )}
                    </Cell>
                </Column>

                <Column width={200} resizable>
                    <HeaderCell>Creditor</HeaderCell>
                    <Cell dataKey="creditor">
                        {(rowData, index) => (
                            <Input
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
                                disabled={true}
                                onChange={(event) => {
                                    var temp = [...vendors];
                                    temp[index!].manufacturer =
                                        event.target.value;
                                    setVendors(temp);
                                }}
                                bg={cellTextAlert(
                                    vendors[index!] !== undefined
                                        ? vendors[index!].manufacturer
                                        : '',
                                    rowData
                                )}
                            />
                        )}
                    </Cell>
                </Column>

                <Column width={200} resizable>
                    <HeaderCell>Business Unit</HeaderCell>
                    <Cell dataKey="bu">
                        {(rowData, index) => (
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
                                    buSelectHandler(value, index);
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
                {/* <Column width={200} resizable>
<HeaderCell>PH1</HeaderCell>
<Cell dataKey="ph">
{(rowData, index) => (
  <Select
    styles={{
      menu: (provided) => ({
        ...provided,
        zIndex: 1000000000,
      }),
      singleValue: (provided) => ({
        ...provided,
        color: "#718196",
      }),
      control: (base, state) => ({
        ...base,
        minHeight: 40,
        border: "1px solid #E2E8F0",
        transition: "0.3s",
        "&:hover": {
          border: "1px solid #CBD5E0",
        },
      }),
    }}
    theme={(theme) => ({
      ...theme,
      borderRadius: 6,
      colors: {
        ...theme.colors,
        primary: "#3082CE",
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
</Column> */}
                <Column width={200} resizable>
                    <HeaderCell>Vendor Budget Currency</HeaderCell>
                    <Cell dataKey="budgetCurrency">
                        {(rowData, index) => (
                            <Select
                                isDisabled={budgetSource.value === 'noBudget'}
                                styles={DefaultSelectStyles(
                                    useColorModeValue,
                                    cellDropDownAlert(
                                        rowData.budgetCurrency,
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
                                isInvalid={budgetAmountError}
                                // isInvalid={inputErrors.includes('budgetAmount')}
                                value={rowData.budgetAmount}
                                onChange={(event) => {
                                    var temp = [...vendors];
                                    temp[index!].budgetAmount =
                                        event.target.value;
                                    setVendors(temp);
                                }}
                                bg={cellNumberAlert(
                                    rowData.budgetAmount,
                                    rowData
                                )}
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
                                bg={cellNumberAlert(
                                    rowData.localBudget,
                                    rowData
                                )}
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
                                bg={totalAlert(
                                    totalVendorBudgetInEUR,
                                    rowData.vendor,
                                    parseFloat(estimatedIncome)
                                )}
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
                {/* FIXME: calculate */}
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
