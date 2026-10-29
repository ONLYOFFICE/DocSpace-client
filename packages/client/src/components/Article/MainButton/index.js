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

import ActionsUploadReactSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";
import FormReactSvgUrl from "PUBLIC_DIR/images/access.form.react.svg?url";
import FormBlankReactSvgUrl from "PUBLIC_DIR/images/form.blank.react.svg?url";
import FormGalleryReactSvgUrl from "PUBLIC_DIR/images/form.gallery.react.svg?url";
import FormFileReactSvgUrl from "PUBLIC_DIR/images/form.file.react.svg?url";
import ActionsDocumentsReactSvgUrl from "PUBLIC_DIR/images/actions.documents.react.svg?url";
import SpreadsheetReactSvgUrl from "PUBLIC_DIR/images/spreadsheet.react.svg?url";
import ActionsPresentationReactSvgUrl from "PUBLIC_DIR/images/actions.presentation.react.svg?url";
import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";
import TemplateGalleryReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.template.react.svg?url";
// import PersonAdminReactSvgUrl from "PUBLIC_DIR/images/person.admin.react.svg?url";
// import PersonManagerReactSvgUrl from "PUBLIC_DIR/images/person.manager.react.svg?url";
// import PersonReactSvgUrl from "PUBLIC_DIR/images/person.react.svg?url";
// import PersonDefaultReactSvgUrl from "PUBLIC_DIR/images/person.default.react.svg?url";
// import GroupReactSvgUrl from "PUBLIC_DIR/images/group.react.svg?url";
// import PersonUserReactSvgUrl from "PUBLIC_DIR/images/person.user.react.svg?url";
// import InviteAgainReactSvgUrl from "PUBLIC_DIR/images/invite.again.react.svg?url";
import PluginMoreReactSvgUrl from "PUBLIC_DIR/images/plugin.more.react.svg?url";

import React, { useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useLocation } from "react-router";
import classNames from "classnames";

import { MainButton } from "@onlyoffice/apps-ui-kit/components/main-button";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { Button } from "@onlyoffice/apps-ui-kit/components/button";
import { isDesktop } from "@docspace/shared/utils";
import { ArticleButtonLoader } from "@docspace/shared/skeletons/article";
import { isMobile, isTablet } from "react-device-detect";
import getFilesFromEvent from "@docspace/shared/utils/get-files-from-event";
import {
  Events,
  DeviceType,
  RoomsType,
  FilesSelectorFilterTypes,
  FolderType,
  FilterType,
} from "@docspace/shared/enums";

import { getContactsView, createGroup } from "SRC_DIR/helpers/contacts";

import MobileView from "./MobileView";

import {
  getManagerSection,
  getVisibleCreateActions,
  sendCustomAction,
} from "@docspace/shared/utils/frameCustomActions";

import styles from "./main-button.module.scss";

