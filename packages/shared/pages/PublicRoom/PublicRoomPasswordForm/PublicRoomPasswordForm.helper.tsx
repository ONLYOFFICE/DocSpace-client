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

import { Trans } from "react-i18next";
import type { TFunction } from "i18next";
import { match, P } from "ts-pattern";

import { Text } from "../../../components/text";
import { LinkSharingEntityType } from "../../../enums";
import { iconSize32 } from "../../../utils/image-helpers";
import type { TValidateShareRoom } from "../../../api/rooms/types";

/**
 * Creates a description component for password-protected resources
 * based on the validation data
 */
const createTrans = (
  i18nKey: string,
  valueKey: string,
  valueText: string,
  t: TFunction,
) => (
  <Trans
    t={t}
    ns="Common"
    i18nKey={i18nKey}
    values={{ [valueKey]: valueText }}
    components={{
      1: <Text key={valueText} as="strong" fontSize="13px" fontWeight="600" />,
    }}
  />
);
export const getPasswordDescription = (
  t: TFunction,
  validationData: TValidateShareRoom,
) => {
  const displayText = validationData.entityTitle || validationData.title || "";

  return match(validationData)
    .with({ type: LinkSharingEntityType.File }, () =>
      createTrans("Common:PasswordProtectedFile", "fileName", displayText, t),
    )
    .with(
      {
        isRoom: true,
        type: LinkSharingEntityType.RoomOrFolder,
        entityType: LinkSharingEntityType.File,
      },
      () =>
        createTrans(
          "Common:PasswordProtectedRoomFile",
          "fileName",
          displayText,
          t,
        ),
    )
    .with(
      {
        isRoom: false,
        type: LinkSharingEntityType.RoomOrFolder,
        entityType: LinkSharingEntityType.File,
      },
      () =>
        createTrans(
          "Common:PasswordProtectedFolderFile",
          "fileName",
          displayText,
          t,
        ),
    )
    .with(
      {
        isRoom: true,
        type: LinkSharingEntityType.RoomOrFolder,
        entityType: LinkSharingEntityType.RoomOrFolder,
      },
      () =>
        createTrans(
          "Common:PasswordProtectedRoomFolder",
          "folderName",
          displayText,
          t,
        ),
    )
    .with(
      {
        isRoom: false,
        type: LinkSharingEntityType.RoomOrFolder,
        entityType: LinkSharingEntityType.RoomOrFolder,
      },
      () =>
        createTrans(
          "Common:PasswordProtectedFolderFolder",
          "folderName",
          displayText,
          t,
        ),
    )
    .with(
      {
        isRoom: true,
        type: LinkSharingEntityType.RoomOrFolder,
        entityType: P.nullish,
      },
      () => t("Common:NeedPassword"),
    )
    .with(
      {
        isRoom: false,
        type: LinkSharingEntityType.RoomOrFolder,
        entityType: P.nullish,
      },
      () =>
        createTrans(
          "Common:PasswordProtectedFolder",
          "folderName",
          displayText,
          t,
        ),
    )
    .when(
      () => !displayText && !validationData.entityType,
      () => t("Common:NeedPassword"),
    )
    .otherwise(() => t("Common:NeedPassword"));
};

export const getLogo = (validationData: TValidateShareRoom) => {
  switch (validationData.type) {
    case LinkSharingEntityType.File: {
      const fileExtension = validationData.title.split(".").pop();

      if (!fileExtension) {
        return iconSize32.get("file.svg");
      }

      const path = `${fileExtension.replace(/^\./, "")}.svg`;

      return iconSize32.get(path);
    }
    case LinkSharingEntityType.RoomOrFolder:
      if (validationData.isRoom) return undefined;

      return iconSize32.get("folder.svg");
    default:
      return undefined;
  }
};
