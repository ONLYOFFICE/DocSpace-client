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

import React, { useMemo } from "react";

import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import {
  UploadPanel,
  VersionHistoryPanel,
  ChangeOwnerPanel,
  NewFilesPanel,
  HotkeyPanel,
  InvitePanel,
  EditLinkPanel,
  EmbeddingPanel,
} from "../panels";
import {
  ConnectDialog,
  DeleteThirdPartyDialog,
  EmptyTrashDialog,
  DeleteDialog,
  DownloadDialog,
  ConflictResolveDialog,
  ConvertDialog,
  CreateRoomDialog,
  InviteUsersWarningDialog,
  CreateRoomConfirmDialog,
  ChangeUserTypeDialog,
  SubmitToFormGallery,
  EditGroupMembersDialog,
  ChangeQuotaDialog,
  UnsavedChangesDialog,
  DeleteLinkDialog,
  MoveToPublicRoom,
  BackupToPublicRoom,
  SettingsPluginDialog,
  PluginDialog,
  DeletePluginDialog,
  ShareFolderDialog,
} from "../dialogs";
import ConvertPasswordDialog from "../dialogs/ConvertPasswordDialog";
import ArchiveDialog from "../dialogs/ArchiveDialog";
import RestoreRoomDialog from "../dialogs/RestoreRoomDialog";
import PreparationPortalDialog from "../dialogs/PreparationPortalDialog";
import FilesSelector from "../FilesSelector";
import { FilesSelectorFilterTypes } from "@docspace/shared/enums";
import LeaveRoomDialog from "../dialogs/LeaveRoomDialog";
import ChangeRoomOwnerPanel from "../panels/ChangeRoomOwnerPanel";

