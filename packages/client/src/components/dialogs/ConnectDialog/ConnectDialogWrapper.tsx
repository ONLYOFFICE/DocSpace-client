// (c) Copyright Ascensio System SIA 2009-2024
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
