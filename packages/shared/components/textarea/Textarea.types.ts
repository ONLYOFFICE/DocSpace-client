import { ChangeEvent } from "react";
import { TColorScheme } from "themes";

export interface TextareaProps {
  /** Class name */
  className?: string;
  /** Used as HTML `id` property  */
  id?: string;
  /** Indicates that the field cannot be used */
  isDisabled?: boolean;
  /** Indicates that the field is displaying read-only content */
  isReadOnly?: boolean;
  /** Indicates the input field has an error  */
  hasError?: boolean;
  /** Indicates the input field has scale */
  heightScale?: boolean;
  /** Max value length */
  maxLength?: number;
  /** Used as HTML `name` property  */
  name?: string;
  /** Sets a callback function that allows handling the component's changing events */
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  /** Placeholder for Textarea  */
  placeholder?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Used as HTML `tabindex` property */
  tabIndex?: number;
  /** Textarea value */
  value?: string;
  /** Font-size value */
  fontSize?: number;
  /** Text-area height value */
  heightTextArea?: number;
  /** Specifies the text color */
  color?: string;
  /** Default input property */
  autoFocus?: boolean;
  /** Allows selecting the textarea */
  areaSelect?: boolean;
  /** Prettifies Json and adds lines numeration */
  isJSONField?: boolean;
  /** Indicates the text of toast/informational alarm */
  copyInfoText?: string;
  /** Shows copy icon */
  enableCopy?: boolean;
  /** Inserts numeration */
  hasNumeration?: boolean;
  /** Calculating height of content depending on number of lines */
  isFullHeight?: boolean;
  classNameCopyIcon?: string;
  paddingLeftProp?: string;
}

export interface TextareaThemeProps extends TextareaProps {
  ref: React.LegacyRef<HTMLTextAreaElement>;
  $currentColorScheme?: TColorScheme;
  interfaceDirection?: string;
}
