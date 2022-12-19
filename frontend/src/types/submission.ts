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
  id?:                          string;
	companyCode:                  string | null;
yearMonth                :    string  | null;           
	projectNumber            :    string | null;       
	projectName                :  string | null;            
	invoiceNumber              :  string   | null;          
	incomeAccount             :   string     | null;       
	invoiceRecipientName      :   string         | null;    
	invoiceRecipientNumber      : string  | null;            
	requestFromVendorNumber     : string | null;             
	validation                  : string              | null;
	requestFormVendorNAme       : string              | null;
	bu                          : string              | null;
	requestFormVendorShare      : string              | null;
	requestFormVendorAmount     : string              | null;
	notOkRequestFromVendorNumber: string        | null;      
	notOkRequestFormVendorNAme  : string | null;             
}
