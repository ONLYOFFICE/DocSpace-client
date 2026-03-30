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

import { headers, cookies } from "next/headers";

import FilesFilter from "@docspace/shared/api/files/filter";
import { FilterType, FolderType } from "@docspace/shared/enums";

import { getFilesSettings } from "@/api/files";
import { getFormsFolder } from "@/api/forms";
import { getSelf } from "@/api/people";
import { getDefaultProvider } from "@/api/ai";
import { getSettings } from "@/api/settings";
import {
  LIBRARY_ID_HEADER,
  ROOM_ID_HEADER,
  PATHNAME_HEADER,
} from "@/utils/constants";

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
      }}
    >
      {children}
    </FormsShell>
  );
}
