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

import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";

import AppLoader from "@docspace/ui-kit/components/app-loader";

import { TenantStatus } from "../enums";
import { combineUrl } from "../utils/combineUrl";
import { AUTH_TOKEN_TIMEOUT_MS, isOAuthFrame } from "../utils/oauthToken";
import { isPortalNotFoundRedirectClaimed } from "../utils/portalNotFound";
import {
  hasDevToolsAccess,
  hasDocsConnectAccess,
} from "../utils/devToolsAccess";

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

  const [oauthGraceExpired, setOauthGraceExpired] = useState(false);

  useEffect(() => {
    if (!isOAuthFrame() || isAuthenticated) return undefined;

    const timer = setTimeout(
      () => setOauthGraceExpired(true),
      AUTH_TOKEN_TIMEOUT_MS,
    );

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const renderComponent = () => {
    // A deleted portal fails every request, this route among them, so the
    // branches below would send the visitor to the login page — which bounces
    // a still-present auth cookie back to the portal root, where the same
    // thing happens again. The wrong-portal-name redirect is already under
    // way, and nothing may render or navigate over it.
    if (isPortalNotFoundRedirectClaimed()) return null;

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
      location.pathname === "/portal-settings/payments/portal-payments" ||
      location.pathname === "/billing/tariff-plan";
    const isBackupUrl =
      location.pathname === "/portal-settings/backup/data-backup";

    const isPortalUnavailableUrl = location.pathname === "/portal-unavailable";

    const isPortalDeletionUrl =
      location.pathname === "/portal-settings/delete-data/deletion" ||
      location.pathname === "/portal-settings/delete-data/deactivation";

    const isBonusPage = location.pathname === "/portal-settings/bonus";

    // SaaS billing lives under its own /billing article (the Stripe callback
    // included); standalone has the license page under portal-payments and
    // nothing else - no wallet, no addons, no payment method. Community has
    // neither, so the whole section is closed there.
    const isPaymentsSection =
      location.pathname === "/billing" ||
      location.pathname.startsWith("/billing/") ||
      location.pathname.startsWith("/portal-settings/payments");
    const isSaasOnlyPaymentsUrl =
      isPaymentsSection &&
      location.pathname !== "/portal-settings/payments/portal-payments";

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
    const isKeysManagement = location.pathname.includes("keys-management");
    const isManagement =
      location.pathname.includes("management") &&
      !location.pathname.includes("ad-management");
    const isPaymentPageUnavailable =
      location.pathname.includes("payments") && isCommunity;
    const isBonusPageUnavailable =
      location.pathname.includes("bonus") && !isCommunity;

    const isDeveloperToolsPage = location.pathname.includes("/developer-tools");
    const isDocsConnectPage = location.pathname.includes(
      "/developer-tools/docs-connect",
    );

    if (location.pathname === "/shared/invalid-link") {
      return children;
    }

    if (isLoaded && !isAuthenticated) {
      if (isOAuthFrame() && !oauthGraceExpired) {
        return <AppLoader />;
      }

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
        (isCommunity && isPaymentsSection) ||
        (isEnterprise && isBonusPage))
    ) {
      return <Navigate replace to="/" />;
    }

    if (isLoaded && standalone && isSaasOnlyPaymentsUrl) {
      // Community is already home by now; the license page left here is the
      // standalone counterpart of SaaS billing, and it is admin-only.
      const canOpenLicensePage = user?.isOwner || user?.isAdmin;

      return (
        <Navigate
          replace
          to={
            canOpenLicensePage
              ? combineUrl(
                  window.ClientConfig?.proxy?.url,
                  "/portal-settings/payments/portal-payments",
                )
              : "/"
          }
        />
      );
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
            standalone
              ? "/portal-settings/payments/portal-payments"
              : "/billing/tariff-plan",
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

    if (
      isManagement &&
      !isPortalManagement &&
      !isFileManagement &&
      !isKeysManagement
    ) {
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
      if (!hasDevToolsAccess(user, limitedAccessDevToolsForUsers))
        return <Navigate replace to="/error/403" />;

      // Docs Connect is SaaS-only and admin/owner-only even when the rest of
      // the section is open, so a standalone portal, a room admin or a user who
      // guesses the URL is bounced too.
      if (isDocsConnectPage && !hasDocsConnectAccess(user, standalone))
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
