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

import ActionsUploadReactSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";
import FormReactSvgUrl from "PUBLIC_DIR/images/access.form.react.svg?url";
import FormBlankReactSvgUrl from "PUBLIC_DIR/images/form.blank.react.svg?url";
import ActionsDocumentsReactSvgUrl from "PUBLIC_DIR/images/actions.documents.react.svg?url";
import SpreadsheetReactSvgUrl from "PUBLIC_DIR/images/spreadsheet.react.svg?url";
import ActionsPresentationReactSvgUrl from "PUBLIC_DIR/images/actions.presentation.react.svg?url";
import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";
import TemplateGalleryReactSvgUrl from "PUBLIC_DIR/images/template.gallery.react.svg?url";
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

import styled, { css } from "styled-components";
import { useLocation } from "react-router";
import { MainButton } from "@docspace/shared/components/main-button";
import { toastr } from "@docspace/shared/components/toast";
import { Button } from "@docspace/shared/components/button";

import { ArticleButtonLoader } from "@docspace/shared/skeletons/article";
import { isMobile, isTablet } from "react-device-detect";
import { globalColors } from "@docspace/shared/themes";
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
import { encryptionUploadDialog } from "../../../helpers/desktop";

const StyledButton = styled(Button)`
  && {
    font-weight: 700 !important;
    font-size: 16px !important;
    padding: 0;
    opacity: ${(props) => (props.isDisabled ? 0.6 : 1)};
    background-color: ${({ $currentColorScheme }) =>
      $currentColorScheme.main?.accent} !important;
    background: ${({ $currentColorScheme }) =>
      $currentColorScheme.main?.accent};
    border-color: ${({ $currentColorScheme }) =>
      $currentColorScheme.main?.accent};

    ${(props) =>
      !props.isDisabled &&
      css`
        :hover {
          background-color: ${({ $currentColorScheme }) =>
            $currentColorScheme.main?.accent};
          opacity: 0.85;
          background: ${({ $currentColorScheme }) =>
            $currentColorScheme.main?.accent};
          border-color: ${({ $currentColorScheme }) =>
            $currentColorScheme.main?.accent};
        }

        :active {
          background-color: ${({ $currentColorScheme }) =>
            $currentColorScheme.main?.accent};
          background: ${({ $currentColorScheme }) =>
            $currentColorScheme.main?.accent};
          border-color: ${({ $currentColorScheme }) =>
            $currentColorScheme.main?.accent} !important;
          opacity: 1;
          filter: brightness(90%);
          cursor: pointer;
        }
      `}

    .button-content {
      color: ${({ $currentColorScheme }) => $currentColorScheme.text?.accent};
      position: relative;
      display: flex;
      justify-content: space-between;
      vertical-align: middle;
      box-sizing: border-box;
      padding-block: 5px;
      padding-inline: 12px 14px;
      line-height: 22px;
      border-radius: 3px;

      user-select: none;
      -webkit-tap-highlight-color: ${globalColors.tapHighlight};
    }
  }
`;

