export interface SaveCancelButtonProps {
  /** Accepts css id */
  id?: string;
  /** Accepts css class */
  className?: string;
  /** Message text that notifies of the unsaved changes */
  reminderText?: string;
  /** Save button label */
  saveButtonLabel?: string;
  /** Cancel button label  */
  cancelButtonLabel?: string;
  /** Sets a callback function that is triggered when the save button is clicked */
  onSaveClick?: () => void;
  /** Sets a callback function that is triggered when the cancel button is clicked */
  onCancelClick?: () => void;
  /** Reminder message that notifies of the unsaved changes (Only shown on desktops) */
  showReminder?: boolean;
  /** Sets save and cancel buttons block to 'position: static' instead of absolute */
  displaySettings?: boolean;
  /** Displays the scrollbar */
  hasScroll?: boolean;
  /** Sets the min width of the button */
  minwidth?: string;
  /** Sets the Cancel button disabled by default */
  disableRestoreToDefault?: boolean;
  /** Sets the button to present a disabled state while executing an operation after clicking the save button */
  isSaving?: boolean;
  /** Activates the disabled button */
  cancelEnable?: boolean;
  /** Accepts css tab-index */
  tabIndex?: number;
  /** Hide top border */
  hideBorder?: boolean;
  additionalClassSaveButton?: string;
  additionalClassCancelButton?: string;
  saveButtonDisabled?: boolean;
}
