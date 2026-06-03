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

import { useRef, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { TRoom } from "@docspace/shared/api/rooms/types";
import { isMobile } from "@docspace/shared/utils";
import { TFile, TFolder } from "@docspace/shared/api/files/types";
import { getRoomBadgeUrl } from "@docspace/shared/utils/getRoomBadgeUrl";
import {
  ContextMenu,
  ContextMenuRefType,
  HeaderType,
} from "@docspace/ui-kit/components/context-menu";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@docspace/ui-kit/components/context-menu-button";

import ContextOptionsStore from "SRC_DIR/store/ContextOptionsStore";
import FilesSettingsStore from "SRC_DIR/store/FilesSettingsStore";

import styles from "./itemTitle.module.scss";

export type TSelection = TRoom | TFile | TFolder;

type RoomsContextBtnProps = {
  selection: TSelection;

  getItemContextOptionsActions?: ContextOptionsStore["getFilesContextOptions"];

  getIcon?: FilesSettingsStore["getIcon"];
  externalShareApplyToRooms?: boolean;
  blockExistingLinksOnRestrict?: boolean;
  hasExternalLinks?: boolean;
};

const RoomsContextBtn = ({
  selection,

  getItemContextOptionsActions,
  getIcon,
  externalShareApplyToRooms,
  blockExistingLinksOnRestrict,
  hasExternalLinks,
}: RoomsContextBtnProps) => {
  const { t } = useTranslation([
    "Files",
    "Common",
    "Translations",
    "InfoPanel",
  ]);
  const contextMenuRef = useRef<ContextMenuRefType>(null);

  const onContextMenu = (e: React.MouseEvent) => {
    if (!contextMenuRef?.current?.menuRef.current)
      contextMenuRef?.current?.show(e);
  };

  const getData = useCallback(() => {
    if (!getItemContextOptionsActions) return [];
    return getItemContextOptionsActions(selection, t, true);
  }, [selection, t, getItemContextOptionsActions]);

  const data = useMemo(() => getData(), [selection, t]);

  const contextMenuHeader = useMemo((): HeaderType | undefined => {
    if (!selection) return undefined;

    const isRoom = "isRoom" in selection && selection.isRoom;
    const badgeUrl = isRoom
      ? getRoomBadgeUrl(
          selection,
          12,
          externalShareApplyToRooms && blockExistingLinksOnRestrict,
          hasExternalLinks,
        )
      : null;

    const isFile = "isFile" in selection && selection.isFile;

    const iconUrl = getIcon
      ? getIcon(
          32,
          isFile ? selection.fileExst : undefined,
          "providerKey" in selection ? selection.providerKey : undefined,
          isFile ? selection.contentLength : undefined,
          undefined,
          "isArchive" in selection ? selection.isArchive : undefined,
          "type" in selection ? selection.type : undefined,
        )
      : "";

    const badgeIconColor =
      externalShareApplyToRooms &&
      blockExistingLinksOnRestrict &&
      hasExternalLinks &&
      badgeUrl
        ? "var(--info-panel-link-blocked)"
        : undefined;

    return {
      title: selection.title || "",
      icon:
        "icon" in selection ? (selection.icon as string) || iconUrl || "" : "",
      original: "logo" in selection ? selection.logo?.original : "",
      large: "logo" in selection ? selection.logo?.large : "",
      medium: "logo" in selection ? selection.logo?.medium : "",
      small: "logo" in selection ? selection.logo?.small : "",
      color: "logo" in selection ? selection.logo?.color : "",
      cover:
        "logo" in selection && selection.logo?.cover
          ? typeof selection.logo.cover === "string"
            ? { data: selection.logo.cover, id: "" }
            : selection.logo.cover
          : undefined,
      badgeUrl: badgeUrl ?? undefined,
      badgeIconColor,
    };
  }, [selection, externalShareApplyToRooms, hasExternalLinks]);

  const onHideContextMenu = () => {
    // Callback is called when the context menu is closed.
    // Required for proper cleanup in ContextMenu.
  };

  return (
    <div className={styles.itemContextOptions}>
      <ContextMenuButton
        id="info-options"
        className="expandButton"
        title={
          "isFolder" in selection && selection.isFolder
            ? t("Common:TitleShowFolderActions")
            : t("Common:TitleShowActions")
        }
        onClick={onContextMenu}
        getData={getData}
        directionX="right"
        displayType={ContextMenuButtonDisplayType.toggle}
      />
      <ContextMenu
        ref={contextMenuRef}
        getContextModel={getData}
        model={data}
        withBackdrop
        baseZIndex={310}
        headerOnlyMobile
        ignoreChangeView={isMobile()}
        header={contextMenuHeader}
        badgeUrl={contextMenuHeader?.badgeUrl}
        badgeIconColor={contextMenuHeader?.badgeIconColor}
        onHide={onHideContextMenu}
      />
    </div>
  );
};

export default inject(
  ({ contextOptionsStore, filesSettingsStore, publicRoomStore }: TStore) => ({
    getItemContextOptionsActions: contextOptionsStore.getFilesContextOptions,
    getIcon: filesSettingsStore.getIcon,
    externalShareApplyToRooms: filesSettingsStore.externalShareApplyToRooms,
    blockExistingLinksOnRestrict:
      filesSettingsStore.blockExistingLinksOnRestrict,
    hasExternalLinks: publicRoomStore.hasExternalLinks,
  }),
)(observer(RoomsContextBtn));
