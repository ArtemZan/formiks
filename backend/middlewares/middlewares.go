package middlewares

import (
	"os"
	"strings"

	"github.com/doublegrey/formiks/backend/driver"
	"github.com/doublegrey/formiks/backend/middlewares/cors"
	"github.com/doublegrey/formiks/backend/middlewares/msal"
	"github.com/doublegrey/formiks/backend/repositories/user"
	"github.com/gin-gonic/gin"
)

func Setup(r *gin.Engine) {
	enableGuests := false
	if strings.ToLower(os.Getenv("ENABLE_GUESTS")) == "true" {
		enableGuests = true
	}
	msal.EnableGuests = enableGuests
	msal.UserRepo = user.NewUserRepo(driver.Conn.Mongo)
	r.Use(cors.AllowAll())
	r.Use(msal.SetRoles())
}
