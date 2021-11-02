package handlers

import (
	"errors"
	"net/http"
	"strings"

	"github.com/doublegrey/formiks/backend/driver"
	"github.com/doublegrey/formiks/backend/logger"
	"github.com/doublegrey/formiks/backend/models"
	"github.com/doublegrey/formiks/backend/repositories"
	"github.com/doublegrey/formiks/backend/repositories/user"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func NewUserHandler(db *driver.DB) *User {
	return &User{
		repo: user.NewUserRepo(db.Mongo),
	}
}

type User struct {
	repo repositories.UserRepo
}

func (u *User) Fetch(c *gin.Context) {
	users, err := u.repo.Fetch(c.Request.Context(), nil)
	if err != nil {
		logger.LogHandlerError(c, "Failed to fetch users", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, users)
}

func (u *User) Roles(c *gin.Context) {
	roles, exists := c.Get("Roles")
	// email, exists := c.Get("Email")
	// user, err := u.repo.FetchByEmail(c.Request.Context(), email.(string))

	if !exists {
		roles = []string{"guest"}
	}
	c.JSON(http.StatusOK, roles)
}

func (u *User) FetchByEmail(c *gin.Context) {
	email := strings.TrimSpace(c.Param("email"))
	if len(email) < 1 {
		logger.LogHandlerError(c, "Failed to parse email", errors.New("empty email param"))
		c.Status(http.StatusBadRequest)
		return
	}
	user, err := u.repo.FetchByEmail(c.Request.Context(), email)
	if err != nil {
		logger.LogHandlerError(c, "Failed to fetch project", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, user)
}

func (u *User) Create(c *gin.Context) {
	var user models.User
	err := c.BindJSON(&user)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}
	user, err = u.repo.Create(c.Request.Context(), user)
	if err != nil {
		logger.LogHandlerError(c, "Failed to create user", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	c.JSON(http.StatusOK, user)
}

func (u *User) Update(c *gin.Context) {
	var user models.User
	err := c.BindJSON(&user)
	if err != nil {
		logger.LogHandlerError(c, "Failed to bind request JSON", err)
		c.Status(http.StatusBadRequest)
		return
	}
	err = u.repo.Update(c.Request.Context(), user)
	status := http.StatusOK
	if err != nil {
		logger.LogHandlerError(c, "Failed to update user", err)
		status = http.StatusInternalServerError
	}
	c.Status(status)
}

func (u *User) Delete(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		logger.LogHandlerError(c, "Failed to convert hex to ObjectID", err)
		c.Status(http.StatusBadRequest)
		return
	}
	err = u.repo.Delete(c.Request.Context(), id)
	status := http.StatusOK
	if err != nil {
		logger.LogHandlerError(c, "Failed to delete user", err)
		status = http.StatusInternalServerError
	}
	c.Status(status)
}
