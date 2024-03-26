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

import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/17/cross.react.svg?url";
import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";

import { IconButton } from "@docspace/shared/components/icon-button";
import { Text } from "@docspace/shared/components/text";

import { Submenu } from "@docspace/shared/components/submenu";
import {
  isDesktop as isDesktopUtils,
  isMobile as isMobileUtils,
  isTablet as isTabletUtils,
} from "@docspace/shared/utils";

import { StyledInfoPanelHeader } from "./styles/common";

import { PluginFileType } from "SRC_DIR/helpers/plugins/enums";
import { FolderType } from "@docspace/shared/enums";

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

  const withSubmenu =
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

  const submenuData = [
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

  const roomsSubmenu = [...submenuData];

  const personalSubmenu = [submenuData[1], submenuData[2]];

  if (selection?.canShare) {
    personalSubmenu.unshift({
      id: "info_share",
      name: t("Files:Share"),
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

      const submenuItem = {
        id: `info_plugin-${item.key}`,
        name: item.value.subMenu.name,
        onClick,
        content: null,
      };

      if (!item.value.filesType) {
        roomsSubmenu.push(submenuItem);
        personalSubmenu.push(submenuItem);
        return;
      }

      if (isRoom && item.value.filesType.includes(PluginFileType.Rooms)) {
        roomsSubmenu.push(submenuItem);
        personalSubmenu.push(submenuItem);
        return;
      }

      if (isFile && item.value.filesType.includes(PluginFileType.Files)) {
        if (
          item.value.filesExsts &&
          !item.value.filesExsts.includes(selection?.fileExst)
        ) {
          return;
        }

        roomsSubmenu.push(submenuItem);
        personalSubmenu.push(submenuItem);
        return;
      }

      if (item.value.filesType.includes(PluginFileType.Folders)) {
        roomsSubmenu.push(submenuItem);
        personalSubmenu.push(submenuItem);
        return;
      }
    });
  }

  const isRoomsType =
    selection?.rootFolderType === FolderType.Rooms ||
    selection?.rootFolderType === FolderType.Archive;

  return (
    <StyledInfoPanelHeader isTablet={isTablet} withSubmenu={withSubmenu}>
      <div className="main">
        <Text className="header-text" fontSize="21px" fontWeight="700">
          {t("Common:Info")}
        </Text>

        {!isTablet && (
          <div className="info-panel-toggle-bg">
            <IconButton
              isStroke
              size="17"
              onClick={closeInfoPanel}
              iconName={CrossReactSvgUrl}
              title={t("Common:InfoPanel")}
              className="info-panel-toggle"
              id="info-panel-toggle--close"
            />
          </div>
        )}
      </div>

      {withSubmenu && (
        <div className="submenu">
          {isRoomsType ? (
            <Submenu
              style={{ width: "100%" }}
              data={roomsSubmenu}
              forsedActiveItemId={roomsView}
            />
          ) : (
            <Submenu
              style={{ width: "100%" }}
              data={personalSubmenu}
              forsedActiveItemId={fileView}
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
