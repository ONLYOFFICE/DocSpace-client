import type { PropsWithChildren } from "react";

import type { AuthStore } from "../store/AuthStore";
import type { UserStore } from "../store/UserStore";
import type { SettingsStore } from "../store/SettingsStore";
import type { CurrentTariffStatusStore } from "../store/CurrentTariffStatusStore";

export interface PrivateRouteProps
  extends PropsWithChildren,
    Pick<
      AuthStore,
      | "isAuthenticated"
      | "isLoaded"
      | "isAdmin"
      | "isLogout"
      | "isCommunity"
      | "isEnterprise"
    >,
    Pick<
      SettingsStore,
      | "wizardCompleted"
      | "tenantStatus"
      | "isPortalDeactivate"
      | "enablePortalRename"
      | "limitedAccessSpace"
    >,
    Pick<CurrentTariffStatusStore, "isNotPaidPeriod">,
    Pick<UserStore, "user"> {
  restricted?: boolean;
  withManager?: boolean;
  withCollaborator?: boolean;
}

export interface PublicRouteProps
  extends PropsWithChildren,
    Pick<AuthStore, "isAuthenticated">,
    Pick<
      SettingsStore,
      "wizardCompleted" | "tenantStatus" | "isPortalDeactivate"
    > {}
