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
import { useTranslation } from "react-i18next";

import {
  createFile,
  finalizeUploadSession,
  startUploadSession,
  uploadChunkParallel,
} from "@docspace/shared/api/files";
import { toastr } from "@docspace/ui-kit/components/toast";
import { createChunks, runWithConcurrency } from "@docspace/ui-kit/uploader";
import { usePathname } from "next/navigation";

import { FormsSection } from "@/types/forms";
import { sectionFromPathname } from "../_utils/sectionFromPathname";
import { useFormsSettingsStore } from "../_store/FormsSettingsStore";
import type { FormsDataApi } from "../_context/FormsDataContext";

const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024;
const DEFAULT_UPLOAD_THREADS = 3;
const COMPLETED_HIDE_DELAY = 2000;
const ALERT_HIDE_DELAY = 3000;

export type UploadProgress = {
  percent: number;
  completed: boolean;
  alert: boolean;
};

export default function useFolderActions(
  externalFetchSection?: FormsDataApi["fetchSection"],
  externalRefreshAfterMutation?: FormsDataApi["refreshAfterMutation"],
) {
  const { t } = useTranslation(["Common"]);
  const formsSettingsStore = useFormsSettingsStore();
  const pathname = usePathname();
  const activeSection = sectionFromPathname(pathname);
  const fetchSection = externalFetchSection!;
  const refreshAfterMutation = externalRefreshAfterMutation ?? fetchSection;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null,
  );
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (inputRef.current) {
        inputRef.current.remove();
        inputRef.current = null;
      }
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const getFolderId = useCallback(() => {
    switch (activeSection) {
      case FormsSection.MyForms:
        return formsSettingsStore.roomId;
      case FormsSection.InProgress:
      case FormsSection.CompletedForms:
        return "";
      default:
        return formsSettingsStore.roomId;
    }
  }, [activeSection, formsSettingsStore]);

  const uploadFilesToFolder = useCallback(
    async (files: FileList | File[]) => {
      const folderId = getFolderId();
      if (!folderId) return;

      const chunkSize =
        formsSettingsStore.filesSettings?.chunkUploadSize ?? DEFAULT_CHUNK_SIZE;
      const maxThreads =
        formsSettingsStore.filesSettings?.maxUploadThreadCount ??
        DEFAULT_UPLOAD_THREADS;

      const fileArray = Array.from(files);
      const totalBytes = fileArray.reduce((sum, f) => sum + f.size, 0);
      let uploadedBytes = 0;

      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }

      setUploadProgress({ percent: 0, completed: false, alert: false });

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

              uploadedBytes += chunk.size;
              const percent =
                totalBytes > 0
                  ? Math.round((uploadedBytes / totalBytes) * 100)
                  : 100;
              setUploadProgress({
                percent,
                completed: false,
                alert: false,
              });
            },
          );

          await finalizeUploadSession(folderId, session.id);
        });

        setUploadProgress({ percent: 100, completed: true, alert: false });
        hideTimerRef.current = setTimeout(() => {
          setUploadProgress(null);
        }, COMPLETED_HIDE_DELAY);

        await refreshAfterMutation(activeSection);
      } catch (error) {
        setUploadProgress({ percent: 100, completed: false, alert: true });
        hideTimerRef.current = setTimeout(() => {
          setUploadProgress(null);
        }, ALERT_HIDE_DELAY);

        toastr.error(error as string);
        throw error;
      }
    },
    [getFolderId, formsSettingsStore, refreshAfterMutation, activeSection, t],
  );

  const onUploadFiles = useCallback(() => {
    if (!inputRef.current) {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.accept = ".pdf";
      input.style.display = "none";
      document.body.appendChild(input);
      inputRef.current = input;
    }

    const input = inputRef.current;

    input.onchange = () => {
      if (input.files?.length) {
        uploadFilesToFolder(input.files).catch(() => {});
      }
      input.value = "";
    };

    input.click();
  }, [uploadFilesToFolder]);

  const [isCreateFormDialogVisible, setIsCreateFormDialogVisible] =
    useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);

  const onCreateBlankForm = useCallback(() => {
    setIsCreateFormDialogVisible(true);
  }, []);

  const onCloseCreateFormDialog = useCallback(() => {
    setIsCreateFormDialogVisible(false);
  }, []);

  const onSaveCreateForm = useCallback(
    async (name: string) => {
      const folderId = getFolderId();
      if (!folderId) return;

      setIsCreatingForm(true);
      try {
        await createFile(+folderId, `${name}.pdf`);
        setIsCreateFormDialogVisible(false);
        await refreshAfterMutation(activeSection);
      } catch (error) {
        toastr.error(error as string);
      } finally {
        setIsCreatingForm(false);
      }
    },
    [getFolderId, refreshAfterMutation, activeSection, t],
  );

  return {
    onUploadFiles,
    uploadFilesToFolder,
    uploadProgress,
    onCreateBlankForm,
    isCreateFormDialogVisible,
    isCreatingForm,
    onCloseCreateFormDialog,
    onSaveCreateForm,
  };
}
