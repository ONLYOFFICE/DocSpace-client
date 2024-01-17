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

import { PluginFileType } from "SRC_DIR/helpers/plugins/constants";

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
          {selection?.rootFolderId === myRoomsId ||
          selection?.rootFolderId === archiveRoomsId ? (
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

export default inject(({ auth, treeFoldersStore, pluginStore }) => {
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
  } = auth.infoPanelStore;

  const { myRoomsId, archiveRoomsId } = treeFoldersStore;

  const { enablePlugins } = auth.settingsStore;

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
  };
})(
  withTranslation(["Common", "InfoPanel"])(
    InfoPanelHeaderContent
    // withLoader(observer(InfoPanelHeaderContent))(
    //   <Loaders.InfoPanelHeaderLoader />
    // )
  )
);
