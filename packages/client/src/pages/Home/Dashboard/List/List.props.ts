import { IRole } from "@docspace/common/Models";
import { ThemeType } from "../types";

interface ListProps {
  roles: IRole[];
  sectionWidth: number;
}

export default ListProps;

export interface ListRowProps {
  sectionWidth: number;
  role: IRole;
  theme?: ThemeType;
}
