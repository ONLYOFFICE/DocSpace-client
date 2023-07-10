import { RoleTypeEnum } from "../enums/RoleType.enum";

export type RoleQueueOwn = {
  id: number;
  type: RoleTypeEnum;
  queue: number;
  title: string;
  badge: number;

  color?: string;
};

export type RoleQueueDefaultType = RoleQueueOwn & {
  color: string;
  assigned?: {
    id: string;
    hasAvatar: boolean;
    profileUrl: string;
    avatarSmall: string;
    displayName: string;
  };
  type: RoleTypeEnum.Default;
};

export type RoleQueueDoneType = RoleQueueOwn & {
  type: RoleTypeEnum.Done;
  color?: never;
};
export type RoleQueueInterruptedType = RoleQueueOwn & {
  type: RoleTypeEnum.Done;
  color?: never;
};

export type RoleQueue =
  | RoleQueueDefaultType
  | RoleQueueDoneType
  | RoleQueueInterruptedType;
