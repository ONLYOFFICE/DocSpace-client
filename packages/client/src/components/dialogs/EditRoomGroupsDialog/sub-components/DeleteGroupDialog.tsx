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

import { useState, useEffect, useCallback } from "react";
import { Trans, useTranslation } from "react-i18next";
import { toastr } from "@docspace/ui-kit/components/toast";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { ButtonKeys } from "@docspace/shared/enums";
import { Text } from "@docspace/ui-kit/components/text";

import styles from "../EditRoomGroupsDialog.module.scss";
import type { DeleteGroupDialogProps } from "../EditRoomGroupsDialog.types";

const DeleteGroupDialog = ({
  visible,
  groupId,
  onClose,
  deleteRoomGroup,
  getAllRoomGroups,
  currentFilterGroupId,
}: DeleteGroupDialogProps) => {
  const { t } = useTranslation(["Common", "GroupingRooms"]);
  const [isDeleting, setIsDeleting] = useState(false);

  const onConfirmDelete = useCallback(async () => {
    if (!groupId) return;

    setIsDeleting(true);
    try {
      await deleteRoomGroup(groupId);
      toastr.success(t("GroupingRooms:GroupHasBeenDeleted"));
      await getAllRoomGroups();

      // If the deleted group was the currently selected filter, navigate to All rooms
      if (
        currentFilterGroupId != null &&
        String(currentFilterGroupId) === String(groupId)
      ) {
        window.DocSpace.navigate("/rooms/shared/filter");
      }
    } catch (error) {
      toastr.error(error as Error);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  }, [
    groupId,
    deleteRoomGroup,
    getAllRoomGroups,
    currentFilterGroupId,
    onClose,
    t,
  ]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ButtonKeys.enter && !isDeleting) {
        e.preventDefault();
        onConfirmDelete();
      }
    };

    const rafId = requestAnimationFrame(() => {
      document.addEventListener("keydown", onKeyDown, false);
    });

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("keydown", onKeyDown, false);
    };
  }, [onConfirmDelete, isDeleting]);

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      className={styles.deleteGroupDialog}
    >
      <ModalDialog.Header>{t("GroupingRooms:RemoveGroup")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text lineHeight="20px">
          {t("GroupingRooms:RemoveGroupConfirmation")}
        </Text>
        <Text style={{ marginTop: "16px" }} lineHeight="24px">
          <Trans
            t={t}
            i18nKey="GroupingRooms:RemoveGroupInfo"
            components={{ strong: <strong style={{ fontWeight: 700 }} /> }}
          />
        </Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="DeleteButton"
          label={t("GroupingRooms:DeleteGroup")}
          size={ButtonSize.normal}
          primary
          scale
          onClick={onConfirmDelete}
          isLoading={isDeleting}
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
          isDisabled={isDeleting}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default DeleteGroupDialog;
