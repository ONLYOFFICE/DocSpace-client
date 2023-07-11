import { IRole } from "@docspace/common/Models";
import { GetModelFunctionType } from "../types";

interface TableProps {
  roles: IRole[];
  sectionWidth: number;
  userID: string;
  getModel: GetModelFunctionType;
}

export default TableProps;

export type TableRowProps = {
  role: IRole;
  getModel: GetModelFunctionType;
};
