// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useEffect } from "react";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { toastr } from "@docspace/shared/components/toast";
import { StyledDeleteDialog } from "./StyledDeleteDialog";

import { withTranslation } from "react-i18next";

import { inject, observer } from "mobx-react";

const DeleteDialogComponent = (props) => {
  const {
    t,
    deleteAction,
    unsubscribeAction,
    setBufferSelection,
    setSelected,
    setRemoveMediaItem,
    setDeleteDialogVisible,
    visible,
    tReady,
    isLoading,
    unsubscribe,
    isPrivacyFolder,
    isRecycleBinFolder,
    isRoomDelete,
    setIsRoomDelete,
    deleteRoomsAction,
    isPersonalRoom,
    isRoom,
  } = props;

  const selection = [];
  let i = 0;

  while (props.selection.length !== i) {
    const item = props.selection[i];

    if (!item?.isEditing) {
      // if (item?.access === 0 || item?.access === 1 || unsubscribe) {
      selection.push(item);
      // }
    }
    i++;
  }

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp, false);

    return () => {
      document.removeEventListener("keyup", onKeyUp, false);
    };
  }, []);

  const onKeyUp = (e) => {
    if (e.keyCode === 27) onClose();
    if (e.keyCode === 13 || e.which === 13) onDeleteAction();
  };

  const onDelete = () => {
    setSelected("none");
    onClose();

    const translations = {
      deleteOperation: t("Translations:DeleteOperation"),
      deleteFromTrash: t("Translations:DeleteFromTrash"),
      deleteSelectedElem: t("Translations:DeleteSelectedElem"),
      FileRemoved: t("Files:FileRemoved"),
      FolderRemoved: t("Files:FolderRemoved"),
    };

    if (!selection.length) return;

    deleteAction(translations, selection);
  };

  const onUnsubscribe = () => {
    setSelected("none");
    onClose();

    if (!selection.length) return;

    let filesId = [];
    let foldersId = [];

    selection.map((item) => {
      item.fileExst ? filesId.push(item.id) : foldersId.push(item.id);
    });

    unsubscribeAction(filesId, foldersId).catch((err) => toastr.error(err));
  };

  const onDeleteRoom = async () => {
    const translations = {
      deleteOperation: t("Translations:DeleteOperation"),
      successRemoveFile: t("Files:FileRemoved"),
      successRemoveFolder: t("Files:FolderRemoved"),
      successRemoveRoom: t("Files:RoomRemoved"),
      successRemoveRooms: t("Files:RoomsRemoved"),
    };

    setSelected("none");
    onClose();

    const itemsIdDeleteHaveRights = selection
      .filter((select) => select.security.Delete === true)
      .map((select) => select.id);

    await deleteRoomsAction(itemsIdDeleteHaveRights, translations);
  };

  const onClose = () => {
    if (
      selection.length === 1 &&
      selection[0].isArchive &&
      selection[0].isRootFolder === false
    ) {
      setSelected("none");
    }
    setBufferSelection(null);
    setRemoveMediaItem(null);
    setIsRoomDelete(false);
    setDeleteDialogVisible(false);
  };

  const moveToTrashTitle = () => {
    if (unsubscribe) return t("UnsubscribeTitle");
    return t("MoveToTrashTitle");
  };

  const moveToTrashNoteText = () => {
    const isFolder = selection[0]?.isFolder || !!selection[0]?.parentId;
    const isSingle = selection.length === 1;
    const isThirdParty = selection[0]?.providerKey;

    if (isRoomDelete) {
      return isSingle
        ? `${t("DeleteRoom")} ${t("Common:WantToContinue")}`
        : `${t("DeleteRooms")} ${t("Common:WantToContinue")}`;
    }

    if (isRecycleBinFolder) {
      return isSingle ? (
        isFolder ? (
          t("DeleteFolder")
        ) : (
          <>
            <>{t("DeleteFile")} </>
            <>{t("FilePermanentlyDeleted")} </>
            <>{t("Common:WantToContinue")}</>
          </>
        )
      ) : (
        <>
          <>{t("DeleteItems")} </>
          <>{t("ItemsPermanentlyDeleted")} </>
          <>{t("Common:WantToContinue")}</>
        </>
      );
    }

    if (isPersonalRoom) {
      return isSingle ? (
        isFolder ? (
          <>
            <>{t("DeleteFolder")} </>
            <>{t("FolderPermanentlyDeleted")} </>
            <>{t("Common:WantToContinue")}</>
          </>
        ) : (
          <>
            <>{t("DeleteFile")} </>
            <>{t("FilePermanentlyDeleted")} </>
            <>{t("Common:WantToContinue")}</>
          </>
        )
      ) : (
        <>
          <>{t("DeleteItems")} </>
          <>{t("ItemsPermanentlyDeleted")} </>
          <>{t("Common:WantToContinue")}</>
        </>
      );
    }

    if (isRoom) {
      return isSingle ? (
        isFolder ? (
          <>
            <>{t("DeleteFolder")} </>
            <>{t("DeleteSharedNote")} </>
            <>{t("FolderPermanentlyDeleted")} </>
            <>{t("Common:WantToContinue")}</>
          </>
        ) : (
          <>
            <>{t("DeleteFile")} </>
            <>{t("DeleteSharedNote")} </>
            {!isThirdParty && <>{t("FilePermanentlyDeleted")} </>}
            <>{t("Common:WantToContinue")}</>
          </>
        )
      ) : (
        <>
          <>{t("DeleteItems")} </>
          <>{t("DeleteItemsSharedNote")} </>
          {!isThirdParty && <>{t("ItemsPermanentlyDeleted")} </>}
          <>{t("Common:WantToContinue")}</>
        </>
      );
    }
  };

  const title =
    isRoomDelete || isRecycleBinFolder
      ? t("EmptyTrashDialog:DeleteForeverTitle")
      : isPrivacyFolder || selection[0]?.providerKey
        ? t("Common:Confirmation")
        : moveToTrashTitle();

  const noteText = unsubscribe ? t("UnsubscribeNote") : moveToTrashNoteText();

  const accessButtonLabel =
    isRoomDelete || isRecycleBinFolder
      ? t("EmptyTrashDialog:DeleteForeverButton")
      : isPrivacyFolder || selection[0]?.providerKey
        ? t("Common:OKButton")
        : unsubscribe
          ? t("UnsubscribeButton")
          : t("MoveToTrashButton");

  const onDeleteAction = () => {
    if (isRoomDelete) onDeleteRoom();
    else if (unsubscribe) onUnsubscribe();
    else onDelete();
  };

  return (
    <StyledDeleteDialog isLoading={!tReady} visible={visible} onClose={onClose}>
      <ModalDialog.Header>{title}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className="modal-dialog-content-body">
          <Text noSelect>{noteText}</Text>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="delete-file-modal_submit"
          key="OkButton"
          label={accessButtonLabel}
          size="normal"
          primary
          scale
          onClick={onDeleteAction}
          isLoading={isLoading}
          isDisabled={!selection.length}
        />
        <Button
          id="delete-file-modal_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
          isLoading={isLoading}
        />
      </ModalDialog.Footer>
    </StyledDeleteDialog>
  );
};

