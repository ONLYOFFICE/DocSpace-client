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

import { useCallback, useEffect, useState } from "react";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Checkbox } from "@docspace/shared/components/checkbox";

import { getDialogContent } from "./DeleteDialog.helper";

const StyledModalWrapper = styled(ModalDialog)`
  strong {
    display: inline-block;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: top;
  }
`;

const DeleteDialogComponent = (props) => {
  const {
    t,
    deleteAction,
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
    isTemplatesFolder,
    selection: selectionProps,
    onRemoveSharedFilesOrFolder,
    setUnsubscribe,
  } = props;
  const [isChecked, setIsChecked] = useState(false);

  const selection = [];
  let i = 0;

  while (selectionProps.length !== i) {
    const item = selectionProps[i];

    if (!item?.isEditing) {
      // if (item?.access === 0 || item?.access === 1 || unsubscribe) {
      selection.push(item);
      // }
    }
    i++;
  }

  const isTemplate = selection[0]?.isTemplate;

  const onClose = () => {
    if (
      selection.length === 1 &&
      selection[0]?.isArchive &&
      selection[0]?.isRootFolder === false
    ) {
      setSelected("none");
    }
    setBufferSelection(null);
    setRemoveMediaItem(null);
    setIsRoomDelete(false);
    setDeleteDialogVisible(false);
    setUnsubscribe(false);
  };

  const onDelete = () => {
    setSelected("none");
    onClose();

    const translations = {
      deleteFromTrash: t("Translations:TrashItemsDeleteSuccess", {
        sectionName: t("Common:TrashSection"),
      }),
    };

    if (!selection.length) return;

    deleteAction(translations, selection);
  };

  const onUnsubscribe = () => {
    setSelected("none");
    onClose();

    if (!selection.length) return;

    onRemoveSharedFilesOrFolder(selection);
  };

  const onDeleteRoom = async () => {
    const translations = {
      successRemoveRoom: t("Files:RoomRemoved"),
      successRemoveRooms: t("Files:RoomsRemoved"),
    };

    if (isTemplate) {
      translations.successRemoveTemplate = t("Files:TemplateRemoved");
    }

    setSelected("none");
    onClose();

    const itemsIdDeleteHaveRights = selection
      .filter((select) => select.security.Delete === true)
      .map((select) => select.id);

    await deleteRoomsAction(itemsIdDeleteHaveRights, translations);
  };

  const onDeleteAction = useCallback(() => {
    if (isRoomDelete || isTemplate) {
      if (!isChecked) return;
      onDeleteRoom();
      return;
    }

    if (unsubscribe) {
      onUnsubscribe();
      return;
    }

    onDelete();
  }, [
    isRoomDelete,
    isTemplate,
    isChecked,
    onDeleteRoom,
    unsubscribe,
    onUnsubscribe,
    onDelete,
  ]);

  const onKeyUp = useCallback(
    (e) => {
      if (e.keyCode === 27) onClose();
      if (e.keyCode === 13 || e.which === 13) onDeleteAction();
    },
    [onClose, onDeleteAction],
  );

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp, false);

    return () => {
      document.removeEventListener("keyup", onKeyUp, false);
    };
  }, [onKeyUp]);

  const moveToTrashTitle = () => {
    if (unsubscribe) return t("UnsubscribeTitle");
    return t("Common:SectionMoveConfirmation", {
      sectionName: t("Common:TrashSection"),
    });
  };

  const title = isTemplate
    ? `${t("Files:DeleteTemplate")}?`
    : isRoomDelete
      ? t("DeleteRoomTitle")
      : isRecycleBinFolder
        ? t("EmptyTrashDialog:DeleteForeverTitle")
        : isPrivacyFolder || selection[0]?.providerKey
          ? t("Common:Confirmation")
          : moveToTrashTitle();

  const noteText = unsubscribe
    ? t("UnsubscribeNote")
    : getDialogContent(
        t,
        selection,
        isTemplate,
        isRoomDelete,
        isRecycleBinFolder,
        isPersonalRoom,
        isRoom,
        isTemplatesFolder,
      );

  const accessButtonLabel = isTemplate
    ? t("Common:Delete")
    : isRoomDelete
      ? t("Common:DeletePermanently")
      : isRecycleBinFolder
        ? t("EmptyTrashDialog:DeleteForeverButton")
        : isPrivacyFolder || selection[0]?.providerKey
          ? t("Common:OKButton")
          : unsubscribe
            ? t("UnsubscribeButton")
            : t("Common:MoveToSection", {
                sectionName: t("Common:TrashSection"),
              });

  const isDisabledAccessButton =
    isRoomDelete || isTemplate ? !isChecked : !selection.length;

  return (
    <StyledModalWrapper isLoading={!tReady} visible={visible} onClose={onClose}>
      <ModalDialog.Header>{title}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>{noteText}</Text>
        {isRoomDelete || isTemplate ? (
          <Checkbox
            style={{ marginTop: "16px" }}
            label={
              isTemplate ? t("DeleteTemplateWarning") : t("DeleteRoomWarning")
            }
            isChecked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
          />
        ) : null}
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="delete-file-modal_submit"
          key="OKButton"
          label={accessButtonLabel}
          size="normal"
          primary
          scale
          onClick={onDeleteAction}
          isLoading={isLoading}
          isDisabled={isDisabledAccessButton}
          testId="delete_dialog_modal_submit"
        />
        <Button
          id="delete-file-modal_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
          isLoading={isLoading}
          testId="delete_dialog_modal_cancel"
        />
      </ModalDialog.Footer>
    </StyledModalWrapper>
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
  ({
    filesStore,
    dialogsStore,
    filesActionsStore,
    treeFoldersStore,
    contextOptionsStore,
  }) => {
    const {
      selection,
      isLoading,
      bufferSelection,
      setBufferSelection,
      setSelected,
    } = filesStore;
    const { deleteAction, deleteRoomsAction } = filesActionsStore;
    const {
      isPrivacyFolder,
      isRecycleBinFolder,
      isPersonalRoom,
      isRoom,
      isTemplatesFolderRoot,
    } = treeFoldersStore;

    const {
      deleteDialogVisible: visible,
      setDeleteDialogVisible,
      removeMediaItem,
      setRemoveMediaItem,
      unsubscribe,
      isRoomDelete,
      setIsRoomDelete,
      setUnsubscribe,
    } = dialogsStore;

    const { onRemoveSharedFilesOrFolder } = contextOptionsStore;

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
      unsubscribe,

      setRemoveMediaItem,
      setBufferSelection,
      setSelected,

      isRoomDelete,
      setIsRoomDelete,
      deleteRoomsAction,
      isPersonalRoom,
      isRoom,
      isTemplatesFolder: isTemplatesFolderRoot,
      onRemoveSharedFilesOrFolder,
      setUnsubscribe,
    };
  },
)(observer(DeleteDialog));
