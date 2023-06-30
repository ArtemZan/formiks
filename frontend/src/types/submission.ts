export interface Submission {
  id?: string;
  parentId: string | null;
  viewId: string | null;
  group: string | null;
  project: string;
  created: Date;
  updated: Date;
  title: string;
  status: string;
  author: string;
  data: any;
}

export interface SubmissionWithChildren {
  submission: Submission;
  children: Submission[];
  local: string | null;
}

export interface PAreport {
  id?: string;
  companyCode: string;
  yearMonth: string;
  projectNumber: string;
  projectName: string;
  invoiceNumber: string;
  incomeAccount: string;
  incomeAmountLCSI: string;
  invoiceRecipientName: string;
  invoiceRecipientNumber: string;
  validation: string;
  exSalesValue: string;
  exSalesVODNumber: string;
  exSalesManufacturerNumber: string;
  exSalesManufacturerName: string;
  exSalesBU: string;
  intSalesVendorShare: string;
  intSalesVendorAmount: string;
  intSalesManufacturerNumber: string;
  intSalesManufacturerName: string;
  intSalesBU: string;
}
