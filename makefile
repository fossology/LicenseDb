# SPDX-FileCopyrightText:  2025 Chayan Das <01chayandas@gmail.com>
# SPDX-License-Identifier: GPL-2.0-only


# ==============================================================================
# Makefile for LicenseDB
# ==============================================================================
include Backend/.env

DB_URL=postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable
MIGRATION_PATH=./Backend/pkg/db/migrations
DC=docker compose
BACKEND_SERVICE=licensedb
FRONTEND_SERVICE=licensedb-ui
POSTGRES_SERVICE=postgres

# Declare all targets as phony (they don't create files with these names)
.PHONY: help dev build test test-verbose import-licenses test-coverage test-individual test-file test-func test-watch quick-test fmt lint clean deps create-migration migrate-up migrate-down migrate-force frontend-setup frontend-lint frontend-format frontend-build

# Default target - show help
help:
	@echo "LicenseDB - Available Commands"
	@echo "========================================"
	@echo ""
	@echo "Development Commands:"
	@echo "  make generate             - Generate Go structs from external_ref_fields.yaml"
	@echo "  make import-licenses      - Download licenseRef.json from Fossology and import licenses into the database (ensure DB is running)"
	@echo "  make build                - Build the Go application"
	@echo "  make run                  - Run backend server (go run)"
	@echo "  make run-frontend         - Run frontend (npm start)"
	@echo "  make run-all              - Run both backend and frontend"
	@echo "  make help                 - Display available commands (default target)"
	@echo ""
	@echo "Testing Commands:"
	@echo "  make test                 - Run all API tests"
	@echo "  make test-verbose         - Run tests with verbose output"
	@echo "  make test-coverage        - Run tests with coverage report (generates coverage.html)"
	@echo "  make test-individual      - Run each test file individually"
	@echo "  make test-file FILE=NAME  - Run specific test file"
	@echo ""
	@echo "Code Quality Commands:"
	@echo "  make fmt                  - Format Go code"
	@echo "  make lint                 - Run golangci-lint on Backend"
	@echo "  make frontend-lint        - Run frontend linter"
	@echo "  make frontend-format      - Run frontend code formatter and linter auto-fix"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make docker-build         - Build all Docker images"
	@echo "  make docker-up            - Start all containers in detached mode"
	@echo "  make docker-down          - Stop all containers"
	@echo "  make docker-restart       - Rebuild and restart containers"
	@echo "  make docker-logs          - Tail logs for all containers"
	@echo "  make docker-logs-backend  - Tail logs for backend only"
	@echo "  make docker-logs-frontend - Tail logs for frontend only"
	@echo "  make docker-clean         - Remove containers, volumes, and networks"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make clean                - Clean test cache and temporary files"
	@echo "  make deps                 - Install and tidy Go and Node.js dependencies"
	@echo ""
	@echo "Database Migration Commands:"
	@echo "  make create-migration     - Create a new database migration file"
	@echo "  make migrate-up           - Apply all pending database migrations"
	@echo "  make migrate-down         - Rollback last N database migrations"
	@echo "  make migrate-force        - Force a specific migration version (e.g., when tables already exist)"
	@echo "  make migrate-version      - Show the current version of the migration"

# ==============================================================================
# Development Commands
# ==============================================================================
generate:
	cd Backend
	@echo "Generating Go structs from external_ref_fields.yaml..."
	cp Backend/external_ref_fields.example.yaml Backend/external_ref_fields.yaml
	@echo "Please edit external_ref_fields.yaml as needed..."
	vim Backend/external_ref_fields.yaml
	cd Backend && go generate ./...
	@echo "Struct generation complete"


# Build the application
build:
	@echo "Building Go application..."
	cd Backend && go build -o ./lass ./cmd/laas/main.go
	@echo "Build complete: Backend/lass"

# Run the application
run:
	@read -p "Populate DB? (true/false): " populate; \
	echo " Running LicenseDB backend..."; \
	if [ "$$populate" = "true" ]; then \
		if [ ! -f Backend/licenseRef.json ]; then \
			read -p "licenseRef.json not found. Do you want to import licenses? (y/n): " runimport; \
			if [ "$$runimport" = "y" ]; then \
				$(MAKE) import-licenses; \
			else \
				echo "Skipping license import. Backend will run without populated DB."; \
				cd Backend && go run ./cmd/laas/main.go --populatedb=false & \
			fi \
		else \
			echo "licenseRef.json exists. Running backend with populated DB..."; \
			cd Backend && go run ./cmd/laas/main.go --populatedb=true & \
		fi \
	else \
		cd Backend && go run ./cmd/laas/main.go & \
	fi
