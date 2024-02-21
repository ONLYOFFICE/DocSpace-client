import type { RectangleSkeletonProps } from "../rectangle";

export interface ListItemLoaderProps extends RectangleSkeletonProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  withoutFirstRectangle?: boolean;
  withoutLastRectangle?: boolean;
}

export interface ListLoaderProps extends ListItemLoaderProps {
  count: number;
}
