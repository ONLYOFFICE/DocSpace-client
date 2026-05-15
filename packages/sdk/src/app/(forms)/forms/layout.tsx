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

import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";

import FilesFilter from "@docspace/shared/api/files/filter";
import { FilterType, FolderType } from "@docspace/shared/enums";

import { getFilesSettings } from "@/api/files";
import { getFormsFolder } from "@/api/forms";
import { getSelf } from "@/api/people";
import { getDefaultProvider } from "@/api/ai";
import { getSettings } from "@/api/settings";
import {
  FILTER_HEADER,
  LIBRARY_ID_HEADER,
  PAGE_COUNT,
  ROOM_ID_HEADER,
  PATHNAME_HEADER,
} from "@/utils/constants";
import { FormsSection } from "@/types/forms";

import FormsShell from "./layout.client";

export const dynamic = "force-dynamic";

export default async function FormsServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const cookieStore = await cookies();

  const roomId = hdrs.get(ROOM_ID_HEADER) || "";
  const libraryId = hdrs.get(LIBRARY_ID_HEADER) || "";
  const authToken = cookieStore.get("asc_auth_key")?.value || "";
  const pathname = hdrs.get(PATHNAME_HEADER) ?? "";

  const isMyFormsRoute =
    pathname.endsWith("/my-forms") ||
    pathname.endsWith("/forms") ||
    pathname.endsWith("/forms/");
  const isInProgressRoute =
    pathname.endsWith("/in-progress") || pathname.endsWith("/in-progress/");
  const isCompletedRoute =
    pathname.endsWith("/completed-forms") ||
    pathname.endsWith("/completed-forms/");

  const filterHeader = hdrs.get(FILTER_HEADER) || "";
  const filterParams = new URLSearchParams(filterHeader);
  const providerName = filterParams.get("providerName") || "";
  const inviteKey = filterParams.get("inviteKey") || "";
  const emplType = filterParams.get("emplType") || "";
  const uid = filterParams.get("uid") || "";

  const [filesSettings, user, defaultProvider, portalSettings, roomData] =
    await Promise.all([
      getFilesSettings(),
      getSelf(),
      getDefaultProvider(),
      getSettings().catch(() => undefined),
      roomId
        ? getFormsFolder(
            roomId,
            (() => {
              const f = FilesFilter.getDefault();
              f.pageCount = 25;
              f.filterType = FilterType.PDFForm;
              return f;
            })(),
          ).catch(() => undefined)
        : undefined,
    ]);

  if (!user && providerName) {
    const proto = hdrs.get("x-forwarded-proto") || "https";
    const host = hdrs.get("x-forwarded-host") || hdrs.get("host") || "";
    const returnPath = pathname || "/forms/my-forms";
    const returnParams = new URLSearchParams();
    if (roomId) returnParams.set("roomId", roomId);
    if (libraryId) returnParams.set("libraryId", libraryId);
    const showMenu = filterParams.get("showMenu");
    if (showMenu) returnParams.set("showMenu", showMenu);
    const returnQs = returnParams.toString();
    const successRedirectURL = `${proto}://${host}/sdk${returnPath}${returnQs ? `?${returnQs}` : ""}`;

    const authParams = new URLSearchParams();
    authParams.set("providerName", providerName);
    if (inviteKey) authParams.set("inviteKey", inviteKey);
    if (emplType) authParams.set("emplType", emplType);
    if (uid) authParams.set("uid", uid);
    authParams.set("successRedirectURL", successRedirectURL);

    redirect(`/auth?${authParams.toString()}`);
  }

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
    ? await getFormsFolder(
        virtualFolderIdToPrefetch,
        (() => {
          const f = FilesFilter.getDefault();
          f.pageCount = PAGE_COUNT;
          return f;
        })(),
      ).catch(() => undefined)
    : undefined;

  const initialFolders = virtualFolderData?.folders;
  const initialSection = isMyFormsRoute
    ? FormsSection.MyForms
    : isInProgressRoute
      ? FormsSection.InProgress
      : isCompletedRoute
        ? FormsSection.CompletedForms
        : undefined;

  return (
    <FormsShell
      commonData={{
        roomId,
        libraryId,
        authToken,
        socketUrl,
        filesSettings: filesSettings!,
        user,
        defaultProvider,
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
      }}
    >
      {children}
    </FormsShell>
  );
}
