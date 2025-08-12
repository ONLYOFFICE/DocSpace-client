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

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { inject, observer } from "mobx-react";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { toastr } from "@docspace/shared/components/toast";

import api from "@docspace/shared/api";
import { RoomsType } from "@docspace/shared/enums";
import FilesFilter from "@docspace/shared/api/files/filter";
import { ShareLinkService } from "@docspace/shared/services/share-link.service";

import { withTranslation } from "react-i18next";
import { DeleteLinkDialogContainer } from "./DeleteLinkDialog.styled";

const DeleteLinkDialogComponent = (props) => {
  const {
    t,
    link,
    visible,
    setIsVisible,
    tReady,
    item,
    deleteExternalLink,
    isPublicRoomType,
    isFormRoom,
    isCustomRoom,
    setPublicRoomKey,
    isRootFolder,
    updateUrlKeyForCustomRoom,
  } = props;

  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const onClose = () => {
    setIsVisible(false);
  };

  const onDelete = () => {
    setIsLoading(true);

    const newLink = JSON.parse(JSON.stringify(link));
    newLink.access = 0;

    ShareLinkService.editLink(item, newLink)
      .then((res) => {
        deleteExternalLink(res, newLink.sharedTo.id);

        if (link.sharedTo.primary && (isPublicRoomType || isFormRoom)) {
          toastr.success(t("Common:GeneralLinkRevokedAndCreatedSuccessfully"));
        } else toastr.success(t("Files:LinkDeletedSuccessfully"));

        const filterObj = FilesFilter.getFilter(window.location);

        return api.rooms
          .getRoomMembers(item.id, { filterType: 2 })
          .then((updatedLinks) => {
            const primaryLink = updatedLinks.items.find(
              (updatedLink) => updatedLink.sharedTo.primary,
            );

            if (
              link.sharedTo.primary &&
              (isPublicRoomType || isFormRoom) &&
              !isRootFolder
            ) {
              if (
                primaryLink &&
                filterObj.key !== primaryLink.sharedTo.requestToken
              ) {
                setPublicRoomKey(primaryLink.sharedTo.requestToken);
                setSearchParams((prev) => {
                  prev.set("key", primaryLink.sharedTo.requestToken);
                  return prev;
                });
              }
            }

            if (isCustomRoom && filterObj.key) {
              updateUrlKeyForCustomRoom(searchParams, setSearchParams);
            }

            return res;
          });
      })
      .catch((err) => {
        console.log(err);
        toastr.error(err.response?.data?.error.message);
      })
      .finally(() => {
        setIsLoading(false);
        onClose();
      });
  };

  const onKeyUp = (e) => {
    if (e.keyCode === 27) onClose();
    if (e.keyCode === 13 || e.which === 13) onDelete();
  };

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp, false);

    return () => {
      document.removeEventListener("keyup", onKeyUp, false);
    };
  }, []);

  const getDescription = () => {
    if (link.sharedTo.primary) {
      if (isCustomRoom) return t("Files:RevokeSharedLinkDescriptionCustomRoom");

      if (isFormRoom) return t("Files:RevokeSharedLinkDescriptionFormRoom");

      if (isPublicRoomType)
        return t("Files:RevokeSharedLinkDescriptionPublicRoom");
    }

    if (isPublicRoomType || isCustomRoom)
      return t("Files:DeleteSharedCustomPublic");

    return t("Files:DeleteSharedLink");
  };

  return (
    <ModalDialog isLoading={!tReady} visible={visible} onClose={onClose}>
      <ModalDialog.Header>
        {link.sharedTo.primary && (isPublicRoomType || isFormRoom)
          ? t("Common:RevokeLink")
          : t("Files:DeleteLink")}
      </ModalDialog.Header>
      <ModalDialog.Body>
        <DeleteLinkDialogContainer className="modal-dialog-content-body">
          <Text lineHeight="20px" noSelect>
            {getDescription()}
          </Text>
          {link.sharedTo.primary ? (
            <Text lineHeight="20px" noSelect>
              {t("Files:ActionCannotUndone")}
            </Text>
          ) : null}
        </DeleteLinkDialogContainer>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="delete-file-modal_submit"
          key="OKButton"
          label={
            link.sharedTo.primary && (isPublicRoomType || isFormRoom)
              ? t("Common:RevokeLink")
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
    </ModalDialog>
  );
};

const DeleteLinkDialog = withTranslation(["Common", "Files"])(
  DeleteLinkDialogComponent,
);

export default inject(
  /**
   * @param {TStore} param0
   * @returns
   */
  ({ dialogsStore, publicRoomStore, selectedFolderStore }) => {
    const {
      deleteLinkDialogVisible: visible,
      setDeleteLinkDialogVisible: setIsVisible,
      linkParams,
    } = dialogsStore;
    const { deleteExternalLink, setPublicRoomKey, updateUrlKeyForCustomRoom } =
      publicRoomStore;
    const { isRootFolder } = selectedFolderStore;
    const item = linkParams.item;

    const isFormRoom = item.roomType === RoomsType.FormRoom;
    const isCustomRoom = item.roomType === RoomsType.CustomRoom;
    const isPublicRoomType = item.roomType === RoomsType.PublicRoom;

    return {
      linkParams,
      visible,
      setIsVisible,
      item,
      link: linkParams.link,
      deleteExternalLink,
      isFormRoom,
      isCustomRoom,
      isPublicRoomType,
      setPublicRoomKey,
      isRootFolder,
      updateUrlKeyForCustomRoom,
    };
  },
)(observer(DeleteLinkDialog));
