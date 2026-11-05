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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {
  DataTableRow,
  type DataTableRowState,
} from "@onlyoffice/apps-ui-kit/components/data-table";
import { RoomIcon } from "@onlyoffice/apps-ui-kit/components/room-icon";
import { EncryptedItemIconWrapper } from "@docspace/shared/components/encrypted-item-icon";
import { getCorrectDate } from "@onlyoffice/apps-ui-kit/utils/date/getCorrectDate";
import { QuickButtons } from "@docspace/shared/components/quick-buttons";
import Badges from "@docspace/shared/components/badges";
import {
  TagManagement,
  type AccessTagManagement,
} from "@docspace/shared/components/tag-management";
import type { TagClickEvent } from "@onlyoffice/apps-ui-kit/components/tag";
import api from "@docspace/shared/api";
import { isAdmin } from "@docspace/shared/utils/common";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import { SDK_TABLE_TEST_IDS } from "@/app/(docspace)/_components/data-table/constants";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";

import useCopyRoomPrimaryLink from "../../_hooks/useCopyRoomPrimaryLink";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useActiveItemsStore } from "@/app/(docspace)/_store/ActiveItemsStore";
import { useDocsUserStore } from "@/app/(personal-files)/_store/DocsUserStore";
import useFilesActions from "@/app/(docspace)/_hooks/useFilesActions";
import useFolderActions from "@/app/(docspace)/_hooks/useFolderActions";
import { generateFilesItemValue } from "@/app/(docspace)/(files)/_utils";
import { getRoomIconLogo } from "@/app/(docspace)/_utils/getRoomIconLogo";
import { ROW_CHECKBOX_CLASS } from "@/app/(docspace)/(files)/_components/table-view/sub-components/FilesCells";
import {
  FilesRowContext,
  type TFilesRowValue,
} from "@/app/(docspace)/(files)/_components/table-view/sub-components/FilesRowContext";
import useRoomContextMenuModel from "../../_hooks/useRoomContextMenuModel";
import { useTagsChanged } from "../../_hooks/useTagsChanged";
import { RoomsRefreshContext } from "../../_contexts/RoomsRefreshContext";

import type {
  TFolderItem,
  TFileItem,
} from "@/app/(docspace)/_hooks/useItemList";

import styles from "@/app/(docspace)/(files)/_components/table-view/TableView.module.scss";

export type RoomsTableViewRowProps = {
  item: TFolderItem | TFileItem;
  index: number;
  /** What the DataTable gives the row through `renderRow`. */
  rowProps: DataTableRowState;
  timezone: string;
  onEditRoom?: (item: TFolderItem | TFileItem) => void;
  onChangeOwner?: (item: TFolderItem | TFileItem) => void;
  onTagClick?: (tag: string) => void;
  onRoomChanged?: (id: number) => void;
  onRestoreRoom?: (item: TFolderItem | TFileItem) => void;
  onDeleteRoom?: (item: TFolderItem | TFileItem) => void;
  onDeleteSelected?: (items: (TFolderItem | TFileItem)[]) => void;
  onRestoreSelected?: (items: (TFolderItem | TFileItem)[]) => void;
  onArchiveRoom?: (item: TFolderItem | TFileItem) => void;
  onArchiveSelected?: (items: (TFolderItem | TFileItem)[]) => void;
  onInfoRoom?: (item: TFolderItem | TFileItem) => void;
  onInviteRoom?: (item: TFolderItem | TFileItem) => void;
  isArchive?: boolean;
  hasEncryptionKeys?: boolean;
};

/**
 * A room row on the DataTable. The cells carry the `files-item` class and the
 * `value` the selection area reads, as the old row's menu cell did.
 */
