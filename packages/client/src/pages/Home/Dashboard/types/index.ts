import store from "src/store";
import { Base, Dark } from "@docspace/components/themes";
import { IRole } from "@docspace/common/Models";
import { ContextMenuModel } from "@docspace/components/types";

export type ContextType = {
  sectionWidth: number;
  sectionHeight: number;
};

export type ThemeType = typeof Base | typeof Dark;

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

export type GetModelFunctionType = (
  role: IRole,
  t: (arg: string) => string
) => ContextMenuModel[];

export type ParamType = {
  boardId: string;
  roleId: string;
  roomId: string;
};
