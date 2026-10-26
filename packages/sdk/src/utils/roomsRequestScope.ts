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

import type RoomsFilter from "@docspace/shared/api/rooms/filter";
import { CategoryType } from "@docspace/shared/constants";
import type { ValueOf } from "@docspace/shared/types";
import {
  getRoomsRequestScope,
  withRoomsRequestScope,
} from "@docspace/shared/utils/rooms";

type TRoomListKind = { isPrivate?: boolean; isArchive?: boolean };

const categoryOf = ({
  isPrivate,
  isArchive,
}: TRoomListKind): ValueOf<typeof CategoryType> => {
  if (isPrivate) {
    return isArchive ? CategoryType.PrivateArchive : CategoryType.PrivateRooms;
  }
  return isArchive ? CategoryType.Archive : CategoryType.Shared;
};

/**
 * The rooms-list request of an SDK room list, scoped as the client scopes
 * its lists while the Private section is available: the private pages list
 * private rooms only and the generic lists none.
 * Spec: private-rooms/sdk-surface, "Private rooms only through the private pages"
 */
export const scopeRoomsRequest = (
  filter: RoomsFilter,
  kind: TRoomListKind = {},
): RoomsFilter =>
  withRoomsRequestScope(
    filter,
    getRoomsRequestScope(categoryOf(kind), filter.searchArea, true),
  );
