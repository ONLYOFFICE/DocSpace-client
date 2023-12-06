import { HeadingLevel, HeadingSize } from "./Heading.enums";

export interface HeadingProps {
  /** The heading level. It corresponds to the number after the 'H' for the DOM tag. Sets the level for semantic accuracy and accessibility. */
  level: HeadingLevel;
  /** Specifies the headline color */
  color?: string;
  /** Title */
  title?: string;
  /** Disables word wrapping */
  truncate?: boolean;
  /** Sets the 'display: inline-block' property */
  isInline?: boolean;
  /** Sets the size of headline */
  size: HeadingSize;
  /** Accepts css class */
  className?: string;
  children: React.ReactNode;
}
