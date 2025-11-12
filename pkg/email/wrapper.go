// SPDX-FileCopyrightText: 2025 Chayan Das <01chayandas@gmail.com>
// SPDX-License-Identifier: GPL-2.0-only

package email

import (
	"context"
	"time"

	templates "github.com/fossology/LicenseDb/pkg/email/templetes"
)

func NotifyLicenseCreated(toEmail, userName, shortName string) {
	admins, err := FetchAdminEmails()
	if err != nil {
		return
	}
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		if Email == nil || !Email.IsRunning() {
			return
		}
		// sent mail to creator
		subject, html := templates.SingleLicenseEmailTemplate(
			userName,
			"Created",
			time.Now(),
			shortName,
		)
		// email sent to admins
		_ = Email.Queue(ctx, EmailData{
			To:      []string{toEmail},
			Subject: subject,
			HTML:    html,
		})
		Adminsubject, Adminhtml := templates.SingleLicenseEmailTemplate(
			"Admins",
			"Created",
			time.Now(),
			shortName,
		)
		_ = Email.Queue(ctx, EmailData{
			To:      admins,
			Subject: Adminsubject,
			HTML:    Adminhtml,
		})
	}()
}

func NotifyLicenseUpdated(to, userName, licenseName string) {
	admins, err := FetchAdminEmails()
	if err != nil {
		return
	}
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		if Email == nil || !Email.IsRunning() {
			return
		}
		// sent mail to creator
		subject, html := templates.SingleLicenseEmailTemplate(
			userName,
			"Updated",
			time.Now(),
			licenseName,
		)

		data := EmailData{
			To:      []string{to},
			Subject: subject,
			HTML:    html,
		}

		_ = Email.Queue(ctx, data)

		// email sent to admins
		Adminsubject, Adminhtml := templates.SingleLicenseEmailTemplate(
			"Admins",
			"Updated",
			time.Now(),
			licenseName,
		)

		Admindata := EmailData{
			To:      admins,
			Subject: Adminsubject,
			HTML:    Adminhtml,
		}

		_ = Email.Queue(ctx, Admindata)
	}()
}

func NotifyImportSummary(to, userName, importedType string, total, success, failed int) {
	admins, err := FetchAdminEmails()
	if err != nil {
		return
	}
	go func() {
		ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
		defer cancel()

		if Email == nil || !Email.IsRunning() {
			return
		}

		// email sent to the creator
		subject, html := templates.ImportSummaryEmailTemplate(
			userName,
			importedType,
			total,
			success,
			failed,
			time.Now(),
		)

		data := EmailData{
			To:      []string{to},
			Subject: subject,
			HTML:    html,
		}

		_ = Email.Queue(ctx, data)

		// email sent to admins
		Adminsubject, Adminhtml := templates.ImportSummaryEmailTemplate(
			"Admins",
			importedType,
			total,
			success,
			failed,
			time.Now(),
		)

		Admindata := EmailData{
			To:      admins,
			Subject: Adminsubject,
			HTML:    Adminhtml,
		}

		_ = Email.Queue(ctx, Admindata)

	}()
}
