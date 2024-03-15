import { TUser } from "@docspace/shared/api/people/types";

export type GroupParams = {
  groupName: string;
  groupManager: object | null;
  groupMembers: object[];
};

export type GroupMembers = TUser[] | null;

export type EditGroupParams = {
  groupName: string;
  groupManager: TUser | null;
  groupMembers: GroupMembers;
};
