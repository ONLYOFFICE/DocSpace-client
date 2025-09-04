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

import { Navigate, useLocation } from "react-router";

import { TenantStatus } from "../enums";
import { combineUrl } from "../utils/combineUrl";
import { isPublicPreview, isPublicRoom } from "../utils/common";

import type { PublicRouteProps } from "./Routers.types";

export const PublicRoute = (props: PublicRouteProps) => {
  const {
    isFirstLoaded,
    wizardCompleted,
    isAuthenticated,
    tenantStatus,
    isPortalDeactivate,
    children,
  } = props;

  const location = useLocation();

  const renderComponent = () => {
    const isPreparationPortalUrl = location.pathname === "/preparation-portal";
    const isDeactivationPortalUrl = location.pathname === "/unavailable";
    const isPortalRestriction = location.pathname === "/access-restricted";
    const isEncryptionPortalUrl = location.pathname === "/encryption-portal";
    const isPortalRestoring = tenantStatus === TenantStatus.PortalRestore;
    const isPortalEncryption = tenantStatus === TenantStatus.EncryptionProcess;

    // if (!isLoaded) {
    //   return <AppLoader />;
    // }

    if (location?.state?.isRestrictionError) {
      return children;
    }

    if (isPublicRoom() || isPublicPreview()) {
      return children;
    }

    if (
      (isAuthenticated && !isPortalRestoring && !isPortalDeactivate) ||
      (!location?.state?.isRestrictionError && isPortalRestriction)
    ) {
      return <Navigate replace to="/" />;
    }

    if (isAuthenticated && isPortalRestoring && !isPreparationPortalUrl) {
      return (
        <Navigate
          replace
          to={combineUrl(
            window.ClientConfig?.proxy?.url,
            "/preparation-portal",
          )}
        />
      );
    }

    if (isAuthenticated && isPortalEncryption && !isEncryptionPortalUrl) {
      return (
        <Navigate
          replace
          to={combineUrl(window.ClientConfig?.proxy?.url, "/encryption-portal")}
        />
      );
    }

    if (isAuthenticated && isPortalDeactivate && !isDeactivationPortalUrl) {
      return (
        <Navigate
          replace
          to={combineUrl(window.ClientConfig?.proxy?.url, "/unavailable")}
        />
      );
    }

    if (isFirstLoaded && !wizardCompleted && location.pathname !== "/wizard") {
      window.location.replace(
        combineUrl(window.ClientConfig?.proxy?.url, "/wizard"),
      );
      return null;
    }

    if (
      !isAuthenticated &&
      isPortalRestoring &&
      wizardCompleted &&
      !isPreparationPortalUrl
    ) {
      return (
        <Navigate
          replace
          to={combineUrl(
            window.ClientConfig?.proxy?.url,
            "/preparation-portal",
          )}
        />
      );
    }
    if (
      !isAuthenticated &&
      isPortalDeactivate &&
      wizardCompleted &&
      !isDeactivationPortalUrl
    ) {
      return (
        <Navigate
          replace
          to={combineUrl(window.ClientConfig?.proxy?.url, "/unavailable")}
        />
      );
    }

    if (
      wizardCompleted &&
      !isAuthenticated &&
      !isPortalRestoring &&
      !isPortalDeactivate &&
      !isPortalDeactivate &&
      !isPortalEncryption
    ) {
      window.location.replace(
        combineUrl(window.ClientConfig?.proxy?.url, "/login"),
      );

      return null;
    }

    return children;
  };

  const component = renderComponent();

  return component;
};
