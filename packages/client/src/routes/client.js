import React from "react";
import { Navigate } from "react-router-dom";
import loadable from "@loadable/component";

import PrivateRoute from "../components/PrivateRouteWrapper";
import PublicRoute from "../components/PublicRouteWrapper";
import Error404 from "@docspace/shared/components/errors/Error404";

import ErrorBoundary from "../components/ErrorBoundaryWrapper";

import FilesView from "SRC_DIR/pages/Home/View/Files";
import AccountsView from "SRC_DIR/pages/Home/View/Accounts";
import SettingsView from "SRC_DIR/pages/Home/View/Settings";

import { generalRoutes } from "./general";

const Client = loadable(() => import("../Client"));

const Home = loadable(() => import("../pages/Home"));

const Sdk = loadable(() => import("../pages/Sdk"));

const FormGallery = loadable(() => import("../pages/FormGallery"));
const PublicRoom = loadable(() => import("../pages/PublicRoom"));
const About = loadable(() => import("../pages/About"));
const Wizard = loadable(() => import("../pages/Wizard"));
const PreparationPortal = loadable(() => import("../pages/PreparationPortal"));
const PortalUnavailable = loadable(() => import("../pages/PortalUnavailable"));
const ErrorUnavailable = loadable(
  () => import("../components/ErrorUnavailableWrapper"),
);
const AccessRestricted = loadable(
  () => import("@docspace/shared/components/errors/AccessRestricted"),
);

const Error401 = loadable(
  () => import("@docspace/shared/components/errors/Error401"),
);

const Error403 = loadable(
  () => import("@docspace/shared/components/errors/Error403"),
);

const Error520 = loadable(() => import("../components/Error520Wrapper"));

const ErrorAccessRestricted = loadable(
  () => import("@docspace/shared/components/errors/AccessRestricted"),
);

const ErrorOffline = loadable(
  () => import("@docspace/shared/components/errors/ErrorOffline"),
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
            path: "media/view/:id",
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
                <Navigate to="/accounts/people/filter" replace />
              </PrivateRoute>
            ),
          },
          {
            path: "accounts/filter",
            element: (
              <PrivateRoute restricted withManager>
                <Navigate to="/accounts/people/filter" replace />
              </PrivateRoute>
            ),
          },
          {
            path: "accounts/changeOwner",
            element: (
              <PrivateRoute restricted withManager>
                <Navigate
                  to="/accounts/people/filter"
                  state={{ openChangeOwnerDialog: true }}
                  replace
                />
              </PrivateRoute>
            ),
          },
          {
            path: "accounts/people",
            element: (
              <PrivateRoute restricted withManager>
                <Navigate to="/accounts/people/filter" replace />
              </PrivateRoute>
            ),
          },
          {
            path: "accounts/people/filter",
            element: (
              <PrivateRoute restricted withManager>
                <AccountsView />
              </PrivateRoute>
            ),
          },
          {
            path: "accounts/groups",
            element: (
              <PrivateRoute restricted withManager>
                <Navigate to="/accounts/groups/filter" replace />
              </PrivateRoute>
            ),
          },
          {
            path: "accounts/groups/filter",
            element: (
              <PrivateRoute restricted withManager>
                <AccountsView />
              </PrivateRoute>
            ),
          },
          {
            path: "accounts/groups/:groupId",
            element: (
              <PrivateRoute restricted withManager>
                <Navigate to="/accounts/groups/:groupId/filter" replace />
              </PrivateRoute>
            ),
          },
          {
            path: "accounts/groups/:groupId/filter",
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
    path: "/error/401",
    element: (
      <PrivateRoute>
        <ErrorBoundary>
          <Error401 />
        </ErrorBoundary>
      </PrivateRoute>
    ),
  },
  {
    path: "/error/403",
    element: (
      <PrivateRoute>
        <ErrorBoundary>
          <Error403 />
        </ErrorBoundary>
      </PrivateRoute>
    ),
  },
  {
    path: "/error/520",
    element: (
      <PrivateRoute>
        <ErrorBoundary>
          <Error520 />
        </ErrorBoundary>
      </PrivateRoute>
    ),
  },
  {
    path: "/error/access/restricted",
    element: (
      <PrivateRoute>
        <ErrorBoundary>
          <ErrorAccessRestricted />
        </ErrorBoundary>
      </PrivateRoute>
    ),
  },
  {
    path: "/error/offline",
    element: (
      <PrivateRoute>
        <ErrorBoundary>
          <ErrorOffline />
        </ErrorBoundary>
      </PrivateRoute>
    ),
  },
];

export default ClientRoutes;
