import { useEffect, useState } from "react";
import { Switch, Route, useHistory, Redirect } from "react-router-dom";

import { MsalAuthenticationTemplate, MsalProvider } from "@azure/msal-react";
import { InteractionType, IPublicClientApplication } from "@azure/msal-browser";
import { CustomNavigationClient } from "./utils/NavigationClient";
import Layout from "./components/Layout";

import ProjectExplorer from "./pages/Projects/Explorer";
import ProjectEditor from "./pages/Projects/Editor";
import ProjectViewer from "./pages/Projects/Viewer";

import DraftExplorer from "./pages/Drafts/Explorer";

import SubmissionViewer from "./pages/Submissions/Viewer";

import SubmissionsTable from "./pages/Submissions/Table";

import DropdownExplorer from "./pages/Dropdowns/Explorer";
import DropdownEditor from "./pages/Dropdowns/Editor";
import { RestAPI } from "./api/rest";
import { ToastContainer, Slide } from "react-toastify";
import { loginRequest } from "./authConfig";
import ReportsTable from "./pages/ReportsTable";

type AppProps = {
  pca: IPublicClientApplication;
};

function App({ pca }: AppProps) {
  const history = useHistory();
  const navigationClient = new CustomNavigationClient(history);
  const [isAdmin, setAdminRole] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

  pca.setNavigationClient(navigationClient);

  useEffect(() => {
    RestAPI.getRoles().then((response) =>
      setAdminRole(response.data.includes("Administrator"))
    );

    RestAPI.getRoles().then((response) => {
      setRoles(response.data);
    });
  }, []);

  return (
    <MsalProvider instance={pca}>
      <MsalAuthenticationTemplate
        interactionType={InteractionType.Redirect}
        authenticationRequest={loginRequest}
      >
        {" "}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          closeButton={false}
          transition={Slide}
        />
        <Switch>
          <Layout>
            {/* <Route exact path="/" component={Dashboard} /> */}
            <Route
              exact
              path="/"
              render={(props) => <ProjectExplorer roles={roles} {...props} />}
            />
            <Route
              exact
              path="/explorer"
              render={(props) => <ProjectExplorer roles={roles} {...props} />}
            />
            <Route
              exact
              path="/projects"
              render={(props) => <ProjectExplorer roles={roles} {...props} />}
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
              path="/drafts"
              render={(props) => <DraftExplorer isAdmin={isAdmin} {...props} />}
            />
            <Route
              path="/submissions/view/:id"
              render={(props) => (
                <SubmissionViewer isAdmin={isAdmin} create={false} {...props} />
              )}
            />
            <Route
              path="/drafts/view/:id"
              render={(props) => (
                <SubmissionViewer
                  isDraft={true}
                  isAdmin={isAdmin}
                  create={true}
                  {...props}
                />
              )}
            />
            <Route
              exact
              path="/submissions"
              render={(props) => <SubmissionsTable {...props} roles={roles} />}
            />
            <Route
              exact
              path="/reports"
              render={(props) => <ReportsTable {...props} />}
            />
            <Route
              exact
              path="/dropdowns"
              render={(props) => (
                <DropdownExplorer isAdmin={isAdmin} {...props} />
              )}
            />
            <Route
              path="/dropdowns/create"
              render={(props) => <DropdownEditor create={true} {...props} />}
            />
            <Route
              path="/dropdowns/edit/:id"
              render={(props) => <DropdownEditor create={false} {...props} />}
            />
          </Layout>
        </Switch>
      </MsalAuthenticationTemplate>
    </MsalProvider>
  );
}

export default App;