run-frontend:
	@echo "Running Frontend..."
	@cd Frontend && npm start
	@echo "Frontend stopped"

run-all:
	@$(MAKE) run
	@$(MAKE) run-frontend

import-licenses:
	@echo "Downloading licenseRef.json from Fossology..."
	@wget -q https://raw.githubusercontent.com/fossology/fossology/master/install/db/licenseRef.json -O Backend/licenseRef.json
	@echo "Download complete: Backend/licenseRef.json"
	@echo "Importing licenses into database..."
	cd Backend && go run ./cmd/laas/main.go --populatedb=true
	@echo "Licenses imported successfully!"
# ==============================================================================
# Testing Commands
# ==============================================================================

# Run all API tests
test:
	@echo "Running all tests..."
	cd Backend && go test ./... -v

# Run tests with verbose output
test-verbose:
	@echo "Running tests with verbose output..."
	cd Backend && go test ./... -v -count=1

# Run tests with coverage report
test-coverage:
	@echo "Running tests with coverage report..."
	cd Backend && go test ./... -coverprofile=coverage.out
	cd Backend && go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html"

# Run each test file individually
test-individual:
	@echo "Running each test file individually..."
	@cd Backend && \
	for file in $$(find . -name "*_test.go" -not -path "./vendor/*"); do \
		echo "Testing: $$file"; \
		go test $$(dirname $$file) -v; \
	done


# Run specific test file
test-file:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make test-file FILE=filename"; \
		echo "Example: make test-file FILE=auth"; \
	else \
		echo "Running tests in file: $(FILE)"; \
		go test ./test/$(FILE) -v; \
	fi

# ==============================================================================
# Code Quality Commands
# ==============================================================================

# Format Go code
fmt:
	@echo "Formatting Go code..."
	go fmt ./...
	@echo "Code formatting complete"

# Run golangci linter
lint:
	@echo "Running golangci-lint on Backend..."
	cd Backend && golangci-lint run ./...
	@echo "Linting complete"

# Run linter
frontend-lint: 
	@echo "Running frontend linter..."
	cd Frontend && npm run lint
	@echo "Frontend linting complete."

# Run prettier / format chec
frontend-format: 
	@echo "Running frontend code formatter and linter auto-fix..."
	cd Frontend && npm run prettier && npm run lint-fix
	@echo "Frontend formatting and linting complete."

# ==============================================================================
# Utility Commands
# ==============================================================================

# Clean test cache and temporary files
clean:
	@echo "Cleaning test cache and temporary files..."
	cd Backend && go clean -testcache
	cd Backend && rm -f coverage.out coverage.html
	cd Backend && rm -f Backend/licenseRef.json
	@echo "Cleanup complete"

# Install and tidy Go dependencies
deps:
	@echo "Installing and tidying Go dependencies for Backend..."
	@cd Backend && go mod download && go mod tidy
	@echo "Backend dependencies updated."

	@echo "Installing and tidying dependencies for Frontend..."
	@cd Frontend && npm install
	@echo "Frontend dependencies updated."


# Database Migration Commands
create-migration:
	@read -p "Enter migration name: " name; \
	migrate create -ext sql -dir ${MIGRATION_PATH} -seq $${name}

migrate-up:
	@migrate -path=${MIGRATION_PATH} -database "${DB_URL}" up

migrate-down:
	@read -p "Number of migrations you want to rollback (default: 1): " NUM; \
	NUM=$${NUM:-1}; \
	migrate -path=${MIGRATION_PATH} -database "${DB_URL}" down $${NUM}

migrate-force:
	@read -p "Enter the version to force: " VERSION; \
	migrate -path=${MIGRATION_PATH} -database "${DB_URL}" force $${VERSION}

migrate-version:
	@migrate -path=${MIGRATION_PATH} -database "${DB_URL}" version


# ============================
# Docker Compose Targets
# ============================
.PHONY: docker-build docker-up docker-down docker-restart docker-logs docker-logs-backend docker-logs-frontend docker-clean

docker-build:
	$(DC) build

docker-up:
	$(DC) up -d
	@echo "licensedb backend: http://localhost:8080"
	@echo "licensedb-ui frontend: http://localhost:3000"

docker-down:
	$(DC) down

docker-restart:
	$(DC) up -d --build

docker-logs:
	$(DC) logs -f

docker-logs-backend:
	$(DC) logs -f $(BACKEND_SERVICE)

docker-logs-frontend:
	$(DC) logs -f $(FRONTEND_SERVICE)

docker-clean:
	$(DC) down -v --remove-orphans