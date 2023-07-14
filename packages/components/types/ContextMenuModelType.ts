export type ContextMenuType = {
  id?: string;
  key: string;
  label: string;
  icon: string;
  iconUrl?: string;
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
