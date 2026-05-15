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

import { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Backdrop } from "@docspace/ui-kit/components/backdrop";
import { Aside } from "@docspace/ui-kit/components/aside";
import RoomSelector from "@docspace/ui-kit/selectors/Room";
import type { TSelectorItem } from "@docspace/ui-kit/components/selector/Selector.types";
import type { TRoom } from "@docspace/shared/api/rooms/types";

type AddRoomToGroupDialogProps = {
  visible?: boolean;
  groupId?: string | null;
  setAddRoomToGroupDialogVisible?: (
    visible: boolean,
    groupId?: string | null,
  ) => void;
  getGroupById?: (groupId: string) => Promise<{ rooms: TRoom[]; name: string }>;
  updateRoomGroup?: (
    groupId: string,
    data: { roomsToAdd?: (string | number)[]; roomsToRemove?: number[] },
  ) => Promise<void>;
  getAllRoomGroups?: () => Promise<void>;
};

const AddRoomToGroupDialog = ({
  visible = false,
  groupId,
  setAddRoomToGroupDialogVisible,
  getGroupById,
  updateRoomGroup,
  getAllRoomGroups,
}: AddRoomToGroupDialogProps) => {
  const { t } = useTranslation(["Common", "GroupingRooms"]);
  const [groupData, setGroupData] = useState<{
    rooms: TRoom[];
    name: string;
  } | null>(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (visible && groupId && getGroupById) {
        try {
          const data = await getGroupById(groupId);
          setGroupData(data);
        } catch (error) {
          console.error("Error fetching group data:", error);
        }
      }
    };

    fetchGroupData();
  }, [visible, groupId, getGroupById]);

  const onClose = () => {
    setAddRoomToGroupDialogVisible?.(false);
    setGroupData(null);
  };

  const onSubmitRoom = async (items: TSelectorItem[]) => {
    if (!groupId || !updateRoomGroup) return;

    const toIdKey = (id: string | number) => String(id);
    const initialRoomIds = (groupData?.rooms || []).map((room) => room.id);
    const initialRoomIdByKey = new Map<string, number>(
      initialRoomIds.map((id) => [toIdKey(id), id] as const),
    );
    const initialRoomIdKeys = new Set<string>(
      initialRoomIds.map((id) => toIdKey(id)),
    );

    const selectedRoomIds = items
      .map((item) => item.id)
      .filter((id): id is string | number => id !== undefined);

    const selectedRoomIdKeys = selectedRoomIds.map(toIdKey);
    const selectedRoomIdsSet = new Set<string>(selectedRoomIdKeys);

    const roomsToAdd = selectedRoomIds.filter(
      (id) => !initialRoomIdKeys.has(toIdKey(id)),
    );
    const roomsToRemove = Array.from(initialRoomIdKeys)
      .filter((idKey) => !selectedRoomIdsSet.has(idKey))
      .map((idKey) => initialRoomIdByKey.get(idKey))
      .filter((id): id is number => id !== undefined);

    try {
      const hasChanges = roomsToAdd.length > 0 || roomsToRemove.length > 0;

      if (hasChanges) {
        await updateRoomGroup(groupId, {
          ...(roomsToAdd.length > 0 ? { roomsToAdd } : {}),
          ...(roomsToRemove.length > 0 ? { roomsToRemove } : {}),
        });

        await getAllRoomGroups?.();
      }
    } catch (error) {
      console.error("Error updating group rooms:", error);
    }

    onClose();
  };

  const convertToItems = (rooms: TRoom[]): TSelectorItem[] => {
    return rooms.map((room) => ({
      id: room.id,
      label: room.title,
      icon: room.logo?.small || "",
      isFolder: true,
      roomType: room.roomType,
      shared: room.shared,
      parentId: room.parentId,
      rootFolderType: room.rootFolderType,
      filesCount: room.filesCount,
      foldersCount: room.foldersCount,
      security: room.security,
      color: room.logo?.color,
      tags: room.tags,
    }));
  };

  if (!visible) return null;

  return (
    <>
      <Backdrop
        visible={visible}
        isAside
        withBackground
        zIndex={309}
        onClick={onClose}
      />
      <Aside
        visible={visible}
        withoutBodyScroll
        zIndex={310}
        onClose={onClose}
        withoutHeader
      >
        <RoomSelector
          onSubmit={onSubmitRoom}
          withHeader
          headerProps={{
            onBackClick: onClose,
            onCloseClick: onClose,
            headerLabel: groupData?.name || t("GroupingRooms:AddRoom"),
            withoutBorder: false,
            withoutBackButton: false,
          }}
          withSearch
          isMultiSelect
          selectedItems={groupData ? convertToItems(groupData.rooms || []) : []}
          withCancelButton
          cancelButtonLabel={t("Common:CancelButton")}
          onCancel={onClose}
          forceIsMultiSelect
          disableSubmitUntilChanged
          sortSelectedFirst
        />
      </Aside>
    </>
  );
};

export default inject(({ dialogsStore }: TStore) => {
  const {
    addRoomToGroupDialogVisible,
    addRoomToGroupId,
    setAddRoomToGroupDialogVisible,
    getGroupById,
    updateRoomGroup,
    getAllRoomGroups,
  } = dialogsStore;

  return {
    visible: addRoomToGroupDialogVisible,
    groupId: addRoomToGroupId,
    setAddRoomToGroupDialogVisible,
    getGroupById,
    updateRoomGroup,
    getAllRoomGroups,
  };
})(observer(AddRoomToGroupDialog));
