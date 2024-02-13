import React from "react";

import { InputSize } from "../text-input";

export interface FileInputProps {
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Supported size of the input fields */
  size: InputSize;
  /** Indicates that the input field has scale */
  scale?: boolean;
  /** Accepts class */
  className?: string;
  /** Indicates that the input field has an error */
  hasError?: boolean;
  /** Indicates that the input field has a warning */
  hasWarning?: boolean;
  /** Used as HTML `id` property */
  id?: string;
  /** Indicates that the field cannot be used (e.g not authorised, or changes not saved) */
  isDisabled?: boolean;
  /** Tells when the button should show loader icon */
  isLoading?: boolean;
  /** Used as HTML `name` property */
  name?: string;
  /** Called when a file is selected */
  onInput: (file: File | File[]) => void;
  /** Specifies the files visible for upload */
  accept?: string[];
  /** Specifies the label for the upload button */
  buttonLabel?: string;
  onClick?: (e: React.MouseEvent) => void;
  idButton?: string;
  path?: string;
  fromStorage?: boolean;
}
