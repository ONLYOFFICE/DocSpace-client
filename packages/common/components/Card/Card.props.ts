import { ChangeEvent } from "react";
import type { ContextMenuModel } from "@docspace/components/types";

interface CardProps {
  username: string;
  filename: string;
  isSelected?: boolean;
  avatarUrl?: string;
  isLoading?: boolean;

  isForMe?: boolean;

  getOptions?: () => ContextMenuModel[];
  onSelected?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default CardProps;

export type CardContainerProps = {
  isSelected?: boolean;
  isForMe?: boolean;
};
