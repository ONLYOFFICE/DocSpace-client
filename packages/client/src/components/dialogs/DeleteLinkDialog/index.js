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

import React, { useState, useEffect } from "react";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";

import { StyledDeleteLinkDialog } from "./StyledDeleteLinkDialog";

import { withTranslation } from "react-i18next";

import { inject, observer } from "mobx-react";
import { RoomsType } from "@docspace/shared/enums";

const DeleteLinkDialogComponent = (props) => {
  const {
    t,
    link,
    visible,
    setIsVisible,
    tReady,
    roomId,
    deleteExternalLink,
    editExternalLink,
    isPublicRoomType,
    setRoomShared,
  } = props;

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp, false);

    return () => {
      document.removeEventListener("keyup", onKeyUp, false);
    };
  }, []);

  const onKeyUp = (e) => {
    if (e.keyCode === 27) onClose();
    if (e.keyCode === 13 || e.which === 13) onDelete();
  };

  const onClose = () => {
    setIsVisible(false);
  };

  const onDelete = () => {
    setIsLoading(true);

    const newLink = JSON.parse(JSON.stringify(link));
    newLink.access = 0;

    editExternalLink(roomId, newLink)
      .then((res) => {
        setRoomShared(roomId, !!res);
        deleteExternalLink(res, newLink.sharedTo.id);

        if (link.sharedTo.primary && isPublicRoomType) {
          toastr.success(t("Files:GeneralLinkDeletedSuccessfully"));
        } else toastr.success(t("Files:LinkDeletedSuccessfully"));
      })
      .catch((err) => toastr.error(err?.message))
      .finally(() => {
        setIsLoading(false);
        onClose();
      });
  };

  return (
    <StyledDeleteLinkDialog
      isLoading={!tReady}
      visible={visible}
      onClose={onClose}
    >
      <ModalDialog.Header>
        {link.sharedTo.primary && isPublicRoomType
          ? t("Files:RevokeLink")
          : t("Files:DeleteLink")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className="modal-dialog-content-body">
          <Text noSelect>
            {link.sharedTo.primary && isPublicRoomType
              ? t("Files:DeleteSharedLink")
              : t("Files:DeleteLinkNote")}
          </Text>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="delete-file-modal_submit"
          key="OkButton"
          label={
            link.sharedTo.primary && isPublicRoomType
              ? t("Files:RevokeLink")
              : t("Files:DeleteLink")
          }
          size="normal"
          primary
          scale
          onClick={onDelete}
          isDisabled={isLoading}
        />
        <Button
          id="delete-file-modal_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
          isDisabled={isLoading}
        />
      </ModalDialog.Footer>
    </StyledDeleteLinkDialog>
  );
};

const DeleteLinkDialog = withTranslation(["Common", "Files"])(
  DeleteLinkDialogComponent,
);

export default inject(
  ({ dialogsStore, publicRoomStore, filesStore, infoPanelStore }) => {
    const { infoPanelSelection } = infoPanelStore;
    const {
      deleteLinkDialogVisible: visible,
      setDeleteLinkDialogVisible: setIsVisible,
      linkParams,
    } = dialogsStore;
    const { editExternalLink, deleteExternalLink } = publicRoomStore;

    return {
      visible,
      setIsVisible,
      roomId: infoPanelSelection.id,
      link: linkParams.link,
      editExternalLink,
      deleteExternalLink,
      isPublicRoomType: infoPanelSelection.roomType === RoomsType.PublicRoom,
      setRoomShared: filesStore.setRoomShared,
    };
  },
)(observer(DeleteLinkDialog));
