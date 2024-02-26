/* eslint-disable react/prop-types */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import Error403 from "@docspace/shared/components/errors/Error403";
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
    limitedAccessSpace,
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

      console.log("PrivateRoute returned null");
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

    if (isLoaded && limitedAccessSpace && isPortalDeletionUrl) {
      return <Error403 />;
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
