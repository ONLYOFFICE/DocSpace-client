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

import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate, useLocation } from "react-router";
import { TFunction } from "i18next";
import { useEffect, useRef } from "react";

import { ProfileViewLoader } from "@docspace/shared/skeletons/profile";
import { Tabs, TTabItem } from "@docspace/ui-kit/components/tabs";
import { DeviceType } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";

import { SECTION_HEADER_HEIGHT } from "@docspace/ui-kit/components/section/Section.constants";
import { TfaStore } from "@docspace/shared/store/TfaStore";
import { AuthStore } from "@docspace/shared/store/AuthStore";

import FilesSettingsStore from "SRC_DIR/store/FilesSettingsStore";
import TargetUserStore from "SRC_DIR/store/contacts/TargetUserStore";
import OAuthStore from "SRC_DIR/store/OAuthStore";
import ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import SettingsSetupStore from "SRC_DIR/store/SettingsSetupStore";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import FilesStore from "SRC_DIR/store/FilesStore";
import TelegramStore from "SRC_DIR/store/TelegramStore";

import MainProfile from "./sub-components/main-profile";
import LoginContent from "./sub-components/login";
import Notifications from "./sub-components/notifications";
import FileManagement from "./sub-components/file-management";
import InterfaceTheme from "./sub-components/interface-theme";
import AuthorizedApps from "./sub-components/authorized-apps";
import useProfileBody from "./useProfileBody";
import styles from "./body.module.scss";

type SectionBodyContentProps = {
  showProfileLoader?: boolean;
  currentDeviceType?: DeviceType;
  identityServerEnabled?: boolean;
  t?: TFunction;
  isFirstSubscriptionsLoad?: boolean;
  tfaSettings?: TfaStore["tfaSettings"];
  getFilesSettings?: FilesSettingsStore["getFilesSettings"];
  setSubscriptions?: TargetUserStore["setSubscriptions"];
  fetchConsents?: OAuthStore["fetchConsents"];
  fetchScopes?: OAuthStore["fetchScopes"];
  getTfaType?: TfaStore["getTfaType"];
  setBackupCodes?: TfaStore["setBackupCodes"];
  setProviders?: UsersStore["setProviders"];
  getCapabilities?: AuthStore["getCapabilities"];
  getSessions?: SettingsSetupStore["getSessions"];
  setIsProfileLoaded?: ClientLoadingStore["setIsProfileLoaded"];
  setIsSectionBodyLoading?: ClientLoadingStore["setIsSectionBodyLoading"];
  setIsSectionHeaderLoading?: ClientLoadingStore["setIsSectionHeaderLoading"];
  setIsArticleLoading?: ClientLoadingStore["setIsArticleLoading"];
  resetSelections?: FilesStore["resetSelections"];
  setNotificationChannels?: TargetUserStore["setNotificationChannels"];
  checkTg?: TelegramStore["checkTg"];
};

