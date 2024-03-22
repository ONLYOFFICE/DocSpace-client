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
import loadable from "@loadable/component";

import ConfirmRoute from "../helpers/confirmRoute";
import ErrorBoundary from "../components/ErrorBoundaryWrapper";
import componentLoader from "@docspace/shared/utils/component-loader";

import Error404 from "@docspace/shared/components/errors/Error404";
import { AuthenticatedAction } from "../helpers/enums";

const Confirm = loadable(() =>
  componentLoader(() => import("../pages/Confirm")),
);

const ActivateUserForm = loadable(() =>
  componentLoader(() => import("../pages/Confirm/sub-components/activateUser")),
);
const CreateUserForm = loadable(() =>
  componentLoader(() => import("../pages/Confirm/sub-components/createUser")),
);
const ChangePasswordForm = loadable(() =>
  componentLoader(
    () => import("../pages/Confirm/sub-components/changePassword"),
  ),
);
const ActivateEmailForm = loadable(() =>
  componentLoader(
    () => import("../pages/Confirm/sub-components/activateEmail"),
  ),
);
const ChangeEmailForm = loadable(() =>
  componentLoader(() => import("../pages/Confirm/sub-components/changeEmail")),
);
const ChangePhoneForm = loadable(() =>
  componentLoader(() => import("../pages/Confirm/sub-components/changePhone")),
);
const ProfileRemoveForm = loadable(() =>
  componentLoader(
    () => import("../pages/Confirm/sub-components/profileRemove"),
  ),
);
const ChangeOwnerForm = loadable(() =>
  componentLoader(() => import("../pages/Confirm/sub-components/changeOwner")),
);
const TfaAuthForm = loadable(() =>
  componentLoader(() => import("../pages/Confirm/sub-components/tfaAuth")),
);
const TfaActivationForm = loadable(() =>
  componentLoader(
    () => import("../pages/Confirm/sub-components/tfaActivation"),
  ),
);
const RemovePortal = loadable(() =>
  componentLoader(() => import("../pages/Confirm/sub-components/removePortal")),
);
const DeactivatePortal = loadable(() =>
  componentLoader(
    () => import("../pages/Confirm/sub-components/deactivatePortal"),
  ),
);
const ContinuePortal = loadable(() =>
  componentLoader(
    () => import("../pages/Confirm/sub-components/continuePortal"),
  ),
);
const Auth = loadable(() =>
  componentLoader(() => import("../pages/Confirm/sub-components/auth")),
);

const confirmRoutes = [
  {
    path: "EmpInvite",
    element: (
      <ConfirmRoute doAuthenticated={AuthenticatedAction.Redirect}>
        <CreateUserForm />
      </ConfirmRoute>
    ),
  },
  {
    path: "LinkInvite",
    element: (
      <ConfirmRoute doAuthenticated={AuthenticatedAction.Redirect}>
        <CreateUserForm />
      </ConfirmRoute>
    ),
  },
  {
    path: "Activation",
    element: (
      <ConfirmRoute doAuthenticated={AuthenticatedAction.Redirect}>
        <ActivateUserForm />
      </ConfirmRoute>
    ),
  },
  {
    path: "EmailActivation",
    element: (
      <ConfirmRoute>
        <ActivateEmailForm />
      </ConfirmRoute>
    ),
  },
  {
    path: "EmailChange",
    element: (
      <ConfirmRoute>
        <ChangeEmailForm />
      </ConfirmRoute>
    ),
  },
  {
    path: "PasswordChange",
    element: (
      <ConfirmRoute doAuthenticated={AuthenticatedAction.Logout}>
        <ChangePasswordForm />
      </ConfirmRoute>
    ),
  },
  {
    path: "ProfileRemove",
    element: (
      <ConfirmRoute>
        <ProfileRemoveForm />
      </ConfirmRoute>
    ),
  },
  {
    path: "PhoneActivation",
    element: (
      <ConfirmRoute>
        <ChangePhoneForm />
      </ConfirmRoute>
    ),
  },
  {
    path: "PortalOwnerChange",
    element: (
      <ConfirmRoute>
        <ChangeOwnerForm />
      </ConfirmRoute>
    ),
  },
  {
    path: "TfaAuth",
    element: (
      <ConfirmRoute>
        <TfaAuthForm />
      </ConfirmRoute>
    ),
  },
  {
    path: "TfaActivation",
    element: (
      <ConfirmRoute>
        <TfaActivationForm />
      </ConfirmRoute>
    ),
  },
  {
    path: "PortalRemove",
    element: (
      <ConfirmRoute>
        <RemovePortal />
      </ConfirmRoute>
    ),
  },
  {
    path: "PortalSuspend",
    element: (
      <ConfirmRoute>
        <DeactivatePortal />
      </ConfirmRoute>
    ),
  },
  {
    path: "PortalContinue",
    element: (
      <ConfirmRoute>
        <ContinuePortal />
      </ConfirmRoute>
    ),
  },
  {
    path: "Auth",
    element: (
      <ConfirmRoute doAuthenticated={AuthenticatedAction.Logout}>
        <Auth />
      </ConfirmRoute>
    ),
  },
];

const ConfirmParentRoutes = [
  {
    path: "confirm.aspx",
    element: <ConfirmRoute />,
    errorElement: <Error404 />,
  },
  {
    path: "confirm",
    element: <ConfirmRoute />,
    errorElement: <Error404 />,
  },
  {
    path: "confirm.aspx",
    element: (
      <ErrorBoundary>
        <Confirm />
      </ErrorBoundary>
    ),
    errorElement: <Error404 />,
    children: [...confirmRoutes],
  },
  {
    path: "confirm",
    element: (
      <ErrorBoundary>
        <Confirm />
      </ErrorBoundary>
    ),
    errorElement: <Error404 />,
    children: [...confirmRoutes],
  },
];

export default ConfirmParentRoutes;
