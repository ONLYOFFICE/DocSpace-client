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
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { withTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

const LeaveRoomDialog = (props) => {
  const {
    t,
    tReady,
    visible,
    setIsVisible,
    setChangeRoomOwnerIsVisible,
    isRoomOwner,
    onLeaveRoomAction,
  } = props;

  const [isLoading, setIsLoading] = useState(false);

  const onClose = () => setIsVisible(false);

  const onLeaveRoom = async () => {
    if (isRoomOwner) {
      setChangeRoomOwnerIsVisible(true);
      onClose();
    } else {
      setIsLoading(true);
      await onLeaveRoomAction(t, isRoomOwner);

      setIsLoading(false);
      onClose();
    }
  };

  const onKeyUp = (e) => {
    if (e.keyCode === 27) onClose();
    if (e.keyCode === 13 || e.which === 13) onLeaveRoom();
  };

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp, false);

    return () => {
      document.removeEventListener("keyup", onKeyUp, false);
    };
  }, []);

  return (
    <ModalDialog isLoading={!tReady} visible={visible} onClose={onClose}>
      <ModalDialog.Header>{t("Files:LeaveTheRoom")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className="modal-dialog-content-body">
          <Text noSelect>
            {isRoomOwner
              ? t("Files:LeaveRoomDescription")
              : t("Files:WantLeaveRoom")}
          </Text>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="OKButton"
          label={isRoomOwner ? t("Files:AssignOwner") : t("Common:OKButton")}
          size="normal"
          primary
          scale
          onClick={onLeaveRoom}
          isDisabled={isLoading}
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
          isDisabled={isLoading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(
  ({
    userStore,
    dialogsStore,
    filesStore,
    selectedFolderStore,
    filesActionsStore,
  }) => {
    const {
      leaveRoomDialogVisible: visible,
      setLeaveRoomDialogVisible: setIsVisible,
      setChangeRoomOwnerIsVisible,
    } = dialogsStore;
    const { user } = userStore;
    const { selection, bufferSelection } = filesStore;

    const selections = selection.length ? selection : [bufferSelection];
    const folderItem = selections[0] ? selections[0] : selectedFolderStore;

    const isRoomOwner = folderItem?.createdBy?.id === user.id;

    return {
      visible,
      setIsVisible,
      setChangeRoomOwnerIsVisible,
      isRoomOwner,
      onLeaveRoomAction: filesActionsStore.onLeaveRoom,
    };
  },
)(observer(withTranslation(["Common", "Files"])(LeaveRoomDialog)));
