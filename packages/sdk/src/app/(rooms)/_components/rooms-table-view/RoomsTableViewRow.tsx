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
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import { TableRow, TableCell } from "@docspace/ui-kit/components/table";
import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";
import { QuickButtons } from "@docspace/shared/components/quick-buttons";
import Badges from "@docspace/shared/components/badges";
import {
  TagManagement,
  type AccessTagManagement,
} from "@docspace/shared/components/tag-management";
import type { TagClickEvent } from "@docspace/ui-kit/components/tag";
import api from "@docspace/shared/api";
import { isAdmin } from "@docspace/shared/utils/common";
import { toastr } from "@docspace/ui-kit/components/toast";

import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useActiveItemsStore } from "@/app/(docspace)/_store/ActiveItemsStore";
import { useDocsUserStore } from "@/app/(personal-files)/_store/DocsUserStore";
import useFilesActions from "@/app/(docspace)/_hooks/useFilesActions";
import useFolderActions from "@/app/(docspace)/_hooks/useFolderActions";
import { generateFilesItemValue } from "@/app/(docspace)/(files)/_utils";
import { getRoomIconLogo } from "@/app/(docspace)/_utils/getRoomIconLogo";
import useRoomContextMenuModel from "../../_hooks/useRoomContextMenuModel";
import { RoomsRefreshContext } from "../../_contexts/RoomsRefreshContext";

import type {
  TFolderItem,
  TFileItem,
} from "@/app/(docspace)/_hooks/useItemList";

import styles from "@/app/(docspace)/(files)/_components/table-view/TableView.module.scss";

type RoomsTableViewRowProps = {
  item: TFolderItem | TFileItem;
  index: number;
  timezone: string;
  lastColumn: string;
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
};

const RoomsTableViewRow = observer(
  ({
    item,
    index,
    timezone,
    lastColumn,
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

    // TEMPORARY: refresh the room after tag bind/unbind/create via callback.
    // Replace with WebSocket MODIFY_FOLDER subscription once sockets are
    // enabled in the SDK (initSocket={false} in providers).
    const onRoomTagsChanged = React.useCallback(() => {
      onRoomChanged?.(item.id as number);
    }, [item.id, onRoomChanged]);

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
    }, [canMute, item.id, refreshRooms, t]);

    const lastActivity = getCorrectDate(
      i18n.language || "",
      item.updated,
      "L",
      "LT",
      timezone ?? "UTC",
    );

    const onCheckboxChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        filesSelectionStore.addSelection(item);
      },
      [filesSelectionStore, item],
    );

    const onRowClick = React.useCallback(() => {
      if (filesSelectionStore.isCheckedItem(item)) return;
      filesSelectionStore.setSelection([]);
      filesSelectionStore.setBufferSelection(item);
    }, [filesSelectionStore, item]);

    const onRowDoubleClick = React.useCallback(() => {
      if (item.isFolder) {
        openFolder(item.id, item.title);
      } else {
        openFile(item);
      }
    }, [item, openFolder, openFile]);

    const onNameClick = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.isFolder) {
          openFolder(item.id, item.title);
        } else {
          openFile(item);
        }
      },
      [item, openFolder, openFile],
    );

    const itemSnapshot = { ...observableItem };

    const badgesNode = (
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

    const quickButtonsNode = (
      <div className={styles.quickButtonsContainer}>
        <QuickButtons t={t} item={itemSnapshot} viewAs="table" />
      </div>
    );

    const contextMenuModel = getContextModel(item);
    const getRowContextModel = React.useCallback(
      () => getContextModel(item),
      [getContextModel, item],
    );

    return (
      <TableRow
        className={classNames({
          "table-row-selected": isChecked,
        })}
        checked={isChecked}
        contextOptions={contextMenuModel}
        getContextModel={getRowContextModel}
        onClick={onRowClick}
        onDoubleClick={onRowDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        selectionProp={{
          className: classNames("files-item", "table-container_file-name-cell"),
          value,
        }}
        fileContextClick={(isRightClick) => {
          if (isRightClick && filesSelectionStore.selection.length > 1) return;
          filesSelectionStore.setSelection([]);
          filesSelectionStore.setBufferSelection(item);
        }}
      >
        <TableCell
          className="table-container_file-name-cell table-container_element-wrapper"
          hasAccess
          checked={isChecked}
        >
          <div
            className="table-container_element-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="table-container_element">
              {inProgress ? (
                <Loader color="" size="20px" type={LoaderTypes.track} />
              ) : (
                <RoomIcon
                  logo={getRoomIconLogo(item)}
                  color={
                    "isRoom" in item && item.isRoom
                      ? item.roomIconColor
                      : undefined
                  }
                  title={item.title}
                  showDefault={
                    "isRoom" in item && item.isRoom ? !item.hasRoomImage : false
                  }
                />
              )}
            </div>
            <Checkbox
              className="table-container_row-checkbox"
              onChange={onCheckboxChange}
              isChecked={isChecked}
              title={t("Common:TitleSelectFile")}
            />
          </div>
          <span className={styles.nameCellText} onClick={onNameClick}>
            {item.title}
          </span>
          {badgesNode}
          {lastColumn === "Name" ? quickButtonsNode : null}
        </TableCell>
        <TableCell
          className={lastColumn === "Tags" ? styles.lastCell : undefined}
        >
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
          {lastColumn === "Tags" ? quickButtonsNode : null}
        </TableCell>
        <TableCell
          className={lastColumn === "Owner" ? styles.lastCell : undefined}
        >
          <span className={styles.secondaryCell}>{owner}</span>
          {lastColumn === "Owner" ? quickButtonsNode : null}
        </TableCell>
        <TableCell
          className={lastColumn === "Activity" ? styles.lastCell : undefined}
        >
          <span className={styles.secondaryCell} suppressHydrationWarning>
            {lastActivity}
          </span>
          {lastColumn === "Activity" ? quickButtonsNode : null}
        </TableCell>
      </TableRow>
    );
  },
);

export { RoomsTableViewRow };

