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

import React from "react";
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";

import HeaderIcon from "PUBLIC_DIR/images/ready.pdf.form.modal.svg";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";

import { Wrapper } from "./CreatedPDFFormDialog.styled";
import type { CreatedPDFFormDialogProps } from "./CreatedPDFFormDialog.types";

export const CreatedPDFFormDialog = inject<TStore>(({ dialogsStore }) => {
  const { createdPDFFormDialogData: data } = dialogsStore;

  return { data };
})(
  observer(({ data }: CreatedPDFFormDialogProps) => {
    const { t } = useTranslation(["PDFFormDialog", "Common"]);

    const description = t("PDFFormInviteDescription");

    return (
      <ModalDialog
        visible
        displayType={ModalDialogType.modal}
        autoMaxHeight
        // onClose={onClose}
      >
        <ModalDialog.Header>{t("PDFFormDialogTitle")}</ModalDialog.Header>

        <ModalDialog.Body>
          <Wrapper>
            <HeaderIcon />
            <span>{description}</span>
          </Wrapper>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button
            // tabIndex={5}
            label={t("Common:SaveButton")}
            size={ButtonSize.normal}
            primary
            scale
            // onClick={onEditRoom}
            // isLoading={isLoading}
          />
          <Button
            // tabIndex={5}
            label={t("Common:CancelButton")}
            size={ButtonSize.normal}
            scale
            // onClick={onClose}
            // isDisabled={isLoading}
          />
        </ModalDialog.Footer>
      </ModalDialog>
    );
  }),
);
