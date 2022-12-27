package sap

type FRequest struct {
	IM_ORDER       interface{}
	IM_ORDER_TYPE  interface{}
	IM_ORDER_NAME  interface{}
	IM_COMP_CODE   interface{}
	IM_PERSON_RESP interface{}
	IM_CURRENCY    interface{}
	IM_CO_AREA     interface{}
	IM_TEST_RUN    interface{} `json:"IM_TEST_RUN,omitempty"`
}

type FResponse struct {
	EXORDERID  string `json:"EX_ORDERID"`
	EXSUBRC    int    `json:"EX_SUBRC"`
	ITMESSAGES []struct {
		MESSAGE string `json:"MESSAGE"`
		MSGID   string `json:"MSGID"`
		MSGNR   string `json:"MSGNR"`
		MSGTYP  string `json:"MSGTYP"`
		MSGV1   string `json:"MSGV1"`
		MSGV2   string `json:"MSGV2"`
		MSGV3   string `json:"MSGV3"`
		MSGV4   string `json:"MSGV4"`
	} `json:"IT_MESSAGES"`
}

type AccountLineRecord struct {
	CompanyCode          string      `json:"CompanyCode"`
	YearMonth            string      `json:"YearMonth"`
	PostingDate          string      `json:"PostingDate"`
	DocumentDate         string      `json:"DocumentDate"`
	DocumentType         string      `json:"DocumentType"`
	InvoiceNumber        string      `json:"InvoiceNumber"`
	DocumentNumber       string      `json:"DocumentNumber"`
	Text                 string      `json:"Text"`
	Account              string      `json:"Account"`
	ProjectNumber        string      `json:"ProjectNumber"`
	Name1                interface{} `json:"Name1"`
	SapNumber            string      `json:"SapNumber"`
	CostAmountInLC       string      `json:"CostAmountInLC"`
	LocalCurrency        string      `json:"LocalCurrency"`
	CostAmountInDC       string      `json:"CostAmountInDC"`
	DocumentCurrency     string      `json:"DocumentCurrency"`
	DebitCreditIndicator string      `json:"DebitCreditIndicator"`
}

type AccountLinesResponse struct {
	GetGLAccountLinesOutput struct {
		Rs []AccountLineRecord `json:"rs"`
	} `json:"GetGLAccountLinesOutput"`
}
