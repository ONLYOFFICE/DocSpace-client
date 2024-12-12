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

import PublicRoomIconUrl from "PUBLIC_DIR/images/public-room.react.svg?url";
import LifetimeRoomIconUrl from "PUBLIC_DIR/images/lifetime-room.react.svg?url";
import RoundedArrowSvgUrl from "PUBLIC_DIR/images/rounded arrow.react.svg?url";
import SharedLinkSvgUrl from "PUBLIC_DIR/images/icons/16/shared.link.svg?url";
import CheckIcon from "PUBLIC_DIR/images/check.edit.react.svg?url";

import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import styled, { css } from "styled-components";
import { useLocation, useParams } from "react-router-dom";
import { SectionHeaderSkeleton } from "@docspace/shared/skeletons/sections";
import Navigation from "@docspace/shared/components/navigation";
import FilesFilter from "@docspace/shared/api/files/filter";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import { tablet, mobile, Consumer, getLogoUrl } from "@docspace/shared/utils";
import { TableGroupMenu } from "@docspace/shared/components/table";
import {
  RoomsType,
  DeviceType,
  FolderType,
  WhiteLabelLogoType,
} from "@docspace/shared/enums";

import { CategoryType } from "SRC_DIR/helpers/constants";
import { getContactsView } from "SRC_DIR/helpers/contacts";
import {
  getCategoryTypeByFolderType,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";
import TariffBar from "SRC_DIR/components/TariffBar";
import { getLifetimePeriodTranslation } from "@docspace/shared/utils/common";
import { globalColors } from "@docspace/shared/themes";
import getFilesFromEvent from "@docspace/shared/components/drag-and-drop/get-files-from-event";
import { toastr } from "@docspace/shared/components/toast";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  getCheckboxItemId,
  getCheckboxItemLabel,
} from "SRC_DIR/helpers/filesUtils";
import { hasOwnProperty } from "@docspace/shared/utils/object";
import { useContactsHeader } from "./useContacts";

const StyledContainer = styled.div`
  width: 100%;
  min-height: 33px;

  .table-container_group-menu {
    margin-block: 0;
    margin-inline: -20px 0;
    -webkit-tap-highlight-color: ${globalColors.tapHighlight};

    width: calc(100% + 40px);
    height: 68px;

    @media ${tablet} {
      height: 61px;
      margin-block: 0;
      margin-inline: -16px 0;
      width: calc(100% + 32px);
    }

    @media ${mobile} {
      height: 52px !important;
      margin-block: 0;
      margin-inline: -16px 0;
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
          fill: ${({ theme, isExternalFolder }) =>
            isExternalFolder
              ? theme.roomIcon.linkIcon.path
              : theme.backgroundColor};
        }
        rect {
          stroke: ${(props) => props.theme.backgroundColor};
        }
      }
    }

    .header_sign-in-button {
      margin-inline-start: auto;
      display: block;

      @media ${tablet} {
        margin-inline-start: 16px;
      }

      @media ${mobile} {
        display: none;
      }
    }
  }

  ${(props) =>
    props.isLifetimeEnabled &&
    css`
      .title-icon {
        svg {
          path {
            fill: ${({ theme }) =>
              theme.navigation.lifetimeIconFill} !important;
            stroke: ${({ theme }) =>
              theme.navigation.lifetimeIconStroke} !important;
          }
        }
      }
    `}
`;

