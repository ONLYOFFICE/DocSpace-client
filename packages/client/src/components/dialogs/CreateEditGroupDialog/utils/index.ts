import { TUser } from "@docspace/shared/api/people/types";
import { EditGroupParams, GroupMembers } from "../types";

const compareMembers = (a: GroupMembers, b: GroupMembers): boolean => {
  if (!a && !b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;

  const sortCb = (first: TUser, second: TUser) =>
    first.id < second.id ? -1 : 1;
  const sortedA = [...a].sort(sortCb);
  const sortedB = [...b].sort(sortCb);

  return !sortedA.some((el, i) => el.id !== sortedB[i].id);
};

const removeManagerFromMembers = (members: GroupMembers, managerId: string) => {
  return members?.filter((g) => g.id !== managerId) || null;
};

export const compareGroupParams = (
  prev: EditGroupParams,
  current: EditGroupParams,
): boolean => {
  const equalTitle = prev.groupName === current.groupName;
  const equalManager = prev.groupManager?.id === current.groupManager?.id;

  const prevGroupMembers = prev.groupManager?.id
    ? removeManagerFromMembers(prev.groupMembers, prev.groupManager.id)
    : prev.groupMembers;
  const currentGroupMembers = current.groupManager?.id
    ? removeManagerFromMembers(current.groupMembers, current.groupManager.id)
    : current.groupMembers;

  const equalMembers = compareMembers(prevGroupMembers, currentGroupMembers);

  return equalTitle && equalManager && equalMembers;
};
