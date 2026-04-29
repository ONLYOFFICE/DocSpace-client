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

"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  frameCallEvent,
  frameCallbackData,
  frameHandlePing,
  getFrameId,
} from "@docspace/shared/utils/common";

import { DocsSection, DOCS_SECTION_FOLDER_ALIAS } from "@/types/docs";
import FilesFilter from "@docspace/shared/api/files/filter";
import { PAGE_COUNT } from "@/utils/constants";

type UseDocsFrameBridgeParams = {
  isReady: boolean;
  uploadFilesToFolder?: (files: FileList | File[]) => Promise<void>;
};

const PERSONAL_BASE_PATH = "/personal-files";
const SETTINGS_PATH = "/personal-files/settings";

const VALID_SECTIONS: ReadonlySet<string> = new Set(
  Object.values(DocsSection),
);

const sectionFromPathnameAndFolder = (
  pathname: string,
  rootFolder: string | null,
): string | null => {
  if (pathname === SETTINGS_PATH || pathname.startsWith(`${SETTINGS_PATH}/`)) {
    return DocsSection.Settings;
  }

  if (!pathname.startsWith(PERSONAL_BASE_PATH)) return null;

  switch (rootFolder) {
    case "@my":
      return DocsSection.MyDocuments;
    case "@favorites":
      return DocsSection.Favorites;
    case "@recent":
      return DocsSection.Recent;
    case "@trash":
      return DocsSection.Trash;
    default:
      return null;
  }
};

const sectionToUrl = (section: string): string => {
  if (section === DocsSection.Settings) {
    return SETTINGS_PATH;
  }

  const folderAlias =
    DOCS_SECTION_FOLDER_ALIAS[section as DocsSection] ?? "@my";
  const filter = FilesFilter.getDefault();
  filter.folder = folderAlias;
  filter.pageCount = PAGE_COUNT;

  return `${PERSONAL_BASE_PATH}?${filter.toUrlParams()}`;
};

/**
 * Wires the personal-files app to the sdk-js host via postMessage.
 *
 * - Fires `onAppReady` once when initialization completes.
 * - Fires `onNavigate` on section changes.
 * - Listens for host-side `navigateSection` method calls and for binary
 *   `uploadFileData` payloads (mirrors the Forms mode bridge).
 */
export const useDocsFrameBridge = ({
  isReady,
  uploadFilesToFolder,
}: UseDocsFrameBridgeParams) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rootFolder = searchParams.get("folder");
  const activeSection = sectionFromPathnameAndFolder(pathname, rootFolder);

  const appReadySent = React.useRef(false);
  React.useEffect(() => {
    if (isReady && !appReadySent.current) {
      appReadySent.current = true;
      frameCallEvent({ event: "onAppReady", data: { frameId: getFrameId() } });
    }
  }, [isReady]);

  const prevSection = React.useRef<string | null>(activeSection);
  React.useEffect(() => {
    if (prevSection.current !== activeSection && activeSection) {
      prevSection.current = activeSection;
      frameCallEvent({
        event: "onNavigate",
        data: { section: activeSection },
      });
    }
  }, [activeSection]);

  const uploadRef = React.useRef(uploadFilesToFolder);
  React.useEffect(() => {
    uploadRef.current = uploadFilesToFolder;
  }, [uploadFilesToFolder]);

  React.useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (window.self === window.parent || e.source !== window.parent) return;

      let eventData: Record<string, unknown> | undefined;
      try {
        eventData =
          typeof e.data === "string"
            ? JSON.parse(e.data)
            : (e.data as Record<string, unknown>);
      } catch {
        return;
      }

      if (!eventData) return;
      if (frameHandlePing(eventData as Record<string, unknown>)) return;

      if (
        eventData?.type === "uploadFileData" &&
        eventData?.buffer instanceof ArrayBuffer &&
        uploadRef.current
      ) {
        const fileName = eventData.fileName as string;
        const uploadId = eventData.uploadId as number | undefined;
        const lastModified = eventData.lastModified as number | undefined;

        const file = new File([eventData.buffer], fileName, {
          lastModified,
        });

        uploadRef
          .current([file])
          .then(() => {
            frameCallEvent({
              event: "onUploadSuccess",
              data: {
                fileName,
                fileSize: file.size,
                ...(uploadId !== undefined && { uploadId }),
              },
            });
          })
          .catch((error: unknown) => {
            frameCallEvent({
              event: "onUploadError",
              data: {
                fileName,
                message:
                  error instanceof Error ? error.message : String(error),
                ...(uploadId !== undefined && { uploadId }),
              },
            });
          });
        return;
      }

      const dataEnvelope = eventData?.data as
        | Record<string, unknown>
        | undefined;
      const methodName = dataEnvelope?.methodName as string | undefined;
      const callId = dataEnvelope?.callId as number | undefined;
      const payload = dataEnvelope?.data as Record<string, unknown> | undefined;

      if (methodName === "navigateSection") {
        const section = payload?.section as string | undefined;
        if (section && VALID_SECTIONS.has(section)) {
          router.replace(sectionToUrl(section));
          frameCallbackData({ section }, callId);
        } else {
          frameCallbackData(
            { error: `Unknown section: ${String(section)}` },
            callId,
          );
        }
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [router]);
};
