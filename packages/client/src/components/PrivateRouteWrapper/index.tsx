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
  tenantStatus,
  user,
  isLoadedUser,
  restricted,
  withCollaborator,
  withManager,
  identityServerEnabled,
  limitedAccessSpace,
  baseDomain,
  displayAbout,
  validatePublicRoomKey,
  publicRoomKey,
  roomId,
  isLoadedPublicRoom,
  isLoadingPublicRoom,
  limitedAccessDevToolsForUsers,
}: Partial<PrivateRouteProps>) => {
  return (
    <PrivateRoute
      user={user!}
      isLoadedUser={isLoadedUser}
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
      validatePublicRoomKey={validatePublicRoomKey}
      publicRoomKey={publicRoomKey}
      roomId={roomId}
      isLoadedPublicRoom={isLoadedPublicRoom}
      isLoadingPublicRoom={isLoadingPublicRoom}
      limitedAccessDevToolsForUsers={limitedAccessDevToolsForUsers!}
    >
      {children}
    </PrivateRoute>
  );
};

export default inject<TStore>(
  ({
    authStore,
    settingsStore,
    userStore,
    currentTariffStatusStore,
    publicRoomStore,
  }) => {
    const { isAuthenticated, isLoaded, isAdmin, isLogout, capabilities } =
      authStore;

    const { isNotPaidPeriod, isCommunity, isEnterprise } =
      currentTariffStatusStore;

    const identityServerEnabled = capabilities?.identityServerEnabled;

    const { user, isLoaded: isLoadedUser } = userStore;

    const {
      wizardCompleted,
      tenantStatus,
      isPortalDeactivate,
      enablePortalRename,
      limitedAccessSpace,
      baseDomain,
      displayAbout,
      limitedAccessDevToolsForUsers,
    } = settingsStore;

    const {
      validatePublicRoomKey,
      publicRoomKey,
      roomId,
      isLoaded: isLoadedPublicRoom,
      isLoading: isLoadingPublicRoom,
    } = publicRoomStore;

    return {
      isPortalDeactivate,
      isCommunity,
      isNotPaidPeriod,
      user,
      isLoadedUser,
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
      validatePublicRoomKey,
      publicRoomKey,
      roomId,
      isLoadedPublicRoom,
      isLoadingPublicRoom,
      limitedAccessDevToolsForUsers,
    };
  },
)(observer(PrivateRouteWrapper));
