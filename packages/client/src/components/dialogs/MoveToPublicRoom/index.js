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

import { useEffect, useState } from "react";
import { Button } from "@docspace/ui-kit/components/button";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Text } from "@docspace/ui-kit/components/text";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

let timerId;

const MoveToPublicRoomComponent = (props) => {
  const {
    t,
    tReady,
    visible,
    setIsVisible,
    setConflictResolveDialogVisible,
    setMoveToPanelVisible,
    setRestorePanelVisible,
    setCopyPanelVisible,
    setRestoreAllPanelVisible,
    moveToPublicRoomData,
    checkFileConflicts,
    setConflictDialogData,
    itemOperationToFolder,
    clearActiveOperations,
    setSelectedItems,
    setSelected,
  } = props;

  const [isLoading, setIsLoading] = useState(false);

  const onClose = () => {
    setIsVisible(false);
  };

  const onClosePanels = () => {
    setIsVisible(false);
    setConflictResolveDialogVisible(false);
    setSelected("none");
    setMoveToPanelVisible(false);
    setRestorePanelVisible(false);
    setCopyPanelVisible(false);
    setRestoreAllPanelVisible(false);
  };

  const onMoveTo = () => {
    const { destFolderId, folderIds, fileIds } = moveToPublicRoomData;

    if (!timerId)
      timerId = setTimeout(() => {
        setIsLoading(true);
      }, 500);

    setSelectedItems();
    checkFileConflicts(destFolderId, folderIds, fileIds)
      .then(async (conflicts) => {
        if (conflicts.length) {
          setConflictDialogData(conflicts, moveToPublicRoomData);
          setIsLoading(false);
        } else {
          setIsLoading(false);
          onClosePanels();
          await itemOperationToFolder(moveToPublicRoomData);
        }
      })
      .catch(() => {
        setIsLoading(false);
        clearActiveOperations(fileIds, folderIds);
      })
      .finally(() => {
        clearTimeout(timerId);
        timerId = null;
      });
  };

  const onKeyUp = (e) => {
    if (e.keyCode === 27) onClose();
    if (e.keyCode === 13 || e.which === 13) onMoveTo();
  };

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp, false);
    return () => {
      document.removeEventListener("keyup", onKeyUp, false);
    };
  }, [onKeyUp]);

  useEffect(() => {
    return () => {
      clearTimeout(timerId);
      timerId = null;
    };
  });

  return (
    <ModalDialog isLoading={!tReady} visible={visible} onClose={onClose}>
      <ModalDialog.Header>
        {t("Files:MoveToPublicRoomTitle")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className="modal-dialog-content-body">
          <Text>{t("Common:MoveToPublicRoom")}</Text>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="delete-file-modal_submit"
          key="OKButton"
          label={t("Common:OKButton")}
          size="normal"
          primary
          scale
          onClick={onMoveTo}
          isLoading={isLoading}
          testId="move_to_public_room_button"
        />
        <Button
          id="delete-file-modal_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
          isLoading={isLoading}
          testId="move_to_public_room_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

const MoveToPublicRoomDialog = withTranslation([
  "Common",
  "Translations",
  "Files",
  "EmptyTrashDialog",
])(MoveToPublicRoomComponent);

export default inject(
  ({ dialogsStore, filesActionsStore, filesStore, uploadDataStore }) => {
    const { setSelected } = filesStore;

    const {
      moveToPublicRoomVisible,
      setMoveToPublicRoomVisible,
      setConflictResolveDialogVisible,
      setMoveToPanelVisible,
      setRestorePanelVisible,
      setCopyPanelVisible,
      setRestoreAllPanelVisible,
      moveToPublicRoomData,
    } = dialogsStore;

    const { setConflictDialogData, checkFileConflicts, setSelectedItems } =
      filesActionsStore;
    const { itemOperationToFolder, clearActiveOperations } = uploadDataStore;

    return {
      visible: moveToPublicRoomVisible,
      setIsVisible: setMoveToPublicRoomVisible,
      setConflictResolveDialogVisible,
      setMoveToPanelVisible,
      setRestorePanelVisible,
      setCopyPanelVisible,
      setRestoreAllPanelVisible,
      moveToPublicRoomData,
      checkFileConflicts,
      setConflictDialogData,
      itemOperationToFolder,
      clearActiveOperations,
      setSelectedItems,
      setSelected,
    };
  },
)(observer(MoveToPublicRoomDialog));
