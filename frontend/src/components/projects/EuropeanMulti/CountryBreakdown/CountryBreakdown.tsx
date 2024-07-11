import { Input, Box, Text } from '@chakra-ui/react';
import { Table } from 'rsuite';

const { Column, HeaderCell, Cell } = Table;

export default function CountryBreakdown(props: any) {
    const {
        countryBreakdown,
        totalcbShare,
        totalcbContribution,
        exchangeRates,
        totalcbCosts,
        setCountryBreakdown,
        budgetSource,
    } = props;

    const totalShareNum = Number(totalcbShare);

    const totalShareFormated = isNaN(totalShareNum)
        ? '0.00'
        : totalShareNum.toFixed(2);

    return (
        <Box w="100%">
            <Text mb="8px">Country Breakdown</Text>
            <Table
                shouldUpdateScroll={false}
                hover={false}
                autoHeight
                rowHeight={65}
                data={[
                    ...countryBreakdown,
                    {
                        invalid: totalcbShare === '100' ? false : true,
                        companyName: 'TOTAL',
                        share: totalShareFormated + '%',
                        contribution:
                            totalcbContribution + ' ' + exchangeRates.label,
                        estimatedCosts:
                            totalcbCosts + ' ' + exchangeRates.label,
                    },
                ]}
            >
                <Column width={200} resizable>
                    <HeaderCell>Company Name</HeaderCell>
                    <Cell dataKey="companyName">
                        {(rowData, index) => (
                            <Input
                                value={rowData.companyName}
                                onChange={(event) => {
                                    var temp = [...countryBreakdown];
                                    temp[index!].companyName =
                                        event.target.value;
                                    setCountryBreakdown(temp);
                                }}
                            />
                        )}
                    </Cell>
                </Column>

                <Column width={200} resizable>
                    <HeaderCell>Company Code</HeaderCell>
                    <Cell dataKey="companyCode">
                        {(rowData, index) => (
                            <Input
                                value={rowData.companyCode}
                                onChange={(event) => {
                                    var temp = [...countryBreakdown];
                                    temp[index!].companyCode =
                                        event.target.value;
                                    setCountryBreakdown(temp);
                                }}
                            />
                        )}
                    </Cell>
                </Column>

                <Column width={100} resizable>
                    <HeaderCell>Country</HeaderCell>
                    <Cell dataKey="country">
                        {(rowData, index) => (
                            <Input
                                value={rowData.country}
                                onChange={(event) => {
                                    var temp = [...countryBreakdown];
                                    temp[index!].country = event.target.value;
                                    setCountryBreakdown(temp);
                                }}
                            />
                        )}
                    </Cell>
                </Column>

                <Column width={200} resizable>
                    <HeaderCell>Contact Person's Email</HeaderCell>
                    <Cell dataKey="contactEmail">
                        {(rowData, index) => (
                            <Input
                                value={rowData.contactEmail}
                                onChange={(event) => {
                                    var temp = [...countryBreakdown];
                                    temp[index!].contactEmail =
                                        event.target.value;
                                    setCountryBreakdown(temp);
                                }}
                            />
                        )}
                    </Cell>
                </Column>

                <Column width={200} resizable>
                    <HeaderCell>Local Project Number</HeaderCell>
                    <Cell dataKey="projectNumber">
                        {(rowData, index) => (
                            <Input
                                value={rowData.projectNumber}
                                onChange={(event) => {
                                    var temp = [...countryBreakdown];
                                    temp[index!].projectNumber =
                                        event.target.value;
                                    setCountryBreakdown(temp);
                                }}
                            />
                        )}
                    </Cell>
                </Column>
                <Column width={100} resizable>
                    <HeaderCell>Share %</HeaderCell>
                    <Cell dataKey="share">
                        {(rowData, index) => (
                            <Input
                                value={rowData.share}
                                onChange={(event) => {
                                    var temp = [...countryBreakdown];
                                    temp[index!].share = event.target.value;
                                    setCountryBreakdown(temp);
                                }}
                                bg={rowData.invalid && '#F3696F'}
                            />
                        )}
                    </Cell>
                </Column>
                <Column width={400} resizable>
                    <HeaderCell>
                        Budget Contribution in Campaign Currency
                    </HeaderCell>
                    <Cell dataKey="contribution">
                        {(rowData, index) => (
                            <Input
                                disabled={budgetSource.value === 'noBudget'}
                                value={rowData.contribution}
                                onChange={(event) => {
                                    var temp = [...countryBreakdown];
                                    temp[index!].contribution =
                                        event.target.value;
                                    setCountryBreakdown(temp);
                                }}
                            />
                        )}
                    </Cell>
                </Column>
                <Column width={400} resizable>
                    <HeaderCell>
                        Total Estimated Costs in Campaign Currency
                    </HeaderCell>
                    <Cell dataKey="estimatedCosts">
                        {(rowData, index) => (
                            <Input
                                value={rowData.estimatedCosts}
                                onChange={(event) => {
                                    var temp = [...countryBreakdown];
                                    temp[index!].estimatedCosts =
                                        event.target.value;
                                    setCountryBreakdown(temp);
                                }}
                            />
                        )}
                    </Cell>
                </Column>
            </Table>
        </Box>
    );
}
