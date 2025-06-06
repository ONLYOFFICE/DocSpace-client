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

import React from "react";
import { createBrowserRouter, Navigate } from "react-router";

import Error404 from "@docspace/shared/components/errors/Error404";
import { PreparationPortal } from "@docspace/shared/pages/PreparationPortal";
import { Loader, LoaderTypes } from "@docspace/shared/components/loader";

import { WhiteLabel } from "client/WhiteLabelPage";
import { BrandName } from "client/BrandNamePage";
import { CompanyInfoSettings } from "client/CompanyInfoPage";
import { AdditionalResources } from "client/AdditionalResPage";

import App from "./App";

import Spaces from "./categories/spaces";
import Settings from "./categories/settings";
import Payments from "./categories/payments";
import Bonus from "./categories/bonus";

import ErrorBoundary from "./components/ErrorBoundaryWrapper";
import PrivateRouteWrapper from "./components/PrivateRouterWrapper";

const routes = [
  {
    path: "/management",
    element: (
      <ErrorBoundary>
        <PrivateRouteWrapper>
          <App />
        </PrivateRouteWrapper>
      </ErrorBoundary>
    ),
    hydrateFallbackElement: (
      <Loader className="pageLoader" type={LoaderTypes.rombs} size="40px" />
    ),
    errorElement: <Error404 />,
    children: [
      { index: true, element: <Navigate to="/management/spaces" replace /> },
      {
        path: "/management/spaces",
        element: <Spaces />,
      },
      {
        path: "/management/settings",
        element: <Settings />,
      },
      {
        path: "/management/settings/branding",
        element: <Settings />,
      },
      {
        path: "/management/settings/branding/brand-name",
        element: <BrandName />,
      },
      {
        path: "/management/settings/branding/white-label",
        element: <WhiteLabel />,
      },
      {
        path: "/management/settings/branding/company-info-settings",
        element: <CompanyInfoSettings />,
      },
      {
        path: "/management/settings/branding/additional-resources",
        element: <AdditionalResources />,
      },
      {
        path: "/management/settings/data-backup",
        element: <Settings />,
      },
      {
        path: "/management/settings/auto-backup",
        element: <Settings />,
      },
      {
        path: "/management/settings/restore",
        element: <Settings />,
      },
      {
        path: "/management/settings/encrypt-data",
        element: <Settings />,
      },
      {
        path: "/management/payments",
        element: <Payments />,
      },
      {
        path: "/management/payments/portal-payments",
        element: <Payments />,
      },
      {
        path: "/management/payments/wallet",
        element: <Payments />,
      },
      {
        path: "/management/bonus",
        element: <Bonus />,
      },
      {
        path: "/management/preparation-portal",
        element: <PreparationPortal />,
      },
    ],
  },
];

const router = createBrowserRouter(routes, {
  basename: "/",
});

export default router;
