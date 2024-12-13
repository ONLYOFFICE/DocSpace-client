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

import { ButtonKeys } from "../../enums";
import { isDesktop, isMobile } from "../../utils";

import { Button, ButtonSize } from "../button";
import { Text } from "../text";

import StyledSaveCancelButtons from "./SaveCancelButton.styled";
import { SaveCancelButtonProps } from "./SaveCancelButton.types";

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

  const classNameSave = additionalClassSaveButton
    ? `save-button ${additionalClassSaveButton}`
    : `save-button`;

  const classNameCancel = additionalClassCancelButton
    ? `cancel-button ${additionalClassCancelButton}`
    : `cancel-button`;

  const buttonSize = isDesktop() ? ButtonSize.small : ButtonSize.normal;

  return (
    <StyledSaveCancelButtons
      className={className}
      id={id}
      displaySettings={displaySettings}
      showReminder={showReminder}
      hasScroll={hasScroll}
      hideBorder={hideBorder}
      data-testid="save-cancel-buttons"
    >
      {getTopComponent?.()}
      <div className="buttons-flex">
        <Button
          testId="save-button"
          tabIndex={tabIndexSaveButton}
          className={classNameSave}
          size={buttonSize}
          isDisabled={saveButtonDisabled || showReminder === false}
          primary
          onClick={onSaveClick}
          label={saveButtonLabel}
          minWidth={displaySettings ? "auto" : ""}
          isLoading={isSaving}
          scale={isMobile()}
        />
        <Button
          testId="cancel-button"
          tabIndex={tabIndexCancelButton}
          className={classNameCancel}
          size={buttonSize}
          isDisabled={cancelButtonDisabled || isSaving}
          onClick={onCancelClick}
          label={cancelButtonLabel}
          minWidth={displaySettings ? "auto" : ""}
          scale={isMobile()}
        />
      </div>
      {showReminder && reminderText && (
        <Text className="unsaved-changes">{reminderText}</Text>
      )}
    </StyledSaveCancelButtons>
  );
};

export { SaveCancelButtons };
