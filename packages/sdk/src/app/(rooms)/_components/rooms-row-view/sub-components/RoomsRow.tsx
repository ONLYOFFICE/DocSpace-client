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
import classNames from "classnames";

import { useTheme } from "@docspace/ui-kit/context/ThemeContext";
import {
  FilesRow,
  FilesRowWrapper,
} from "@docspace/shared/components/files-row";
import { DragAndDrop } from "@docspace/ui-kit/components/drag-and-drop";
import { RoomIcon } from "@docspace/ui-kit/components/room-icon";
import Badges from "@docspace/shared/components/badges";
import { QuickButtons } from "@docspace/shared/components/quick-buttons";
import api from "@docspace/shared/api";
import { toastr } from "@docspace/ui-kit/components/toast";

import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useActiveItemsStore } from "@/app/(docspace)/_store/ActiveItemsStore";
import { generateFilesItemValue } from "@/app/(docspace)/(files)/_utils";

import useRoomContextMenuModel from "../../../_hooks/useRoomContextMenuModel";
import { RoomsRefreshContext } from "../../../_contexts/RoomsRefreshContext";

import { RoomsRowContent } from "./RoomsRowContent";
import type { RoomsRowProps } from "../RoomsRowView.types";

import styles from "@/app/(docspace)/(files)/_components/row-view/RowView.module.scss";

const RoomsRow = observer(
  ({
    item,
    index,
    filterSortBy,
    timezone,
    isSSR,
    onEditRoom,
    onChangeOwner,
    onTagClick: _onTagClick,
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
  }: RoomsRowProps) => {
    const filesSelectionStore = useFilesSelectionStore();
    const filesListStore = useFilesListStore();
    const { isItemActive } = useActiveItemsStore();

    const storeItem = filesListStore.items.find((i) => i.id === item.id);
    const observableItem = storeItem ?? item;

    const { t } = useTranslation(["Common"]);
    const { isBase } = useTheme();
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

    const roomItem = item as typeof item & {
      security?: { Pin?: boolean; Mute?: boolean };
      pinned?: boolean;
      mute?: boolean;
    };
    const canUnpin = !!roomItem.security?.Pin;
    const canMute = !!roomItem.security?.Mute;

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

    const element = (
      <RoomIcon
        logo={"isRoom" in item && item.isRoom ? item.roomLogo : item.icon}
        color={"isRoom" in item && item.isRoom ? item.roomIconColor : undefined}
        title={item.title}
        showDefault={
          "isRoom" in item && item.isRoom ? !item.hasRoomImage : false
        }
      />
    );

    const badgesComponent = (
      <Badges
        className={styles.badgesComponent}
        t={t}
        themeIsBase={isBase}
        item={observableItem}
        viewAs="row"
        showNew={false}
        onUnpinClick={onUnpinClick}
        onUnmuteClick={onUnmuteClick}
      />
    );

    const quickButtonsComponent = (
      <QuickButtons t={t} item={observableItem} viewAs="row" />
    );

    const onContextClick = () => {
      if (filesSelectionStore.isCheckedItem(item)) return;
      filesSelectionStore.setSelection([]);
      filesSelectionStore.setBufferSelection(item);
    };

    const contextMenuModel = getContextModel(item);
    const getRowContextModel = React.useCallback(
      () => getContextModel(item),
      [getContextModel, item],
    );

    const isChecked = filesSelectionStore.isCheckedItem(item);
    const inProgress = isItemActive(item);

    const value = generateFilesItemValue(item, false, index);

    return (
      <FilesRowWrapper
        isActive={false}
        isFirstElem={index === 0}
        checked={isChecked}
        isDragging={false}
        isIndexEditingMode={false}
        isIndexUpdated={false}
        showHotkeyBorder={false}
        isHighlight={false}
        className={classNames(styles.rowWrapper, "row-wrapper")}
      >
        <DragAndDrop
          data-title={item.title}
          className="files-item"
          value={value}
        >
          <FilesRow
            key={item.id}
            checked={isChecked}
            mode="modern"
            withoutBorder
            isIndexEditingMode={false}
            folderCategory={false}
            isActive={false}
            isIndexUpdated={false}
            isDragging={false}
            isThirdPartyFolder={false}
            withAccess={false}
            className={classNames("files-row", {
              "row-list-item": isSSR,
            })}
            onSelect={() => filesSelectionStore.addSelection(item)}
            onContextClick={onContextClick}
            element={element}
            contextOptions={contextMenuModel}
            getContextModel={getRowContextModel}
            badgesComponent={badgesComponent}
            contentElement={quickButtonsComponent}
            inProgress={inProgress}
          >
            <RoomsRowContent
              item={item}
              filterSortBy={filterSortBy}
              timezone={timezone}
              badgesComponent={badgesComponent}
            />
          </FilesRow>
        </DragAndDrop>
      </FilesRowWrapper>
    );
  },
);

export { RoomsRow };
