import React from "react";

import { InputSize } from "components/text-input";

export interface SearchInputProps {
  /** Used as HTML `id` property */
  id?: string;
  /** Forwarded ref */
  forwardedRef?: React.Ref<HTMLInputElement>;
  /** Sets the unique element name */
  name?: string;
  /** Accepts class */
  className?: string;
  /** Supported size of the input fields. */
  size: InputSize;
  /** Input value */
  value: string;
  /** Indicates that the input field has scale  */
  scale?: boolean;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Sets a callback function that allows handling the component's changing events */
  onChange?: (value: string) => void;
  /** Sets a callback function that is triggered when the clear icon of the search input is clicked */
  onClearSearch?: () => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  /** Indicates that the field cannot be used (e.g not authorized, or the changes have not been saved) */
  isDisabled?: boolean;
  /** Displays the Clear Button */
  showClearButton?: boolean;
  /** Sets the refresh timeout of the input  */
  refreshTimeout?: number;
  /** Sets the input to refresh automatically */
  autoRefresh?: boolean;
  /** Child elements */
  children?: React.ReactNode;
  /** Accepts css style */
  style?: React.CSSProperties;
}
