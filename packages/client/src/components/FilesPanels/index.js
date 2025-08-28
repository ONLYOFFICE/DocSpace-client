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

import React, { useMemo, useState, useCallback, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import {
  Events,
  FilesSelectorFilterTypes,
  FilterType,
} from "@docspace/shared/enums";

import { StopFillingDialog } from "@docspace/shared/dialogs/stop-filling";
import { Guidance } from "@docspace/shared/components/guidance";
import { getFormFillingTipsStorageName } from "@docspace/shared/utils";

import {
  UploadPanel,
  VersionHistoryPanel,
  HotkeysPanel,
  InvitePanel,
  EditLinkPanel,
  EmbeddingPanel,
  ConversionPanel,
  ShareFormPanel,
} from "../panels";
import {
  ConnectDialog,
  DeleteThirdPartyDialog,
  EmptyTrashDialog,
  DeleteDialog,
  DownloadDialog,
  ConflictResolveDialog,
  ConvertDialog,
  InviteQuotaWarningDialog,
  CreateRoomConfirmDialog,
  SubmitToFormGallery,
  EditGroupMembersDialog,
  ChangeQuotaDialog,
  DeleteLinkDialog,
  MoveToPublicRoom,
  SettingsPluginDialog,
  PluginDialog,
  DeletePluginDialog,
  ShareFolderDialog,
  RoomLogoCoverDialog,
  FormFillingTipsDialog,
  DeleteVersionDialog,
  CancelOperationDialog,
  ReducedRightsDialog,
  SocialAuthWelcomeDialog,
} from "../dialogs";
import ConvertPasswordDialog from "../dialogs/ConvertPasswordDialog";
import ArchiveDialog from "../dialogs/ArchiveDialog";
import RestoreRoomDialog from "../dialogs/RestoreRoomDialog";
import PreparationPortalDialog from "../dialogs/PreparationPortalDialog";
import CreateRoomTemplateDialog from "../dialogs/CreateRoomTemplate/CreateRoomTemplate";
import FilesSelector from "../FilesSelector";

import LeaveRoomDialog from "../dialogs/LeaveRoomDialog";
import ChangeRoomOwnerPanel from "../panels/ChangeRoomOwnerPanel";
import ReorderIndexDialog from "../dialogs/ReorderIndexDialog";
import LifetimeDialog from "../dialogs/LifetimeDialog";
import { SharePDFFormDialog } from "../dialogs/SharePDFFormDialog";
import { FillPDFDialog } from "../dialogs/FillPDFDialog";
import { PasswordEntryDialog } from "../dialogs/PasswordEntryDialog";
import CloseEditIndexDialog from "../dialogs/CloseEditIndexDialog";
import FillingStatusPanel from "../panels/FillingStatusPanel";
import TemplateAccessSettingsPanel from "../panels/TemplateAccessSettingsPanel";
import RemoveUserConfirmationDialog from "../dialogs/RemoveUserConfirmationDialog";
import AssignRoles from "../dialogs/AssignRoles";

const Panels = (props) => {
  const {
    uploadPanelVisible,
    copyPanelVisible,
    moveToPanelVisible,
    restorePanelVisible,
    connectDialogVisible,
    deleteThirdPartyDialogVisible,
    versionHistoryPanelVisible,
    deleteDialogVisible,
    lifetimeDialogVisible,
    downloadDialogVisible,
    emptyTrashDialogVisible,
    conflictResolveDialogVisible,
    convertDialogVisible,
    createMasterForm,
    selectFileDialogVisible,
    setSelectFileDialogVisible,
    selectFileFormRoomDialogVisible,
    selectFileFormRoomFilterParam,
    setSelectFileFormRoomDialogVisible,
    selectFileAiKnowledgeDialogVisible,
    setSelectFileAiKnowledgeDialogVisible,
    copyFromTemplateForm,
    copyFileToAiKnowledge,
    hotkeyPanelVisible,
    invitePanelVisible,
    convertPasswordDialogVisible,
    createRoomConfirmDialogVisible,
    confirmDialogIsLoading,
    restoreAllPanelVisible,
    archiveDialogVisible,
    inviteQuotaWarningDialogVisible,
    preparationPortalDialogVisible,
    restoreRoomDialogVisible,
    submitToGalleryDialogVisible,
    editGroupMembersDialogVisible,
    changeQuotaDialogVisible,
    editLinkPanelIsVisible,
    deleteLinkDialogVisible,
    embeddingPanelData,
    moveToPublicRoomVisible,
    settingsPluginDialogVisible,
    pluginDialogVisible,
    leaveRoomDialogVisible,
    changeRoomOwnerIsVisible,
    deletePluginDialogVisible,
    shareFolderDialogVisible,
    selectFileFormRoomOpenRoot,
    reorderDialogVisible,
    fillPDFDialogData,
    createRoomTemplateDialogVisible,
    templateAccessSettingsVisible,

    setQuotaWarningDialogVisible,
    resetQuotaItem,
    isShowWarningDialog,
    roomLogoCoverDialogVisible,
    welcomeFormFillingTipsVisible,
    passwordEntryDialogDate,
    closeEditIndexDialogVisible,
    conversionVisible,
    deleteVersionDialogVisible,

    setStopFillingDialogVisible,
    stopFillingDialogData,
    operationCancelVisible,
    setFormFillingTipsDialog,
    formFillingTipsVisible,
    viewAs,
    userId,
    getRefElement,
    config,
    isShareFormData,
    reducedRightsVisible,
    removeUserConfirmation,
    assignRolesDialogVisible,
    socialAuthWelcomeDialogVisible,
    extsFilesVectorized,
  } = props;

  const [sharePDFForm, setSharePDFForm] = useState({
    visible: false,
    data: null,
    onClose: null,
  });

  const onCloseStopFillingDialog = () => {
    setStopFillingDialogVisible(false);
  };

  const { t } = useTranslation(["Translations", "Common", "PDFFormDialog"]);

  const onClose = () => {
    setSelectFileDialogVisible(false);
  };

  const onCloseFileFormRoomDialog = () => {
    setSelectFileFormRoomDialogVisible(false);
  };

  const onCloseFileFormAiKnowledgeDialog = () => {
    setSelectFileAiKnowledgeDialogVisible(false);
  };

  const descriptionTextFileFormRoomDialog = useMemo(() => {
    const text = {
      [FilesSelectorFilterTypes.DOCX]: t("Common:SelectDOCXFormat"),
      // [FilesSelectorFilterTypes.DOCXF]: t("Common:SelectDOCXFFormat"),
      [FilesSelectorFilterTypes.PDF]: t("Common:SelectPDFFormat"),
      [FilterType.PDFForm]: t("Common:SelectPDFFormat"),
    };

    return text[selectFileFormRoomFilterParam];
  }, [selectFileFormRoomFilterParam, t]);

  const handleSharePDFForm = useCallback(
    /**
     * @param {CustomEvent} event
     */
    (event) => {
      const { file } = event.detail;

      setSharePDFForm({
        visible: true,
        file,
        onClose: () => {
          setSharePDFForm({ visible: false, onClose: null, file: null });
        },
      });
    },
    [],
  );

  useEffect(() => {
    window.addEventListener(Events.Share_PDF_Form, handleSharePDFForm);

    return () => {
      window.removeEventListener(Events.Share_PDF_Form, handleSharePDFForm);
    };
  }, [handleSharePDFForm]);

  useEffect(() => {
    if (isShowWarningDialog) {
      setQuotaWarningDialogVisible(true);

      resetQuotaItem();
    }
    return () => {
      resetQuotaItem();
    };
  }, [isShowWarningDialog]);

  const onCloseGuidance = () => {
    setFormFillingTipsDialog(false);
    window.localStorage.setItem(getFormFillingTipsStorageName(userId), "true");
  };

  return [
    settingsPluginDialogVisible && (
      <SettingsPluginDialog
        isVisible={settingsPluginDialogVisible}
        key="settings-plugin-dialog"
      />
    ),
    deletePluginDialogVisible && (
      <DeletePluginDialog
        isVisible={deletePluginDialogVisible}
        key="delete-plugin-dialog"
      />
    ),
    pluginDialogVisible && (
      <PluginDialog isVisible={pluginDialogVisible} key="plugin-dialog" />
    ),
    uploadPanelVisible && <UploadPanel key="upload-panel" />,
    conversionVisible && <ConversionPanel key="conversion-panel" />,
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
    lifetimeDialogVisible && <LifetimeDialog key="delete-dialog" />,
    emptyTrashDialogVisible && <EmptyTrashDialog key="empty-trash-dialog" />,
    downloadDialogVisible && <DownloadDialog key="download-dialog" />,

    conflictResolveDialogVisible && (
      <ConflictResolveDialog key="conflict-resolve-dialog" />
    ),
    convertDialogVisible && <ConvertDialog key="convert-dialog" />,

    // createRoomDialogVisible && <CreateRoomDialog key="create-room-dialog" />,
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
        openRoot={selectFileFormRoomOpenRoot}
        onSelectFile={(file) => copyFromTemplateForm(file, t)}
        filterParam={selectFileFormRoomFilterParam}
        descriptionText={descriptionTextFileFormRoomDialog}
      />
    ),

    selectFileAiKnowledgeDialogVisible && (
      <FilesSelector
        isFormRoom
        isPanelVisible
        key="select-file-ai-knowledge-dialog"
        onClose={onCloseFileFormAiKnowledgeDialog}
        openRoot
        onSelectFile={(files) => copyFileToAiKnowledge(files, t)}
        filterParam={extsFilesVectorized.join(",")}
        descriptionText=""
        isMultiSelect
      />
    ),

    hotkeyPanelVisible && <HotkeysPanel key="hotkey-panel" />,
    invitePanelVisible && <InvitePanel key="invite-panel" />,
    convertPasswordDialogVisible && (
      <ConvertPasswordDialog key="convert-password-dialog" />
    ),
    archiveDialogVisible && <ArchiveDialog key="archive-dialog" />,
    restoreRoomDialogVisible && <RestoreRoomDialog key="archive-dialog" />,
    inviteQuotaWarningDialogVisible && (
      <InviteQuotaWarningDialog key="invite-users-warning-dialog" />
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

    deleteLinkDialogVisible && <DeleteLinkDialog key="delete-link-dialog" />,
    embeddingPanelData.visible && <EmbeddingPanel key="embedding-panel" />,
    moveToPublicRoomVisible && (
      <MoveToPublicRoom key="move-to-public-room-panel" />
    ),

    leaveRoomDialogVisible && <LeaveRoomDialog key="leave-room-dialog" />,
    changeRoomOwnerIsVisible && (
      <ChangeRoomOwnerPanel key="change-room-owner" />
    ),
    shareFolderDialogVisible && <ShareFolderDialog key="share-folder-dialog" />,
    reorderDialogVisible && <ReorderIndexDialog key="reorder-index-dialog" />,
    createRoomTemplateDialogVisible && (
      <CreateRoomTemplateDialog key="create-room-template-dialog" />
    ),
    templateAccessSettingsVisible && (
      <TemplateAccessSettingsPanel key="template-access-settings" />
    ),
    sharePDFForm.visible && (
      <SharePDFFormDialog key="share-pdf-form-dialog" {...sharePDFForm} />
    ),
    fillPDFDialogData.visible && (
      <FillPDFDialog key="fill-pdf-form-dialog" {...fillPDFDialogData} />
    ),
    roomLogoCoverDialogVisible && (
      <RoomLogoCoverDialog key="room-logo-cover-dialog" />
    ),
    passwordEntryDialogDate.visible && (
      <PasswordEntryDialog
        key="password-entry-dialog"
        item={passwordEntryDialogDate.item}
        isDownload={passwordEntryDialogDate.isDownload}
      />
    ),
    closeEditIndexDialogVisible && (
      <CloseEditIndexDialog key="close-edit-index-dialog-dialog" />
    ),
    <FillingStatusPanel key="filling-status-panel" />,
    deleteVersionDialogVisible && (
      <DeleteVersionDialog key="delete-version-dialog" />
    ),

    stopFillingDialogData.visible && (
      <StopFillingDialog
        key="stop-filling-dialog"
        visible={stopFillingDialogData.visible}
        formId={stopFillingDialogData.formId}
        onClose={onCloseStopFillingDialog}
      />
    ),
    operationCancelVisible && (
      <CancelOperationDialog key="cancel-operation-dialog" />
    ),
    welcomeFormFillingTipsVisible ? (
      <FormFillingTipsDialog key="form-filling_tips_dialog" />
    ) : null,

    formFillingTipsVisible ? (
      <Guidance
        viewAs={viewAs}
        onClose={onCloseGuidance}
        getRefElement={getRefElement}
        config={config}
      />
    ) : null,

    isShareFormData.visible && (
      <ShareFormPanel key="share-form-dialog" {...isShareFormData} />
    ),
    reducedRightsVisible ? (
      <ReducedRightsDialog key="reduced-rights-dialog" />
    ) : null,

    removeUserConfirmation && (
      <RemoveUserConfirmationDialog key="remove-user-confirmation-dialog" />
    ),
    assignRolesDialogVisible && <AssignRoles key="assign-roles-dialog" />,
    socialAuthWelcomeDialogVisible && (
      <SocialAuthWelcomeDialog key="joining-space-dialog" />
    ),
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
    currentQuotaStore,
    filesActionsStore,
    filesStore,
    userStore,
    guidanceStore,
    filesSettingsStore,
  }) => {
    const {
      copyPanelVisible,
      moveToPanelVisible,
      restorePanelVisible,
      connectDialogVisible,
      deleteThirdPartyDialogVisible,
      deleteDialogVisible,
      lifetimeDialogVisible,
      downloadDialogVisible,
      emptyTrashDialogVisible,
      conflictResolveDialogVisible,
      convertDialogVisible,
      createRoomDialogVisible,
      createRoomConfirmDialogVisible,
      convertPasswordDialogVisible,
      connectItem, // TODO:
      restoreAllPanelVisible,
      archiveDialogVisible,
      restoreRoomDialogVisible,
      welcomeFormFillingTipsVisible,

      createMasterForm,
      selectFileDialogVisible,
      setSelectFileDialogVisible,
      selectFileFormRoomDialogVisible,
      selectFileFormRoomFilterParam,
      setSelectFileFormRoomDialogVisible,
      selectFileAiKnowledgeDialogVisible,
      setSelectFileAiKnowledgeDialogVisible,
      invitePanelOptions,
      inviteQuotaWarningDialogVisible,
      changeQuotaDialogVisible,
      submitToGalleryDialogVisible,
      editGroupMembersDialogVisible,
      editLinkPanelIsVisible,
      deleteLinkDialogVisible,
      embeddingPanelData,
      moveToPublicRoomVisible,
      leaveRoomDialogVisible,
      changeRoomOwnerIsVisible,
      shareFolderDialogVisible,
      selectFileFormRoomOpenRoot,
      reorderDialogVisible,
      fillPDFDialogData,
      roomLogoCoverDialogVisible,
      createRoomTemplateDialogVisible,
      templateAccessSettingsVisible,

      setQuotaWarningDialogVisible,
      setIsNewRoomByCurrentUser,
      setIsNewUserByCurrentUser,
      isNewUserByCurrentUser,
      isNewRoomByCurrentUser,
      passwordEntryDialogDate,
      closeEditIndexDialogVisible,

      setStopFillingDialogVisible,
      stopFillingDialogData,
      operationCancelVisible,

      setFormFillingTipsDialog,
      formFillingTipsVisible,
      isShareFormData,
      reducedRightsData,
      removeUserConfirmation,
      assignRolesDialogData,
      socialAuthWelcomeDialogVisible,
    } = dialogsStore;

    const { viewAs } = filesStore;

    const { extsFilesVectorized } = filesSettingsStore;

    const { preparationPortalDialogVisible } = backup;
    const { copyFromTemplateForm, copyFileToAiKnowledge } = filesActionsStore;

    const { uploadPanelVisible, conversionVisible } = uploadDataStore;
    const {
      isVisible: versionHistoryPanelVisible,
      deleteVersionDialogVisible,
    } = versionHistoryStore;
    const { hotkeyPanelVisible } = settingsStore;
    const { confirmDialogIsLoading } = createEditRoomStore;
    const { isRoomsTariffAlmostLimit, isUserTariffAlmostLimit } =
      currentQuotaStore;

    const {
      settingsPluginDialogVisible,
      deletePluginDialogVisible,
      pluginDialogVisible,
    } = pluginStore;

    const { getRefElement, config } = guidanceStore;

    const isAccounts = window.location.href.indexOf("accounts/people") !== -1;
    const resetQuotaItem = () => {
      if (isNewUserByCurrentUser) setIsNewUserByCurrentUser(false);
      if (isNewRoomByCurrentUser) setIsNewRoomByCurrentUser(false);
    };

    const closeItems = JSON.parse(localStorage.getItem("warning-dialog")) || [];

    const isShowWarningDialog = isAccounts
      ? isUserTariffAlmostLimit &&
        !closeItems.includes("user-quota") &&
        isNewUserByCurrentUser
      : isRoomsTariffAlmostLimit &&
        !closeItems.includes("room-quota") &&
        isNewRoomByCurrentUser;

    return {
      preparationPortalDialogVisible,
      uploadPanelVisible,
      copyPanelVisible,
      moveToPanelVisible,
      restorePanelVisible,
      connectDialogVisible: connectDialogVisible || !!connectItem, // TODO:
      deleteThirdPartyDialogVisible,
      versionHistoryPanelVisible,
      deleteDialogVisible,
      lifetimeDialogVisible,
      downloadDialogVisible,
      emptyTrashDialogVisible,
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
      selectFileAiKnowledgeDialogVisible,
      setSelectFileAiKnowledgeDialogVisible,
      copyFromTemplateForm,
      copyFileToAiKnowledge,
      hotkeyPanelVisible,
      restoreAllPanelVisible,
      invitePanelVisible: invitePanelOptions.visible,
      archiveDialogVisible,
      inviteQuotaWarningDialogVisible,
      confirmDialogIsLoading,
      restoreRoomDialogVisible,
      submitToGalleryDialogVisible,
      editGroupMembersDialogVisible,
      changeQuotaDialogVisible,
      editLinkPanelIsVisible,
      deleteLinkDialogVisible,
      embeddingPanelData,
      moveToPublicRoomVisible,
      settingsPluginDialogVisible,
      pluginDialogVisible,
      leaveRoomDialogVisible,
      changeRoomOwnerIsVisible,
      deletePluginDialogVisible,
      shareFolderDialogVisible,
      selectFileFormRoomOpenRoot,
      reorderDialogVisible,
      fillPDFDialogData,
      roomLogoCoverDialogVisible,
      createRoomTemplateDialogVisible,
      templateAccessSettingsVisible,

      setQuotaWarningDialogVisible,
      welcomeFormFillingTipsVisible,
      resetQuotaItem,
      isShowWarningDialog,
      passwordEntryDialogDate,
      closeEditIndexDialogVisible,
      conversionVisible,
      deleteVersionDialogVisible,

      setStopFillingDialogVisible,
      stopFillingDialogData,
      operationCancelVisible,
      setFormFillingTipsDialog,
      formFillingTipsVisible,
      viewAs,
      userId: userStore?.user?.id,
      getRefElement,
      config,
      isShareFormData,
      reducedRightsVisible: reducedRightsData.visible,
      removeUserConfirmation: removeUserConfirmation.visible,
      assignRolesDialogVisible: assignRolesDialogData.visible,
      socialAuthWelcomeDialogVisible,
      extsFilesVectorized,
    };
  },
)(observer(Panels));
