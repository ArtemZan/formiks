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
	msal.ClientID = os.Getenv("MSAL_CLIENT")
	msal.AllowedDomains = strings.Split(os.Getenv("ALLOWED_EMAIL_DOMAINS"), ",")
	msal.UserRepo = user.NewUserRepo(driver.Conn.Mongo)
	r.Use(cors.AllowAll())
	r.Use(msal.SetRoles())
}
