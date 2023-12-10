import { FolderType } from "@docspace/common/constants";

import EmptyScreenPersonalUrl from "PUBLIC_DIR/images/empty_screen_personal.svg?url";
import EmptyScreenPersonalDarkUrl from "PUBLIC_DIR/images/empty_screen_personal_dark.svg?url";

import EmptyScreenCorporateSvgUrl from "PUBLIC_DIR/images/empty_screen_corporate.svg?url";
import EmptyScreenCorporateDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_corporate_dark.svg?url";

import EmptyScreenRoleSvgUrl from "PUBLIC_DIR/images/empty_screen_role.svg?url";
import EmptyScreenRoleDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_role_dark.svg?url";

import EmptyScreenDoneSvgUrl from "PUBLIC_DIR/images/empty_screen_done.svg?url";
import EmptyScreenDoneDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_done_dark.svg?url";

type ThemeType = "light" | "dark";

type FolderTypeOf = typeof FolderType;
type FolderTypeValueOfType = FolderTypeOf[keyof FolderTypeOf];
type EmptyType =
  | "emptyScreenDone"
  | "emptyScreenInProgress"
  | "emptyScreenCorporate"
  | "emptyScreenDefault";

export const headerIconsUrl: Record<ThemeType, Record<EmptyType, string>> = {
  light: {
    emptyScreenDone: EmptyScreenDoneSvgUrl,
    emptyScreenInProgress: EmptyScreenRoleSvgUrl,
    emptyScreenDefault: EmptyScreenPersonalUrl,
    emptyScreenCorporate: EmptyScreenCorporateSvgUrl,
  },

  dark: {
    emptyScreenDone: EmptyScreenDoneDarkSvgUrl,
    emptyScreenInProgress: EmptyScreenRoleDarkSvgUrl,
    emptyScreenDefault: EmptyScreenPersonalDarkUrl,
    emptyScreenCorporate: EmptyScreenCorporateDarkSvgUrl,
  },
};

export const translateHeaderKey: Record<EmptyType, string> = {
  emptyScreenDone: "EmptyFormFolderDoneHeaderText",
  emptyScreenInProgress: "EmptyFormFolderProgressHeaderText",
  emptyScreenDefault: "EmptyScreenFolder",
  emptyScreenCorporate: "RoomCreated",
};
export const translateDescriptionKey: Record<EmptyType, string> = {
  emptyScreenDone: "EmptyFormFolderDoneDescriptionText",
  emptyScreenInProgress: "EmptyFormFolderProgressDescriptionText",
  emptyScreenDefault: "EmptyFolderDescriptionUser",
  emptyScreenCorporate: "EmptyFolderDecription",
};

export const getThemeMode = (theme: { isBase: boolean }): ThemeType => {
  return theme.isBase ? "light" : "dark";
};

export const getEmptyScreenType = (
  type: FolderTypeValueOfType | null,
  displayRoomCondition: boolean
): EmptyType => {
  switch (true) {
    case type === FolderType.Done:
      return "emptyScreenDone";
    case type === FolderType.InProgress:
      return "emptyScreenInProgress";
    case displayRoomCondition:
      return "emptyScreenCorporate";
    default:
      return "emptyScreenDefault";
  }
};

export const getHeaderText = (
  type: FolderTypeValueOfType | null,
  displayRoomCondition: boolean,
  t: Function
): string => {
  const emptyType = getEmptyScreenType(type, displayRoomCondition);
  const key = translateHeaderKey[emptyType];
  return t(key);
};

export const getDescriptionText = (
  type: FolderTypeValueOfType | null,
  canCreateFiles: boolean,
  t: Function
) => {
  const emptyType = getEmptyScreenType(type, canCreateFiles);
  const key = translateDescriptionKey[emptyType];
  return t(key);
};
