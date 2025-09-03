// (c) Copyright Ascensio System SIA 2009-2025
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

import { Navigate } from "react-router";

import { validatePublicRoomKey } from "@docspace/shared/api/rooms";
import { getSettingsFiles } from "@docspace/shared/api/files";
import componentLoader from "@docspace/shared/utils/component-loader";
import Error404 from "@docspace/shared/components/errors/Error404";

import { ViewComponent } from "SRC_DIR/pages/Home/View";

import PrivateRoute from "../components/PrivateRouteWrapper";
import PublicRoute from "../components/PublicRouteWrapper";
import ErrorBoundary from "../components/ErrorBoundaryWrapper";

import { profileClientRoutes, generalClientRoutes } from "./general";
import { contanctsRoutes } from "./contacts";

/**
 * @type {import("react-router").RouteObject[]}
 */
const ClientRoutes = [
  {
    path: "/",
    async lazy() {
      const { Client } = await componentLoader(() => import("SRC_DIR/Client"));

      const Component = () => (
        <PrivateRoute>
          <ErrorBoundary>
            <Client />
          </ErrorBoundary>
        </PrivateRoute>
      );

      return { Component };
    },
    errorElement: <Error404 />,
    children: [
      {
        path: "/",
        async lazy() {
          const { Component } = await componentLoader(
            () => import("SRC_DIR/pages/Home"),
          );

          return { Component };
        },
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
            path: "templates",
            element: (
              <PrivateRoute>
                <Navigate to="/rooms/templates" replace />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/personal",
            element: (
              <PrivateRoute restricted withManager withCollaborator>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/personal/filter",
            element: (
              <PrivateRoute restricted withManager withCollaborator>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "recent",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "recent/filter",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "files/trash",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "files/trash/filter",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "files/favorite",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "files/favorite/filter",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/shared",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/shared/filter",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/shared/:room",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/shared/:room/filter",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/shared/:room/chat",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/archived",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/archived/filter",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/archived/:room",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/archived/:room/filter",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/templates",

            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/templates/filter",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/templates/:room",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "rooms/templates/:room/filter",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "media/view/:id",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          ...contanctsRoutes,
          ...profileClientRoutes,
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
      ...generalClientRoutes,
    ],
  },
  {
    path: "/Products/Files/",
    caseSensitive: true,
    element: <Navigate to="/rooms/shared/filter" replace />,
  },
  {
    path: "/form-gallery",
    async lazy() {
      const { WrappedComponent } = await componentLoader(
        () => import("SRC_DIR/pages/FormGallery"),
      );

      const Component = () => (
        <PrivateRoute>
          <ErrorBoundary>
            <WrappedComponent />
          </ErrorBoundary>
        </PrivateRoute>
      );

      return { Component };
    },
  },

  {
    path: "/form-gallery/:fromFolderId",
    async lazy() {
      const { WrappedComponent } = await componentLoader(
        () => import("SRC_DIR/pages/FormGallery"),
      );

      const Component = () => (
        <PrivateRoute>
          <ErrorBoundary>
            <WrappedComponent />
          </ErrorBoundary>
        </PrivateRoute>
      );

      return { Component };
    },
  },
  {
    path: "/form-gallery/:fromFolderId/filter",
    async lazy() {
      const { WrappedComponent } = await componentLoader(
        () => import("SRC_DIR/pages/FormGallery"),
      );

      const Component = () => (
        <PrivateRoute>
          <ErrorBoundary>
            <WrappedComponent />
          </ErrorBoundary>
        </PrivateRoute>
      );

      return { Component };
    },
  },
  {
    path: "/share/preview/:id",
    async lazy() {
      const { PublicPreview } = await componentLoader(
        () => import("SRC_DIR/pages/PublicPreview/PublicPreview"),
      );

      const Component = () => (
        <PublicRoute>
          <ErrorBoundary>
            <PublicPreview />
          </ErrorBoundary>
        </PublicRoute>
      );

      return { Component };
    },
    loader: async ({ request }) => {
      const searchParams = new URL(request.url).searchParams;
      const key = searchParams.get("share");

      const [validateData, settings] = await Promise.all([
        validatePublicRoomKey(key),
        getSettingsFiles(),
      ]);

      return { validateData, key, settings };
    },
  },
  {
    path: "/rooms/share",
    async lazy() {
      const { WrappedComponent } = await componentLoader(
        () => import("SRC_DIR/pages/PublicRoom"),
      );

      const Component = () => (
        <PublicRoute>
          <ErrorBoundary>
            <WrappedComponent />
          </ErrorBoundary>
        </PublicRoute>
      );

      return { Component };
    },
    errorElement: <Error404 />,
    children: [
      {
        index: true,
        element: (
          <PublicRoute>
            <ViewComponent />
          </PublicRoute>
        ),
      },
      {
        path: "media/view/:id",
        element: (
          <PublicRoute>
            <ViewComponent />
          </PublicRoute>
        ),
      },
    ],
  },
  {
    path: "/old-sdk/:mode",
    lazy: () => import("SRC_DIR/pages/Sdk"),
  },
  {
    path: "/about",
    async lazy() {
      const { About } = await componentLoader(
        () => import("SRC_DIR/pages/About"),
      );

      const Component = () => (
        <PrivateRoute>
          <ErrorBoundary>
            <About />
          </ErrorBoundary>
        </PrivateRoute>
      );

      return { Component };
    },
  },
  {
    path: "/portal-unavailable",
    async lazy() {
      const { Component } = await componentLoader(
        () => import("SRC_DIR/pages/PortalUnavailable"),
      );

      const WrappedComponent = () => (
        <PrivateRoute>
          <ErrorBoundary>
            <Component />
          </ErrorBoundary>
        </PrivateRoute>
      );

      return { Component: WrappedComponent };
    },
  },
  {
    path: "/unavailable",
    async lazy() {
      const { Component } = await componentLoader(
        () => import("SRC_DIR/components/ErrorUnavailableWrapper"),
      );

      const WrappedComponent = () => (
        <PublicRoute>
          <ErrorBoundary>
            <Component />
          </ErrorBoundary>
        </PublicRoute>
      );

      return { Component: WrappedComponent };
    },
  },
  {
    path: "/access-restricted",
    async lazy() {
      const { AccessRestricted } = await componentLoader(
        () => import("@docspace/shared/components/errors/AccessRestricted"),
      );

      const Component = () => (
        <PublicRoute>
          <ErrorBoundary>
            <AccessRestricted />
          </ErrorBoundary>
        </PublicRoute>
      );

      return { Component };
    },
  },
  {
    path: "/encryption-portal",
    async lazy() {
      const { EncryptionPortal } = await componentLoader(
        () => import("@docspace/shared/pages/EncryptionPortal"),
      );

      const Component = () => (
        <ErrorBoundary>
          <EncryptionPortal />
        </ErrorBoundary>
      );

      return { Component };
    },
  },
  {
    path: "/preparation-portal",
    async lazy() {
      const { PreparationPortal } = await componentLoader(
        () => import("@docspace/shared/pages/PreparationPortal"),
      );

      const Component = () => (
        <PublicRoute>
          <ErrorBoundary>
            <PreparationPortal />
          </ErrorBoundary>
        </PublicRoute>
      );

      return { Component };
    },
  },
  {
    path: "/shared/invalid-link",
    async lazy() {
      const { ErrorInvalidLink } = await componentLoader(
        () => import("@docspace/shared/components/errors/ErrorInvalidLink"),
      );

      const Component = () => {
        return (
          <PrivateRoute>
            <ErrorBoundary>
              <ErrorInvalidLink />
            </ErrorBoundary>
          </PrivateRoute>
        );
      };

      return { Component };
    },
  },
  {
    path: "/error/401",
    async lazy() {
      const { Error401 } = await componentLoader(
        () => import("@docspace/shared/components/errors/Error401"),
      );

      const Component = () => {
        return (
          <PrivateRoute>
            <ErrorBoundary>
              <Error401 />
            </ErrorBoundary>
          </PrivateRoute>
        );
      };

      return { Component };
    },
  },
  {
    path: "/error/403",
    async lazy() {
      const { Error403 } = await componentLoader(
        () => import("@docspace/shared/components/errors/Error403"),
      );

      const Component = () => {
        return (
          <PrivateRoute>
            <ErrorBoundary>
              <Error403 />
            </ErrorBoundary>
          </PrivateRoute>
        );
      };

      return { Component };
    },
  },
  {
    path: "/error/520",
    async lazy() {
      const { Error520Component } = await componentLoader(
        () => import("SRC_DIR/components/Error520Wrapper"),
      );

      const Component = () => {
        return (
          <PrivateRoute>
            <ErrorBoundary>
              <Error520Component />
            </ErrorBoundary>
          </PrivateRoute>
        );
      };

      return { Component };
    },
  },
  {
    path: "/error/access/restricted",
    async lazy() {
      const { AccessRestricted } = await componentLoader(
        () => import("@docspace/shared/components/errors/AccessRestricted"),
      );

      const Component = () => (
        <PrivateRoute>
          <ErrorBoundary>
            <AccessRestricted />
          </ErrorBoundary>
        </PrivateRoute>
      );

      return { Component };
    },
  },
  {
    path: "/error/offline",
    async lazy() {
      const { ErrorOfflineContainer } = await componentLoader(
        () => import("@docspace/shared/components/errors/ErrorOffline"),
      );

      const Component = () => (
        <PrivateRoute>
          <ErrorBoundary>
            <ErrorOfflineContainer />
          </ErrorBoundary>
        </PrivateRoute>
      );

      return { Component };
    },
  },
];

export default ClientRoutes;
