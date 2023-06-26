import { IRole } from "@docspace/common/Models";

interface DashboardProps {
  viewAs: string;
  setViewAs: (viewAs: string) => void;
  roles: IRole[];
}

export default DashboardProps;
