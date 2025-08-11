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
import { t } from "i18next";
import React from "react";

import {
  getNotificationSubscription,
  getAuthProviders,
  getTfaBackupCodes,
} from "@docspace/shared/api/settings";
import { TThirdPartyProvider } from "@docspace/shared/api/settings/types";
import { toastr } from "@docspace/shared/components/toast";
import { NotificationsType } from "@docspace/shared/enums";
import { AuthStore } from "@docspace/shared/store/AuthStore";
import { TfaStore } from "@docspace/shared/store/TfaStore";

import { setDocumentTitle } from "SRC_DIR/helpers/utils";
import ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import TargetUserStore from "SRC_DIR/store/contacts/TargetUserStore";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import FilesSettingsStore from "SRC_DIR/store/FilesSettingsStore";
import OAuthStore from "SRC_DIR/store/OAuthStore";
import SettingsSetupStore from "SRC_DIR/store/SettingsSetupStore";

export type UseProfileBodyProps = {
  isFirstSubscriptionsLoad?: boolean;
  tfaSettings?: TfaStore["tfaSettings"];

  getFilesSettings: FilesSettingsStore["getFilesSettings"];
  setSubscriptions: TargetUserStore["setSubscriptions"];
  fetchConsents: OAuthStore["fetchConsents"];
  fetchScopes: OAuthStore["fetchScopes"];
  getTfaType: TfaStore["getTfaType"];
  setBackupCodes: TfaStore["setBackupCodes"];
  setProviders: UsersStore["setProviders"];
  getCapabilities: AuthStore["getCapabilities"];
  getSessions: SettingsSetupStore["getSessions"];
  setIsProfileLoaded: ClientLoadingStore["setIsProfileLoaded"];
  setIsSectionHeaderLoading: ClientLoadingStore["setIsSectionHeaderLoading"];
};

const useProfileBody = ({
  getFilesSettings,
  setSubscriptions,
  isFirstSubscriptionsLoad,
  fetchConsents,
  fetchScopes,
  tfaSettings,
  setBackupCodes,
  setProviders,
  getCapabilities,
  getSessions,
  setIsProfileLoaded,
  setIsSectionHeaderLoading,
  getTfaType,
}: UseProfileBodyProps) => {
  const tfaOn = tfaSettings && tfaSettings !== "none";

  const getNotificationsData = React.useCallback(async () => {
    if (!isFirstSubscriptionsLoad) return;

    const requests = [
      getNotificationSubscription(NotificationsType.Badges) as Promise<{
        isEnabled: boolean;
      }>,
      getNotificationSubscription(NotificationsType.RoomsActivity) as Promise<{
        isEnabled: boolean;
      }>,
      getNotificationSubscription(NotificationsType.DailyFeed) as Promise<{
        isEnabled: boolean;
      }>,
      getNotificationSubscription(NotificationsType.UsefulTips) as Promise<{
        isEnabled: boolean;
      }>,
    ];

    try {
      const [badges, roomsActivity, dailyFeed, tips]: { isEnabled: boolean }[] =
        await Promise.all(requests);

      setSubscriptions?.(
        badges?.isEnabled,
        roomsActivity?.isEnabled,
        dailyFeed?.isEnabled,
        tips?.isEnabled,
      );
    } catch (e) {
      toastr.error(e as string);
    }
  }, [setSubscriptions, isFirstSubscriptionsLoad]);

  const getFileManagementData = React.useCallback(async () => {
    const prefix =
      window.DocSpace.location.pathname.includes("portal-settings");

    if (prefix) await getFilesSettings?.();
  }, [getFilesSettings]);

  const getConsentList = React.useCallback(async () => {
    try {
      await Promise.all([fetchConsents?.(), fetchScopes?.()]);
    } catch (e) {
      toastr.error(e as string);
    }
  }, [fetchConsents, fetchScopes]);

  const openLoginTab = React.useCallback(async () => {
    const actions = [];

    try {
      actions.push([getAuthProviders?.(), getCapabilities?.()]);

      if (tfaOn) {
        actions.push(getTfaBackupCodes?.());
      }

      actions.push(getSessions?.());

      const [newProviders, , newCodes] = await Promise.all(actions);

      if (newProviders) {
        setProviders?.(newProviders as TThirdPartyProvider[]);
      }

      if (newCodes) {
        setBackupCodes?.(newCodes as string[]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [
    tfaOn,
    getAuthProviders,
    getCapabilities,
    getTfaBackupCodes,
    getSessions,
    setBackupCodes,
  ]);

  const initialLoad = React.useCallback(async () => {
    const getProfile = () => {
      setIsProfileLoaded?.(true, false);

      setIsSectionHeaderLoading?.(false);
    };

    await Promise.all([getProfile(), getTfaType?.()]);

    setDocumentTitle?.(t?.("Common:Profile"));
  }, [setIsProfileLoaded, getTfaType, t]);

  const getProfileInitialValue = React.useCallback(async () => {
    const actions = [initialLoad()];
    if (window.location.pathname.includes("login"))
      actions.push(openLoginTab());

    if (window.location.pathname.includes("notifications"))
      actions.push(getNotificationsData());

    if (window.location.pathname.includes("file-management"))
      actions.push(getFileManagementData());

    if (window.location.pathname.includes("authorized-apps"))
      actions.push(getConsentList());

    await Promise.all(actions);
  }, [
    initialLoad,
    openLoginTab,
    getNotificationsData,
    getFileManagementData,
    getConsentList,
  ]);

  React.useEffect(() => {
    if (window.location.pathname.includes("portal-settings"))
      getProfileInitialValue();
  }, [getProfileInitialValue]);

  return {
    tfaOn,
    getProfileInitialValue,
    getNotificationsData,
    getFileManagementData,
    getConsentList,
    openLoginTab,
    initialLoad,
  };
};

export default useProfileBody;
