import { InteractionRequiredAuthError } from "@azure/msal-browser";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import { Link as RouterLink } from "react-router-dom";
import WelcomeName from "../components/WelcomeName";
import { msalInstance } from "../index";

export function Explorer() {
  console.log(msalInstance.getActiveAccount());
  return (
    <>
      <AuthenticatedTemplate>
        <WelcomeName />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>unauthenticated</UnauthenticatedTemplate>
    </>
  );
}

export default Explorer;
