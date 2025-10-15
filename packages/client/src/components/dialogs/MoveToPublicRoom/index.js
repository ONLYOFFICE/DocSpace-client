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

import { useEffect, useState } from "react";
import { Button } from "@docspace/shared/components/button";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
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
