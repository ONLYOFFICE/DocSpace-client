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

/* eslint-disable react/prop-types */

import React, { useEffect } from "react";
import { Navigate, useLocation, useSearchParams } from "react-router";

import FilesFilter from "../api/files/filter";
import AppLoader from "../components/app-loader";

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
    isLoadedUser,
    children,
    restricted,
    tenantStatus,
    enablePortalRename,

    identityServerEnabled,
    baseDomain,
    limitedAccessSpace,
    displayAbout,

    validatePublicRoomKey,
    publicRoomKey,
    roomId,
    isLoadedPublicRoom,
    isLoadingPublicRoom,

    limitedAccessDevToolsForUsers,
    standalone,
  } = props;

  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const key = searchParams.get("key");

    if (
      key &&
      (!publicRoomKey || publicRoomKey !== key) &&
      location.pathname.includes("/rooms/shared") &&
      !isLoadedPublicRoom &&
      !isLoadingPublicRoom &&
      isLoadedUser &&
      validatePublicRoomKey
    ) {
      validatePublicRoomKey(key);
    }
  }, [
    searchParams,
    publicRoomKey,
    location.pathname,
    isLoadedPublicRoom,
    isLoadingPublicRoom,
    isLoadedUser,
    validatePublicRoomKey,
  ]);

  const renderComponent = () => {
    const key = searchParams.get("key");

    if (location.pathname.includes("/rooms/shared")) {
      if (!isLoadedUser) {
        return <AppLoader />;
      }

      if (!user && isAuthenticated) {
        const filter = FilesFilter.getDefault();
        const subFolder = new URLSearchParams(window.location.search).get(
          "folder",
        );
        const path = "/rooms/share";

        filter.folder = subFolder || roomId || "";
        if (key) {
          filter.key = key;
        }

        return <Navigate to={`${path}?${filter.toUrlParams()}`} />;
      }
    }

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
    const isServicesPage = location.pathname === "/portal-settings/services";

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
    const isManagement = location.pathname.includes("management");
    const isPaymentPageUnavailable =
      location.pathname.includes("payments") && isCommunity;
    const isBonusPageUnavailable =
      location.pathname.includes("bonus") && !isCommunity;

    const isAboutPage = location.pathname.includes("about");
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

    if (isAboutPage && !displayAbout) {
      return <Navigate replace to="/error/404" />;
    }

    if (isManagement && !isPortalManagement && !isFileManagement) {
      if (isLoaded && !isAuthenticated) return <Navigate replace to="/" />;
      if ((user && !user?.isAdmin) || limitedAccessSpace)
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
      if (user?.isVisitor || (limitedAccessDevToolsForUsers && !user?.isAdmin))
        return <Navigate replace to="/error/403" />;
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
