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
		Headers map[string]string
		From    *mail.Address
		To      []*mail.Address
		Auth    *smtp.Auth
		Config  *tls.Config
	}
)

func SendMail(mail_body string, mail *SmtpMail, base *SmtpBase) error {
	// Here is the key, you need to call tls.Dial instead of smtp.Dial
	// for smtp servers running on 465 that require an ssl connection
	// from the very beginning (no starttls)
	mail_conn, err := tls.Dial("tcp", base.Server, mail.Config)
	if err != nil {
		return nil
	}
	defer mail_conn.Close()

	mail_client, err := smtp.NewClient(mail_conn, mail.Config.ServerName)
	if err != nil {
		return nil
	}
	defer mail_client.Close()

	// Auth
	if err = mail_client.Auth(*mail.Auth); err != nil {
		return nil
	}

	// Setup message
	mail_message := ""
	for k, v := range mail.Headers {
		mail_message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	mail_message += "\r\n" + mail_body

	// To & From
	if err := mail_client.Mail(mail.From.Address); err != nil {
		return err
	}

	for _, addr := range mail.To {
		if err := mail_client.Rcpt(addr.Address); err != nil {
			return err
		}
	}

	// Data
	mail_writer, err := mail_client.Data()
	if err != nil {
		return err
	}

	_, err = mail_writer.Write([]byte(mail_message))
	if err != nil {
		return err
	}

	if err = mail_writer.Close(); err != nil {
		return err
	}

	return mail_client.Quit()
}

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

	smtpMail.Auth = &mail_auth

	// TLS config
	tls_config := &tls.Config{
		InsecureSkipVerify: true,
		ServerName:         smtp_host,
	}

	smtpMail.Config = tls_config

	return smtpMail, nil
}
