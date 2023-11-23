export type Item = {
  key?: string;
  id?: number | string;
  label: string;
  avatar?: string;
  icon?: string;
  role?: string;
  isSelected?: boolean;
  email?: string;
  isDisabled?: boolean;
  color?: string;
  fileExst?: string;
};

export type Data = {
  items: Item[];
  onSelect: (item: Item) => void;
  isMultiSelect: boolean;
  isItemLoaded: (index: number) => boolean;
  rowLoader: any;
  titleIconTooltip?: string;
};

export type ItemProps = {
  index: number;
  style: object;
  data: Data;
};
