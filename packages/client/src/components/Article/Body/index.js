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

import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { useLocation } from "react-router";

import { DeviceType, RoomSearchArea } from "@docspace/shared/enums";

import FilesFilter from "@docspace/shared/api/files/filter";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import AccountsFilter from "@docspace/shared/api/people/filter";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";
import { ArticleFolderLoader } from "@docspace/shared/skeletons/article";
import { MEDIA_VIEW_URL } from "@docspace/shared/constants";
import { getUserFilter } from "@docspace/shared/utils/userFilterUtils";
import {
  FILTER_DOCUMENTS,
  FILTER_RECENT,
  FILTER_FAVORITES,
  FILTER_TRASH,
} from "@docspace/shared/utils/filterConstants";

import Banner from "./Banner";
import Items from "./Items";
import AccountsItems from "./AccountsItems";

const ArticleBodyContent = (props) => {
  const {
    isDesktopClient,
    firstLoad,

    showText,
    toggleArticleOpen,

    roomsFolderId,
    roomsFilter,
    archiveFolderId,
    myFolderId,
    favoritesFolderId,
    recycleBinFolderId,
    rootFolderId,
    recentFolderId,

    isVisitor,
    setIsLoading,

    selectedFolderId,
    showArticleLoader,
    setIsBurgerLoading,
    setSelection,
    currentDeviceType,
    campaigns,
    userId,
    isFrame,

    displayBanners,
    startDrag,
    setDropTargetPreview,

    isRoomAdmin,
  } = props;

  const location = useLocation();

  const getHashDate = () => new Date().getTime();

  const [activeItemId, setActiveItemId] = React.useState(null);
  const [hashDate, setHashDate] = React.useState(getHashDate);

  const getLinkData = React.useCallback(
    (folderId, title, rootFolderType, canCreate) => {
      let params = null;
      let path = ``;

      const state = {
        title,
        isRoot: true,
        isPublicRoomType: false,
        rootFolderType,
        canCreate,
      };

      switch (folderId) {
        case recentFolderId: {
          const recentFilter = FilesFilter.getDefault({ isRecentFolder: true });
          recentFilter.folder = folderId;

          if (userId) {
            const { sortBy, sortOrder } = getUserFilter(
              `${FILTER_RECENT}=${userId}`,
            );

            if (sortBy) recentFilter.sortBy = sortBy;
            if (sortOrder) recentFilter.sortOrder = sortOrder;
          }

          params = recentFilter.toUrlParams();

          path = getCategoryUrl(CategoryType.Recent);

          break;
        }
        case myFolderId: {
          const myFilter = FilesFilter.getDefault();
          myFilter.folder = folderId;

          if (userId) {
            const filterObj = getUserFilter(`${FILTER_DOCUMENTS}=${userId}`);

            if (filterObj?.sortBy) myFilter.sortBy = filterObj.sortBy;
            if (filterObj?.sortOrder) myFilter.sortOrder = filterObj.sortOrder;
          }

          params = myFilter.toUrlParams();

          path = getCategoryUrl(CategoryType.Personal);

          break;
        }
        case favoritesFolderId: {
          const favFilter = FilesFilter.getDefault();
          favFilter.folder = folderId;

          if (userId) {
            const filterObj = getUserFilter(`${FILTER_FAVORITES}=${userId}`);

            if (filterObj?.sortBy) favFilter.sortBy = filterObj.sortBy;
            if (filterObj?.sortOrder) favFilter.sortOrder = filterObj.sortOrder;
          }

          params = favFilter.toUrlParams();
          path = getCategoryUrl(CategoryType.Favorite);

          break;
        }
        case archiveFolderId: {
          const archiveFilter = RoomsFilter.getDefault(
            userId,
            RoomSearchArea.Archive,
          );
          archiveFilter.searchArea = RoomSearchArea.Archive;
          params = archiveFilter.toUrlParams(userId, true);
          path = getCategoryUrl(CategoryType.Archive);

          break;
        }
        case recycleBinFolderId: {
          const recycleBinFilter = FilesFilter.getDefault();
          recycleBinFilter.folder = folderId;

          if (userId) {
            const filterTrashObj = getUserFilter(`${FILTER_TRASH}=${userId}`);

            if (filterTrashObj?.sortBy)
              recycleBinFilter.sortBy = filterTrashObj.sortBy;
            if (filterTrashObj?.sortOrder)
              recycleBinFilter.sortOrder = filterTrashObj.sortOrder;
          }

          params = recycleBinFilter.toUrlParams();
          path = getCategoryUrl(CategoryType.Trash);

          break;
        }
        case "accounts": {
          const accountsFilter = AccountsFilter.getDefault();
          params = accountsFilter.toUrlParams();
          path = getCategoryUrl(CategoryType.Accounts);

          break;
        }
        case "groups": {
          const accountsFilter = AccountsFilter.getDefault();
          params = accountsFilter.toUrlParams();
          path = getCategoryUrl(CategoryType.Groups);

          break;
        }
        case "guests": {
          const accountsFilter = AccountsFilter.getDefault();
          if (!isRoomAdmin) {
            accountsFilter.area = "guests";
            accountsFilter.inviterId = userId;
          }

          params = accountsFilter.toUrlParams();
          path = getCategoryUrl(CategoryType.Guests);

          break;
        }
        default: {
          const newRoomsFilter = RoomsFilter.getDefault(
            userId,
            RoomSearchArea.Active,
          );
          newRoomsFilter.searchArea = RoomSearchArea.Active;
          params = newRoomsFilter.toUrlParams(userId, true);
          path = getCategoryUrl(CategoryType.Shared);

          break;
        }
      }

      if (params.at(-1) === "&") params = params.slice(0, -1);
      path += `?${params}&date=${hashDate}`;

      return { path, state };
    },
    [
      roomsFolderId,
      archiveFolderId,
      myFolderId,
      favoritesFolderId,
      recycleBinFolderId,
      activeItemId,
      hashDate,
      roomsFilter,
      recentFolderId,
    ],
  );

  const onClick = React.useCallback(
    (e, folderId) => {
      if (e?.ctrlKey || e?.metaKey || e?.shiftKey || e?.button) return;

      const isAccountsClick = folderId === "accounts";

      const withTimer = isAccountsClick
        ? window.location.pathname.includes("accounts") &&
          !window.location.pathname.includes("groups")
        : !!selectedFolderId;

      setHashDate(getHashDate);

      setSelection?.([]);

      setIsLoading(true, withTimer);

      if (currentDeviceType === DeviceType.mobile) {
        toggleArticleOpen();
      }
    },
    [
      roomsFolderId,
      archiveFolderId,
      myFolderId,
      recycleBinFolderId,
      activeItemId,
      selectedFolderId,
      setSelection,
    ],
  );

  React.useEffect(() => {
    if (
      location.pathname.includes("/recent") &&
      activeItemId !== recentFolderId
    )
      return setActiveItemId(recentFolderId);

    if (
      location.pathname.includes("/rooms/shared") &&
      activeItemId !== roomsFolderId
    )
      return setActiveItemId(roomsFolderId);

    if (
      location.pathname.includes("/rooms/archived") &&
      activeItemId !== archiveFolderId
    )
      return setActiveItemId(archiveFolderId);

    if (
      location.pathname.includes("/rooms/personal") &&
      activeItemId !== myFolderId
    )
      return setActiveItemId(myFolderId);

    if (
      location.pathname.includes("/files/trash") &&
      activeItemId !== recycleBinFolderId
    )
      return setActiveItemId(recycleBinFolderId);

    if (
      location.pathname.includes("/files/favorite") &&
      activeItemId !== favoritesFolderId
    )
      return setActiveItemId(favoritesFolderId);

    if (location.pathname.includes("/groups") && activeItemId !== "groups")
      return setActiveItemId("groups");

    if (location.pathname.includes("/guests") && activeItemId !== "guests")
      return setActiveItemId("guests");

    if (location.pathname.includes("/people") && activeItemId !== "accounts")
      return setActiveItemId("accounts");

    if (location.pathname.includes("/settings") && activeItemId !== "settings")
      return setActiveItemId("settings");

    if (location.pathname.includes("profile")) {
      if (activeItemId) return;
      return setActiveItemId(rootFolderId || roomsFolderId);
    }

    if (location.pathname.includes(MEDIA_VIEW_URL)) {
      setActiveItemId(rootFolderId);
    }
  }, [
    location.pathname,
    activeItemId,
    roomsFolderId,
    archiveFolderId,
    myFolderId,
    favoritesFolderId,
    recycleBinFolderId,
    isVisitor,
    rootFolderId,
    recentFolderId,
  ]);

  React.useEffect(() => {
    setIsBurgerLoading(showArticleLoader);
  }, [showArticleLoader]);

  const onMouseMoveArticle = React.useCallback(
    (e) => {
      const wrapperElement = document.elementFromPoint(e.clientX, e.clientY);
      const droppable = wrapperElement?.closest(".droppable");
      const documentTitle = droppable?.getAttribute("data-document-title");

      if (droppable) setDropTargetPreview(documentTitle);
    },
    [setDropTargetPreview],
  );

  React.useEffect(() => {
    if (startDrag) document.addEventListener("mousemove", onMouseMoveArticle);

    return () => {
      document.removeEventListener("mousemove", onMouseMoveArticle);
    };
  }, [startDrag, onMouseMoveArticle]);

  if (showArticleLoader) return <ArticleFolderLoader />;

  const isAccountsPage = location.pathname.includes("/accounts");

  return (
    <>
      {isAccountsPage ? (
        <AccountsItems
          onClick={onClick}
          getLinkData={getLinkData}
          activeItemId={activeItemId}
        />
      ) : (
        <Items
          onClick={onClick}
          getLinkData={getLinkData}
          showText={showText}
          onHide={toggleArticleOpen}
          activeItemId={activeItemId}
        />
      )}
      {!isDesktopClient &&
      showText &&
      !firstLoad &&
      campaigns.length > 0 &&
      !isFrame &&
      displayBanners ? (
        <Banner />
      ) : null}
    </>
  );
};

