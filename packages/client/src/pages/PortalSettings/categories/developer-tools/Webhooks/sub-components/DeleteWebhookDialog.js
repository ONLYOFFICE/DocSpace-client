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
import { useTranslation } from "react-i18next";

const StyledBodyText = styled.div`
  line-height: 20px;
`;

const Footer = styled.div`
  width: 100%;
  display: flex;

  button {
    width: 100%;
  }
  button:first-of-type {
    margin-inline-end: 10px;
  }
`;

export const DeleteWebhookDialog = ({
  visible,
  onClose,
  header,
  handleSubmit,
}) => {
  const onKeyPress = (e) =>
    (e.key === "Esc" || e.key === "Escape") && onClose();

  const { t } = useTranslation(["Webhooks", "Common", "EmptyTrashDialog"]);

  const cleanUpEvent = () => window.removeEventListener("keyup", onKeyPress);

  useEffect(() => {
    window.addEventListener("keyup", onKeyPress);
    return cleanUpEvent;
  });

  const handleDeleteClick = () => {
    handleSubmit();
    onClose();
  };

  return (
    <ModalDialog visible={visible} onClose={onClose} displayType="modal">
      <ModalDialog.Header>{header}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledBodyText>{t("DeleteHint")}</StyledBodyText>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Footer>
          <Button
            id="delete-forever-button"
            label={t("EmptyTrashDialog:DeleteForeverButton")}
            size="normal"
            primary
            onClick={handleDeleteClick}
            testId="delete_webhook_button"
          />
          <Button
            id="cancel-button"
            label={t("Common:CancelButton")}
            size="normal"
            onClick={onClose}
            testId="delete_webhook_cancel_button"
          />
        </Footer>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};
