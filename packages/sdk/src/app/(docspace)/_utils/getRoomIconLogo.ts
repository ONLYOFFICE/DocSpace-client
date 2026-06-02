// (c) Copyright Ascensio System SIA 2009-2026
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

import type { TLogo } from "@docspace/ui-kit/types";
export type RoomIconFields = {
  isRoom?: boolean;
  icon?: string;
  roomLogo?: TLogo;
  roomIconColor?: string;
  hasRoomImage?: boolean;
  title?: string;
};

/**
 * Resolves the `logo` prop value for `<RoomIcon>` based on an item's room
 * fields. Returns:
 * - the full `TLogo` object when the room has a custom cover,
 * - the best available preview URL (large → medium → original) otherwise,
 * - `item.icon` (file/folder icon URL) for non-room items.
 */
export function getRoomIconLogo(
  item: RoomIconFields,
): TLogo | string | undefined {
  if (!item.isRoom) return item.icon;
  const logo = item.roomLogo;
  if (!logo) return undefined;
  if (logo.cover) return logo;
  return logo.large || logo.medium || logo.original || undefined;
}

export type RoomIconDerivedFields = {
  roomLogo: TLogo | undefined;
  roomIconColor: string | undefined;
  hasRoomImage: boolean;
};

export function normalizeRoomLogo(
  logo: TLogo | undefined,
): RoomIconDerivedFields {
  const hasRoomImage = !!(logo?.medium || logo?.large || logo?.cover);
  return {
    hasRoomImage,
    roomLogo: hasRoomImage ? logo : undefined,
    roomIconColor: logo?.color?.replace("#", "") ?? undefined,
  };
}
