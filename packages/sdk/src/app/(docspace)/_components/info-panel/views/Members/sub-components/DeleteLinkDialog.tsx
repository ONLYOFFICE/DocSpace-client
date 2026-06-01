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

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { toastr } from "@docspace/ui-kit/components/toast";

import { RoomsType } from "@docspace/shared/enums";
import { ShareLinkService } from "@docspace/shared/services/share-link.service";
import type {
  TFile,
  TFolder,
  TFileLink,
} from "@docspace/shared/api/files/types";

import styles from "../Members.module.scss";

type DeleteLinkDialogProps = {
  link: TFileLink;
  selection: TFile | TFolder;
  onClose: () => void;
  onDeleted: () => void;
};

const DeleteLinkDialog = ({
  link,
  selection,
  onClose,
  onDeleted,
}: DeleteLinkDialogProps) => {
  const { t, ready: tReady } = useTranslation(["Common"]);

  const [isLoading, setIsLoading] = useState(false);

  const item = selection;
  const roomType = (selection as TFolder).roomType;
  const isFormRoom = roomType === RoomsType.FormRoom;
  const isCustomRoom = roomType === RoomsType.CustomRoom;
  const isPublicRoomType = roomType === RoomsType.PublicRoom;

  const onDelete = () => {
    setIsLoading(true);

    const newLink = JSON.parse(JSON.stringify(link)) as TFileLink;
    newLink.access = 0;

    ShareLinkService.editLink(item, newLink)
      .then(() => {
        onDeleted();

        if (link.sharedTo.primary && (isPublicRoomType || isFormRoom)) {
          toastr.success(t("Common:GeneralLinkRevokedAndCreatedSuccessfully"));
        } else toastr.success(t("Common:RoomLinkDeletedSuccessfully"));
      })
      .catch((err: unknown) => {
        console.log(err);
        toastr.error((err as Error)?.message);
      })
      .finally(() => {
        setIsLoading(false);
        onClose();
      });
  };

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.keyCode === 27) onClose();
    if (e.keyCode === 13 || e.which === 13) onDelete();
  };

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp, false);

    return () => {
      document.removeEventListener("keyup", onKeyUp, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDescription = () => {
    if (link.sharedTo.primary) {
      if (isCustomRoom)
        return t("Common:RoomRevokeSharedLinkDescriptionCustomRoom");

      if (isFormRoom)
        return t("Common:RoomRevokeSharedLinkDescriptionFormRoom");

      if (isPublicRoomType)
        return t("Common:RoomRevokeSharedLinkDescriptionPublicRoom");
    }

    if (isPublicRoomType || isCustomRoom)
      return t("Common:RoomDeleteSharedCustomPublic");

    return t("Common:RoomDeleteSharedLink");
  };

  return (
    <ModalDialog isLoading={!tReady} visible onClose={onClose}>
      <ModalDialog.Header>
        {link.sharedTo.primary && (isPublicRoomType || isFormRoom)
          ? t("Common:RevokeLink")
          : t("Common:RoomDeleteLink")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div
          className={classNames(
            styles.deleteLinkDialogContainer,
            "modal-dialog-content-body",
          )}
        >
          <Text lineHeight="20px">{getDescription()}</Text>
          {link.sharedTo.primary ? (
            <Text lineHeight="20px">{t("Common:RoomActionCannotUndone")}</Text>
          ) : null}
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="delete-file-modal_submit"
          key="OKButton"
          label={
            link.sharedTo.primary && (isPublicRoomType || isFormRoom)
              ? t("Common:RevokeLink")
              : t("Common:RoomDeleteLink")
          }
          size={ButtonSize.normal}
          primary
          scale
          onClick={onDelete}
          isLoading={isLoading}
          testId="delete_link_dialog_ok_button"
        />
        <Button
          id="delete-file-modal_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
          isDisabled={isLoading}
          testId="delete_link_dialog_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default DeleteLinkDialog;
