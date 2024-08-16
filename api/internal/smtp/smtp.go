package smtp

import (
	"crypto/tls"
	"fmt"
	"net"
	"net/mail"
	"net/smtp"
)

type (
	SmtpBase struct {
		From     string
		To       []string
		Password string
		Server   string
	}

	SmtpMail struct {
		Client  *smtp.Client
		Headers map[string]string
		From    *mail.Address
		To      []*mail.Address
	}
)

func InitSmtp(smtp_cred *SmtpBase) (*SmtpMail, error) {
	var smtpMail *SmtpMail = &SmtpMail{}

	smtpMail.Headers = make(map[string]string)

	smtpMail.Headers["To"] = ""

	for _, addr := range smtp_cred.To {
		smtpMail.To = append(smtpMail.To, &mail.Address{"", addr})
		smtpMail.Headers["To"] += fmt.Sprintf("%s, ", addr)
	}

	smtpMail.From = &mail.Address{"", smtp_cred.From}
	mail_subj := "Сообщение с сайта"

	// Setup headers
	smtpMail.Headers["From"] = smtpMail.From.String()
	smtpMail.Headers["Subject"] = mail_subj

	// Connect to the SMTP server
	smtp_server := smtp_cred.Server

	smtp_host, _, err := net.SplitHostPort(smtp_server)
	if err != nil {
		return nil, err
	}

	mail_auth := smtp.PlainAuth("", smtp_cred.From, smtp_cred.Password, smtp_host)

	// TLS config
	tls_config := &tls.Config{
		InsecureSkipVerify: true,
		ServerName:         smtp_host,
	}

	// Here is the key, you need to call tls.Dial instead of smtp.Dial
	// for smtp servers running on 465 that require an ssl connection
	// from the very beginning (no starttls)
	mail_conn, err := tls.Dial("tcp", smtp_server, tls_config)
	if err != nil {
		return nil, err
	}

	mail_client, err := smtp.NewClient(mail_conn, smtp_host)
	if err != nil {
		return nil, err
	}

	// Auth
	if err = mail_client.Auth(mail_auth); err != nil {
		return nil, err
	}

	smtpMail.Client = mail_client

	return smtpMail, nil
}
