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
