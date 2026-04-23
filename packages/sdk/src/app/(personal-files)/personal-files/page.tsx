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

import { cookies } from "next/headers";

import FilesFilter from "@docspace/shared/api/files/filter";
import type { TSettings } from "@docspace/shared/api/settings/types";

import { getFilesSettings, getFolder } from "@/api/files";
import { getSettings } from "@/api/settings";
import { getSelf } from "@/api/people";
import { PAGE_COUNT } from "@/utils/constants";

import DocsPage from "./page.client";

const serializeFilter = (filter: FilesFilter) => {
  const params = new URLSearchParams();

  const entries: [string, string | number | null | undefined][] = [
    ["folder", filter.folder],
    ["page", filter.page],
    ["pageCount", filter.pageCount],
    ["sortBy", filter.sortBy],
    ["sortOrder", filter.sortOrder],
    ["filterType", filter.filterType?.toString()],
    ["search", filter.search],
    ["key", filter.key],
  ];

  for (const [key, value] of entries) {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  }

  return params.toString();
};

export default async function Docs({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("asc_auth_key")?.value || "";
  const params = await searchParams;

  const filter = FilesFilter.getDefault();
  filter.folder = params.folder || "@my";
  filter.pageCount = params.pageCount ? Number(params.pageCount) : PAGE_COUNT;
  if (params.page) filter.page = Number(params.page);
  if (params.sortBy) filter.sortBy = params.sortBy as typeof filter.sortBy;
  if (params.sortOrder) filter.sortOrder = params.sortOrder as typeof filter.sortOrder;
  if (params.search) filter.search = params.search;

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
  } catch (error) {
    throw new Error(
      `Failed to load docs page data: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  if (!filesSettings || !portalSettings) {
    throw new Error("Failed to load required settings");
  }

  return (
    <DocsPage
      authToken={authToken}
      filesSettings={filesSettings}
      folderData={folderData}
      portalSettings={portalSettings as TSettings}
      filesFilter={filesFilter}
      user={user}
    />
  );
}
