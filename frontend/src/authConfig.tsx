import { Configuration, LogLevel, PopupRequest } from "@azure/msal-browser";

// Config object to be passed to Msal on creation
export const msalConfig: Configuration = {
  auth: {
    clientId: "b103ff06-55d1-4623-bec0-b7e4a3738dc8",
    redirectUri: "/",
    postLogoutRedirectUri: "/",
  },
};

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest: PopupRequest = {
  scopes: ["openid", "profile", "email", "User.Read"],
};

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};
