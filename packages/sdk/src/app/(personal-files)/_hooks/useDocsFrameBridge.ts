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
  frameHandlePing,
  getFrameId,
} from "@docspace/shared/utils/common";
import { createFile, createFolder } from "@docspace/shared/api/files";

import { DocsSection, DOCS_SECTION_FOLDER_ALIAS } from "@/types/docs";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFrameCustomActions } from "@docspace/shared/types/Frame";
import { PAGE_COUNT } from "@/utils/constants";
import { useSdkMethods } from "@/providers/sdkMethods";
import { useSdkCustomActions } from "@/providers/SdkCustomActionsProvider";
import {
  docsSectionFromRootFolderType,
  toFrameEntity,
} from "@/utils/frameEntity";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";
import type { CreateFileDialogType } from "../_components/create-file-dialog";
import { useDocsUserStore } from "../_store/DocsUserStore";

type UseDocsFrameBridgeParams = {
  isReady: boolean;
  uploadFilesToFolder?: (files: FileList | File[]) => Promise<void>;
  openCreateDialog?: (type: CreateFileDialogType) => void;
  enabled?: boolean;
};

const CREATE_FILE_EXTENSIONS: ReadonlySet<string> = new Set([
  "docx",
  "xlsx",
  "pptx",
  "pdf",
]);

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
    case "@share":
      return DocsSection.SharedWithMe;
    case "@trash":
      return DocsSection.Trash;
    default:
      return null;
  }
};

const withAuthParam = (url: string, auth: string | null): string => {
  const [path, query = ""] = url.split("?");
  const params = new URLSearchParams(query);
  if (auth) params.set("auth", auth);
  const search = params.toString();
  return search ? `${path}?${search}` : path;
};

const sectionToUrl = (section: string, auth: string | null): string => {
  if (section === DocsSection.Settings) {
    return withAuthParam(SETTINGS_PATH, auth);
  }

  const folderAlias =
    DOCS_SECTION_FOLDER_ALIAS[section as DocsSection] ?? "@my";
  const filter = FilesFilter.getDefault();
  filter.folder = folderAlias;
  filter.pageCount = PAGE_COUNT;

  return withAuthParam(`${PERSONAL_BASE_PATH}?${filter.toUrlParams()}`, auth);
};

export const useDocsFrameBridge = ({
  isReady,
  uploadFilesToFolder,
  openCreateDialog,
  enabled = true,
}: UseDocsFrameBridgeParams) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const filesListStore = useFilesListStore();
  const { rootFolderType } = filesListStore;
  const filesSelectionStore = useFilesSelectionStore();
  const settingsStore = useSettingsStore();
  const { user } = useDocsUserStore();
  const { setCustomActions } = useSdkCustomActions();
  const auth = searchParams.get("auth");

  const rootFolder = searchParams.get("folder");
  const activeSection =
    docsSectionFromRootFolderType(rootFolderType) ??
    sectionFromPathnameAndFolder(pathname, rootFolder);

  const appReadySent = React.useRef(false);
  React.useEffect(() => {
    if (!enabled) return;
    if (isReady && !appReadySent.current) {
      appReadySent.current = true;
      frameCallEvent({ event: "onAppReady", data: { frameId: getFrameId() } });
    }
  }, [isReady, enabled]);

  const prevSection = React.useRef<string | null>(activeSection);
  React.useEffect(() => {
    if (!enabled) return;
    if (prevSection.current !== activeSection && activeSection) {
      prevSection.current = activeSection;
      frameCallEvent({
        event: "onNavigate",
        data: { section: activeSection },
      });
    }
  }, [activeSection, enabled]);

  const uploadRef = React.useRef(uploadFilesToFolder);
  React.useEffect(() => {
    uploadRef.current = uploadFilesToFolder;
  }, [uploadFilesToFolder]);

  React.useEffect(() => {
    if (!enabled) return undefined;
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

    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [enabled]);

  const currentFolderId = () => filesListStore.currentFolder?.id;

  useSdkMethods(
    enabled
      ? {
          navigateSection: (data) => {
            const section = (data as { section?: string } | undefined)?.section;
            if (!section || !VALID_SECTIONS.has(section)) {
              throw new Error(`Unknown section: ${String(section)}`);
            }
            router.replace(sectionToUrl(section, auth));
            return { section };
          },
          getFolderInfo: () => filesListStore.currentFolder,
          getFolders: () =>
            filesListStore.items.filter((item) => item.isFolder).map(toFrameEntity),
          getFiles: () =>
            filesListStore.items.filter((item) => !item.isFolder).map(toFrameEntity),
          getList: () => filesListStore.items.map(toFrameEntity),
          getSelection: () => filesSelectionStore.selection.map(toFrameEntity),
          getUserInfo: () => user,
          createFile: async (data) => {
            const { folderId, title, templateId, formId } = (data ?? {}) as {
              folderId?: number | string;
              title: string;
              templateId?: number;
              formId?: number;
            };
            const file = await createFile(
              folderId ?? currentFolderId() ?? "@my",
              title,
              templateId,
              formId,
            );
            router.refresh();
            return file;
          },
          createFolder: async (data) => {
            const { parentFolderId, title } = (data ?? {}) as {
              parentFolderId?: number | string;
              title: string;
            };
            const folder = await createFolder(
              parentFolderId ?? currentFolderId() ?? "@my",
              title.trimEnd(),
            );
            router.refresh();
            return folder;
          },
          openModal: (data) => {
            const { type, options } = (data ?? {}) as {
              type?: string;
              options?: string;
            };
            if (!openCreateDialog) throw new Error("openModal is not available here");
            if (type === "CreateFolder") {
              openCreateDialog("folder");
            } else if (type === "CreateFile") {
              const extension = String(options ?? "docx").replace(/^\./, "");
              if (!CREATE_FILE_EXTENSIONS.has(extension)) {
                throw new Error(`Unsupported file type: ${extension}`);
              }
              openCreateDialog(extension as CreateFileDialogType);
            } else {
              throw new Error(`Unsupported modal: ${String(type)}`);
            }
            return { type };
          },
          setCustomActions: (data) => {
            const config = (data ?? {}) as TFrameCustomActions;
            setCustomActions(config);
            return config;
          },
          setListView: (data) => {
            const viewType =
              typeof data === "string"
                ? data
                : (data as { viewType?: string } | undefined)?.viewType;
            if (viewType !== "row" && viewType !== "table" && viewType !== "tile") {
              throw new Error(`Unsupported view: ${String(viewType)}`);
            }
            settingsStore.setFilesViewAs(viewType);
            return { viewType };
          },
        }
      : {},
  );
};
