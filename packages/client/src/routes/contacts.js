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

import {
  GUESTS_ROUTE,
  GUESTS_ROUTE_WITH_FILTER,
  GROUPS_ROUTE,
  GROUPS_ROUTE_WITH_FILTER,
  INSIDE_GROUP_ROUTE,
  INSIDE_GROUP_ROUTE_WITH_FILTER,
  PEOPLE_ROUTE,
  PEOPLE_ROUTE_WITH_FILTER,
  CONTACTS_ROUTE,
} from "SRC_DIR/helpers/contacts";

import { ViewComponent } from "SRC_DIR/pages/Home/View";

import PrivateRoute from "../components/PrivateRouteWrapper";

export const contactsRoutes = [
  {
    path: CONTACTS_ROUTE,
    element: (
      <PrivateRoute restricted withManager>
        <Navigate to={PEOPLE_ROUTE_WITH_FILTER} replace />
      </PrivateRoute>
    ),
  },
  {
    path: "accounts/filter",
    element: (
      <PrivateRoute restricted withManager>
        <Navigate to={PEOPLE_ROUTE_WITH_FILTER} replace />
      </PrivateRoute>
    ),
  },
  {
    path: "accounts/changeOwner",
    element: (
      <PrivateRoute restricted withManager>
        <Navigate
          to={PEOPLE_ROUTE_WITH_FILTER}
          state={{ openChangeOwnerDialog: true }}
          replace
        />
      </PrivateRoute>
    ),
  },
  {
    path: PEOPLE_ROUTE,
    element: (
      <PrivateRoute restricted withManager>
        <Navigate to={PEOPLE_ROUTE_WITH_FILTER} replace />
      </PrivateRoute>
    ),
  },
  {
    path: PEOPLE_ROUTE_WITH_FILTER,
    element: (
      <PrivateRoute restricted withManager>
        <ViewComponent />
      </PrivateRoute>
    ),
  },
  {
    path: GROUPS_ROUTE,
    element: (
      <PrivateRoute restricted withManager>
        <Navigate to={GROUPS_ROUTE_WITH_FILTER} replace />
      </PrivateRoute>
    ),
  },
  {
    path: GROUPS_ROUTE_WITH_FILTER,
    element: (
      <PrivateRoute restricted withManager>
        <ViewComponent />
      </PrivateRoute>
    ),
  },
  {
    path: INSIDE_GROUP_ROUTE,
    element: (
      <PrivateRoute restricted withManager>
        <Navigate to={INSIDE_GROUP_ROUTE_WITH_FILTER} replace />
      </PrivateRoute>
    ),
  },
  {
    path: INSIDE_GROUP_ROUTE_WITH_FILTER,
    element: (
      <PrivateRoute restricted withManager>
        <ViewComponent />
      </PrivateRoute>
    ),
  },
  {
    path: GUESTS_ROUTE,
    element: (
      <PrivateRoute restricted withManager>
        <Navigate to={GUESTS_ROUTE_WITH_FILTER} replace />
      </PrivateRoute>
    ),
  },
  {
    path: GUESTS_ROUTE_WITH_FILTER,
    element: (
      <PrivateRoute restricted withManager>
        <ViewComponent />
      </PrivateRoute>
    ),
  },
];