const SectionBodyContent = (props: SectionBodyContentProps) => {
  const {
    showProfileLoader,
    currentDeviceType,
    identityServerEnabled,
    t,
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
    setIsSectionBodyLoading,
    setIsSectionHeaderLoading,
    setIsArticleLoading,
    getTfaType,
    resetSelections,
    setNotificationChannels,
    checkTg,
  } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const tabsRef = useRef<HTMLDivElement>(null);

  const checkEmailChangeParam = () => {
    const search = window.location.search;
    const urlParams = new URLSearchParams(search);

    if (urlParams.get("email_change") === "success") {
      toastr.success(t?.("Profile:EmailChangeSuccess"));

      const pathname = window.location.pathname;
      window.history.replaceState({}, document.title, pathname);
    }
  };

  useEffect(() => {
    checkEmailChangeParam();
    resetSelections?.();
  }, []);

  const {
    tfaOn,
    getNotificationsData,
    getFileManagementData,
    getConsentList,
    openLoginTab,
  } = useProfileBody({
    getFilesSettings: getFilesSettings!,
    setSubscriptions: setSubscriptions!,
    setNotificationChannels: setNotificationChannels!,
    isFirstSubscriptionsLoad,
    fetchConsents: fetchConsents!,
    fetchScopes: fetchScopes!,
    tfaSettings,
    setBackupCodes: setBackupCodes!,
    setProviders: setProviders!,
    getCapabilities: getCapabilities!,
    getSessions: getSessions!,
    setIsProfileLoaded: setIsProfileLoaded!,
    setIsSectionHeaderLoading: setIsSectionHeaderLoading!,
    setIsArticleLoading: setIsArticleLoading!,
    getTfaType: getTfaType!,
    checkTg: checkTg!,
    setIsSectionBodyLoading: setIsSectionBodyLoading!,
  });

  const data = [
    {
      id: "login",
      name: t?.("Common:Login"),
      content: <LoginContent tfaOn={tfaOn || false} />,
      onClick: async () => {
        await openLoginTab();
      },
    },
    {
      id: "notifications",
      name: t?.("Notifications:Notifications"),
      content: <Notifications />,
      onClick: async () => {
        await getNotificationsData();
      },
    },
    {
      id: "file-management",
      name: t?.("Common:FileManagement"),
      content: <FileManagement />,
      onClick: async () => {
        await getFileManagementData();
      },
    },
    {
      id: "interface-theme",
      name: t?.("Common:InterfaceTheme"),
      content: <InterfaceTheme />,
      onClick: () => {},
    },
  ];

  if (identityServerEnabled) {
    data.push({
      id: "authorized-apps",
      name: t?.("OAuth:AuthorizedApps"),
      content: <AuthorizedApps />,
      onClick: async () => {
        await getConsentList();
      },
    });
  }

  const getCurrentTabId = () => {
    const path = window.location.pathname;
    const currentTab = data.find((item) => path.includes(item.id));
    return currentTab && data.length ? currentTab.id : data[0].id;
  };

  const currentTabId = getCurrentTabId();

  const onSelect = (e: TTabItem) => {
    const arrayPaths = window.location.pathname.split("/");
    arrayPaths.splice(arrayPaths.length - 1);
    const path = arrayPaths.join("/");
    navigate(`${path}/${e.id}`, {
      state: { disableScrollToTop: true, fromUrl: location?.state?.fromUrl },
    });

    if (tabsRef.current && currentDeviceType === DeviceType.mobile) {
      setTimeout(() => {
        tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  if (showProfileLoader) return <ProfileViewLoader />;

  return (
    <div className={styles.wrapper}>
      <MainProfile />
      <div ref={tabsRef}>
        <Tabs
          items={data}
          selectedItemId={currentTabId}
          onSelect={onSelect}
          stickyTop={SECTION_HEADER_HEIGHT[currentDeviceType as DeviceType]}
          withAnimation
        />
      </div>
    </div>
  );
};

export default inject(
  ({
    settingsStore,
    peopleStore,
    clientLoadingStore,
    authStore,
    filesSettingsStore,
    oauthStore,
    tfaStore,
    setup,
    filesStore,
    telegramStore,
  }: TStore) => {
    const {
      showProfileLoader,
      setIsProfileLoaded,
      setIsSectionHeaderLoading,
      setIsSectionBodyLoading,
      setIsArticleLoading,
    } = clientLoadingStore;

    const identityServerEnabled =
      authStore?.capabilities?.identityServerEnabled;

    const {
      setSubscriptions,
      setNotificationChannels,
      isFirstSubscriptionsLoad,
    } = peopleStore.targetUserStore!;

    const { fetchConsents, fetchScopes } = oauthStore;

    const { tfaSettings, setBackupCodes, getTfaType } = tfaStore;

    const { setProviders } = peopleStore.usersStore;
    const { getCapabilities } = authStore;

    const { getSessions } = setup;

    const { resetSelections } = filesStore;

    const { checkTg } = telegramStore;

    return {
      currentDeviceType: settingsStore.currentDeviceType,
      showProfileLoader,
      identityServerEnabled,
      getFilesSettings: filesSettingsStore.getFilesSettings,
      setSubscriptions,
      isFirstSubscriptionsLoad,
      fetchConsents,
      fetchScopes,
      tfaSettings,
      setBackupCodes,
      setProviders,
      getCapabilities,
      getSessions,

      getTfaType,
      setIsProfileLoaded,
      setIsSectionHeaderLoading,
      setIsSectionBodyLoading,
      setIsArticleLoading,
      resetSelections,
      setNotificationChannels,
      checkTg,
    };
  },
)(
  observer(
    withTranslation([
      "Profile",
      "Common",
      "PeopleTranslations",
      "ResetApplicationDialog",
      "BackupCodesDialog",
      "DeleteSelfProfileDialog",
      "Notifications",
      "ConnectDialog",
      "OAuth",
    ])(SectionBodyContent),
  ),
);
