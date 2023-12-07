import { Mask } from "react-text-mask";
import { InputSize, InputType } from "../text-input";

export interface InputBlockProps {
  /** Used as HTML `id` property */
  id?: string;
  /** Forwarded ref */
  forwardedRef?: React.Ref<HTMLInputElement>;
  /** Used as HTML `name` property */
  name?: string;
  /** Supported type of the input fields.  */
  type: InputType.text | InputType.password;
  /** Defines max length of value */
  maxLength?: number;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Accepts css tab-index */
  tabIndex?: number;
  /** input text mask */
  mask?: Mask | ((value: string) => Mask);
  /** Allows to add or delete characters without changing the positions of the existing characters. */
  keepCharPositions?: boolean;
  /** Supported size of the input fields. */
  size: InputSize;
  /** Indicates that the input field has scale */
  scale?: boolean;
  /** The callback function that is required when the input is not read only. The function is called with the new value. Parent should pass it back as `value` */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** The callback function that is called when the field is blurred  */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** The callback function that is called when the field is focused  */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClick?: (e: React.MouseEvent<HTMLInputElement>) => void;
  /** Focuses on the input field on initial render */
  isAutoFocussed?: boolean;
  /** Indicates that the field cannot be used (e.g not authorised, or changes not saved) */
  isDisabled?: boolean;
  /** Indicates that the field is displaying read-only content  */
  isReadOnly?: boolean;
  /** Indicates the input field has an error */
  hasError?: boolean;
  /** Indicates the input field has a warning */
  hasWarning?: boolean;
  /** Used as HTML `autocomplete` */
  autoComplete?: string;
  /** Value of the input */
  value: string;
  /** Path to icon */
  iconName?: string;
  /** Specifies the icon color  */
  iconColor?: string;
  /** Icon color on hover action */
  hoverColor?: string;
  /** Size icon */
  iconSize?: number;
  /** Determines if icon fill is needed */
  isIconFill?: boolean;
  /** The callback function that is triggered when the icon is clicked */
  onIconClick?: (e: React.MouseEvent) => void;

  children?: React.ReactNode;
  /** Accepts class */
  className?: string;
  /** Accepts css style  */
  style?: React.CSSProperties;
  /** Sets the classNaame of the icon button */
  iconButtonClassName?: string;
  iconNode?: React.ReactNode;
}
