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
import { Button } from "@docspace/shared/components/button";
import styled from "styled-components";
import { withTranslation } from "react-i18next";

const StyledFooterContent = styled.div`
  display: contents;

  .button-modal {
    width: 50%;
  }
`;

const ModalDialogDelete = (props) => {
  const { visible, onClose, onClickDelete, t } = props;

  const onKeyPress = (e) =>
    (e.key === "Esc" || e.key === "Escape") && onClose();

  useEffect(() => {
    window.addEventListener("keyup", onKeyPress);
    return () => window.removeEventListener("keyup", onKeyPress);
  });

  return (
    <ModalDialog visible={visible} onClose={onClose} displayType="modal">
      <ModalDialog.Header>
        {t("Settings:DeleteThemeForever")}
      </ModalDialog.Header>
      <ModalDialog.Body>{t("Settings:DeleteThemeNotice")}</ModalDialog.Body>
      <ModalDialog.Footer>
        <StyledFooterContent>
          <Button
            className="delete button-modal"
            label={t("Common:Delete")}
            onClick={onClickDelete}
            primary
            size="normal"
            testId="portal_settings_modal_dialog_delete_button"
          />
          <Button
            className="cancel-button button-modal"
            label={t("Common:CancelButton")}
            size="normal"
            onClick={onClose}
            testId="portal_settings_modal_dialog_cancel_button"
          />
        </StyledFooterContent>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default withTranslation(["Common", "Settings"])(ModalDialogDelete);
