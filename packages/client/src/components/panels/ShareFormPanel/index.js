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

import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import FormDataCollectionIcon from "PUBLIC_DIR/images/icons/32/form.data.collection.svg";
import RoleBasedFillingIcon from "PUBLIC_DIR/images/icons/32/role.based.filling.svg";
import ShareSvg from "PUBLIC_DIR/images/icons/32/share.svg";

import { RoomsType } from "@docspace/shared/enums";
import { ShareCollectSelector } from "SRC_DIR/components/ShareCollectSelector";

import { ShareFormDialog } from "@docspace/shared/dialogs/share-form-dialog";

const ShareFormPanel = ({
  visible,
  setIsShareFormData,
  updateAccessLink,
  fileId,
  files,
}) => {
  const { t } = useTranslation("Common");

  const [isVisibleSelectFormRoomDialog, setIsVisibleSelectFormRoomDialog] =
    useState(false);
  const [roomType, setRoomType] = useState(RoomsType.FormRoom);

  const file = useMemo(
    () => files.find((item) => item.id === fileId),
    [fileId, files],
  );

  const onClose = useCallback(() => {
    setIsShareFormData({
      visible: false,
    });
  }, []);

  const onClickShareFile = useCallback(() => {
    updateAccessLink();
    onClose();
  }, [onClose, updateAccessLink]);

  const onClickFormRoom = useCallback(() => {
    setRoomType(RoomsType.FormRoom);
    setIsVisibleSelectFormRoomDialog(true);
  }, []);

  const onClickVirtualDataRoom = useCallback(() => {
    setRoomType(RoomsType.VirtualDataRoom);
    setIsVisibleSelectFormRoomDialog(true);
  }, []);

  const onCloseSelectionFormRoom = useCallback(() => {
    setIsVisibleSelectFormRoomDialog(false);
  }, []);

  const cards = useMemo(
    () => [
      {
        id: "quick-sharing",
        title: t("Common:QuickSharing"),
        description: t("Common:ShareTheOriginalFormForFillingOut"),
        buttonLabel: t("Common:Share"),
        onClick: onClickShareFile,
        icon: <ShareSvg />,
      },
      {
        id: "form-data-collection",
        title: t("Common:FormDataCollection"),
        description: t("Common:FormDataCollectionDescription"),
        buttonLabel: t("Common:ShareInTheRoom"),
        onClick: onClickFormRoom,
        icon: <FormDataCollectionIcon />,
      },
      {
        id: "role-based-filling",
        title: t("Common:RecipientBasedFilling"),
        description: t("Common:RecipientBasedFillingDescription"),
        buttonLabel: t("Common:ShareInTheRoom"),
        onClick: onClickVirtualDataRoom,
        icon: <RoleBasedFillingIcon />,
      },
    ],
    [t, onClickShareFile, onClickFormRoom, onClickVirtualDataRoom],
  );

  return (
    <ShareFormDialog
      title={t("Common:ShareToFillOut")}
      cards={cards}
      visible={visible}
      onClose={onClose}
      containerVisible={isVisibleSelectFormRoomDialog}
      container={
        <ShareCollectSelector
          file={file}
          visible={isVisibleSelectFormRoomDialog}
          headerProps={{
            withoutBorder: false,
            onCloseClick: onClose,
            withoutBackButton: false,
            onBackClick: onCloseSelectionFormRoom,
          }}
          onCloseActionProp={onClose}
          createDefineRoomType={roomType}
          onCancel={onCloseSelectionFormRoom}
        />
      }
    />
  );
};

export default inject(({ dialogsStore, filesStore }) => {
  const { setIsShareFormData } = dialogsStore;
  const { files } = filesStore;

  return {
    setIsShareFormData,
    files,
  };
})(observer(ShareFormPanel));
