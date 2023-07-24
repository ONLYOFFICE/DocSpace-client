import type { RoleType, RoleDefaultType, File } from "@docspace/common/types";
import type { GetModelFunctionType } from "SRC_DIR/pages/Home/Dashboard/types";

type CulimnPropsOwn = {
  getModel: GetModelFunctionType;
  filesByRole?: Map<number, File[]>;
  fetchFilesByRole?: (roleId: number) => Promise<File[]>;
};

export type ColumnProps = CulimnPropsOwn & {
  role: RoleType;
};

export type ColumnDefaultProps = CulimnPropsOwn & {
  role: RoleDefaultType;
};

export type ColumnHeaderContentProps = {
  role: RoleType;
  getModel: GetModelFunctionType;
};

export type ColumnBodyContentProps = {
  filesByRole?: File[];
  isLoading: boolean;
};
