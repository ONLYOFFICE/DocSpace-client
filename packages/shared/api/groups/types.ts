import { TUser } from "../people/types";

export type TGroup = {
  category: string;
  id: string;
  manager: TUser;
  name: string;
  parent: string;
  isGroup?: boolean;
  membersCount: number;
};
