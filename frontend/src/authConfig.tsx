import { Configuration, LogLevel, PopupRequest } from "@azure/msal-browser";

// Config object to be passed to Msal on creation
export const msalConfig: Configuration = {
  auth: {
    clientId: "b103ff06-55d1-4623-bec0-b7e4a3738dc8",
    redirectUri: "/",
    postLogoutRedirectUri: "/",
  },
  //   system: {
  //     loggerOptions: {
  //       loggerCallback: (level, message, containsPii) => {
  //         if (containsPii) {
  //           return;
  //         }
  //         switch (level) {
  //           case LogLevel.Error:
  //             console.error(message);
  //             return;
  //           case LogLevel.Info:
  //             console.info(message);
  //             return;
  //           case LogLevel.Verbose:
  //             console.debug(message);
  //             return;
  //           case LogLevel.Warning:
  //             console.warn(message);
  //             return;
  //           default:
  //             return;
  //         }
  //       },
  //     },
  //   },
};

// Add here scopes for id token to be used at MS Identity Platform endpoints.
export const loginRequest: PopupRequest = {
  scopes: ["User.Read"],
};

// Add here the endpoints for MS Graph API services you would like to use.
export const graphConfig = {
  graphMeEndpoint: "https://graph.microsoft.com/v1.0/me",
};
