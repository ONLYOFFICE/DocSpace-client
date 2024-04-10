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
import { Trans, useTranslation } from "react-i18next";

import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { Button } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";

import { sendDeletePortalEmail } from "@docspace/shared/api/portal";

import ModalDialogContainer from "../ModalDialogContainer";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";

const DeletePortalDialog = (props) => {
  const { t, ready } = useTranslation("Settings", "Common");
  const { visible, onClose, owner, stripeUrl } = props;

  const onDeleteClick = async () => {
    try {
      await sendDeletePortalEmail();
      toastr.success(
        t("PortalDeletionEmailSended", { ownerEmail: owner.email }),
      );
      onClose();
    } catch (error) {
      toastr.error(error);
    }
  };

  return (
    <ModalDialogContainer
      isLoading={!ready}
      visible={visible}
      onClose={onClose}
      displayType="modal"
    >
      <ModalDialog.Header>{t("DeleteDocSpace")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Trans t={t} i18nKey="DeleteDocSpaceInfo" ns="Settings">
          Before you delete the portal, please make sure that automatic billing
          is turned off. You may check the status of automatic billing in
          <ColorTheme
            className="stripe-url-link"
            tag="a"
            themeId={ThemeId.Link}
            fontSize="13px"
            fontWeight="600"
            href={stripeUrl}
            target="_blank"
          >
            on your Stripe customer portal.
          </ColorTheme>
        </Trans>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="delete-button"
          key="DeletePortalBtn"
          label={t("Common:Delete")}
          size="normal"
          scale
          primary={true}
          onClick={onDeleteClick}
        />
        <Button
          className="cancel-button"
          key="CancelDeleteBtn"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialogContainer>
  );
};

export default DeletePortalDialog;
