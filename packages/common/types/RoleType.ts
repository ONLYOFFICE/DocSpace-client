import { ContextMenuModel } from "@docspace/components/types";
import { RoleTypeEnum } from "../enums/RoleType.enum";
import { IRole } from "../Models";

export type RoleTypeOwn = {
  id: number;
  type: RoleTypeEnum;
  queue: number;
  title: string;
  badge: number;
  onClickBadge?: VoidFunction;
  contextOptions: string[];
  onContentRowCLick: (role: IRole, checked: boolean) => void;
  color?: string;

  isChecked: boolean;
  onChecked: (role: RoleType, checked: boolean) => void;
};

export interface RoleDefaultType extends RoleTypeOwn {
  assigned?: {
    id: string;
    hasAvatar: boolean;
    profileUrl: string;
    avatarSmall: string;
    displayName: string;
  };
  color: string;
  onClickLocation: (roomId: string | number) => void;
  type: RoleTypeEnum.Default;
}

export interface RoleDoneType extends RoleTypeOwn {
  type: RoleTypeEnum.Done;
  color?: never;
}

export interface RoleInterruptedType extends RoleTypeOwn {
  type: RoleTypeEnum.Interrupted;
  color?: never;
}

export type RoleType = RoleDefaultType | RoleDoneType | RoleInterruptedType;
