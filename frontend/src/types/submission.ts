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
  requestFromVendorNumber: string;
  validation: string;
  requestFormVendorName: string;
  bu: string;
  requestFormVendorShare: string;
  requestFormVendorAmount: string;
  notOkRequestFromVendorNumber: string;
  notOkRequestFormVendorName: string;
}
