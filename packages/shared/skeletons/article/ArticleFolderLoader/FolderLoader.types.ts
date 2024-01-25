import { RectangleSkeletonProps } from "../../rectangle";

export interface FolderLoaderProps extends RectangleSkeletonProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  showText: boolean;
  isVisitor: boolean;
}
