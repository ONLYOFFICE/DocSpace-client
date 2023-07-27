import { IRole } from "@docspace/common/Models";
import { GetModelFunctionType } from "./types";

interface DashboardProps {
  viewAs: string;
  userID: string;
  setViewAs: (viewAs: string) => void;
  roles: IRole[];
  clearSelectedRoleMap: VoidFunction;
  clearBufferSelectionRole: VoidFunction;
  clearSelectedFileByRoleMap: VoidFunction;
  clearBufferSelectionFilesByRole: VoidFunction;
  getModel: GetModelFunctionType;
}

export default DashboardProps;
