import React from "react";

export interface CheckboxProps {
  /** Used as HTML id property */
  id?: string;
  /** Used as HTML `name` property */
  name?: string;
  /** Value of the input */
  value?: string;
  /** Label of the input */
  label?: string;
  /** Sets the checked state of the checkbox */
  isChecked?: boolean;
  /** The state is displayed as a rectangle in the checkbox when set to true */
  isIndeterminate?: boolean;
  /** Disables the Checkbox input */
  isDisabled?: boolean;
  /** Is triggered whenever the CheckboxInput is clicked */
  onChange?: () => void;
  /** Accepts class */
  className?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Title */
  title?: string;
  /** Disables word wrapping */
  truncate?: boolean;
  /** Renders the help button */
  helpButton?: React.ReactNode;
  /** Checkbox tab index */
  tabIndex?: number;
  /** Notifies if the error occurs */
  hasError?: boolean;
}
