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

import {
  DeleteThirdPartyDialog,
  type DeleteThirdPartyDialogProps,
} from "@docspace/shared/dialogs/delete-third-party";
import type {
  ExternalDeleteThirdPartyDialogWrapperProps,
  InjectedDeleteThirdPartyDialogWrapperProps,
} from "./DeleteThirdPartyDialogWrapper.types";

const DeleteThirdPartyDialogWrapper = ({
  visible,
  providers,
  removeItem,
  currentFolderId,
  isConnectionViaBackupModule,
  updateInfo,
  deleteThirdParty,
  setThirdPartyProviders,
  setConnectedThirdPartyAccount,
  setDeleteThirdPartyDialogVisible,
}: DeleteThirdPartyDialogProps) => {
  return (
    <DeleteThirdPartyDialog
      visible={visible}
      providers={providers}
      removeItem={removeItem}
      currentFolderId={currentFolderId}
      isConnectionViaBackupModule={isConnectionViaBackupModule}
      updateInfo={updateInfo}
      deleteThirdParty={deleteThirdParty}
      setThirdPartyProviders={setThirdPartyProviders}
      setConnectedThirdPartyAccount={setConnectedThirdPartyAccount}
      setDeleteThirdPartyDialogVisible={setDeleteThirdPartyDialogVisible}
    />
  );
};

export default inject<
  TStore,
  ExternalDeleteThirdPartyDialogWrapperProps,
  InjectedDeleteThirdPartyDialogWrapperProps
>(({ filesSettingsStore, dialogsStore, selectedFolderStore, backup }) => {
  const { providers, setThirdPartyProviders, deleteThirdParty } =
    filesSettingsStore.thirdPartyStore;
  const {
    selectedThirdPartyAccount: backupConnectionItem,
    setConnectedThirdPartyAccount,
  } = backup;
  const {
    deleteThirdPartyDialogVisible: visible,
    setDeleteThirdPartyDialogVisible,
    removeItem: storeItem,
  } = dialogsStore;

  const removeItem = (backupConnectionItem ??
    storeItem) as unknown as DeleteThirdPartyDialogProps["removeItem"];

  const { id } = selectedFolderStore;

  return {
    currentFolderId: id,

    providers,
    visible,
    removeItem,

    setThirdPartyProviders,
    deleteThirdParty,
    setDeleteThirdPartyDialogVisible,
    setConnectedThirdPartyAccount,
  };
})(
  observer(
    DeleteThirdPartyDialogWrapper as React.FC<ExternalDeleteThirdPartyDialogWrapperProps>,
  ),
);
