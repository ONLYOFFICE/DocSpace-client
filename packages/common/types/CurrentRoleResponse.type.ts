import { FileByRoleType } from "./FileByRole.type";
import { RoleQueue } from "./RoleQueue.type";
export type CurrentRoleResponseType = {
  new: number;
  count: number;
  total: number;
  startIndex: number;
  current: RoleQueue;
  pathParts: number[];
  files: FileByRoleType[];
};
