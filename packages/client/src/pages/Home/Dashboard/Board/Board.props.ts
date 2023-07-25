import { IRole } from "@docspace/common/Models";
import { GetModelFunctionType } from "../types";

interface BoardProps {
  roles: IRole[];
  sectionWidth: number;
  getModel: GetModelFunctionType;
  clearSelectedFileByRoleMap: VoidFunction;
}

export default BoardProps;

export interface BoardWrapperProps {
  sectionWidth: number;
}
