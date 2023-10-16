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
				roles = append(roles, "Administrator")
				// c.AbortWithStatus(http.StatusForbidden)
				fmt.Println("Unauthorized")
				return
			}
		}
		c.Set("Name", name)
		c.Set("Email", email)
		c.Set("Roles", roles)
		c.Next()
	}
}


// GraphResponse represents the response from Microsoft Graph API
type GraphResponse struct {
	Value []Group `json:"value"`
}

// Group represents a group object in Microsoft Graph API
type Group struct {
	ID   string `json:"id"`
	DisplayName string `json:"displayName"`
	// Add other necessary fields as per your requirement
}

func getUserGroups(token string) ([]Group, error) {
	url := "https://graph.microsoft.com/v1.0/me/memberOf"

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %v", err)
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Println("error making request: %v", err)
		return nil, fmt.Errorf("error making request: %v", err)
	}
	defer resp.Body.Close()
	fmt.Println("response", resp.Body)

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("error response from Graph API: %s", resp.Status)
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("error reading response body: %v", err)
	}

	var graphResponse GraphResponse
	if err := json.Unmarshal(body, &graphResponse); err != nil {
		return nil, fmt.Errorf("error unmarshalling response: %v", err)
	}

	return graphResponse.Value, nil
}

func getUserEmail(token string) (string, error) {
	url := "https://graph.microsoft.com/v1.0/me"
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Authorization", token)
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("error making request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("error response from Graph API: %s", resp.Status)
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("error reading response body: %v", err)
	}

	var userResponse struct {
		Mail string `json:"mail"`
	}
	if err := json.Unmarshal(body, &userResponse); err != nil {
		return "", fmt.Errorf("error unmarshalling response: %v", err)
	}

	return userResponse.Mail, nil
}


func getRolesIfValid(ctx context.Context, token string) (string, string, []string) {
	var roles []string
	var name string
	var email string
	var groups []Group

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
	//roles check
	groups, _ = getUserGroups(token)
	fmt.Println(groups)
	for _, group := range groups {
		if (group.ID == "1a9f7c85-d2ed-4526-b61f-362792d0a68a"){
			roles = append(roles, "Administrator")
		} else if (group.ID == "437f2b23-6fe4-4237-8c90-3adcbb71d62d"){
			roles = append(roles, "Accounting")
		} else if (group.ID == "5305c7f1-8cee-448c-a184-46cee385235b"){
			roles = append(roles, "Management")
		} else if (group.ID == "e09b9790-044a-42a9-953b-973e0a3c4bdf"){
			roles = append(roles, "Marketing")
		}
	}
	//roles check
	email = payload.Email
	name = payload.Name
	email, err = getUserEmail(token)
	fmt.Println(email)
	if err != nil {
		return name, email, roles
	}
	// user, _ := UserRepo.FetchByEmail(ctx, strings.ToLower(email))
	// if len(user.Roles) > 0 {
	// 	roles = user.Roles
	// }


	headerBytes, err := base64.RawStdEncoding.DecodeString(strings.Split(token, ".")[0])
	if err != nil {
		return name, email, roles
	}
	var header Header
	if err := json.Unmarshal(headerBytes, &header); err != nil {
		return name, email, roles
	}
	// if !validToken(token, header.Kid) || len(email) < 1 || payload.tokenExpired() {
	// 	return name, email, roles
	// }
	// user, _ := UserRepo.FetchByEmail(ctx, strings.ToLower(email))
	// if len(user.Roles) > 0 {
	// 	roles = user.Roles
	// }
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
	if err != nil {
		fmt.Println(err)
	}	
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
