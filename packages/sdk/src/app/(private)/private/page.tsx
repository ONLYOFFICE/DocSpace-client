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

import { cookies } from "next/headers";

import type RoomsFilter from "@docspace/shared/api/rooms/filter";
import type { TFolder } from "@docspace/shared/api/files/types";
import type { TSettings } from "@docspace/shared/api/settings/types";
import { RoomSearchArea } from "@docspace/shared/enums";

import { getFilesSettings } from "@/api/files";
import { getRooms } from "@/api/rooms";
import { getSettings } from "@/api/settings";
import { getSelf } from "@/api/people";
import { PAGE_COUNT } from "@/utils/constants";

import {
  getPrivateRoomsDefaultFilter,
  isPrivateRoomEntry,
} from "../_utils/private-rooms-filter";
import PrivateRoomsPage from "./page.client";

export const dynamic = "force-dynamic";

const serializeRoomsFilter = (filter: RoomsFilter) => {
  const params = new URLSearchParams();

  const entries: [string, string | number | null | undefined][] = [
    ["page", filter.page],
    ["pageCount", filter.pageCount],
    ["sortBy", filter.sortBy],
    ["sortOrder", filter.sortOrder],
    ["search", filter.filterValue],
    ["searchArea", filter.searchArea],
    ["type", filter.type as string],
  ];

  for (const [key, value] of entries) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  return params.toString();
};

export default async function PrivateRooms({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("asc_auth_key")?.value || "";
  const params = await searchParams;

  const filter = getPrivateRoomsDefaultFilter(RoomSearchArea.Active);
  filter.pageCount = params.pageCount ? Number(params.pageCount) : PAGE_COUNT;
  if (params.page) filter.page = Math.max(0, Number(params.page) - 1);
  if (params.sortBy) filter.sortBy = params.sortBy as typeof filter.sortBy;
  if (params.sortOrder)
    filter.sortOrder = params.sortOrder as typeof filter.sortOrder;
  if (params.search) filter.filterValue = params.search;

  const filesFilter = serializeRoomsFilter(filter);

  let filesSettings;
  let roomsData;
  let portalSettings;
  let user;

  try {
    [filesSettings, roomsData, portalSettings, user] = await Promise.all([
      getFilesSettings(),
      getRooms(filter),
      getSettings(),
      getSelf(),
    ]);
  } catch (error) {
    throw new Error(
      `Failed to load private rooms page data: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!filesSettings || !portalSettings || !roomsData) {
    throw new Error("Failed to load required settings");
  }

  // Post-fetch private filter: server has no `private` query parameter, so
  // we ask for all CustomRoom entries and drop non-private ones here. Total
  // is recomputed to keep pagination honest.
  const folders = (roomsData.folders as unknown as TFolder[]).filter(
    isPrivateRoomEntry,
  );

  return (
    <PrivateRoomsPage
      authToken={authToken}
      filesSettings={filesSettings}
      folderData={{
        ...roomsData,
        folders,
        total: folders.length,
      }}
      portalSettings={portalSettings as TSettings}
      filesFilter={filesFilter}
      user={user}
    />
  );
}
