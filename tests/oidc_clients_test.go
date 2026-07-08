// SPDX-FileCopyrightText: 2026 Krishi Agrawal <krishi.agrawal26@gmail.com>
//
// SPDX-License-Identifier: GPL-2.0-only

package test

import (
	"encoding/json"
	"net/http"
	"testing"

	"github.com/fossology/LicenseDb/pkg/models"
	"github.com/stretchr/testify/assert"
)

func TestGetUserOidcClients(t *testing.T) {
	loginAs(t, "admin")

	t.Run("getUserOidcClients", func(t *testing.T) {
		w := makeRequest("GET", "/oidcClients", nil, true)
		assert.Equal(t, http.StatusOK, w.Code)

		var res models.OidcClientsResponse
		if err := json.Unmarshal(w.Body.Bytes(), &res); err != nil {
			t.Errorf("Error unmarshalling JSON: %v", err)
			return
		}
		assert.Equal(t, http.StatusOK, res.Status)
		assert.NotNil(t, res.Data)
		assert.GreaterOrEqual(t, len(res.Data), 0)
	})

	t.Run("unauthorized", func(t *testing.T) {
		w := makeRequest("GET", "/oidcClients", nil, false)
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}

func TestAddOidcClient(t *testing.T) {
	t.Run("addOidcClientSuccess", func(t *testing.T) {
		oidcClient := models.CreateOidcClientDTO{
			ClientId:    "test-client-id-1",
			Name:        "Test Client One",
			Description: "OIDC client for testing add endpoint",
		}

		w := makeRequest("POST", "/oidcClients", oidcClient, true)
		assert.Equal(t, http.StatusCreated, w.Code)

		var res models.OidcClientsResponse
		if err := json.Unmarshal(w.Body.Bytes(), &res); err != nil {
			t.Errorf("Error unmarshalling JSON: %v", err)
			return
		}
		assert.Equal(t, http.StatusOK, res.Status)
		if len(res.Data) > 0 {
			assert.Equal(t, oidcClient.ClientId, res.Data[0].ClientId)
			assert.Equal(t, oidcClient.Name, res.Data[0].Name)
			assert.Equal(t, oidcClient.Description, res.Data[0].Description)
		}
	})

	t.Run("addDuplicateOidcClient", func(t *testing.T) {
		oidcClient := models.CreateOidcClientDTO{
			ClientId:    "test-client-id-2",
			Name:        "Test Client Two",
			Description: "OIDC client for duplicate test",
		}

		w1 := makeRequest("POST", "/oidcClients", oidcClient, true)
		assert.Equal(t, http.StatusCreated, w1.Code)

		w2 := makeRequest("POST", "/oidcClients", oidcClient, true)
		assert.Equal(t, http.StatusConflict, w2.Code)
	})

	t.Run("addOidcClientWithInvalidJSON", func(t *testing.T) {
		w := makeRequest("POST", "/oidcClients", "invalid", true)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("unauthorized", func(t *testing.T) {
		oidcClient := models.CreateOidcClientDTO{
			ClientId:    "test-client-id-3",
			Name:        "Test Client Three",
			Description: "OIDC client for unauthorized test",
		}
		w := makeRequest("POST", "/oidcClients", oidcClient, false)
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}

func TestRevokeClient(t *testing.T) {
	createOidcClient := models.CreateOidcClientDTO{
		ClientId:    "test-revoke-client",
		Name:        "Test Revoke Client",
		Description: "OIDC client for revoke test",
	}
	deleteOidcClient := models.DeleteOidcClientDTO{
		ClientId: createOidcClient.ClientId,
	}
	addW := makeRequest("POST", "/oidcClients", createOidcClient, true)
	assert.Equal(t, http.StatusCreated, addW.Code)

	t.Run("revokeClientSuccess", func(t *testing.T) {
		w := makeRequest("DELETE", "/oidcClients", deleteOidcClient, true)
		assert.Equal(t, http.StatusNoContent, w.Code)
	})

	t.Run("revokeNonExistingClient", func(t *testing.T) {
		nonExistingClient := models.DeleteOidcClientDTO{
			ClientId: "non-existing-client",
		}
		w := makeRequest("DELETE", "/oidcClients", nonExistingClient, true)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})

	t.Run("revokeClientWithInvalidJSON", func(t *testing.T) {
		w := makeRequest("DELETE", "/oidcClients", "invalid", true)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("unauthorized", func(t *testing.T) {
		w := makeRequest("DELETE", "/oidcClients", deleteOidcClient, false)
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}
