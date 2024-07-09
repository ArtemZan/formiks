package logger

import (
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

func LogHandlerError(c *gin.Context, message string, err error) {
	log.Error().Str("message", message).Err(err).Str("uri", c.Request.RequestURI).Send()
}