export default inject(
  ({
    settingsStore,
    filesStore,
    treeFoldersStore,
    selectedFolderStore,
    clientLoadingStore,
    userStore,
    campaignsStore,
    uploadDataStore,
  }) => {
    const { clearFiles, setSelection, roomsFilter, startDrag } = filesStore;
    const { primaryProgressDataStore } = uploadDataStore;
    const { setDropTargetPreview } = primaryProgressDataStore;
    const {
      showArticleLoader,

      setIsSectionBodyLoading,
      firstLoad,
    } = clientLoadingStore;

    const setIsLoading = (param, withTimer) => {
      setIsSectionBodyLoading(param, withTimer);

      // if (param && withTimer) showProgress();
    };

    const {
      roomsFolderId,
      archiveFolderId,
      myFolderId,
      recycleBinFolderId,
      recentFolderId,
      favoritesFolderId,
    } = treeFoldersStore;

    const selectedFolderId = selectedFolderStore.id;

    const rootFolderId = selectedFolderStore.rootFolderId;

    const {
      showText,

      toggleArticleOpen,

      isDesktopClient,
      FirebaseHelper,
      theme,
      setIsBurgerLoading,
      currentDeviceType,
      isFrame,

      displayBanners,
    } = settingsStore;

    const { campaigns } = campaignsStore;

    return {
      toggleArticleOpen,
      showText,
      showArticleLoader,
      isVisitor: userStore.user.isVisitor,
      isRoomAdmin: userStore.user.isRoomAdmin,
      userId: userStore.user?.id,

      firstLoad,
      isDesktopClient,
      FirebaseHelper,
      theme,

      roomsFolderId,
      archiveFolderId,
      myFolderId,
      favoritesFolderId,
      recycleBinFolderId,
      rootFolderId,
      recentFolderId,

      setIsLoading,

      clearFiles,
      roomsFilter,
      selectedFolderId,
      setIsBurgerLoading,
      setSelection,
      currentDeviceType,
      campaigns,
      isFrame,

      displayBanners,
      startDrag,
      setDropTargetPreview,
    };
  },
)(withTranslation([])(observer(ArticleBodyContent)));
