import { RectangleSkeletonProps } from "../../rectangle";

export interface GroupsLoaderProps extends RectangleSkeletonProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  showText: boolean;
}
