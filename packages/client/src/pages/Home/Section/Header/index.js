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

import PublicRoomIconUrl from "PUBLIC_DIR/images/public-room.react.svg?url";
import PublicRoomRestrictedIconUrl from "PUBLIC_DIR/images/public-room.restricted.react.svg?url";
import LifetimeRoomIconUrl from "PUBLIC_DIR/images/lifetime-room.react.svg?url";
import EncryptedRoomIconUrl from "PUBLIC_DIR/images/icons/16/security.private.react.svg?url";
import RoundedArrowSvgUrl from "PUBLIC_DIR/images/rounded arrow.react.svg?url";
import SharedLinkSvgUrl from "PUBLIC_DIR/images/icons/16/shared.link.svg?url";
import CheckIcon from "PUBLIC_DIR/images/check.edit.react.svg?url";
import WarningQuotaExceededUrl from "PUBLIC_DIR/images/warning.quota-exceeded.react.svg?url";

import React from "react";
import classnames from "classnames";

import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { useLocation } from "react-router";

import { SectionHeaderSkeleton } from "@docspace/shared/skeletons/sections";
import Navigation from "@docspace/ui-kit/components/navigation";
import FilesFilter from "@docspace/shared/api/files/filter";
import { DropDownItem } from "@docspace/shared/components/drop-down-item";
import {
  getLogoUrl,
  getCheckboxItemId,
  getCheckboxItemLabel,
} from "@docspace/shared/utils";
import { Context } from "@docspace/ui-kit/utils/context";
import { TableGroupMenu } from "@docspace/ui-kit/components/table";
import {
  RoomsType,
  DeviceType,
  FolderType,
  WhiteLabelLogoType,
  SearchArea,
} from "@docspace/shared/enums";

import { CategoryType, EMPTY_ARRAY } from "@docspace/shared/constants";
import {
  getCategoryTypeByFolderType,
  getCategoryUrl,
} from "SRC_DIR/helpers/utils";
import {
  showInfoPanel,
  hideInfoPanel as hideInfoPanelEvent,
} from "SRC_DIR/helpers/info-panel";
import { getContactsView, createGroup } from "SRC_DIR/helpers/contacts";
import TariffBar from "SRC_DIR/components/TariffBar";
import {
  getLifetimePeriodTranslation,
  getCategoryType,
} from "@docspace/shared/utils/common";
import getFilesFromEvent from "@docspace/shared/utils/get-files-from-event";
import { toastr } from "@docspace/ui-kit/components/toast";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { useAiChatStore } from "@docspace/ui-kit/ai-agent/providers/ai-chat-store";
import { useIsAiChatAvailable } from "@docspace/ui-kit/ai-agent/providers/availability";
import { useOpenAiChat } from "@docspace/ui-kit/ai-agent/ai-chat-panel/hooks/useOpenAiChat";
import styles from "@docspace/shared/styles/SectionHeader.module.scss";
import useProfileHeader from "SRC_DIR/pages/Profile/Section/Header/useProfileHeader";

