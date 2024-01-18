import React from "react";
import { Navigate } from "react-router-dom";

import loadable from "@loadable/component";

import PrivateRoute from "@docspace/common/components/PrivateRoute";

const Profile = loadable(() => import("../pages/Profile"));

const generalRoutes = [
  {
    path: "profile/",
    children: [
      {
        index: true,
        Component: () => (
          <Navigate to="login" state={window.DocSpace?.location?.state} />
        ),
      },
      {
        path: "login",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "notifications",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "file-management",
        element: (
          <PrivateRoute withCollaborator restricted>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "interface-theme",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
      {
        path: "authorized-apps",
        element: (
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        ),
      },
    ],
  },
];

export { generalRoutes };
