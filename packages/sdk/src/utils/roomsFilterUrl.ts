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

/** The address parameters `RoomsFilter.toUrlParams` writes. */
export const ROOMS_FILTER_URL_KEYS = new Set([
  "excludeSubject",
  "filterValue",
  "page",
  "count",
  "provider",
  "quotaFilter",
  "searchArea",
  "searchInContent",
  "withSubfolders",
  "sortBy",
  "sortOrder",
  "storageFilter",
  "subjectFilter",
  "subjectId",
  "tags",
  "type",
  "withoutTags",
  "groupId",
  "startIndex",
  "subjectOwnerId",
  "privacyFilter",
  "metadataTemplateId",
  "metadataFilters",
]);

/**
 * The query of a rooms list address: the filter's own parameters plus every
 * other parameter of the current address, such as the host's private-rooms
 * opt-in, as the files list keeps them.
 * Spec: sdk-surface, "Private pages keep the host opt-in"
 */
export const roomsFilterQuery = (
  filter: RoomsFilter,
  currentSearch: string = typeof window === "undefined"
    ? ""
    : window.location.search,
) => {
  const own = filter.toUrlParams();
  const others = new URLSearchParams(currentSearch);
  for (const key of [...others.keys()]) {
    if (ROOMS_FILTER_URL_KEYS.has(key)) others.delete(key);
  }
  const rest = others.toString();
  return rest ? `${own}&${rest}` : own;
};