import { useContactsHeader } from "./useContacts";
import { getWarningText } from "../getWarningText";
import { AnalyzeResponsesButton } from "./sub-components/AnalyzeResponses";

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
    moveToAIAgentsPage,
    // setIsInfoPanelVisible,

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
    isGroupsEmpty,
    groupsIsFiltered,

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
    contactsCanCreate,
    onCreateRoom,
    onCreateAgent,
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
    getIndexingArray,
    setCloseEditIndexDialogVisible,
    rootFolderId,
    isPersonalReadOnly,
    isPrivacyFolder,
    showTemplateBadge,

    isAIRoom,
    isAIAgent,
    isRoomStorageQuotaExceeded,
    roomUsedSpace,
    roomQuotaLimit,
    isKnowledgeTab,
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
    isRootRooms,
    isArchive,
    isSharedWithMeFolderRoot,
    isAIAgentsFolder,
    filesSelection,
    isCollaborator,
    isVisitor,
    isExternalShareRestricted,
    blockExistingLinksOnRestrict,
    hasExternalLinks,
  } = props;

  const location = useLocation();
  const { sectionWidth } = React.use(Context);

  const contactsView = getContactsView(location);
  const isContactsPage = !!contactsView;
  const isContactsGroupsPage = contactsTab === "groups";
  const isContactsInsideGroupPage = contactsTab === "inside_group";
  const isProfile = currentClientView === "profile";

  // The "Forms" section reuses the Rooms folder; detect it from the route to
  // adjust section labels (title, create-button caption) accordingly. This is
  // the bare forms LIST only (CategoryType.Forms); inside a form room the
  // route is /forms/{id}/... (CategoryType.Form) where the room-level labels
  // apply instead.
  const isFormsSection = getCategoryType(location) === CategoryType.Forms;

  // The whole Forms route tree — the list AND any folder opened inside a
  // form-filling room. Breadcrumb navigation uses this to keep the /forms
  // scope: form rooms live in the VirtualRooms tree, so their folders report
  // rootFolderType = Rooms (14); deriving the URL from that alone would send
  // the crumb to /rooms/shared/... and switch the section to Rooms.
  const isFormsRoute = location.pathname.startsWith("/forms");
  const currentGroupName = currentGroup?.name;

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

  const onToggleInfoPanel = React.useCallback(() => {
    if (!isInfoPanelVisible) {
      showInfoPanel();
    } else {
      hideInfoPanelEvent();
    }
    // setIsInfoPanelVisible(!isInfoPanelVisible);
  }, [hideInfoPanelEvent, isInfoPanelVisible, showInfoPanel]);

  // The AI chat panel is hosted by Home (see `useAiChatPanel` there), so the
  // provider is always mounted above this header and the strict store hook is
  // safe. `usePanelExclusivity` takes care of closing the info panel when the
  // chat opens, so the toggle only has to flip its own panel.
  const aiChatStore = useAiChatStore();
  const openAiChat = useOpenAiChat();
  const isAiChatAvailable = useIsAiChatAvailable();

  const onToggleChatPanel = React.useCallback(() => {
    if (aiChatStore.isVisible) {
      aiChatStore.close();
    } else {
      openAiChat();
    }
  }, [aiChatStore, openAiChat]);

  const getContextOptionsFolder = React.useCallback(() => {
    if (isProfile) return getUserContextOptions();

    if (isContactsInsideGroupPage) {
      return getGroupContextOptions(t, currentGroup, false, true);
    }

    return getHeaderOptions(t, selectedFolder);
  }, [
    isProfile,
    getUserContextOptions,
    isContactsInsideGroupPage,
    currentGroup,
    getGroupContextOptions,
    t,
    selectedFolder,
    getHeaderOptions,
  ]);

  const onContextOptionsClick = React.useCallback(() => {
    if (isContactsInsideGroupPage) setGroupsBufferSelection(currentGroup);
    else if (!isContactsPage) setBufferSelection(selectedFolder);
  }, [
    isContactsInsideGroupPage,
    currentGroup,
    setGroupsBufferSelection,
    isContactsPage,
    setBufferSelection,
    selectedFolder,
  ]);

  const onSelect = React.useCallback(
    (e) => {
      const key = e.currentTarget.dataset.key;

      setSelected(key);
    },
    [setSelected],
  );

  const onClose = React.useCallback(() => {
    isContactsPage ? setUsersSelected("close") : setSelected("close");
  }, [isContactsPage, setUsersSelected, setSelected]);

  const menuItems = React.useMemo(() => {
    if (isAIAgentsFolder) return null;

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
              truncateText
            />
          );
        })}
      </>
    );

    return checkboxOptions;
  }, [
    cbMenuItems,
    isAIAgentsFolder,
    isContactsPage,
    getContactsMenuItems,
    onSelect,
  ]);

  const onChange = React.useCallback(
    (checked) => {
      if (isProfile) return;

      isContactsPage
        ? onContactsChange(checked)
        : setSelected(checked ? "all" : "none");
    },
    [isProfile, isContactsPage, onContactsChange, setSelected],
  );

  const onClickFolder = React.useCallback(
    async (id, isRootRoom, isRootTemplates) => {
      if (isPublicRoom) {
        return moveToPublicRoom(id);
      }

      const rootFolderType = selectedFolder.rootFolderType;

      if (isRootRoom && rootFolderType === FolderType.AIAgents) {
        return moveToAIAgentsPage();
      }

      if (isRootRoom || isRootTemplates) {
        return moveToRoomsPage();
      }

      setSelectedNode(id);

      // The Forms section resolves its rooms from the VirtualRooms tree, so
      // folders opened inside a form-filling room report rootFolderType =
      // Rooms (14), not Forms. Deriving the category from rootFolderType would
      // send the breadcrumb to /rooms/shared/... and highlight Rooms. Detect
      // the Forms route instead and keep the /forms scope (id is always a real
      // folder/room id here, so it maps to CategoryType.Form → /forms/{id}).
      const categoryType = isFormsRoute
        ? CategoryType.Form
        : getCategoryTypeByFolderType(rootFolderType, id);

      const path = getCategoryUrl(categoryType, id);

      const filter = FilesFilter.getDefault();

      filter.folder = id;

      const itemIdx = selectedFolder.navigationPath.findIndex(
        (v) => v.id === id,
      );

      const isRoomCalc =
        selectedFolder.navigationPath[itemIdx]?.isRoom || false;

      if (isAIRoom && isRoomCalc) {
        filter.searchArea = SearchArea.ResultStorage;
      }

      const state = {
        title: selectedFolder.navigationPath[itemIdx]?.title || "",
        isRoot: itemIdx === selectedFolder.navigationPath.length - 1,
        isRoom: isRoomCalc,
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
    },
    [
      isPublicRoom,
      moveToPublicRoom,
      moveToAIAgentsPage,
      moveToRoomsPage,
      selectedFolder,
      setSelectedNode,
      isAIRoom,
      setSelected,
      setIsLoading,
      isFormsRoute,
    ],
  );

  const getContextOptionsPlus = React.useCallback(
    () => getFolderModel(t),
    [getFolderModel, t],
  );

  const onPlusClick = React.useCallback(() => {
    if (isContactsGroupsPage) return createGroup();
    if (isAIAgentsFolder) return onCreateAgent();
    return onCreateRoom();
  }, [isContactsGroupsPage, isAIAgentsFolder, onCreateAgent, onCreateRoom]);

  const isPlusButtonVisible =
    (isEmptyPage && !isContactsPage) ||
    (isContactsGroupsPage && isGroupsEmpty && !groupsIsFiltered);

  const onNavigationButtonClick = React.useCallback(() => {
    const roomInPath = navigationPath?.find((item) => item.isRoom);

    const shareTarget =
      !selectedFolder?.isRoom && roomInPath
        ? {
            ...roomInPath,
            isRoom: true,
            rootFolderType: selectedFolder?.rootFolderType,
          }
        : selectedFolder;

    onCreateAndCopySharedLink(shareTarget, t);
  }, [onCreateAndCopySharedLink, navigationPath, selectedFolder, t]);

  const onCloseIndexMenu = React.useCallback(() => {
    const items = getIndexingArray();

    if (items.length) {
      setCloseEditIndexDialogVisible(true);
      return;
    }

    revokeFilesOrder();
    setIsIndexEditingMode(false);
  }, [
    getIndexingArray,
    setCloseEditIndexDialogVisible,
    revokeFilesOrder,
    setIsIndexEditingMode,
  ]);

  const onIndexReorder = React.useCallback(() => {
    setReorderDialogVisible(true);
  }, [setReorderDialogVisible]);

  const onIndexApply = React.useCallback(() => {
    saveIndexOfFiles(t);
    setIsIndexEditingMode(false);
  }, [t, setIsIndexEditingMode]);

  const isRoot = isRootFolder || isContactsPage || isSettingsPage || isProfile;

  const isLifetimeEnabled = Boolean(
    !isRoot && (selectedFolder?.lifetime || infoPanelRoom?.lifetime),
  );

  const navigationButtonIsVisible = !!(
    showNavigationButton || location.state?.isShared
  );

  const lifetime = selectedFolder?.lifetime || infoPanelRoom?.lifetime;
  const sharedType =
    (location.state?.isExternal || selectedFolder?.external) && !isPublicRoom;
  const isEncryptedRoom = selectedFolder?.private === true || isPrivacyFolder;

  const titleIcon = React.useMemo(() => {
    if (sharedType) return SharedLinkSvgUrl;

    if (isEncryptedRoom) return EncryptedRoomIconUrl;

    if (navigationButtonIsVisible && !isPublicRoom) {
      const roomInPath = (
        isArchive ? selectedFolder?.navigationPath : navigationPath
      )?.find((item) => item.isRoom);

      const isInsideRoom = !!roomInPath;
      const isInPublicRoom = isInsideRoom && roomInPath?.shared;
      const isShared = roomInPath?.shared || selectedFolder?.shared;

      if (
        isInPublicRoom ||
        (isShared && (isArchive ? selectedFolder?.isRoom : isRoom))
      ) {
        return isExternalShareRestricted &&
          blockExistingLinksOnRestrict &&
          hasExternalLinks
          ? PublicRoomRestrictedIconUrl
          : PublicRoomIconUrl;
      } else if (!isRootRooms && !isArchive && !isSharedWithMeFolderRoot)
        return PublicRoomIconUrl;
    }

    if (isLifetimeEnabled) return LifetimeRoomIconUrl;

    return "";
  }, [
    sharedType,
    isEncryptedRoom,
    navigationButtonIsVisible,
    isPublicRoom,
    isArchive,
    selectedFolder,
    navigationPath,
    isRootRooms,
    isRoom,
    isSharedWithMeFolderRoot,
    isLifetimeEnabled,
    isExternalShareRestricted,
    blockExistingLinksOnRestrict,
    hasExternalLinks,
  ]);

  const titleTooltip = React.useMemo(() => {
    if (
      isRoom &&
      selectedFolder?.shared &&
      isExternalShareRestricted &&
      blockExistingLinksOnRestrict &&
      hasExternalLinks
    )
      return t("Common:ExternalAccessDisabledByAdmin");

    return undefined;
  }, [
    isRoom,
    selectedFolder,
    isExternalShareRestricted,
    blockExistingLinksOnRestrict,
    hasExternalLinks,
    t,
  ]);

  const titleIconTooltip = React.useMemo(() => {
    if (sharedType) return t("Files:RecentlyOpenedTooltip");

    if (isEncryptedRoom) return t("Common:PrivateRoomDescription");

    if (lifetime)
      return `${t("Common:RoomFilesLifetime", {
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
  }, [sharedType, isEncryptedRoom, lifetime, t]);

  const onLogoClick = React.useCallback(() => {
    if (isFrame) return;
    moveToPublicRoom(rootFolderId);
  }, [isFrame, rootFolderId, moveToPublicRoom]);

  const filesHeaderMenu =
    !isHeaderVisible || filesSelection.length === 0
      ? EMPTY_ARRAY
      : getHeaderMenu(t);

  const contactsHeaderMenu =
    !isUsersHeaderVisible && !isGroupsHeaderVisible
      ? EMPTY_ARRAY
      : getContactsHeaderMenu(t, isContactsGroupsPage);

  const indexEditingMenu = React.useMemo(() => {
    if (!isIndexEditingMode) return EMPTY_ARRAY;

    return [
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
    ];
  }, [t, onIndexReorder, onIndexApply, isIndexEditingMode]);

  const headerMenu = React.useMemo(() => {
    if (isIndexEditingMode) return indexEditingMenu;

    if (isContactsPage) return contactsHeaderMenu;

    return filesHeaderMenu;
  }, [
    isIndexEditingMode,
    isContactsPage,
    indexEditingMenu,
    contactsHeaderMenu,
    filesHeaderMenu,
  ]);

  const isContactSection =
    isContactsPage && !(isContactsGroupsPage && isRoomAdmin);

  const tableGroupMenuProps = React.useMemo(() => {
    const isChecked = isContactSection
      ? isContactsGroupsPage
        ? isGroupsHeaderChecked
        : isUsersHeaderChecked
      : isHeaderChecked;

    const isIndeterminate = isContactSection
      ? isContactsGroupsPage
        ? isGroupsHeaderIndeterminate
        : isUsersHeaderIndeterminate
      : isHeaderIndeterminate;

    const withoutInfoPanelToggler =
      !isContactSection && (isIndexEditingMode || isPublicRoom);

    const isBlocked = !isContactSection && isGroupMenuBlocked;

    return {
      checkboxOptions: menuItems,
      onChange,
      headerMenu,
      isInfoPanelVisible,
      toggleInfoPanel: onToggleInfoPanel,
      isMobileView: currentDeviceType === DeviceType.mobile,
      isChecked,
      isIndeterminate,
      withoutInfoPanelToggler,
      isBlocked,
    };
  }, [
    isContactSection,
    isContactsGroupsPage,
    isUsersHeaderChecked,
    isGroupsHeaderChecked,
    isUsersHeaderIndeterminate,
    isGroupsHeaderIndeterminate,
    isHeaderChecked,
    isHeaderIndeterminate,
    isGroupMenuBlocked,
    isIndexEditingMode,
    isPublicRoom,

    menuItems,
    onChange,
    headerMenu,
    isInfoPanelVisible,
    onToggleInfoPanel,
    currentDeviceType,
  ]);

  const tableGroupMenuVisible = React.useMemo(() => {
    const hasHeaderMenu = headerMenu.length > 0;

    if (isContactSection) {
      return (
        (!isContactsGroupsPage
          ? isUsersHeaderVisible
          : isGroupsHeaderVisible) &&
        hasHeaderMenu &&
        headerMenu.some((x) => !x.disabled)
      );
    }
    return (isIndexEditingMode || isHeaderVisible) && hasHeaderMenu;
  }, [
    isContactSection,
    isContactsGroupsPage,
    isUsersHeaderVisible,
    isGroupsHeaderVisible,
    headerMenu,
    isIndexEditingMode,
    isHeaderVisible,
  ]);

  const currentTitle = React.useMemo(() => {
    if (isProfile) return t("Profile:MyProfile");

    if (isSettingsPage) return t("Common:Settings");

    if (getCategoryType(location) === CategoryType.Forms)
      return selectedFolder?.rootFolderType === FolderType.RoomTemplates
        ? t("Common:Templates")
        : t("Common:Forms");

    if (isContactsPage) {
      switch (contactsTab) {
        case "people":
          return t("Common:Members");
        case "groups":
          return t("Common:Groups");
        case "inside_group": {
          return isLoading && insideGroupTempTitle
            ? insideGroupTempTitle
            : currentGroupName;
        }
        case "guests":
          return t("Common:Guests");
        default:
          return t("Common:Members");
      }
    }

    return title;
  }, [
    t,
    isProfile,
    isSettingsPage,
    isContactsPage,
    contactsTab,
    isLoading,
    insideGroupTempTitle,
    currentGroupName,
    title,
    location,
    selectedFolder?.rootFolderType,
  ]);

  const contextMenuHeader = React.useMemo(() => {
    const srcLogo = selectedFolder?.logo || null;
    const title = currentTitle || selectedFolder?.title || "";
    const headerBadgeUrl =
      titleIcon.includes("public-room") || titleIcon.includes("security")
        ? titleIcon
        : "";

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

  const currentCanCreate =
    isAIRoom && !isKnowledgeTab ? false : security?.Create;

  const currentRootRoomTitle =
    navigationPath &&
    navigationPath.length > 1 &&
    navigationPath[navigationPath.length - 2].title;

  const accountsNavigationPath = React.useMemo(() => {
    if (isContactsInsideGroupPage) {
      return [
        {
          id: 0,
          title: t("Common:Contacts"),
          isRoom: false,
          isRootRoom: true,
        },
      ];
    }

    return [];
  }, [isContactsInsideGroupPage, t]);

  const isCurrentRoom = isRoom;

  const insideTheRoom =
    (categoryType === CategoryType.SharedRoom ||
      categoryType === CategoryType.Form ||
      categoryType === CategoryType.Archive) &&
    !isCurrentRoom;

  const insideTheAgent = categoryType === CategoryType.AIAgent && !isAIAgent;

  const logo = React.useMemo(
    () =>
      getLogoUrl(WhiteLabelLogoType.LightSmall, !theme.isBase, false, "", true),
    [theme.isBase],
  );
  const burgerLogo = React.useMemo(
    () =>
      getLogoUrl(WhiteLabelLogoType.LeftMenu, !theme.isBase, false, "", true),
    [theme.isBase],
  );

  const navigationButtonLabel = showNavigationButton
    ? t("Files:ShareRoom")
    : null;

  const headerProps = React.useMemo(
    () => (isIndexEditingMode ? { headerLabel: t("Common:SortingIndex") } : {}),
    [isIndexEditingMode, t],
  );

  const closeProps = React.useMemo(
    () =>
      isIndexEditingMode
        ? { isCloseable: true, onCloseClick: onCloseIndexMenu }
        : {},
    [isIndexEditingMode, onCloseIndexMenu],
  );

  const badgeLabel = showTemplateBadge ? t("Files:Template") : "";

  const warningText = getWarningText({
    t,
    isRecycleBinFolder,
    isPersonalReadOnly,
    isRoomStorageQuotaExceeded,
    roomUsedSpace,
    roomQuotaLimit,
  });

  const isContextButtonVisible = React.useMemo(() => {
    if (isProfile) return true;

    if (isContactsPage && !isContactsInsideGroupPage) {
      return false;
    }

    if (isPersonalReadOnly) {
      return isRootFolder;
    }

    return (isRecycleBinFolder && !isEmptyFilesList) || !isRootFolder;
  }, [
    isProfile,
    isContactsPage,
    isContactsInsideGroupPage,
    isPersonalReadOnly,
    isRecycleBinFolder,
    isEmptyFilesList,
    isRootFolder,
  ]);

  const withMenu = !isRoomsFolder && !isContactsGroupsPage && !isAIAgentsFolder;

  if (showHeaderLoader) return <SectionHeaderSkeleton />;

  return (
    <>
      <div
        className={classnames(styles.headerContainer, {
          [styles.infoPanelVisible]: isInfoPanelVisible,
          [styles.isExternalFolder]:
            location.state?.isExternal || selectedFolder?.external,
          [styles.isLifetimeEnabled]: isLifetimeEnabled,
          [styles.isColoredTitleIcon]:
            titleIcon === PublicRoomRestrictedIconUrl,
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
              sectionWidth={sectionWidth}
              showText={showText}
              isRootFolder={isRoot ? !isContactsInsideGroupPage : null}
              canCreate={
                (currentCanCreate ||
                  (isContactsPage &&
                    contactsCanCreate &&
                    !isCollaborator &&
                    !isVisitor)) &&
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
              toggleChatPanel={onToggleChatPanel}
              isChatPanelVisible={aiChatStore.isVisible}
              hideChatButton={
                !isAiChatAvailable ||
                isSettingsPage ||
                isPublicRoom ||
                isProfile
              }
              titles={{
                warningText,
                warningIcon: isRoomStorageQuotaExceeded
                  ? WarningQuotaExceededUrl
                  : undefined,
                actions: isFormsSection
                  ? t("Common:CreateFormSet")
                  : isRoomsFolder
                    ? t("Common:NewRoom")
                    : t("Common:Actions"),
                contextMenu: t("Common:TitleShowFolderActions"),
                infoPanel: t("Common:InfoPanel"),
                aiChat: t("Common:AIChatButton"),
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
              titleTooltip={titleTooltip}
              showRootFolderTitle={
                insideTheRoom || insideTheAgent || isContactsInsideGroupPage
              }
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
              isContextButtonVisible={isContextButtonVisible}
              isPlusButtonVisible={isPlusButtonVisible}
              showBackButton={isProfile}
              contextMenuHeader={isProfile ? undefined : contextMenuHeader}
              analyzeResponsesButton={
                <AnalyzeResponsesButton
                  className={styles.analyzeResponsesButton}
                />
              }
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
    </>
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
    aiRoomStore,
    profileActionsStore,
    mediaViewerDataStore,
  }) => {
    const { startUpload } = uploadDataStore;

    const isRoomAdmin = userStore.user?.isRoomAdmin;
    const isCollaborator = userStore.user?.isCollaborator;
    const isVisitor = userStore.user?.isVisitor;

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
      selection: filesSelection,
    } = filesStore;

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
      isSharedWithMeFolderRoot,
      isAIAgentsFolder,
      isPrivacyFolder,
    } = treeFoldersStore;

    const {
      setReorderDialogVisible,
      setCloseEditIndexDialogVisible,
    } = dialogsStore;

    const {
      getHeaderMenu,
      isGroupMenuBlocked,
      moveToRoomsPage,
      moveToAIAgentsPage,
      onClickBack,
      moveToPublicRoom,
      createFoldersTree,
      revokeFilesOrder,
      saveIndexOfFiles,
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
      isAIRoom,
      isAIAgent,
      isRoomStorageQuotaExceeded,
      roomUsedSpace,
      roomQuotaLimit,
    } = selectedFolderStore;

    const selectedFolder = selectedFolderStore.getSelectedFolder();

    const { theme, frameConfig, isFrame, currentDeviceType, displayAbout } =
      settingsStore;

    const isRoom = !!roomType;

    const {
      onClickEditRoom,
      onCopyLink,
      onCreateAndCopySharedLink,
      getFolderModel,
      onCreateRoom,
      onCreateAgent,
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
      groups,
      groupsIsFiltered,
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

    const { contactsCanCreate } = peopleStore.contextOptionsStore;

    const { setSelected: setUsersSelected, contactsTab } = usersStore;

    const { isIndexEditingMode, setIsIndexEditingMode, getIndexingArray } =
      indexingStore;
    const { isPublicRoom, hasExternalLinks } = publicRoomStore;

    let folderPath = navigationPath;

    if (isFrame && pathParts) {
      folderPath = navigationPath.filter((item) => !item.isRootRoom);
    }

    const isRoot =
      isFrame && frameConfig?.id
        ? pathParts?.length === 1 || pathParts?.length === 2
        : pathParts?.length === 1;

    const isArchive = rootFolderType === FolderType.Archive;
    const isTemplate = rootFolderType === FolderType.RoomTemplates;
    const isRootRooms = rootFolderType === FolderType.Rooms;

    const isShared = shared || navigationPath.find((r) => r.shared);

    const rootFolderId = navigationPath.length
      ? navigationPath[navigationPath.length - 1]?.id
      : selectedFolder.id;

    const { isKnowledgeTab } = aiRoomStore;
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
    const {
      getIcon,
      isExternalShareRestricted: isShareRestricted,
      externalShareApplyToRooms,
      externalShareApplyToDocuments,
      blockExistingLinksOnRestrict,
    } = filesStore.filesSettingsStore;

    const isExternalShareRestricted =
      isShareRestricted &&
      (isRoom ? externalShareApplyToRooms : externalShareApplyToDocuments);

    const showNavigationButton = !!((!security?.CopySharedLink && !isArchive) ||
    isPublicRoom ||
    isSharedWithMeFolderRoot ||
    isArchive ||
    !isRootRooms
      ? false
      : security?.Read && isShared);

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
      isPrivacyFolder,

      setIsLoading,

      isRoomsFolder,

      selectedFolder,

      onClickEditRoom,
      onCopyLink,

      isGroupMenuBlocked,

      moveToRoomsPage,
      moveToAIAgentsPage,
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
      isVisitor,
      isEmptyPage,
      isGroupsEmpty: groups?.length === 0,
      groupsIsFiltered,
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
      onCreateAgent,
      onEmptyTrashAction,
      getHeaderOptions,
      setBufferSelection,
      setReorderDialogVisible,
      setGroupsBufferSelection,
      createFoldersTree,
      contactsCanCreate,
      revokeFilesOrder,
      saveIndexOfFiles,

      rootFolderId,
      displayAbout,
      infoPanelRoom: infoPanelRoomSelection,
      getIndexingArray,
      setCloseEditIndexDialogVisible,
      showTemplateBadge: isTemplate && !isRoot,

      isAIRoom,
      isAIAgent,
      isRoomStorageQuotaExceeded,
      roomUsedSpace,
      roomQuotaLimit,
      isKnowledgeTab,
      contactsTab,

      profile: userStore.user,
      profileClicked,
      enabledHotkeys:
        enabledHotkeys && !mediaViewerIsVisible && !showProfileLoader,

      setDialogData,
      setChangeEmailVisible,
      setChangePasswordVisible,
      setChangeAvatarVisible,
      setChangeNameVisible,
      getIcon,
      isExternalShareRestricted,
      blockExistingLinksOnRestrict,
      hasExternalLinks,

      isRootRooms,
      isArchive,
      isSharedWithMeFolderRoot,
      isAIAgentsFolder,
      filesSelection,
    };
  },
)(
  withTranslation([
    "Files",
    "Common",
    "Translations",
    "InfoPanel",
    "People",
    "PeopleTranslations",
    "ChangeUserTypeDialog",
    "Notifications",
    "Profile",
    "GroupingRooms",
  ])(observer(SectionHeaderContent)),
);
