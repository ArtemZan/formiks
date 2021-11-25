package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/sap/gorfc/gorfc"
	"github.com/twmb/franz-go/pkg/kgo"
)

var SapConnectionParameters = gorfc.ConnectionParameters{
	"user":   "RFC_WRIKE",
	"passwd": "initial01",
	"ashost": "192.168.240.200",
	"sysnr":  "40",
	"client": "100",
	"lang":   "EN",
}

type FCall struct {
	Function string                 `json:"function"`
	Data     map[string]interface{} `json:"data"`
}

type SapResponse struct {
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

func (m *FCall) Decode(data []byte) error {
	// FIXME: use parseParams from https://github.com/doublegrey/wrike/blob/master/main.go to parse RFCTYPE_DATE and RFCTYPE_INT
	return json.Unmarshal(data, m)
}

func (m FCall) Execute() (map[string]interface{}, error) {
	c, err := gorfc.ConnectionFromParams(SapConnectionParameters)
	if err != nil {
		return nil, err
	}
	resp, err := c.Call(m.Function, m.Data)
	if err != nil {
		return nil, err
	}
	fmt.Println("Response:")
	for k, v := range resp {
		fmt.Printf("\t%s -> %v\n", k, v)
	}
	return resp, nil
}

func main() {
	cl, err := kgo.NewClient(
		kgo.SeedBrokers("localhost:9092"),
		kgo.ConsumerGroup("sap-proxy"),
		kgo.ConsumeTopics("formiks.sap.rfc"),
	)
	if err != nil {
		log.Fatalf("failed to create kafka client: %v\n", err)
	}
	defer cl.Close()

	ctx := context.Background()
	for {
		fetches := cl.PollFetches(ctx)
		if errs := fetches.Errors(); len(errs) > 0 {
			log.Printf("Failed to fetch poll: %v\n", err)
			break
		}
		iter := fetches.RecordIter()
		for !iter.Done() {
			record := iter.Next()
			log.Println(string(record.Value))

			var call FCall
			err = call.Decode(record.Value)
			if err != nil {
				log.Println(err)
				continue
			}
			call.Execute()
		}
	}
}
