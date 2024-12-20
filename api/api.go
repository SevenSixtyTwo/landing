package main

import (
	"fmt"
	"log"
	"net/http"
	"net/mail"
	"regexp"
	"time"

	"api/internal/env"
	smtp "api/internal/smtp"

	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"golang.org/x/time/rate"
)

var validate *validator.Validate

type (
	SmtpContext struct {
		echo.Context
		smtp     *smtp.SmtpMail
		smtpBase *smtp.SmtpBase
	}

	SubmittedForm struct {
		ID           int
		Name         string `json:"name"`
		Company      string `json:"companyName"`
		Email        string `json:"email" validate:"required,email"`
		Phone        string `json:"phone"`
		Comment      string `json:"message"`
		IsAgree      bool   `json:"agreeToTerms"`
		CreationDate string `json:"creationDate"`
	}
)

func sendForm(form *SubmittedForm, mail *smtp.SmtpMail, base *smtp.SmtpBase) error {
	mail_body := fmt.Sprintf("Имя: %s\r\nКомпания: %s\r\nEmail: %s\r\nТелефон: %s\r\nКомментарий: %s\r\nДата отправки: %s", form.Name, form.Company, form.Email, form.Phone, form.Comment, form.CreationDate)

	smtp.SendMail(mail_body, mail, base)

	return nil
}

func validateForm(form *SubmittedForm) error {
	if !form.IsAgree {
		return fmt.Errorf("this person is not agreed with terms of service")
	}

	count := 0

	_, err := mail.ParseAddress(form.Email)
	if err != nil {
		form.Email = ""
		count++
	}

	phone_regexp, err := regexp.Compile(`^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$`)
	if err != nil {
		return err
	}

	if err := phone_regexp.MatchString(form.Phone); !err {
		form.Phone = ""
		count++
	}

	if count == 2 {
		return fmt.Errorf("both phone and email address provided incorrectly")
	}

	return nil
}

func submitForm(c echo.Context) error {
	cc := c.(*SmtpContext)

	validate = validator.New(validator.WithRequiredStructEnabled())

	var form *SubmittedForm = &SubmittedForm{}
	if err := c.Bind(form); err != nil {
		log.Printf("submit, binding error: %s", err)
		return err
	}

	if err := validate.Struct(form); err != nil {
		log.Printf("struct validation error: %s", err)
		return c.JSON(http.StatusBadRequest, form)
	}

	current_time := time.Now().Add(time.Hour * 5).Format("15:04 02.01.2006")
	form.CreationDate = current_time

	if err := validateForm(form); err != nil {
		log.Printf("validate form: %s", err)
		return c.JSON(http.StatusBadRequest, form)
	}

	if err := sendForm(form, cc.smtp, cc.smtpBase); err != nil {
		log.Printf("send form: %s", err)
		return c.JSON(http.StatusInternalServerError, form)
	}

	return c.JSON(http.StatusCreated, form)
}

func main() {
	var smtpBase *smtp.SmtpBase = &smtp.SmtpBase{
		From:     env.FROM,
		To:       env.TO,
		Password: env.PASSWORD,
		Server:   env.SERVER,
	}

	smtpMail, err := smtp.InitSmtp(smtpBase)
	if err != nil {
		log.Panicf("init smtp: %s", err)
	}

	e := echo.New()

	config := middleware.RateLimiterConfig{
		Skipper: middleware.DefaultSkipper,
		// Defines a store for a rate limiter
		Store: middleware.NewRateLimiterMemoryStoreWithConfig(
			middleware.RateLimiterMemoryStoreConfig{Rate: rate.Limit(2), Burst: 10, ExpiresIn: 10 * time.Minute},
		),
		// Uses echo.Context to extract the identifier for a visitor
		IdentifierExtractor: func(ctx echo.Context) (string, error) {
			id := ctx.RealIP()
			return id, nil
		},
		// Provides a handler to be called when IdentifierExtractor returns a non-nil error
		ErrorHandler: func(context echo.Context, err error) error {
			return context.JSON(http.StatusForbidden, nil)
		},
		// Provides a handler to be called when RateLimiter denies access
		DenyHandler: func(context echo.Context, identifier string, err error) error {
			return context.JSON(http.StatusTooManyRequests, nil)
		},
	}

	e.Use(middleware.RateLimiterWithConfig(config))
	e.Use(middleware.Secure())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		Skipper:      middleware.DefaultSkipper,
		AllowOrigins: []string{"http://energosfera-lysva.ru"},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept},
		AllowMethods: []string{echo.OPTIONS, echo.POST},
	}))

	e.Use(func(h echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			cc := &SmtpContext{c, smtpMail, smtpBase}
			return h(cc)
		}
	})

	e.POST("/submit", submitForm)

	e.Logger.Fatal(e.Start(":3030"))
}
