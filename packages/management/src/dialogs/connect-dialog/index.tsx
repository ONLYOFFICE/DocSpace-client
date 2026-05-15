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

"use client";

import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { useCallback, useState } from "react";
import {
  getThirdPartyList,
  saveThirdParty as saveThirdPartyApi,
} from "@docspace/shared/api/files";

import { FOLDER_FORM_VALIDATION } from "@docspace/shared/constants";
import { openConnectWindowUtils } from "@docspace/shared/utils/openConnectWindow";
import { ConnectDialog as ConnectDialogComponent } from "@docspace/shared/dialogs/connect";
import type {
  ThirdPartyAccountType,
  TTranslation,
} from "@docspace/shared/types";

import { useStores } from "@/hooks/useStores";
import useAppState from "@/hooks/useAppState";

export const ConnectDialog = observer(() => {
  const { isAdmin } = useAppState();

  const { backupStore, spacesStore } = useStores();

  const [saveAfterReconnectOAuth, setSaveAfterReconnectOAuth] = useState(false);
  const [isConnectDialogReconnect, setIsConnectDialogReconnect] =
    useState(false);

  const { t } = useTranslation(["Common"]);

  const openConnectWindow = useCallback(
    (serviceName: string, modal: Window | null) => {
      return openConnectWindowUtils(serviceName, modal, t);
    },
    [t],
  );

  const fetchThirdPartyProviders = async () => {
    try {
      const list = await getThirdPartyList();
      backupStore.setThirdPartyProviders(list);
    } catch (error) {
      console.error(error);
    }
  };

  const saveThirdParty = (
    url: string,
    login: string,
    password: string,
    token: string,
    isCorporate: boolean,
    customerTitle: string,
    providerKey: string,
    providerId: string,
    isRoomsStorage: boolean,
  ) => {
    return saveThirdPartyApi(
      url,
      login,
      password,
      token,
      isCorporate,
      customerTitle,
      providerKey,
      providerId,
      isRoomsStorage,
    );
  };

  const setThirdPartyAccountsInfo = useCallback(
    (trans: TTranslation) =>
      backupStore.setThirdPartyAccountsInfo(trans, isAdmin),
    [backupStore, isAdmin],
  );

  const backupConnectionItem = backupStore.selectedThirdPartyAccount;
  const isConnectionViaBackupModule = !!backupConnectionItem;

  return (
    <ConnectDialogComponent
      visible
      roomCreation={false}
      selectedFolderId={null}
      selectedFolderFolders={null}
      //
      setConnectDialogVisible={spacesStore.setConnectDialogVisible}
      item={backupConnectionItem as ThirdPartyAccountType}
      providers={backupStore.providers}
      connectingStorages={backupStore.connectingStorages}
      folderFormValidation={FOLDER_FORM_VALIDATION}
      saveAfterReconnectOAuth={saveAfterReconnectOAuth}
      isConnectDialogReconnect={isConnectDialogReconnect}
      isConnectionViaBackupModule={isConnectionViaBackupModule}
      saveThirdParty={saveThirdParty}
      openConnectWindow={openConnectWindow}
      fetchThirdPartyProviders={fetchThirdPartyProviders}
      setThirdPartyAccountsInfo={setThirdPartyAccountsInfo}
      setSaveAfterReconnectOAuth={setSaveAfterReconnectOAuth}
      setIsConnectDialogReconnect={setIsConnectDialogReconnect}
    />
  );
});