const Panels = (props) => {
  const {
    uploadPanelVisible,
    ownerPanelVisible,
    copyPanelVisible,
    moveToPanelVisible,
    restorePanelVisible,
    thirdPartyMoveDialogVisible,
    connectDialogVisible,
    deleteThirdPartyDialogVisible,
    versionHistoryPanelVisible,
    deleteDialogVisible,
    downloadDialogVisible,
    emptyTrashDialogVisible,
    newFilesPanelVisible,
    conflictResolveDialogVisible,
    convertDialogVisible,
    createMasterForm,
    selectFileDialogVisible,
    setSelectFileDialogVisible,
    selectFileFormRoomDialogVisible,
    selectFileFormRoomFilterParam,
    setSelectFileFormRoomDialogVisible,
    createFromTemplateForm,
    hotkeyPanelVisible,
    invitePanelVisible,
    convertPasswordDialogVisible,
    createRoomDialogVisible,
    createRoomConfirmDialogVisible,
    confirmDialogIsLoading,
    restoreAllPanelVisible,
    archiveDialogVisible,
    inviteUsersWarningDialogVisible,
    preparationPortalDialogVisible,
    changeUserTypeDialogVisible,
    restoreRoomDialogVisible,
    submitToGalleryDialogVisible,
    editGroupMembersDialogVisible,
    changeQuotaDialogVisible,
    editLinkPanelIsVisible,
    unsavedChangesDialogVisible,
    deleteLinkDialogVisible,
    embeddingPanelIsVisible,
    moveToPublicRoomVisible,
    backupToPublicRoomVisible,
    settingsPluginDialogVisible,
    pluginDialogVisible,
    leaveRoomDialogVisible,
    changeRoomOwnerIsVisible,
    deletePluginDialogVisible,
    shareFolderDialogVisible,
  } = props;

  const { t } = useTranslation(["Translations", "Common"]);

  const onClose = () => {
    setSelectFileDialogVisible(false);
  };

  const onCloseFileFormRoomDialog = () => {
    setSelectFileFormRoomDialogVisible(false);
  };

  const descriptionTextFileFormRoomDialog = useMemo(() => {
    const text = {
      [FilesSelectorFilterTypes.DOCX]: t("Common:SelectDOCXFormat"),
      [FilesSelectorFilterTypes.DOCXF]: t("Common:SelectDOCXFFormat"),
      [FilesSelectorFilterTypes.PDF]: t("Common:SelectPDFFormat"),
    };

    return text[selectFileFormRoomFilterParam];
  }, [selectFileFormRoomFilterParam, t]);

  return [
    settingsPluginDialogVisible && (
      <SettingsPluginDialog
        isVisible={settingsPluginDialogVisible}
        key={"settings-plugin-dialog"}
      />
    ),
    deletePluginDialogVisible && (
      <DeletePluginDialog
        isVisible={deletePluginDialogVisible}
        key={"delete-plugin-dialog"}
      />
    ),
    pluginDialogVisible && (
      <PluginDialog isVisible={pluginDialogVisible} key={"plugin-dialog"} />
    ),
    uploadPanelVisible && <UploadPanel key="upload-panel" />,
    ownerPanelVisible && <ChangeOwnerPanel key="change-owner-panel" />,
    (moveToPanelVisible ||
      copyPanelVisible ||
      restorePanelVisible ||
      restoreAllPanelVisible) && (
      <FilesSelector
        key="files-selector"
        isMove={moveToPanelVisible}
        isCopy={copyPanelVisible}
        isRestore={restorePanelVisible}
        isRestoreAll={restoreAllPanelVisible}
      />
    ),
    connectDialogVisible && <ConnectDialog key="connect-dialog" />,
    deleteThirdPartyDialogVisible && (
      <DeleteThirdPartyDialog key="thirdparty-delete-dialog" />
    ),
    versionHistoryPanelVisible && (
      <VersionHistoryPanel key="version-history-panel" />
    ),
    deleteDialogVisible && <DeleteDialog key="delete-dialog" />,
    emptyTrashDialogVisible && <EmptyTrashDialog key="empty-trash-dialog" />,
    downloadDialogVisible && <DownloadDialog key="download-dialog" />,

    newFilesPanelVisible && <NewFilesPanel key="new-files-panel" />,
    conflictResolveDialogVisible && (
      <ConflictResolveDialog key="conflict-resolve-dialog" />
    ),
    convertDialogVisible && <ConvertDialog key="convert-dialog" />,
    changeUserTypeDialogVisible && (
      <ChangeUserTypeDialog key="change-user-type-dialog" />
    ),
    createRoomDialogVisible && <CreateRoomDialog key="create-room-dialog" />,
    (createRoomConfirmDialogVisible || confirmDialogIsLoading) && (
      <CreateRoomConfirmDialog key="create-room-confirm-dialog" />
    ),
    selectFileDialogVisible && (
      <FilesSelector
        key="select-file-dialog"
        filterParam={FilesSelectorFilterTypes.DOCX}
        isPanelVisible={selectFileDialogVisible}
        onSelectFile={createMasterForm}
        onClose={onClose}
      />
    ),

    selectFileFormRoomDialogVisible && (
      <FilesSelector
        isFormRoom
        isPanelVisible
        key="select-file-form-room-dialog"
        onClose={onCloseFileFormRoomDialog}
        onSelectFile={createFromTemplateForm}
        filterParam={selectFileFormRoomFilterParam}
        descriptionText={descriptionTextFileFormRoomDialog}
      />
    ),

    hotkeyPanelVisible && <HotkeyPanel key="hotkey-panel" />,
    invitePanelVisible && <InvitePanel key="invite-panel" />,
    convertPasswordDialogVisible && (
      <ConvertPasswordDialog key="convert-password-dialog" />
    ),
    archiveDialogVisible && <ArchiveDialog key="archive-dialog" />,
    restoreRoomDialogVisible && <RestoreRoomDialog key="archive-dialog" />,
    inviteUsersWarningDialogVisible && (
      <InviteUsersWarningDialog key="invite-users-warning-dialog" />
    ),
    preparationPortalDialogVisible && (
      <PreparationPortalDialog key="preparation-portal-dialog" />
    ),
    submitToGalleryDialogVisible && (
      <SubmitToFormGallery key="submit-to-form-gallery-dialog" />
    ),
    editGroupMembersDialogVisible && (
      <EditGroupMembersDialog key="edit-group-members-dialog" />
    ),
    changeQuotaDialogVisible && <ChangeQuotaDialog key="change-quota-dialog" />,
    editLinkPanelIsVisible && <EditLinkPanel key="edit-link-panel" />,
    unsavedChangesDialogVisible && (
      <UnsavedChangesDialog key="unsaved-dialog" />
    ),
    deleteLinkDialogVisible && <DeleteLinkDialog key="delete-link-dialog" />,
    embeddingPanelIsVisible && <EmbeddingPanel key="embedding-panel" />,
    moveToPublicRoomVisible && (
      <MoveToPublicRoom key="move-to-public-room-panel" />
    ),
    backupToPublicRoomVisible && (
      <BackupToPublicRoom key="backup-to-public-room-panel" />
    ),
    leaveRoomDialogVisible && <LeaveRoomDialog key="leave-room-dialog" />,
    changeRoomOwnerIsVisible && (
      <ChangeRoomOwnerPanel key="change-room-owner" />
    ),
    shareFolderDialogVisible && <ShareFolderDialog key="share-folder-dialog" />,
  ];
};

