import { ContextMenuModel } from "@docspace/components/types";
import { RoleTypeEnum } from "./RoleType.enum";

export type RoleTypeOwn = {
  id: number;
  type: RoleTypeEnum;
  queue: number;
  title: string;
  badge?: number;
  onClickBadge?: VoidFunction;
  getOptions: () => ContextMenuModel[];
  color?: string;
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
  onClickLocation?: VoidFunction;
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
