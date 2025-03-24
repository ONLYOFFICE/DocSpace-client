// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
    [EmptyScreenTypeEnum.Default]: t("Common:EmptyScreenFolder"),
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
