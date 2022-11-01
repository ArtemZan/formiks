export interface Template {
  name: string;
  columns: string[];
  filters: FilterField[];
}
export interface FilterField {
  columnValue: string;
  columnLabel: string;
  type: string;
  filter: string;
  values: any[];
  selectedValues: any[];
}
// TODO: handleResize to columns
