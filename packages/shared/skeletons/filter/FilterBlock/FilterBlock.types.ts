import { RectangleSkeletonProps } from "../../rectangle";

export interface FilterBlockProps extends RectangleSkeletonProps {
  id?: string;
  className?: string;
  isRooms?: boolean;
  isAccounts?: boolean;
  isPeopleAccounts?: boolean;
  isGroupsAccounts?: boolean;
  isInsideGroup?: boolean;
}
