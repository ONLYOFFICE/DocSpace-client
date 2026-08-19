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
