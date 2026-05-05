// (c) Copyright Ascensio System SIA 2009-2026
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

import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { FolderType } from "@docspace/shared/enums";
import { AsideHeader } from "@docspace/ui-kit/components/aside";
import { Tabs } from "@docspace/ui-kit/components/tabs";
import { isLockedSharedRoom } from "@docspace/shared/utils";
import type { TRoom } from "@docspace/shared/api/rooms/types";

import { InfoPanelView } from "SRC_DIR/helpers/info-panel";
import { getContactsView } from "SRC_DIR/helpers/contacts";
import { hideInfoPanel } from "SRC_DIR/helpers/info-panel";
import { getAvailableInfoPanelTabs } from "SRC_DIR/helpers/info-panel/tabs";

import styles from "./Header.module.scss";
import { HeaderProps } from "./Header.types";

const InfoPanelHeaderGeneral = ({
  selection,
  roomsView,
  fileView,
  setView,

  getIsTrash,
  infoPanelItemsList,
  enablePlugins,

  isRecentFolder,
}: HeaderProps) => {
  const { t } = useTranslation(["Common", "InfoPanel"]);

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
    !isContacts &&
    !isTrash &&
    !isLockedSharedRoom(selection as TRoom) &&
    !(external && isLinkExpired);

  const isTemplate =
    selection &&
    "rootFolderType" in selection &&
    selection.rootFolderType === FolderType.RoomTemplates;

  const closeInfoPanel = () => {
    hideInfoPanel();
  };

  const { tabs: availableTabs, useRoomsView } = getAvailableInfoPanelTabs({
    selection,
    isTrash,
    isRecentFolder,
    enablePlugins,
    infoPanelItemsList,
  });

  const rawView = useRoomsView ? roomsView : fileView;
  const selectedTabId = availableTabs.includes(rawView)
    ? rawView
    : (availableTabs[0] ?? InfoPanelView.infoDetails);

  const tabItems = availableTabs.map((id) => {
    let name: string;
    if (id === InfoPanelView.infoMembers) {
      name = isTemplate ? t("Common:Accesses") : t("Common:Contacts");
    } else if (id === InfoPanelView.infoHistory) {
      name = t("InfoPanel:SubmenuHistory");
    } else if (id === InfoPanelView.infoDetails) {
      name = t("InfoPanel:SubmenuDetails");
    } else if (id === InfoPanelView.infoShare) {
      name = t("Common:Share");
    } else {
      const key = id.replace("info_plugin-", "");
      name =
        infoPanelItemsList.find((item) => item.key === key)?.value.subMenu
          .name ?? id;
    }

    return { id, name, onClick: () => setView(id), content: null };
  });

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
            items={tabItems}
            selectedItemId={selectedTabId}
            withAnimation
          />
        </div>
      ) : null}
    </div>
  );
};

export default InfoPanelHeaderGeneral;
