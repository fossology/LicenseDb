// SPDX-FileCopyrightText: 2025 Chayan Das <01chayandas@gmail.com>
//
// SPDX-License-Identifier: GPL-2.0-only

package email

import (
	"fmt"
	"net"
	"os"
	"strconv"
	"time"

	templates "github.com/fossology/LicenseDb/pkg/email/templetes"
	"go.uber.org/zap"
	"gopkg.in/gomail.v2"
)

type EmailData struct {
	To          string
	Subject     string
	HTMLContent string
}

type LicenseJob struct {
	UserName    string
	UserEmail   string
	Action      string
	LicenseName string
	Timestamp   time.Time
}

type BulkInsertJob struct {
	UserName  string
	UserEmail string
	Type      string
	Total     int
	Success   int
	Failed    int
	Timestamp time.Time
}

type AsyncEmailService struct {
	emailQueue   chan EmailData
	licenseQueue chan LicenseJob
	bulkQueue    chan BulkInsertJob
	from         string
	password     string
	host         string
	port         int
	logger       *zap.Logger
}

const (
	emailQueueSize   = 100
	licenseQueueSize = 100
	bulkQueueSize    = 100
	workerPoolSize   = 5
)

func NewEmailService(from, password, host string, port int) *AsyncEmailService {
	logger, _ := zap.NewProduction()

	service := &AsyncEmailService{
		emailQueue:   make(chan EmailData, emailQueueSize),
		licenseQueue: make(chan LicenseJob, licenseQueueSize),
		bulkQueue:    make(chan BulkInsertJob, bulkQueueSize),
		from:         from,
		password:     password,
		host:         host,
		port:         port,
		logger:       logger,
	}

	for i := 0; i < workerPoolSize; i++ {
		go service.startEmailWorker()
	}
	go service.startLicenseWorker()
	go service.startBulkInsertWorker()

	service.logger.Info("Email service initialized and workers running")
	return service
}

func (s *AsyncEmailService) Send(to, subject, html string) {
	s.logger.Debug("Enqueuing email",
		zap.String("to", to),
		zap.String("subject", subject),
	)
	s.emailQueue <- EmailData{To: to, Subject: subject, HTMLContent: html}
}

func (s *AsyncEmailService) QueueLicenseEmail(job LicenseJob) {
	if job.Timestamp.IsZero() {
		job.Timestamp = time.Now()
	}
	s.logger.Info("Enqueuing license email",
		zap.String("user", job.UserName),
		zap.String("email", job.UserEmail),
		zap.String("license", job.LicenseName),
		zap.String("action", job.Action),
	)
	s.licenseQueue <- job
}

func (s *AsyncEmailService) QueueBulkInsertEmail(job BulkInsertJob) {
	if job.Timestamp.IsZero() {
		job.Timestamp = time.Now()
	}
	s.logger.Info("Enqueuing bulk import summary email",
		zap.String("user", job.UserName),
		zap.String("type", job.Type),
		zap.Int("total", job.Total),
		zap.Int("success", job.Success),
		zap.Int("failed", job.Failed),
	)
	s.bulkQueue <- job
}

func (s *AsyncEmailService) startEmailWorker() {
	for email := range s.emailQueue {
		s.sendEmail(email)
	}
}

// func SingleLicenseEmailTemplate(userName, action string, timestamp time.Time, licenseName string) (string, string) {

func (s *AsyncEmailService) startLicenseWorker() {
	for job := range s.licenseQueue {
		subject, body := templates.SingleLicenseEmailTemplate(job.UserName, job.Action, job.Timestamp, job.LicenseName)
		s.Send(job.UserEmail, subject, body)
		s.logger.Info("License email sent",
			zap.String("user", job.UserName),
			zap.String("license", job.LicenseName),
			zap.String("action", job.Action),
		)
	}
}

func (s *AsyncEmailService) startBulkInsertWorker() {
	for job := range s.bulkQueue {
		subject, body := templates.ImportSummaryEmailTemplate(job.UserName, job.Type, job.Total, job.Success, job.Failed, job.Timestamp)
		s.Send(job.UserEmail, subject, body)
		s.logger.Info("Bulk insert summary email sent",
			zap.String("user", job.UserName),
			zap.String("type", job.Type),
			zap.Int("total", job.Total),
			zap.Int("success", job.Success),
			zap.Int("failed", job.Failed),
		)
	}
}

func (s *AsyncEmailService) sendEmail(email EmailData) {
	m := gomail.NewMessage()
	m.SetHeader("From", s.from)
	m.SetHeader("To", email.To)
	m.SetHeader("Subject", email.Subject)
	m.SetBody("text/html", email.HTMLContent)

	d := gomail.NewDialer(s.host, s.port, s.from, s.password)

	if err := d.DialAndSend(m); err != nil {
		s.logger.Error("Failed to send email",
			zap.String("to", email.To),
			zap.Error(err),
		)
	} else {
		s.logger.Info("Email sent",
			zap.String("to", email.To),
			zap.String("subject", email.Subject),
		)
	}
}

// IsRunning checks if the email service is initialized and SMTP is reachable.
func (s *AsyncEmailService) IsRunning() bool {
	EnableSMTP, _ := strconv.ParseBool(os.Getenv("ENABLE_SMTP"))
	if !EnableSMTP {
		return false
	}

	if s == nil {
		return false
	}
	conn, err := net.DialTimeout("tcp", fmt.Sprintf("%s:%d", s.host, s.port), 2*time.Second)
	if err != nil {
		s.logger.Error("SMTP server is not reachable",
			zap.String("host", s.host),
			zap.Int("port", s.port),
			zap.Error(err),
		)
		return false
	}
	_ = conn.Close()
	return true
}

// Global service instance
var Email *AsyncEmailService

func IsEmailServiceRunning() bool {
	return Email != nil && Email.IsRunning()
}

func Init() error {
	from := os.Getenv("SMTP_USER")
	password := os.Getenv("SMTP_PASSWORD")
	host := os.Getenv("SMTP_HOST")
	portStr := os.Getenv("SMTP_PORT")

	if from == "" || password == "" || host == "" || portStr == "" {
		return fmt.Errorf("missing one or more SMTP environment variables")
	}

	port, err := strconv.Atoi(portStr)
	if err != nil {
		return fmt.Errorf("invalid SMTP_PORT: %v", err)
	}

	// Initialize the email service
	Email = NewEmailService(from, password, host, port)
	return nil
}
