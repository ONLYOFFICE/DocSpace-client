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

"use client";

import React from "react";
import { observer } from "mobx-react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import { RoomTile } from "@docspace/ui-kit/components/tiles/room-tile";
import { EncryptedItemIconWrapper } from "@docspace/shared/components/encrypted-item-icon";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { globalColors } from "@docspace/ui-kit/providers/theme/themes";
import type { TagClickEvent } from "@docspace/ui-kit/components/tag";
import Badges from "@docspace/shared/components/badges";
import api from "@docspace/shared/api";
import { toastr } from "@docspace/ui-kit/components/toast";
import {
  TagManagement,
  type AccessTagManagement,
} from "@docspace/shared/components/tag-management";

import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useActiveItemsStore } from "@/app/(docspace)/_store/ActiveItemsStore";
import { generateFilesItemValue } from "@/app/(docspace)/(files)/_utils";
import useFolderActions from "@/app/(docspace)/_hooks/useFolderActions";
import { getRoomIconLogo } from "@/app/(docspace)/_utils/getRoomIconLogo";

import useRoomContextMenuModel from "../../../_hooks/useRoomContextMenuModel";
import { RoomsRefreshContext } from "../../../_contexts/RoomsRefreshContext";

import type { RoomsTileProps } from "../RoomsTileView.types";
import styles from "./RoomsTile.module.scss";

const noop = () => {};

// RoomTile forwards unknown props (like tileContextClick) to BaseTile via spread,
// but doesn't declare them. Cast to expose those forwarded props at the call site.
const RoomTileAny = RoomTile as unknown as React.FC<
  React.ComponentProps<typeof RoomTile> & {
    tileContextClick?: (isRightClick?: boolean) => void;
  }
>;

const RoomsTile = observer(
  ({
    item,
    index,
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
  }: RoomsTileProps) => {
    const { t } = useTranslation(["Common"]);
    const { isBase } = useTheme();
    const filesSelectionStore = useFilesSelectionStore();
    const filesListStore = useFilesListStore();
    const { isItemActive } = useActiveItemsStore();
    const { openFolder } = useFolderActions({ t });
    const refreshRooms = React.useContext(RoomsRefreshContext);

    const storeItem = filesListStore.items.find((i) => i.id === item.id);
    const observableItem = storeItem ?? item;

    const roomItem = item as typeof item & {
      tags?: string[];
      security?: { Pin?: boolean; Mute?: boolean; EditRoom?: boolean };
      pinned?: boolean;
      mute?: boolean;
    };

    const roomTags = roomItem.tags ?? [];
    const canUnpin = !!roomItem.security?.Pin;
    const canMute = !!roomItem.security?.Mute;
    const hasEditAccess = !!roomItem.security?.EditRoom;

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

    const isChecked = filesSelectionStore.isCheckedItem(item);
    const inProgress = isItemActive(item);
    const value = generateFilesItemValue(item, false, index);

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

    const onOpenRoom = React.useCallback(
      (e: React.MouseEvent) => {
        const target = e.target;
        if (
          target instanceof Element &&
          (target.closest(".tag") ||
            target.closest(".advanced-tag") ||
            target.closest(".badges"))
        )
          return;
        e.preventDefault();
        if (item.isFolder) openFolder(item.id, item.title);
      },
      [item, openFolder],
    );

    const tileContextClick = (isRightClick?: boolean) => {
      if (isRightClick && filesSelectionStore.selection.length > 1) return;
      filesSelectionStore.setSelection([]);
      filesSelectionStore.setBufferSelection(item);
    };

    const contextMenuModel = getContextModel(item);
    const getRoomContextModel = React.useCallback(
      () => getContextModel(item),
      [getContextModel, item],
    );

    const isPrivateRoom = (item as { private?: boolean }).private === true;
    const element = (
      <EncryptedItemIconWrapper
        encrypted={isPrivateRoom}
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
          size="32px"
          radius="6px"
        />
      </EncryptedItemIconWrapper>
    );

    const tileContent = (
      <div>
        <Link
          className="item-file-name"
          type={LinkType.page}
          title={item.title}
          fontWeight={600}
          onClick={onOpenRoom}
          color={isBase ? globalColors.black : globalColors.white}
          isTextOverflow
          dir="auto"
          view="tile"
        >
          {item.title}
        </Link>
      </div>
    );

    const badgesComponent = (
      <Badges
        t={t}
        themeIsBase={isBase}
        item={observableItem}
        viewAs="tile"
        showNew={false}
        onUnpinClick={onUnpinClick}
        onUnmuteClick={onUnmuteClick}
      />
    );

    const tagAccess: AccessTagManagement = {
      canCreate: hasEditAccess,
      canBindTag: hasEditAccess,
      canSearch: hasEditAccess,
      canEdit: false,
      canRemove: false,
    };

    const renderTags = (isHovered: boolean) => (
      <TagManagement
        id={item.id}
        tags={roomTags}
        columnCount={3}
        isActive={isHovered || isChecked}
        access={tagAccess}
        roomName={item.title}
        onSelectTag={onSelectTag}
        onTagsChanged={onRoomTagsChanged}
      />
    );

    return (
      <div
        className={classNames("files-item", styles.roomTileWrapper, {
          "tile-selected": isChecked,
        })}
        // @ts-expect-error: value required for SelectionArea
        value={value}
      >
        <RoomTileAny
          item={item as unknown as Parameters<typeof RoomTile>[0]["item"]}
          checked={isChecked}
          isActive={false}
          isBlockingOperation={false}
          inProgress={inProgress}
          isEdit={false}
          showHotkeyBorder={false}
          contextOptions={contextMenuModel}
          getContextModel={getRoomContextModel}
          onSelect={() => filesSelectionStore.addSelection(item)}
          element={element}
          badges={badgesComponent}
          columnCount={3}
          selectTag={noop}
          selectOption={noop}
          getRoomTypeName={() => ""}
          customBottomContent={renderTags}
          tileContextClick={tileContextClick}
        >
          {tileContent}
        </RoomTileAny>
      </div>
    );
  },
);

export default RoomsTile;

