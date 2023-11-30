import { LoaderTypes } from "./Loader.enums";

export interface LoaderProps {
  /** Font color */
  color: string;
  /** Type loader */
  type?: LoaderTypes;
  /** Font size  */
  size?: string;
  /** Text label */
  label?: string;
  /** Class name */
  className?: string;
  /** Accepts id  */
  id?: string;
  /** Accepts css style */
  style?: React.CSSProperties;
}
