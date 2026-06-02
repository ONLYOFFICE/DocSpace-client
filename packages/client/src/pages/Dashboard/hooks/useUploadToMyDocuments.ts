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
import { useTranslation } from "react-i18next";

import { toastr } from "@docspace/ui-kit/components/toast";
import { createChunks, runWithConcurrency } from "@docspace/ui-kit/uploader";
import {
  getSettingsFiles,
  startUploadSession,
  uploadChunkParallel,
  finalizeUploadSession,
} from "@docspace/shared/api/files";

// Opens a native file picker and uploads the selected files to the user's
// "My documents" folder. Mirrors the chunked-upload pipeline used by the SDK
// (a `startUploadSession` per file, parallel `uploadChunkParallel` calls gated
// by `maxUploadThreadCount`, then `finalizeUploadSession`).
//
// The new Dashboard has no floating upload panel, so progress is surfaced via
// toasts instead of the legacy UploadPanel.
const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024;
const DEFAULT_UPLOAD_THREADS = 3;

export const useUploadToMyDocuments = (folderId: number | null) => {
  const { t } = useTranslation(["Common"]);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

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

      let uploaded = 0;
      let failed = 0;

      // Per-file concurrency is kept low (2) — the inner chunks already
      // saturate the network up to `maxUploadThreadCount`.
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
          });

          await finalizeUploadSession(folderId, session.id);
          uploaded += 1;
        } catch (err) {
          console.error(`Failed to upload "${file.name}"`, err);
          failed += 1;
        }
      });

      if (uploaded > 0) {
        toastr.success(
          t("Common:ItemsSuccessfullyUploaded", { count: uploaded }),
        );
      }
      if (failed > 0) {
        toastr.error(t("Common:ErrorUploadingFiles", { count: failed }));
      }
    },
    [folderId, t],
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

  return { openUploadDialog };
};

export default useUploadToMyDocuments;

