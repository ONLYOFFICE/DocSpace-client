// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

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
