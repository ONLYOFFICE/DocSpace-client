import type { IconSizeType } from "../types";
import type {} from "@docspace/common/Models";
import { RoleTypeEnum } from "@docspace/common/types";

export type IconProps = {
  size: IconSizeType;
  type: RoleTypeEnum;
  color?: string;
};

export interface IconDefaultProps extends IconProps {
  color: string;
  type: RoleTypeEnum.Default;
}
export interface IconDoneProps extends IconProps {
  color?: undefined;
  type: RoleTypeEnum.Done;
}
export interface IconInterruptedProps extends IconProps {
  color?: undefined;
  type: RoleTypeEnum.Interrupted;
}

export default IconProps;
