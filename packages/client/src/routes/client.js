/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Navigate } from "react-router";

import componentLoader from "@docspace/shared/utils/component-loader";
import Error404 from "@docspace/shared/components/errors/Error404";
import { SHARED_WITH_ME_PATH } from "@docspace/shared/constants";

import { ViewComponent } from "SRC_DIR/pages/Home/View";
import { publicPreviewLoader } from "SRC_DIR/pages/PublicPreview/PublicPreview.helpers";
import { DefaultPageRedirect } from "SRC_DIR/pages/Home/DefaultPageRedirect";

import PrivateRoute from "../components/PrivateRouteWrapper";
import PublicRoute from "../components/PublicRouteWrapper";
import ErrorBoundary from "../components/ErrorBoundaryWrapper";
import ProtectedAppRoute from "../components/ProtectedAppRoute";

import { profileClientRoutes, generalClientRoutes } from "./general";
import { contactsRoutes } from "./contacts";

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
                <DefaultPageRedirect />
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
            path: SHARED_WITH_ME_PATH,
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: SHARED_WITH_ME_PATH + "/filter",
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
          {
            path: "ai-agents",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "ai-agents/filter",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "ai-agents/recent",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "ai-agents/recent/filter",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "ai-agents/favorites",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "ai-agents/favorites/filter",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "ai-agents/trash",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "ai-agents/trash/filter",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "ai-agents/:id",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "ai-agents/:id/filter",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          {
            path: "ai-agents/:id/chat",
            element: (
              <PrivateRoute>
                <ViewComponent />
              </PrivateRoute>
            ),
          },
          ...contactsRoutes,
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
      {
        path: "/ai-files",
        async lazy() {
          const { AiFiles } = await componentLoader(
            () => import("SRC_DIR/pages/AiFiles"),
          );

          const Component = () => (
            <PrivateRoute>
              <ProtectedAppRoute appId="ai-files">
                <ErrorBoundary>
                  <AiFiles />
                </ErrorBoundary>
              </ProtectedAppRoute>
            </PrivateRoute>
          );

          return { Component };
        },
      },
      {
        path: "/ai-forms",
        async lazy() {
          const { AiForms } = await componentLoader(
            () => import("SRC_DIR/pages/AiForms"),
          );

          const Component = () => (
            <PrivateRoute>
              <ProtectedAppRoute appId="ai-forms">
                <ErrorBoundary>
                  <AiForms />
                </ErrorBoundary>
              </ProtectedAppRoute>
            </PrivateRoute>
          );

          return { Component };
        },
      },
      {
        path: "/ai-arbiter",
        async lazy() {
          const { AiArbiter } = await componentLoader(
            () => import("SRC_DIR/pages/AiArbiter"),
          );

          const Component = () => (
            <PrivateRoute>
              <ProtectedAppRoute appId="ai-arbiter">
                <ErrorBoundary>
                  <AiArbiter />
                </ErrorBoundary>
              </ProtectedAppRoute>
            </PrivateRoute>
          );

          return { Component };
        },
      },
      {
        path: "/agents",
        async lazy() {
          const { AiAgents } = await componentLoader(
            () => import("SRC_DIR/pages/AiAgents"),
          );

          const Component = () => (
            <PrivateRoute>
              <ErrorBoundary>
                <AiAgents />
              </ErrorBoundary>
            </PrivateRoute>
          );

          return { Component };
        },
      },
      {
        path: "/ai-rooms",
        async lazy() {
          const { AiRooms } = await componentLoader(
            () => import("SRC_DIR/pages/AiRooms"),
          );

          const Component = () => (
            <PrivateRoute>
              <ProtectedAppRoute appId="ai-rooms">
                <ErrorBoundary>
                  <AiRooms />
                </ErrorBoundary>
              </ProtectedAppRoute>
            </PrivateRoute>
          );

          return { Component };
        },
      },
      {
        path: "/e2e-rooms",
        async lazy() {
          const { E2eRooms } = await componentLoader(
            () => import("SRC_DIR/pages/E2eRooms"),
          );

          const Component = () => (
            <PrivateRoute>
              <ProtectedAppRoute appId="e2e-rooms">
                <ErrorBoundary>
                  <E2eRooms />
                </ErrorBoundary>
              </ProtectedAppRoute>
            </PrivateRoute>
          );

          return { Component };
        },
      },
      {
        path: "/docs-cloud",
        async lazy() {
          const { DocsCloud } = await componentLoader(
            () => import("SRC_DIR/pages/DocsCloud"),
          );

          const Component = () => (
            <PrivateRoute>
              <ProtectedAppRoute appId="docs-cloud">
                <ErrorBoundary>
                  <DocsCloud />
                </ErrorBoundary>
              </ProtectedAppRoute>
            </PrivateRoute>
          );

          return { Component };
        },
      },
      {
        path: "/dashboard",
        async lazy() {
          const { Dashboard } = await componentLoader(
            () => import("SRC_DIR/pages/Dashboard"),
          );

          const Component = () => (
            <PrivateRoute>
              <ErrorBoundary>
                <Dashboard />
              </ErrorBoundary>
            </PrivateRoute>
          );

          return { Component };
        },
      },
    ],
  },
  {
    path: "/Products/Files/",
    caseSensitive: true,
    element: <Navigate to="/rooms/shared/filter" replace />,
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
    loader: publicPreviewLoader,
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
      const { isDesktop, isTablet } = await import("@docspace/shared/utils");

      // On desktop/tablet we redirect to the home page with a flag to open the modal.
      if (isDesktop() || isTablet()) {
        const Component = () => {
          return <Navigate to="/" replace state={{ openAboutDialog: true }} />;
        };

        return { Component };
      }

      // On mobile we show the full page.
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
    path: "/no-access",
    async lazy() {
      const { default: NoAccessContainer, NoAccessContainerType } =
        await componentLoader(
          () => import("SRC_DIR/components/EmptyContainer/NoAccessContainer"),
        );

      const Component = () => (
        <PrivateRoute>
          <ErrorBoundary>
            <NoAccessContainer type={NoAccessContainerType.Account} />
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
  {
    path: "/billing/payment-complete",
    async lazy() {
      const { Component: PaymentComplete } = await componentLoader(
        () => import("SRC_DIR/pages/PaymentComplete"),
      );

      const Component = () => (
        <PrivateRoute>
          <ErrorBoundary>
            <PaymentComplete />
          </ErrorBoundary>
        </PrivateRoute>
      );

      return { Component };
    },
  },
];

export default ClientRoutes;

