// SPDX-FileCopyrightText: 2025 Chayan Das <01chayandas@gmail.com>
// SPDX-License-Identifier: GPL-2.0-only

package email

import (
	"context"
	"errors"
	"fmt"
	"net"
	"os"
	"strconv"
	"sync"
	"sync/atomic"
	"time"

	"go.uber.org/zap"
	"gopkg.in/gomail.v2"
)

type EmailData struct {
	To      []string
	Cc      []string
	Bcc     []string
	Subject string
	HTML    string
}

type EmailService interface {
	Queue(ctx context.Context, email EmailData) error
	Start()
	IsRunning() bool
	Stop(ctx context.Context) error
}

type AsyncEmailService struct {
	queue   chan EmailData
	from    string
	user    string
	pass    string
	host    string
	port    int
	logger  *zap.Logger
	wg      sync.WaitGroup
	mu      sync.Mutex
	running bool
	closed  bool

	// retry policy (fixed)
	maxRetries int
	retryDelay time.Duration

	// IsRunning cache
	lastCheckMu   sync.Mutex
	lastCheckAt   time.Time
	lastCheckOK   bool
	checkCacheTTL time.Duration
}

const (
	defaultQueueSize   = 200
	defaultWorkerCount = 5
	defaultMaxRetries  = 3
	defaultRetryDelay  = 5 * time.Second
	checkTTL           = 30 * time.Second
)

func NewEmailService(from, smtpUser, pass, host string, port int, opts ...func(*AsyncEmailService)) EmailService {
	logger, _ := zap.NewProduction()
	s := &AsyncEmailService{
		queue:         make(chan EmailData, defaultQueueSize),
		from:          from,
		user:          smtpUser,
		pass:          pass,
		host:          host,
		port:          port,
		logger:        logger,
		maxRetries:    defaultMaxRetries,
		retryDelay:    defaultRetryDelay,
		checkCacheTTL: checkTTL,
	}
	for _, o := range opts {
		o(s)
	}
	return s
}

// Start starts worker pool
func (s *AsyncEmailService) Start() {
	s.mu.Lock()
	if s.running {
		s.mu.Unlock()
		return
	}
	s.running = true
	s.closed = false
	s.mu.Unlock()

	s.logger.Info("Starting email service",
		zap.Int("workers", defaultWorkerCount),
		zap.Int("queue_capacity", cap(s.queue)),
		zap.Int("max_retries", s.maxRetries),
		zap.Duration("retry_delay", s.retryDelay),
	)

	// spawn workers
	for i := 0; i < defaultWorkerCount; i++ {
		s.wg.Add(1)
		go func(id int) {
			defer s.wg.Done()
			s.workerLoop(id)
		}(i)
	}
}

func (s *AsyncEmailService) Queue(ctx context.Context, email EmailData) error {
	s.mu.Lock()
	closed := s.closed
	running := s.running
	s.mu.Unlock()

	if !running {
		return errors.New("email service not running")
	}
	if closed {
		return errors.New("email service stopped")
	}
	if len(email.To) == 0 {
		return errors.New("missing recipient")
	}

	select {
	case <-ctx.Done():
		return ctx.Err()
	case s.queue <- email:
		// queued
		return nil
	}
}

func (s *AsyncEmailService) workerLoop(id int) {
	s.logger.Info("worker started", zap.Int("id", id))
	for job := range s.queue {
		s.processWithRetries(job)
	}
	s.logger.Info("worker stopped", zap.Int("id", id))
}
func (s *AsyncEmailService) processWithRetries(job EmailData) {
	var attempt int
	for attempt = 1; attempt <= s.maxRetries; attempt++ {
		if err := s.doSend(job); err != nil {
			s.logger.Warn("email send failed",
				zap.Int("attempt", attempt),
				zap.Strings("to", job.To),
				zap.Error(err),
			)
			if attempt < s.maxRetries {
				time.Sleep(s.retryDelay)
				continue
			}
			s.logger.Error("email permanently failed after retries",
				zap.Strings("to", job.To),
				zap.Int("attempts", attempt),
			)
			return
		}
		s.logger.Info("email sent", zap.Strings("to", job.To), zap.String("subject", job.Subject))
		return
	}
	_ = attempt
}

func (s *AsyncEmailService) doSend(job EmailData) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	msg := gomail.NewMessage()
	msg.SetHeader("From", s.from)
	msg.SetHeader("To", job.To...)
	if len(job.Cc) > 0 {
		msg.SetHeader("Cc", job.Cc...)
	}
	if len(job.Bcc) > 0 {
		msg.SetHeader("Bcc", job.Bcc...)
	}
	msg.SetHeader("Subject", job.Subject)
	msg.SetBody("text/html", job.HTML)

	username := s.user
	if username == "" {
		username = s.from
	}

	d := gomail.NewDialer(s.host, s.port, username, s.pass)
	errCh := make(chan error, 1)

	go func() {
		errCh <- d.DialAndSend(msg)
	}()

	select {
	case <-ctx.Done():
		return fmt.Errorf("email send timeout: %w", ctx.Err())
	case err := <-errCh:
		if err != nil {
			return fmt.Errorf("gomail send error: %w", err)
		}
		return nil
	}
}

func (s *AsyncEmailService) Stop(ctx context.Context) error {
	s.mu.Lock()
	if s.closed {
		s.mu.Unlock()
		return nil
	}
	s.closed = true
	close(s.queue)
	s.mu.Unlock()

	done := make(chan struct{})
	go func() {
		s.wg.Wait()
		close(done)
	}()

	select {
	case <-done:
		s.logger.Info("email service stopped gracefully")
		return nil
	case <-ctx.Done():
		return ctx.Err()
	}
}

// IsRunning does a cached quick TCP check to SMTP host:port with a small TTL
func (s *AsyncEmailService) IsRunning() bool {
	// cached check
	s.lastCheckMu.Lock()
	if time.Since(s.lastCheckAt) < s.checkCacheTTL {
		ok := s.lastCheckOK
		s.lastCheckMu.Unlock()
		return ok
	}
	s.lastCheckMu.Unlock()

	// perform check
	conn, err := net.DialTimeout("tcp", fmt.Sprintf("%s:%d", s.host, s.port), 2*time.Second)
	ok := err == nil
	if ok {
		_ = conn.Close()
	}

	// update cache
	s.lastCheckMu.Lock()
	s.lastCheckAt = time.Now()
	s.lastCheckOK = ok
	s.lastCheckMu.Unlock()

	if !ok {
		s.logger.Warn("smtp not reachable", zap.Error(err))
	}
	return ok
}

// Global Email service instance
var Email EmailService
var emailConcrete atomic.Value

func Init() error {
	user := os.Getenv("SMTP_USER")
	pass := os.Getenv("SMTP_PASSWORD")
	host := os.Getenv("SMTP_HOST")
	portStr := os.Getenv("SMTP_PORT")
	from := os.Getenv("SMTP_FROM")
	if from == "" {
		from = user
	}

	if user == "" || pass == "" || host == "" || portStr == "" || from == "" {
		return fmt.Errorf("missing one or more SMTP environment variables (SMTP_USERNAME, SMTP_PASSWORD, SMTP_HOST, SMTP_PORT, SMTP_FROM)")
	}
	port, err := strconv.Atoi(portStr)
	if err != nil {
		return fmt.Errorf("invalid SMTP_PORT: %w", err)
	}

	svc := NewEmailService(from, user, pass, host, port)
	if as, ok := svc.(*AsyncEmailService); ok {
		emailConcrete.Store(as)
	}
	Email = svc
	Email.Start()
	return nil
}
