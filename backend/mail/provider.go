package mail

type Provider int

const (
	Outlook Provider = iota + 1
	Gmail
)

func (p Provider) GetAddress() string {
	switch p {
	case Outlook:
		return "smtp-mail.outlook.com:587"
	case Gmail:
		return "smtp.gmail.com:587"
	default:
		return ""
	}
}
