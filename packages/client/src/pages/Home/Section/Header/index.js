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

import RoomArchiveSvgUrl from "PUBLIC_DIR/images/room.archive.svg?url";
import CopyReactSvgUrl from "PUBLIC_DIR/images/copy.react.svg?url";
import CatalogTrashReactSvgUrl from "PUBLIC_DIR/images/catalog.trash.react.svg?url";

import PublicRoomIconUrl from "PUBLIC_DIR/images/public-room.react.svg?url";

import LeaveRoomSvgUrl from "PUBLIC_DIR/images/logout.react.svg?url";
import CatalogRoomsReactSvgUrl from "PUBLIC_DIR/images/catalog.rooms.react.svg?url";
import TabletLinkReactSvgUrl from "PUBLIC_DIR/images/tablet-link.reat.svg?url";

import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import styled, { css } from "styled-components";
import copy from "copy-to-clipboard";
import { useNavigate, useLocation, useParams } from "react-router-dom";

import { SectionHeaderSkeleton } from "@docspace/shared/skeletons/sections";
import Navigation from "@docspace/shared/components/navigation";
import FilesFilter from "@docspace/shared/api/files/filter";

import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { tablet, mobile, Consumer, getLogoUrl } from "@docspace/shared/utils";

import { toastr } from "@docspace/shared/components/toast";
import { TableGroupMenu } from "@docspace/shared/components/table";
import {
  Events,
  RoomsType,
  DeviceType,
  FolderType,
  ShareAccessRights,
  FilesSelectorFilterTypes,
  WhiteLabelLogoType,
} from "@docspace/shared/enums";

import { copyShareLink } from "@docspace/shared/utils/copy";

