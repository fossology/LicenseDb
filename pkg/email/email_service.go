package email

import (
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
	emailRetryCount  = 3
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

// Global service instance
var Email *AsyncEmailService

func Init(from, password, host string, port int) {
	Email = NewEmailService(from, password, host, port)
}
