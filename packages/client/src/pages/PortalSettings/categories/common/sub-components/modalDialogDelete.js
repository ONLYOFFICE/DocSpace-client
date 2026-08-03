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

import { useEffect } from "react";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button } from "@docspace/ui-kit/components/button";
import { withTranslation } from "react-i18next";

import styles from "./modalDialogDelete.module.scss";

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
        <div className={styles.footerContent}>
          <Button
            className={`delete ${styles.buttonModal}`}
            label={t("Common:Delete")}
            onClick={onClickDelete}
            primary
            size="normal"
            testId="portal_settings_modal_dialog_delete_button"
          />
          <Button
            className={`cancel-button ${styles.buttonModal}`}
            label={t("Common:CancelButton")}
            size="normal"
            onClick={onClose}
            testId="portal_settings_modal_dialog_cancel_button"
          />
        </div>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default withTranslation(["Common", "Settings"])(ModalDialogDelete);