import { CategoryType } from "SRC_DIR/helpers/constants";
import {
  getCategoryTypeByFolderType,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";
import TariffBar from "SRC_DIR/components/TariffBar";
import { PORTAL } from "@docspace/shared/constants";

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
      min-width: 50px;

      .button-content {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        display: block;
        padding-top: 3px;
      }

      @media ${tablet} {
        display: ${({ isInfoPanelVisible }) =>
          isInfoPanelVisible ? "none" : "block"};
      }

      @media ${mobile} {
        display: none;
      }
    }

    .title-icon {
      svg {
        path {
          fill: ${(props) => props.theme.backgroundColor};
        }
        rect {
          stroke: ${(props) => props.theme.backgroundColor};
        }
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
    t,
    isRoomsFolder,
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
    navigationPath,
    getHeaderMenu,
    isRecycleBinFolder,
    isArchiveFolder,
    isEmptyFilesList,
    isHeaderVisible,
    isHeaderChecked,
    isHeaderIndeterminate,
    showText,

    isEmptyArchive,

    isRoom,
    isGroupMenuBlocked,

    onClickBack,
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
    setRestoreAllArchive,
    setRestoreRoomDialogVisible,
    onCopyLink,
    setShareFolderDialogVisible,

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
    isRoomAdmin,
    isCollaborator,
    isEmptyPage,

    isLoading,

    emptyTrashInProgress,
    categoryType,
    isPublicRoom,
    isFormRoomType,
    theme,
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
    setSelectFileFormRoomDialogVisible,
    deleteRooms,
    setSelection,
    startUpload,
    getFolderModel,
    onCreateRoom,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();
  const { groupId } = useParams();

  const isInsideGroup = !!groupId;

  const isAccountsPage = location.pathname.includes("/accounts");
  const isGroupsPage =
    location.pathname.includes("/accounts/groups") && !isInsideGroup;

  const isSettingsPage = location.pathname.includes("/settings");

  const onFileChange = React.useCallback(
    (e) => {
      startUpload(e.target.files, null, t);
    },
    [startUpload, t],
  );

  const onInputClick = React.useCallback((e) => (e.target.value = null), []);

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

  const onClickShare = () => {
    setShareFolderDialogVisible(true);
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

  const onDeleteRoomInArchive = () => {
    setSelection([selectedFolder]);
    deleteRooms(t);
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
      isPublicRoom,
      isFrame,
    } = props;

    const isArchive = selectedFolder.rootFolderType === FolderType.Archive;

    if (isPublicRoom) {
      return [
        {
          key: "public-room_share",
          label: t("Files:CopyLink"),
          icon: TabletLinkReactSvgUrl,
          onClick: onShareRoom,
          disabled: isFrame,
        },
        {
          key: "public-room_edit",
          label: t("Common:Download"),
          icon: DownloadReactSvgUrl,
          onClick: onDownloadAll,
          disabled: !security?.Download,
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
        label: t("Common:Share"),
        onClick: onClickShare,
        disabled: !selectedFolder.security?.CreateRoomFrom,
        icon: ShareReactSvgUrl,
      },
      {
        id: "header_option_link-portal-users",
        key: "link-portal-users",
        label: t("LinkForPortalUsers", { portalName: PORTAL }),
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
          ((isPublicRoomType || isCustomRoomType) &&
            haveLinksRight &&
            !isArchive),
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
        disabled: !security?.EditRoom || !security?.Reconnect,
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
            copyShareLink(primaryLink.sharedTo.shareLink);
            toastr.success(t("Translations:LinkCopySuccess"));
          } else {
            const link = await getPrimaryLink(currentFolderId);
            if (link) {
              copyShareLink(link.sharedTo.shareLink);
              toastr.success(t("Files:LinkSuccessfullyCreatedAndCopied"));
              setExternalLink(link);
            }
          }
        },
        disabled:
          (!isPublicRoomType && !isCustomRoomType) ||
          !haveLinksRight ||
          isArchive,
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
        disabled: !isRoom || !security?.Move || isArchive,
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
        disabled: !selectedFolder.security?.CreateRoomFrom,
      },
      {
        id: "option_leave-room",
        key: "leave-room",
        label: t("LeaveTheRoom"),
        icon: LeaveRoomSvgUrl,
        onClick: onLeaveRoom,
        disabled: isArchive || !inRoom || isPublicRoom,
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
        id: "header_option_unarchive-room",
        key: "unarchive-room",
        label: t("Common:Restore"),
        onClick: onClickArchiveAction,
        disabled: !isArchive || !isRoom,
        icon: MoveReactSvgUrl,
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
        disabled:
          isDisabled || (isArchive ? !security?.Copy : !security?.CopyTo),

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
        onClick: isArchive ? onDeleteRoomInArchive : onDeleteAction,
        disabled: isArchive ? !isRoom : isDisabled || !security?.Delete,
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

  const getContextOptionsPlus = () => {
    return getFolderModel(t);
  };

  const onNavigationButtonClick = () => {
    onCreateAndCopySharedLink(selectedFolder, t);
  };

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

  if (isAccountsPage && !(isGroupsPage && isRoomAdmin)) {
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

  const logo = getLogoUrl(WhiteLabelLogoType.LightSmall, !theme.isBase);
  const burgerLogo = getLogoUrl(WhiteLabelLogoType.LeftMenu, !theme.isBase);

  const navigationButtonLabel = showNavigationButton
    ? t("Files:ShareRoom")
    : null;

  return (
    <Consumer key="header">
      {(context) => (
        <StyledContainer isRecycleBinFolder={isRecycleBinFolder}>
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
                  !isPublicRoom &&
                  !isInsideGroup
                }
                rootRoomTitle={currentRootRoomTitle}
                title={currentTitle}
                isDesktop={isDesktop}
                isTabletView={isTabletView}
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
                    ? t("Common:NewRoom")
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
                showNavigationButton={!!showNavigationButton}
              />
            </div>
          )}
          {isFrame && (
            <>
              <input
                id="customFileInput"
                className="custom-file-input"
                multiple
                type="file"
                style={{ display: "none" }}
                onChange={onFileChange}
                onClick={onInputClick}
              />
              <input
                id="customFolderInput"
                className="custom-file-input"
                webkitdirectory=""
                mozdirectory=""
                type="file"
                style={{ display: "none" }}
                onChange={onFileChange}
                onClick={onInputClick}
              />
            </>
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
    infoPanelStore,
    userStore,
    currentTariffStatusStore,
    settingsStore,
    uploadDataStore,
  }) => {
    const { startUpload } = uploadDataStore;
    const isRoomAdmin = userStore.user?.isRoomAdmin;
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

      categoryType,
      getPrimaryLink,
      setSelection,
    } = filesStore;

    const {
      setIsSectionFilterLoading,
      showHeaderLoader,

      isLoading,
    } = clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionFilterLoading(param);
    };

    const {
      setSharingPanelVisible,
      setMoveToPanelVisible,
      setCopyPanelVisible,
      setDeleteDialogVisible,
      setEmptyTrashDialogVisible,
      setIsFolderActions,
      setRestoreAllPanelVisible,
      setRestoreRoomDialogVisible,
      setRestoreAllArchive,
      setInviteUsersWarningDialogVisible,
      setLeaveRoomDialogVisible,
      setSelectFileFormRoomDialogVisible,
      setShareFolderDialogVisible,
    } = dialogsStore;

    const {
      isRecycleBinFolder,
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
      deleteRooms,
    } = filesActionsStore;

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
      parentRoomType,
      isFolder,
      shared,
    } = selectedFolderStore;

    const selectedFolder = selectedFolderStore.getSelectedFolder();
    const {
      currentGroup,
      getGroupContextOptions,
      setSelected: setGroupsSelected,
      insideGroupTempTitle,
    } = peopleStore.groupsStore;

    const { theme, frameConfig, isFrame, currentDeviceType } = settingsStore;
    const { isGracePeriod } = currentTariffStatusStore;

    const isRoom = !!roomType;
    const isPublicRoomType = roomType === RoomsType.PublicRoom;
    const isCustomRoomType = roomType === RoomsType.CustomRoom;

    const isFormRoomType =
      roomType === RoomsType.FormRoom ||
      (parentRoomType === FolderType.FormRoom && isFolder);

    const {
      onClickEditRoom,
      onClickInviteUsers,
      onShowInfoPanel,
      onClickArchive,
      onClickReconnectStorage,
      onCopyLink,
      onCreateAndCopySharedLink,
      getFolderModel,
      onCreateRoom,
    } = contextOptionsStore;

    const canRestoreAll = isArchiveFolder && roomsForRestore.length > 0;

    const canDeleteAll = isArchiveFolder && roomsForDelete.length > 0;

    const isEmptyArchive = !canRestoreAll && !canDeleteAll;

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

    const sharedItem = navigationPath.find((r) => r.shared);

    const showNavigationButton = isLoading
      ? false
      : (!isPublicRoom &&
          !isArchive &&
          canCopyPublicLink &&
          (isPublicRoomType || isCustomRoomType) &&
          shared) ||
        (sharedItem && sharedItem.canCopyPublicLink);

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

      setIsInfoPanelVisible: setIsVisible,
      isInfoPanelVisible: isVisible,
      isHeaderVisible,
      isHeaderIndeterminate,
      isHeaderChecked,
      isThirdPartySelection,
      isTabletView: settingsStore.isTabletView,
      confirmDelete: filesSettingsStore.confirmDelete,
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

      isRecycleBinFolder,
      setEmptyTrashDialogVisible,
      isEmptyFilesList,
      isEmptyArchive,
      isArchiveFolder,

      setIsLoading,

      activeFiles,
      activeFolders,

      isRoomsFolder,

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
      isFormRoomType,
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
      isRoomAdmin,
      isCollaborator,
      isEmptyPage,
      emptyTrashInProgress,
      categoryType,
      theme,
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
      setSelectFileFormRoomDialogVisible,
      deleteRooms,
      setSelection,
      setShareFolderDialogVisible,
      startUpload,
      onClickReconnectStorage,
      getFolderModel,
      onCreateRoom,
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
