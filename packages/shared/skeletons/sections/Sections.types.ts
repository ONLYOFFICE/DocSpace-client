import type { RectangleSkeletonProps } from "skeletons/rectangle";

export interface SectionHeaderSkeloton extends RectangleSkeletonProps {
  id?: string;
}

export interface SectionSubmenuSkeletonProps {
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}
