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
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";

import FormDataCollectionIcon from "PUBLIC_DIR/images/icons/32/form.data.collection.svg";
import FillOutYourselfIcon from "PUBLIC_DIR/images/icons/32/fill.out.yourself.svg";
import RoleBasedFillingIcon from "PUBLIC_DIR/images/icons/32/role.based.filling.svg";

import { RoomsType } from "@docspace/shared/enums";
import {
  ShareFormDialog,
  type PanelCard,
} from "@docspace/shared/dialogs/share-form-dialog";

import { ShareCollectSelector } from "SRC_DIR/components/ShareCollectSelector";

import type {
  FillPDFDialogProps,
  InjectFillPDFDialogProps,
} from "./FillPDFDialog.types";

const FillPDFDialog = inject<TStore>(
  ({ dialogsStore, contextOptionsStore }) => {
    const { setFillPDFDialogData } = dialogsStore;
    const { gotoDocEditor } = contextOptionsStore;

    return { setFillPDFDialogData, gotoDocEditor };
  },
)(
  observer(
    ({
      visible,
      setFillPDFDialogData,
      gotoDocEditor,
      data,
    }: FillPDFDialogProps & InjectFillPDFDialogProps) => {
      const { t } = useTranslation(["FillPDFDialog", "Common"]);

      const [isVisibleSelectFormRoomDialog, setIsVisibleSelectFormRoomDialog] =
        useState(false);
      const [roomType, setRoomType] = useState<RoomsType>(RoomsType.FormRoom);

      const onClose = () => {
        setFillPDFDialogData!(false);
      };

      const openEditorFill = () => {
        gotoDocEditor!(data, false, null, false, true);
        onClose();
      };

      const openSelector = (type: RoomsType) => {
        setIsVisibleSelectFormRoomDialog(true);
        setRoomType(type);
      };

      const onCloseSelectionFormRoom = (): void => {
        setIsVisibleSelectFormRoomDialog(false);
      };

      const container = (
        <ShareCollectSelector
          file={data}
          visible={isVisibleSelectFormRoomDialog}
          headerProps={{
            headerLabel: t("Common:ShareAndCollect"),
            withoutBorder: false,
            onCloseClick: onClose,
            withoutBackButton: false,
            onBackClick: onCloseSelectionFormRoom,
          }}
          onCloseActionProp={onClose}
          createDefineRoomType={roomType}
          onCancel={onCloseSelectionFormRoom}
        />
      );

      const cards = [
        {
          id: "form-yourself",
          title: t("FillPDFDialog:FillOutTitle"),
          description: t("FillPDFDialog:FillOutDescription"),
          buttonLabel: t("FillPDFDialog:FillOutButtonLabel"),
          onClick: openEditorFill,
          icon: <FillOutYourselfIcon />,
        },
        {
          id: "form-data-collection",
          title: t("Common:FormDataCollection"),
          description: t("Common:FormDataCollectionDescription"),
          buttonLabel: t("Common:ShareInTheRoom"),
          onClick: () => openSelector(RoomsType.FormRoom),
          icon: <FormDataCollectionIcon />,
        },
        {
          id: "role-based-filling",
          title: t("Common:RecipientBasedFilling"),
          description: t("Common:RecipientBasedFillingDescription"),
          buttonLabel: t("Common:ShareInTheRoom"),
          onClick: () => openSelector(RoomsType.VirtualDataRoom),
          icon: <RoleBasedFillingIcon />,
        },
      ] satisfies PanelCard[];

      return (
        <ShareFormDialog
          cards={cards}
          visible={visible}
          onClose={onClose}
          container={container}
          title={t("FillPDFDialog:FillPDFDialogTitle")}
          containerVisible={isVisibleSelectFormRoomDialog}
        />
      );
    },
  ),
) as unknown as React.FC<FillPDFDialogProps>;

export default FillPDFDialog;
