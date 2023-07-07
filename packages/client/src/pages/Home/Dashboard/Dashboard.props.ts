import { IRole } from "@docspace/common/Models";

interface DashboardProps {
  viewAs: string;
  userID: string;
  setViewAs: (viewAs: string) => void;
  roles: IRole[];
  clearSelectedRoleMap: VoidFunction;
  clearBufferSelectionRole: VoidFunction;
}

export default DashboardProps;
