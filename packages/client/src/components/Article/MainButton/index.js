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

import ActionsUploadReactSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";
import FormReactSvgUrl from "PUBLIC_DIR/images/access.form.react.svg?url";
import FormBlankReactSvgUrl from "PUBLIC_DIR/images/form.blank.react.svg?url";
import FormFileReactSvgUrl from "PUBLIC_DIR/images/form.file.react.svg?url";
import FormGalleryReactSvgUrl from "PUBLIC_DIR/images/form.gallery.react.svg?url";
import ActionsDocumentsReactSvgUrl from "PUBLIC_DIR/images/actions.documents.react.svg?url";
import SpreadsheetReactSvgUrl from "PUBLIC_DIR/images/spreadsheet.react.svg?url";
import ActionsPresentationReactSvgUrl from "PUBLIC_DIR/images/actions.presentation.react.svg?url";
import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.folder.react.svg?url";
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

import { MainButton } from "@docspace/shared/components/main-button";
import { toastr } from "@docspace/shared/components/toast";
import { Button } from "@docspace/shared/components/button";

import { withTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Events,
  DeviceType,
  RoomsType,
  FilesSelectorFilterTypes,
  FolderType,
  FilterType,
} from "@docspace/shared/enums";

import styled, { css } from "styled-components";

import { ArticleButtonLoader } from "@docspace/shared/skeletons/article";
import { isMobile, isTablet } from "react-device-detect";
import { globalColors } from "@docspace/shared/themes";
import getFilesFromEvent from "@docspace/shared/utils/get-files-from-event";
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
    border: ${({ $currentColorScheme }) => $currentColorScheme.main?.accent};

    ${(props) =>
      !props.isDisabled &&
      css`
        :hover {
          background-color: ${({ $currentColorScheme }) =>
            $currentColorScheme.main?.accent};
          opacity: 0.85;
          background: ${({ $currentColorScheme }) =>
            $currentColorScheme.main?.accent};
          border: ${({ $currentColorScheme }) =>
            $currentColorScheme.main?.accent};
        }

        :active {
          background-color: ${({ $currentColorScheme }) =>
            $currentColorScheme.main?.accent};
          background: ${({ $currentColorScheme }) =>
            $currentColorScheme.main?.accent};
          border: ${({ $currentColorScheme }) =>
            $currentColorScheme.main?.accent};
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
    oformsFilter,

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
    setMainButtonVisible,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const isAccountsPage = location.pathname.includes("/accounts");
  const isSettingsPage = location.pathname.includes("settings");

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
        toastr.info(t("Files:MobileEditPdfNotAvailableInfo"));
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
      toastr.info(t("Files:MobileEditPdfNotAvailableInfo"));
      return;
    }
    setSelectFileDialogVisible(true);
  }, [setSelectFileDialogVisible]);

  const onShowFormRoomSelectFileDialog = React.useCallback(
    (filter = FilesSelectorFilterTypes.DOCX) => {
      setSelectFileFormRoomDialogVisible(true, filter);
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

  const onShowGallery = () => {
    if (isMobile) {
      toastr.info(t("Files:MobileEditPdfNotAvailableInfo"));
      return;
    }

    const initOformFilter = (
      oformsFilter || oformsFilter.getDefault()
    ).toUrlParams();
    setOformFromFolderId(currentFolderId);
    navigate(`/form-gallery/${currentFolderId}/filter?${initOformFilter}`);
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
        // uploadActions,
        // createNewFolder,
        // showSelectorFormRoomDocx,
        // createNewDocumentDocx,
        // createTemplateBlankDocxf,
        // createNewPresentationPptx,
        // createNewSpreadsheetXlsx,
      } = actionList;

      const createNewFolder = {
        id: "actions_new-folder",
        className: "main-button_drop-down",
        icon: CatalogFolderReactSvgUrl,
        label: t("Files:CreateNewFolder"),
        onClick: onCreate,
        key: "new-folder",
      };

      const showSelectorFormRoomDocx = {
        id: "actions_form-room_template_from-file",
        className: "main-button_drop-down_sub",
        icon: FormGalleryReactSvgUrl,
        label: t("Common:ChooseFromTemplates"),
        onClick: formGallery.onClick,
        disabled: isPrivacy,
        key: "form-file",
      };

      // const templatePDFForm = {
      //   id: "actions_template-PDF-form",
      //   className: "main-button_drop-down",
      //   icon: FormReactSvgUrl,
      //   label: t("Common:CreatePDFForm"),
      //   key: "new-form",
      //   items: [createTemplateBlankDocxf, showSelectorFormRoomDocx],
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
        showSelectorFormRoomDocx,
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
        showSelectorFormRoomDocx,
        createNewFolder,
      ];

      return {
        formRoomActions,
        mobileFormRoomActions,
        mobileMoreActions,
      };
    },
    [onShowFormRoomSelectFileDialog, onUploadPDFFilesClick],
  );

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

    const showSelectorDocx = {
      id: "actions_template_from-file",
      className: "main-button_drop-down_sub",
      icon: FormFileReactSvgUrl,
      label: t("Translations:SubNewFormFile"),
      onClick: onShowSelectFileDialog,
      disabled: isPrivacy,
      key: "form-file",
    };

    const formGallery = {
      id: "actions_template_oforms-gallery",
      className: "main-button_drop-down_sub",
      icon: FormGalleryReactSvgUrl,
      label: t("Common:OFORMsGallery"),
      onClick: onShowGallery,
      disabled: isPrivacy,
      key: "form-gallery",
    };

    const createNewDocumentDocx = {
      id: "actions_new-document",
      className: "main-button_drop-down",
      icon: ActionsDocumentsReactSvgUrl,
      label: t("Files:Document"),
      onClick: onCreate,
      action: "docx",
      key: "docx",
    };

    const createNewSpreadsheetXlsx = {
      id: "actions_new-spreadsheet",
      className: "main-button_drop-down",
      icon: SpreadsheetReactSvgUrl,
      label: t("Files:Spreadsheet"),
      onClick: onCreate,
      action: "xlsx",
      key: "xlsx",
    };

    const createNewFolder = {
      id: "actions_new-folder",
      className: "main-button_drop-down",
      icon: CatalogFolderReactSvgUrl,
      label: t("Files:Folder"),
      onClick: onCreate,
      key: "new-folder",
    };

    const createNewPresentationPptx = {
      id: "actions_new-presentation",
      className: "main-button_drop-down",
      icon: ActionsPresentationReactSvgUrl,
      label: t("Files:Presentation"),
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
          formGallery,
          newUploadActions,
          // createNewFolder,
          // showSelectorFormRoomDocx,
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
        items: [createTemplateBlankDocxf, showSelectorDocx, formGallery],
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

    if (isProfile || (isAccountsPage && !contactsCanCreate)) {
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

  const mainButtonText =
    isRoomAdmin && isAccountsPage ? t("Common:Invite") : t("Common:Actions");

  let isDisabled = false;
  if (isFrame) {
    isDisabled = disableActionButton;
  } else if (isSettingsPage) {
    isDisabled = isSettingsPage;
  } else if (isAccountsPage) {
    isDisabled = !contactsCanCreate;
  } else {
    isDisabled = !security?.Create;
  }

  if (showArticleLoader)
    return isMobileArticle ? null : <ArticleButtonLoader height="32px" />;

  return (
    <>
      {isMobileArticle ? (
        <MobileView
          t={t}
          titleProp={t("Upload")}
          actionOptions={actions}
          buttonOptions={!isAccountsPage ? uploadActions : null}
          withoutButton={isRoomsFolder || isAccountsPage}
          withMenu={!isRoomsFolder}
          mainButtonMobileVisible={
            mainButtonMobileVisible ? mainButtonVisible : null
          }
          onMainButtonClick={onCreateRoom}
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
        mozdirectory="" // eslint-disable-line react/no-unknown-property
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
    const { mainButtonMobileVisible, setMainButtonVisible } = filesStore;
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

    const { enablePlugins, currentColorScheme, currentDeviceType } =
      settingsStore;
    const { isVisible: versionHistoryPanelVisible } = versionHistoryStore;

    const { security } = selectedFolderStore;

    const currentFolderId = selectedFolderStore.id;
    const currentRoomType = selectedFolderStore.roomType;
    const { parentRoomType } = selectedFolderStore;
    const { isFolder } = selectedFolderStore;

    const { isAdmin, isOwner, isRoomAdmin, isCollaborator } = userStore.user;

    const { showWarningDialog, isWarningRoomsDialog } = currentQuotaStore;

    const { setOformFromFolderId, oformsFilter } = oformsStore;
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
      setMainButtonVisible,
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
