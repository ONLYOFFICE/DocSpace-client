export type EmptyViewItemType = {
  key: React.Key;
  title: string;
  description: string;
  icon: React.ReactElement;
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  disabled?: boolean;
  model?: ContextMenuModel[];
};

export interface EmptyViewItemProps extends Omit<EmptyViewItemType, "key"> {}

export interface EmptyViewProps
  extends Omit<EmptyViewItemType, "key" | "onClick" | "disabled"> {
  options: EmptyViewItemType[];
}
