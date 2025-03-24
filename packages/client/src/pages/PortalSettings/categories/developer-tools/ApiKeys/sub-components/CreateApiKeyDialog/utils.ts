import { TTranslation } from "@docspace/shared/types";
import { TPermissionsList } from "../../types";

export enum PermissionGroup {
  profile = "profile",
  accounts = "accounts",
  files = "files",
  rooms = "rooms",
}

export const getCategoryTranslation = (
  group: PermissionGroup,
  t: TTranslation,
) => {
  switch (group) {
    case PermissionGroup.profile:
      return t("Common:OAuthProfilesName");
    case PermissionGroup.accounts:
      return t("Common:OAuthAccountsName");
    case PermissionGroup.files:
      return t("Common:OAuthFilesName");
    case PermissionGroup.rooms:
      return t("Common:OAuthRoomsName");
    default:
      return "";
  }
};

export const getFilteredOptions = (permissions: string[]) => {
  const options = {} as TPermissionsList;
  permissions.forEach((permission) => {
    const obj = { isChecked: false, name: permission };
    const isRead = permission.includes("read");
    const defaultObj = {
      isRead: { isChecked: false, name: "" },
      isWrite: { isChecked: false, name: "" },
    };

    if (permission.includes("accounts.self")) {
      if (!options.profile) options.profile = defaultObj;
      if (isRead) options.profile.isRead = obj;
      else options.profile.isWrite = obj;
    } else if (permission.includes("accounts")) {
      if (!options.accounts) options.accounts = defaultObj;
      if (isRead) options.accounts.isRead = obj;
      else options.accounts.isWrite = obj;
    } else if (permission.includes("files")) {
      if (!options.files) options.files = defaultObj;
      if (isRead) options.files.isRead = obj;
      else options.files.isWrite = obj;
    } else if (permission.includes("rooms")) {
      if (!options.rooms) options.rooms = defaultObj;
      if (isRead) options.rooms.isRead = obj;
      else options.rooms.isWrite = obj;
    }
  });

  return options;
};