export default inject(
  ({
    settingsStore,
    dialogsStore,
    uploadDataStore,
    versionHistoryStore,
    backup,
    createEditRoomStore,
    pluginStore,
  }) => {
    const {
      ownerPanelVisible,
      copyPanelVisible,
      moveToPanelVisible,
      restorePanelVisible,
      thirdPartyMoveDialogVisible,
      connectDialogVisible,
      deleteThirdPartyDialogVisible,
      deleteDialogVisible,
      downloadDialogVisible,
      emptyTrashDialogVisible,
      newFilesPanelVisible,
      conflictResolveDialogVisible,
      convertDialogVisible,
      createRoomDialogVisible,
      createRoomConfirmDialogVisible,
      convertPasswordDialogVisible,
      connectItem, //TODO:
      restoreAllPanelVisible,
      archiveDialogVisible,
      restoreRoomDialogVisible,

      unsavedChangesDialogVisible,
      createMasterForm,
      selectFileDialogVisible,
      setSelectFileDialogVisible,
      selectFileFormRoomDialogVisible,
      selectFileFormRoomFilterParam,
      setSelectFileFormRoomDialogVisible,
      createFromTemplateForm,
      invitePanelOptions,
      inviteUsersWarningDialogVisible,
      changeUserTypeDialogVisible,
      changeQuotaDialogVisible,
      submitToGalleryDialogVisible,
      editGroupMembersDialogVisible,
      editLinkPanelIsVisible,
      deleteLinkDialogVisible,
      embeddingPanelIsVisible,
      moveToPublicRoomVisible,
      backupToPublicRoomVisible,
      leaveRoomDialogVisible,
      changeRoomOwnerIsVisible,
      shareFolderDialogVisible,
    } = dialogsStore;

    const { preparationPortalDialogVisible } = backup;

    const { uploadPanelVisible } = uploadDataStore;
    const { isVisible: versionHistoryPanelVisible } = versionHistoryStore;
    const { hotkeyPanelVisible } = settingsStore;
    const { confirmDialogIsLoading } = createEditRoomStore;

    const {
      settingsPluginDialogVisible,
      deletePluginDialogVisible,
      pluginDialogVisible,
    } = pluginStore;

    return {
      preparationPortalDialogVisible,
      uploadPanelVisible,
      ownerPanelVisible,
      copyPanelVisible,
      moveToPanelVisible,
      restorePanelVisible,
      thirdPartyMoveDialogVisible,
      connectDialogVisible: connectDialogVisible || !!connectItem, //TODO:
      deleteThirdPartyDialogVisible,
      versionHistoryPanelVisible,
      deleteDialogVisible,
      downloadDialogVisible,
      emptyTrashDialogVisible,
      newFilesPanelVisible,
      conflictResolveDialogVisible,
      convertDialogVisible,
      createRoomDialogVisible,
      createRoomConfirmDialogVisible,
      convertPasswordDialogVisible,
      selectFileDialogVisible,
      createMasterForm,
      setSelectFileDialogVisible,
      selectFileFormRoomDialogVisible,
      selectFileFormRoomFilterParam,
      setSelectFileFormRoomDialogVisible,
      createFromTemplateForm,
      hotkeyPanelVisible,
      restoreAllPanelVisible,
      invitePanelVisible: invitePanelOptions.visible,
      archiveDialogVisible,
      inviteUsersWarningDialogVisible,
      confirmDialogIsLoading,
      changeUserTypeDialogVisible,
      restoreRoomDialogVisible,
      submitToGalleryDialogVisible,
      editGroupMembersDialogVisible,
      changeQuotaDialogVisible,
      editLinkPanelIsVisible,
      unsavedChangesDialogVisible,
      deleteLinkDialogVisible,
      embeddingPanelIsVisible,
      moveToPublicRoomVisible,
      backupToPublicRoomVisible,
      settingsPluginDialogVisible,
      pluginDialogVisible,
      leaveRoomDialogVisible,
      changeRoomOwnerIsVisible,
      deletePluginDialogVisible,
      shareFolderDialogVisible,
    };
  },
)(observer(Panels));