const ArticleMainButtonContent = (props) => {
  const {
    t,
    isMobileArticle,

    isPrivacy,
    startUpload,
    setAction,
    setSelectFileDialogVisible,
    setMainButtonVisible,
    selectFileDialogVisible,
    selectFileFormRoomDialogVisible,
    setSelectFileFormRoomDialogVisible,
    showArticleLoader,
    isFavoritesFolder,
    isRecentFolder,
    isRecycleBinFolder,
    canCreateEncrypted,

    currentFolderId,
    currentRoomType,
    vectorizationEnabled,
    isRoomsFolder,
    isArchiveFolder,

    setOformFromFolderId,

    enablePlugins,
    mainButtonItemsList,

    currentColorScheme,

    isOwner,
    isAdmin,
    isRoomAdmin,

    mainButtonMobileVisible,
    versionHistoryPanelVisible,
    moveToPanelVisible,
    restorePanelVisible,
    copyPanelVisible,

    security,
    setQuotaWarningDialogVisible,
    currentDeviceType,

    isFrame,
    disableActionButton,

    parentRoomType,
    isFolder,
    createFoldersTree,
    isWarningRoomsDialog,
    getContactsModel,
    contactsCanCreate,
    contactsTab,
    setTemplateGalleryVisible,
    templateGalleryAvailable,

    allowInvitingMembers,

    frameCustomActions,
    rootFolderType,
  } = props;

  const frameCreateActions = React.useMemo(
    () =>
      getVisibleCreateActions(
        frameCustomActions,
        getManagerSection(rootFolderType),
      ).map((action) => ({
        id: `actions_sdk-action-${action.key}`,
        className: "main-button_drop-down",
        icon: action.icon,
        label: action.label,
        key: `sdk-action-${action.key}`,
        onClick: () =>
          sendCustomAction({
            action: action.key,
            type: "create",
            folderId: currentFolderId,
          }),
      })),
    [frameCustomActions, rootFolderType, currentFolderId],
  );

  const withFrameActions = (items) =>
    frameCreateActions.length > 0 && !isAccountsPage && !isSettingsPage
      ? [
          ...items,
          { key: "separator-custom-actions", isSeparator: true },
          ...frameCreateActions,
        ]
      : items;

  const location = useLocation();

  const isAccountsPage = location.pathname.includes("/accounts");
  const isSettingsPage = location.pathname.includes("settings");
  const contactsView = getContactsView(location);
  const isContactsGroupsPage = contactsView === "groups";

  const inputFilesElement = React.useRef(null);
  const inputPDFFilesElement = React.useRef(null);
  const inputFolderElement = React.useRef(null);

  const [actions, setActions] = React.useState([]);
  const [uploadActions, setUploadActions] = React.useState([]);
  const [model, setModel] = React.useState([]);
  const [isDropdownMainButton, setIsDropdownMainButton] = React.useState(true);

  const onCreate = React.useCallback(
    (e) => {
      const format = e.action || null;

      const isPDF = format === "pdf";

      if (isPDF && isMobile) {
        toastr.info(t("Common:MobileEditPdfNotAvailableInfo"));
        return;
      }

      const event = new CustomEvent(Events.CREATE, {
        detail: {
          parentId: currentFolderId,
          context: "sidebar",
          extension: format,
        },
      });

      const payload = {
        extension: format,
        id: -1,
        edit: isPDF,
      };
      event.payload = payload;

      window.dispatchEvent(event);
    },
    [setAction, currentFolderId],
  );

  const onCreateRoom = React.useCallback(() => {
    if (isWarningRoomsDialog) {
      setQuotaWarningDialogVisible(true);
      return;
    }

    const event = new CustomEvent(Events.ROOM_CREATE, {
      detail: { parentId: currentFolderId, context: "sidebar" },
    });
    if (window.location.pathname.startsWith("/forms")) {
      event.payload = { isFormsCreate: true };
    }
    window.dispatchEvent(event);
  }, [isWarningRoomsDialog, currentFolderId]);

  const onShowSelectFileDialog = React.useCallback(() => {
    if (isMobile) {
      toastr.info(t("Common:MobileEditPdfNotAvailableInfo"));
      return;
    }
    setSelectFileDialogVisible(true);
  }, [setSelectFileDialogVisible]);

  const onShowFormRoomSelectFileDialog = React.useCallback(
    (filter = FilesSelectorFilterTypes.DOCX) => {
      setSelectFileFormRoomDialogVisible(true, filter, true);
    },
    [setSelectFileFormRoomDialogVisible],
  );

  const onFileChange = React.useCallback(
    async (e) => {
      const files = await getFilesFromEvent(e);

      createFoldersTree(t, files)
        .then((f) => {
          if (f.length > 0) startUpload(f, null, t);
        })
        .catch((err) => {
          toastr.error(err, null, 0, true);
        });
    },
    [startUpload, t],
  );

  const onUploadFileClick = React.useCallback(() => {
    inputFilesElement.current.click();
  }, []);

  const onUploadFolderClick = React.useCallback(() => {
    inputFolderElement.current.click();
  }, []);

  const onUploadPDFFilesClick = React.useCallback(() => {
    inputPDFFilesElement.current?.click();
  }, []);

  const onInputClick = React.useCallback((e) => (e.target.value = null), []);

  const onShowTemplateGallery = () => {
    setTemplateGalleryVisible(true);
    setOformFromFolderId(currentFolderId);
  };

  React.useEffect(() => {
    const isFolderHiddenDropdown =
      isArchiveFolder ||
      isFavoritesFolder ||
      isRecentFolder ||
      isRecycleBinFolder ||
      isSettingsPage;

    if (isFolderHiddenDropdown) {
      setIsDropdownMainButton(false);
    } else {
      setIsDropdownMainButton(true);
    }
  }, [
    isArchiveFolder,
    isFavoritesFolder,
    isRecentFolder,
    isRecycleBinFolder,
    isSettingsPage,
  ]);

  const createActionsForFormRoom = React.useCallback(
    (actionList) => {
      const {
        formGallery,
        formActions,
        createNewFolder,
        templateGalleryAvailable,
      } = actionList;

      const uploadFromDocSpace = {
        id: "actions_upload-from-docspace",
        className: "main-button_drop-down",
        icon: ActionsUploadReactSvgUrl,
        label: t("Common:FromPortal"),
        key: "actions_upload-from-docspace",
        disabled: false,
        onClick: () => onShowFormRoomSelectFileDialog(FilterType.PDFForm),
      };

      const uploadFormDevice = {
        id: "actions_upload-from-device",
        className: "main-button_drop-down",
        icon: ActionsUploadReactSvgUrl,
        label: t("Common:FromDevice"),
        key: "actions_upload-from-device",
        onClick: onUploadPDFFilesClick,
        disabled: false,
      };

      const uploadPDFFrom = {
        id: "actions_upload-ready-Pdf-from",
        className: "main-button_drop-down_sub",
        icon: ActionsUploadReactSvgUrl,
        label: t("Common:UploadPDFForm"),
        key: "actions_upload-ready-Pdf-from",
        items: [uploadFromDocSpace, uploadFormDevice],
      };

      const uploadPDFFromSeparator = {
        isSeparator: true,
        key: "separator",
      };

      const formGallerySeparator = {
        isSeparator: true,
        key: "separator-form-gallery",
      };

      const formGalleryOption = templateGalleryAvailable
        ? [formGallerySeparator, formGallery]
        : [];

      const formRoomActions = [
        formActions,
        createNewFolder,
        ...formGalleryOption,
        uploadPDFFromSeparator,
        uploadPDFFrom,
      ];

      const mobileFormRoomActions = [formActions, createNewFolder];

      if (mobileFormRoomActions) {
        mobileFormRoomActions.push(formGallery);
      }

      const mobileMoreActions = [uploadPDFFrom];

      return {
        formRoomActions,
        mobileFormRoomActions,
        mobileMoreActions,
      };
    },
    [onShowFormRoomSelectFileDialog, onUploadPDFFilesClick, onCreate],
  );

  React.useEffect(() => {
    if (isRoomsFolder || isSettingsPage) return;

    if (isAccountsPage) {
      const contactsModel = getContactsModel(t);

      setModel(contactsModel);
      setActions(contactsModel);

      return;
    }

    const newUploadActions = [
      {
        id: "actions_upload-files",
        className: "main-button_drop-down",
        icon: ActionsUploadReactSvgUrl,
        label: t("Common:UploadFiles"),
        onClick: onUploadFileClick,
        key: "upload-files",
      },
    ];


    const pluginItems = [];

    if (mainButtonItemsList && enablePlugins && !isAccountsPage) {
      mainButtonItemsList.forEach((option) => {
        pluginItems.push({
          key: option.key,
          ...option.value,
        });
      });
    }

    const createTemplateBlankPDF = {
      id: "actions_template_blank",
      className: "main-button_drop-down_sub",
      icon: FormBlankReactSvgUrl,
      label: t("Translations:SubNewForm"),
      onClick: onCreate,
      action: "pdf",
      key: "pdf",
    };

    const createNewDocumentDocx = {
      id: "actions_new-document",
      className: "main-button_drop-down",
      icon: ActionsDocumentsReactSvgUrl,
      label: t("Common:Document"),
      onClick: onCreate,
      action: "docx",
      key: "docx",
    };

    const createNewSpreadsheetXlsx = {
      id: "actions_new-spreadsheet",
      className: "main-button_drop-down",
      icon: SpreadsheetReactSvgUrl,
      label: t("Common:Spreadsheet"),
      onClick: onCreate,
      action: "xlsx",
      key: "xlsx",
    };

    const showSelectorDocx = {
      id: "actions_template_from-file",
      className: "main-button_drop-down_sub",
      icon: FormFileReactSvgUrl,
      label: t("Translations:SubNewFormFile"),
      onClick: onShowSelectFileDialog,
      disabled: isPrivacy,
      key: "form-file",
    };

    const createNewFolder = {
      id: "actions_new-folder",
      className: "main-button_drop-down",
      icon: CatalogFolderReactSvgUrl,
      label: t("Common:Folder"),
      onClick: onCreate,
      key: "new-folder",
    };

    const formGallery = {
      id: "actions_open-template-gallery",
      className: "main-button_drop-down",
      icon: TemplateGalleryReactSvgUrl,
      label: t("Common:TemplateGallery"),
      onClick: onShowTemplateGallery,
      key: "template-gallery",
    };

    const createNewPresentationPptx = {
      id: "actions_new-presentation",
      className: "main-button_drop-down",
      icon: ActionsPresentationReactSvgUrl,
      label: t("Common:Presentation"),
      onClick: onCreate,
      action: "pptx",
      key: "pptx",
    };

    if (!(isMobile || isTablet) && !isPrivacy) {
      newUploadActions.push({
        id: "actions_upload-folders",
        className: "main-button_drop-down",
        icon: ActionsUploadReactSvgUrl,
        label: t("Common:UploadFolder"),
        onClick: onUploadFolderClick,
        key: "upload-folder",
      });
    }

    const formActions = {
      id: "actions_template",
      className: "main-button_drop-down",
      icon: FormReactSvgUrl,
      label: t("Translations:NewForm"),
      key: "new-form",
      items: [createTemplateBlankPDF, showSelectorDocx],
    };

    if (
      currentRoomType === RoomsType.FormRoom ||
      (parentRoomType === FolderType.FormRoom && isFolder)
    ) {
      const { formRoomActions, mobileFormRoomActions, mobileMoreActions } =
        createActionsForFormRoom({
          formGallery,
          formActions,
          createNewFolder,
          templateGalleryAvailable,
        });

      // for mobile
      setUploadActions(mobileMoreActions);
      setActions(mobileFormRoomActions);
      // for PC
      setModel(formRoomActions);

      return;
    }

    // Instructions and Knowledge rooms are flat and hold one kind of file:
    // no folders and no folder upload. An Instructions room creates
    // Markdown only (its files are the skills); a Knowledge room only
    // uploads (its files are indexed, never edited), and not at all while
    // vectorization is off.
    if (
      currentRoomType === RoomsType.InstructionsRoom ||
      currentRoomType === RoomsType.KnowledgeRoom
    ) {
      const isKnowledgeRoom = currentRoomType === RoomsType.KnowledgeRoom;
      const uploadFilesOnly = newUploadActions.filter(
        (action) => action.key !== "upload-folder",
      );
      const sourceUploadActions =
        isKnowledgeRoom && !vectorizationEnabled ? [] : uploadFilesOnly;
      const createNewMarkdown = {
        id: "actions_new-markdown",
        className: "main-button_drop-down",
        icon: ActionsDocumentsReactSvgUrl,
        label: t("Common:MarkdownFile"),
        onClick: onCreate,
        action: "md",
        key: "md",
      };
      const sourceActions = isKnowledgeRoom ? [] : [createNewMarkdown];
      const sourceModel =
        sourceActions.length > 0 && sourceUploadActions.length > 0
          ? [
              ...sourceActions,
              { isSeparator: true, key: "separator" },
              ...sourceUploadActions,
            ]
          : [...sourceActions, ...sourceUploadActions];

      setUploadActions(sourceUploadActions);
      setActions(sourceActions);
      setModel(sourceModel);

      return;
    }

    const createNewPdfForm = {
      id: "actions_new-pdf-form",
      className: "main-button_drop-down",
      icon: FormReactSvgUrl,
      label: t("Translations:NewForm"),
      onClick: onCreate,
      action: "pdf",
      key: "pdf",
    };

    const canCreateDocuments = !isPrivacy || canCreateEncrypted;
    const newActions = canCreateDocuments
      ? [
          createNewDocumentDocx,
          createNewSpreadsheetXlsx,
          createNewPresentationPptx,
          isPrivacy ? createNewPdfForm : formActions,
          createNewFolder,
        ]
      : [createNewFolder];

    if (pluginItems.length > 0 && !isPrivacy) {
      newActions.push({
        id: "actions_more-plugins",
        className: "main-button_drop-down",
        icon: PluginMoreReactSvgUrl,
        label: t("Common:More"),
        disabled: false,
        key: "more-plugins",
        items: pluginItems,
      });
    }

    if (templateGalleryAvailable && !isPrivacy) {
      if (isDesktop()) {
        newActions.push({
          isSeparator: true,
          key: "separator",
        });
      }

      newActions.push(formGallery);
    }

    const menuModel = [...newActions];

    menuModel.push({
      isSeparator: true,
      key: "separator",
    });

    menuModel.push(...newUploadActions);
    setUploadActions(newUploadActions);

    setModel(menuModel);
    setActions(newActions);
  }, [
    t,
    isPrivacy,
    canCreateEncrypted,
    currentFolderId,
    isAccountsPage,
    isSettingsPage,
    enablePlugins,
    mainButtonItemsList,
    currentRoomType,
    vectorizationEnabled,
    isRoomsFolder,
    isOwner,
    isAdmin,
    isRoomAdmin,

    parentRoomType,
    isFolder,

    onCreate,
    onCreateRoom,
    getContactsModel,
    onShowSelectFileDialog,
    onShowFormRoomSelectFileDialog,
    onUploadFileClick,
    onUploadFolderClick,
    createActionsForFormRoom,
    isMobileArticle,

    contactsTab,
  ]);

  const isProfile = location.pathname.includes("/profile");
  // The AI projects page draws its own floating button.
  const isAiProjectsPage = location.pathname.startsWith("/ai-projects");

  const getMainButtonVisible = () => {
    let visibilityValue = true;

    if (currentDeviceType === DeviceType.mobile) {
      visibilityValue = !(
        moveToPanelVisible ||
        restorePanelVisible ||
        copyPanelVisible ||
        selectFileDialogVisible ||
        selectFileFormRoomDialogVisible ||
        versionHistoryPanelVisible
      );
    }

    if (
      isProfile ||
      (isAccountsPage && !contactsCanCreate) ||
      (isAccountsPage && !isContactsGroupsPage && !allowInvitingMembers)
    ) {
      visibilityValue = false;
    }

    if (!isAccountsPage) visibilityValue = security?.Create;

    // A Knowledge room with vectorization off has nothing to offer: no
    // upload, no create.
    if (currentRoomType === RoomsType.KnowledgeRoom && !vectorizationEnabled)
      visibilityValue = false;

    if (!isMobileArticle) visibilityValue = false;

    if (isAiProjectsPage) visibilityValue = false;

    return visibilityValue;
  };

  const mainButtonVisible = getMainButtonVisible();

  useEffect(() => {
    setMainButtonVisible(mainButtonVisible);
  }, [mainButtonVisible]);

  const onMainButtonClick = () => {
    if (!isAccountsPage) return onCreateRoom();
    if (isContactsGroupsPage) return createGroup(currentFolderId, "sidebar");
  };

  const mainButtonText =
    isRoomAdmin && isAccountsPage ? t("Common:Invite") : t("Common:Actions");

  let isDisabled = false;

  if (isSettingsPage) {
    isDisabled = isSettingsPage;
  } else if (isAccountsPage) {
    isDisabled = (isFrame && disableActionButton) || !contactsCanCreate;
  } else {
    isDisabled = (isFrame && disableActionButton) || !security?.Create;
  }

  if (showArticleLoader)
    return isMobileArticle ? null : <ArticleButtonLoader height="32px" />;

  const withMenu = !isRoomsFolder && !isContactsGroupsPage;

  return (
    <>
      {isMobileArticle ? (
        <MobileView
          t={t}
          titleProp={t("Common:Upload")}
          actionOptions={withFrameActions(actions)}
          buttonOptions={!isAccountsPage ? uploadActions : null}
          withoutButton={isRoomsFolder || isAccountsPage}
          withMenu={withMenu}
          mainButtonMobileVisible={
            mainButtonMobileVisible ? mainButtonVisible : null
          }
          onMainButtonClick={onMainButtonClick}
        />
      ) : isRoomsFolder ? (
        <Button
          className={classNames(styles.mainButton, "create-room-button")}
          id="rooms-shared_create-room-button"
          label={t("Common:NewRoom")}
          onClick={onCreateRoom}
          $currentColorScheme={currentColorScheme}
          isDisabled={isDisabled}
          size="small"
          primary
          scale
          title={t("Common:NewRoom")}
          testId="create_new_room_button"
        />
      ) : (
        <MainButton
          id={
            isAccountsPage
              ? "accounts_invite-main-button"
              : "actions-main-button"
          }
          isDisabled={isDisabled}
          isDropdown={isDropdownMainButton}
          text={mainButtonText}
          model={withFrameActions(model)}
          title={mainButtonText}
        />
      )}

      <input
        id="customFileInput"
        className="custom-file-input custom-file-input-article"
        multiple
        type="file"
        onChange={onFileChange}
        onClick={onInputClick}
        ref={inputFilesElement}
        style={{ display: "none" }}
      />
      <input
        id="customPDFInput"
        className="custom-file-input"
        multiple
        type="file"
        accept=".pdf"
        onChange={onFileChange}
        onClick={onInputClick}
        ref={inputPDFFilesElement}
        style={{ display: "none" }}
      />
      <input
        id="customFolderInput"
        className="custom-file-input"
        webkitdirectory=""
        mozdirectory=""
        type="file"
        onChange={onFileChange}
        onClick={onInputClick}
        ref={inputFolderElement}
        style={{ display: "none" }}
      />
    </>
  );
};

