import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./App";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import "focus-visible/dist/focus-visible";
import { Global, css } from "@emotion/react";
import axios from "axios";
import "rsuite/dist/rsuite.min.css";
import "./index.css";

// MSAL imports
import {
  PublicClientApplication,
  EventType,
  EventMessage,
  AuthenticationResult,
} from "@azure/msal-browser";
import { loginRequest, msalConfig } from "./authConfig";

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

// Account selection logic is app dependent. Adjust as needed for different use cases.
const accounts = msalInstance.getAllAccounts();
if (accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
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
    config.headers.Authorization = `Bearer ${response.idToken}`;
  }
  return config;
});

ReactDOM.render(
  <ChakraProvider
    theme={extendTheme({
      styles: {
        global: (props: any) => ({
          body: {
            bg: mode("#f7fafc", "#282C34")(props),
            color: mode("gray.800", "#ABB2BF")(props),
          },
        }),
      },
    })}
  >
    <Global styles={GlobalStyles} />
    <Router>
      {/* <ColorModeProvider options={{ initialColorMode: "dark" }}> */}
      <App pca={msalInstance} />
      {/* </ColorModeProvider> */}
    </Router>
  </ChakraProvider>,
  document.getElementById("root")
);
