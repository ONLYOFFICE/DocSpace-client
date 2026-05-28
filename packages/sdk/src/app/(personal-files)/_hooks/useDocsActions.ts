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

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import {
  createFolder,
  startUploadSession,
  uploadChunkParallel,
  finalizeUploadSession,
  checkIsFileExist,
} from "@docspace/shared/api/files";
import { ConflictResolveType } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import { createChunks, runWithConcurrency } from "@docspace/ui-kit/uploader";

import { useTranslation } from "react-i18next";

import { useNavigationStore } from "@/app/(docspace)/_store/NavigationStore";
import { useFilesSettingsStore } from "@/app/(docspace)/_store/FilesSettingsStore";
import { useUploadStore } from "@/app/(docspace)/_store/UploadStore";
import { useSDKConfig } from "@/providers/SDKConfigProvider";

import type { CreateFileDialogType } from "../_components/create-file-dialog";

const getDefaultFileName = (
  type: CreateFileDialogType,
  t: (key: string) => string,
): string => {
  switch (type) {
    case "docx":
      return t("Common:NewDocument");
    case "xlsx":
      return t("Common:NewSpreadsheet");
    case "pptx":
      return t("Common:NewPresentation");
    case "pdf":
      return t("Common:NewPDFForm");
    case "folder":
      return t("Common:NewFolder");
  }
};

const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024;
const DEFAULT_UPLOAD_THREADS = 3;

type UseDocsActionsOptions = {
  /**
   * Base path for the editor route, used to build the create-file URL.
   * Defaults to "/personal-files/editor". When provided (e.g., "/editor" for
   * rooms), the current pathname is appended as a `returnTo` query parameter.
   */
  editorBasePath?: string;
};

