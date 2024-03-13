﻿import FolderLockedReactSvgUrl from "PUBLIC_DIR/images/folder.locked.react.svg?url";
import ActionsDocumentsReactSvgUrl from "PUBLIC_DIR/images/actions.documents.react.svg?url";
import SpreadsheetReactSvgUrl from "PUBLIC_DIR/images/spreadsheet.react.svg?url";
import ActionsPresentationReactSvgUrl from "PUBLIC_DIR/images/actions.presentation.react.svg?url";
import FormReactSvgUrl from "PUBLIC_DIR/images/access.form.react.svg?url";
import FormBlankReactSvgUrl from "PUBLIC_DIR/images/form.blank.react.svg?url";
import FormFileReactSvgUrl from "PUBLIC_DIR/images/form.file.react.svg?url";
import FormGalleryReactSvgUrl from "PUBLIC_DIR/images/form.gallery.react.svg?url";
import CatalogFolderReactSvgUrl from "PUBLIC_DIR/images/catalog.folder.react.svg?url";
import ActionsUploadReactSvgUrl from "PUBLIC_DIR/images/actions.upload.react.svg?url";
import ClearTrashReactSvgUrl from "PUBLIC_DIR/images/clear.trash.react.svg?url";
import ReconnectSvgUrl from "PUBLIC_DIR/images/reconnect.svg?url";
import SettingsReactSvgUrl from "PUBLIC_DIR/images/catalog.settings.react.svg?url";
import CopyToReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";
import DownloadReactSvgUrl from "PUBLIC_DIR/images/download.react.svg?url";
import MoveReactSvgUrl from "PUBLIC_DIR/images/move.react.svg?url";
import RenameReactSvgUrl from "PUBLIC_DIR/images/rename.react.svg?url";
import ShareReactSvgUrl from "PUBLIC_DIR/images/share.react.svg?url";
import InvitationLinkReactSvgUrl from "PUBLIC_DIR/images/invitation.link.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import PersonReactSvgUrl from "PUBLIC_DIR/images/person.react.svg?url";
import PersonDefaultReactSvgUrl from "PUBLIC_DIR/images/person.default.react.svg?url";
import GroupReactSvgUrl from "PUBLIC_DIR/images/group.react.svg?url";
import RoomArchiveSvgUrl from "PUBLIC_DIR/images/room.archive.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/catalog.trash.react.svg?url";
import PersonAdminReactSvgUrl from "PUBLIC_DIR/images/person.admin.react.svg?url";
import PersonManagerReactSvgUrl from "PUBLIC_DIR/images/person.manager.react.svg?url";
import PersonUserReactSvgUrl from "PUBLIC_DIR/images/person.user.react.svg?url";
import InviteAgainReactSvgUrl from "PUBLIC_DIR/images/invite.again.react.svg?url";
import PublicRoomIconUrl from "PUBLIC_DIR/images/public-room.react.svg?url";
import PluginMoreReactSvgUrl from "PUBLIC_DIR/images/plugin.more.react.svg?url";
import LeaveRoomSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";
import CatalogRoomsReactSvgUrl from "PUBLIC_DIR/images/catalog.rooms.react.svg?url";
import TabletLinkReactSvgUrl from "PUBLIC_DIR/images/tablet-link.reat.svg?url";

import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { isMobile, isTablet } from "react-device-detect";
import styled, { css } from "styled-components";
import copy from "copy-to-clipboard";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import { SectionHeaderSkeleton } from "@docspace/shared/skeletons/sections";
import Navigation from "@docspace/shared/components/navigation";
import FilesFilter from "@docspace/shared/api/files/filter";
import { resendInvitesAgain } from "@docspace/shared/api/people";

import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { tablet, mobile, Consumer } from "@docspace/shared/utils";

import { toastr } from "@docspace/shared/components/toast";
import { TableGroupMenu } from "@docspace/shared/components/table";
import {
  Events,
  EmployeeType,
  RoomsType,
  DeviceType,
  FolderType,
  ShareAccessRights,
} from "@docspace/shared/enums";

