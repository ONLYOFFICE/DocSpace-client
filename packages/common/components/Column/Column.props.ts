import type { IFileByRole, IRole } from "@docspace/common/Models";
import type { RoleType, RoleDefaultType } from "@docspace/common/types";
import { ContextMenuModel } from "@docspace/components/types";
import type { GetModelFunctionType } from "SRC_DIR/pages/Home/Dashboard/types";
import type FileByRoleStore from "SRC_DIR/store/FileByRoleStore";
import type { StoreType } from "SRC_DIR/types";

type DashboardStoreType = StoreType["dashboardStore"];

type ColumnPropsOwn = {
  getModel: GetModelFunctionType;

  filesByRole?: IFileByRole[];
  firstLoaded?: boolean;

  selectedFileByRole?: DashboardStoreType["selectedFileByRole"];
  fetchFilesByRole?: DashboardStoreType["fetchFilesByRole"];

  collectionFileByRoleStore?: Map<number, FileByRoleStore>;
  getModelFile?: (
    file: IFileByRole,
    t: (arg: string) => string
  ) => ContextMenuModel[];
  setBufferSelectionFileByRole?: (
    file: IFileByRole,
    checked: boolean,
    withSelection?: boolean
  ) => void;

  setBufferSelection?: (
    file: IRole,
    checked: boolean,
    withSelection?: boolean
  ) => void;
};

export type ColumnProps = ColumnPropsOwn & {
  role: RoleType;
};

export type ColumnDefaultProps = ColumnPropsOwn & {
  role: RoleDefaultType;
};

export type ColumnHeaderContentProps = {
  role: RoleType;
  getModel: GetModelFunctionType;
  setBufferSelection: (
    file: IRole,
    checked: boolean,
    withSelection?: boolean
  ) => void;
};

export type ColumnBodyContentProps = {
  filesByRole?: IFileByRole[];
  isLoading: boolean;
  onSelected: (file: IFileByRole, checked: boolean) => void;
  getOptions: (
    file: IFileByRole,
    t: (arg: string) => string
  ) => ContextMenuModel[];
  setBufferSelectionFileByRole: (
    file: IFileByRole,
    checked: boolean,
    withSelection?: boolean
  ) => void;
};

export type ListChildDataType = {
  files?: IFileByRole[];
};
