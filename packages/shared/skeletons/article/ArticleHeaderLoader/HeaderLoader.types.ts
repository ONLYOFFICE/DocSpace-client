import { RectangleSkeletonProps } from "../../rectangle";

export interface HeaderLoaderProps extends RectangleSkeletonProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  showText: boolean;
}