import { CategoryType } from "SRC_DIR/helpers/constants";
import {
  getCategoryTypeByFolderType,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";
import { getLogoFromPath } from "@docspace/shared/utils";
import TariffBar from "SRC_DIR/components/TariffBar";

const StyledContainer = styled.div`
  width: 100%;
  min-height: 33px;

  .table-container_group-menu {
    ${(props) =>
      props.theme.interfaceDirection === "rtl"
        ? css`
            margin: 0 -20px 0 0;
          `
        : css`
            margin: 0 0 0 -20px;
          `}
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

    width: calc(100% + 40px);
    height: 68px;

    @media ${tablet} {
      height: 61px;
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin: 0 -16px 0 0;
            `
          : css`
              margin: 0 0 0 -16px;
            `}
      width: calc(100% + 32px);
    }

    @media ${mobile} {
      height: 52px !important;

      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin: 0 -16px 0 0;
            `
          : css`
              margin: 0 0 0 -16px;
            `}
      width: calc(100% + 32px);
    }
  }

  .header-container {
    min-height: 33px;
    align-items: center;

    ${(props) =>
      props.hideContextMenuInsideArchiveRoom &&
      `.option-button {
      display: none;}`}

    @media ${tablet} {
      height: 61px;
    }

    @media ${mobile} {
      height: 53px;
    }

    .navigation_button {
      display: block;
      margin: 0 16px;
      overflow: visible;

      @media ${tablet} {
        display: ${({ isInfoPanelVisible }) =>
          isInfoPanelVisible ? "none" : "block"};
      }

      @media ${mobile} {
        display: none;
      }
    }
  }
`;

const SectionHeaderContent = (props) => {
  const {
    currentFolderId,
    currentGroup,
    insideGroupTempTitle,
    getGroupContextOptions,
    setSelectFileDialogVisible,
    t,
    isPrivacyFolder,
    isRoomsFolder,
    enablePlugins,
    mainButtonItemsList,
    security,
    setIsFolderActions,
    setBufferSelection,
    setMoveToPanelVisible,
    tReady,
    isInfoPanelVisible,
    isRootFolder,
    title,
    showHeaderLoader,
    isDesktop,
    isTabletView,
    personal,
    navigationPath,
    getHeaderMenu,
    isRecycleBinFolder,
    isArchiveFolder,
    isEmptyFilesList,
    isHeaderVisible,
    isHeaderChecked,
    isHeaderIndeterminate,
    showText,
    oformsFilter,

    isEmptyArchive,

    isRoom,
    isGroupMenuBlocked,

    onClickBack,
    hideContextMenuInsideArchiveRoom,
    activeFiles,
    activeFolders,
    selectedFolder,
    setCopyPanelVisible,
    setSharingPanelVisible,
    deleteAction,
    confirmDelete,
    setDeleteDialogVisible,
    isThirdPartySelection,

    getFolderInfo,

    setEmptyTrashDialogVisible,
    setRestoreAllPanelVisible,
    isGracePeriod,
    setInviteUsersWarningDialogVisible,
    setArchiveAction,
    setRestoreAllArchive,
    setRestoreRoomDialogVisible,
    setArchiveDialogVisible,
    onCopyLink,

    setSelected,
    cbMenuItems,
    getCheckboxItemLabel,
    getCheckboxItemId,
    setSelectedNode,
    setIsLoading,

    moveToRoomsPage,
    setIsInfoPanelVisible,

    getAccountsHeaderMenu,
    isAccountsHeaderVisible,
    isGroupsHeaderVisible,
    isGroupsHeaderIndeterminate,
    isGroupsHeaderChecked,
    isAccountsHeaderIndeterminate,
    isAccountsHeaderChecked,
    accountsCbMenuItems,
    getAccountsMenuItemId,
    getAccountsCheckboxItemLabel,
    setAccountsSelected,
    setGroupsSelected,
    isOwner,
    isCollaborator,
    setInvitePanelOptions,
    isEmptyPage,

    isLoading,

    emptyTrashInProgress,
    categoryType,
    isPublicRoom,
    theme,
    whiteLabelLogoUrls,
    downloadAction,
    isPublicRoomType,
    isCustomRoomType,
    primaryLink,
    getPrimaryLink,
    setExternalLink,
    moveToPublicRoom,
    currentDeviceType,
    isFrame,
    showTitle,
    hideInfoPanel,
    onClickArchive,
    setLeaveRoomDialogVisible,
    inRoom,
    onClickCreateRoom,
    onCreateAndCopySharedLink,
    showNavigationButton,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();
  const { groupId } = useParams();

  const isInsideGroup = !!groupId;

  const isAccountsPage = location.pathname.includes("/accounts");
  const isGroupsPage =
    location.pathname.includes("/accounts/groups") && !isInsideGroup;

  const isSettingsPage = location.pathname.includes("/settings");

  const onCreate = (format) => {
    const event = new Event(Events.CREATE);

    const payload = {
      extension: format,
      id: -1,
    };

    event.payload = payload;

    window.dispatchEvent(event);
  };

  const onCreateRoom = () => {
    if (isGracePeriod) {
      setInviteUsersWarningDialogVisible(true);
      return;
    }

    const event = new Event(Events.ROOM_CREATE);
    window.dispatchEvent(event);
  };

  const createDocument = () => onCreate("docx");

  const createSpreadsheet = () => onCreate("xlsx");

  const createPresentation = () => onCreate("pptx");

  const createForm = () => onCreate("docxf");

  const createFormFromFile = () => {
    setSelectFileDialogVisible(true);
  };

  const onShowGallery = () => {
    const initOformFilter = (
      oformsFilter || oformsFilter.getDefault()
    ).toUrlParams();
    navigate(`/form-gallery/${currentFolderId}/filter?${initOformFilter}`);
  };

  const createFolder = () => onCreate();

  // TODO: add privacy room check for files
  const onUploadAction = (type) => {
    const element =
      type === "file"
        ? document.getElementById("customFileInput")
        : document.getElementById("customFolderInput");

    element?.click();
  };

  const getContextOptionsPlus = () => {
    if (isAccountsPage) {
      return [
        {
          id: "actions_invite_user",
          className: "main-button_drop-down",
          icon: PersonUserReactSvgUrl,
          label: t("Common:Invite"),
          key: "new-user",
          items: [
            isOwner && {
              id: "accounts-add_administrator",
              className: "main-button_drop-down",
              icon: PersonAdminReactSvgUrl,
              label: t("Common:DocSpaceAdmin"),
              onClick: onInvite,
              "data-type": EmployeeType.Admin,
              key: "administrator",
            },
            {
              id: "accounts-add_manager",
              className: "main-button_drop-down",
              icon: PersonManagerReactSvgUrl,
              label: t("Common:RoomAdmin"),
              onClick: onInvite,
              "data-type": EmployeeType.User,
              key: "manager",
            },
            {
              id: "accounts-add_collaborator",
              className: "main-button_drop-down",
              icon: PersonDefaultReactSvgUrl,
              label: t("Common:PowerUser"),
              onClick: onInvite,
              "data-type": EmployeeType.Collaborator,
              key: "collaborator",
            },
            {
              id: "accounts-add_user",
              className: "main-button_drop-down",
              icon: PersonDefaultReactSvgUrl,
              label: t("Common:User"),
              onClick: onInvite,
              "data-type": EmployeeType.Guest,
              key: "user",
            },
            {
              key: "separator",
              isSeparator: true,
            },
            {
              id: "accounts-add_invite-again",
              className: "main-button_drop-down",
              icon: InviteAgainReactSvgUrl,
              label: t("People:LblInviteAgain"),
              onClick: onInviteAgain,
              "data-action": "invite-again",
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
      ];
    }

    const options = isRoomsFolder
      ? [
          {
            key: "new-room",
            label: t("NewRoom"),
            onClick: onCreateRoom,
            icon: FolderLockedReactSvgUrl,
          },
        ]
      : [
          {
            id: "personal_new-documnet",
            key: "new-document",
            label: t("Common:NewDocument"),
            onClick: createDocument,
            icon: ActionsDocumentsReactSvgUrl,
          },
          {
            id: "personal_new-spreadsheet",
            key: "new-spreadsheet",
            label: t("Common:NewSpreadsheet"),
            onClick: createSpreadsheet,
            icon: SpreadsheetReactSvgUrl,
          },
          {
            id: "personal_new-presentation",
            key: "new-presentation",
            label: t("Common:NewPresentation"),
            onClick: createPresentation,
            icon: ActionsPresentationReactSvgUrl,
          },
          {
            id: "personal_form-template",
            icon: FormReactSvgUrl,
            label: t("Translations:NewForm"),
            key: "new-form-base",
            items: [
              {
                id: "personal_template_black",
                key: "new-form",
                label: t("Translations:SubNewForm"),
                icon: FormBlankReactSvgUrl,
                onClick: createForm,
              },
              {
                id: "personal_template_new-form-file",
                key: "new-form-file",
                label: t("Translations:SubNewFormFile"),
                icon: FormFileReactSvgUrl,
                onClick: createFormFromFile,
                disabled: isPrivacyFolder,
              },
              {
                id: "personal_template_oforms-gallery",
                key: "oforms-gallery",
                label: t("Common:OFORMsGallery"),
                icon: FormGalleryReactSvgUrl,
                onClick: onShowGallery,
                disabled: isPrivacyFolder || (isMobile && isTablet),
              },
            ],
          },
          {
            id: "personal_new-folder",
            key: "new-folder",
            label: t("Common:NewFolder"),
            onClick: createFolder,
            icon: CatalogFolderReactSvgUrl,
          },
          { key: "separator", isSeparator: true },
          {
            key: "upload-files",
            label: t("Article:UploadFiles"),
            onClick: () => onUploadAction("file"),
            icon: ActionsUploadReactSvgUrl,
          },
          {
            key: "upload-folder",
            label: t("Article:UploadFolder"),
            onClick: () => onUploadAction("folder"),
            icon: ActionsUploadReactSvgUrl,
          },
        ];

    if (mainButtonItemsList && enablePlugins) {
      const pluginItems = [];

      mainButtonItemsList.forEach((option) => {
        pluginItems.push({
          key: option.key,
          ...option.value,
        });
      });

      options.splice(5, 0, {
        id: "actions_more-plugins",
        className: "main-button_drop-down",
        icon: PluginMoreReactSvgUrl,
        label: t("Common:More"),
        disabled: false,
        key: "more-plugins",
        items: pluginItems,
      });
    }

    return options;
  };

  const createLinkForPortalUsers = () => {
    copy(
      `${window.location.origin}/filter?folder=${currentFolderId}`, //TODO: Change url by category
    );

    toastr.success(t("Translations:LinkCopySuccess"));
  };

  const onMoveAction = () => {
    setIsFolderActions(true);
    setBufferSelection(selectedFolder);
    return setMoveToPanelVisible(true);
  };

  const onCopyAction = () => {
    setIsFolderActions(true);
    setBufferSelection(selectedFolder);
    return setCopyPanelVisible(true);
  };

  const onDownloadAction = () => {
    downloadAction(t("Translations:ArchivingData"), selectedFolder, [
      currentFolderId,
    ]).catch((err) => toastr.error(err));
  };

  const onClickArchiveAction = (e) => {
    setBufferSelection(selectedFolder);
    onClickArchive(e);
  };

  const onLeaveRoom = () => {
    setLeaveRoomDialogVisible(true);
  };

  const renameAction = () => {
    const event = new Event(Events.RENAME);

    event.item = selectedFolder;

    window.dispatchEvent(event);
  };

  const onOpenSharingPanel = () => {
    setBufferSelection(selectedFolder);
    setIsFolderActions(true);
    return setSharingPanelVisible(true);
  };

  const onDeleteAction = () => {
    setIsFolderActions(true);

    if (confirmDelete || isThirdPartySelection) {
      getFolderInfo(currentFolderId).then((data) => {
        setBufferSelection(data);
        setDeleteDialogVisible(true);
      });
    } else {
      const translations = {
        deleteOperation: t("Translations:DeleteOperation"),
        deleteFromTrash: t("Translations:DeleteFromTrash"),
        deleteSelectedElem: t("Translations:DeleteSelectedElem"),
        FolderRemoved: t("Files:FolderRemoved"),
      };

      deleteAction(translations, [selectedFolder], true).catch((err) =>
        toastr.error(err),
      );
    }
  };

  const onEmptyTrashAction = () => {
    const isExistActiveItems = [...activeFiles, ...activeFolders].length > 0;

    if (isExistActiveItems || emptyTrashInProgress) return;

    setEmptyTrashDialogVisible(true);
  };

  const onRestoreAllAction = () => {
    setRestoreAllPanelVisible;
    const isExistActiveItems = [...activeFiles, ...activeFolders].length > 0;

    if (isExistActiveItems) return;

    setRestoreAllPanelVisible(true);
  };

  const onRestoreAllArchiveAction = () => {
    const isExistActiveItems = [...activeFiles, ...activeFolders].length > 0;

    if (isExistActiveItems) return;

    if (isGracePeriod) {
      setInviteUsersWarningDialogVisible(true);
      return;
    }

    setRestoreAllArchive(true);
    setRestoreRoomDialogVisible(true);
  };

  const onShowInfo = () => {
    const { setIsInfoPanelVisible } = props;
    setIsInfoPanelVisible(true);
  };

  const onToggleInfoPanel = () => {
    setIsInfoPanelVisible(!isInfoPanelVisible);
  };

  const onCopyLinkAction = () => {
    onCopyLink && onCopyLink({ ...selectedFolder, isFolder: true }, t);
  };

  const onDownloadAll = () => {
    onDownloadAction();
  };

  const onShareRoom = () => {
    copy(window.location.href);
    toastr.success(t("Translations:LinkCopySuccess"));
  };

  const getContextOptionsFolder = () => {
    const {
      t,
      isRoom,
      isRecycleBinFolder,
      isArchiveFolder,
      isPersonalRoom,

      selectedFolder,

      onClickEditRoom,
      onClickInviteUsers,
      onShowInfoPanel,
      onClickReconnectStorage,

      canRestoreAll,
      canDeleteAll,

      security,
      haveLinksRight,
      isPublicRoomType,
      isPublicRoom,
    } = props;

    if (isPublicRoom) {
      return [
        {
          key: "public-room_share",
          label: t("Files:CopyLink"),
          icon: TabletLinkReactSvgUrl,
          onClick: onShareRoom,
        },
        security?.Download && {
          key: "public-room_edit",
          label: t("Common:Download"),
          icon: DownloadReactSvgUrl,
          onClick: onDownloadAll,
        },
      ];
    }

    const isDisabled = isRecycleBinFolder || isRoom;

    if (isArchiveFolder) {
      return [
        {
          id: "header_option_empty-archive",
          key: "empty-archive",
          label: t("ArchiveAction"),
          onClick: onEmptyTrashAction,
          disabled: !canDeleteAll,
          icon: ClearTrashReactSvgUrl,
        },
        {
          id: "header_option_restore-all",
          key: "restore-all",
          label: t("RestoreAll"),
          onClick: onRestoreAllArchiveAction,
          disabled: !canRestoreAll,
          icon: MoveReactSvgUrl,
        },
      ];
    }

    if (isInsideGroup) {
      return getGroupContextOptions(t, currentGroup, false, true);
    }

    return [
      {
        id: "header_option_sharing-settings",
        key: "sharing-settings",
        label: t("SharingPanel:SharingSettingsTitle"),
        onClick: onOpenSharingPanel,
        disabled: true,
        icon: ShareReactSvgUrl,
      },
      {
        id: "header_option_link-portal-users",
        key: "link-portal-users",
        label: t("LinkForPortalUsers"),
        onClick: createLinkForPortalUsers,
        disabled: true,
        icon: InvitationLinkReactSvgUrl,
      },
      {
        id: "header_option_link-for-room-members",
        key: "link-for-room-members",
        label: t("Files:CopyLink"),
        onClick: onCopyLinkAction,
        disabled:
          isRecycleBinFolder ||
          isPersonalRoom ||
          ((isPublicRoomType || isCustomRoomType) && haveLinksRight),
        icon: InvitationLinkReactSvgUrl,
      },
      {
        id: "header_option_empty-trash",
        key: "empty-trash",
        label: t("RecycleBinAction"),
        onClick: onEmptyTrashAction,
        disabled: !isRecycleBinFolder,
        icon: ClearTrashReactSvgUrl,
      },
      {
        id: "header_option_restore-all",
        key: "restore-all",
        label: t("RestoreAll"),
        onClick: onRestoreAllAction,
        disabled: !isRecycleBinFolder,
        icon: MoveReactSvgUrl,
      },
      {
        id: "header_option_show-info",
        key: "show-info",
        label: t("Common:Info"),
        onClick: onShowInfo,
        disabled: isDisabled,
        icon: InfoOutlineReactSvgUrl,
      },
      {
        id: "header_option_reconnect-storage",
        key: "reconnect-storage",
        label: t("Common:ReconnectStorage"),
        icon: ReconnectSvgUrl,
        onClick: () => onClickReconnectStorage(selectedFolder, t),
        disabled: !selectedFolder.providerKey || !isRoom,
      },
      {
        id: "header_option_edit-room",
        key: "edit-room",
        label: t("EditRoom"),
        icon: SettingsReactSvgUrl,
        onClick: () => onClickEditRoom(selectedFolder),
        disabled: !isRoom || !security?.EditRoom,
      },
      {
        id: "header_option_copy-external-link",
        key: "copy-external-link",
        label: t("Files:CopySharedLink"),
        icon: CopyToReactSvgUrl,
        onClick: async () => {
          if (primaryLink) {
            copy(primaryLink.sharedTo.shareLink);
            toastr.success(t("Translations:LinkCopySuccess"));
          } else {
            const link = await getPrimaryLink(currentFolderId);
            if (link) {
              copy(link.sharedTo.shareLink);
              toastr.success(t("Files:LinkSuccessfullyCreatedAndCopied"));
              setExternalLink(link);
            }
          }
        },
        disabled: (!isPublicRoomType && !isCustomRoomType) || !haveLinksRight,
      },
      {
        id: "header_option_invite-users-to-room",
        key: "invite-users-to-room",
        label: t("Common:InviteUsers"),
        icon: PersonReactSvgUrl,
        onClick: () =>
          onClickInviteUsers(selectedFolder.id, selectedFolder.roomType),
        disabled: !isRoom || !security?.EditAccess,
      },
      {
        id: "header_option_room-info",
        key: "room-info",
        label: t("Common:Info"),
        icon: InfoOutlineReactSvgUrl,
        onClick: onToggleInfoPanel,
        disabled: !isRoom,
      },
      {
        id: "header_option_separator-2",
        key: "separator-2",
        isSeparator: true,
        disabled: isRecycleBinFolder,
      },
      {
        id: "header_option_archive-room",
        key: "archive-room",
        label: t("MoveToArchive"),
        icon: RoomArchiveSvgUrl,
        onClick: onClickArchiveAction,
        disabled: !isRoom || !security?.Move,
        "data-action": "archive",
        action: "archive",
      },
      {
        id: "option_create-room",
        label: t("Files:CreateRoom"),
        key: "create-room",
        icon: CatalogRoomsReactSvgUrl,
        onClick: () => {
          onClickCreateRoom({ title: selectedFolder.title, isFolder: true });
        },
        disabled:
          isCollaborator || selectedFolder.rootFolderType !== FolderType.USER,
      },
      {
        id: "option_leave-room",
        key: "leave-room",
        label: t("LeaveTheRoom"),
        icon: LeaveRoomSvgUrl,
        onClick: onLeaveRoom,
        disabled: isArchiveFolder || !inRoom || isPublicRoom,
      },
      {
        id: "header_option_download",
        key: "download",
        label: t("Common:Download"),
        onClick: onDownloadAction,
        disabled: !security?.Download,
        icon: DownloadReactSvgUrl,
      },
      {
        id: "header_option_move-to",
        key: "move-to",
        label: t("Common:MoveTo"),
        onClick: onMoveAction,
        disabled: isDisabled || !security?.MoveTo,
        icon: MoveReactSvgUrl,
      },
      {
        id: "header_option_copy",
        key: "copy",
        label: t("Common:Copy"),
        onClick: onCopyAction,
        disabled: isDisabled || !security?.CopyTo,
        icon: CopyReactSvgUrl,
      },
      {
        id: "header_option_rename",
        key: "rename",
        label: t("Common:Rename"),
        onClick: renameAction,
        disabled: isDisabled || !security?.Rename,
        icon: RenameReactSvgUrl,
      },
      {
        id: "header_option_separator-3",
        key: "separator-3",
        isSeparator: true,
        disabled: isDisabled || !security?.Delete,
      },
      {
        id: "header_option_delete",
        key: "delete",
        label: t("Common:Delete"),
        onClick: onDeleteAction,
        disabled: isDisabled || !security?.Delete,
        icon: CatalogTrashReactSvgUrl,
      },
    ];
  };

  const onSelect = (e) => {
    const key = e.currentTarget.dataset.key;

    isAccountsPage ? setAccountsSelected(key) : setSelected(key);
  };

  const onClose = () => {
    setSelected("close");
  };

  const getMenuItems = () => {
    const checkboxOptions = isAccountsPage ? (
      <>
        {accountsCbMenuItems.map((key) => {
          const label = getAccountsCheckboxItemLabel(t, key);
          const id = getAccountsMenuItemId(key);
          return (
            <DropDownItem
              id={id}
              key={key}
              label={label}
              data-key={key}
              onClick={onSelect}
            />
          );
        })}
      </>
    ) : (
      <>
        {cbMenuItems.map((key) => {
          const label = getCheckboxItemLabel(t, key);
          const id = getCheckboxItemId(key);
          return (
            <DropDownItem
              id={id}
              key={key}
              label={label}
              data-key={key}
              onClick={onSelect}
            />
          );
        })}
      </>
    );

    return checkboxOptions;
  };

  const onChange = (checked) => {
    isAccountsPage
      ? !isGroupsPage
        ? setAccountsSelected(checked ? "all" : "none")
        : setGroupsSelected(checked ? "all" : "none")
      : setSelected(checked ? "all" : "none");
  };

  const onClickFolder = (id, isRootRoom) => {
    if (isPublicRoom) {
      return moveToPublicRoom(id);
    }

    if (isRootRoom) {
      return moveToRoomsPage();
    }

    setSelectedNode(id);

    const rootFolderType = selectedFolder.rootFolderType;

    const path = getCategoryUrl(
      getCategoryTypeByFolderType(rootFolderType, id),
      id,
    );

    const filter = FilesFilter.getDefault();

    filter.folder = id;

    const itemIdx = selectedFolder.navigationPath.findIndex((v) => v.id === id);

    const state = {
      title: selectedFolder.navigationPath[itemIdx]?.title || "",
      isRoot: itemIdx === selectedFolder.navigationPath.length - 1,
      isRoom: selectedFolder.navigationPath[itemIdx]?.isRoom || false,
      rootFolderType: rootFolderType,
      isPublicRoomType: selectedFolder.navigationPath[itemIdx]?.isRoom
        ? selectedFolder.navigationPath[itemIdx]?.roomType ===
          RoomsType.PublicRoom
        : false,
      rootRoomTitle:
        selectedFolder.navigationPath.length > 1 &&
        selectedFolder.navigationPath[1]?.isRoom
          ? selectedFolder.navigationPath[1].title
          : "",
    };

    setSelected("none");
    setIsLoading(true);

    window.DocSpace.navigate(`${path}?${filter.toUrlParams()}`, { state });
  };

  const onInvite = (e) => {
    const type = e.item["data-type"];

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
  };

  const onInviteAgain = React.useCallback(() => {
    resendInvitesAgain()
      .then(() =>
        toastr.success(t("PeopleTranslations:SuccessSentMultipleInvitatios")),
      )
      .catch((err) => toastr.error(err));
  }, [resendInvitesAgain]);

  const onNavigationButtonClick = () => {
    onCreateAndCopySharedLink(selectedFolder, t);
  };

  const onCreateGroup = React.useCallback(() => {
    const event = new Event(Events.GROUP_CREATE);
    window.dispatchEvent(event);
  }, []);

  const headerMenu = isAccountsPage
    ? getAccountsHeaderMenu(t, isGroupsPage)
    : getHeaderMenu(t);

  const menuItems = getMenuItems();

  let tableGroupMenuVisible = headerMenu.length;
  const tableGroupMenuProps = {
    checkboxOptions: menuItems,
    onChange,
    headerMenu,
    isInfoPanelVisible,
    toggleInfoPanel: onToggleInfoPanel,
    isMobileView: currentDeviceType === DeviceType.mobile,
  };

  if (isAccountsPage) {
    tableGroupMenuVisible =
      (!isGroupsPage ? isAccountsHeaderVisible : isGroupsHeaderVisible) &&
      tableGroupMenuVisible &&
      headerMenu.some((x) => !x.disabled);
    tableGroupMenuProps.isChecked = !isGroupsPage
      ? isAccountsHeaderChecked
      : isGroupsHeaderChecked;
    tableGroupMenuProps.isIndeterminate = !isGroupsPage
      ? isAccountsHeaderIndeterminate
      : isGroupsHeaderIndeterminate;
    tableGroupMenuProps.withoutInfoPanelToggler = false;
  } else {
    tableGroupMenuVisible = isHeaderVisible && tableGroupMenuVisible;
    tableGroupMenuProps.isChecked = isHeaderChecked;
    tableGroupMenuProps.isIndeterminate = isHeaderIndeterminate;
    tableGroupMenuProps.isBlocked = isGroupMenuBlocked;
    tableGroupMenuProps.withoutInfoPanelToggler = isPublicRoom;
  }

  const stateTitle = location?.state?.title;
  const stateCanCreate = location?.state?.canCreate;
  const stateIsRoot = location?.state?.isRoot;
  const stateIsRoom = location?.state?.isRoom;
  const stateRootRoomTitle = location?.state?.rootRoomTitle;
  const stateIsPublicRoomType = location?.state?.isPublicRoomType;

  const isRoot =
    isLoading && typeof stateIsRoot === "boolean"
      ? stateIsRoot
      : isRootFolder || isAccountsPage || isSettingsPage;

  const getInsideGroupTitle = () => {
    return isLoading || !currentGroup?.name
      ? insideGroupTempTitle
      : currentGroup?.name;
  };

  const currentTitle = isSettingsPage
    ? t("Common:Settings")
    : isAccountsPage
      ? isInsideGroup
        ? getInsideGroupTitle()
        : t("Common:Accounts")
      : isLoading && stateTitle
        ? stateTitle
        : title;

  const currentCanCreate =
    isLoading && location?.state?.hasOwnProperty("canCreate")
      ? stateCanCreate
      : security?.Create;

  const currentRootRoomTitle =
    isLoading && stateRootRoomTitle
      ? stateRootRoomTitle
      : navigationPath?.length > 1 &&
        navigationPath[navigationPath?.length - 2].title;

  const accountsNavigationPath = isInsideGroup && [
    {
      id: 0,
      title: t("Common:Accounts"),
      isRoom: false,
      isRootRoom: true,
    },
  ];

  const currentIsPublicRoomType =
    isLoading && typeof stateIsPublicRoomType === "boolean"
      ? stateIsPublicRoomType
      : isPublicRoomType;

  const isCurrentRoom =
    isLoading && typeof stateIsRoom === "boolean" ? stateIsRoom : isRoom;

  if (showHeaderLoader) return <SectionHeaderSkeleton />;

  const insideTheRoom =
    (categoryType === CategoryType.SharedRoom ||
      categoryType === CategoryType.Archive) &&
    !isCurrentRoom;

  const logo = !theme.isBase
    ? getLogoFromPath(whiteLabelLogoUrls[0]?.path?.dark)
    : getLogoFromPath(whiteLabelLogoUrls[0]?.path?.light);
  const burgerLogo = !theme.isBase
    ? getLogoFromPath(whiteLabelLogoUrls[5]?.path?.dark)
    : getLogoFromPath(whiteLabelLogoUrls[5]?.path?.light);

  const navigationButtonLabel = showNavigationButton
    ? t("Files:ShareRoom")
    : null;

  return (
    <Consumer key="header">
      {(context) => (
        <StyledContainer
          isRecycleBinFolder={isRecycleBinFolder}
          hideContextMenuInsideArchiveRoom={hideContextMenuInsideArchiveRoom}
        >
          {tableGroupMenuVisible ? (
            <TableGroupMenu {...tableGroupMenuProps} withComboBox />
          ) : (
            <div className="header-container">
              <Navigation
                sectionWidth={context.sectionWidth}
                showText={showText}
                isRootFolder={isRoot && !isInsideGroup}
                canCreate={
                  (currentCanCreate || isAccountsPage) &&
                  !isSettingsPage &&
                  !isPublicRoom
                }
                rootRoomTitle={currentRootRoomTitle}
                title={currentTitle}
                isDesktop={isDesktop}
                isTabletView={isTabletView}
                personal={personal}
                tReady={tReady}
                menuItems={menuItems}
                navigationItems={
                  !isInsideGroup ? navigationPath : accountsNavigationPath
                }
                getContextOptionsPlus={getContextOptionsPlus}
                getContextOptionsFolder={getContextOptionsFolder}
                onClose={onClose}
                onClickFolder={onClickFolder}
                isTrashFolder={isRecycleBinFolder}
                isEmptyFilesList={
                  isArchiveFolder ? isEmptyArchive : isEmptyFilesList
                }
                clearTrash={onEmptyTrashAction}
                onBackToParentFolder={onClickBack}
                toggleInfoPanel={onToggleInfoPanel}
                isInfoPanelVisible={isInfoPanelVisible}
                titles={{
                  trash: t("EmptyRecycleBin"),
                  trashWarning: t("TrashErasureWarning"),
                  actions: isRoomsFolder
                    ? t("Files:NewRoom")
                    : t("Common:Actions"),
                  contextMenu: t("Translations:TitleShowFolderActions"),
                  infoPanel: t("Common:InfoPanel"),
                }}
                withMenu={!isRoomsFolder}
                onPlusClick={onCreateRoom}
                isEmptyPage={isEmptyPage}
                isRoom={isCurrentRoom || isAccountsPage}
                hideInfoPanel={hideInfoPanel || isSettingsPage || isPublicRoom}
                withLogo={isPublicRoom && logo}
                burgerLogo={isPublicRoom && burgerLogo}
                isPublicRoom={isPublicRoom}
                titleIcon={
                  currentIsPublicRoomType && !isPublicRoom && PublicRoomIconUrl
                }
                showRootFolderTitle={insideTheRoom || isInsideGroup}
                currentDeviceType={currentDeviceType}
                isFrame={isFrame}
                showTitle={isFrame ? showTitle : true}
                navigationButtonLabel={navigationButtonLabel}
                onNavigationButtonClick={onNavigationButtonClick}
                tariffBar={<TariffBar />}
              />
            </div>
          )}
        </StyledContainer>
      )}
    </Consumer>
  );
};

export default inject(
  ({
    filesStore,
    peopleStore,
    dialogsStore,
    selectedFolderStore,
    treeFoldersStore,
    filesActionsStore,
    filesSettingsStore,
    clientLoadingStore,
    publicRoomStore,
    contextOptionsStore,
    oformsStore,
    pluginStore,
    infoPanelStore,
    userStore,
    currentTariffStatusStore,
    settingsStore,
  }) => {
    const isOwner = userStore.user?.isOwner;
    const isAdmin = userStore.user?.isAdmin;
    const isCollaborator = userStore.user?.isCollaborator;

    const {
      setSelected,

      isHeaderVisible,
      isHeaderIndeterminate,
      isHeaderChecked,
      isThirdPartySelection,
      cbMenuItems,
      getCheckboxItemLabel,
      getCheckboxItemId,
      isEmptyFilesList,
      getFolderInfo,
      setBufferSelection,

      activeFiles,
      activeFolders,

      roomsForRestore,
      roomsForDelete,

      isEmptyPage,

      clearFiles,
      categoryType,
      getPrimaryLink,
    } = filesStore;

    const {
      setIsSectionFilterLoading,
      showHeaderLoader,

      isLoading,
    } = clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionFilterLoading(param);
    };

    const { mainButtonItemsList } = pluginStore;

    const {
      setSharingPanelVisible,
      setMoveToPanelVisible,
      setCopyPanelVisible,
      setDeleteDialogVisible,
      setEmptyTrashDialogVisible,
      setSelectFileDialogVisible,
      setIsFolderActions,
      setRestoreAllPanelVisible,
      setRestoreRoomDialogVisible,
      setRestoreAllArchive,
      setInvitePanelOptions,
      setInviteUsersWarningDialogVisible,
      setLeaveRoomDialogVisible,
    } = dialogsStore;

    const {
      isRecycleBinFolder,
      isPrivacyFolder,
      isRoomsFolder,
      isArchiveFolder,
      isPersonalRoom,
      isArchiveFolderRoot,
    } = treeFoldersStore;

    const {
      deleteAction,
      downloadAction,
      getHeaderMenu,
      isGroupMenuBlocked,
      moveToRoomsPage,
      onClickBack,
      emptyTrashInProgress,
      moveToPublicRoom,
      onClickCreateRoom,
    } = filesActionsStore;

    const { oformsFilter } = oformsStore;

    const { setIsVisible, isVisible } = infoPanelStore;

    const {
      title,
      id,
      roomType,
      pathParts,
      navigationPath,
      security,
      inRoom,
      access,
      canCopyPublicLink,
      rootFolderType,
    } = selectedFolderStore;

    const selectedFolder = selectedFolderStore.getSelectedFolder();
    const {
      currentGroup,
      getGroupContextOptions,
      setSelected: setGroupsSelected,
      insideGroupTempTitle,
    } = peopleStore.groupsStore;

    const {
      enablePlugins,
      theme,
      whiteLabelLogoUrls,
      frameConfig,
      isFrame,
      currentDeviceType,
    } = settingsStore;
    const { isGracePeriod } = currentTariffStatusStore;

    const isRoom = !!roomType;
    const isPublicRoomType = roomType === RoomsType.PublicRoom;
    const isCustomRoomType = roomType === RoomsType.CustomRoom;

    const {
      onClickEditRoom,
      onClickInviteUsers,
      onShowInfoPanel,
      onClickArchive,
      onClickReconnectStorage,
      onCopyLink,
      onCreateAndCopySharedLink,
    } = contextOptionsStore;

    const canRestoreAll = isArchiveFolder && roomsForRestore.length > 0;

    const canDeleteAll = isArchiveFolder && roomsForDelete.length > 0;

    const isEmptyArchive = !canRestoreAll && !canDeleteAll;

    const hideContextMenuInsideArchiveRoom = isArchiveFolderRoot
      ? !isArchiveFolder
      : false;

    const {
      selectionStore,
      headerMenuStore,
      getHeaderMenu: getAccountsHeaderMenu,
    } = peopleStore;

    const {
      isHeaderVisible: isAccountsHeaderVisible,
      isGroupsHeaderVisible,
      isGroupsHeaderIndeterminate,
      isGroupsHeaderChecked,
      isHeaderIndeterminate: isAccountsHeaderIndeterminate,
      isHeaderChecked: isAccountsHeaderChecked,
      cbMenuItems: accountsCbMenuItems,
      getMenuItemId: getAccountsMenuItemId,
      getCheckboxItemLabel: getAccountsCheckboxItemLabel,
    } = headerMenuStore;

    const { setSelected: setAccountsSelected } = selectionStore;
    const { isPublicRoom, primaryLink, setExternalLink } = publicRoomStore;

    let folderPath = navigationPath;

    if (isFrame && !!pathParts) {
      folderPath = navigationPath.filter((item) => !item.isRootRoom);
    }

    const isRoot =
      isFrame && frameConfig?.id
        ? pathParts?.length === 1 || pathParts?.length === 2
        : pathParts?.length === 1;

    const haveLinksRight =
      access === ShareAccessRights.RoomManager ||
      access === ShareAccessRights.None;

    const isArchive = rootFolderType === FolderType.Archive;

    const showNavigationButton = isLoading
      ? false
      : !isPublicRoom &&
        !isArchive &&
        canCopyPublicLink &&
        (isPublicRoomType || isCustomRoomType) &&
        primaryLink;

    return {
      isGracePeriod,
      setInviteUsersWarningDialogVisible,
      showText: settingsStore.showText,
      isDesktop: settingsStore.isDesktopClient,
      showHeaderLoader,
      isLoading,
      isRootFolder: isPublicRoom && !folderPath?.length ? true : isRoot,
      isPersonalRoom,
      title,
      isRoom,
      currentFolderId: id,

      navigationPath: folderPath,
      oformsFilter,

      setIsInfoPanelVisible: setIsVisible,
      isInfoPanelVisible: isVisible,
      isHeaderVisible,
      isHeaderIndeterminate,
      isHeaderChecked,
      isThirdPartySelection,
      isTabletView: settingsStore.isTabletView,
      confirmDelete: filesSettingsStore.confirmDelete,
      personal: settingsStore.personal,
      cbMenuItems,
      setSelectedNode: treeFoldersStore.setSelectedNode,
      getFolderInfo,

      setSelected,
      security,
      canCopyPublicLink,

      setSharingPanelVisible,
      setMoveToPanelVisible,
      setCopyPanelVisible,
      setBufferSelection,
      setIsFolderActions,
      deleteAction,
      setDeleteDialogVisible,
      downloadAction,
      getHeaderMenu,
      getCheckboxItemLabel,
      getCheckboxItemId,
      setSelectFileDialogVisible,

      isRecycleBinFolder,
      setEmptyTrashDialogVisible,
      isEmptyFilesList,
      isEmptyArchive,
      isPrivacyFolder,
      isArchiveFolder,
      hideContextMenuInsideArchiveRoom,

      setIsLoading,

      activeFiles,
      activeFolders,

      isRoomsFolder,

      enablePlugins,
      mainButtonItemsList,

      setRestoreAllPanelVisible,

      setRestoreRoomDialogVisible,
      setRestoreAllArchive,

      selectedFolder,

      onClickEditRoom,
      onClickCreateRoom,
      onClickInviteUsers,
      onShowInfoPanel,
      onClickArchive,
      onCopyLink,

      isEmptyArchive,
      canRestoreAll,
      canDeleteAll,
      isGroupMenuBlocked,

      moveToRoomsPage,
      onClickBack,
      isPublicRoomType,
      isCustomRoomType,
      isPublicRoom,
      primaryLink,
      getPrimaryLink,
      setExternalLink,

      moveToPublicRoom,

      getAccountsHeaderMenu,
      isAccountsHeaderVisible,
      isGroupsHeaderVisible,
      isGroupsHeaderIndeterminate,
      isGroupsHeaderChecked,
      setGroupsSelected,
      isAccountsHeaderIndeterminate,
      isAccountsHeaderChecked,
      accountsCbMenuItems,
      getAccountsMenuItemId,
      getAccountsCheckboxItemLabel,
      setAccountsSelected,
      isOwner,
      isAdmin,
      isCollaborator,
      setInvitePanelOptions,
      isEmptyPage,

      clearFiles,
      emptyTrashInProgress,
      categoryType,
      theme,
      whiteLabelLogoUrls,
      isFrame,
      showTitle: frameConfig?.showTitle,
      hideInfoPanel: isFrame && !frameConfig?.infoPanelVisible,
      currentDeviceType,
      setLeaveRoomDialogVisible,
      inRoom,
      insideGroupTempTitle,
      currentGroup,
      getGroupContextOptions,
      onCreateAndCopySharedLink,
      showNavigationButton,
      haveLinksRight,
    };
  },
)(
  withTranslation([
    "Files",
    "Common",
    "Translations",
    "InfoPanel",
    "SharingPanel",
    "Article",
    "People",
    "PeopleTranslations",
    "ChangeUserTypeDialog",
  ])(observer(SectionHeaderContent)),
);
