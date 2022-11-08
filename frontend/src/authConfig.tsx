import { Configuration, LogLevel, RedirectRequest } from "@azure/msal-browser";

// Config object to be passed to Msal on creation
export const msalConfig: Configuration = {
  auth: {
    clientId: "c6c34032-5419-4fdf-bbd4-a863814323b7",
    redirectUri: "/",
    postLogoutRedirectUri: "/",
  },
};

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest: RedirectRequest = {
  scopes: ["User.Read", "email"],
};

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};
