import { ChangeEvent } from "react";

export type ContextMenuType = {
  id?: string;
  key: string;
  label: string;
  icon: string;
  disabled: boolean;
  onClick: VoidFunction;
  isSeparator?: undefined;
};

export type SeparatorType = {
  key: string;
  isSeparator: boolean;
  disabled: boolean;
};

export type ContextMenuModel = ContextMenuType | SeparatorType;

interface CardProps {
  userName: string;
  fileName: string;
  isSelected: boolean;
  avatarUrl?: string;
  isLoading?: boolean;

  isForMe: boolean;

  getOptions: () => (ContextMenuType | SeparatorType)[];
  onSelected: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default CardProps;

export type CardContainerProps = {
  isSelected?: boolean;
  isForMe?: boolean;
};
