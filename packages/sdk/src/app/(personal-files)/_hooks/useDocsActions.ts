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

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createFolder,
  startUploadSession,
  uploadChunkParallel,
  finalizeUploadSession,
} from "@docspace/shared/api/files";
import { toastr } from "@docspace/ui-kit/components/toast";
import { createChunks, runWithConcurrency } from "@docspace/ui-kit/uploader";

import { useTranslation } from "react-i18next";

import { useNavigationStore } from "@/app/(docspace)/_store/NavigationStore";
import { useFilesSettingsStore } from "@/app/(docspace)/_store/FilesSettingsStore";

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

export default function useDocsActions() {
  const router = useRouter();
  const navigationStore = useNavigationStore();
  const { filesSettings } = useFilesSettingsStore();
  const { t } = useTranslation(["Common"]);

  const inputFilesRef = useRef<HTMLInputElement | null>(null);
  const inputFolderRef = useRef<HTMLInputElement | null>(null);

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

      if (type !== "folder") {
        const name = getDefaultFileName(type, t);
        router.push(
          `/personal-files/editor/create?parentId=${folderId}&fileTitle=${encodeURIComponent(`${name}.${type}`)}`,
        );
        return;
      }

      if (filesSettings?.keepNewFileName) {
        const name = getDefaultFileName(type, t);
        setIsCreating(true);
        createFolder(folderId, name)
          .then(() => router.refresh())
          .catch((error: unknown) => {
            toastr.error(error instanceof Error ? error.message : String(error));
          })
          .finally(() => setIsCreating(false));
        return;
      }

      setDialogType(type);
      setDialogVisible(true);
    },
    [getFolderId, t, filesSettings?.keepNewFileName, router],
  );

  const closeCreateDialog = useCallback(() => {
    setDialogVisible(false);
  }, []);

  const onSaveCreate = useCallback(
    async (name: string) => {
      const folderId = getFolderId();
      if (!folderId) return;

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
    [getFolderId, router],
  );

  const uploadFilesToFolder = useCallback(
    async (files: FileList | File[]) => {
      const folderId = getFolderId();
      if (!folderId) return;

      const chunkSize =
        filesSettings?.chunkUploadSize ?? DEFAULT_CHUNK_SIZE;
      const maxThreads =
        filesSettings?.maxUploadThreadCount ?? DEFAULT_UPLOAD_THREADS;

      const fileArray = Array.from(files);

      try {
        await runWithConcurrency(fileArray, 2, async (file: File) => {
          const session = await startUploadSession(
            folderId,
            file.name,
            file.size,
            "",
            false,
            new Date(file.lastModified),
            true,
          );

          const chunks = createChunks(file, chunkSize);

          await runWithConcurrency(
            chunks,
            maxThreads,
            async (chunk: { index: number; data: FormData; size: number }) => {
              await uploadChunkParallel(
                folderId,
                session.id,
                chunk.index,
                chunk.data,
              );
            },
          );

          await finalizeUploadSession(folderId, session.id);
        });

        router.refresh();
      } catch (error) {
        toastr.error(error instanceof Error ? error.message : String(error));
      }
    },
    [getFolderId, filesSettings, router],
  );

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
  };
}
