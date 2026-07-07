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

import { useEffect, useState } from "react";
import { inject, observer } from "mobx-react";
import { withTranslation } from "react-i18next";
import { ModalDialog } from "@docspace/ui-kit/components/modal-dialog";
import { Button } from "@docspace/ui-kit/components/button";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { Text } from "@docspace/ui-kit/components/text";
import styles from "./LifetimeDialog.module.scss";

const LifetimeDialogComponent = (props) => {
  const {
    t,
    setLifetimeDialogVisible,
    visible,
    tReady,
    lifetimeDialogCB,
    hideConfirmRoomLifetimeSetting,
  } = props;

  const [isChecked, setIsChecked] = useState(false);

  const onChange = () => {
    setIsChecked(!isChecked);
  };

  const onClose = () => {
    setLifetimeDialogVisible(false);
  };

  const onAcceptClick = () => {
    if (isChecked) {
      hideConfirmRoomLifetimeSetting(isChecked);
    }

    lifetimeDialogCB();
    onClose();
  };

  const onDeleteAction = () => {
    onAcceptClick();
  };

  const onKeyUp = (e) => {
    if (e.keyCode === 27) onClose();
    if (e.keyCode === 13 || e.which === 13) onDeleteAction();
  };

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp, false);

    return () => {
      document.removeEventListener("keyup", onKeyUp, false);
    };
  }, []);

  return (
    <ModalDialog
      isLoading={!tReady}
      visible={visible}
      onClose={onClose}
      autoMaxHeight
    >
      <ModalDialog.Header>{t("Common:Warning")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.lifetimeBodyContainer}>
          <Text fontWeight={600} fontSize="13px">
            {t("Files:LifetimeDialogDescriptionHeader")}
          </Text>
          <Text fontSize="13px">{t("Files:LifetimeDialogDescription")}</Text>
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <div className={styles.lifetimeFooterContainer}>
          <Checkbox
            className={styles.lifetimeCheckbox}
            label={t("Common:HideMessage")}
            isChecked={isChecked}
            onChange={onChange}
            dataTestId="lifetime_dialog_hide_message_checkbox"
          />
          <div className={styles.lifetimeButtons}>
            <Button
              id="delete-file-modal_submit"
              key="OKButton"
              label={t("Common:OKButton")}
              size="normal"
              primary
              scale
              onClick={onAcceptClick}
              testId="lifetime_dialog_ok_button"
            />
            <Button
              id="delete-file-modal_cancel"
              key="CancelButton"
              label={t("Common:CancelButton")}
              size="normal"
              scale
              onClick={onClose}
              testId="lifetime_dialog_cancel_button"
            />
          </div>
        </div>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

const LifetimeDialog = withTranslation(["Common", "Files", "ConvertDialog"])(
  LifetimeDialogComponent,
);

export default inject(({ dialogsStore, filesSettingsStore }) => {
  const {
    lifetimeDialogVisible: visible,
    setLifetimeDialogVisible,
    lifetimeDialogCB,
  } = dialogsStore;

  const { hideConfirmRoomLifetimeSetting } = filesSettingsStore;

  return {
    visible,
    setLifetimeDialogVisible,
    lifetimeDialogCB,
    hideConfirmRoomLifetimeSetting,
  };
})(observer(LifetimeDialog));