const DeleteDialog = withTranslation([
  "DeleteDialog",
  "Common",
  "Translations",
  "Files",
  "EmptyTrashDialog",
])(DeleteDialogComponent);

export default inject(
  ({ filesStore, dialogsStore, filesActionsStore, treeFoldersStore }) => {
    const {
      selection,
      isLoading,
      bufferSelection,
      setBufferSelection,
      setSelected,
    } = filesStore;
    const { deleteAction, unsubscribeAction, deleteRoomsAction } =
      filesActionsStore;
    const { isPrivacyFolder, isRecycleBinFolder, isPersonalRoom, isRoom } =
      treeFoldersStore;

    const {
      deleteDialogVisible: visible,
      setDeleteDialogVisible,
      removeMediaItem,
      setRemoveMediaItem,
      unsubscribe,
      isRoomDelete,
      setIsRoomDelete,
    } = dialogsStore;

    return {
      selection: removeMediaItem
        ? [removeMediaItem]
        : selection.length
          ? selection
          : [bufferSelection],
      isLoading,
      visible,
      isPrivacyFolder,
      isRecycleBinFolder,

      setDeleteDialogVisible,
      deleteAction,
      unsubscribeAction,
      unsubscribe,

      setRemoveMediaItem,
      setBufferSelection,
      setSelected,

      isRoomDelete,
      setIsRoomDelete,
      deleteRoomsAction,
      isPersonalRoom,
      isRoom,
    };
  },
)(observer(DeleteDialog));
