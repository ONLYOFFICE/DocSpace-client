import React from "react";
import { Navigate } from "react-router-dom";
import loadable from "@loadable/component";

import PrivateRoute from "@docspace/common/components/PrivateRoute";
import PublicRoute from "@docspace/common/components/PublicRoute";
import ErrorBoundary from "@docspace/common/components/ErrorBoundary";
import componentLoader from "@docspace/components/utils/component-loader";

import Error404 from "SRC_DIR/pages/Errors/404";
import FilesView from "SRC_DIR/pages/Home/View/Files";
import AccountsView from "SRC_DIR/pages/Home/View/Accounts";
import SettingsView from "SRC_DIR/pages/Home/View/Settings";

import { generalRoutes } from "./general";

const Client = loadable(() => componentLoader(() => import("../Client")));

const Home = loadable(() => componentLoader(() => import("../pages/Home")));

const Sdk = loadable(() => componentLoader(() => import("../pages/Sdk")));

const FormGallery = loadable(() =>
  componentLoader(() => import("../pages/FormGallery"))
);
const PublicRoom = loadable(() =>
  componentLoader(() => import("../pages/PublicRoom"))
);
const About = loadable(() => componentLoader(() => import("../pages/About")));
const Wizard = loadable(() => componentLoader(() => import("../pages/Wizard")));
const PreparationPortal = loadable(() =>
  componentLoader(() => import("../pages/PreparationPortal"))
);
const PortalUnavailable = loadable(() =>
  componentLoader(() => import("../pages/PortalUnavailable"))
);
const ErrorUnavailable = loadable(() =>
  componentLoader(() => import("../pages/Errors/Unavailable"))
);
const AccessRestricted = loadable(() =>
  componentLoader(() => import("../pages/Errors/AccessRestricted"))
);

const Error401 = loadable(() =>
  componentLoader(() => import("client/Error401"))
);

