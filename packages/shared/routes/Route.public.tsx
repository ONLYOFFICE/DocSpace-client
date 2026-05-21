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
