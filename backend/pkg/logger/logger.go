package logger

import (
	"go.uber.org/zap"
)

type Logger struct {
	*zap.SugaredLogger
}

func NewLogger(level string) *Logger {
	var config zap.Config
	if level == "production" {
		config = zap.NewProductionConfig()
	} else {
		config = zap.NewDevelopmentConfig()
	}

	logger, _ := config.Build()
	return &Logger{logger.Sugar()}
}
