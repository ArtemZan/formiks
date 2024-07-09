package mail

type Option func(*Message)

func WithProvider(provider Provider) Option {
	return func(msg *Message) {
		msg.address = provider.GetAddress()
	}
}

func WithAuth(username, password string) Option {
	return func(msg *Message) {
		msg.from = username
		msg.auth = NewAuth(username, password)
	}
}

func WithRecipients(recipients ...string) Option {
	return func(msg *Message) {
		msg.recipients = recipients
	}
}

func WithSubject(subject string) Option {
	return func(msg *Message) {
		msg.subject = subject
	}
}

func WithBody(body string) Option {
	return func(msg *Message) {
		msg.body = body
	}
}
