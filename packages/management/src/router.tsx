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
import { createBrowserRouter, Navigate } from "react-router-dom";

import App from "./App";

import Spaces from "./categories/spaces";
import Branding from "./categories/branding";
import WhiteLabelPage from "client/WhiteLabelPage";
import CompanyInfoPage from "client/CompanyInfoPage";
import AdditionalResPage from "client/AdditionalResPage";
import Backup from "./categories/backup";
import Restore from "./categories/restore";
import Payments from "./categories/payments";

import ErrorBoundary from "./components/ErrorBoundaryWrapper";

import Error404 from "@docspace/shared/components/errors/Error404";
import PreparationPortal from "@docspace/shared/pages/PreparationPortal";

const routes = [
  {
    path: "/",
    element: (
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    ),
    errorElement: <Error404 />,
    children: [
      { index: true, element: <Navigate to="spaces" replace /> },
      {
        path: "spaces",
        element: <Spaces />,
      },
      {
        path: "branding",
        element: <Branding />,
      },
      {
        path: "branding/white-label",
        element: <WhiteLabelPage />,
      },
      {
        path: "branding/company-info-settings",
        element: <CompanyInfoPage />,
      },
      {
        path: "branding/additional-resources",
        element: <AdditionalResPage />,
      },

      {
        path: "backup",
        element: <Navigate to="data-backup" />,
      },
      {
        path: "backup/data-backup",
        element: <Backup />,
      },
      {
        path: "backup/auto-backup",
        element: <Backup />,
      },
      {
        path: "restore",
        element: <Restore />,
      },
      {
        path: "payments",
        element: <Payments />,
      },
      {
        path: "preparation-portal",
        element: <PreparationPortal />,
      },
    ],
  },
];

const router = createBrowserRouter(routes, {
  basename: "/management",
});

export default router;