const SectionHeaderContent = (props) => {
  const {
    currentGroup,
    insideGroupTempTitle,
    getGroupContextOptions,
    t,
    isRoomsFolder,
    security,
    setIsIndexEditingMode,
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
    isIndexEditingMode,
    isHeaderChecked,
    isHeaderIndeterminate,
    showText,

    isEmptyArchive,

    isRoom,
    isGroupMenuBlocked,

    onClickBack,
    selectedFolder,

    setSelected,
    cbMenuItems,
    setSelectedNode,
    setIsLoading,

    moveToRoomsPage,
    setIsInfoPanelVisible,

    getContactsHeaderMenu,
    isUsersHeaderVisible,
    isGroupsHeaderVisible,
    isGroupsHeaderIndeterminate,
    isGroupsHeaderChecked,
    isUsersHeaderIndeterminate,
    isUsersHeaderChecked,
    cbContactsMenuItems,
    setUsersSelected,
    setGroupsSelected,
    isRoomAdmin,
    isCollaborator,
    isEmptyPage,

    isLoading,

    categoryType,
    isPublicRoom,
    theme,
    isVirtualDataRoomType,

    moveToPublicRoom,
    currentDeviceType,
    isFrame,
    showTitle,
    hideInfoPanel,
    showMenu,
    onCreateAndCopySharedLink,
    showNavigationButton,
    startUpload,
    getFolderModel,
    getContactsModel,
    contactsCanCreate,
    onCreateRoom,
    onEmptyTrashAction,
    getHeaderOptions,
    setBufferSelection,
    setReorderDialogVisible,
    setGroupsBufferSelection,
    createFoldersTree,
    showSignInButton,
    onSignInClick,
    signInButtonIsDisabled,
    displayAbout,
    revokeFilesOrder,
    saveIndexOfFiles,
    infoPanelRoom,
    getPublicKey,
    getIndexingArray,
    setCloseEditIndexDialogVisible,
  } = props;

  const location = useLocation();
  const { groupId } = useParams();

  const contactsView = getContactsView(location);
  const isContactsPage = !!contactsView;
  const isContactsGroupsPage = contactsView === "groups";
  const isContactsInsideGroupPage =
    contactsView === "inside_group" && !!groupId;

  const { getContactsMenuItems, onContactsChange } = useContactsHeader({
    setUsersSelected,
    setGroupsSelected,

    cbContactsMenuItems,
    t,

    isContactsGroupsPage,
  });

  const isSettingsPage = location.pathname.includes("/settings");

  const onFileChange = React.useCallback(
    async (e) => {
      const files = await getFilesFromEvent(e);

      createFoldersTree(t, files)
        .then((f) => {
          if (f.length > 0) startUpload(f, null, t);
        })
        .catch((err) => {
          toastr.error(err);
        });
    },
    [startUpload, t],
  );

  const onInputClick = React.useCallback((e) => (e.target.value = null), []);

  const onToggleInfoPanel = () => {
    setIsInfoPanelVisible(!isInfoPanelVisible);
  };

  const getContextOptionsFolder = () => {
    if (isContactsInsideGroupPage) {
      return getGroupContextOptions(t, currentGroup, false, true);
    }

    return getHeaderOptions(t, selectedFolder);
  };

  const onContextOptionsClick = () => {
    isContactsInsideGroupPage
      ? setGroupsBufferSelection(currentGroup)
      : setBufferSelection(selectedFolder);
  };

  const onSelect = (e) => {
    const key = e.currentTarget.dataset.key;

    setSelected(key);
  };

  const onClose = () => {
    isContactsPage ? setUsersSelected("close") : setSelected("close");
  };

  const getMenuItems = () => {
    const checkboxOptions = isContactsPage ? (
      getContactsMenuItems()
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
    isContactsPage
      ? onContactsChange(checked)
      : setSelected(checked ? "all" : "none");
  };

  const onClickFolder = async (id, isRootRoom) => {
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
    const shareKey = await getPublicKey(selectedFolder);
    if (shareKey) filter.key = shareKey;

    const itemIdx = selectedFolder.navigationPath.findIndex((v) => v.id === id);

    const state = {
      title: selectedFolder.navigationPath[itemIdx]?.title || "",
      isRoot: itemIdx === selectedFolder.navigationPath.length - 1,
      isRoom: selectedFolder.navigationPath[itemIdx]?.isRoom || false,
      rootFolderType,
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
    if (isContactsPage) return getContactsModel(t);
    return getFolderModel(t);
  };

  const onNavigationButtonClick = () => {
    onCreateAndCopySharedLink(selectedFolder, t);
  };

  const onCloseIndexMenu = () => {
    const items = getIndexingArray();

    if (items.length) {
      setCloseEditIndexDialogVisible(true);
      return;
    }

    revokeFilesOrder();
    setIsIndexEditingMode(false);
  };

  const onIndexReorder = () => {
    setReorderDialogVisible(true);
  };

  const onIndexApply = () => {
    saveIndexOfFiles(t);
    setIsIndexEditingMode(false);
  };

  const getTitleIcon = () => {
    if (stateIsExternal && !isPublicRoom) return SharedLinkSvgUrl;

    if (navigationButtonIsVisible && !isPublicRoom) return PublicRoomIconUrl;

    if (isLifetimeEnabled) return LifetimeRoomIconUrl;

    return "";
  };
  const onLogoClick = () => {
    if (isFrame) return;
    moveToPublicRoom(props.rootFolderId);
  };

  const headerMenu = isIndexEditingMode
    ? [
        {
          id: "reorder-index",
          label: t("Files:Reorder"),
          onClick: onIndexReorder,
          iconUrl: RoundedArrowSvgUrl,
        },
        {
          id: "save-index",
          label: t("Common:ApplyButton"),
          onClick: onIndexApply,
          iconUrl: CheckIcon,
        },
      ]
    : isContactsPage
      ? getContactsHeaderMenu(t, isContactsGroupsPage)
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

  if (isContactsPage && !(isContactsGroupsPage && isRoomAdmin)) {
    tableGroupMenuVisible =
      (!isContactsGroupsPage ? isUsersHeaderVisible : isGroupsHeaderVisible) &&
      tableGroupMenuVisible &&
      headerMenu.some((x) => !x.disabled);
    tableGroupMenuProps.isChecked = !isContactsGroupsPage
      ? isUsersHeaderChecked
      : isGroupsHeaderChecked;
    tableGroupMenuProps.isIndeterminate = !isContactsGroupsPage
      ? isUsersHeaderIndeterminate
      : isGroupsHeaderIndeterminate;
    tableGroupMenuProps.withoutInfoPanelToggler = false;
  } else {
    tableGroupMenuVisible =
      (isIndexEditingMode || isHeaderVisible) && tableGroupMenuVisible;
    tableGroupMenuProps.isChecked = isHeaderChecked;
    tableGroupMenuProps.isIndeterminate = isHeaderIndeterminate;
    tableGroupMenuProps.isBlocked = isGroupMenuBlocked;
    tableGroupMenuProps.withoutInfoPanelToggler =
      isIndexEditingMode || isPublicRoom;
  }

  const stateTitle = location?.state?.title;
  const stateCanCreate = location?.state?.canCreate;
  const stateIsRoot = location?.state?.isRoot;
  const stateIsRoom = location?.state?.isRoom;
  const stateRootRoomTitle = location?.state?.rootRoomTitle;
  const stateIsPublicRoomType = location?.state?.isPublicRoomType;
  const stateIsShared = location?.state?.isShared;
  const stateIsExternal = location?.state?.isExternal;
  const stateIsLifetimeEnabled = location?.state?.isLifetimeEnabled;

  const isRoot =
    isLoading && typeof stateIsRoot === "boolean"
      ? stateIsRoot
      : isRootFolder || isContactsPage || isSettingsPage;

  const isLifetimeEnabled = Boolean(
    !isRoot &&
      (selectedFolder?.lifetime ||
        infoPanelRoom?.lifetime ||
        (isLoading && stateIsLifetimeEnabled)),
  );

  const navigationButtonIsVisible = !!(showNavigationButton || stateIsShared);

  const getInsideGroupTitle = () => {
    return isLoading && insideGroupTempTitle
      ? insideGroupTempTitle
      : currentGroup?.name;
  };

  const currentTitle = isSettingsPage
    ? t("Common:Settings")
    : isContactsPage
      ? isContactsInsideGroupPage
        ? getInsideGroupTitle()
        : t("Common:Contacts")
      : isLoading && stateTitle
        ? stateTitle
        : title;

  const currentCanCreate =
    isLoading && hasOwnProperty(location?.state, "canCreate")
      ? stateCanCreate
      : security?.Create;

  const currentRootRoomTitle =
    isLoading && stateRootRoomTitle
      ? stateRootRoomTitle
      : navigationPath?.length > 1 &&
        navigationPath[navigationPath?.length - 2].title;

  const accountsNavigationPath = isContactsInsideGroupPage && [
    {
      id: 0,
      title: t("Common:Contacts"),
      isRoom: false,
      isRootRoom: true,
    },
  ];

  const isCurrentRoom =
    isLoading && typeof stateIsRoom === "boolean" ? stateIsRoom : isRoom;

  if (showHeaderLoader) return <SectionHeaderSkeleton />;

  const insideTheRoom =
    (categoryType === CategoryType.SharedRoom ||
      categoryType === CategoryType.Archive) &&
    !isCurrentRoom;

  const logo = getLogoUrl(WhiteLabelLogoType.LightSmall, !theme.isBase);
  const burgerLogo = getLogoUrl(WhiteLabelLogoType.LeftMenu, !theme.isBase);

  const titleIcon = getTitleIcon();

  const lifetime = selectedFolder?.lifetime || infoPanelRoom?.lifetime;

  const titleIconTooltip = lifetime
    ? `${t("Files:RoomFilesLifetime", {
        days: lifetime.value,
        period: getLifetimePeriodTranslation(lifetime.period, t),
      })}. ${
        lifetime.deletePermanently
          ? t("Files:AfterFilesWillBeDeletedPermanently")
          : t("Files:AfterFilesWillBeMovedToTrash")
      }`
    : null;

  const navigationButtonLabel = showNavigationButton
    ? t("Files:ShareRoom")
    : null;

  const headerProps = isIndexEditingMode
    ? { headerLabel: t("Common:SortingIndex") }
    : {};

  const closeProps = isIndexEditingMode
    ? { isCloseable: true, onCloseClick: onCloseIndexMenu }
    : {};

  return (
    <Consumer key="header">
      {(context) => (
        <StyledContainer
          isExternalFolder={stateIsExternal}
          isRecycleBinFolder={isRecycleBinFolder}
          isVirtualDataRoomType={isVirtualDataRoomType}
          isLifetimeEnabled={isLifetimeEnabled}
        >
          {tableGroupMenuVisible ? (
            <TableGroupMenu
              withComboBox={!isIndexEditingMode && !!menuItems}
              {...tableGroupMenuProps}
              {...headerProps}
              {...closeProps}
            />
          ) : (
            <div className="header-container">
              <Navigation
                sectionWidth={context.sectionWidth}
                showText={showText}
                isRootFolder={isRoot && !isContactsInsideGroupPage}
                canCreate={
                  (currentCanCreate || (isContactsPage && contactsCanCreate)) &&
                  !isSettingsPage &&
                  !isPublicRoom
                }
                rootRoomTitle={currentRootRoomTitle}
                title={currentTitle}
                isDesktop={isDesktop}
                isTabletView={isTabletView}
                tReady={tReady}
                menuItems={menuItems}
                navigationItems={
                  !isContactsInsideGroupPage
                    ? navigationPath
                    : accountsNavigationPath
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
                isRoom={isCurrentRoom || isContactsPage}
                hideInfoPanel={hideInfoPanel || isSettingsPage || isPublicRoom}
                withLogo={
                  (isPublicRoom || (isFrame && !showMenu && displayAbout)) &&
                  logo
                }
                burgerLogo={
                  (isPublicRoom || (isFrame && !showMenu && displayAbout)) &&
                  burgerLogo
                }
                isPublicRoom={isPublicRoom}
                titleIcon={titleIcon}
                titleIconTooltip={titleIconTooltip}
                showRootFolderTitle={insideTheRoom || isContactsInsideGroupPage}
                currentDeviceType={currentDeviceType}
                isFrame={isFrame}
                showTitle={isFrame ? showTitle : true}
                navigationButtonLabel={navigationButtonLabel}
                onNavigationButtonClick={onNavigationButtonClick}
                tariffBar={<TariffBar />}
                showNavigationButton={!!showNavigationButton}
                onContextOptionsClick={onContextOptionsClick}
                onLogoClick={onLogoClick}
              />
              {showSignInButton && (
                <Button
                  className="header_sign-in-button"
                  label={t("Common:LoginButton")}
                  size={ButtonSize.small}
                  onClick={onSignInClick}
                  isDisabled={signInButtonIsDisabled}
                  primary
                />
              )}
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
    selectedFolderStore,
    treeFoldersStore,
    filesActionsStore,
    clientLoadingStore,
    publicRoomStore,
    contextOptionsStore,
    infoPanelStore,
    userStore,
    settingsStore,
    uploadDataStore,
    indexingStore,
    dialogsStore,
  }) => {
    const { startUpload } = uploadDataStore;

    const isRoomAdmin = userStore.user?.isRoomAdmin;
    const isCollaborator = userStore.user?.isCollaborator;

    const {
      setSelected,

      isHeaderVisible,
      isHeaderIndeterminate,
      isHeaderChecked,
      cbMenuItems,
      isEmptyFilesList,

      roomsForRestore,
      roomsForDelete,

      isEmptyPage,

      categoryType,
      setBufferSelection,
    } = filesStore;

    const {
      setIsSectionBodyLoading,
      showHeaderLoader,

      isLoading,
    } = clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionBodyLoading(param);
    };

    const { isRecycleBinFolder, isRoomsFolder, isArchiveFolder } =
      treeFoldersStore;

    const { setReorderDialogVisible, setCloseEditIndexDialogVisible } =
      dialogsStore;

    const {
      getHeaderMenu,
      isGroupMenuBlocked,
      moveToRoomsPage,
      onClickBack,
      moveToPublicRoom,
      createFoldersTree,
      revokeFilesOrder,
      saveIndexOfFiles,
      getPublicKey,
    } = filesActionsStore;

    const { setIsVisible, isVisible, infoPanelRoom } = infoPanelStore;

    const {
      title,
      roomType,
      pathParts,
      navigationPath,
      security,
      rootFolderType,
      shared,
      external,
    } = selectedFolderStore;

    const selectedFolder = selectedFolderStore.getSelectedFolder();

    const { theme, frameConfig, isFrame, currentDeviceType, displayAbout } =
      settingsStore;

    const isRoom = !!roomType;
    const isVirtualDataRoomType = roomType === RoomsType.VirtualDataRoom;

    const {
      onCreateAndCopySharedLink,
      getFolderModel,
      onCreateRoom,
      getHeaderOptions,
      onEmptyTrashAction,
    } = contextOptionsStore;

    const canRestoreAll = isArchiveFolder && roomsForRestore.length > 0;

    const canDeleteAll = isArchiveFolder && roomsForDelete.length > 0;

    const isEmptyArchive = !canRestoreAll && !canDeleteAll;

    const { usersStore, groupsStore, headerMenuStore } = peopleStore;

    const {
      currentGroup,
      getGroupContextOptions,
      setSelected: setGroupsSelected,
      setBufferSelection: setGroupsBufferSelection,
      insideGroupTempTitle,
    } = groupsStore;

    const {
      isUsersHeaderVisible,
      isUsersHeaderIndeterminate,
      isUsersHeaderChecked,

      isGroupsHeaderVisible,
      isGroupsHeaderIndeterminate,
      isGroupsHeaderChecked,

      cbContactsMenuItems,
      getContactsHeaderMenu,
    } = headerMenuStore;

    const { getContactsModel, contactsCanCreate } =
      peopleStore.contextOptionsStore;

    const { setSelected: setUsersSelected } = usersStore;

    const { isIndexEditingMode, setIsIndexEditingMode, getIndexingArray } =
      indexingStore;
    const { isPublicRoom } = publicRoomStore;

    let folderPath = navigationPath;

    if (isFrame && !!pathParts) {
      folderPath = navigationPath.filter((item) => !item.isRootRoom);
    }

    const isRoot =
      isFrame && frameConfig?.id
        ? pathParts?.length === 1 || pathParts?.length === 2
        : pathParts?.length === 1;

    const isArchive = rootFolderType === FolderType.Archive;

    const isShared = shared || navigationPath.find((r) => r.shared);

    const showNavigationButton =
      !security?.CopyLink || isPublicRoom || isArchive
        ? false
        : security?.Read && isShared;

    const rootFolderId = navigationPath.length
      ? navigationPath[navigationPath.length - 1]?.id
      : selectedFolder.id;

    return {
      showText: settingsStore.showText,
      isDesktop: settingsStore.isDesktopClient,
      showHeaderLoader,
      isLoading,
      isRootFolder: isPublicRoom && !folderPath?.length ? true : isRoot,
      title,
      isRoom,

      navigationPath: folderPath,

      setIsInfoPanelVisible: setIsVisible,
      isInfoPanelVisible: isVisible,
      isHeaderVisible,
      isIndexEditingMode,
      setIsIndexEditingMode,
      isHeaderIndeterminate,
      isHeaderChecked,
      isTabletView: settingsStore.isTabletView,
      cbMenuItems,
      setSelectedNode: treeFoldersStore.setSelectedNode,

      setSelected,
      security,

      getHeaderMenu,

      isRecycleBinFolder,
      isEmptyFilesList,
      isEmptyArchive,
      isArchiveFolder,

      setIsLoading,

      isRoomsFolder,

      selectedFolder,

      isGroupMenuBlocked,

      moveToRoomsPage,
      onClickBack,
      isVirtualDataRoomType,
      isPublicRoom,

      moveToPublicRoom,

      getContactsHeaderMenu,
      isUsersHeaderVisible,
      isGroupsHeaderVisible,
      isGroupsHeaderIndeterminate,
      isGroupsHeaderChecked,
      setGroupsSelected,
      isUsersHeaderIndeterminate,
      isUsersHeaderChecked,
      cbContactsMenuItems,
      setUsersSelected,
      isRoomAdmin,
      isCollaborator,
      isEmptyPage,
      categoryType,
      theme,
      isFrame,
      showTitle: frameConfig?.showTitle,
      hideInfoPanel: isFrame && !frameConfig?.infoPanelVisible,
      showMenu: frameConfig?.showMenu,
      currentDeviceType,
      insideGroupTempTitle,
      currentGroup,
      getGroupContextOptions,
      onCreateAndCopySharedLink,
      showNavigationButton,
      startUpload,
      getFolderModel,
      onCreateRoom,
      onEmptyTrashAction,
      getHeaderOptions,
      setBufferSelection,
      setReorderDialogVisible,
      setGroupsBufferSelection,
      createFoldersTree,
      getContactsModel,
      contactsCanCreate,
      revokeFilesOrder,
      saveIndexOfFiles,

      rootFolderId,
      displayAbout,
      infoPanelRoom,
      getPublicKey,
      getIndexingArray,
      setCloseEditIndexDialogVisible,
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
    "Notifications",
  ])(observer(SectionHeaderContent)),
);
