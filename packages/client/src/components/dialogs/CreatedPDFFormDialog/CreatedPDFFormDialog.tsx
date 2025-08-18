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

import React from "react";
import { useTheme } from "styled-components";
import { useTranslation } from "react-i18next";
import { observer, inject } from "mobx-react";

import HeaderIcon from "PUBLIC_DIR/images/ready.pdf.form.modal.svg";
import HeaderDarkIcon from "PUBLIC_DIR/images/ready.pdf.form.modal.dark.svg";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Checkbox } from "@docspace/shared/components/checkbox";
import { Button, ButtonSize } from "@docspace/shared/components/button";

import { Wrapper } from "./CreatedPDFFormDialog.styled";
import type {
  CreatedPDFFormDialogProps,
  InjectedCreatedPDFFormDialogProps,
} from "./CreatedPDFFormDialog.types";

export const CreatedPDFFormDialog = inject<TStore>(
  ({ contextOptionsStore }) => {
    const { onCopyLink } = contextOptionsStore;

    return { onCopyLink };
  },
)(
  observer(
    ({
      file,
      localKey,
      onClose,
      onCopyLink,
      visible,
    }: CreatedPDFFormDialogProps & InjectedCreatedPDFFormDialogProps) => {
      const { t } = useTranslation(["PDFFormDialog", "Common"]);
      const theme = useTheme();

      const onSubmit = () => {
        onCopyLink(file, t);
        onClose();
      };

      const handleChangeCheckbox = (
        event: React.ChangeEvent<HTMLInputElement>,
      ) => {
        localStorage.setItem(localKey, event.target.checked.toString());
      };

      const description = t("PDFFormSuccessfullyCreatedDescription");
      const primaryButtonLabel = t("Common:CopyPublicLink");

      return (
        <ModalDialog
          autoMaxHeight
          visible={visible}
          onClose={onClose}
          displayType={ModalDialogType.modal}
        >
          <ModalDialog.Header>{t("PDFform")}</ModalDialog.Header>
          <ModalDialog.Body>
            <Wrapper>
              {theme.isBase ? <HeaderIcon /> : <HeaderDarkIcon />}
              <span>{description}</span>
              <Checkbox
                className="created-pdf__checkbox"
                onChange={handleChangeCheckbox}
                label={t("Common:DontShowAgain")}
                dataTestId="created_pdf_form_dialog_dont_show_again"
              />
            </Wrapper>
          </ModalDialog.Body>
          <ModalDialog.Footer>
            <Button
              scale
              primary
              tabIndex={0}
              size={ButtonSize.normal}
              label={primaryButtonLabel}
              onClick={onSubmit}
              testId="created_pdf_form_dialog_copy_public_link"
            />
            <Button
              tabIndex={0}
              onClick={onClose}
              size={ButtonSize.normal}
              label={t("Common:Later")}
              testId="created_pdf_form_dialog_later"
            />
          </ModalDialog.Footer>
        </ModalDialog>
      );
    },
  ),
) as unknown as React.FC<CreatedPDFFormDialogProps>;
