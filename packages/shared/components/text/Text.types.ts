export interface TextProps {
  /** Sets the tag through which the component is rendered */
  as?: React.ElementType;
  /** Accepts the tag id */
  tag?: string;
  /** Sets background color */
  backgroundColor?: string;
  /** Specifies the text color */
  color?: string;
  /** Sets the 'display' property */
  display?: string;
  /** Sets the font size */
  fontSize?: string;
  /** Sets the font weight */
  fontWeight?: number | string;
  /** Sets font weight value to bold */
  isBold?: boolean;
  /** Sets the 'display?: inline-block' property */
  isInline?: boolean;
  /** Sets the font style */
  isItalic?: boolean;
  /** Sets the line height */
  lineHeight?: string;
  /** Disables text selection */
  noSelect?: boolean;
  /** Sets the 'text-align' property */
  textAlign?: string;
  /** Title */
  title?: string;
  /** Sets the class name */
  className?: string;
  /** Disables word wrapping */
  truncate?: boolean;

  children?: React.ReactNode;
}

export interface StyledTextProps {
  fontSizeProp?: string;
  fontWeightProp?: string;
  colorProp?: string;
  textAlign?: string;
}