export default function useDocsActions(options?: UseDocsActionsOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const navigationStore = useNavigationStore();
  const { filesSettings } = useFilesSettingsStore();
  const uploadStore = useUploadStore();
  const { sdkConfig } = useSDKConfig();
  const { t } = useTranslation(["Common"]);

  const editorBasePath = options?.editorBasePath;

  const openInSameTab =
    sdkConfig?.openEditorInSameTab ??
    filesSettings?.openEditorInSameTab ??
    true;

  const buildCreateUrl = useCallback(
    (folderId: number | string, fileTitle: string) => {
      const base = editorBasePath ?? "/personal-files/editor";
      const params = new URLSearchParams();
      params.set("parentId", String(folderId));
      params.set("fileTitle", fileTitle);
      if (editorBasePath && pathname) {
        params.set("returnTo", pathname);
      }
      return `${base}/create?${params.toString()}`;
    },
    [editorBasePath, pathname],
  );

  const navigateToCreate = useCallback(
    (folderId: number | string, fileTitle: string) => {
      const url = buildCreateUrl(folderId, fileTitle);
      if (!openInSameTab) {
        window.open(`${window.location.origin}/sdk${url}`, "_blank");
        return;
      }
      router.push(url);
    },
    [buildCreateUrl, openInSameTab, router],
  );

  const inputFilesRef = useRef<HTMLInputElement | null>(null);
  const inputFolderRef = useRef<HTMLInputElement | null>(null);

  const [uploadConflictDialogVisible, setUploadConflictDialogVisible] =
    useState(false);
  const [uploadConflictItems, setUploadConflictItems] = useState<
    { title: string; isFile: boolean }[]
  >([]);
  const pendingUploadRef = useRef<{
    files: { file: File; uniqueId: string }[];
    conflictNames: string[];
    folderId: number | string;
  } | null>(null);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState<CreateFileDialogType>("folder");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    return () => {
      if (inputFilesRef.current) {
        inputFilesRef.current.remove();
        inputFilesRef.current = null;
      }
      if (inputFolderRef.current) {
        inputFolderRef.current.remove();
        inputFolderRef.current = null;
      }
    };
  }, []);

  const getFolderId = useCallback(() => {
    return navigationStore.currentFolderId;
  }, [navigationStore]);

  const openCreateDialog = useCallback(
    (type: CreateFileDialogType) => {
      const folderId = getFolderId();
      if (!folderId) return;

      if (filesSettings?.keepNewFileName) {
        const name = getDefaultFileName(type, t);
        if (type === "folder") {
          setIsCreating(true);
          createFolder(folderId, name)
            .then(() => router.refresh())
            .catch((error: unknown) => {
              toastr.error(
                error instanceof Error ? error.message : String(error),
              );
            })
            .finally(() => setIsCreating(false));
        } else {
          navigateToCreate(folderId, `${name}.${type}`);
        }
        return;
      }

      setDialogType(type);
      setDialogVisible(true);
    },
    [getFolderId, t, filesSettings?.keepNewFileName, router, navigateToCreate],
  );

  const closeCreateDialog = useCallback(() => {
    setDialogVisible(false);
  }, []);

  const onSaveCreate = useCallback(
    async (name: string) => {
      const folderId = getFolderId();
      if (!folderId) return;

      if (dialogType !== "folder") {
        setDialogVisible(false);
        navigateToCreate(folderId, `${name}.${dialogType}`);
        return;
      }

      setIsCreating(true);
      try {
        await createFolder(folderId, name);
        setDialogVisible(false);
        router.refresh();
      } catch (error) {
        toastr.error(error instanceof Error ? error.message : String(error));
      } finally {
        setIsCreating(false);
      }
    },
    [getFolderId, dialogType, router, navigateToCreate],
  );

  const doUpload = useCallback(
    async (
      taggedFiles: { file: File; uniqueId: string }[],
      folderId: number | string,
      createNewIfExist: boolean,
    ) => {
      const chunkSize = filesSettings?.chunkUploadSize ?? DEFAULT_CHUNK_SIZE;
      const maxThreads =
        filesSettings?.maxUploadThreadCount ?? DEFAULT_UPLOAD_THREADS;

      uploadStore.startBatch(
        taggedFiles.map(({ file, uniqueId }) => ({
          uniqueId,
          fileName: file.name,
          fileSize: file.size,
          folderId,
        })),
      );

      let anySuccess = false;

      await runWithConcurrency(taggedFiles, 2, async ({ file, uniqueId }) => {
        const item = uploadStore.items.find((i) => i.uniqueId === uniqueId);
        if (!item) return;
        const signal = item.abortController.signal;

        if (signal.aborted) {
          uploadStore.setItemCancelled(uniqueId);
          return;
        }

        try {
          const session = await startUploadSession(
            folderId,
            file.name,
            file.size,
            "",
            false,
            new Date(file.lastModified),
            createNewIfExist,
          );

          if (signal.aborted) {
            uploadStore.setItemCancelled(uniqueId);
            return;
          }

          const chunks = createChunks(file, chunkSize);
          let uploadedChunks = 0;

          await runWithConcurrency(chunks, maxThreads, async (chunk) => {
            if (signal.aborted) return;

            await uploadChunkParallel(
              folderId,
              session.id,
              chunk.index,
              chunk.data,
            );

            if (signal.aborted) return;

            uploadedChunks += 1;
            uploadStore.addUploadedBytes(chunk.size);
            uploadStore.updateItemProgress(
              uniqueId,
              Math.round((uploadedChunks / chunks.length) * 100),
            );
          });

          if (signal.aborted) {
            uploadStore.setItemCancelled(uniqueId);
            return;
          }

          await finalizeUploadSession(folderId, session.id);
          uploadStore.setItemUploaded(uniqueId);
          anySuccess = true;
        } catch (error) {
          if (signal.aborted) {
            uploadStore.setItemCancelled(uniqueId);
            return;
          }
          const message =
            error instanceof Error ? error.message : String(error);
          uploadStore.setItemError(uniqueId, message);
        }
      });

      if (anySuccess) {
        const successCount = uploadStore.items.filter(
          (i) => i.status === "uploaded",
        ).length;
        toastr.success(
          t("Common:ItemsSuccessfullyUploaded", { count: successCount }),
        );
        router.refresh();
      }
    },
    [filesSettings, router, uploadStore, t],
  );

  const uploadFilesToFolder = useCallback(
    async (files: FileList | File[]) => {
      const folderId = getFolderId();
      if (!folderId) return;

      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      const taggedFiles = fileArray.map((file) => ({
        file,
        uniqueId:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      }));

      try {
        const fileNames = taggedFiles.map((f) => f.file.name);
        const conflictNames = (await checkIsFileExist(
          folderId as number,
          fileNames,
        )) as string[];

        if (conflictNames.length > 0) {
          pendingUploadRef.current = {
            files: taggedFiles,
            conflictNames,
            folderId,
          };
          setUploadConflictItems(
            conflictNames.map((name) => ({ title: name, isFile: true })),
          );
          setUploadConflictDialogVisible(true);
          return;
        }
      } catch {
        // If conflict check fails, proceed with upload (createNewIfExist=true as safe default)
      }

      await doUpload(taggedFiles, folderId, true);
    },
    [getFolderId, doUpload],
  );

  const confirmUploadConflict = useCallback(
    async (resolveType: ConflictResolveType) => {
      const pending = pendingUploadRef.current;
      if (!pending) return;

      setUploadConflictDialogVisible(false);
      pendingUploadRef.current = null;

      if (resolveType === ConflictResolveType.Skip) {
        setUploadConflictItems([]);
        return;
      }

      setUploadConflictItems([]);
      const createNewIfExist = resolveType === ConflictResolveType.Duplicate;
      await doUpload(pending.files, pending.folderId, createNewIfExist);
    },
    [doUpload],
  );

  const closeUploadConflictDialog = useCallback(() => {
    setUploadConflictDialogVisible(false);
    setUploadConflictItems([]);
    pendingUploadRef.current = null;
  }, []);

  const onUploadFiles = useCallback(() => {
    if (!inputFilesRef.current) {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.style.display = "none";
      document.body.appendChild(input);
      inputFilesRef.current = input;
    }

    const input = inputFilesRef.current;

    input.onchange = () => {
      if (input.files?.length) {
        uploadFilesToFolder(input.files);
      }
      input.value = "";
    };

    input.click();
  }, [uploadFilesToFolder]);

  const onUploadFolder = useCallback(() => {
    if (!inputFolderRef.current) {
      const input = document.createElement("input");
      input.type = "file";
      input.setAttribute("webkitdirectory", "");
      input.setAttribute("mozdirectory", "");
      input.style.display = "none";
      document.body.appendChild(input);
      inputFolderRef.current = input;
    }

    const input = inputFolderRef.current;

    input.onchange = () => {
      if (input.files?.length) {
        uploadFilesToFolder(input.files);
      }
      input.value = "";
    };

    input.click();
  }, [uploadFilesToFolder]);

  return {
    openCreateDialog,
    closeCreateDialog,
    onSaveCreate,
    dialogVisible,
    dialogType,
    isCreating,
    onUploadFiles,
    onUploadFolder,
    uploadFilesToFolder,
    uploadConflictDialogVisible,
    uploadConflictItems,
    confirmUploadConflict,
    closeUploadConflictDialog,
  };
}

export type DocsActions = ReturnType<typeof useDocsActions>;
