import { RectangleSkeletonProps } from "../../rectangle";

export interface FilterBlockProps extends RectangleSkeletonProps {
  id?: string;
  className?: string;
  isRooms?: boolean;
  isAccounts?: boolean;
}
