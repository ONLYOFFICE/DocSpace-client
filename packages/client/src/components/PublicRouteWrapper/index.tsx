import { inject, observer } from "mobx-react";

import { PublicRoute } from "@docspace/shared/routes";
import type { PublicRouteProps } from "@docspace/shared/routes";

const PublicRouteWrapper = ({
  children,
  isAuthenticated,
  isPortalDeactivate,
  tenantStatus,
  wizardCompleted,
}: Partial<PublicRouteProps>) => {
  return (
    <PublicRoute
      tenantStatus={tenantStatus!}
      isAuthenticated={isAuthenticated}
      wizardCompleted={wizardCompleted!}
      isPortalDeactivate={isPortalDeactivate!}
    >
      {children}
    </PublicRoute>
  );
};

export default inject<TStore>(({ authStore, settingsStore }) => {
  const { isAuthenticated } = authStore;
  const { wizardCompleted, tenantStatus, isPortalDeactivate } = settingsStore;

  return {
    tenantStatus,
    wizardCompleted,
    isAuthenticated,
    isPortalDeactivate,
  };
})(observer(PublicRouteWrapper));
