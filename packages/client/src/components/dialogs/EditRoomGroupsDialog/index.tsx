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

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { inject, observer } from "mobx-react";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { ToggleButton } from "@docspace/ui-kit/components/toggle-button";
import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { AddButton } from "@docspace/ui-kit/components/add-button";
import PublicRoomBar from "@docspace/ui-kit/components/public-room-bar";
import { toastr } from "@docspace/ui-kit/components/toast";
import { ButtonKeys } from "@docspace/shared/enums";

import InfoIcon from "PUBLIC_DIR/images/info.outline.react.svg?url";

import styles from "./EditRoomGroupsDialog.module.scss";
import GroupIconDialog from "./sub-components/GroupIconDialog";
import DeleteGroupDialog from "./sub-components/DeleteGroupDialog";
import RoomListPanel from "./sub-components/RoomListPanel";
import GroupItem from "./sub-components/GroupItem";
import { EditRoomGroupsDialogProps } from "./EditRoomGroupsDialog.types";
import type { TRoom } from "@docspace/shared/api/rooms/types";
import type { TSelectorItem } from "@docspace/ui-kit/components/selector/Selector.types";

const TOOLTIP_DISMISSED_KEY = "roomGroupingTooltipDismissed";

const EditRoomGroupsDialog = ({
  currentColorScheme,
  getCovers,
  covers,
  setEditRoomGroupsDialogVisible,
  roomGroups,
  setCreateGroupRooms,
  getAllRoomGroups,
  getGroupById,
  updateGroupIcon,
  updateRoomGroup,
  deleteRoomGroup,
  createGroupFromRoomIds,
  currentFilterGroupId,
  openInCreateMode,
  fetchRooms,
  roomsFilter,
  organizeRoomsGrouping,
  setOrganizeRoomsGrouping,
}: EditRoomGroupsDialogProps) => {
  const { t } = useTranslation(["Common", "GroupingRooms"]);
  const navigate = useNavigate();

  const [isOpenRoomList, setIsOpenRoomList] = useState(
    () => !!openInCreateMode,
  );
  const [isOpenGroupIcon, setIsOpenGroupIcon] = useState(
    () => !!createGroupFromRoomIds && createGroupFromRoomIds.length > 0,
  );

  const [arrIdsRooms, setArrIdsRooms] = useState<string[] | null>(() =>
    createGroupFromRoomIds
      ? createGroupFromRoomIds.map((id) => String(id))
      : null,
  );
  const [selectedGroup, setSelectedGroup] = useState<{
    id: string;
    name: string;
    rooms: TRoom[];
  } | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [groupIdToDelete, setGroupIdToDelete] = useState<string | null>(null);

  // State for dismissible tooltip
  const [isTooltipVisible, setIsTooltipVisible] = useState(() => {
    try {
      return localStorage.getItem(TOOLTIP_DISMISSED_KEY) !== "true";
    } catch {
      return true;
    }
  });

  // Local state for grouping toggle (to enable Save/Cancel flow)
  const [localGroupingEnabled, setLocalGroupingEnabled] = useState(
    () => organizeRoomsGrouping ?? true,
  );
  const [hasGroupingChanged, setHasGroupingChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state with prop when it changes externally
  useEffect(() => {
    setLocalGroupingEnabled(organizeRoomsGrouping ?? true);
    setHasGroupingChanged(false);
  }, [organizeRoomsGrouping]);

  const onClickCreateNewGroup = () => {
    setIsOpenRoomList(true);
  };

  const skipNextCloseRef = useRef(false);

  const onCloseRoomList = () => {
    skipNextCloseRef.current = true;
    setIsOpenRoomList(false);
  };

  const onCloseEditRoomGroupsDialog = () => {
    if (skipNextCloseRef.current) {
      skipNextCloseRef.current = false;
      return;
    }
    setEditRoomGroupsDialogVisible(false);
  };

  const onDismissTooltip = () => {
    setIsTooltipVisible(false);
    try {
      localStorage.setItem(TOOLTIP_DISMISSED_KEY, "true");
    } catch {
      // Ignore localStorage errors
    }
  };

  const onToggleGrouping = () => {
    const newValue = !localGroupingEnabled;
    setLocalGroupingEnabled(newValue);
    setHasGroupingChanged(newValue !== organizeRoomsGrouping);
  };

  const onSaveGroupingChange = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (setOrganizeRoomsGrouping) {
        await setOrganizeRoomsGrouping(localGroupingEnabled);
      }

      setHasGroupingChanged(false);
      setEditRoomGroupsDialogVisible(false);

      // If grouping was disabled and we're currently viewing a group,
      // navigate away to show all rooms instead of empty group placeholder
      if (!localGroupingEnabled && currentFilterGroupId) {
        navigate("rooms/shared");
      }
    } catch (error) {
      toastr.error(error as Error);
    } finally {
      setIsSaving(false);
    }
  };

  const onCancelGroupingChange = () => {
    setLocalGroupingEnabled(organizeRoomsGrouping ?? true);
    setHasGroupingChanged(false);
    setEditRoomGroupsDialogVisible(false);
  };

  const onKeyUpHandler = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === ButtonKeys.enter && hasGroupingChanged && !isSaving) {
        onSaveGroupingChange();
      }
    },
    [hasGroupingChanged, isSaving, onSaveGroupingChange],
  );

  useEffect(() => {
    document.addEventListener("keyup", onKeyUpHandler, false);

    return () => {
      document.removeEventListener("keyup", onKeyUpHandler, false);
    };
  }, [onKeyUpHandler]);

  const onSubmitRoom = async (items: TSelectorItem[]) => {
    if (selectedGroup) {
      const toIdKey = (id: string | number) => String(id);
      const initialRoomIds = (selectedGroup.rooms || []).map((room) => room.id);
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
          await updateRoomGroup(selectedGroup.id, {
            ...(roomsToAdd.length > 0 ? { roomsToAdd } : {}),
            ...(roomsToRemove.length > 0 ? { roomsToRemove } : {}),
          });

          await getAllRoomGroups();

          // Refresh the section if we're currently viewing this group
          const isViewingThisGroup =
            currentFilterGroupId != null &&
            String(currentFilterGroupId) === String(selectedGroup.id);

          if (isViewingThisGroup && fetchRooms) {
            await fetchRooms(null, roomsFilter, false, false, false);
          }

          toastr.success(t("GroupingRooms:ChangesApplied"));
        }
      } catch (error) {
        toastr.error(error as Error);
      }

      onCloseGroupRoomList();

      return;
    }

    const arrIds: string[] = [];
    items.forEach((item) => {
      if (item.id) arrIds.push(String(item.id));
    });

    setArrIdsRooms(arrIds);
    setIsOpenGroupIcon(true);
  };

  const onClickGroup = async (groupId: string) => {
    try {
      const groupData = await getGroupById(groupId);

      const rooms = groupData.rooms || [];
      setSelectedGroup({
        id: groupId,
        name: groupData.name,
        rooms: rooms,
      });
      setIsOpenRoomList(true);
    } catch (error) {
      toastr.error(error as Error);
    }
  };

  const onCloseGroupRoomList = () => {
    skipNextCloseRef.current = true;
    setIsOpenRoomList(false);
    setSelectedGroup(null);
  };

  const onClickEditIcon = (groupId: string) => {
    setEditingGroupId(groupId);
    setIsOpenGroupIcon(true);
  };

  const onClickDeleteGroup = (groupId: string) => {
    setGroupIdToDelete(groupId);
    setDeleteConfirmVisible(true);
  };

  const onCloseDeleteConfirm = () => {
    setDeleteConfirmVisible(false);
    setGroupIdToDelete(null);
  };

  const currentEditingGroup = editingGroupId
    ? roomGroups.find((group) => group.id === editingGroupId)
    : null;

  if (deleteConfirmVisible) {
    return (
      <DeleteGroupDialog
        visible={deleteConfirmVisible}
        groupId={groupIdToDelete}
        onClose={onCloseDeleteConfirm}
        deleteRoomGroup={deleteRoomGroup}
        getAllRoomGroups={getAllRoomGroups}
        currentFilterGroupId={currentFilterGroupId}
      />
    );
  }

  const isOpenedFromContextMenu =
    !!createGroupFromRoomIds && createGroupFromRoomIds.length > 0;

  if (isOpenGroupIcon) {
    return (
      <GroupIconDialog
        currentColorScheme={currentColorScheme}
        getCovers={getCovers}
        covers={covers}
        setIsOpenGroupIcon={setIsOpenGroupIcon}
        onCloseEditRoomGroupsDialog={onCloseEditRoomGroupsDialog}
        setCreateGroupRooms={setCreateGroupRooms}
        getAllRoomGroups={getAllRoomGroups}
        arrIdsRooms={arrIdsRooms}
        editingGroupId={editingGroupId}
        setEditingGroupId={setEditingGroupId}
        updateGroupIcon={updateGroupIcon}
        updateRoomGroup={updateRoomGroup}
        currentGroupIcon={currentEditingGroup?.icon || null}
        currentGroupName={currentEditingGroup?.name || null}
        isOpenedFromContextMenu={isOpenedFromContextMenu && !editingGroupId}
      />
    );
  }

  if (isOpenRoomList && selectedGroup) {
    return (
      <RoomListPanel
        visible={isOpenRoomList}
        onClose={onCloseGroupRoomList}
        onSubmit={onSubmitRoom}
        headerLabel={selectedGroup.name}
        selectedRooms={selectedGroup.rooms || []}
        withSearch={false}
        disableSubmitUntilChanged
        sortSelectedFirst
      />
    );
  }

  if (isOpenRoomList && !selectedGroup) {
    return (
      <RoomListPanel
        visible={isOpenRoomList}
        onClose={onCloseRoomList}
        onSubmit={onSubmitRoom}
        headerLabel={t("Common:RoomList")}
        withSearch
        disableSubmitUntilChanged
      />
    );
  }

  const renderGroupItems = () => {
    return roomGroups.map((group) => (
      <GroupItem
        key={group.id}
        group={group}
        onClickGroup={localGroupingEnabled ? onClickGroup : undefined}
        onClickEditIcon={localGroupingEnabled ? onClickEditIcon : undefined}
        onClickDeleteGroup={
          localGroupingEnabled ? onClickDeleteGroup : undefined
        }
        disabled={!localGroupingEnabled}
      />
    ));
  };

  return (
    <ModalDialog
      displayType={ModalDialogType.aside}
      withBodyScroll
      visible={true}
      className={styles.editRoomGroupsDialog}
      onClose={onCloseEditRoomGroupsDialog}
    >
      <ModalDialog.Header>
        {t("GroupingRooms:EditRoomGroups")}
      </ModalDialog.Header>

      <ModalDialog.Body>
        {isTooltipVisible && (
          <PublicRoomBar
            className={styles.infoBar}
            headerText={
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "12px",
                  lineHeight: "16px",
                }}
              >
                {t("GroupingRooms:DisablingRoomGroups")}
              </span>
            }
            bodyText={
              <span style={{ display: "block", marginTop: "2px" }}>
                {t("GroupingRooms:DisablingRoomGroupsDescription")}
              </span>
            }
            iconName={InfoIcon}
            onClose={onDismissTooltip}
          />
        )}

        <div className={styles.settingRoomGroups}>
          <div className={styles.roomGroups}>
            <div className={styles.title}>
              {t("GroupingRooms:RoomGrouping")}
            </div>
            <ToggleButton
              className={styles.roomGroupsToggle}
              isChecked={localGroupingEnabled}
              onChange={onToggleGrouping}
            />
          </div>

          <Text className={styles.description}>
            {t("GroupingRooms:RoomGroupingSettingDescription")}
          </Text>
        </div>
        <AddButton
          onClick={onClickCreateNewGroup}
          className={styles.selectorAddButton}
          label={t("GroupingRooms:CreateNewGroup")}
          isDisabled={!localGroupingEnabled}
          tabIndex={localGroupingEnabled ? 0 : -1}
        />
        <div className={styles.addedGroups}>{renderGroupItems()}</div>
      </ModalDialog.Body>

      {hasGroupingChanged ? (
        <ModalDialog.Footer>
          <Button
            label={t("Common:SaveButton")}
            size={ButtonSize.normal}
            primary
            onClick={onSaveGroupingChange}
            scale
            isLoading={isSaving}
            isDisabled={isSaving}
          />
          <Button
            label={t("Common:CancelButton")}
            size={ButtonSize.normal}
            onClick={onCancelGroupingChange}
            scale
          />
        </ModalDialog.Footer>
      ) : null}
    </ModalDialog>
  );
};

export default inject(
  ({ dialogsStore, filesStore, filesSettingsStore }: TStore) => {
    const {
      setCreateGroupRooms,
      getAllRoomGroups,
      roomGroups,
      getGroupById,
      updateGroupIcon,
      updateRoomGroup,
      deleteRoomGroup,
      createGroupFromRoomIds,
      openInCreateMode,
    } = dialogsStore;

    const { roomsFilter, fetchRooms } = filesStore;
    const { organizeRoomsGrouping, setOrganizeRoomsGrouping } =
      filesSettingsStore;

    return {
      setCreateGroupRooms,
      getAllRoomGroups,
      roomGroups,
      getGroupById,
      updateGroupIcon,
      updateRoomGroup,
      deleteRoomGroup,
      createGroupFromRoomIds,
      currentFilterGroupId: roomsFilter?.groupId,
      openInCreateMode,
      fetchRooms,
      roomsFilter,
      organizeRoomsGrouping,
      setOrganizeRoomsGrouping,
    };
  },
)(observer(EditRoomGroupsDialog));
