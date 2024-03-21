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

import React from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { useNavigate, useLocation } from "react-router-dom";

import { DeviceType, RoomSearchArea } from "@docspace/shared/enums";
import Items from "./Items";

import FilesFilter from "@docspace/shared/api/files/filter";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import AccountsFilter from "@docspace/shared/api/people/filter";

import Banner from "./Banner";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";
import { ArticleFolderLoader } from "@docspace/shared/skeletons/article";
import { MEDIA_VIEW_URL } from "@docspace/shared/constants";

const ArticleBodyContent = (props) => {
  const {
    isDesktopClient,
    firstLoad,
    FirebaseHelper,
    theme,

    showText,
    toggleArticleOpen,

    roomsFolderId,
    archiveFolderId,
    myFolderId,
    recycleBinFolderId,
    rootFolderId,

    isVisitor,
    setIsLoading,

    clearFiles,
    selectedFolderId,
    showArticleLoader,
    setIsBurgerLoading,
    setSelection,
    currentDeviceType,
    campaigns,
    userId,
  } = props;

  const navigate = useNavigate();
  const location = useLocation();

  const [disableBadgeClick, setDisableBadgeClick] = React.useState(false);
  const [activeItemId, setActiveItemId] = React.useState(null);

  const isAccounts = location.pathname.includes("accounts/filter");

  const onClick = React.useCallback(
    (folderId, title, rootFolderType, canCreate) => {
      const { toggleArticleOpen } = props;

      let params = null;
      let path = ``;

      const state = {
        title,
        isRoot: true,
        isPublicRoomType: false,
        rootFolderType,
        canCreate,
      };

      let withTimer = !!selectedFolderId;

      setSelection && setSelection([]);

      switch (folderId) {
        case myFolderId:
          const myFilter = FilesFilter.getDefault();
          myFilter.folder = folderId;
          params = myFilter.toUrlParams();

          path = getCategoryUrl(CategoryType.Personal);

          if (activeItemId === myFolderId && folderId === selectedFolderId)
            return;

          break;
        case archiveFolderId:
          const archiveFilter = RoomsFilter.getDefault(userId);
          archiveFilter.searchArea = RoomSearchArea.Archive;
          params = archiveFilter.toUrlParams(userId, true);
          path = getCategoryUrl(CategoryType.Archive);
          if (activeItemId === archiveFolderId && folderId === selectedFolderId)
            return;
          break;
        case recycleBinFolderId:
          const recycleBinFilter = FilesFilter.getDefault();
          recycleBinFilter.folder = folderId;
          params = recycleBinFilter.toUrlParams();
          path = getCategoryUrl(CategoryType.Trash);
          if (
            activeItemId === recycleBinFolderId &&
            folderId === selectedFolderId
          )
            return;
          break;
        case "accounts":
          clearFiles();
          const accountsFilter = AccountsFilter.getDefault();
          params = accountsFilter.toUrlParams();
          path = getCategoryUrl(CategoryType.Accounts);

          withTimer = false;
          if (activeItemId === "accounts" && isAccounts) return;

          break;
        case "settings":
          clearFiles();

          path = getCategoryUrl(CategoryType.Settings);
          navigate(path);

          if (currentDeviceType === DeviceType.mobile) {
            toggleArticleOpen();
          }
          return;
        case roomsFolderId:
        default:
          const roomsFilter = RoomsFilter.getDefault(userId);
          roomsFilter.searchArea = RoomSearchArea.Active;
          params = roomsFilter.toUrlParams(userId, true);
          path = getCategoryUrl(CategoryType.Shared);
          if (activeItemId === roomsFolderId && folderId === selectedFolderId)
            return;
          break;
      }

      setIsLoading(true, withTimer);
      path += `?${params}`;

      navigate(path, { state });

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
      isAccounts,
      setSelection,
    ],
  );

  const onShowNewFilesPanel = React.useCallback(
    async (folderId) => {
      if (disableBadgeClick) return;

      setDisableBadgeClick(true);

      await props.setNewFilesPanelVisible(true, [`${folderId}`]);

      setDisableBadgeClick(false);
    },
    [disableBadgeClick],
  );

  React.useEffect(() => {
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

    if (location.pathname.includes("/accounts") && activeItemId !== "accounts")
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
    recycleBinFolderId,
    isVisitor,
    rootFolderId,
  ]);

  React.useEffect(() => {
    setIsBurgerLoading(showArticleLoader);
  }, [showArticleLoader]);

  if (showArticleLoader) return <ArticleFolderLoader />;

  return (
    <>
      <Items
        onClick={onClick}
        onBadgeClick={onShowNewFilesPanel}
        showText={showText}
        onHide={toggleArticleOpen}
        activeItemId={activeItemId}
      />

      {!isDesktopClient && showText && !firstLoad && campaigns.length > 0 && (
        <Banner />
      )}
    </>
  );
};

export default inject(
  ({
    settingsStore,
    filesStore,
    treeFoldersStore,
    dialogsStore,
    selectedFolderStore,
    clientLoadingStore,
    userStore,
    campaignsStore,
  }) => {
    const { clearFiles, setSelection } = filesStore;
    const {
      showArticleLoader,

      setIsSectionFilterLoading,
      firstLoad,
    } = clientLoadingStore;

    const setIsLoading = (param, withTimer) => {
      setIsSectionFilterLoading(param, withTimer);
    };

    const { roomsFolderId, archiveFolderId, myFolderId, recycleBinFolderId } =
      treeFoldersStore;

    const { setNewFilesPanelVisible } = dialogsStore;

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
    } = settingsStore;

    const { campaigns } = campaignsStore;

    return {
      toggleArticleOpen,
      showText,
      showArticleLoader,
      isVisitor: userStore.user.isVisitor,
      userId: userStore.user?.id,

      setNewFilesPanelVisible,

      firstLoad,
      isDesktopClient,
      FirebaseHelper,
      theme,

      roomsFolderId,
      archiveFolderId,
      myFolderId,
      recycleBinFolderId,
      rootFolderId,

      setIsLoading,

      clearFiles,
      selectedFolderId,
      setIsBurgerLoading,
      setSelection,
      currentDeviceType,
      campaigns,
    };
  },
)(withTranslation([])(observer(ArticleBodyContent)));
