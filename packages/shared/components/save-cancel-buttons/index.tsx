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
import classNames from "classnames";
import { ButtonKeys } from "../../enums";
import { isMobile } from "../../utils";
import { Button } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";
import { SaveCancelButtonProps } from "./SaveCancelButton.types";
import styles from "./SaveCancelButtons.module.scss";

const SaveCancelButtons = ({
  id,
  className,
  reminderText,
  saveButtonLabel = "Save",
  cancelButtonLabel = "Cancel",
  onCancelClick,
  onSaveClick,
  showReminder,
  displaySettings,
  disableRestoreToDefault,
  hasScroll,
  isSaving,
  cancelEnable,
  tabIndex,
  hideBorder,
  additionalClassSaveButton,
  additionalClassCancelButton,
  saveButtonDisabled,
  saveButtonDataTestId,
  cancelButtonDataTestId,
  getTopComponent,
}: SaveCancelButtonProps) => {
  const onKeydown = React.useCallback(
    (e: KeyboardEvent) => {
      if (displaySettings) return;

      switch (e.key) {
        case ButtonKeys.enter:
          onSaveClick?.();
          break;
        case ButtonKeys.esc:
          onCancelClick?.();
          break;
        default:
          break;
      }
    },
    [displaySettings, onCancelClick, onSaveClick],
  );

  React.useEffect(() => {
    document.addEventListener("keydown", onKeydown, false);
    return () => {
      document.removeEventListener("keydown", onKeydown, false);
    };
  }, [onKeydown]);

  const cancelButtonDisabled = cancelEnable
    ? false
    : typeof disableRestoreToDefault === "boolean"
      ? disableRestoreToDefault
      : !showReminder;

  const tabIndexSaveButton = tabIndex || -1;
  const tabIndexCancelButton = tabIndex ? tabIndex + 1 : -1;

  const classNameSave = classNames(
    styles.button,
    "save-button",
    additionalClassSaveButton,
  );
  const classNameCancel = classNames(
    styles.button,
    "cancel-button",
    additionalClassCancelButton,
  );

  const containerClassName = classNames(
    styles.saveCancelButtons,
    {
      [styles.displaySettings]: displaySettings,
      [styles.showReminder]: showReminder,
      [styles.hasScroll]: hasScroll,
      [styles.hideBorder]: hideBorder,
    },
    className,
  );

  return (
    <div
      id={id}
      className={containerClassName}
      data-testid="save-cancel-buttons"
      role="group"
      aria-label="Save or cancel changes"
    >
      {getTopComponent?.()}
      <div className={styles.buttonsContainer}>
        <Button
          className={classNameSave}
          primary
          label={saveButtonLabel}
          onClick={onSaveClick}
          tabIndex={tabIndexSaveButton}
          isLoading={isSaving}
          isDisabled={saveButtonDisabled || showReminder === false}
          testId={saveButtonDataTestId ?? "save-button"}
          aria-label={`${saveButtonLabel} changes`}
          minWidth={displaySettings ? "auto" : ""}
          scale={isMobile()}
        />
        <Button
          className={classNameCancel}
          label={cancelButtonLabel}
          onClick={onCancelClick}
          tabIndex={tabIndexCancelButton}
          isDisabled={cancelButtonDisabled || isSaving}
          testId={cancelButtonDataTestId ?? "cancel-button"}
          aria-label={`${cancelButtonLabel} changes`}
          minWidth={displaySettings ? "auto" : ""}
          scale={isMobile()}
        />
      </div>
      {showReminder && reminderText ? (
        <Text
          className={styles.reminderText}
          data-testid="save-cancel-reminder"
          aria-live="polite"
        >
          {reminderText}
        </Text>
      ) : null}
    </div>
  );
};

export { SaveCancelButtons };
