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

"use client";

import FilesFilter from "@docspace/shared/api/files/filter";
import { FilterType, FolderType } from "@docspace/shared/enums";
import { getSettingsFiles, getFolder } from "@docspace/shared/api/files";
import { getUser } from "@docspace/shared/api/people";
import { getSettings } from "@docspace/shared/api/settings";
import { getAppSettings } from "@docspace/shared/api/apps";

import { useOAuthSSRData } from "@/hooks/useOAuthSSRData";
import OAuthPageLoader from "@/components/OAuthPageLoader";
import { PAGE_COUNT } from "@/utils/constants";
import { FormsSection } from "@/types/forms";

import FormsShell from "./layout.client";
import type { CommonData } from "../_hooks/useInitCommonStores";

type FormsCommonData = CommonData & { authToken: string };

const formsFolderFilter = (pageCount: number) => {
  const f = FilesFilter.getDefault();
  f.pageCount = pageCount;
  f.filterType = FilterType.PDFForm;
  return f;
};

const virtualFolderFilter = () => {
  const f = FilesFilter.getDefault();
  f.pageCount = PAGE_COUNT;
  return f;
};

async function loadCommonData(): Promise<FormsCommonData | null> {
  const url =
    typeof window !== "undefined"
      ? new URL(window.location.href)
      : new URL("http://localhost");
  const sp = url.searchParams;

  let roomId = sp.get("roomId") || "";
  let libraryId = sp.get("libraryId") || "";

  if (!roomId || !libraryId) {
    const appSettings = await getAppSettings<{
      roomId?: string | number;
      libraryId?: string | number;
    }>("ai-forms").catch(() => undefined);
    if (!roomId && appSettings?.roomId) roomId = String(appSettings.roomId);
    if (!libraryId && appSettings?.libraryId)
      libraryId = String(appSettings.libraryId);
  }

  const pathname = url.pathname;
  const isMyFormsRoute =
    pathname.endsWith("/my-forms") ||
    pathname.endsWith("/forms") ||
    pathname.endsWith("/forms/");
  const isInProgressRoute =
    pathname.endsWith("/in-progress") || pathname.endsWith("/in-progress/");
  const isCompletedRoute =
    pathname.endsWith("/completed-forms") ||
    pathname.endsWith("/completed-forms/");

  const [filesSettings, user, portalSettings, roomData] =
    await Promise.all([
      getSettingsFiles(),
      getUser().catch(() => undefined),
      getSettings().catch(() => undefined),
      roomId
        ? getFolder(roomId, formsFolderFilter(25)).catch(() => undefined)
        : Promise.resolve(undefined),
    ]);

  if (!filesSettings) return null;

  const socketUrl =
    portalSettings && typeof portalSettings !== "string"
      ? (portalSettings.socketUrl ?? "")
      : "";

  const roomSecurity = roomData?.current?.security;
  const roomAccess = roomData?.current?.access;
  const roomCurrent = roomData?.current as Record<string, unknown> | undefined;

  const doneFolderId = roomData?.folders?.find(
    (f) => f.type === FolderType.Done,
  )?.id;
  const inProgressFolderId = roomData?.folders?.find(
    (f) => f.type === FolderType.InProgress,
  )?.id;

  const initialFiles = isMyFormsRoute ? roomData?.files : undefined;
  const initialTotal = isMyFormsRoute ? roomData?.total : undefined;

  const virtualFolderIdToPrefetch = isInProgressRoute
    ? inProgressFolderId
    : isCompletedRoute
      ? doneFolderId
      : undefined;

  const virtualFolderData = virtualFolderIdToPrefetch
    ? await getFolder(virtualFolderIdToPrefetch, virtualFolderFilter()).catch(
        () => undefined,
      )
    : undefined;

  const initialFolders = virtualFolderData?.folders;
  const initialSection = isMyFormsRoute
    ? FormsSection.MyForms
    : isInProgressRoute
      ? FormsSection.InProgress
      : isCompletedRoute
        ? FormsSection.CompletedForms
        : undefined;

  return {
    authToken: "",
    roomId,
    libraryId,
    socketUrl,
    filesSettings,
    user,
    roomSecurity,
    roomAccess,
    saveFormAsXLSX: Boolean(roomCurrent?.saveFormAsXLSX),
    sendFormToExternalDB: Boolean(roomCurrent?.sendFormToExternalDB),
    doneFolderId,
    inProgressFolderId,
    initialFiles,
    initialTotal,
    initialFolders,
    initialSection,
  } as FormsCommonData;
}

export default function FormsOAuthShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: commonData, error } = useOAuthSSRData(loadCommonData);

  if (error) throw error;
  if (!commonData) return <OAuthPageLoader />;

  return <FormsShell commonData={commonData}>{children}</FormsShell>;
}
