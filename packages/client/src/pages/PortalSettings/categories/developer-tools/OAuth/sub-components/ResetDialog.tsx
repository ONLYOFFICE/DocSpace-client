/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { useParams } from "react-router";
import { inject, observer } from "mobx-react";
import { useTranslation, Trans } from "react-i18next";

import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { ModalDialogType } from "@docspace/ui-kit/components/modal-dialog/ModalDialog.enums";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { toastr, type TData } from "@docspace/ui-kit/components/toast";

import OAuthStore from "SRC_DIR/store/OAuthStore";

interface ResetDialogProps {
  isVisible?: boolean;
  onClose?: () => void;
  onReset?: (id: string) => Promise<void>;
}

const ResetDialog = (props: ResetDialogProps) => {
  const { id } = useParams();

  const { t, ready } = useTranslation(["OAuth", "Common"]);
  const { isVisible, onClose, onReset } = props;

  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const onResetClick = async () => {
    try {
      setIsRequestRunning(true);
      if (id) await onReset?.(id);

      setIsRequestRunning(false);
      toastr.success(t("OAuth:ClientSecretResetSuccessfully"));
      onClose?.();
    } catch (error: unknown) {
      const e = error as TData;
      toastr.error(e);
      onClose?.();
    }
  };

  return (
    <ModalDialog
      isLoading={!ready}
      visible={isVisible}
      onClose={onClose}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("ResetHeader")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Trans t={t} i18nKey="ResetDescription" ns="OAuth" />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="delete-button"
          key="DeletePortalBtn"
          label={t("Common:OKButton")}
          size={ButtonSize.normal}
          scale
          primary
          isLoading={isRequestRunning}
          onClick={onResetClick}
          testId="reset_dialog_ok_button"
        />
        <Button
          className="cancel-button"
          key="CancelDeleteBtn"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          isDisabled={isRequestRunning}
          onClick={onClose}
          testId="reset_dialog_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ oauthStore }: { oauthStore: OAuthStore }) => {
  const { setResetDialogVisible, regenerateSecret, resetDialogVisible } =
    oauthStore;

  const onClose = () => {
    setResetDialogVisible(false);
  };

  const onReset = async (id: string) => {
    await regenerateSecret(id);
  };

  return { isVisible: resetDialogVisible, onClose, onReset };
})(observer(ResetDialog));
