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

import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { Tabs } from "@docspace/shared/components/tabs";
import {
  isDesktop as isDesktopUtils,
  isMobile as isMobileUtils,
  isTablet as isTabletUtils,
} from "@docspace/shared/utils";

import { StyledInfoPanelHeader } from "./styles/common";

import { PluginFileType } from "SRC_DIR/helpers/plugins/enums";
import { FolderType } from "@docspace/shared/enums";
import { AsideHeader } from "@docspace/shared/components/aside";

const InfoPanelHeaderContent = (props) => {
  const {
    t,
    selection,
    setIsVisible,
    roomsView,
    fileView,
    setView,
    getIsRooms,
    getIsGallery,
    getIsAccounts,
    getIsTrash,
    infoPanelItemsList,
    enablePlugins,
    resetView,
    myRoomsId,
    archiveRoomsId,
    myFolderId,
  } = props;

  const [isTablet, setIsTablet] = useState(false);

  const isRooms = getIsRooms();
  const isGallery = getIsGallery();
  const isAccounts = getIsAccounts();
  const isTrash = getIsTrash();

  const isRoot =
    selection?.isFolder && selection?.id === selection?.rootFolderId;
  const isSeveralItems = selection && Array.isArray(selection);

  const withTabs =
    !isRoot && !isSeveralItems && !isGallery && !isAccounts && !isTrash;

  useEffect(() => {
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => {
      window.removeEventListener("resize", checkWidth);
      resetView();
    };
  }, []);

  const checkWidth = () => {
    const isTablet = isTabletUtils() || isMobileUtils() || !isDesktopUtils();

    setIsTablet(isTablet);
  };

  const closeInfoPanel = () => setIsVisible(false);

  const setMembers = () => setView("info_members");
  const setHistory = () => setView("info_history");
  const setDetails = () => setView("info_details");
  const setShare = () => setView("info_share");

  //const isArchiveRoot = rootFolderType === FolderType.Archive;

  const tabsData = [
    {
      id: "info_members",
      name: t("Common:Members"),
      onClick: setMembers,
      content: null,
    },
    {
      id: "info_history",
      name: t("InfoPanel:SubmenuHistory"),
      onClick: setHistory,
      content: null,
    },
    {
      id: "info_details",
      name: t("InfoPanel:SubmenuDetails"),
      onClick: setDetails,
      content: null,
    },
  ];

  const roomsTabs = [...tabsData];

  const personalTabs = [tabsData[1], tabsData[2]];

  if (selection?.canShare) {
    personalTabs.unshift({
      id: "info_share",
      name: t("Common:Share"),
      onClick: setShare,
      content: null,
    });
  }

  if (enablePlugins && infoPanelItemsList.length > 0) {
    const isRoom = !!selection?.roomType;
    const isFile = !!selection?.fileExst;
    infoPanelItemsList.forEach((item) => {
      const onClick = async () => {
        setView(`info_plugin-${item.key}`);

        if (item.value.subMenu.onClick) {
          item.value.subMenu.onClick();
        }
      };

      const tabsItem = {
        id: `info_plugin-${item.key}`,
        name: item.value.subMenu.name,
        onClick,
        content: null,
      };

      if (!item.value.filesType) {
        roomsTabs.push(tabsItem);
        personalTabs.push(tabsItem);
        return;
      }

      if (isRoom && item.value.filesType.includes(PluginFileType.Rooms)) {
        roomsTabs.push(tabsItem);
        personalTabs.push(tabsItem);
        return;
      }

      if (isFile && item.value.filesType.includes(PluginFileType.Files)) {
        if (
          item.value.filesExsts &&
          !item.value.filesExsts.includes(selection?.fileExst)
        ) {
          return;
        }

        roomsTabs.push(tabsItem);
        personalTabs.push(tabsItem);
        return;
      }

      if (item.value.filesType.includes(PluginFileType.Folders)) {
        roomsTabs.push(tabsItem);
        personalTabs.push(tabsItem);
        return;
      }
    });
  }

  const isRoomsType =
    selection?.rootFolderType === FolderType.Rooms ||
    selection?.rootFolderType === FolderType.Archive;

  return (
    <StyledInfoPanelHeader isTablet={isTablet} withTabs={withTabs}>
      <AsideHeader
        header={t("Common:Info")}
        onCloseClick={closeInfoPanel}
        withoutBorder
        className="header-text"
      />

      {withTabs && (
        <div className="tabs">
          {isRoomsType ? (
            <Tabs
              style={{ width: "100%" }}
              items={roomsTabs}
              selectedItemId={roomsView}
            />
          ) : (
            <Tabs
              style={{ width: "100%" }}
              items={personalTabs}
              selectedItemId={fileView}
            />
          )}
        </div>
      )}
    </StyledInfoPanelHeader>
  );
};

export default inject(
  ({ settingsStore, treeFoldersStore, infoPanelStore, pluginStore }) => {
    const { infoPanelItemsList } = pluginStore;

    const {
      infoPanelSelection,
      setIsVisible,
      roomsView,
      fileView,
      setView,
      getIsFiles,
      getIsRooms,
      getIsGallery,
      getIsAccounts,
      getIsTrash,
      resetView,
    } = infoPanelStore;

    const { myRoomsId, archiveRoomsId, myFolderId } = treeFoldersStore;

    const { enablePlugins } = settingsStore;

    return {
      selection: infoPanelSelection,
      setIsVisible,
      roomsView,
      fileView,
      setView,
      getIsFiles,
      getIsRooms,
      getIsGallery,
      getIsAccounts,
      getIsTrash,
      infoPanelItemsList,
      resetView,

      myRoomsId,
      archiveRoomsId,

      enablePlugins,
      myFolderId,
    };
  },
)(
  withTranslation(["Common", "InfoPanel"])(
    InfoPanelHeaderContent,
    // withLoader(observer(InfoPanelHeaderContent))(
    //   <Loaders.InfoPanelHeaderLoader />
    // )
  ),
);
