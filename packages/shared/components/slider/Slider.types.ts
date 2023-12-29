import { TColorScheme } from "themes";

export interface SliderProps {
  /** Accepts id */
  id?: string;

  /** Accepts class */
  className?: string;
  /** Sets the width of the input thumb */
  thumbWidth?: string;
  /** Sets the height of the input thumb */
  thumbHeight?: string;
  /** Sets the border width of the input thumb */
  thumbBorderWidth?: string;
  /** Sets the height of the runnableTrack for the input */
  runnableTrackHeight?: string;
  /** The change event is triggered when the elelment's value is modified */
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Determines min range value */
  min: number;
  /** Determines max range value */
  max: number;
  /** Specifies the increment/decrement step size */
  step?: number;
  /** Default input value */
  value: number;
  /** Sets the background color of the runnableTrack */
  withPouring?: boolean;
  /** Disables the input  */
  isDisabled?: boolean;
  /** Accepts css */
  style?: React.CSSProperties;
}

export interface SliderThemeProps extends SliderProps {
  $currentColorScheme?: TColorScheme;
  sizeProp?: string;
}
