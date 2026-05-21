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

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";

import { useFormsStopFillingDialogStore } from "../../_store/FormsStopFillingDialogStore";

const StopFillingDialog = observer(() => {
  const { t } = useTranslation(["Common"]);
  const store = useFormsStopFillingDialogStore();
  const { visible, isLoading, close, confirm } = store;

  const onSubmit = React.useCallback(() => {
    void confirm();
  }, [confirm]);

  return (
    <ModalDialog
      id="stop-filling-dialog"
      withForm
      visible={visible}
      displayType={ModalDialogType.modal}
      onClose={close}
      data-testid="stop-filling-dialog"
    >
      <ModalDialog.Header>{t("Common:StopFillingTitle")}</ModalDialog.Header>
      <ModalDialog.Body>{t("Common:StopFillingBody")}</ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="stop-filling-dialog_submit"
          key="OKButton"
          label={t("Common:StopFilling")}
          size={ButtonSize.normal}
          primary
          scale
          type="submit"
          onClick={onSubmit}
          isLoading={isLoading}
          aria-label={t("Common:StopFilling")}
        />
        <Button
          id="stop-filling-dialog_cancel"
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={close}
          isDisabled={isLoading}
          aria-label={t("Common:CancelButton")}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
});

export default StopFillingDialog;
