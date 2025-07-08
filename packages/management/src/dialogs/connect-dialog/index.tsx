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
