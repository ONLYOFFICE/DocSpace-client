import {
  RoleType,
  RoleDoneType,
  RoleDefaultType,
  RoleInterruptedType,
} from "@docspace/common/types";
import { GetModelFunctionType } from "SRC_DIR/pages/Home/Dashboard/types";

export type ColumnProps = {
  role: RoleType;
  getModel: GetModelFunctionType;
};

export type ColumnDefaultProps = {
  role: RoleDefaultType;
  getModel: GetModelFunctionType;
  children?: React.ReactNode;
};
