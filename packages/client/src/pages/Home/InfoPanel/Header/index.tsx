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

import { FolderType } from "@docspace/shared/enums";
import { AsideHeader } from "@docspace/shared/components/aside-header";
import { Tabs } from "@docspace/shared/components/tabs";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { isLockedSharedRoom } from "@docspace/shared/utils";
import type { TRoom } from "@docspace/shared/api/rooms/types";

import { PluginFileType } from "SRC_DIR/helpers/plugins/enums";
import PluginStore from "SRC_DIR/store/PluginStore";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import OformsStore from "SRC_DIR/store/OformsStore";

import { TInfoPanelSelection } from "../InfoPanel.types";

import { StyledInfoPanelHeader } from "./Header.styled";

type InfoPanelHeaderContentProps = {
  // TODO change InfoPanelStore["infoPanelSelection"]
  selection: TInfoPanelSelection;
  setIsVisible: InfoPanelStore["setIsVisible"];
  roomsView: InfoPanelStore["roomsView"];
  fileView: InfoPanelStore["fileView"];
  setView: InfoPanelStore["setView"];
  gallerySelected: OformsStore["gallerySelected"];
  getIsContacts: InfoPanelStore["getIsContacts"];
  getIsTrash: InfoPanelStore["getIsTrash"];

  infoPanelItemsList: PluginStore["infoPanelItemsList"];

  enablePlugins: SettingsStore["enablePlugins"];
};

const InfoPanelHeaderContent = ({
  selection,
  setIsVisible,
  roomsView,
  fileView,
  setView,
  gallerySelected,
  getIsContacts,
  getIsTrash,
  infoPanelItemsList,
  enablePlugins,
}: InfoPanelHeaderContentProps) => {
  const { t } = useTranslation(["Common", "InfoPanel"]);

  const isGallery = !!gallerySelected;
  const isContacts = getIsContacts();
  const isTrash = getIsTrash();

  const isSeveralItems = selection && Array.isArray(selection);

  const isRoot =
    !isSeveralItems &&
    selection &&
    "isFolder" in selection &&
    "rootFolderId" in selection &&
    selection.isFolder &&
    selection.id === selection.rootFolderId;

  const expired =
    selection && "expired" in selection ? selection.expired : false;
  const external =
    selection && "external" in selection ? selection.external : false;

  const withTabs =
    !isRoot &&
    !isSeveralItems &&
    !isGallery &&
    !isContacts &&
    !isTrash &&
    !isLockedSharedRoom(selection as TRoom) &&
    !(external && expired === true);

  const isTemplate =
    selection &&
    "rootFolderType" in selection &&
    selection.rootFolderType === FolderType.RoomTemplates;

  const closeInfoPanel = () => setIsVisible(false);

  const setMembers = () => setView("info_members");
  const setHistory = () => setView("info_history");
  const setDetails = () => setView("info_details");
  const setShare = () => setView("info_share");

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
    selection &&
    "rootFolderType" in selection &&
    (selection.rootFolderType === FolderType.Rooms ||
      selection.rootFolderType === FolderType.Archive ||
      selection.rootFolderType === FolderType.RoomTemplates);

  if (isRoomsType) tabsData.unshift(memberTab);

  if (
    selection &&
    "canShare" in selection &&
    !isRoomsType &&
    selection.canShare
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

        // if (
        //   item.value.subMenu.onClick &&
        //   selection &&
        //   !Array.isArray(selection)
        // ) {
        //   item.value.subMenu.onClick(selection.id ? +selection.id : 0);
        // }
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
    <StyledInfoPanelHeader withTabs={withTabs}>
      <AsideHeader
        header={t("Common:Info")}
        onCloseClick={closeInfoPanel}
        withoutBorder
        className="header-text"
        isCloseable
      />

      {withTabs ? (
        <div className="tabs">
          <Tabs
            style={{ width: "100%" }}
            items={isTemplate ? templateSubmenu : tabsData}
            selectedItemId={isRoomsType ? roomsView : fileView}
          />
        </div>
      ) : null}
    </StyledInfoPanelHeader>
  );
};

export default inject(
  ({
    settingsStore,
    infoPanelStore,
    pluginStore,
    selectedFolderStore,
    oformsStore,
  }: TStore) => {
    const selectedId = selectedFolderStore.id;
    const selectedRoomType = selectedFolderStore.roomType;
    const { gallerySelected } = oformsStore;
    const { infoPanelItemsList } = pluginStore;

    const {
      infoPanelSelection,
      setIsVisible,
      roomsView,
      fileView,
      setView,
      getIsContacts,
      getIsTrash,
    } = infoPanelStore;

    const { enablePlugins } = settingsStore;

    return {
      selection: infoPanelSelection,
      setIsVisible,
      roomsView,
      fileView,
      setView,
      gallerySelected,
      getIsContacts,
      getIsTrash,

      infoPanelItemsList,

      enablePlugins,

      selectedId,
      selectedRoomType,
    };
  },
)(observer(InfoPanelHeaderContent));
