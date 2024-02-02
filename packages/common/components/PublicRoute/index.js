/* eslint-disable react/prop-types */
import React from "react";
import { Navigate, Route, useLocation } from "react-router-dom";
//import AppLoader from "../AppLoader";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { inject, observer } from "mobx-react";
import { TenantStatus } from "@docspace/shared/enums";

export const PublicRoute = ({ children, ...rest }) => {
  const { wizardCompleted, isAuthenticated, tenantStatus, isPortalDeactivate } =
    rest;

  const location = useLocation();

  const renderComponent = () => {
    const isPreparationPortalUrl = location.pathname === "/preparation-portal";
    const isDeactivationPortalUrl = location.pathname === "/unavailable";
    const isPortalRestriction = location.pathname === "/access-restricted";
    const isPortalRestoring = tenantStatus === TenantStatus.PortalRestore;

    // if (!isLoaded) {
    //   return <AppLoader />;
    // }

    if (location?.state?.isRestrictionError) {
      return children;
    }

    if (location.pathname === "/rooms/share") {
      return children;
    }

    if (
      (isAuthenticated && !isPortalRestoring && !isPortalDeactivate) ||
      (!location?.state?.isRestrictionError && isPortalRestriction)
    ) {
      return <Navigate replace to={"/"} />;
    }

    if (isAuthenticated && isPortalRestoring && !isPreparationPortalUrl) {
      return (
        <Navigate
          replace
          to={combineUrl(
            window.DocSpaceConfig?.proxy?.url,
            "/preparation-portal"
          )}
        />
      );
    }
    if (isAuthenticated && isPortalDeactivate && !isDeactivationPortalUrl) {
      return (
        <Navigate
          replace
          to={combineUrl(window.DocSpaceConfig?.proxy?.url, "/unavailable")}
        />
      );
    }
    if (!wizardCompleted && location.pathname !== "/wizard") {
      return <Navigate replace to={"/wizard"} />;
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
            window.DocSpaceConfig?.proxy?.url,
            "/preparation-portal"
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
          to={combineUrl(window.DocSpaceConfig?.proxy?.url, "/unavailable")}
        />
      );
    }

    if (
      wizardCompleted &&
      !isAuthenticated &&
      !isPortalRestoring &&
      !isPortalDeactivate
    ) {
      window.location.replace(
        combineUrl(window.DocSpaceConfig?.proxy?.url, "/login")
      );

      return null;
    }

    return children;
  };

  const component = renderComponent();

  return component;
};

export default inject(({ authStore, settingsStore }) => {
  const { isAuthenticated, isLoaded } = authStore;
  const { wizardCompleted, tenantStatus, isPortalDeactivate } = settingsStore;

  return {
    tenantStatus,
    wizardCompleted,
    isAuthenticated,
    isLoaded,
    isPortalDeactivate,
  };
})(observer(PublicRoute));
