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
import { saveThirdParty as saveThirdPartyApi } from "@docspace/shared/api/files";
import { ConnectDialog } from "@docspace/shared/dialogs/connect";
import type { Nullable, ThirdPartyAccountType } from "@docspace/shared/types";

import type {
  ConnectDialogWrapperProps,
  ExternalConnectDialogWrapperProps,
  InjectedConnectDialogWrapperProps,
} from "./ConnectDialogWrapper.types";

const ConnectDialogWrapper = ({
  item,
  visible,
  providers,
  roomCreation,
  selectedFolderId,
  connectingStorages,
  folderFormValidation,
  selectedFolderFolders,
  saveAfterReconnectOAuth,
  isConnectDialogReconnect,
  isConnectionViaBackupModule,
  saveThirdParty,
  openConnectWindow,
  setConnectDialogVisible,
  setIsConnectDialogReconnect,
  setSaveAfterReconnectOAuth,
  setSaveThirdpartyResponse,
  fetchThirdPartyProviders,
  setThirdPartyAccountsInfo,
}: ConnectDialogWrapperProps) => {
  return (
    <ConnectDialog
      item={item}
      visible={visible}
      providers={providers}
      roomCreation={roomCreation}
      selectedFolderId={selectedFolderId}
      connectingStorages={connectingStorages}
      folderFormValidation={folderFormValidation}
      selectedFolderFolders={selectedFolderFolders}
      saveAfterReconnectOAuth={saveAfterReconnectOAuth}
      isConnectDialogReconnect={isConnectDialogReconnect}
      isConnectionViaBackupModule={isConnectionViaBackupModule}
      saveThirdParty={saveThirdParty}
      openConnectWindow={openConnectWindow}
      setConnectDialogVisible={setConnectDialogVisible}
      fetchThirdPartyProviders={fetchThirdPartyProviders}
      setSaveThirdpartyResponse={setSaveThirdpartyResponse}
      setThirdPartyAccountsInfo={setThirdPartyAccountsInfo}
      setSaveAfterReconnectOAuth={setSaveAfterReconnectOAuth}
      setIsConnectDialogReconnect={setIsConnectDialogReconnect}
    />
  );
};

export default inject<
  TStore,
  ExternalConnectDialogWrapperProps,
  InjectedConnectDialogWrapperProps
>(
  ({
    settingsStore,
    filesSettingsStore,
    selectedFolderStore,
    dialogsStore,
    backup,
  }) => {
    const {
      providers,
      openConnectWindow,
      fetchThirdPartyProviders,
      connectingStorages,
    } = filesSettingsStore.thirdPartyStore;
    const { folderFormValidation } = settingsStore;

    const { id, folders } = selectedFolderStore;
    const {
      selectedThirdPartyAccount: backupConnectionItem,
      setThirdPartyAccountsInfo,
    } = backup;

    const {
      connectDialogVisible: visible,
      setConnectDialogVisible,
      connectItem,
      roomCreation,
      setSaveThirdpartyResponse,
      isConnectDialogReconnect,
      setIsConnectDialogReconnect,
      saveAfterReconnectOAuth,
      setSaveAfterReconnectOAuth,
    } = dialogsStore;

    const item: Nullable<ThirdPartyAccountType> =
      backupConnectionItem ?? connectItem;

    const isConnectionViaBackupModule = !!backupConnectionItem;

    return {
      item,
      providers,
      visible,
      roomCreation,
      saveThirdParty: saveThirdPartyApi,
      openConnectWindow,
      connectingStorages,
      selectedFolderId: id,
      folderFormValidation,
      saveAfterReconnectOAuth,
      fetchThirdPartyProviders,
      isConnectDialogReconnect,
      isConnectionViaBackupModule,
      selectedFolderFolders: folders,
      setConnectDialogVisible,
      setSaveThirdpartyResponse,
      setSaveAfterReconnectOAuth,
      setIsConnectDialogReconnect,
      setThirdPartyAccountsInfo,
    };
  },
)(
  observer(ConnectDialogWrapper as React.FC<ExternalConnectDialogWrapperProps>),
);