export default inject(
  ({
    settingsStore,
    filesStore,
    dialogsStore,
    uploadDataStore,
    treeFoldersStore,
    selectedFolderStore,
    clientLoadingStore,
    oformsStore,
    pluginStore,
    versionHistoryStore,
    userStore,
    filesActionsStore,
    currentQuotaStore,
    peopleStore,
  }) => {
    const { showArticleLoader } = clientLoadingStore;
    const {
      isPrivacyFolder,
      isFavoritesFolder,
      isRecentFolder,
      isRecycleBinFolder,
      isRoomsFolder,
      isArchiveFolder,
      selectedTreeNode,
    } = treeFoldersStore;
    const { startUpload } = uploadDataStore;
    const canCreateEncrypted = uploadDataStore.shouldEncryptCurrentUpload();
    const {
      setSelectFileDialogVisible,
      setInvitePanelOptions,
      setQuotaWarningDialogVisible,
      copyPanelVisible,
      moveToPanelVisible,
      restorePanelVisible,
      selectFileDialogVisible,
      selectFileFormRoomDialogVisible,
      setSelectFileFormRoomDialogVisible,
    } = dialogsStore;

    const {
      enablePlugins,
      currentColorScheme,
      currentDeviceType,
      allowInvitingMembers,
      templateGalleryAvailable,
    } = settingsStore;

    const { isVisible: versionHistoryPanelVisible } = versionHistoryStore;

    const { security } = selectedFolderStore;

    const { mainButtonMobileVisible, setMainButtonVisible } = filesStore;

    const currentFolderId = selectedFolderStore.id;
    const currentRoomType = selectedFolderStore.roomType;
    // Read only while AI services are on; until then a Knowledge room keeps
    // its upload, the server refuses what it must.
    const vectorizationEnabled =
      settingsStore.aiConfig?.vectorizationEnabled !== false;
    const { parentRoomType } = selectedFolderStore;
    const { isFolder } = selectedFolderStore;

    const { isAdmin, isOwner, isRoomAdmin, isCollaborator } = userStore.user;

    const { showWarningDialog, isWarningRoomsDialog } = currentQuotaStore;

    const { setOformFromFolderId, oformsFilter, setTemplateGalleryVisible } =
      oformsStore;
    const { mainButtonItemsList } = pluginStore;

    const { frameConfig, isFrame } = settingsStore;

    const { createFoldersTree } = filesActionsStore;

    return {
      setQuotaWarningDialogVisible,
      showText: settingsStore.showText,
      isMobileArticle: settingsStore.isMobileArticle,

      showArticleLoader,
      isPrivacy: isPrivacyFolder,
      canCreateEncrypted,
      isFavoritesFolder,
      isRecentFolder,
      isRecycleBinFolder,

      isRoomsFolder,
      isArchiveFolder,
      selectedTreeNode,

      startUpload,

      setSelectFileDialogVisible,
      selectFileDialogVisible,
      setInvitePanelOptions,
      setMainButtonVisible,

      currentFolderId,
      currentRoomType,
    vectorizationEnabled,

      setOformFromFolderId,
      oformsFilter,

      enablePlugins,
      mainButtonItemsList,

      currentColorScheme,

      isAdmin,
      isOwner,
      isRoomAdmin,
      isCollaborator,

      mainButtonMobileVisible,
      moveToPanelVisible,
      restorePanelVisible,
      copyPanelVisible,
      versionHistoryPanelVisible,
      security,
      currentDeviceType,

      isFrame,
      disableActionButton: frameConfig?.disableActionButton,
      frameCustomActions: isFrame ? settingsStore.frameCustomActions : null,
      rootFolderType: selectedFolderStore.rootFolderType,

      parentRoomType,
      isFolder,
      selectFileFormRoomDialogVisible,
      setSelectFileFormRoomDialogVisible,
      createFoldersTree,

      showWarningDialog,
      isWarningRoomsDialog,

      getContactsModel: peopleStore.contextOptionsStore.getContactsModel,
      contactsCanCreate: peopleStore.contextOptionsStore.contactsCanCreate,
      contactsTab: peopleStore.usersStore.contactsTab,
      setTemplateGalleryVisible,
      templateGalleryAvailable,

      allowInvitingMembers,
    };
  },
)(
  withTranslation([
    "UploadPanel",
    "Common",
    "Files",
    "People",
    "PeopleTranslations",
    "EmptyView",
  ])(observer(ArticleMainButtonContent)),
);

