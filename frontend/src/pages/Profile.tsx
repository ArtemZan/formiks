import { useEffect, useState } from "react";

// Msal imports
import { MsalAuthenticationTemplate, useMsal } from "@azure/msal-react";
import {
  InteractionStatus,
  InteractionType,
  InteractionRequiredAuthError,
  AccountInfo,
} from "@azure/msal-browser";
import { loginRequest } from "../authConfig";
import { getAccountInfo, getUserPhoto } from "../utils/MsGraphApiCall";

export type GraphData = {
  displayName: string;
  jobTitle: string;
  mail: string;
  businessPhones: string[];
  officeLocation: string;
};

const ProfileContent = () => {
  const { instance, inProgress } = useMsal();

  const [graphData, setGraphData] = useState<null | GraphData>(null);
  const [userPhoto, setUserPhoto] = useState<undefined | string>(undefined);

  useEffect(() => {
    if (!userPhoto && inProgress === InteractionStatus.None) {
      getUserPhoto().then((response) => setUserPhoto(response));
    }
    if (!graphData && inProgress === InteractionStatus.None) {
      getAccountInfo()
        .then((response) => setGraphData(response))
        .catch((e) => {
          if (e instanceof InteractionRequiredAuthError) {
            instance.acquireTokenRedirect({
              ...loginRequest,
              account: instance.getActiveAccount() as AccountInfo,
            });
          }
        });
    }
  }, [inProgress, graphData, userPhoto, instance]);

  return (
    <div>
      {JSON.stringify(graphData)} <img alt="" src={userPhoto} />
    </div>
  );
};

export function Profile() {
  const authRequest = {
    ...loginRequest,
  };

  return (
    <MsalAuthenticationTemplate
      interactionType={InteractionType.Redirect}
      authenticationRequest={authRequest}
      //   errorComponent={ErrorComponent}
      //   loadingComponent={Loading}
    >
      <ProfileContent />
    </MsalAuthenticationTemplate>
  );
}
