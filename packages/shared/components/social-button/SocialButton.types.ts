export type IconOptions = {
  color: string;
};
export type SocialButtonSize = "base" | "small";

export interface StyledSocialButtonProps {
  /** Accepts id */
  id?: string;
  /** Accepts tabindex prop */
  tabIndex: number;

  noHover: boolean;
  /** Changes the button style if the user is connected to the social network account */
  isConnect: boolean;
  /** Accepts class */
  className?: string;
  /** Sets the button to present a disabled state */
  isDisabled: boolean;
  /** Sets the image size. Contains the small and the basic size options */
  size: SocialButtonSize;
  /** Accepts the icon options  */
  $iconOptions?: IconOptions;
  /** Accepts css style */
  style?: React.CSSProperties;
  /** Sets a callback function that is triggered when the button is clicked */
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export interface SocialButtonProps extends Partial<StyledSocialButtonProps> {
  /** Button text */
  label?: string;
  /** Button icon */
  iconName?: string;

  IconComponent?: JSX.ElementType;
}
