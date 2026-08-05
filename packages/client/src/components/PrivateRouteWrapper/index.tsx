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

import { inject, observer } from "mobx-react";

import { PrivateRoute } from "@docspace/shared/routes";
import type { PrivateRouteProps } from "@docspace/shared/routes";

const PrivateRouteWrapper = ({
  wizardCompleted,
  children,
  enablePortalRename,
  isAdmin,
  isAuthenticated = false,
  isCommunity,
  isEnterprise,
  isLoaded,
  isLogout,
  isNotPaidPeriod,
  isPortalDeactivate,
  tenantStatus,
  user,
  restricted,
  withCollaborator,
  withManager,
  identityServerEnabled,
  limitedAccessSpace,
  baseDomain,
  displayAbout,
  limitedAccessDevToolsForUsers,
  standalone,
  requireAIServices,
  aiServicesEnabled,
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
      identityServerEnabled={identityServerEnabled}
      limitedAccessSpace={limitedAccessSpace ?? null}
      baseDomain={baseDomain!}
      displayAbout={displayAbout!}
      limitedAccessDevToolsForUsers={limitedAccessDevToolsForUsers!}
      standalone={standalone!}
      requireAIServices={requireAIServices}
      aiServicesEnabled={aiServicesEnabled!}
    >
      {children}
    </PrivateRoute>
  );
};

export default inject<TStore>(
  ({ authStore, settingsStore, userStore, currentTariffStatusStore }) => {
    const { isAuthenticated, isLoaded, isAdmin, isLogout, capabilities } =
      authStore;

    const { isNotPaidPeriod, isCommunity, isEnterprise } =
      currentTariffStatusStore;

    const identityServerEnabled = capabilities?.identityServerEnabled;

    const { user } = userStore;

    const {
      wizardCompleted,
      tenantStatus,
      isPortalDeactivate,
      enablePortalRename,
      limitedAccessSpace,
      baseDomain,
      displayAbout,
      limitedAccessDevToolsForUsers,
      standalone,
      aiServicesEnabled,
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
      identityServerEnabled,
      limitedAccessSpace,
      baseDomain,
      displayAbout,

      limitedAccessDevToolsForUsers,
      standalone,
      aiServicesEnabled,
    };
  },
)(observer(PrivateRouteWrapper));
