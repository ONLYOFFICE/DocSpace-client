import { FolderType } from "@docspace/shared/enums";
import type { TTranslation } from "@docspace/shared/types";

import EmptyScreenPersonalUrl from "PUBLIC_DIR/images/empty_screen_personal.svg?url";
import EmptyScreenPersonalDarkUrl from "PUBLIC_DIR/images/empty_screen_personal_dark.svg?url";

import EmptyScreenCorporateSvgUrl from "PUBLIC_DIR/images/empty_screen_corporate.svg?url";
import EmptyScreenCorporateDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_corporate_dark.svg?url";

import EmptyScreenRoleSvgUrl from "PUBLIC_DIR/images/empty_screen_role.svg?url";
import EmptyScreenRoleDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_role_dark.svg?url";

import EmptyScreenDoneSvgUrl from "PUBLIC_DIR/images/empty_screen_done.svg?url";
import EmptyScreenDoneDarkSvgUrl from "PUBLIC_DIR/images/empty_screen_done_dark.svg?url";

type ThemeType = "light" | "dark";

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

export const getTranslateHeaderKey = (
  t: TTranslation,
  type: EmptyScreenTypeEnum,
) => {
  const translateHeaderKey: Record<EmptyScreenTypeEnum, string> = {
    [EmptyScreenTypeEnum.Done]: t("EmptyFormFolderDoneHeaderText"),
    [EmptyScreenTypeEnum.InProgress]: t("EmptyFormFolderProgressHeaderText"),
    [EmptyScreenTypeEnum.Default]: t("EmptyScreenFolder"),
    [EmptyScreenTypeEnum.Corporate]: t("RoomCreated"),
    [EmptyScreenTypeEnum.SubFolderDone]: t("EmptyFormSubFolderHeaderText"),
    [EmptyScreenTypeEnum.SubFolderinProgress]: t(
      "EmptyFormSubFolderHeaderText",
    ),
  };

  return translateHeaderKey[type];
};

const getTranslateDescriptionKey = (
  t: TTranslation,
  type: EmptyScreenTypeEnum,
) => {
  const translateDescriptionKey: Record<EmptyScreenTypeEnum, string> = {
    [EmptyScreenTypeEnum.Done]: t("EmptyFormFolderDoneDescriptionText"),
    [EmptyScreenTypeEnum.InProgress]: t(
      "EmptyFormFolderProgressDescriptionText",
    ),
    [EmptyScreenTypeEnum.Default]: t("EmptyFolderDescriptionUser"),
    [EmptyScreenTypeEnum.Corporate]: t("EmptyFolderDecription"),
    [EmptyScreenTypeEnum.SubFolderDone]: t(
      "EmptyFormSubFolderDoneDescriptionText",
    ),
    [EmptyScreenTypeEnum.SubFolderinProgress]: t(
      "EmptyFormSubFolderProgressDescriptionText",
    ),
  };

  return translateDescriptionKey[type];
};

export const getThemeMode = (theme: { isBase: boolean }): ThemeType => {
  return theme.isBase ? "light" : "dark";
};

export const getEmptyScreenType = (
  type: FolderType | null,
  displayRoomCondition: boolean,
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
  type: FolderType | null,
  displayRoomCondition: boolean,
  t: TTranslation,
): string => {
  const emptyType = getEmptyScreenType(type, displayRoomCondition);
  const key = getTranslateHeaderKey(t, emptyType);
  return key;
};

export const getDescriptionText = (
  type: FolderType | null,
  canCreateFiles: boolean,
  t: TTranslation,
) => {
  const emptyType = getEmptyScreenType(type, canCreateFiles);
  const key = getTranslateDescriptionKey(t, emptyType);
  return key;
};
