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

import { useEffect } from "react";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { RoomsType } from "@docspace/shared/enums";

const RestoreRoomDialogComponent = (props) => {
  const {
    t,
    tReady,
    visible,
    restoreAll,
    setRestoreRoomDialogVisible,
    setRestoreAllArchive,
    setArchiveAction,
    items,
    hasPublicRoom,
  } = props;

  const onClose = () => {
    setRestoreAllArchive(false);
    setRestoreRoomDialogVisible(false);
  };

  const onAction = () => {
    const itemsRestoreHaveRights = items.filter(
      (item) => item.security.Move === true,
    );

    setRestoreRoomDialogVisible(false);
    setArchiveAction("unarchive", itemsRestoreHaveRights, t).then(() => {
      setRestoreAllArchive(false);
    });
  };

  const onKeyPress = (e) => {
    if (e.keyCode === 13) {
      onAction();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);

    return () => window.removeEventListener("keydown", onKeyPress);
  }, []);

  const getDescription = () => {
    if (hasPublicRoom) {
      return items.length > 1
        ? t("Files:WantToRestoreTheRooms")
        : t("Files:WantToRestoreTheRoom");
    }

    if (restoreAll) return t("ArchiveDialog:RestoreAllRooms");

    return items.length > 1
      ? t("ArchiveDialog:RestoreRooms")
      : t("ArchiveDialog:RestoreRoom");
  };

  const description = getDescription();

  return (
    <ModalDialog
      isLoading={!tReady}
      visible={visible}
      onClose={onClose}
      displayType="modal"
    >
      <ModalDialog.Header>{t("Common:Restore")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>{description}</Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="restore-all_submit"
          key="OKButton"
          label={t("Common:Restore")}
          size="normal"
          primary
          onClick={onAction}
          scale
        />
        <Button
          id="restore-all_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          onClick={onClose}
          scale
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

const RestoreRoomDialog = withTranslation(["Files", "ArchiveDialog", "Common"])(
  RestoreRoomDialogComponent,
);

export default inject(
  ({ filesStore, filesActionsStore, dialogsStore, selectedFolderStore }) => {
    const { roomsForRestore, selection, bufferSelection } = filesStore;
    const { setArchiveAction } = filesActionsStore;

    const {
      restoreRoomDialogVisible: visible,
      restoreAllArchive: restoreAll,
      setRestoreRoomDialogVisible,
      setRestoreAllArchive,
    } = dialogsStore;

    const items = restoreAll
      ? roomsForRestore
      : selection.length > 0
        ? selection
        : bufferSelection
          ? [bufferSelection]
          : [selectedFolderStore];

    const hasPublicRoom =
      items.findIndex((i) => i.roomType === RoomsType.PublicRoom) !== -1;

    return {
      visible,
      restoreAll,
      setRestoreRoomDialogVisible,
      setRestoreAllArchive,
      setArchiveAction,
      items,
      hasPublicRoom,
    };
  },
)(observer(RestoreRoomDialog));
