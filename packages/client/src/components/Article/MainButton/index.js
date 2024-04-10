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
import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/catalog.folder.react.svg?url";
import PersonAdminReactSvgUrl from "PUBLIC_DIR/images/person.admin.react.svg?url";
import PersonManagerReactSvgUrl from "PUBLIC_DIR/images/person.manager.react.svg?url";
import PersonReactSvgUrl from "PUBLIC_DIR/images/person.react.svg?url";
import PersonDefaultReactSvgUrl from "PUBLIC_DIR/images/person.default.react.svg?url";
import GroupReactSvgUrl from "PUBLIC_DIR/images/group.react.svg?url";
import PersonUserReactSvgUrl from "PUBLIC_DIR/images/person.user.react.svg?url";
import InviteAgainReactSvgUrl from "PUBLIC_DIR/images/invite.again.react.svg?url";
import PluginMoreReactSvgUrl from "PUBLIC_DIR/images/plugin.more.react.svg?url";
import React from "react";

import { inject, observer } from "mobx-react";

import { MainButton } from "@docspace/shared/components/main-button";
import { toastr } from "@docspace/shared/components/toast";
import { Button } from "@docspace/shared/components/button";

import { withTranslation } from "react-i18next";
import { encryptionUploadDialog } from "../../../helpers/desktop";
import { useNavigate, useLocation } from "react-router-dom";

import MobileView from "./MobileView";

import { Events, EmployeeType, DeviceType } from "@docspace/shared/enums";

import styled, { css } from "styled-components";

import { resendInvitesAgain } from "@docspace/shared/api/people";
import { getCorrectFourValuesStyle } from "@docspace/shared/utils";
import { ArticleButtonLoader } from "@docspace/shared/skeletons/article";

const StyledButton = styled(Button)`
  font-weight: 700;
  font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
  padding: 0;
  opacity: ${(props) => (props.isDisabled ? 0.6 : 1)};

  background-color: ${({ $currentColorScheme }) =>
    $currentColorScheme.main?.accent} !important;
  background: ${({ $currentColorScheme }) => $currentColorScheme.main?.accent};
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
    padding: ${({ theme }) =>
      getCorrectFourValuesStyle("5px 14px 5px 12px", theme.interfaceDirection)};
    line-height: 22px;
    border-radius: 3px;

    user-select: none;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
`;

