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
import { useFormsProgressStore } from "../_store/FormsProgressStore";
import type { FormsDataApi } from "../_context/FormsDataContext";

const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024;
const DEFAULT_UPLOAD_THREADS = 3;

export default function useFolderActions(
  externalFetchSection?: FormsDataApi["fetchSection"],
  externalRefreshAfterMutation?: FormsDataApi["refreshAfterMutation"],
) {
  const { t } = useTranslation(["Common"]);
  const formsSettingsStore = useFormsSettingsStore();
  const progressStore = useFormsProgressStore();
  const pathname = usePathname();
  const activeSection = sectionFromPathname(pathname);
  const fetchSection = externalFetchSection!;
  const refreshAfterMutation = externalRefreshAfterMutation ?? fetchSection;
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (inputRef.current) {
        inputRef.current.remove();
        inputRef.current = null;
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

      if (progressStore.isBusy) {
        return;
      }

      const chunkSize =
        formsSettingsStore.filesSettings?.chunkUploadSize ?? DEFAULT_CHUNK_SIZE;
      const maxThreads =
        formsSettingsStore.filesSettings?.maxUploadThreadCount ??
        DEFAULT_UPLOAD_THREADS;

      const fileArray = Array.from(files);
      const totalBytes = fileArray.reduce((sum, f) => sum + f.size, 0);
      let uploadedBytes = 0;

      progressStore.start("upload");

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
              progressStore.update(percent);
            },
          );

          await finalizeUploadSession(folderId, session.id);
        });

        progressStore.finish();
        await refreshAfterMutation(activeSection);
      } catch (error) {
        progressStore.error();
        toastr.error(error as string);
        throw error;
      }
    },
    [
      getFolderId,
      formsSettingsStore,
      refreshAfterMutation,
      activeSection,
      progressStore,
      t,
    ],
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
    onCreateBlankForm,
    isCreateFormDialogVisible,
    isCreatingForm,
    onCloseCreateFormDialog,
    onSaveCreateForm,
  };
}
