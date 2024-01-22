import { FolderType } from "@docspace/shared/enums";

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

enum EmptyScreenTypeEnum {
  Done = "emptyScreenDone",
  InProgress = "emptyScreenInProgress",
  Corporate = "emptyScreenCorporate",
  Default = "emptyScreenDefault",
  SubFolderDone = "emptyScreenSubFolderDone",
  SubFolderinProgress = "emptyScreenSubFolderinProgress",
}

export const headerIconsUrl: Record<
  ThemeType,
  Record<EmptyScreenTypeEnum, string>
> = {
  light: {
    [EmptyScreenTypeEnum.Done]: EmptyScreenDoneSvgUrl,
    [EmptyScreenTypeEnum.InProgress]: EmptyScreenRoleSvgUrl,
    [EmptyScreenTypeEnum.Default]: EmptyScreenPersonalUrl,
    [EmptyScreenTypeEnum.Corporate]: EmptyScreenCorporateSvgUrl,
    [EmptyScreenTypeEnum.SubFolderDone]: EmptyScreenPersonalUrl,
    [EmptyScreenTypeEnum.SubFolderinProgress]: EmptyScreenPersonalUrl,
  },
  dark: {
    [EmptyScreenTypeEnum.Done]: EmptyScreenDoneDarkSvgUrl,
    [EmptyScreenTypeEnum.InProgress]: EmptyScreenRoleDarkSvgUrl,
    [EmptyScreenTypeEnum.Default]: EmptyScreenPersonalDarkUrl,
    [EmptyScreenTypeEnum.Corporate]: EmptyScreenCorporateDarkSvgUrl,
    [EmptyScreenTypeEnum.SubFolderDone]: EmptyScreenPersonalDarkUrl,
    [EmptyScreenTypeEnum.SubFolderinProgress]: EmptyScreenPersonalDarkUrl,
  },
};

export const translateHeaderKey: Record<EmptyScreenTypeEnum, string> = {
  [EmptyScreenTypeEnum.Done]: "EmptyFormFolderDoneHeaderText",
  [EmptyScreenTypeEnum.InProgress]: "EmptyFormFolderProgressHeaderText",
  [EmptyScreenTypeEnum.Default]: "EmptyScreenFolder",
  [EmptyScreenTypeEnum.Corporate]: "RoomCreated",
  [EmptyScreenTypeEnum.SubFolderDone]: "EmptyFormSubFolderHeaderText",
  [EmptyScreenTypeEnum.SubFolderinProgress]: "EmptyFormSubFolderHeaderText",
};
export const translateDescriptionKey: Record<EmptyScreenTypeEnum, string> = {
  [EmptyScreenTypeEnum.Done]: "EmptyFormFolderDoneDescriptionText",
  [EmptyScreenTypeEnum.InProgress]: "EmptyFormFolderProgressDescriptionText",
  [EmptyScreenTypeEnum.Default]: "EmptyFolderDescriptionUser",
  [EmptyScreenTypeEnum.Corporate]: "EmptyFolderDecription",
  [EmptyScreenTypeEnum.SubFolderDone]: "EmptyFormSubFolderDoneDescriptionText",
  [EmptyScreenTypeEnum.SubFolderinProgress]:
    "EmptyFormSubFolderProgressDescriptionText",
};

export const getThemeMode = (theme: { isBase: boolean }): ThemeType => {
  return theme.isBase ? "light" : "dark";
};

export const getEmptyScreenType = (
  type: FolderTypeValueOfType | null,
  displayRoomCondition: boolean
): EmptyScreenTypeEnum => {
  switch (true) {
    case type === FolderType.Done:
      return EmptyScreenTypeEnum.Done;
    case type === FolderType.InProgress:
      return EmptyScreenTypeEnum.InProgress;
    case type === FolderType.SubFolderDone:
      return EmptyScreenTypeEnum.SubFolderDone;
    case type === FolderType.SubFolderInProgress:
      return EmptyScreenTypeEnum.SubFolderinProgress;
    case displayRoomCondition:
      return EmptyScreenTypeEnum.Corporate;
    default:
      return EmptyScreenTypeEnum.Default;
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
