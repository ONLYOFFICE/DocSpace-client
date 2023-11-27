import React from "react";

import PropTypes from "prop-types";
import Button from "../button";
import Text from "../text";
import StyledSaveCancelButtons from "./styled-save-cancel-buttons";
import { isDesktop, isMobile } from "../utils/device";

const ButtonKeys = Object.freeze({
  enter: 13,
  esc: 27,
});

class SaveCancelButtons extends React.Component {
  componentDidMount() {
    document.addEventListener("keydown", this.onKeydown, false);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.onKeydown, false);
  }

  onKeydown = (e: any) => {
    // @ts-expect-error TS(2339): Property 'onSaveClick' does not exist on type 'Rea... Remove this comment to see the full error message
    const { onSaveClick, onCancelClick, displaySettings } = this.props;

    if (displaySettings) return;

    switch (e.keyCode) {
      case ButtonKeys.enter:
        onSaveClick();
        break;
      case ButtonKeys.esc:
        onCancelClick();
        break;
      default:
        break;
    }
  };

  render() {
    const {
      // @ts-expect-error TS(2339): Property 'onSaveClick' does not exist on type 'Rea... Remove this comment to see the full error message
      onSaveClick,
      // @ts-expect-error TS(2339): Property 'onCancelClick' does not exist on type 'R... Remove this comment to see the full error message
      onCancelClick,
      // @ts-expect-error TS(2339): Property 'displaySettings' does not exist on type ... Remove this comment to see the full error message
      displaySettings,
      // @ts-expect-error TS(2339): Property 'showReminder' does not exist on type 'Re... Remove this comment to see the full error message
      showReminder,
      // @ts-expect-error TS(2339): Property 'reminderText' does not exist on type 'Re... Remove this comment to see the full error message
      reminderText,
      // @ts-expect-error TS(2339): Property 'saveButtonLabel' does not exist on type ... Remove this comment to see the full error message
      saveButtonLabel,
      // @ts-expect-error TS(2339): Property 'cancelButtonLabel' does not exist on typ... Remove this comment to see the full error message
      cancelButtonLabel,
      // @ts-expect-error TS(2339): Property 'hasScroll' does not exist on type 'Reado... Remove this comment to see the full error message
      hasScroll,
      // @ts-expect-error TS(2339): Property 'disableRestoreToDefault' does not exist ... Remove this comment to see the full error message
      disableRestoreToDefault,
      // @ts-expect-error TS(2339): Property 'className' does not exist on type 'Reado... Remove this comment to see the full error message
      className,
      // @ts-expect-error TS(2339): Property 'id' does not exist on type 'Readonly<{}>... Remove this comment to see the full error message
      id,
      // @ts-expect-error TS(2339): Property 'isSaving' does not exist on type 'Readon... Remove this comment to see the full error message
      isSaving,
      // @ts-expect-error TS(2339): Property 'cancelEnable' does not exist on type 'Re... Remove this comment to see the full error message
      cancelEnable,
      // @ts-expect-error TS(2339): Property 'tabIndex' does not exist on type 'Readon... Remove this comment to see the full error message
      tabIndex,
      // @ts-expect-error TS(2339): Property 'saveButtonDisabled' does not exist on ty... Remove this comment to see the full error message
      saveButtonDisabled,
      // @ts-expect-error TS(2339): Property 'additionalClassSaveButton' does not exis... Remove this comment to see the full error message
      additionalClassSaveButton,
      // @ts-expect-error TS(2339): Property 'additionalClassCancelButton' does not ex... Remove this comment to see the full error message
      additionalClassCancelButton,
      // @ts-expect-error TS(2339): Property 'hideBorder' does not exist on type 'Read... Remove this comment to see the full error message
      hideBorder,
    } = this.props;

    const cancelButtonDisabled = cancelEnable
      ? false
      : typeof disableRestoreToDefault === "boolean"
      ? disableRestoreToDefault
      : !showReminder;

    const tabIndexSaveButton = tabIndex ? tabIndex : -1;
    const tabIndexCancelButton = tabIndex ? tabIndex + 1 : -1;

    const classNameSave = additionalClassSaveButton
      ? `save-button ` + additionalClassSaveButton
      : `save-button`;

    const classNameCancel = additionalClassCancelButton
      ? `cancel-button ` + additionalClassCancelButton
      : `cancel-button`;

    const buttonSize = isDesktop() ? "small" : "normal";

    return (
      <StyledSaveCancelButtons
        className={className}
        id={id}
        // @ts-expect-error TS(2769): No overload matches this call.
        displaySettings={displaySettings}
        showReminder={showReminder}
        hasScroll={hasScroll}
        hideBorder={hideBorder}
      >
        <div className="buttons-flex">
          <Button
            // @ts-expect-error TS(2322): Type '{ tabIndex: any; className: string; size: st... Remove this comment to see the full error message
            tabIndex={tabIndexSaveButton}
            className={classNameSave}
            size={buttonSize}
            isDisabled={!showReminder || saveButtonDisabled}
            primary
            onClick={onSaveClick}
            label={saveButtonLabel}
            minwidth={displaySettings && "auto"}
            isLoading={isSaving}
            scale={isMobile()}
          />
          <Button
            // @ts-expect-error TS(2322): Type '{ tabIndex: any; className: string; size: st... Remove this comment to see the full error message
            tabIndex={tabIndexCancelButton}
            className={classNameCancel}
            size={buttonSize}
            isDisabled={cancelButtonDisabled || isSaving}
            onClick={onCancelClick}
            label={cancelButtonLabel}
            minwidth={displaySettings && "auto"}
            scale={isMobile()}
          />
        </div>
        {showReminder && reminderText && (
          // @ts-expect-error TS(2322): Type '{ children: any; className: string; }' is no... Remove this comment to see the full error message
          <Text className="unsaved-changes">{reminderText}</Text>
        )}
      </StyledSaveCancelButtons>
    );
  }
}