const ClientRoutes = [
  {
    path: "/",
    element: (
      <PrivateRoute>
        <ErrorBoundary>
          <Client />
        </ErrorBoundary>
      </PrivateRoute>
    ),
    errorElement: <Error404 />,
    children: [
      {
        path: "/",
        element: <Home />,
        children: [
          {
            index: true,
            element: (
              <PrivateRoute>
                <Navigate to="/rooms/shared" replace />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms",
            element: (
              <PrivateRoute>
                <Navigate to="/rooms/shared" replace />
              </PrivateRoute>
            ),
          },
          {
            path: "archived",
            element: (
              <PrivateRoute>
                <Navigate to="/rooms/archived" replace />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/personal",
            element: (
              <PrivateRoute restricted withManager withCollaborator>
                <FilesView />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/personal/filter",
            element: (
              <PrivateRoute restricted withManager withCollaborator>
                <FilesView />
              </PrivateRoute>
            ),
          },
          {
            path: "files/trash",
            element: (
              <PrivateRoute restricted withManager withCollaborator>
                <FilesView />
              </PrivateRoute>
            ),
          },
          {
            path: "files/trash/filter",
            element: (
              <PrivateRoute restricted withManager withCollaborator>
                <FilesView />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/shared",
            element: (
              <PrivateRoute>
                <FilesView />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/shared/filter",
            element: (
              <PrivateRoute>
                <FilesView />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/shared/:room",
            element: (
              <PrivateRoute>
                <FilesView />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/shared/:room/filter",
            element: (
              <PrivateRoute>
                <FilesView />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/archived",
            element: (
              <PrivateRoute>
                <FilesView />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/archived/filter",
            element: (
              <PrivateRoute>
                <FilesView />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/archived/:room",
            element: (
              <PrivateRoute>
                <FilesView />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/archived/:room/filter",
            element: (
              <PrivateRoute>
                <FilesView />
              </PrivateRoute>
            ),
          },
          {
            path: "products/files",
            element: (
              <PrivateRoute>
                <FilesView />
              </PrivateRoute>
            ),
          },
          {
            path: "accounts",
            element: (
              <PrivateRoute restricted withManager>
                <Navigate to="/accounts/filter" replace />
              </PrivateRoute>
            ),
          },
          {
            path: "accounts/changeOwner",
            element: (
              <PrivateRoute restricted withManager>
                <Navigate
                  to="/accounts/filter"
                  state={{ openChangeOwnerDialog: true }}
                  replace
                />
              </PrivateRoute>
            ),
          },
          {
            path: "accounts/filter",
            element: (
              <PrivateRoute restricted withManager>
                <AccountsView />
              </PrivateRoute>
            ),
          },
          /*{
            path: "settings",
            element: (
              <PrivateRoute withCollaborator restricted>
                <Navigate to="/settings/personal" replace />
              </PrivateRoute>
            ),
          },
          {
            path: "settings/personal",
            element: (
              <PrivateRoute withCollaborator restricted>
                <SettingsView />
              </PrivateRoute>
            ),
          },
          {
            path: "settings/general",
            element: (
              <PrivateRoute withCollaborator restricted>
                <SettingsView />
              </PrivateRoute>
            ),
          },*/
        ],
      },
      {
        path: "/accounts/view/@self/notification",
        element: (
          <PrivateRoute>
            <Navigate to="/profile/notifications" replace />
          </PrivateRoute>
        ),
      },
      ...generalRoutes,
    ],
  },
  {
    path: "/Products/Files/",
    caseSensitive: true,
    element: <Navigate to="/rooms/shared/filter" replace />,
  },
  {
    path: "/form-gallery",
    element: (
      <PrivateRoute>
        <ErrorBoundary>
          <FormGallery />
        </ErrorBoundary>
      </PrivateRoute>
    ),
  },
  {
    path: "/form-gallery/:fromFolderId",
    element: (
      <PrivateRoute>
        <ErrorBoundary>
          <FormGallery />
        </ErrorBoundary>
      </PrivateRoute>
    ),
  },
  {
    path: "/form-gallery/:fromFolderId/filter",
    element: (
      <PrivateRoute>
        <ErrorBoundary>
          <FormGallery />
        </ErrorBoundary>
      </PrivateRoute>
    ),
  },
  {
    path: "/rooms/share",
    element: (
      <PublicRoute>
        <ErrorBoundary>
          <PublicRoom />
        </ErrorBoundary>
      </PublicRoute>
    ),
    errorElement: <Error404 />,
    children: [
      {
        index: true,
        element: (
          <PublicRoute>
            <FilesView />
          </PublicRoute>
        ),
      },
    ],
  },
  {
    path: "/wizard",
    element: (
      <PublicRoute>
        <ErrorBoundary>
          <Wizard />
        </ErrorBoundary>
      </PublicRoute>
    ),
  },
  {
    path: "/sdk/:mode",
    element: <Sdk />,
  },
  {
    path: "/about",
    element: (
      <PrivateRoute>
        <ErrorBoundary>
          <About />
        </ErrorBoundary>
      </PrivateRoute>
    ),
  },
  {
    path: "/portal-unavailable",
    element: (
      <PrivateRoute>
        <ErrorBoundary>
          <PortalUnavailable />
        </ErrorBoundary>
      </PrivateRoute>
    ),
  },
  {
    path: "/unavailable",
    element: (
      <PublicRoute>
        <ErrorBoundary>
          <ErrorUnavailable />
        </ErrorBoundary>
      </PublicRoute>
    ),
  },
  {
    path: "/access-restricted",
    element: (
      <PublicRoute>
        <ErrorBoundary>
          <AccessRestricted />
        </ErrorBoundary>
      </PublicRoute>
    ),
  },
  {
    path: "/preparation-portal",
    element: (
      <PublicRoute>
        <ErrorBoundary>
          <PreparationPortal />
        </ErrorBoundary>
      </PublicRoute>
    ),
  },
  {
    path: "/error401",
    element: (
      <PrivateRoute>
        <ErrorBoundary>
          <Error401 />
        </ErrorBoundary>
      </PrivateRoute>
    ),
  },
];

export default ClientRoutes;