const RoomsTableViewRow = observer(
  ({
    item,
    index,
    rowProps,
    timezone,
    onEditRoom,
    onChangeOwner,
    onTagClick,
    onRoomChanged,
    onRestoreRoom,
    onDeleteRoom,
    onDeleteSelected,
    onRestoreSelected,
    onArchiveRoom,
    onArchiveSelected,
    onInfoRoom,
    onInviteRoom,
    isArchive,
    hasEncryptionKeys,
  }: RoomsTableViewRowProps) => {
    const filesSelectionStore = useFilesSelectionStore();
    const filesListStore = useFilesListStore();
    const { isItemActive } = useActiveItemsStore();
    const { user } = useDocsUserStore();
    const inProgress = isItemActive(item);

    const storeItem = filesListStore.items.find((i) => i.id === item.id);
    const observableItem = storeItem ?? item;

    const { t, i18n } = useTranslation(["Common"]);
    const { openFile } = useFilesActions({ t });
    const { openFolder } = useFolderActions({ t });
    const { getContextModel } = useRoomContextMenuModel(
      onEditRoom,
      onRoomChanged,
      onChangeOwner,
      isArchive,
      onRestoreRoom,
      onDeleteRoom,
      onDeleteSelected,
      onRestoreSelected,
      onArchiveRoom,
      onArchiveSelected,
      onInfoRoom,
      onInviteRoom,
    );
    const refreshRooms = React.useContext(RoomsRefreshContext);
    const isChecked = filesSelectionStore.isCheckedItem(item);
    const value = generateFilesItemValue(item, false, index);
    const [isHovered, setIsHovered] = React.useState(false);

    const roomItem = item as TFolderItem & {
      tags?: string[];
      createdBy?: { displayName?: string };
      security?: { EditRoom?: boolean; Pin?: boolean; Mute?: boolean };
      pinned?: boolean;
      mute?: boolean;
      isRoom?: boolean;
    };

    const roomTags = roomItem.tags ?? [];
    const owner = roomItem.createdBy?.displayName ?? "";
    const hasEditAccess = !!roomItem.security?.EditRoom;
    const canUnpin = !!roomItem.security?.Pin;
    const canMute = !!roomItem.security?.Mute;

    const canManageTags = !!(user && isAdmin(user)) && !isArchive;

    const tagAccess: AccessTagManagement = {
      canCreate: hasEditAccess,
      canBindTag: hasEditAccess,
      canSearch: hasEditAccess,
      canEdit: canManageTags,
      canRemove: canManageTags,
    };

    const onSelectTag = React.useCallback(
      (tag: TagClickEvent) => {
        if (tag?.label) onTagClick?.(tag.label);
      },
      [onTagClick],
    );

    // The stores are patched from the change itself, so nothing is fetched
    // again - see useTagsChanged.
    const onRoomTagsChanged = useTagsChanged();

    const onUnpinClick = React.useCallback(async () => {
      if (!canUnpin) return;
      try {
        await api.rooms.unpinRoom(item.id);
        refreshRooms?.();
      } catch {
        toastr.error(t("Common:UnexpectedError"));
      }
    }, [canUnpin, item.id, refreshRooms, t]);

    const onUnmuteClick = React.useCallback(async () => {
      if (!canMute) return;
      try {
        await api.settings.muteRoomNotification(item.id, false);
        onRoomChanged?.(item.id as number);
      } catch {
        toastr.error(t("Common:UnexpectedError"));
      }
    }, [canMute, item.id, onRoomChanged, t]);

    const lastActivity = getCorrectDate(
      i18n.language || "",
      item.updated,
      "L",
      "LT",
      timezone ?? "UTC",
    );

    const onRowClick = (e: React.MouseEvent) => {
      // The checkbox selects the row on its own, as the old one did.
      if ((e.target as Element).closest(`.${ROW_CHECKBOX_CLASS}`)) return;
      if (filesSelectionStore.isCheckedItem(item)) return;
      filesSelectionStore.setSelection([]);
      filesSelectionStore.setBufferSelection(item);
    };

    const open = () => {
      if (item.isFolder) openFolder(item.id, item.title);
      else openFile(item);
    };

    const onNameClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      open();
    };

    const itemSnapshot = { ...observableItem };

    const isPrivateRoomItem = (item as { private?: boolean }).private === true;

    // Private rooms render like every other room — the literal letter/cover
    // icon — with the encrypted state shown via the green shield badge from
    // EncryptedItemIconWrapper (intentional divergence from the main client,
    // which swaps the whole icon for private.svg).
    const icon = (
      <EncryptedItemIconWrapper
        encrypted={isPrivateRoomItem}
        hasEncryptionKeys={!!hasEncryptionKeys}
        isRoom
      >
        <RoomIcon
          logo={getRoomIconLogo(item)}
          color={
            "isRoom" in item && item.isRoom ? item.roomIconColor : undefined
          }
          title={item.title}
          showDefault={
            "isRoom" in item && item.isRoom ? !item.hasRoomImage : false
          }
          imgClassName="react-svg-icon"
        />
      </EncryptedItemIconWrapper>
    );

    const badges = (
      <div className={styles.inlineBadges}>
        <Badges
          t={t}
          item={itemSnapshot}
          viewAs="table"
          showNew={false}
          onUnpinClick={onUnpinClick}
          onUnmuteClick={onUnmuteClick}
        />
      </div>
    );

    const onCopyPrimaryLink = useCopyRoomPrimaryLink(itemSnapshot, t);

    const quickButtons = (
      <div className={styles.quickButtonsContainer}>
        <QuickButtons
          t={t}
          item={itemSnapshot}
          viewAs="table"
          onCopyPrimaryLink={onCopyPrimaryLink}
        />
      </div>
    );

    const renderCell = (key: string): React.ReactNode => {
      switch (key) {
        case "Tags":
          return (
            <TagManagement
              id={item.id}
              tags={roomTags}
              columnCount={2}
              isActive={isHovered || isChecked}
              access={tagAccess}
              roomName={item.title}
              onSelectTag={onSelectTag}
              onTagsChanged={onRoomTagsChanged}
            />
          );
        case "Owner":
          return <span className={styles.secondaryCell}>{owner}</span>;
        case "Activity":
          return (
            <span className={styles.secondaryCell} suppressHydrationWarning>
              {lastActivity}
            </span>
          );
        default:
          return null;
      }
    };

    const rowValue: TFilesRowValue = {
      icon,
      checked: isChecked,
      loading: inProgress,
      selectLabel: t("Common:TitleSelectFile"),
      onSelect: () => filesSelectionStore.addSelection(item),
      onOpen: onNameClick,
      titleWithoutExt: item.title,
      fileExst: "",
      badges,
      quickButtons,
      renderCell,
    };

    const contextMenu = {
      options: getContextModel(item),
      getModel: () => getContextModel(item),
      onOpen: (isRightClick: boolean) => {
        if (isRightClick && filesSelectionStore.selection.length > 1) return;
        filesSelectionStore.setSelection([]);
        filesSelectionStore.setBufferSelection(item);
      },
      title: t("Common:TitleShowFolderActions"),
    };

    return (
      <FilesRowContext value={rowValue}>
        <DataTableRow
          {...rowProps}
          row={item}
          index={index}
          testId={SDK_TABLE_TEST_IDS.row}
          checked={isChecked}
          cellProps={{ className: "files-item", value }}
          contextMenu={contextMenu}
          onClick={onRowClick}
          onDoubleClick={open}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
      </FilesRowContext>
    );
  },
);

export { RoomsTableViewRow };
