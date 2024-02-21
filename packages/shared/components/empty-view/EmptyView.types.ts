export type EmptyViewItemType = {
  key: React.Key;
  title: string;
  descriptions: string;
  icon: React.ReactElement;
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
};

export interface EmptyViewItemProps extends Omit<EmptyViewItemType, "key"> {}

export interface EmptyViewProps
  extends Omit<EmptyViewItemType, "key" | "onClick"> {
  options: EmptyViewItemType[];
}
