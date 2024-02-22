import { RectangleSkeletonProps } from "skeletons/rectangle";

export interface TilesSkeletonProps extends RectangleSkeletonProps {
  foldersCount?: number;
  filesCount?: number;
  withTitle?: boolean;
}

export interface StyledBottomProps {
  isFolder?: boolean;
}

export interface TileSkeletonProps extends RectangleSkeletonProps {
  isFolder?: boolean;
}
