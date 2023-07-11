import { IRole } from "@docspace/common/Models";
import { GetModelFunctionType } from "../types";

interface BoardProps {
  roles: IRole[];
  getModel: GetModelFunctionType;
}

export default BoardProps;
