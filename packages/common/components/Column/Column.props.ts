import type { IFileByRole } from "@docspace/common/Models";
import type { RoleType, RoleDefaultType } from "@docspace/common/types";
import type { GetModelFunctionType } from "SRC_DIR/pages/Home/Dashboard/types";
import type FileByRoleStore from "SRC_DIR/store/FileByRoleStore";
import type { StoreType } from "SRC_DIR/types";

type DashboardStoreType = StoreType["dashboardStore"];

type ColumnPropsOwn = {
  getModel: GetModelFunctionType;

  filesByRole?: Map<number, Map<number, IFileByRole>>;
  selectedFileByRole?: DashboardStoreType["selectedFileByRole"];
  fetchFilesByRole?: DashboardStoreType["fetchFilesByRole"];
  selectedFilesByRoleMap?: Map<number, IFileByRole>;
  collectionFileByRoleStore?: Map<number, FileByRoleStore>;
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
};

export type ColumnBodyContentProps = {
  filesByRole?: IFileByRole[];
  isLoading: boolean;
  onSelected: (file: IFileByRole, checked: boolean) => void;
};

export type ListChildDataType = {
  files?: IFileByRole[];
};
