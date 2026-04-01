// (c) Copyright Ascensio System SIA 2009-2026
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
