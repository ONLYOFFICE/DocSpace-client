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

import AppLoader from "@docspace/ui-kit/components/app-loader";

import { TenantStatus } from "../enums";
import { combineUrl } from "../utils/combineUrl";

import type { PrivateRouteProps } from "./Routers.types";

export const PrivateRoute = (props: PrivateRouteProps) => {
  const {
    isAdmin,
    isLoaded,
    isLogout,
    isCommunity,
    isEnterprise,
    isNotPaidPeriod,
    isAuthenticated,
    isPortalDeactivate,

    withManager,
    withCollaborator,
    wizardCompleted,

    user,
    children,
    restricted,
    tenantStatus,
    enablePortalRename,

    identityServerEnabled,
    baseDomain,
    limitedAccessSpace,

    limitedAccessDevToolsForUsers,
    standalone,
    requireAIServices,
    aiServicesEnabled,
  } = props;

  const location = useLocation();

  const renderComponent = () => {
    if (!user && isAuthenticated) {
      if (isPortalDeactivate) {
        window.location.replace(
          combineUrl(window.ClientConfig?.proxy?.url, "/unavailable"),
        );

        return null;
      }

      // console.log("PrivateRoute returned null");

      return null;
    }

    if (user && isAuthenticated && !isLogout) {
      const loggedOutUserId = sessionStorage.getItem("loggedOutUserId");
      const redirectPath = sessionStorage.getItem("referenceUrl");

      if (loggedOutUserId && redirectPath && loggedOutUserId === user.id) {
        window.location.href = redirectPath;
      }

      sessionStorage.removeItem("referenceUrl");
      sessionStorage.removeItem("loggedOutUserId");
    }

    const isAccountsPage = location.pathname.includes("/accounts");

    const isPortalUrl =
      location.pathname === "/preparation-portal" ||
      location.pathname === "/management/preparation-portal";

    const isEncryptionUrl = location.pathname === "/encryption-portal";

    const isPaymentsUrl =
      location.pathname === "/portal-settings/payments/portal-payments";
    const isBackupUrl =
      location.pathname === "/portal-settings/backup/data-backup";

    const isPortalUnavailableUrl = location.pathname === "/portal-unavailable";

    const isPortalDeletionUrl =
      location.pathname === "/portal-settings/delete-data/deletion" ||
      location.pathname === "/portal-settings/delete-data/deactivation";

    const isBonusPage = location.pathname === "/portal-settings/bonus";
    const isServicesPage =
      location.pathname === "/portal-settings/payments/services";

    const isPortalRenameUrl =
      location.pathname ===
      "/portal-settings/customization/general/portal-renaming";

    const isOAuthPage = location.pathname.includes("/developer-tools/oauth");
    const isAuthorizedAppsPage = location.pathname.includes("authorized-apps");

    const isBrandingPage = location.pathname.includes(
      "portal-settings/customization/branding",
    );

    const isPortalManagement = location.pathname.includes(
      "/portal-settings/management",
    );
    const isFileManagement = location.pathname.includes("file-management");
    const isManagement =
      location.pathname.includes("management") &&
      !location.pathname.includes("ad-management");
    const isPaymentPageUnavailable =
      location.pathname.includes("payments") && isCommunity;
    const isBonusPageUnavailable =
      location.pathname.includes("bonus") && !isCommunity;

    const isDeveloperToolsPage = location.pathname.includes("/developer-tools");

    if (location.pathname === "/shared/invalid-link") {
      return children;
    }

    if (isLoaded && !isAuthenticated) {
      if (isPortalDeactivate) {
        window.location.replace(
          combineUrl(window.ClientConfig?.proxy?.url, "/unavailable"),
        );

        return null;
      }
      // console.log("PrivateRoute render Redirect to login", rest);x
      const redirectPath = wizardCompleted ? "/login" : "/wizard";

      if (location.pathname === redirectPath) return null;

      const isHomeUrl = location.pathname === "/";

      if (wizardCompleted && !isHomeUrl && !isLogout) {
        sessionStorage.setItem("referenceUrl", window.location.href);
      }

      window.location.replace(
        combineUrl(window.ClientConfig?.proxy?.url, redirectPath),
      );

      return null;
    }

    if (
      isLoaded &&
      ((!isNotPaidPeriod && isPortalUnavailableUrl) ||
        ((!user?.isOwner || (baseDomain && baseDomain === "localhost")) &&
          isPortalDeletionUrl) ||
        (isCommunity && isPaymentsUrl) ||
        (isEnterprise && isBonusPage) ||
        (standalone && isServicesPage))
    ) {
      return <Navigate replace to="/" />;
    }

    if (
      isLoaded &&
      isAuthenticated &&
      tenantStatus === TenantStatus.EncryptionProcess &&
      !isEncryptionUrl
    ) {
      return (
        <Navigate
          replace
          to={combineUrl(window.ClientConfig?.proxy?.url, "/encryption-portal")}
        />
      );
    }

    if (
      isLoaded &&
      isAuthenticated &&
      tenantStatus === TenantStatus.PortalRestore &&
      !isPortalUrl
    ) {
      const url = isManagement
        ? "management/preparation-portal"
        : "/preparation-portal";

      return (
        <Navigate
          replace
          to={combineUrl(window.ClientConfig?.proxy?.url, url)}
        />
      );
    }

    if (
      isNotPaidPeriod &&
      isLoaded &&
      (user?.isOwner || user?.isAdmin) &&
      !isPaymentsUrl &&
      !isBackupUrl &&
      !isPortalDeletionUrl &&
      !location.pathname.includes("wallet")
    ) {
      return (
        <Navigate
          replace
          to={combineUrl(
            window.ClientConfig?.proxy?.url,
            "/portal-settings/payments/portal-payments",
          )}
        />
      );
    }

    if (
      isNotPaidPeriod &&
      isLoaded &&
      !user?.isOwner &&
      !user?.isAdmin &&
      !isPortalUnavailableUrl
    ) {
      return (
        <Navigate
          replace
          to={combineUrl(
            window.ClientConfig?.proxy?.url,
            "/portal-unavailable",
          )}
        />
      );
    }

    // if (!isLoaded) {
    //   return <AppLoader />;

    if (isPortalDeactivate && location.pathname !== "/unavailable") {
      return (
        <Navigate
          to={combineUrl(window.ClientConfig?.proxy?.url, "/unavailable")}
          state={{ from: location }}
        />
      );
    }

    if (isManagement && !isPortalManagement && !isFileManagement) {
      if (isLoaded && !isAuthenticated) return <Navigate replace to="/" />;
      if ((user && !user?.isAdmin && !user?.isOwner) || limitedAccessSpace)
        return <Navigate replace to="/error/403" />;

      if (isPaymentPageUnavailable)
        return <Navigate replace to="/management/bonus" />;
      if (isBonusPageUnavailable)
        return <Navigate replace to="/management/payments" />;
      return children;
    }

    if (!isLoaded) {
      return <AppLoader />;
    }

    if (
      (isPortalRenameUrl && !enablePortalRename) ||
      (isCommunity && isBrandingPage)
    ) {
      return <Navigate replace to="/error/404" />;
    }

    if (isOAuthPage && !identityServerEnabled) {
      return <Navigate replace to="/developer-tools/javascript-sdk" />;
    }

    if (isAuthorizedAppsPage && !identityServerEnabled) {
      return (
        <Navigate
          replace
          to={location.pathname.replace("authorized-apps", "login")}
        />
      );
    }

    if (isDeveloperToolsPage) {
      if (user?.isVisitor || (limitedAccessDevToolsForUsers && !user?.isAdmin && !user?.isOwner))
        return <Navigate replace to="/error/403" />;
    }

    if (requireAIServices && !aiServicesEnabled) {
      return <Navigate replace to="/error/404" />;
    }

    if (isAccountsPage) {
      return children;
    }

    if (
      !restricted ||
      isAdmin ||
      (withManager && !user?.isVisitor && !user?.isCollaborator) ||
      (withCollaborator &&
        (!user?.isVisitor || (user?.isVisitor && user?.hasPersonalFolder)))
    ) {
      return children;
    }

    if (restricted) {
      return <Navigate replace to="/error/401" />;
    }

    return <Navigate replace to="/error/404" />;
  };

  const component = renderComponent();

  return component;
};
