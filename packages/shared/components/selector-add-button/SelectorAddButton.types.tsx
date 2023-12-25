export interface SelectorAddButtonProps {
  /** Title text */
  title?: string;
  /** Sets a callback function that is triggered when the button is clicked */
  onClick?: (e: React.MouseEvent) => void;
  /** Sets the button to present a disabled state */
  isDisabled?: boolean;
  /** Attribute className  */
  className?: string;
  /** Accepts id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Specifies the icon name */
  iconName?: string;
}