const ArticleMainButtonContent = (props) => {
  const {
    t,
    isMobileArticle,

    isPrivacy,
    encryptedFile,
    encrypted,
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

    currentFolderId,
    currentRoomType,
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
    setRefMap,

    setTemplateGalleryVisible,
    templateGalleryAvailable,

    allowInvitingMembers,
  } = props;

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

      const event = new Event(Events.CREATE);

      const isPDF = format === "pdf";

      if (isPDF && isMobile) {
        toastr.info(t("Common:MobileEditPdfNotAvailableInfo"));
        return;
      }

      const payload = {
        extension: format,
        id: -1,
        edit: isPDF,
      };
      event.payload = payload;

      window.dispatchEvent(event);
    },
    [setAction],
  );

  const onCreateRoom = React.useCallback(() => {
    if (isWarningRoomsDialog) {
      setQuotaWarningDialogVisible(true);
      return;
    }

    const event = new Event(Events.ROOM_CREATE);
    window.dispatchEvent(event);
  }, [isWarningRoomsDialog]);

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
    if (isPrivacy) {
      encryptionUploadDialog((f, isEncrypted) => {
        f.encrypted = isEncrypted;
        startUpload([f], null, t); // TODO: createFoldersTree
      });
    } else {
      inputFilesElement.current.click();
    }
  }, [
    isPrivacy,
    encrypted,
    encryptedFile,
    encryptionUploadDialog,
    startUpload,
  ]);

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

  const createActionsForFormRoom = React.useCallback(() => {
    const createNewFolder = {
      id: "actions_new-folder",
      className: "main-button_drop-down",
      icon: CatalogFolderReactSvgUrl,
      label: t("Files:CreateNewFolder"),
      onClick: onCreate,
      key: "new-folder",
    };

    // const templatePDFForm = {
    //   id: "actions_template-PDF-form",
    //   className: "main-button_drop-down",
    //   icon: FormReactSvgUrl,
    //   label: t("Common:CreatePDFForm"),
    //   key: "new-form",
    //   items: [createTemplateBlankDocxf],
    // };

    const uploadFromDocSpace = {
      id: "actions_upload-from-docspace",
      className: "main-button_drop-down",
      icon: ActionsUploadReactSvgUrl,
      label: t("Common:FromPortal", { productName: t("Common:ProductName") }),
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

    // const moreActions = {
    //   id: "actions_more-form",
    //   className: "main-button_drop-down",
    //   icon: PluginMoreReactSvgUrl,
    //   label: t("Common:More"),
    //   disabled: false,
    //   key: "more-form",
    //   items: [
    //     createNewFolder,
    //     {
    //       isSeparator: true,
    //       key: "actions_more-form__separator-1",
    //     },
    //     createNewDocumentDocx,
    //     createNewPresentationPptx,
    //     createNewSpreadsheetXlsx,
    //     {
    //       isSeparator: true,
    //       key: "actions_more-form__separator-2",
    //     },
    //     ...uploadActions,
    //   ],
    // };

    // const mobileMoreActions = {
    //   ...moreActions,
    //   items: moreActions.items.filter((item) => !item.isSeparator),
    // };

    const mobileMoreActions = null;
    const formRoomActions = [
      // templatePDFForm,
      // formGallery,
      uploadPDFFrom,

      {
        isSeparator: true,
        key: "separator",
      },
      createNewFolder,
      // {
      //   isSeparator: true,
      //   key: "separator-1",
      // },
      // moreActions,
    ];

    const mobileFormRoomActions = [
      // templatePDFForm,
      // formGallery,
      uploadPDFFrom,
      createNewFolder,
    ];

    return {
      formRoomActions,
      mobileFormRoomActions,
      mobileMoreActions,
    };
  }, [onShowFormRoomSelectFileDialog, onUploadPDFFilesClick]);

  React.useEffect(() => {
    if (isRoomsFolder || isSettingsPage) return;

    if (isAccountsPage) {
      const contactsModel = getContactsModel(t);

      setModel(contactsModel);
      setActions(contactsModel);

      return;
    }

    const pluginItems = [];

    if (mainButtonItemsList && enablePlugins && !isAccountsPage) {
      mainButtonItemsList.forEach((option) => {
        pluginItems.push({
          key: option.key,
          ...option.value,
        });
      });
    }

    const createTemplateBlankDocxf = {
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

    const createNewFolder = {
      id: "actions_new-folder",
      className: "main-button_drop-down",
      icon: CatalogFolderReactSvgUrl,
      label: t("Common:Folder"),
      onClick: onCreate,
      key: "new-folder",
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

    const newUploadActions = [
      {
        id: "actions_upload-files",
        className: "main-button_drop-down",
        icon: ActionsUploadReactSvgUrl,
        label: t("UploadFiles"),
        onClick: onUploadFileClick,
        key: "upload-files",
      },
    ];

    if (!(isMobile || isTablet)) {
      newUploadActions.push({
        id: "actions_upload-folders",
        className: "main-button_drop-down",
        icon: ActionsUploadReactSvgUrl,
        label: t("UploadFolder"),
        disabled: isPrivacy,
        onClick: onUploadFolderClick,
        key: "upload-folder",
      });
    }

    if (
      currentRoomType === RoomsType.FormRoom ||
      (parentRoomType === FolderType.FormRoom && isFolder)
    ) {
      const { formRoomActions, mobileFormRoomActions, mobileMoreActions } =
        createActionsForFormRoom({
          newUploadActions,
          // createNewFolder,
          // createNewDocumentDocx,
          // createTemplateBlankDocxf,
          // createNewPresentationPptx,
          // createNewSpreadsheetXlsx,
        });

      // for mobile
      setUploadActions(mobileMoreActions);
      setActions(mobileFormRoomActions);
      // for PC
      setModel(formRoomActions);

      return;
    }

    const formActions = [
      {
        id: "actions_template",
        className: "main-button_drop-down",
        icon: FormReactSvgUrl,
        label: t("Translations:NewForm"),
        key: "new-form",
        items: [createTemplateBlankDocxf],
      },
    ];

    const newActions = [
      createNewDocumentDocx,
      createNewSpreadsheetXlsx,
      createNewPresentationPptx,
      ...formActions,
      createNewFolder,
    ];

    if (pluginItems.length > 0) {
      // menuModel.push({
      //   id: "actions_more-plugins",
      //   className: "main-button_drop-down",
      //   icon: PluginMoreReactSvgUrl,
      //   label: t("Common:More"),
      //   disabled: false,
      //   key: "more-plugins",
      //   items: pluginItems,
      // });

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

    if (templateGalleryAvailable) {
      newActions.push(
        {
          isSeparator: true,
          key: "separator",
        },
        {
          id: "actions_open-template-gallery",
          className: "main-button_drop-down",
          icon: TemplateGalleryReactSvgUrl,
          label: t("Common:TemplateGallery"),
          onClick: onShowTemplateGallery,
          key: "template-gallery",
        },
      );
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
    currentFolderId,
    isAccountsPage,
    isSettingsPage,
    enablePlugins,
    mainButtonItemsList,
    currentRoomType,
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
  ]);

  const isProfile = location.pathname.includes("/profile");

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

    if (!isMobileArticle) visibilityValue = false;
    return visibilityValue;
  };

  const mainButtonVisible = getMainButtonVisible();

  useEffect(() => {
    setMainButtonVisible(mainButtonVisible);
  }, [mainButtonVisible]);

  const onMainButtonClick = () => {
    if (!isAccountsPage) return onCreateRoom();
    if (isContactsGroupsPage) return createGroup();
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
          titleProp={t("Upload")}
          actionOptions={actions}
          buttonOptions={!isAccountsPage ? uploadActions : null}
          withoutButton={isRoomsFolder || isAccountsPage}
          withMenu={withMenu}
          mainButtonMobileVisible={
            mainButtonMobileVisible ? mainButtonVisible : null
          }
          onMainButtonClick={onMainButtonClick}
        />
      ) : isRoomsFolder ? (
        <StyledButton
          className="create-room-button"
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
          model={model}
          title={mainButtonText}
          setRefMap={setRefMap}
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
    guidanceStore,
  }) => {
    const { showArticleLoader } = clientLoadingStore;
    const { setRefMap } = guidanceStore;
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

      parentRoomType,
      isFolder,
      selectFileFormRoomDialogVisible,
      setSelectFileFormRoomDialogVisible,
      createFoldersTree,

      showWarningDialog,
      isWarningRoomsDialog,

      getContactsModel: peopleStore.contextOptionsStore.getContactsModel,
      contactsCanCreate: peopleStore.contextOptionsStore.contactsCanCreate,
      setRefMap,
      setTemplateGalleryVisible,
      templateGalleryAvailable,

      allowInvitingMembers,
    };
  },
)(
  withTranslation([
    "Article",
    "UploadPanel",
    "Common",
    "Files",
    "People",
    "PeopleTranslations",
  ])(observer(ArticleMainButtonContent)),
);