// @ts-expect-error TS(2339): Property 'propTypes' does not exist on type 'typeo... Remove this comment to see the full error message
SaveCancelButtons.propTypes = {
  /** Accepts css id */
  id: PropTypes.string,
  /** Accepts css class */
  className: PropTypes.string,
  /** Message text that notifies of the unsaved changes */
  reminderText: PropTypes.string,
  /** Save button label */
  saveButtonLabel: PropTypes.string,
  /** Cancel button label  */
  cancelButtonLabel: PropTypes.string,
  /** Sets a callback function that is triggered when the save button is clicked */
  onSaveClick: PropTypes.func,
  /** Sets a callback function that is triggered when the cancel button is clicked */
  onCancelClick: PropTypes.func,
  /** Reminder message that notifies of the unsaved changes (Only shown on desktops) */
  showReminder: PropTypes.bool,
  /** Sets save and cancel buttons block to 'position: static' instead of absolute */
  displaySettings: PropTypes.bool,
  /** Displays the scrollbar */
  hasScroll: PropTypes.bool,
  /** Sets the min width of the button */
  minwidth: PropTypes.string,
  /** Sets the Cancel button disabled by default */
  disableRestoreToDefault: PropTypes.bool,
  /** Sets the button to present a disabled state while executing an operation after clicking the save button */
  isSaving: PropTypes.bool,
  /** Activates the disabled button */
  cancelEnable: PropTypes.bool,
  /** Accepts css tab-index */
  tabIndex: PropTypes.number,
  /** Hide top border */
  hideBorder: PropTypes.bool,
};

// @ts-expect-error TS(2339): Property 'defaultProps' does not exist on type 'ty... Remove this comment to see the full error message
SaveCancelButtons.defaultProps = {
  saveButtonLabel: "Save",
  cancelButtonLabel: "Cancel",
};

export default SaveCancelButtons;
