package network

import (
	"log"
	"net/http"
	"net/url"
	"os"
)

var Client *http.Client

func init() {
	proxyEnv := os.Getenv("HTTP_PROXY")
	log.Printf("Proxy: %v", proxyEnv)
	if proxyEnv != "" {
		proxyURL, err := url.Parse(proxyEnv)
		if err != nil {
			log.Fatalf("Error establishing proxy connection: %v", err)
		}

		Client = &http.Client{
			Transport: &http.Transport{
				Proxy: http.ProxyURL(proxyURL),
			},
		}
	} else {
		Client = &http.Client{}
	}
}

func Initialize(){
	proxyEnv := os.Getenv("HTTP_PROXY")
	log.Printf("Proxy: %v", proxyEnv)
	if proxyEnv != "" {
		proxyURL, err := url.Parse(proxyEnv)
		if err != nil {
			log.Fatalf("Error establishing proxy connection: %v", err)
		}

		Client = &http.Client{
			Transport: &http.Transport{
				Proxy: http.ProxyURL(proxyURL),
			},
		}
	} else {
		Client = &http.Client{}
	}
}
