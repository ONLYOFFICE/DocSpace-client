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

import PropTypes from "prop-types";
import { Button } from "@docspace/shared/components/button";
import { ModalDialog } from "@docspace/shared/components/modal-dialog";
import { toastr } from "@docspace/shared/components/toast";
import { Text } from "@docspace/shared/components/text";
import { withTranslation } from "react-i18next";

const ResetApplicationDialogComponent = (props) => {
  const { t, resetTfaApp, id, onClose, tReady, visible } = props;

  const resetApp = async () => {
    onClose && onClose();
    try {
      const res = await resetTfaApp(id);
      toastr.success(t("SuccessResetApplication"));

      if (res) window.location.replace(res);
    } catch (e) {
      toastr.error(e);
    }
  };

  return (
    <ModalDialog isLoading={!tReady} visible={visible} onClose={onClose}>
      <ModalDialog.Header>{t("ResetApplicationTitle")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text>{t("ResetApplicationDescription")}</Text>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="ResetSendBtn"
          label={t("Common:ResetApplication")}
          size="normal"
          scale
          primary
          onClick={resetApp}
          testId="dialog_reset_app_button"
        />
        <Button
          key="CloseBtn"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          primary={false}
          onClick={onClose}
          testId="dialog_reset_app_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

const ResetApplicationDialog = withTranslation([
  "ResetApplicationDialog",
  "Common",
])(ResetApplicationDialogComponent);

ResetApplicationDialog.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  resetTfaApp: PropTypes.func.isRequired,
  id: PropTypes.string.isRequired,
};

export default ResetApplicationDialog;
