package mail

import (
	"fmt"
	"net/smtp"
	"strings"
)

type Message struct {
	auth       smtp.Auth
	address    string
	from       string
	recipients []string
	subject    string
	body       string
}

func NewMessage(options ...Option) *Message {
	msg := &Message{
		auth:    nil,
		address: Outlook.GetAddress(),
		subject: "Formiks Management Platform",
	}

	for _, option := range options {
		option(msg)
	}

	return nil
}

func (m *Message) Send() error {
	return smtp.SendMail(m.address, m.auth, m.from, m.recipients, []byte(fmt.Sprintf("From: %s\nTo: %s\nSubject: %s\n%s", m.from, strings.Join(m.recipients, ", "), m.subject, m.body)))
}
