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
      <div className="buttons-flex">
        <Button
          tabIndex={tabIndexSaveButton}
          className={classNameSave}
          size={buttonSize}
          isDisabled={!showReminder || saveButtonDisabled}
          primary
          onClick={onSaveClick}
          label={saveButtonLabel}
          minWidth={displaySettings ? "auto" : ""}
          isLoading={isSaving}
          scale={isMobile()}
        />
        <Button
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
