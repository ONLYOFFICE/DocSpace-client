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

/* eslint-disable react/prop-types */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import AppLoader from "@docspace/shared/components/app-loader";

import { TenantStatus } from "@docspace/shared/enums";
import { combineUrl } from "@docspace/shared/utils/combineUrl";

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
  } = props;

  const location = useLocation();

  const renderComponent = () => {
    if (!user && isAuthenticated) {
      if (isPortalDeactivate) {
        window.location.replace(
          combineUrl(window.DocSpaceConfig?.proxy?.url, "/unavailable"),
        );

        return null;
      }

      // console.log("PrivateRoute returned null");
      return null;
    }

    const isPortalUrl = location.pathname === "/preparation-portal";

    const isPaymentsUrl =
      location.pathname === "/portal-settings/payments/portal-payments";
    const isBackupUrl =
      location.pathname === "/portal-settings/backup/data-backup";

    const isPortalUnavailableUrl = location.pathname === "/portal-unavailable";

    const isPortalDeletionUrl =
      location.pathname === "/portal-settings/delete-data/deletion" ||
      location.pathname === "/portal-settings/delete-data/deactivation";

    const isBonusPage = location.pathname === "/portal-settings/bonus";

    const isPortalRenameUrl =
      location.pathname ===
      "/portal-settings/customization/general/portal-renaming";

    if (isLoaded && !isAuthenticated) {
      if (isPortalDeactivate) {
        window.location.replace(
          combineUrl(window.DocSpaceConfig?.proxy?.url, "/unavailable"),
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
        combineUrl(window.DocSpaceConfig?.proxy?.url, redirectPath),
      );

      return null;
    }

    if (
      isLoaded &&
      ((!isNotPaidPeriod && isPortalUnavailableUrl) ||
        (!user?.isOwner && isPortalDeletionUrl) ||
        (isCommunity && isPaymentsUrl) ||
        (isEnterprise && isBonusPage))
    ) {
      return <Navigate replace to="/" />;
    }

    if (
      isLoaded &&
      isAuthenticated &&
      tenantStatus === TenantStatus.PortalRestore &&
      !isPortalUrl
    ) {
      return (
        <Navigate
          replace
          to={combineUrl(
            window.DocSpaceConfig?.proxy?.url,
            "/preparation-portal",
          )}
        />
      );
    }

    if (
      isNotPaidPeriod &&
      isLoaded &&
      (user?.isOwner || user?.isAdmin) &&
      !isPaymentsUrl &&
      !isBackupUrl &&
      !isPortalDeletionUrl
    ) {
      return (
        <Navigate
          replace
          to={combineUrl(
            window.DocSpaceConfig?.proxy?.url,
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
            window.DocSpaceConfig?.proxy?.url,
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
          to={combineUrl(window.DocSpaceConfig?.proxy?.url, "/unavailable")}
          state={{ from: location }}
        />
      );
    }

    if (!isLoaded) {
      return <AppLoader />;
    }

    // const userLoaded = !isEmpty(user);
    // if (!userLoaded) {
    //   return <Component {...props} />;
    // }

    // if (!userLoaded) {
    //   console.log("PrivateRoute render Loader", rest);
    //   return (
    //     <Section>
    //       <Section.SectionBody>
    //         <Loader className="pageLoader" type="rombs" size="40px" />
    //       </Section.SectionBody>
    //     </Section>
    //   );
    // }

    if (isPortalRenameUrl && !enablePortalRename) {
      return <Navigate replace to="/error/404" />;
    }

    if (
      !restricted ||
      isAdmin ||
      (withManager && !user?.isVisitor && !user?.isCollaborator) ||
      (withCollaborator && !user?.isVisitor)
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
