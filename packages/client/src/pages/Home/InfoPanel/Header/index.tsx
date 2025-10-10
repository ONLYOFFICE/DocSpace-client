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

import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { FolderType } from "@docspace/shared/enums";
import { AsideHeader } from "@docspace/shared/components/aside-header";
import { Tabs } from "@docspace/shared/components/tabs";
import { isLockedSharedRoom } from "@docspace/shared/utils";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import { isRoom as isRoomUtil } from "@docspace/shared/utils/typeGuards";

import { PluginFileType } from "SRC_DIR/helpers/plugins/enums";
import { InfoPanelView } from "SRC_DIR/store/InfoPanelStore";
import { getContactsView } from "SRC_DIR/helpers/contacts";

import styles from "./Header.module.scss";
import InfoPanelHeaderContentProps from "./Header.types";

const InfoPanelHeaderContent = ({
  selection,
  setIsVisible,
  roomsView,
  fileView,
  setView,

  getIsTrash,
  infoPanelItemsList,
  enablePlugins,

  isRecentFolder,
}: InfoPanelHeaderContentProps) => {
  const { t } = useTranslation(["Common", "InfoPanel"]);

  const isGallery = window.location.pathname.includes("form-gallery");
  const isContacts = getContactsView();
  const isTrash = getIsTrash();

  const isRoot =
    selection &&
    "isFolder" in selection &&
    "rootFolderId" in selection &&
    selection.isFolder &&
    selection.id === selection.rootFolderId;

  const isLinkExpired =
    selection && "isLinkExpired" in selection ? selection.isLinkExpired : false;
  const external =
    selection && "external" in selection ? selection.external : false;

  const withTabs =
    !isRoot &&
    !Array.isArray(selection) &&
    !isGallery &&
    !isContacts &&
    !isTrash &&
    !isLockedSharedRoom(selection as TRoom) &&
    !(external && isLinkExpired);

  const isTemplate =
    selection &&
    "rootFolderType" in selection &&
    selection.rootFolderType === FolderType.RoomTemplates;

  const closeInfoPanel = () => setIsVisible(false);

  const setMembers = () => setView(InfoPanelView.infoMembers);
  const setHistory = () => setView(InfoPanelView.infoHistory);
  const setDetails = () => setView(InfoPanelView.infoDetails);
  const setShare = () => setView(InfoPanelView.infoShare);

  const memberTab = {
    id: "info_members",
    name: isTemplate ? t("Common:Accesses") : t("Common:Contacts"),
    onClick: setMembers,
    content: null,
  };

  const detailsTab = {
    id: "info_details",
    name: t("InfoPanel:SubmenuDetails"),
    onClick: setDetails,
    content: null,
  };

  const templateSubmenu = [memberTab, detailsTab];

  const tabsData = [
    {
      id: "info_history",
      name: t("InfoPanel:SubmenuHistory"),
      onClick: setHistory,
      content: null,
    },
    detailsTab,
  ];

  const isRoomsType =
    !isRecentFolder &&
    selection &&
    "rootFolderType" in selection &&
    isRoomUtil(selection) &&
    (selection.rootFolderType === FolderType.Rooms ||
      selection.rootFolderType === FolderType.Archive ||
      selection.rootFolderType === FolderType.RoomTemplates);

  if (isRoomsType) tabsData.unshift(memberTab);

  if (
    selection &&
    "canShare" in selection &&
    selection.canShare &&
    !isRoomUtil(selection)
  ) {
    tabsData.unshift({
      id: "info_share",
      name: t("Common:Share"),
      onClick: setShare,
      content: null,
    });
  }

  if (enablePlugins && infoPanelItemsList.length > 0) {
    const isRoom = selection && "roomType" in selection && selection.roomType;
    const isFile = selection && "fileExst" in selection && selection.fileExst;

    infoPanelItemsList.forEach((item) => {
      const onClick = async () => {
        setView(`info_plugin-${item.key}`);
      };

      const tabsItem = {
        id: `info_plugin-${item.key}`,
        name: item.value.subMenu.name,
        onClick,
        content: null,
      };

      if (!item.value.filesType) {
        tabsData.push(tabsItem);
        return;
      }

      if (isRoom && item.value.filesType.includes(PluginFileType.Rooms)) {
        tabsData.push(tabsItem);
        return;
      }

      if (isFile && item.value.filesType.includes(PluginFileType.Files)) {
        if (
          item.value.filesExsts &&
          !item.value.filesExsts.includes(selection?.fileExst)
        ) {
          return;
        }

        tabsData.push(tabsItem);

        return;
      }

      if (item.value.filesType.includes(PluginFileType.Folders)) {
        tabsData.push(tabsItem);
      }
    });
  }

  return (
    <div
      className={classNames(styles.infoPanelHeader, {
        [styles.withTabs]: withTabs,
      })}
    >
      <AsideHeader
        header={t("Common:Info")}
        onCloseClick={closeInfoPanel}
        withoutBorder
        className="header-text"
        isCloseable
        dataTestId="info_panel_aside_header"
      />

      {withTabs ? (
        <div className="tabs">
          <Tabs
            style={{ width: "100%" }}
            items={isTemplate ? templateSubmenu : tabsData}
            selectedItemId={isRoomsType ? roomsView : fileView}
            withAnimation
          />
        </div>
      ) : null}
    </div>
  );
};

export default inject(
  ({
    settingsStore,
    infoPanelStore,
    pluginStore,
    treeFoldersStore,
  }: TStore) => {
    const { infoPanelItemsList } = pluginStore;

    const {
      roomsView,
      fileView,
      setView,

      setIsVisible,
      getIsTrash,
    } = infoPanelStore;

    const { enablePlugins } = settingsStore;

    const selection = infoPanelStore.infoPanelSelection;

    const { isRecentFolder } = treeFoldersStore;

    return {
      selection,
      roomsView,
      fileView,
      setView,

      setIsVisible,
      getIsTrash,

      infoPanelItemsList,

      enablePlugins,

      isRecentFolder,
    };
  },
)(observer(InfoPanelHeaderContent));
