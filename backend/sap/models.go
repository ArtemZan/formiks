package sap

type FRequest struct {
	Request struct {
		FUNCTION       string `json:"_FUNCTION"`
		IM_ORDER       interface{}
		IM_ORDER_TYPE  interface{}
		IM_ORDER_NAME  interface{}
		IM_COMP_CODE   interface{}
		IM_PERSON_RESP interface{}
		IM_CURRENCY    interface{}
		IM_CO_AREA     interface{}
	}
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
