# SPDX-License-Identifier: GPL-2.0-only
# Makefile for LicenseDB
# Usage: make <target>

.PHONY: help setup install generate build run migrate test docker-up docker-down docker-logs clean

APP_NAME := laas
DOCKER_SERVICE := licensedb
MIGRATION_PATH := pkg/db/migrations
DB_URL := postgres://fossy:fossy@localhost:5432/licensedb?sslmode=disable

## Show available commands
help:
	@echo ""
	@echo "LicenseDB - available make targets:"
	@echo ""
	@echo "  setup        Install deps, generate code, and build"
	@echo "  install      Download Go dependencies"
	@echo "  generate     Generate Go code"
	@echo "  build        Build LicenseDB binary"
	@echo "  run          Run LicenseDB locally"
	@echo "  migrate      Run database migrations"
	@echo "  test         Run test suite"
	@echo "  docker-up    Start services using Docker Compose"
	@echo "  docker-down  Stop Docker Compose services"
	@echo "  docker-logs  Follow LicenseDB container logs"
	@echo "  clean        Remove built artifacts"
	@echo ""

## Install Go dependencies
install:
	go mod download

## Generate Go structs (external reference fields)
generate:
	go generate ./...

## Build the LicenseDB binary
build:
	go build -o $(APP_NAME) ./cmd/laas

## Run LicenseDB locally
run:
	go run ./cmd/laas

## Run database migrations (requires golang-migrate CLI)
migrate:
	migrate -path $(MIGRATION_PATH) -database "$(DB_URL)" up

## Run Go tests
test:
	go test ./... -v

## Setup local development environment
setup: install generate build
	@echo "Local development setup completed."

## Start services using Docker Compose
docker-up:
	docker compose up -d

## Stop Docker Compose services
docker-down:
	docker compose down

## Follow LicenseDB container logs
docker-logs:
	docker logs -f $(DOCKER_SERVICE)

## Clean build artifacts
clean:
	rm -f $(APP_NAME)
