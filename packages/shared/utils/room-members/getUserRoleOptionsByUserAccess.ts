import { ShareAccessRights } from "enums";
import { TTranslation } from "../../types";
import { getUserRoleOptions } from "./getUserRoleOptions";

export const getUserRoleOptionsByUserAccess = (
  t: TTranslation,
  access: ShareAccessRights,
) => {
  if (!access) return;

  const options = getUserRoleOptions(t);
  const [userOption] = Object.values(options).filter(
    (opt) => opt.access === access,
  );

  return userOption;
};
