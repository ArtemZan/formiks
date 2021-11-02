import React, { useEffect, useState } from "react";
import { Switch, Route, useHistory } from "react-router-dom";
import "./App.css";

import { MsalProvider } from "@azure/msal-react";
import { IPublicClientApplication } from "@azure/msal-browser";
import { CustomNavigationClient } from "./utils/NavigationClient";

import { Explorer } from "./pages/Explorer";
import { Profile } from "./pages/Profile";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";

import ProjectExplorer from "./pages/Projects/Explorer";
import ProjectEditor from "./pages/Projects/Editor";
import ProjectViewer from "./pages/Projects/Viewer";

import SubmissionExplorer from "./pages/Submissions/Explorer";
import { RestAPI } from "./api/rest";

type AppProps = {
  pca: IPublicClientApplication;
};

function App({ pca }: AppProps) {
  const history = useHistory();
  const navigationClient = new CustomNavigationClient(history);
  const [isAdmin, setAdminRole] = useState(false);
  pca.setNavigationClient(navigationClient);

  useEffect(() => {
    RestAPI.getRoles().then((response) =>
      setAdminRole(response.data.includes("administrator"))
    );
  }, []);

  return (
    <MsalProvider instance={pca}>
      <Switch>
        <Layout>
          <Route exact path="/" component={Dashboard} />
          <Route path="/profile">
            <Profile />
          </Route>
          <Route path="/explorer">
            <Explorer />
          </Route>
          <Route
            exact
            path="/projects"
            render={(props) => <ProjectExplorer isAdmin={isAdmin} {...props} />}
          />
          <Route
            path="/projects/create"
            render={(props) => <ProjectEditor create={true} {...props} />}
          />
          <Route
            path="/projects/edit/:id"
            render={(props) => <ProjectEditor create={false} {...props} />}
          />
          <Route
            path="/projects/view/:id"
            render={(props) => (
              <ProjectViewer isAdmin={isAdmin} create={false} {...props} />
            )}
          />
          <Route
            exact
            path="/submissions"
            render={(props) => <SubmissionExplorer {...props} />}
          />
        </Layout>
      </Switch>
    </MsalProvider>
  );
}

export default App;
