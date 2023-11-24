export interface IconButtonProps {
  /** Sets component class */
  className?: string;
  /** Icon color */
  color?: string;
  /** Icon color on hover action */
  hoverColor?: string;
  /** Icon color on click action */
  clickColor?: string;
  /** Button height and width value */
  size: number;
  /** Determines if icon fill is needed */
  isFill?: boolean;
  /** Determines if icon stroke is needed */
  isStroke?: boolean;
  /** Sets the button to present a disabled state */
  isDisabled?: boolean;
  /** Sets cursor value */
  isClickable?: boolean;
  /** Icon node */
  iconNode?: React.ReactNode;
  /** Icon name */
  iconName: string;
  /** Icon name on hover action */
  iconHoverName?: string;
  /** Icon name on click action */
  iconClickName?: string;
  /** Sets a button callback function triggered when the button is clicked */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Sets a button callback function triggered when the cursor enters the area */
  onMouseEnter?: (e: React.MouseEvent) => void;
  /** Sets a button callback function triggered when the cursor moves down */
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Sets a button callback function triggered when the cursor moves up */
  onMouseUp?: (e: React.MouseEvent<HTMLDivElement>) => void;
  /** Sets a button callback function triggered when the cursor leaves the icon */
  onMouseLeave?: (e: React.MouseEvent) => void;
  /** Sets component id */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** The data-* attribute is used to store custom data private to the page or application. Required to display a tip over the hovered element */
  dataTip?: string;
  /** Data when user hover on icon */
  title?: string;
}
