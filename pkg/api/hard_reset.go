// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>
//
// SPDX-License-Identifier: GPL-2.0-only

package api

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/fossology/LicenseDb/pkg/db"
	"github.com/fossology/LicenseDb/pkg/models"
	"github.com/fossology/LicenseDb/pkg/utils"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

var hardResetDefaultObligationTypes = []string{
	"OBLIGATION",
	"RISK",
	"RESTRICTION",
	"RIGHT",
}

var hardResetDefaultObligationClassifications = []models.ObligationClassification{
	{Classification: "GREEN", Color: "#00FF00"},
	{Classification: "WHITE", Color: "#FFFFFF"},
	{Classification: "YELLOW", Color: "#FFDE21"},
	{Classification: "RED", Color: "#FF0000"},
}

var hardResetDefaultObligationCategories = []string{
	"DISTRIBUTION",
	"PATENT",
	"INTERNAL",
	"CONTRACTUAL",
	"EXPORT_CONTROL",
	"GENERAL",
}

// HardResetDatabase removes all records only from configured tables.
//
//	@Summary		Hard reset database
//	@Description	Delete all data from configured tables used by license/obligation/audit domain
//	@Id				HardResetDatabase
//	@Tags			Admin
//	@Produce		json
//	@Success		204
//	@Failure		500	{object}	models.LicenseError	"failed to hard reset database"
//	@Security		ApiKeyAuth
//	@Router			/hard-reset [delete]
func HardResetDatabase(c *gin.Context) {
	userId := c.MustGet("userId").(uuid.UUID)

	var hardResetTables = []string{
		"license_dbs",
		"obligation_types",
		"obligation_classifications",
		"obligation_licenses",
		"obligation_categories",
		"obligations",
		"audits",
		"change_logs",
	}

	truncateQuery := fmt.Sprintf("TRUNCATE TABLE %s RESTART IDENTITY CASCADE", strings.Join(hardResetTables, ", "))
	if err := db.DB.Exec(truncateQuery).Error; err != nil {
		c.JSON(http.StatusInternalServerError, models.LicenseError{
			Status:    http.StatusInternalServerError,
			Message:   "failed to hard reset database",
			Error:     err.Error(),
			Path:      c.Request.URL.Path,
			Timestamp: time.Now().Format(time.RFC3339),
		})
		return
	}

	for _, obligationType := range hardResetDefaultObligationTypes {
		_, status := utils.CreateObType(&models.ObligationType{Type: obligationType}, userId)
		if status != utils.CREATED && status != utils.CONFLICT {
			c.JSON(http.StatusInternalServerError, models.LicenseError{
				Status:    http.StatusInternalServerError,
				Message:   fmt.Sprintf("failed to restore default obligation type '%s'", obligationType),
				Error:     fmt.Sprintf("failed to restore default obligation type '%s'", obligationType),
				Path:      c.Request.URL.Path,
				Timestamp: time.Now().Format(time.RFC3339),
			})
			return
		}
	}

	for _, obligationClassification := range hardResetDefaultObligationClassifications {
		_, status := utils.CreateObClassification(&models.ObligationClassification{
			Classification: obligationClassification.Classification,
			Color:          obligationClassification.Color,
		}, userId)
		if status != utils.CREATED && status != utils.CONFLICT {
			c.JSON(http.StatusInternalServerError, models.LicenseError{
				Status:    http.StatusInternalServerError,
				Message:   fmt.Sprintf("failed to restore default obligation classification '%s'", obligationClassification.Classification),
				Error:     fmt.Sprintf("failed to restore default obligation classification '%s'", obligationClassification.Classification),
				Path:      c.Request.URL.Path,
				Timestamp: time.Now().Format(time.RFC3339),
			})
			return
		}
	}

	for _, obligationCategory := range hardResetDefaultObligationCategories {
		_, status := utils.CreateObCategory(&models.ObligationCategory{Category: obligationCategory}, userId)
		if status != utils.CREATED && status != utils.CONFLICT {
			c.JSON(http.StatusInternalServerError, models.LicenseError{
				Status:    http.StatusInternalServerError,
				Message:   fmt.Sprintf("failed to restore default obligation category '%s'", obligationCategory),
				Error:     fmt.Sprintf("failed to restore default obligation category '%s'", obligationCategory),
				Path:      c.Request.URL.Path,
				Timestamp: time.Now().Format(time.RFC3339),
			})
			return
		}
	}

	c.Status(http.StatusNoContent)
}
