import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import axios from "axios";
import { PublicClientApplication } from "@azure/msal-browser";
import { loginRequest } from "../authConfig"; // adjust the import to your file structure

interface GroupContextProps {
  isMember: boolean;
}

const GroupContext = createContext<GroupContextProps | undefined>(undefined);

interface GroupProviderProps {
  children: ReactNode;
  pca: PublicClientApplication;
}

export const GroupProvider: React.FC<GroupProviderProps> = ({
  children,
  pca,
}) => {
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const account = pca.getActiveAccount();
    // if (account) {
    //   pca
    //     .acquireTokenSilent({
    //       ...loginRequest,
    //       account: account,
    //     })
    //     .then((response) => {
    //       axios
    //         .get("https://graph.microsoft.com/v1.0/me/memberOf", {
    //           headers: {
    //             Authorization: `Bearer ${response.accessToken}`,
    //           },
    //         })
    //         .then((response) => {
    //           const isMember = response.data.value.some(
    //             (group: any) => group.id === "YOUR_GROUP_ID"
    //           );
    //           console.log("isMember", isMember);
    //           setIsMember(isMember);
    //         })
    //         .catch((error) => {
    //           console.error("Error getting user groups", error);
    //         });
    //     })
    //     .catch((error) => {
    //       console.error("Failed to acquire token silently", error);
    //     });
    // }
  }, [pca]);

  return (
    <GroupContext.Provider value={{ isMember }}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error("useGroup must be used within a GroupProvider");
  }
  return context;
};
