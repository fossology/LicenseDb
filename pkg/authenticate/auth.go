// SPDX-FileCopyrightText: 2023 Kavya Shukla <kavyuushukla@gmail.com>
// SPDX-License-Identifier: GPL-2.0-only

package authenticate

import (
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/fossology/LicenseDb/pkg/api"
	"github.com/fossology/LicenseDb/pkg/models"
	"github.com/gin-gonic/gin"
)

func CreateUser(c *gin.Context) {
	var user models.User
	err := c.ShouldBindJSON(&user)
	if err != nil {
		er := models.LicenseError{
			Status:    http.StatusBadRequest,
			Message:   fmt.Sprintf("invalid request"),
			Error:     err.Error(),
			Path:      c.Request.URL.Path,
			Timestamp: time.Now().Format(time.RFC3339),
		}
		c.JSON(http.StatusBadRequest, er)
		return
	}

	result := api.DB.Create(&user)
	if result.Error != nil {
		er := models.LicenseError{
			Status:    http.StatusInternalServerError,
			Message:   fmt.Sprintf("internal Server Error"),
			Error:     result.Error.Error(),
			Path:      c.Request.URL.Path,
			Timestamp: time.Now().Format(time.RFC3339),
		}
		c.JSON(http.StatusInternalServerError, er)
		return
	}
	res := models.UserResponse{
		Data:   []models.User{user},
		Status: http.StatusOK,
		Meta: models.Meta{
			ResourceCount: 1,
		},
	}

	c.JSON(http.StatusOK, res)
}

func GetAllUser(c *gin.Context) {
	var users []models.User
	err := api.DB.Find(&users).Error
	if err != nil {
		er := models.LicenseError{
			Status:    http.StatusBadRequest,
			Message:   fmt.Sprintf("invalid request"),
			Error:     err.Error(),
			Path:      c.Request.URL.Path,
			Timestamp: time.Now().Format(time.RFC3339),
		}
		c.JSON(http.StatusBadRequest, er)
	}
	res := models.UserResponse{
		Data:   users,
		Status: http.StatusOK,
		Meta: models.Meta{
			ResourceCount: 1,
		},
	}

	c.JSON(http.StatusOK, res)
}

func GetUser(c *gin.Context) {
	var user models.User
	id := c.Param("id")
	err := api.DB.Where("id = ?", id).First(&user).Error
	if err != nil {
		er := models.LicenseError{
			Status:    http.StatusBadRequest,
			Message:   fmt.Sprintf("invalid request"),
			Error:     err.Error(),
			Path:      c.Request.URL.Path,
			Timestamp: time.Now().Format(time.RFC3339),
		}
		c.JSON(http.StatusBadRequest, er)
	}
	res := models.UserResponse{
		Data:   []models.User{user},
		Status: http.StatusOK,
		Meta: models.Meta{
			ResourceCount: 1,
		},
	}

	c.JSON(http.StatusOK, res)
}

func AuthenticationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			err := errors.New("authentication failed")
			er := models.LicenseError{
				Status:    http.StatusBadRequest,
				Message:   fmt.Sprintf("Please check your credentials and try again"),
				Error:     err.Error(),
				Path:      c.Request.URL.Path,
				Timestamp: time.Now().Format(time.RFC3339),
			}

			c.JSON(http.StatusUnauthorized, er)
			c.Abort()
			return
		}

		decodedAuth, err := base64.StdEncoding.DecodeString(strings.TrimPrefix(authHeader, "Basic "))
		if err != nil {
			er := models.LicenseError{
				Status:    http.StatusBadRequest,
				Message:   fmt.Sprintf("Please check your credentials and try again"),
				Error:     err.Error(),
				Path:      c.Request.URL.Path,
				Timestamp: time.Now().Format(time.RFC3339),
			}

			c.JSON(http.StatusBadRequest, er)
			c.Abort()
			return
		}

		auth := strings.SplitN(string(decodedAuth), ":", 2)
		if len(auth) != 2 {
			c.AbortWithStatus(http.StatusBadRequest)
			return
		}

		username := auth[0]
		password := auth[1]

		var user models.User
		result := api.DB.Where("username = ?", username).First(&user)
		if result.Error != nil {
			er := models.LicenseError{
				Status:    http.StatusUnauthorized,
				Message:   fmt.Sprintf("User name not found"),
				Error:     result.Error.Error(),
				Path:      c.Request.URL.Path,
				Timestamp: time.Now().Format(time.RFC3339),
			}

			c.JSON(http.StatusUnauthorized, er)
			c.Abort()
			return
		}

		// Check if the password matches
		if user.Userpassword != password {
			er := models.LicenseError{
				Status:    http.StatusUnauthorized,
				Message:   fmt.Sprintf("Incorrect password"),
				Error:     result.Error.Error(),
				Path:      c.Request.URL.Path,
				Timestamp: time.Now().Format(time.RFC3339),
			}

			c.JSON(http.StatusUnauthorized, er)
			c.Abort()
			return
		}

		c.Next()
	}
}
