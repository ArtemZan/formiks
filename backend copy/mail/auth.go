package mail

import (
	"fmt"
	"net/smtp"
)

type auth struct {
	username, password string
}

func NewAuth(username, password string) smtp.Auth {
	return &auth{username, password}
}

func (a *auth) Start(server *smtp.ServerInfo) (string, []byte, error) {
	return "LOGIN", []byte{}, nil
}

func (a *auth) Next(message []byte, more bool) ([]byte, error) {
	if more {
		switch string(message) {
		case "Username:":
			return []byte(a.username), nil
		case "Password:":
			return []byte(a.password), nil
		default:
			return nil, fmt.Errorf("unknown command received: %s", string(message))
		}
	}
	return nil, nil
}
