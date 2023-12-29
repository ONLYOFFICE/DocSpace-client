import React from "react";

export interface LabelProps {
  /** Indicates that the field to which the label is attached is required to fill */
  isRequired?: boolean;
  /** Indicates that the field to which the label is attached is incorrect */
  error?: boolean;
  /** Sets the 'display: inline-block' property */
  isInline?: boolean;
  /** Title */
  title?: string;
  /** Disables word wrapping */
  truncate?: boolean;
  /** The field ID to which the label is attached */
  htmlFor: string;
  /** Text or element */
  text?: string | React.ReactNode;
  /** Sets the 'display' property */
  display?: string;
  /** Class name */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  children?: React.ReactNode;
  tooltipMaxWidth?: string;
}
