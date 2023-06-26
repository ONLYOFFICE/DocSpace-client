import store from "src/store";
import { Base, Dark } from "@docspace/components/themes";

export type ContextType = {
  sectionWidth: number;
  sectionHeight: number;
};

export type ThemeType = typeof Base | typeof Dark;

export type StoreType = typeof store;
export type IconSizeType = "small" | "medium";

export type TableColumnType = {
  key: string;
  title: any;
  resizable: boolean;
  enable: boolean;
  sortBy: string;
  default?: boolean;
  minWidth?: number;
  onChange?: (key: string) => void;
  onClick: (sortBy: any) => void;
  onIconClick?: () => void;
};

export type ParamType = {
  fileId: string;
  roleId: string;
};
