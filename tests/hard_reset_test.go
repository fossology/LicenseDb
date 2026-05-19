// SPDX-FileContributor: Dearsh Oberoi <dearsh.oberoi@siemens.com>
//
// SPDX-License-Identifier: GPL-2.0-only

package test

import (
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/fossology/LicenseDb/pkg/db"
	"github.com/fossology/LicenseDb/pkg/models"
	"github.com/fossology/LicenseDb/pkg/utils"
	"github.com/stretchr/testify/assert"
)

func TestHardResetDatabase(t *testing.T) {
	defer utils.Populatedb(testDataFile)

	loginAs(t, "admin")
	clientID := fmt.Sprintf("hard-reset-client-%d", time.Now().UnixNano())
	createOIDCPayload := models.CreateDeleteOidcClientDTO{ClientId: clientID}
	createW := makeRequest("POST", "/oidcClients", createOIDCPayload, true)
	assert.Equal(t, http.StatusCreated, createW.Code)

	var usersBeforeReset int64
	assert.NoError(t, db.DB.Model(&models.User{}).Count(&usersBeforeReset).Error)

	var oidcClientsBeforeReset int64
	assert.NoError(t, db.DB.Model(&models.OidcClient{}).Count(&oidcClientsBeforeReset).Error)

	var licensesBeforeReset int64
	assert.NoError(t, db.DB.Model(&models.LicenseDB{}).Count(&licensesBeforeReset).Error)
	assert.Greater(t, licensesBeforeReset, int64(0), "expected licenses to exist before hard reset")

	loginAs(t, "admin")
	resetW := makeRequest("DELETE", "/hard-reset", nil, true)
	assert.Equal(t, http.StatusNoContent, resetW.Code)

	var usersAfterReset int64
	assert.NoError(t, db.DB.Model(&models.User{}).Count(&usersAfterReset).Error)
	assert.Equal(t, usersBeforeReset, usersAfterReset)

	var oidcClientsAfterReset int64
	assert.NoError(t, db.DB.Model(&models.OidcClient{}).Count(&oidcClientsAfterReset).Error)
	assert.Equal(t, oidcClientsBeforeReset, oidcClientsAfterReset)

	var licensesAfterReset int64
	assert.NoError(t, db.DB.Model(&models.LicenseDB{}).Count(&licensesAfterReset).Error)
	assert.Equal(t, int64(0), licensesAfterReset)

	var obligationTypesAfterReset int64
	assert.NoError(t, db.DB.Model(&models.ObligationType{}).Count(&obligationTypesAfterReset).Error)
	assert.Equal(t, int64(4), obligationTypesAfterReset)

	var obligationClassificationsAfterReset int64
	assert.NoError(t, db.DB.Model(&models.ObligationClassification{}).Count(&obligationClassificationsAfterReset).Error)
	assert.Equal(t, int64(4), obligationClassificationsAfterReset)

	var obligationCategoriesAfterReset int64
	assert.NoError(t, db.DB.Model(&models.ObligationCategory{}).Count(&obligationCategoriesAfterReset).Error)
	assert.Equal(t, int64(6), obligationCategoriesAfterReset)
}

func TestHardResetDatabaseUnauthorized(t *testing.T) {
	w := makeRequest("DELETE", "/hard-reset", nil, false)
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
