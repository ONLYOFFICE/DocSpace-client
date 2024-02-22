import { TUser } from "@docspace/shared/api/people/types";
import { ShareAccessRights } from "@docspace/shared/enums";

export const checkIfAccessPaid = (access: ShareAccessRights) => {
  return (
    access === ShareAccessRights.FullAccess ||
    access === ShareAccessRights.RoomManager ||
    access === ShareAccessRights.Collaborator
  );
};

export const filterUserRoleOptions = (
  options: { access: ShareAccessRights; key: string }[],
  currentUser: TUser,
  withRemove = false,
) => {
  if (!options) return options;
  let newOptions = [...options];

  if (currentUser?.isAdmin || currentUser?.isOwner) {
    newOptions = newOptions.filter(
      (o) =>
        +o.access === ShareAccessRights.RoomManager ||
        +o.access === ShareAccessRights.None ||
        (withRemove && (o.key === "s2" || o.key === "remove")),
    );

    return newOptions;
  }

  return newOptions;
};

export const filterGroupRoleOptions = (
  options: { access: ShareAccessRights; key: string }[],
) => {
  if (!options) return options;

  return options.filter((o) => !checkIfAccessPaid(+o.access) && o.key !== "s1");
};
