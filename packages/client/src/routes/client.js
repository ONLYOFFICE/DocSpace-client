// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import { Navigate } from "react-router-dom";
import loadable from "@loadable/component";

import PrivateRoute from "../components/PrivateRouteWrapper";
import PublicRoute from "../components/PublicRouteWrapper";
import Error404 from "@docspace/shared/components/errors/Error404";
import componentLoader from "@docspace/shared/utils/component-loader";
import ErrorBoundary from "../components/ErrorBoundaryWrapper";

import FilesView from "SRC_DIR/pages/Home/View/Files";
import AccountsView from "SRC_DIR/pages/Home/View/Accounts";
import SettingsView from "SRC_DIR/pages/Home/View/Settings";

import { generalRoutes } from "./general";

const Client = loadable(() => componentLoader(() => import("../Client")));

const Home = loadable(() => componentLoader(() => import("../pages/Home")));

const Sdk = loadable(() => componentLoader(() => import("../pages/Sdk")));

const FormGallery = loadable(() =>
  componentLoader(() => import("../pages/FormGallery")),
);
const PublicRoom = loadable(() =>
  componentLoader(() => import("../pages/PublicRoom")),
);
const About = loadable(() => componentLoader(() => import("../pages/About")));
const Wizard = loadable(() => componentLoader(() => import("../pages/Wizard")));
const PreparationPortal = loadable(() =>
  componentLoader(() => import("@docspace/shared/pages/PreparationPortal")),
);
const PortalUnavailable = loadable(() =>
  componentLoader(() => import("../pages/PortalUnavailable")),
);
const ErrorUnavailable = loadable(() =>
  componentLoader(() => import("../components/ErrorUnavailableWrapper")),
);

const Error401 = loadable(() =>
  componentLoader(() => import("@docspace/shared/components/errors/Error401")),
);

const Error403 = loadable(() =>
  componentLoader(() => import("@docspace/shared/components/errors/Error403")),
);

const Error520 = loadable(() =>
  componentLoader(() => import("../components/Error520Wrapper")),
);

const ErrorAccessRestricted = loadable(() =>
  componentLoader(
    () => import("@docspace/shared/components/errors/AccessRestricted"),
  ),
);

const ErrorOffline = loadable(() =>
  componentLoader(
    () => import("@docspace/shared/components/errors/ErrorOffline"),
  ),
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
                <Navigate to="filter" replace />
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
      {
        path: "media/view/:id",
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
          <ErrorAccessRestricted />
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
