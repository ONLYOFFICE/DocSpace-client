import { RoleTypeEnum } from "../enums/RoleType.enum";

export type FillQueueOwn = {
  id: number;
  type: RoleTypeEnum;
  queue: number;
  title: string;
  badge: number;

  color?: string;
};

export type FillQueueDefaultType = FillQueueOwn & {
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

export type FillQueueDoneType = FillQueueOwn & {
  type: RoleTypeEnum.Done;
  color?: never;
};
export type FillQueueInterruptedType = FillQueueOwn & {
  type: RoleTypeEnum.Done;
  color?: never;
};

export type FillQueue =
  | FillQueueDefaultType
  | FillQueueDoneType
  | FillQueueInterruptedType;
