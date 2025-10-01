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

import PublicRoomIconUrl from "PUBLIC_DIR/images/public-room.react.svg?url";
import LifetimeRoomIconUrl from "PUBLIC_DIR/images/lifetime-room.react.svg?url";
import RoundedArrowSvgUrl from "PUBLIC_DIR/images/rounded arrow.react.svg?url";
import SharedLinkSvgUrl from "PUBLIC_DIR/images/icons/16/shared.link.svg?url";
import CheckIcon from "PUBLIC_DIR/images/check.edit.react.svg?url";

import React from "react";
import classnames from "classnames";

import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { SectionHeaderSkeleton } from "@docspace/shared/skeletons/sections";
import Navigation from "@docspace/shared/components/navigation";
import FilesFilter from "@docspace/shared/api/files/filter";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import {
  Consumer,
  getLogoUrl,
  getCheckboxItemId,
  getCheckboxItemLabel,
} from "@docspace/shared/utils";
import { TableGroupMenu } from "@docspace/shared/components/table";
import {
  RoomsType,
  DeviceType,
  FolderType,
  WhiteLabelLogoType,
} from "@docspace/shared/enums";

import { CategoryType } from "@docspace/shared/constants";
import {
  getCategoryTypeByFolderType,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";
import { getContactsView, createGroup } from "SRC_DIR/helpers/contacts";
import TariffBar from "SRC_DIR/components/TariffBar";
import { getLifetimePeriodTranslation } from "@docspace/shared/utils/common";
import { GuidanceRefKey } from "@docspace/shared/components/guidance/sub-components/Guid.types";
import getFilesFromEvent from "@docspace/shared/utils/get-files-from-event";
import { toastr } from "@docspace/shared/components/toast";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import styles from "@docspace/shared/styles/SectionHeader.module.scss";
import useProfileHeader from "SRC_DIR/pages/Profile/Section/Header/useProfileHeader";

import { useContactsHeader } from "./useContacts";

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
    roomType,
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
    isEmptyPage,

    isLoading,

    categoryType,
    isPublicRoom,
    theme,

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
    rootFolderId,
    guidAnimationVisible,
    setGuidAnimationVisible,
    setRefMap,
    deleteRefMap,
    isPersonalReadOnly,
    showTemplateBadge,
    allowInvitingMembers,
    currentClientView,
    profile,
    profileClicked,
    enabledHotkeys,

    setDialogData,
    setChangeEmailVisible,
    setChangePasswordVisible,
    setChangeAvatarVisible,
    setChangeNameVisible,
    getIcon,
    contactsTab,
  } = props;

  const location = useLocation();

  const contactsView = getContactsView(location);
  const isContactsPage = !!contactsView;
  const isContactsGroupsPage = contactsTab === "groups";
  const isContactsInsideGroupPage = contactsTab === "inside_group";
  const isProfile = currentClientView === "profile";

  const addButtonRefCallback = React.useCallback(
    (ref) => {
      if (ref) {
        setRefMap(GuidanceRefKey.Uploading, ref);
      }
    },
    [setRefMap],
  );

  const buttonRefCallback = React.useCallback(
    (ref) => {
      if (ref) {
        setRefMap(GuidanceRefKey.Share, ref);
      }
    },
    [setRefMap],
  );

  const { getContactsMenuItems, onContactsChange } = useContactsHeader({
    setUsersSelected,
    setGroupsSelected,

    cbContactsMenuItems,
    t,

    isContactsGroupsPage,
  });

  const {
    profileDialogs,
    getUserContextOptions,
    onClickBack: onClickBackProfile,
  } = useProfileHeader({
    profile,
    profileClicked,
    enabledHotkeys,

    setDialogData,
    setChangeEmailVisible,
    setChangePasswordVisible,
    setChangeAvatarVisible,
    setChangeNameVisible,
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
          toastr.error(err, null, 0, true);
        });
    },
    [startUpload, t],
  );

  const onInputClick = React.useCallback((e) => (e.target.value = null), []);

  const onToggleInfoPanel = () => {
    setIsInfoPanelVisible(!isInfoPanelVisible);
  };

  const contextButtonAnimation = (setAnimationClasses) => {
    setAnimationClasses(["guid-animation-after"]);

    const beforeTimer = setTimeout(() => {
      setAnimationClasses(["guid-animation-after", "guid-animation-before"]);
    }, 1000);

    const removeTimer = setTimeout(() => {
      setAnimationClasses([]);
      setGuidAnimationVisible(false);
    }, 3000);

    return () => {
      clearTimeout(beforeTimer);
      clearTimeout(removeTimer);
    };
  };

  const getContextOptionsFolder = () => {
    if (isProfile) return getUserContextOptions();

    if (isContactsInsideGroupPage) {
      return getGroupContextOptions(t, currentGroup, false, true);
    }

    return getHeaderOptions(t, selectedFolder);
  };

  const onContextOptionsClick = () => {
    if (isContactsInsideGroupPage) setGroupsBufferSelection(currentGroup);
    else if (!isContactsPage) setBufferSelection(selectedFolder);
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
    if (isProfile) return;

    isContactsPage
      ? onContactsChange(checked)
      : setSelected(checked ? "all" : "none");
  };

  const onClickFolder = async (id, isRootRoom, isRootTemplates) => {
    if (isPublicRoom) {
      return moveToPublicRoom(id);
    }

    if (isRootRoom || isRootTemplates) {
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

  const isRoot = isRootFolder || isContactsPage || isSettingsPage || isProfile;

  const isLifetimeEnabled = Boolean(
    !isRoot && (selectedFolder?.lifetime || infoPanelRoom?.lifetime),
  );

  const navigationButtonIsVisible = !!(
    showNavigationButton || location.state?.isShared
  );

  const getInsideGroupTitle = () => {
    return isLoading && insideGroupTempTitle
      ? insideGroupTempTitle
      : currentGroup?.name;
  };

  const lifetime = selectedFolder?.lifetime || infoPanelRoom?.lifetime;
  const sharedType = location.state?.isExternal && !isPublicRoom;

  const getTitleIcon = () => {
    if (sharedType) return SharedLinkSvgUrl;

    if (navigationButtonIsVisible && !isPublicRoom) return PublicRoomIconUrl;

    if (isLifetimeEnabled) return LifetimeRoomIconUrl;

    return "";
  };

  const getTitleIconTooltip = () => {
    if (sharedType) return t("Files:RecentlyOpenedTooltip");

    if (lifetime)
      return `${t("Files:RoomFilesLifetime", {
        days: lifetime.value,
        period: getLifetimePeriodTranslation(lifetime.period, t),
      })}. ${
        lifetime.deletePermanently
          ? t("Files:AfterFilesWillBeDeletedPermanently")
          : t("Files:FilesMovedToTrashNotice", {
              sectionName: t("Common:TrashSection"),
            })
      }`;

    return null;
  };

  const onLogoClick = () => {
    if (isFrame) return;
    moveToPublicRoom(rootFolderId);
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

  const getAccountsTitle = () => {
    switch (contactsTab) {
      case "people":
        return t("Common:Members");
      case "groups":
        return t("Common:Groups");
      case "inside_group":
        return getInsideGroupTitle();
      case "guests":
        return t("Common:Guests");
      default:
        return t("Common:Members");
    }
  };

  const currentTitle = isProfile
    ? t("Profile:MyProfile")
    : isSettingsPage
      ? t("Common:Settings")
      : isContactsPage
        ? getAccountsTitle()
        : title;

  const titleIcon = getTitleIcon();

  const contextMenuHeader = React.useMemo(() => {
    const srcLogo = selectedFolder?.logo || null;
    const title = currentTitle || selectedFolder?.title || "";
    const headerBadgeUrl = titleIcon.includes("public-room") ? titleIcon : "";

    const iconUrl = getIcon(
      32,
      selectedFolder?.fileExst,
      selectedFolder?.providerKey,
      selectedFolder?.contentLength,
      isRoom ? roomType : undefined,
      selectedFolder?.isArchive,
      selectedFolder?.type,
    );

    const normalizedCover =
      typeof srcLogo?.cover === "string"
        ? { data: srcLogo?.cover, id: "" }
        : srcLogo?.cover;

    const normalizedLogo =
      typeof srcLogo === "object" &&
      srcLogo &&
      !srcLogo?.medium &&
      srcLogo?.original
        ? { ...srcLogo, medium: srcLogo?.original }
        : srcLogo;

    return {
      title,
      icon: normalizedLogo?.medium || iconUrl,
      original: normalizedLogo?.original,
      large: normalizedLogo?.large,
      medium: normalizedLogo?.medium,
      small: normalizedLogo?.small,
      color: normalizedLogo?.color,
      cover: normalizedCover,
      badgeUrl: headerBadgeUrl,
    };
  }, [
    selectedFolder?.logo,
    selectedFolder?.title,
    currentTitle,
    isRoom,
    getIcon,
    selectedFolder?.fileExst,
    selectedFolder?.providerKey,
    selectedFolder?.contentLength,
    selectedFolder?.isArchive,
    selectedFolder?.type,
  ]);

  const currentCanCreate = security?.Create;

  const currentRootRoomTitle =
    navigationPath &&
    navigationPath.length > 1 &&
    navigationPath[navigationPath.length - 2].title;

  const accountsNavigationPath = isContactsInsideGroupPage && [
    {
      id: 0,
      title: t("Common:Contacts"),
      isRoom: false,
      isRootRoom: true,
    },
  ];

  React.useEffect(() => {
    return () => {
      deleteRefMap(GuidanceRefKey.Share);
      deleteRefMap(GuidanceRefKey.Uploading);
    };
  }, [deleteRefMap]);

  const isCurrentRoom = isRoom;

  if (showHeaderLoader) return <SectionHeaderSkeleton />;

  const insideTheRoom =
    (categoryType === CategoryType.SharedRoom ||
      categoryType === CategoryType.Archive) &&
    !isCurrentRoom;

  const logo = getLogoUrl(WhiteLabelLogoType.LightSmall, !theme.isBase);
  const burgerLogo = getLogoUrl(WhiteLabelLogoType.LeftMenu, !theme.isBase);

  const titleIconTooltip = getTitleIconTooltip();

  const navigationButtonLabel = showNavigationButton
    ? t("Files:ShareRoom")
    : null;

  const headerProps = isIndexEditingMode
    ? { headerLabel: t("Common:SortingIndex") }
    : {};

  const closeProps = isIndexEditingMode
    ? { isCloseable: true, onCloseClick: onCloseIndexMenu }
    : {};

  const badgeLabel = showTemplateBadge ? t("Files:Template") : "";

  const warningText = isRecycleBinFolder
    ? t("TrashAutoDeleteWarning", {
        sectionName: t("Common:TrashSection"),
      })
    : isPersonalReadOnly
      ? t("PersonalFolderErasureWarning")
      : "";

  const isContextButtonVisible = () => {
    if (isProfile) return true;

    if (isContactsPage && !isContactsInsideGroupPage) {
      return false;
    }

    if (isPersonalReadOnly) {
      return isRootFolder;
    }

    return (isRecycleBinFolder && !isEmptyFilesList) || !isRootFolder;
  };

  const onPlusClick = () => {
    if (!isContactsPage) return onCreateRoom();
    if (isContactsGroupsPage) return createGroup();
  };

  const isPlusButtonVisible = () => {
    if (!isContactsPage || isContactsGroupsPage) return true;

    const lengthList = getContextOptionsPlus()?.length;
    if (!lengthList || lengthList === 0) return false;

    return true;
  };

  const withMenu = !isRoomsFolder && !isContactsGroupsPage;

  return (
    <Consumer key="header">
      {(context) => (
        <div
          className={classnames(styles.headerContainer, {
            [styles.infoPanelVisible]: isInfoPanelVisible,
            [styles.isExternalFolder]: location.state?.isExternal,
            [styles.isLifetimeEnabled]: isLifetimeEnabled,
          })}
        >
          {tableGroupMenuVisible ? (
            <TableGroupMenu
              withComboBox={!isIndexEditingMode ? !!menuItems : null}
              {...tableGroupMenuProps}
              {...headerProps}
              {...closeProps}
            />
          ) : (
            <div className="header-container">
              <Navigation
                sectionWidth={context.sectionWidth}
                showText={showText}
                isRootFolder={isRoot ? !isContactsInsideGroupPage : null}
                canCreate={
                  (currentCanCreate || (isContactsPage && contactsCanCreate)) &&
                  !isSettingsPage &&
                  !isProfile
                    ? !isPublicRoom
                    : null
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
                onBackToParentFolder={
                  isProfile ? onClickBackProfile : onClickBack
                }
                toggleInfoPanel={isProfile ? undefined : onToggleInfoPanel}
                isInfoPanelVisible={isProfile ? false : isInfoPanelVisible}
                titles={{
                  warningText,
                  actions: isRoomsFolder
                    ? t("Common:NewRoom")
                    : t("Common:Actions"),
                  contextMenu: t("Translations:TitleShowFolderActions"),
                  infoPanel: t("Common:InfoPanel"),
                }}
                withMenu={withMenu}
                onPlusClick={onPlusClick}
                isEmptyPage={isEmptyPage}
                isRoom={isCurrentRoom || isContactsPage || isProfile}
                hideInfoPanel={
                  hideInfoPanel || isSettingsPage || isPublicRoom || isProfile
                }
                withLogo={
                  isPublicRoom || (isFrame && !showMenu && displayAbout)
                    ? logo
                    : null
                }
                burgerLogo={
                  isPublicRoom || (isFrame && !showMenu && displayAbout)
                    ? burgerLogo
                    : null
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
                badgeLabel={badgeLabel}
                onContextOptionsClick={onContextOptionsClick}
                onLogoClick={onLogoClick}
                buttonRef={buttonRefCallback}
                addButtonRef={addButtonRefCallback}
                contextButtonAnimation={contextButtonAnimation}
                guidAnimationVisible={guidAnimationVisible}
                setGuidAnimationVisible={setGuidAnimationVisible}
                isContextButtonVisible={isContextButtonVisible()}
                isPlusButtonVisible={
                  !allowInvitingMembers ? isPlusButtonVisible() : true
                }
                showBackButton={isProfile}
                contextMenuHeader={isProfile ? undefined : contextMenuHeader}
              />
              {showSignInButton ? (
                <Button
                  className="header_sign-in-button"
                  label={t("Common:LoginButton")}
                  size={ButtonSize.small}
                  onClick={onSignInClick}
                  isDisabled={signInButtonIsDisabled}
                  primary
                />
              ) : null}
            </div>
          )}
          {isFrame ? (
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
          ) : null}
          {isProfile ? profileDialogs : null}
        </div>
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
    guidanceStore,
    profileActionsStore,
    mediaViewerDataStore,
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

    const { setRefMap, deleteRefMap } = guidanceStore;

    const {
      setIsSectionBodyLoading,
      showHeaderLoader,

      isLoading,

      currentClientView,
    } = clientLoadingStore;

    const setIsLoading = (param) => {
      setIsSectionBodyLoading(param);
    };

    const {
      isRecycleBinFolder,
      isRoomsFolder,
      isArchiveFolder,
      isPersonalReadOnly,
    } = treeFoldersStore;

    const {
      setReorderDialogVisible,
      setCloseEditIndexDialogVisible,
      welcomeFormFillingTipsVisible,
      setGuidAnimationVisible,
      guidAnimationVisible,
    } = dialogsStore;

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

    const { setIsVisible, isVisible, infoPanelRoomSelection } = infoPanelStore;

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
      theme,
      frameConfig,
      isFrame,
      currentDeviceType,
      displayAbout,
      allowInvitingMembers,
    } = settingsStore;

    const isRoom = !!roomType;

    const {
      onClickEditRoom,
      onClickInviteUsers,
      onClickArchive,
      onCopyLink,
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
      usersStore,
      groupsStore,
      headerMenuStore,
      dialogStore,
      targetUserStore,
    } = peopleStore;

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

    const { setSelected: setUsersSelected, contactsTab } = usersStore;

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
    const isTemplate = rootFolderType === FolderType.RoomTemplates;

    const isShared = shared || navigationPath.find((r) => r.shared);

    const showNavigationButton =
      !security?.CopyLink || isPublicRoom || isArchive
        ? false
        : security?.Read && isShared;

    const rootFolderId = navigationPath.length
      ? navigationPath[navigationPath.length - 1]?.id
      : selectedFolder.id;

    const { setDialogData, setChangeEmailVisible } = dialogStore;
    const {
      setChangePasswordVisible,
      setChangeAvatarVisible,
      setChangeNameVisible,
    } = targetUserStore;

    const { profileClicked } = profileActionsStore;

    const { visible: mediaViewerIsVisible } = mediaViewerDataStore;

    const { showProfileLoader } = clientLoadingStore;

    const { enabledHotkeys } = filesStore;

    return {
      currentClientView,
      showText: settingsStore.showText,
      isDesktop: settingsStore.isDesktopClient,
      showHeaderLoader,
      isLoading,
      isRootFolder: isPublicRoom && !folderPath?.length ? true : isRoot,
      title,
      isRoom,
      roomType,

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
      isPersonalReadOnly,
      isEmptyFilesList,
      isEmptyArchive,
      isArchiveFolder,

      setIsLoading,

      isRoomsFolder,

      selectedFolder,

      onClickEditRoom,
      onClickInviteUsers,
      onClickArchive,
      onCopyLink,

      isGroupMenuBlocked,

      moveToRoomsPage,
      onClickBack,
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
      hideInfoPanel: isFrame,
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
      infoPanelRoom: infoPanelRoomSelection,
      getPublicKey,
      getIndexingArray,
      setCloseEditIndexDialogVisible,
      welcomeFormFillingTipsVisible,
      guidAnimationVisible,
      setGuidAnimationVisible,
      setRefMap,
      deleteRefMap,
      showTemplateBadge: isTemplate && !isRoot,
      allowInvitingMembers,

      profile: userStore.user,
      profileClicked,
      enabledHotkeys:
        enabledHotkeys && !mediaViewerIsVisible && !showProfileLoader,

      setDialogData,
      setChangeEmailVisible,
      setChangePasswordVisible,
      setChangeAvatarVisible,
      setChangeNameVisible,
      getIcon: filesStore.filesSettingsStore.getIcon,

      contactsTab,
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
    "Profile",
  ])(observer(SectionHeaderContent)),
);
