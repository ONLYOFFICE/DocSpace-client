import { ShareAccessRights } from "enums";
import { getUserRoleOptions } from "./getUserRoleOptions";

export const getUserRoleOptionsByUserAccess = (
  t: any,
  access: ShareAccessRights,
) => {
  if (!access) return;

  const options = getUserRoleOptions(t);
  const [userOption] = Object.values(options).filter(
    (opt) => opt.access === access,
  );

  return userOption;
};
