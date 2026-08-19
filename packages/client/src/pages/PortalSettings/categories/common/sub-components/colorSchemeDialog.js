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

import PlusThemeSvgUrl from "PUBLIC_DIR/images/plus.theme.svg?url";
import { useEffect } from "react";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button } from "@docspace/ui-kit/components/button";
import { withTranslation } from "react-i18next";
import styles from "./colorSchemeDialog.module.scss";

const ColorSchemeDialog = (props) => {
  const {
    visible,
    onClose,
    header,
    nodeHexColorPickerAccent,
    nodeHexColorPickerButtons,
    viewMobile,
    showSaveButtonDialog,
    onSaveColorSchemeDialog,
    t,
    onClickColor,
    currentColorAccent,
    currentColorButtons,
  } = props;

  const accentBg = currentColorAccent
    ? currentColorAccent
    : `var(--settings-appearance-theme-add-bg) url(${PlusThemeSvgUrl}) no-repeat center`;

  const buttonsBg = currentColorButtons
    ? currentColorButtons
    : `var(--settings-appearance-theme-add-bg) url(${PlusThemeSvgUrl}) no-repeat center`;

  const onKeyPress = (e) =>
    (e.key === "Esc" || e.key === "Escape") && onClose();

  useEffect(() => {
    window.addEventListener("keyup", onKeyPress);
    return () => window.removeEventListener("keyup", onKeyPress);
  }, [onClose]);

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType="aside"
      withFooterBorder={showSaveButtonDialog}
      withBodyScroll
    >
      <ModalDialog.Header>{header}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={`${styles.bodyContent} new-colors-container`}>
          <div className={`${styles.flex} ${styles.relative}`}>
            <div className={styles.nameColor}>{t("Settings:AccentColor")}</div>
            <div
              id="accent"
              className={styles.modalAddTheme}
              style={{ background: accentBg }}
              data-testid="color_scheme_dialog_accent"
              onClick={onClickColor}
            />

            {!viewMobile ? nodeHexColorPickerAccent : null}
          </div>

          <div className={`${styles.flex} ${styles.relative}`}>
            <div className={styles.nameColor}>
              {t("Settings:ButtonsColor")}
            </div>
            <div
              id="buttons"
              className={styles.modalAddTheme}
              style={{ background: buttonsBg }}
              data-testid="color_scheme_dialog_buttons"
              onClick={onClickColor}
            />

            {!viewMobile ? nodeHexColorPickerButtons : null}
          </div>
        </div>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button
          className="save"
          label={t("Common:SaveButton")}
          size="normal"
          primary
          scale
          onClick={onSaveColorSchemeDialog}
          isDisabled={!showSaveButtonDialog}
          testId="color_scheme_dialog_save"
        />
        <Button
          className="cancel-button"
          label={t("Common:CancelButton")}
          size="normal"
          scale
          onClick={onClose}
          testId="color_scheme_dialog_cancel"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default withTranslation(["Common", "Settings"])(ColorSchemeDialog);
