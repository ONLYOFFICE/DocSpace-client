/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Trans } from "react-i18next";
import type { TFunction } from "i18next";
import { match, P } from "ts-pattern";

import PublicRoomIconURL from "PUBLIC_DIR/images/icons/32/room/public.svg?url";

import { Text } from "@docspace/ui-kit/components/text";
import { LinkSharingEntityType } from "../../../enums";
import { iconSize32 } from "../../../utils/image-helpers";
import type { TValidateShareRoom } from "../../../api/rooms/types";

/**
 * Helper types for password-protected resources descriptions
 */
export const getPasswordDescription = (
  t: TFunction,
  validationData: TValidateShareRoom,
) => {
  const displayText = validationData.entityTitle || validationData.title || "";

  return match(validationData)
    .with({ type: LinkSharingEntityType.File }, () => (
      <Trans
        t={t}
        ns="Common"
        i18nKey="Common:PasswordProtectedFile"
        values={{ fileName: displayText }}
        components={{
          1: (
            <Text
              key={displayText}
              as="strong"
              fontSize="13px"
              fontWeight="600"
            />
          ),
        }}
      />
    ))
    .with(
      {
        isRoom: true,
        type: LinkSharingEntityType.RoomOrFolder,
        entityType: LinkSharingEntityType.File,
      },
      () => (
        <Trans
          t={t}
          ns="Common"
          i18nKey="Common:PasswordProtectedRoomFile"
          values={{ fileName: displayText }}
          components={{
            1: (
              <Text
                key={displayText}
                as="strong"
                fontSize="13px"
                fontWeight="600"
              />
            ),
          }}
        />
      ),
    )
    .with(
      {
        isRoom: false,
        type: LinkSharingEntityType.RoomOrFolder,
        entityType: LinkSharingEntityType.File,
      },
      () => (
        <Trans
          t={t}
          ns="Common"
          i18nKey="Common:PasswordProtectedFolderFile"
          values={{ fileName: displayText }}
          components={{
            1: (
              <Text
                key={displayText}
                as="strong"
                fontSize="13px"
                fontWeight="600"
              />
            ),
          }}
        />
      ),
    )
    .with(
      {
        isRoom: true,
        type: LinkSharingEntityType.RoomOrFolder,
        entityType: LinkSharingEntityType.RoomOrFolder,
      },
      () => (
        <Trans
          t={t}
          ns="Common"
          i18nKey="Common:PasswordProtectedRoomFolder"
          values={{ folderName: displayText }}
          components={{
            1: (
              <Text
                key={displayText}
                as="strong"
                fontSize="13px"
                fontWeight="600"
              />
            ),
          }}
        />
      ),
    )
    .with(
      {
        isRoom: false,
        type: LinkSharingEntityType.RoomOrFolder,
        entityType: LinkSharingEntityType.RoomOrFolder,
      },
      () => (
        <Trans
          t={t}
          ns="Common"
          i18nKey="Common:PasswordProtectedFolderFolder"
          values={{ folderName: displayText }}
          components={{
            1: (
              <Text
                key={displayText}
                as="strong"
                fontSize="13px"
                fontWeight="600"
              />
            ),
          }}
        />
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
      () => (
        <Trans
          t={t}
          ns="Common"
          i18nKey="Common:PasswordProtectedFolder"
          values={{ folderName: displayText }}
          components={{
            1: (
              <Text
                key={displayText}
                as="strong"
                fontSize="13px"
                fontWeight="600"
              />
            ),
          }}
        />
      ),
    )
    .when(
      () => !displayText && !validationData.entityType,
      () => t("Common:NeedPassword"),
    )
    .otherwise(() => t("Common:NeedPassword"));
};

export const getLogo = (
  validationData: TValidateShareRoom,
  getIcon?: (fileExst: string) => string,
) => {
  switch (validationData.type) {
    case LinkSharingEntityType.File: {
      const fileExtension = validationData.title.split(".").pop();

      if (!fileExtension) {
        return iconSize32.get("file.svg");
      }

      const path = `${fileExtension.replace(/^\./, "")}.svg`;

      return getIcon ? getIcon(`.${fileExtension}`) : iconSize32.get(path);
    }
    case LinkSharingEntityType.RoomOrFolder:
      if (validationData.isRoom) return PublicRoomIconURL;

      return iconSize32.get("folder.svg");
    default:
      return undefined;
  }
};
