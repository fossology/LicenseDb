// SPDX-FileCopyrightText: 2025 Chayan Das <01chayandas@gmail.com>
// SPDX-License-Identifier: GPL-2.0-only

package log

import "go.uber.org/zap"

var logger *zap.Logger

func LogInfo(msg string, fields ...zap.Field) {
	logger.Info(msg, fields...)

}

func LogError(msg string, fields ...zap.Field) {
	logger.Error(msg, fields...)
}

func LogWarn(msg string, fields ...zap.Field) {
	logger.Warn(msg, fields...)
}

func LogFatal(msg string, fields ...zap.Field) {
	logger.Fatal(msg, fields...)
}

func LogDebug(msg string, fields ...zap.Field) {
	logger.Debug(msg, fields...)
}
func init() {

	cfg := zap.NewProductionConfig()
	cfg.Level = zap.NewAtomicLevelAt(zap.DebugLevel)
	cfg.DisableStacktrace = true
	baseLogger, _ := cfg.Build()
	logger = baseLogger.WithOptions(zap.AddCallerSkip(1))
}
