package msal

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt"

	"github.com/doublegrey/formiks/backend/network"
	"github.com/doublegrey/formiks/backend/repositories"

	"github.com/gin-gonic/gin"
)

var (
	EnableGuests bool
	PubKey       []byte
	UserRepo     repositories.UserRepo
)

type Discovery struct {
	Keys []struct {
		Kty string   `json:"kty"`
		Use string   `json:"use"`
		Kid string   `json:"kid"`
		X5T string   `json:"x5t"`
		N   string   `json:"n"`
		E   string   `json:"e"`
		X5C []string `json:"x5c"`
	} `json:"keys"`
}

type Payload struct {
	Aud               string `json:"aud"`
	Iss               string `json:"iss"`
	Iat               int    `json:"iat"`
	Nbf               int    `json:"nbf"`
	Exp               int    `json:"exp"`
	Aio               string `json:"aio"`
	Email             string `json:"email"`
	Name              string `json:"name"`
	Nonce             string `json:"nonce"`
	Oid               string `json:"oid"`
	PreferredUsername string `json:"preferred_username"`
	Rh                string `json:"rh"`
	Sub               string `json:"sub"`
	Tid               string `json:"tid"`
	Uti               string `json:"uti"`
	Ver               string `json:"ver"`
}

type Header struct {
	Typ string `json:"typ"`
	Alg string `json:"alg"`
	X5T string `json:"x5t"`
	Kid string `json:"kid"`
}

// Admin middleware executes the pending handlers only if user has 'administrator' role
func Admin() gin.HandlerFunc {
	return func(c *gin.Context) {
		if roles, exists := c.Get("Roles"); exists {
			for _, role := range roles.([]string) {
				if role == "administrator" {
					c.Next()
					return
				}
			}
		}
		c.AbortWithStatus(http.StatusForbidden)
	}
}

func SetRoles() gin.HandlerFunc {
	return func(c *gin.Context) {
		name, email, roles := getRolesIfValid(c.Request.Context(), c.Request.Header.Get("Authorization"))
		if len(roles) < 1 {
			// return 401 if ENABLE_GUESTS is not set
			if EnableGuests {
				roles = []string{"guest"}
			} else {
				c.AbortWithStatus(http.StatusForbidden)
				return
			}
		}
		c.Set("Name", name)
		c.Set("Email", email)
		c.Set("Roles", roles)
		c.Next()
	}
}

func getRolesIfValid(ctx context.Context, token string) (string, string, []string) {
	var roles []string
	var name string
	var email string
	split := strings.Split(token, " ")
	token = split[len(split)-1]

	if token == "" || len(strings.Split(token, ".")) < 3 {
		return name, email, roles
	}
	payloadBytes, err := base64.RawStdEncoding.DecodeString(strings.Split(token, ".")[1])
	if err != nil {
		return name, email, roles
	}
	var payload Payload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return name, email, roles
	}
	email = payload.Email
	name = payload.Name
	headerBytes, err := base64.RawStdEncoding.DecodeString(strings.Split(token, ".")[0])
	if err != nil {
		return name, email, roles
	}
	var header Header
	if err := json.Unmarshal(headerBytes, &header); err != nil {
		return name, email, roles
	}

	if !validToken(token, header.Kid) || len(email) < 1 || payload.tokenExpired() {
		return name, email, roles
	}

	user, _ := UserRepo.FetchByEmail(ctx, strings.ToLower(email))
	if len(user.Roles) > 0 {
		roles = user.Roles
	}

	return name, email, roles
}

func validToken(token, kid string) bool {
	pKey, err := getPubKey(kid)
	if err != nil {
		return false
	}
	key, err := jwt.ParseRSAPublicKeyFromPEM(pKey)
	if err != nil {
		return false
	}
	parts := strings.Split(token, ".")
	err = jwt.SigningMethodRS256.Verify(strings.Join(parts[0:2], "."), parts[2], key)
	return err == nil
}

func getPubKey(kid string) ([]byte, error) {
	if len(PubKey) > 0 {
		return PubKey, nil
	}
	// client := &http.Client{}
	client := network.Client
	req, _ := http.NewRequest(http.MethodGet, "https://login.microsoftonline.com/common/discovery/keys", nil)
	resp, _ := client.Do(req)
	body, err := ioutil.ReadAll(resp.Body)
	var response Discovery
	if err == nil {
		if err := json.Unmarshal(body, &response); err == nil {
			for _, key := range response.Keys {
				if key.Kid == kid {
					PubKey = []byte(fmt.Sprintf("-----BEGIN PUBLIC KEY-----\n%s\n-----END PUBLIC KEY-----", key.X5C[0]))
					return PubKey, nil
				}
			}
		}
	}
	return []byte{}, errors.New("failed to parse public key")
}

func (p Payload) tokenExpired() bool {
	expiration := time.Unix(int64(p.Exp), 0).Add(time.Hour)
	return !expiration.After(time.Now())
}
