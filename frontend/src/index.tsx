import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./App";
import {
  ChakraProvider,
  ColorModeProvider,
  extendTheme,
} from "@chakra-ui/react";
import { RestAPI } from "./api/rest";
import { mode } from "@chakra-ui/theme-tools";
import "focus-visible/dist/focus-visible";
import { Global, css } from "@emotion/react";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";
import "rsuite/dist/rsuite.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { GroupProvider } from "./utils/GroupContext";
import { Button, useColorMode } from "@chakra-ui/react";

// MSAL imports
import {
  PublicClientApplication,
  EventType,
  EventMessage,
  AuthenticationResult,
  InteractionType,
} from "@azure/msal-browser";
import {
  AuthenticatedTemplate,
  MsalAuthenticationTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { msalConfig, loginRequest } from "./authConfig";

const GlobalStyles = css`
  /*
    This will hide the focus indicator if the element receives focus    via the mouse,
    but it will still show up on keyboard focus.
  */
  .js-focus-visible :focus:not([data-focus-visible-added]) {
    outline: none;
    box-shadow: none;
  }
`;

export const msalInstance = new PublicClientApplication(msalConfig);

function checkUserGroupMembership() {
  axios
    .get("https://graph.microsoft.com/v1.0/me/memberOf", {
      headers: {
        // The Authorization header will be automatically added by the interceptor
      },
    })
    .then((response) => {
      const groups = response.data.value;
      const isMember = groups.some(
        (group: any) => group.id === "YOUR_GROUP_ID"
      );
      if (isMember) {
        console.log("User is a member of the group");
      } else {
        console.log("User is not a member of the group");
      }
    })
    .catch((error) => {
      console.error("Error getting user groups", error);
    });
}

msalInstance.addEventCallback((event: EventMessage) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const payload = event.payload as AuthenticationResult;
    const account = payload.account;
    msalInstance.setActiveAccount(account);
  }
});

axios.interceptors.request.use(async (config: any) => {
  const account = msalInstance.getActiveAccount();

  if (account) {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: account,
    });
    config.headers.Authorization = `${response.accessToken}`;
  }
  return config;
});

// checkUserGroupMembership();

// axios.interceptors.request.use(async (config: any) => {
//   const account = msalInstance.getActiveAccount();
//   RestAPI.getRolesAD(account ? await account.idTokenClaims : null);
// });

ReactDOM.render(
  <ChakraProvider
    theme={extendTheme({
      styles: {
        global: (props: any) => ({
          body: {
            bg: mode("#ffffff", "#b2b2b2")(props),
            color: mode("gray.800", "#ABB2BF")(props),
          },
        }),
      },
      config: {
        initialColorMode: "light", // Set the initial color mode to light
        useSystemColorMode: false, // Optional: set to `false` to prevent automatically using the system color mode
      },
    })}
  >
    <Global styles={GlobalStyles} />
    <Router>
      <GroupProvider pca={msalInstance}>
        <App pca={msalInstance} />
      </GroupProvider>
    </Router>
  </ChakraProvider>,
  document.getElementById("root")
);
