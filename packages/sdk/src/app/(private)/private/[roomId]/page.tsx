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
import { notFound, redirect } from "next/navigation";

import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFolder } from "@docspace/shared/api/files/types";
import type { TSettings } from "@docspace/shared/api/settings/types";
import { resolveFolderTarget } from "@docspace/shared/services/private-room/upload-target";

import { getFilesSettings, getFolder, getFolderPath } from "@/api/files";
import { getSettings } from "@/api/settings";
import { getSelf } from "@/api/people";
import { PAGE_COUNT } from "@/utils/constants";

import { hasPrivateRoomsOptIn } from "../../_utils/private-rooms-opt-in";
import PrivateRoomFilesPage from "./page.client";

export const dynamic = "force-dynamic";

const serializeFilter = (filter: FilesFilter) => {
  const params = new URLSearchParams();

  const entries: [string, string | number | null | undefined][] = [
    ["folder", filter.folder],
    ["page", filter.page],
    ["pageCount", filter.pageCount],
    ["sortBy", filter.sortBy],
    ["sortOrder", filter.sortOrder],
    ["filterType", filter.filterType?.toString()],
  ];

  for (const [key, value] of entries) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  return params.toString();
};

export default async function PrivateRoomFiles({
  params,
  searchParams,
}: {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("asc_auth_key")?.value || "";
  const { roomId } = await params;
  const sp = await searchParams;

  if (!hasPrivateRoomsOptIn(sp)) return null;

  // Spec: private-rooms/sdk-surface, "No search in private rooms"
  const filter = FilesFilter.getDefault();
  filter.folder = sp.folder || roomId;
  filter.pageCount = sp.pageCount ? Number(sp.pageCount) : PAGE_COUNT;
  if (sp.page) filter.page = Math.max(0, Number(sp.page) - 1);
  if (sp.sortBy) filter.sortBy = sp.sortBy as typeof filter.sortBy;
  if (sp.sortOrder) filter.sortOrder = sp.sortOrder as typeof filter.sortOrder;

  const filesFilter = serializeFilter(filter);

  let filesSettings;
  let folderData;
  let portalSettings;
  let user;

  try {
    [filesSettings, folderData, portalSettings, user] = await Promise.all([
      getFilesSettings(),
      getFolder(filter.folder, filter),
      getSettings(),
      getSelf(),
    ]);
  } catch {
    // Server returned an error (403 access denied, 404 missing, 401 expired
    // auth, etc). Fall through to notFound() — Next renders not-found.tsx
    // and the user can navigate back to /sdk/private rooms list from there.
    notFound();
  }

  if (!filesSettings || !portalSettings || !folderData) {
    notFound();
  }

  // Spec: private-rooms/sdk-surface, "Archive page follows private-room rules"
  let path: TFolder[] = [];
  const target = await resolveFolderTarget(
    { id: folderData.current.id, rootFolderType: folderData.current.rootFolderType },
    async (folderId) => {
      path = await getFolderPath(folderId);
      return path;
    },
  ).catch(() => null);
  if (!target || target.encryptionRoomId === null) notFound();
  const room = path.find(
    (entry) => String(entry.id) === String(target.encryptionRoomId),
  );

  // Spec: private-rooms/sdk-surface, "Private rooms only through the private pages"
  if (!target.isPrivate) {
    const params = new URLSearchParams(sp);
    if (String(target.folderId) === String(target.encryptionRoomId)) {
      params.delete("folder");
    } else {
      params.set("folder", String(target.folderId));
    }
    const query = params.toString();
    const section = target.isArchived ? "/archive" : "/rooms";
    redirect(
      `${section}/${target.encryptionRoomId}${query ? `?${query}` : ""}`,
    );
  }

  return (
    <PrivateRoomFilesPage
      authToken={authToken}
      filesSettings={filesSettings}
      folderData={folderData}
      portalSettings={portalSettings as TSettings}
      filesFilter={filesFilter}
      user={user}
      roomId={String(target.encryptionRoomId)}
      isArchive={!!target.isArchived}
      isPrivate={target.isPrivate}
      canEditRoom={room?.security?.EditRoom === true}
    />
  );
}
