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

import Error404 from "client/Error404";

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
    ],
  },
];

const router = createBrowserRouter(routes, {
  basename: "/management",
});

export default router;
