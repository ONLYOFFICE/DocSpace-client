import { inject, observer } from "mobx-react";

import { PrivateRoute } from "@docspace/shared/routes";
import type { PrivateRouteProps } from "@docspace/shared/routes";

const PrivateRouteWrapper = ({
  wizardCompleted,
  children,
  enablePortalRename,
  isAdmin,
  isAuthenticated,
  isCommunity,
  isEnterprise,
  isLoaded,
  isLogout,
  isNotPaidPeriod,
  isPortalDeactivate,
  limitedAccessSpace,
  tenantStatus,
  user,
  restricted,
  withCollaborator,
  withManager,
}: Partial<PrivateRouteProps>) => {
  return (
    <PrivateRoute
      user={user!}
      isAdmin={isAdmin!}
      isLoaded={isLoaded!}
      isLogout={isLogout!}
      restricted={restricted}
      withManager={withManager}
      isCommunity={isCommunity}
      isEnterprise={isEnterprise}
      tenantStatus={tenantStatus!}
      isAuthenticated={isAuthenticated}
      wizardCompleted={wizardCompleted!}
      isNotPaidPeriod={isNotPaidPeriod!}
      withCollaborator={withCollaborator}
      isPortalDeactivate={isPortalDeactivate!}
      enablePortalRename={enablePortalRename!}
      limitedAccessSpace={limitedAccessSpace!}
    >
      {children}
    </PrivateRoute>
  );
};

export default inject<TStore>(
  ({ authStore, settingsStore, userStore, currentTariffStatusStore }) => {
    const {
      isAuthenticated,
      isLoaded,
      isAdmin,

      isLogout,
      isCommunity,
      isEnterprise,
    } = authStore;
    const { isNotPaidPeriod } = currentTariffStatusStore;
    const { user } = userStore;

    const {
      wizardCompleted,
      tenantStatus,
      isPortalDeactivate,
      enablePortalRename,
      limitedAccessSpace,
    } = settingsStore;

    return {
      isPortalDeactivate,
      isCommunity,
      isNotPaidPeriod,
      user,
      isAuthenticated,
      isAdmin,
      isLoaded,
      wizardCompleted,
      tenantStatus,
      isLogout,
      isEnterprise,
      enablePortalRename,
      limitedAccessSpace,
    };
  },
)(observer(PrivateRouteWrapper));
