import { loginRequest, graphConfig } from "../authConfig";
import { msalInstance } from "../index";

export async function getAccountInfo() {
  const account = msalInstance.getActiveAccount();
  if (!account) {
    return;
  }

  const response = await msalInstance.acquireTokenSilent({
    ...loginRequest,
    account: account,
  });

  const headers = new Headers();
  const bearer = `Bearer ${response.accessToken}`;

  headers.append("Authorization", bearer);

  const options = {
    method: "GET",
    headers: headers,
  };

  return fetch(graphConfig.graphMeEndpoint, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
}

export async function getUserPhoto() {
  const account = msalInstance.getActiveAccount();
  if (!account) {
    return;
  }

  const response = await msalInstance.acquireTokenSilent({
    ...loginRequest,
    account: account,
  });

  var url = "https://graph.microsoft.com/v1.0/me/photo/$value";

  return fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${response.accessToken}`,
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.blob())
    .then((photoBlob) => URL.createObjectURL(photoBlob));
}
