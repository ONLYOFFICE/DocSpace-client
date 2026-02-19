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

import React from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { toastr } from "@docspace/ui-kit/components/toast";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { isMobile } from "@docspace/ui-kit/utils";
import { ButtonKeys } from "@docspace/shared/enums";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";

import { CoverDialogProps } from "../RoomLogoCoverDialog.types";
import type {
  IUpdateRoomGroup,
  ICover,
  ILogo,
} from "../EditRoomGroupsDialog.types";
import { SelectIcon } from "./SelectIcon";
import {
  InputSize,
  InputType,
  TextInput,
} from "@docspace/ui-kit/components/text-input";
import { Text } from "@docspace/ui-kit/components/text";
import styles from "../EditRoomGroupsDialog.module.scss";

const GroupIconDialog = ({
  getCovers,
  covers,
  currentColorScheme,
  arrIdsRooms,
  setIsOpenGroupIcon,
  onCloseEditRoomGroupsDialog,
  setCreateGroupRooms,
  getAllRoomGroups,
  editingGroupId,
  setEditingGroupId,
  updateGroupIcon,
  updateRoomGroup,
  currentGroupIcon,
  currentGroupName,
  isOpenedFromContextMenu,
}: CoverDialogProps) => {
  const { t } = useTranslation(["Common", "RoomLogoCover", "GroupingRooms"]);

  const [roomIcon, setRoomIcon] = React.useState<
    ICover | ILogo | string | null
  >("folder");

  const [groupName, setGroupName] = React.useState<string>("");

  React.useEffect(() => {
    if (!covers) getCovers();
  }, [getCovers, covers]);

  React.useEffect(() => {
    if (editingGroupId && currentGroupIcon) {
      setRoomIcon(currentGroupIcon);
    }
  }, [editingGroupId, currentGroupIcon]);

  React.useEffect(() => {
    if (editingGroupId && currentGroupName) {
      setGroupName(currentGroupName);
    }
  }, [editingGroupId, currentGroupName]);

  const coverId =
    typeof roomIcon === "object" && roomIcon !== null
      ? roomIcon.id
      : typeof roomIcon === "string"
        ? roomIcon
        : "";

  const onChangeGroupName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setGroupName(value);
  };

  const onClose = () => {
    if (isOpenedFromContextMenu) {
      onCloseEditRoomGroupsDialog();
      return;
    }
    setIsOpenGroupIcon(false);
    if (setEditingGroupId) {
      setEditingGroupId(null);
    }
  };

  const handleSubmit = async () => {
    if (editingGroupId) {
      if (!roomIcon) return;

      const iconId = typeof roomIcon === "object" ? roomIcon.id : roomIcon;

      try {
        const updateData: IUpdateRoomGroup = {};

        if (groupName && groupName !== currentGroupName) {
          updateData.groupName = groupName;
        }

        if (Object.keys(updateData).length > 0) {
          await updateRoomGroup(editingGroupId, updateData);
        }

        if (
          iconId !==
          (typeof currentGroupIcon === "object" && currentGroupIcon !== null
            ? currentGroupIcon.id
            : currentGroupIcon)
        ) {
          await updateGroupIcon(editingGroupId, iconId);
        }

        await getAllRoomGroups();

        toastr.success(t("GroupingRooms:ChangesApplied"));
        onClose();
      } catch (error: unknown) {
        let message = "";

        if (axios.isAxiosError(error)) {
          message =
            error.response?.data?.response?.errors?.Name ??
            error.response?.data?.message ??
            error.message;
        } else if (error instanceof Error) {
          message = error.message;
        }

        toastr.error(message);
      }
    } else {
      if (!groupName || !arrIdsRooms?.length || !roomIcon) return;

      const newGroup = {
        name: groupName,
        icon: typeof roomIcon === "object" ? roomIcon.id : roomIcon,
        rooms: arrIdsRooms,
      };

      try {
        await setCreateGroupRooms(newGroup);
        await getAllRoomGroups();

        onCloseEditRoomGroupsDialog();
      } catch (error: unknown) {
        let message = "";

        if (axios.isAxiosError(error)) {
          message =
            error.response?.data?.response?.errors?.Name ??
            error.response?.data?.message ??
            error.message;
        } else if (error instanceof Error) {
          message = error.message;
        }

        toastr.error(message);
      }
    }
  };

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ButtonKeys.enter) {
        e.preventDefault();
        handleSubmit();
      }
    };

    const rafId = requestAnimationFrame(() => {
      document.addEventListener("keydown", onKeyDown, false);
    });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("keydown", onKeyDown, false);
    };
  }, [handleSubmit]);

  if (!covers) return null;

  return (
    <ModalDialog
      className={styles.groupIconDialog}
      visible
      autoMaxHeight
      withBodyScroll
      displayType={isMobile() ? ModalDialogType.aside : ModalDialogType.modal}
      onClose={onClose}
    >
      <ModalDialog.Header>{t("GroupingRooms:GroupIcon")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.name}>
          <Text
            fontWeight={600}
            fontSize="13px"
            lineHeight="20px"
            noSelect
            truncate
            className={styles.nameText}
          >
            {t("GroupingRooms:GroupName")}
          </Text>
          <span className={styles.symbol}>*</span>
          <TextInput
            className={styles.nameInput}
            type={InputType.text}
            size={InputSize.base}
            value={groupName || ""}
            scale
            placeholder={t("Common:EnterName")}
            isAutoFocussed
            maxLength={128}
            onChange={onChangeGroupName}
          />
        </div>
        <div className={styles.roomLogoCoverContainer}>
          <SelectIcon
            t={t}
            $currentColorScheme={currentColorScheme}
            coverId={coverId}
            setIcon={(icon: ICover | string | null) => setRoomIcon(icon)}
            covers={covers}
          />
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          scale
          primary
          tabIndex={0}
          size={ButtonSize.normal}
          label={t("Common:Create")}
          onClick={handleSubmit}
          isDisabled={!groupName.trim()}
        />
        <Button
          scale
          tabIndex={0}
          onClick={onClose}
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default GroupIconDialog;
