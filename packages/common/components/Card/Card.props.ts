import type { ContextMenuModel } from "@docspace/components/types";
import type { IFileByRole } from "@docspace/common/Models";

interface CardProps {
  file: IFileByRole;
  isLoading?: boolean;
  isForMe?: boolean;

  getOptions?: () => ContextMenuModel[];
  onSelected?: (file: IFileByRole, checked: boolean) => void;
}

export default CardProps;

export type CardContainerProps = {
  isSelected?: boolean;
  isForMe?: boolean;
};
