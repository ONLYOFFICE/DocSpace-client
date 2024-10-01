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
import {
  getCategoryTypeByFolderType,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";
import TariffBar from "SRC_DIR/components/TariffBar";
import { getLifetimePeriodTranslation } from "@docspace/shared/utils/common";
import { globalColors } from "@docspace/shared/themes";
import getFilesFromEvent from "@docspace/shared/components/drag-and-drop/get-files-from-event";
import { toastr } from "@docspace/shared/components/toast";

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
          fill: ${(props) => props.theme.backgroundColor};
        }
        rect {
          stroke: ${(props) => props.theme.backgroundColor};
        }
      }
    }
  }

  ${(props) =>
    props.isVirtualDataRoomType &&
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

    categoryType,
    isPublicRoom,
    theme,
    isPublicRoomType,
    isVirtualDataRoomType,

    moveToPublicRoom,
    currentDeviceType,
    isFrame,
    showTitle,
    hideInfoPanel,
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
  } = props;

  const location = useLocation();
  const { groupId } = useParams();

  const isInsideGroup = !!groupId;

  const isAccountsPage = location.pathname.includes("/accounts");
  const isGroupsPage =
    location.pathname.includes("/accounts/groups") && !isInsideGroup;

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
    if (isInsideGroup) {
      return getGroupContextOptions(t, currentGroup, false, true);
    }

    return getHeaderOptions(t, selectedFolder);
  };

  const onContextOptionsClick = () => {
    isInsideGroup
      ? setGroupsBufferSelection(currentGroup)
      : setBufferSelection(selectedFolder);
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

  const onCloseIndexMenu = () => {
    setIsIndexEditingMode(false);
  };

  const onIndexReorder = () => {
    setReorderDialogVisible(true);
  };

  const headerMenu = isIndexEditingMode
    ? [
        {
          id: "reorder-index",
          label: t("Files:Reorder"),
          onClick: onIndexReorder,
          iconUrl: RoundedArrowSvgUrl,
        },
      ]
    : isAccountsPage
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

  const isRoot =
    isLoading && typeof stateIsRoot === "boolean"
      ? stateIsRoot
      : isRootFolder || isAccountsPage || isSettingsPage;

  const getInsideGroupTitle = () => {
    return isLoading && insideGroupTempTitle
      ? insideGroupTempTitle
      : currentGroup?.name;
  };

  const currentTitle = isSettingsPage
    ? t("Common:Settings")
    : isAccountsPage
      ? isInsideGroup
        ? getInsideGroupTitle()
        : t("Common:Contacts")
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
      title: t("Common:Contacts"),
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

  const titleIcon =
    (isPublicRoomType && !isPublicRoom && PublicRoomIconUrl) ||
    (isVirtualDataRoomType && selectedFolder.lifetime && LifetimeRoomIconUrl);

  const titleIconTooltip = selectedFolder.lifetime
    ? t("Files:RoomFilesLifetime", {
        days: selectedFolder.lifetime.value,
        period: getLifetimePeriodTranslation(selectedFolder.lifetime.period, t),
      })
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
          isRecycleBinFolder={isRecycleBinFolder}
          isVirtualDataRoomType={isVirtualDataRoomType}
        >
          {tableGroupMenuVisible ? (
            <TableGroupMenu
              withComboBox={!isIndexEditingMode}
              {...tableGroupMenuProps}
              {...headerProps}
              {...closeProps}
            />
          ) : (
            <div className="header-container">
              <Navigation
                sectionWidth={context.sectionWidth}
                showText={showText}
                isRootFolder={isRoot && !isInsideGroup}
                canCreate={
                  (currentCanCreate || (isAccountsPage && !isCollaborator)) &&
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
                titleIcon={titleIcon}
                titleIconTooltip={titleIconTooltip}
                showRootFolderTitle={insideTheRoom || isInsideGroup}
                currentDeviceType={currentDeviceType}
                isFrame={isFrame}
                showTitle={isFrame ? showTitle : true}
                navigationButtonLabel={navigationButtonLabel}
                onNavigationButtonClick={onNavigationButtonClick}
                tariffBar={<TariffBar />}
                showNavigationButton={!!showNavigationButton}
                onContextOptionsClick={onContextOptionsClick}
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
    const { isRoomAdmin, isCollaborator } = userStore.user;

    const {
      setSelected,

      isHeaderVisible,
      isHeaderIndeterminate,
      isHeaderChecked,
      cbMenuItems,
      getCheckboxItemLabel,
      getCheckboxItemId,
      isEmptyFilesList,

      roomsForRestore,
      roomsForDelete,

      isEmptyPage,

      categoryType,
      setBufferSelection,
    } = filesStore;

    const {
      setIsSectionFilterLoading,
      showHeaderLoader,

      isLoading,
    } = clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionFilterLoading(param);
    };

    const { isRecycleBinFolder, isRoomsFolder, isArchiveFolder } =
      treeFoldersStore;

    const { setReorderDialogVisible } = dialogsStore;

    const {
      getHeaderMenu,
      isGroupMenuBlocked,
      moveToRoomsPage,
      onClickBack,
      moveToPublicRoom,
      createFoldersTree,
    } = filesActionsStore;

    const { setIsVisible, isVisible } = infoPanelStore;

    const {
      title,
      roomType,
      pathParts,
      navigationPath,
      security,
      rootFolderType,
      shared,
    } = selectedFolderStore;

    const selectedFolder = selectedFolderStore.getSelectedFolder();
    const {
      currentGroup,
      getGroupContextOptions,
      setSelected: setGroupsSelected,
      setBufferSelection: setGroupsBufferSelection,
      insideGroupTempTitle,
    } = peopleStore.groupsStore;

    const { theme, frameConfig, isFrame, currentDeviceType } = settingsStore;

    const isRoom = !!roomType;
    const isPublicRoomType = roomType === RoomsType.PublicRoom;
    const isVirtualDataRoomType = roomType === RoomsType.VirtualDataRoom;
    const isCustomRoomType = roomType === RoomsType.CustomRoom;
    const isFormRoomType = roomType === RoomsType.FormRoom;

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

    const { isIndexEditingMode, setIsIndexEditingMode } = indexingStore;
    const { setSelected: setAccountsSelected } = selectionStore;
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
      isLoading || !security?.CopyLink || isPublicRoom || isArchive
        ? false
        : security?.Read && isShared;

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
      getCheckboxItemLabel,
      getCheckboxItemId,

      isRecycleBinFolder,
      isEmptyFilesList,
      isEmptyArchive,
      isArchiveFolder,

      setIsLoading,

      isRoomsFolder,

      selectedFolder,

      isEmptyArchive,
      isGroupMenuBlocked,

      moveToRoomsPage,
      onClickBack,
      isPublicRoomType,
      isVirtualDataRoomType,
      isPublicRoom,

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
      categoryType,
      theme,
      isFrame,
      showTitle: frameConfig?.showTitle,
      hideInfoPanel: isFrame && !frameConfig?.infoPanelVisible,
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
