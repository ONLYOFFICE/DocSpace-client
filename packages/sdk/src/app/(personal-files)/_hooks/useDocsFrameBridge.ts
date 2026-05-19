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