const ArticleMainButtonContent = (props) => {
  const {
    t,
    tReady,
    isMobileArticle,

    isPrivacy,
    encryptedFile,
    encrypted,
    startUpload,
    setAction,
    setSelectFileDialogVisible,
    selectFileDialogVisible,
    showArticleLoader,
    isFavoritesFolder,
    isRecentFolder,
    isRecycleBinFolder,

    currentFolderId,
    isRoomsFolder,
    isArchiveFolder,

    setOformFromFolderId,
    oformsFilter,

    enablePlugins,
    mainButtonItemsList,

    currentColorScheme,

    isOwner,
    isAdmin,

    setInvitePanelOptions,

    mainButtonMobileVisible,
    versionHistoryPanelVisible,
    moveToPanelVisible,
    restorePanelVisible,
    copyPanelVisible,

    security,
    isGracePeriod,
    setInviteUsersWarningDialogVisible,
    currentDeviceType,

    isFrame,
    disableActionButton,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const isAccountsPage = location.pathname.includes("/accounts");
  const isSettingsPage = location.pathname.includes("settings");

  const inputFilesElement = React.useRef(null);
  const inputFolderElement = React.useRef(null);

  const [actions, setActions] = React.useState([]);
  const [uploadActions, setUploadActions] = React.useState([]);
  const [model, setModel] = React.useState([]);
  const [isDropdownMainButton, setIsDropdownMainButton] = React.useState(true);

  const onCreate = React.useCallback(
    (e) => {
      const format = e.action || null;

      const event = new Event(Events.CREATE);

      const payload = {
        extension: format,
        id: -1,
      };
      event.payload = payload;

      window.dispatchEvent(event);
    },
    [setAction],
  );

  const onCreateRoom = React.useCallback(() => {
    if (isGracePeriod) {
      setInviteUsersWarningDialogVisible(true);
      return;
    }

    const event = new Event(Events.ROOM_CREATE);
    window.dispatchEvent(event);
  }, []);

  const onShowSelectFileDialog = React.useCallback(() => {
    setSelectFileDialogVisible(true);
  }, [setSelectFileDialogVisible]);

  const onFileChange = React.useCallback(
    (e) => {
      startUpload(e.target.files, null, t);
    },
    [startUpload, t],
  );

  const onUploadFileClick = React.useCallback(() => {
    if (isPrivacy) {
      encryptionUploadDialog((encryptedFile, encrypted) => {
        encryptedFile.encrypted = encrypted;
        startUpload([encryptedFile], null, t);
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

  const onInputClick = React.useCallback((e) => (e.target.value = null), []);

  const onShowGallery = () => {
    const initOformFilter = (
      oformsFilter || oformsFilter.getDefault()
    ).toUrlParams();
    setOformFromFolderId(currentFolderId);
    navigate(`/form-gallery/${currentFolderId}/filter?${initOformFilter}`);
  };

  const onInvite = React.useCallback((e) => {
    const type = e.action;

    if (isGracePeriod) {
      setInviteUsersWarningDialogVisible(true);
      return;
    }

    setInvitePanelOptions({
      visible: true,
      roomId: -1,
      hideSelector: true,
      defaultAccess: type,
    });
  }, []);

  const onInviteAgain = React.useCallback(() => {
    resendInvitesAgain()
      .then(() =>
        toastr.success(t("PeopleTranslations:SuccessSentMultipleInvitatios")),
      )
      .catch((err) => toastr.error(err));
  }, [resendInvitesAgain]);

  const onCreateGroup = React.useCallback(() => {
    const event = new Event(Events.GROUP_CREATE);
    window.dispatchEvent(event);
  }, []);

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

  React.useEffect(() => {
    if (isRoomsFolder || isSettingsPage) return;

    const pluginItems = [];

    if (mainButtonItemsList && enablePlugins && !isAccountsPage) {
      mainButtonItemsList.forEach((option) => {
        pluginItems.push({
          key: option.key,
          ...option.value,
        });
      });
    }

    const formActions = [
      {
        id: "actions_template",
        className: "main-button_drop-down",
        icon: FormReactSvgUrl,
        label: t("Translations:NewForm"),
        key: "new-form",
        items: [
          {
            id: "actions_template_blank",
            className: "main-button_drop-down_sub",
            icon: FormBlankReactSvgUrl,
            label: t("Translations:SubNewForm"),
            onClick: onCreate,
            action: "docxf",
            key: "docxf",
          },
          {
            id: "actions_template_from-file",
            className: "main-button_drop-down_sub",
            icon: FormFileReactSvgUrl,
            label: t("Translations:SubNewFormFile"),
            onClick: onShowSelectFileDialog,
            disabled: isPrivacy,
            key: "form-file",
          },
          {
            id: "actions_template_oforms-gallery",
            className: "main-button_drop-down_sub",
            icon: FormGalleryReactSvgUrl,
            label: t("Common:OFORMsGallery"),
            onClick: onShowGallery,
            disabled: isPrivacy,
            key: "form-gallery",
          },
        ],
      },
    ];

    const actions = isAccountsPage
      ? [
          {
            id: "actions_invite_user",
            className: "main-button_drop-down",
            icon: PersonUserReactSvgUrl,
            label: t("Common:Invite"),
            key: "new-user",
            items: [
              ...(isOwner
                ? [
                    {
                      id: "invite_doc-space-administrator",
                      className: "main-button_drop-down",
                      icon: PersonAdminReactSvgUrl,
                      label: t("Common:DocSpaceAdmin"),
                      onClick: onInvite,
                      action: EmployeeType.Admin,
                      key: "administrator",
                    },
                  ]
                : []),
              {
                id: "invite_room-admin",
                className: "main-button_drop-down",
                icon: PersonManagerReactSvgUrl,
                label: t("Common:RoomAdmin"),
                onClick: onInvite,
                action: EmployeeType.User,
                key: "manager",
              },
              {
                id: "invite_room-collaborator",
                className: "main-button_drop-down",
                icon: PersonDefaultReactSvgUrl,
                label: t("Common:PowerUser"),
                onClick: onInvite,
                action: EmployeeType.Collaborator,
                key: "collaborator",
              },
              {
                id: "invite_user",
                className: "main-button_drop-down",
                icon: PersonDefaultReactSvgUrl,
                label: t("Common:User"),
                onClick: onInvite,
                action: EmployeeType.Guest,
                key: "user",
              },
              ...(!isMobileArticle
                ? [
                    {
                      isSeparator: true,
                      key: "invite-users-separator",
                    },
                  ]
                : []),
              {
                id: "invite_again",
                className: "main-button_drop-down",
                icon: InviteAgainReactSvgUrl,
                label: t("People:LblInviteAgain"),
                onClick: onInviteAgain,
                action: "invite-again",
                key: "invite-again",
              },
            ],
          },
          {
            id: "create_group",
            className: "main-button_drop-down",
            icon: GroupReactSvgUrl,
            label: t("PeopleTranslations:CreateGroup"),
            onClick: onCreateGroup,
            action: "group",
            key: "group",
          },
        ]
      : [
          {
            id: "actions_new-document",
            className: "main-button_drop-down",
            icon: ActionsDocumentsReactSvgUrl,
            label: t("Files:Document"),
            onClick: onCreate,
            action: "docx",
            key: "docx",
          },
          {
            id: "actions_new-spreadsheet",
            className: "main-button_drop-down",
            icon: SpreadsheetReactSvgUrl,
            label: t("Files:Spreadsheet"),
            onClick: onCreate,
            action: "xlsx",
            key: "xlsx",
          },
          {
            id: "actions_new-presentation",
            className: "main-button_drop-down",
            icon: ActionsPresentationReactSvgUrl,
            label: t("Files:Presentation"),
            onClick: onCreate,
            action: "pptx",
            key: "pptx",
          },
          ...formActions,
          {
            id: "actions_new-folder",
            className: "main-button_drop-down",
            icon: CatalogFolderReactSvgUrl,
            label: t("Files:Folder"),
            onClick: onCreate,
            key: "new-folder",
          },
        ];

    const uploadActions = [
      {
        id: "actions_upload-files",
        className: "main-button_drop-down",
        icon: ActionsUploadReactSvgUrl,
        label: t("UploadFiles"),
        onClick: onUploadFileClick,
        key: "upload-files",
      },
      {
        id: "actions_upload-folders",
        className: "main-button_drop-down",
        icon: ActionsUploadReactSvgUrl,
        label: t("UploadFolder"),
        disabled: isPrivacy,
        onClick: onUploadFolderClick,
        key: "upload-folder",
      },
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

      actions.push({
        id: "actions_more-plugins",
        className: "main-button_drop-down",
        icon: PluginMoreReactSvgUrl,
        label: t("Common:More"),
        disabled: false,
        key: "more-plugins",
        items: pluginItems,
      });
    }

    const menuModel = [...actions];

    if (!isAccountsPage) {
      menuModel.push({
        isSeparator: true,
        key: "separator",
      });

      menuModel.push(...uploadActions);
      setUploadActions(uploadActions);
    }

    setModel(menuModel);
    setActions(actions);
  }, [
    t,
    isPrivacy,
    currentFolderId,
    isAccountsPage,
    isSettingsPage,
    enablePlugins,
    mainButtonItemsList,
    isRoomsFolder,
    isOwner,
    isAdmin,

    onCreate,
    onCreateRoom,
    onInvite,
    onInviteAgain,
    onShowSelectFileDialog,
    onUploadFileClick,
    onUploadFolderClick,
    isMobileArticle,
  ]);

  const mainButtonText = t("Common:Actions");

  const isDisabled = isFrame
    ? disableActionButton
    : isSettingsPage
      ? isSettingsPage
      : isAccountsPage
        ? !isAccountsPage
        : !security?.Create;

  const isProfile = location.pathname.includes("/profile");

  let mainButtonVisible = true;

  if (currentDeviceType === DeviceType.mobile) {
    mainButtonVisible =
      moveToPanelVisible ||
      restorePanelVisible ||
      copyPanelVisible ||
      selectFileDialogVisible ||
      versionHistoryPanelVisible
        ? false
        : true;
  }

  if (showArticleLoader)
    return isMobileArticle ? null : <ArticleButtonLoader height="32px" />;

  return (
    <>
      {isMobileArticle ? (
        <>
          {!isProfile && (security?.Create || isAccountsPage) && (
            <MobileView
              t={t}
              titleProp={t("Upload")}
              actionOptions={actions}
              buttonOptions={!isAccountsPage && uploadActions}
              withoutButton={isRoomsFolder || isAccountsPage}
              withMenu={!isRoomsFolder}
              mainButtonMobileVisible={
                mainButtonMobileVisible && mainButtonVisible
              }
              onMainButtonClick={onCreateRoom}
            />
          )}
        </>
      ) : isRoomsFolder ? (
        <StyledButton
          className="create-room-button"
          id="rooms-shared_create-room-button"
          label={t("Files:NewRoom")}
          onClick={onCreateRoom}
          $currentColorScheme={currentColorScheme}
          isDisabled={isDisabled}
          size="small"
          primary
          scale
          title={t("Files:NewRoom")}
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
        className="custom-file-input"
        multiple
        type="file"
        onChange={onFileChange}
        onClick={onInputClick}
        ref={inputFilesElement}
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
    currentTariffStatusStore,
  }) => {
    const { showArticleLoader } = clientLoadingStore;
    const { mainButtonMobileVisible } = filesStore;
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
      setInviteUsersWarningDialogVisible,
      copyPanelVisible,
      moveToPanelVisible,
      restorePanelVisible,
      selectFileDialogVisible,
    } = dialogsStore;

    const { enablePlugins, currentColorScheme, currentDeviceType } =
      settingsStore;
    const { isVisible: versionHistoryPanelVisible } = versionHistoryStore;

    const security = selectedFolderStore.security;

    const currentFolderId = selectedFolderStore.id;

    const { isAdmin, isOwner } = userStore.user;
    const { isGracePeriod } = currentTariffStatusStore;

    const { setOformFromFolderId, oformsFilter } = oformsStore;
    const { mainButtonItemsList } = pluginStore;

    const { frameConfig, isFrame } = settingsStore;

    return {
      isGracePeriod,
      setInviteUsersWarningDialogVisible,
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

      setOformFromFolderId,
      oformsFilter,

      enablePlugins,
      mainButtonItemsList,

      currentColorScheme,

      isAdmin,
      isOwner,

      mainButtonMobileVisible,
      moveToPanelVisible,
      restorePanelVisible,
      copyPanelVisible,
      versionHistoryPanelVisible,
      security,
      currentDeviceType,

      isFrame,
      disableActionButton: frameConfig?.disableActionButton,
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
