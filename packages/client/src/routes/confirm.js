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

import Error404 from "@docspace/shared/components/errors/Error404";
import componentLoader from "@docspace/shared/utils/component-loader";

import ConfirmRoute from "SRC_DIR/helpers/confirmRoute";

const confirmRoutes = [
  {
    path: "EmpInvite",
    lazy: () =>
      componentLoader(
        () => import("SRC_DIR/pages/Confirm/sub-components/createUser"),
      ),
  },
  {
    path: "LinkInvite",
    lazy: () =>
      componentLoader(
        () => import("SRC_DIR/pages/Confirm/sub-components/createUser"),
      ),
  },
  {
    path: "Activation",
    lazy: () =>
      componentLoader(
        () => import("SRC_DIR/pages/Confirm/sub-components/activateUser"),
      ),
  },
  {
    path: "EmailActivation",
    lazy: () =>
      componentLoader(
        () => import("SRC_DIR/pages/Confirm/sub-components/activateEmail"),
      ),
  },
  {
    path: "EmailChange",
    lazy: () =>
      componentLoader(
        () => import("SRC_DIR/pages/Confirm/sub-components/changeEmail"),
      ),
  },
  {
    path: "PasswordChange",
    lazy: () =>
      componentLoader(
        () => import("SRC_DIR/pages/Confirm/sub-components/changePassword"),
      ),
  },
  {
    path: "ProfileRemove",
    lazy: () =>
      componentLoader(
        () => import("SRC_DIR/pages/Confirm/sub-components/profileRemove"),
      ),
  },
  {
    path: "PhoneActivation",
    lazy: () =>
      componentLoader(
        () => import("SRC_DIR/pages/Confirm/sub-components/changePhone"),
      ),
  },
  {
    path: "PortalOwnerChange",
    lazy: () =>
      componentLoader(
        () => import("SRC_DIR/pages/Confirm/sub-components/changeOwner"),
      ),
  },
  {
    path: "TfaAuth",
    lazy: () =>
      componentLoader(
        () => import("SRC_DIR/pages/Confirm/sub-components/tfaAuth"),
      ),
  },
  {
    path: "TfaActivation",
    lazy: () =>
      componentLoader(
        () => import("SRC_DIR/pages/Confirm/sub-components/tfaActivation"),
      ),
  },
  {
    path: "PortalRemove",
    lazy: () =>
      componentLoader(
        () => import("SRC_DIR/pages/Confirm/sub-components/removePortal"),
      ),
  },
  {
    path: "PortalSuspend",
    lazy: () =>
      componentLoader(
        () => import("SRC_DIR/pages/Confirm/sub-components/deactivatePortal"),
      ),
  },
  {
    path: "PortalContinue",
    lazy: () =>
      componentLoader(
        () => import("SRC_DIR/pages/Confirm/sub-components/continuePortal"),
      ),
  },
  {
    path: "Auth",
    lazy: () =>
      componentLoader(
        () => import("SRC_DIR/pages/Confirm/sub-components/auth"),
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
    lazy: () => componentLoader(() => import("SRC_DIR/pages/Confirm")),
    errorElement: <Error404 />,
    children: [...confirmRoutes],
  },
  {
    path: "confirm",
    lazy: () => componentLoader(() => import("SRC_DIR/pages/Confirm")),
    errorElement: <Error404 />,
    children: [...confirmRoutes],
  },
];

export default ConfirmParentRoutes;
