import { IRole } from "@docspace/common/Models";
import { GetModelFunctionType, ThemeType } from "../types";

interface ListProps {
  roles: IRole[];
  sectionWidth: number;
  getModel: GetModelFunctionType;
}

export default ListProps;

export interface ListRowProps {
  role: IRole;
  sectionWidth: number;
  theme?: ThemeType;
  getModel: GetModelFunctionType;
}
