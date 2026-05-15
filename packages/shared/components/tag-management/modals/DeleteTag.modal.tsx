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

import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";

import { DELETE_TAG_MODAL_ID } from "../TagManagement.constants";
import styles from "../TagManagement.module.scss";

interface DeleteTagModalProps {
  onClose: () => void;
  onSubmit: () => void;
  isChecked: boolean;
  onCheckboxChange: (checked: boolean) => void;
  tagName?: string;
  ref?: React.RefObject<HTMLDivElement | null>;
}

export const DeleteTagModal = ({
  onClose,
  onSubmit,
  isChecked,
  onCheckboxChange,
  // tagName,
  ref,
}: DeleteTagModalProps) => {
  const { t } = useTranslation(["ConvertDialog", "TagManagement", "Common"]);

  const onChangeCheckbox = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onCheckboxChange(e.target.checked);
    },
    [onCheckboxChange],
  );

  return (
    <ModalDialog
      visible
      ref={ref}
      autoMaxHeight
      onClose={onClose}
      id={DELETE_TAG_MODAL_ID}
      displayType={ModalDialogType.modal}
    >
      <ModalDialog.Header>{t("TagManagement:DeleteTag")}</ModalDialog.Header>
      <ModalDialog.Body>
        <Text className={styles.deleteTagModalText}>
          {t("TagManagement:DeleteTagConfirmation")}
        </Text>
        <Text className={styles.deleteTagModalText}>
          {t("TagManagement:DeleteTagCannotBeUndone")}
        </Text>
        <Checkbox
          key="dont-show-again"
          label={t("ConvertDialog:HideMessage")}
          isChecked={isChecked}
          onChange={onChangeCheckbox}
          dataTestId="delete_tag_checkbox"
        />
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          className="submit"
          label={t("Common:Delete")}
          size={ButtonSize.normal}
          type="submit"
          scale
          primary
          onClick={onSubmit}
          testId="delete_tag_submit_button"
        />
        <Button
          className="cancel-button"
          key="CloseBtn"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
          testId="delete_tag_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};
