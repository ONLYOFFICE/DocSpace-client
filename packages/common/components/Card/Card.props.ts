import type { ContextMenuModel } from "@docspace/components/types";
import type { IFileByRole } from "@docspace/common/Models";

interface CardProps {
  file: IFileByRole;
  isLoading?: boolean;
  isForMe?: boolean;

  getOptions: (
    file: IFileByRole,
    t: (arg: string) => string
  ) => ContextMenuModel[];
  onSelected?: (file: IFileByRole, checked: boolean) => void;
  setBufferSelectionFileByRole: (
    file: IFileByRole,
    checked: boolean,
    withSelection?: boolean
  ) => void;
}

export default CardProps;

export type CardContainerProps = {
  isSelected?: boolean;
  isForMe?: boolean;
  isActive?: boolean;
};
