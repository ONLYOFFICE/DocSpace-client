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

import React from "react";
import { useTranslation, Trans } from "react-i18next";
import { TFunction } from "i18next";

import { toastr } from "@docspace/ui-kit/components/toast";
import { Text } from "@docspace/ui-kit/components/text";
import { Link, LinkTarget } from "@docspace/ui-kit/components/link";
import { createChunks, runWithConcurrency } from "@docspace/ui-kit/uploader";
import {
  getSettingsFiles,
  startUploadSession,
  uploadChunkParallel,
  finalizeUploadSession,
} from "@docspace/shared/api/files";

const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024;
const DEFAULT_UPLOAD_THREADS = 3;

export type UploadProgress = {
  isUploading: boolean;
  percent: number;
  completed: boolean;
  alert: boolean;
};

const INITIAL_PROGRESS: UploadProgress = {
  isUploading: false,
  percent: 0,
  completed: false,
  alert: false,
};

const showSuccessToast = (
  t: TFunction,
  uploaded: number,
  title: string,
  folderName: string,
  onOpenFiles: () => void,
) => {
  const components = {
    1: (
      <Link
        tag="a"
        onClick={onOpenFiles}
        target={LinkTarget.self}
        color="accent"
      />
    ),
    2: <Text as="span" fontWeight={600} />,
  };

  const toastMessage =
    uploaded === 1 ? (
      <Trans
        t={t}
        ns="Common"
        i18nKey="Common:FileSuccessfullyUploadedToFolder"
        values={{ title, qty: uploaded, folderName }}
        components={components}
      />
    ) : (
      <Trans
        t={t}
        ns="Common"
        i18nKey="Common:FilesSuccessfullyUploadedToFolder"
        values={{ title, qty: uploaded, folderName }}
        components={components}
      />
    );

  toastr.success(toastMessage);
};

export const useUploadToMyDocuments = (
  folderId: number | null,
  onOpenFiles: () => void,
) => {
  const { t } = useTranslation(["Common"]);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const [progress, setProgress] =
    React.useState<UploadProgress>(INITIAL_PROGRESS);

  const clearProgress = React.useCallback(() => {
    setProgress(INITIAL_PROGRESS);
  }, []);

  const uploadFiles = React.useCallback(
    async (files: FileList | File[]) => {
      if (!folderId) return;

      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      let chunkSize = DEFAULT_CHUNK_SIZE;
      let maxThreads = DEFAULT_UPLOAD_THREADS;
      try {
        const settings = await getSettingsFiles();
        chunkSize = settings?.chunkUploadSize ?? DEFAULT_CHUNK_SIZE;
        maxThreads = settings?.maxUploadThreadCount ?? DEFAULT_UPLOAD_THREADS;
      } catch (err) {
        console.error("Failed to load files settings, using defaults", err);
      }

      const totalBytes = fileArray.reduce(
        (sum, file) => sum + Math.max(1, file.size),
        0,
      );
      let uploadedBytes = 0;
      let uploaded = 0;
      let failed = 0;
      const firstFileName = fileArray[0]?.name ?? "";

      setProgress({
        isUploading: true,
        percent: 0,
        completed: false,
        alert: false,
      });

      await runWithConcurrency(fileArray, 2, async (file) => {
        try {
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

          await runWithConcurrency(chunks, maxThreads, async (chunk) => {
            await uploadChunkParallel(
              folderId,
              session.id,
              chunk.index,
              chunk.data,
            );

            uploadedBytes += Math.max(1, chunk.size);
            const percent = Math.min(
              99,
              Math.round((uploadedBytes / totalBytes) * 100),
            );
            setProgress((prev) => ({ ...prev, percent }));
          });

          await finalizeUploadSession(folderId, session.id);
          uploaded += 1;
        } catch (err) {
          console.error(`Failed to upload "${file.name}"`, err);
          failed += 1;
        }
      });

      setProgress({
        isUploading: true,
        percent: 100,
        completed: failed === 0,
        alert: failed > 0,
      });

      if (uploaded > 0) {
        showSuccessToast(
          t as TFunction,
          uploaded,
          firstFileName,
          t("Common:Files"),
          onOpenFiles,
        );
      }
      if (failed > 0) {
        toastr.error(t("Common:ErrorUploadingFiles", { count: failed }));
      }
    },
    [folderId, t, onOpenFiles],
  );

  const openUploadDialog = React.useCallback(() => {
    if (!folderId) return;

    if (!inputRef.current) {
      const input = document.createElement("input");
      input.type = "file";
      input.multiple = true;
      input.style.display = "none";
      document.body.appendChild(input);
      inputRef.current = input;
    }

    const input = inputRef.current;

    input.onchange = () => {
      if (input.files?.length) {
        void uploadFiles(input.files);
      }
      input.value = "";
    };

    input.click();
  }, [folderId, uploadFiles]);

  React.useEffect(() => {
    return () => {
      if (inputRef.current) {
        inputRef.current.remove();
        inputRef.current = null;
      }
    };
  }, []);

  return { openUploadDialog, progress, clearProgress };
};

export default useUploadToMyDocuments;

