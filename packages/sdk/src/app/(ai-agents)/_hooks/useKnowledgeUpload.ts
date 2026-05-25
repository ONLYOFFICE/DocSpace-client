// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import React from "react";

import { toastr } from "@docspace/ui-kit/components/toast";
import {
  startUploadSession,
  uploadChunkParallel,
  finalizeUploadSession,
} from "@docspace/shared/api/files";
import { createChunks, runWithConcurrency } from "@docspace/ui-kit/uploader";

import { useUploadStore } from "@/app/(docspace)/_store/UploadStore";

import {
  useAgentDialogsStore,
  useAiRoomStore,
  useKnowledgeFilesStore,
} from "../_store";
import { useAgentsCommonData } from "../_store/AgentsCommonDataContext";

// Shared upload-actions for the Knowledge tab. Consumed by both the
// filter main-button dropdown and the empty-view CTA buttons so they
// stay in sync.
//
// `onUploadFromDocSpace` flips the `selectFileAiKnowledgeDialogVisible`
// flag on the dialogs store — the actual <FilesSelector> dialog (and the
// `copyToFolder` call) lives in <KnowledgeUploadSelectorDialog>.
//
// `onUploadFromDevice` opens a native file picker and runs the same
// chunked-upload pipeline as `(personal-files)/useDocsActions`: a single
// `startUploadSession` per file, parallel `uploadChunkParallel` calls
// gated by `maxUploadThreadCount`, then `finalizeUploadSession`. Progress
// flows through the shared `UploadStore` (FloatingButton + UploadPanel).
const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024;
const DEFAULT_UPLOAD_THREADS = 3;

export const useKnowledgeUpload = () => {
  const dialogsStore = useAgentDialogsStore();
  const aiRoomStore = useAiRoomStore();
  const knowledgeFilesStore = useKnowledgeFilesStore();
  const uploadStore = useUploadStore();
  const { filesSettings } = useAgentsCommonData();

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const onUploadFromDocSpace = React.useCallback(() => {
    dialogsStore.setSelectFileAiKnowledgeDialogVisible(true);
  }, [dialogsStore]);

  const uploadFiles = React.useCallback(
    async (files: FileList | File[]) => {
      const folderId = aiRoomStore.knowledgeId;
      if (!folderId) return;

      const chunkSize = filesSettings?.chunkUploadSize ?? DEFAULT_CHUNK_SIZE;
      const maxThreads =
        filesSettings?.maxUploadThreadCount ?? DEFAULT_UPLOAD_THREADS;

      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      const taggedFiles = fileArray.map((file) => ({
        file,
        uniqueId:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      }));

      uploadStore.startBatch(
        taggedFiles.map(({ file, uniqueId }) => ({
          uniqueId,
          fileName: file.name,
          fileSize: file.size,
          folderId,
        })),
      );
      uploadStore.setPanelVisible(true);

      let anySuccess = false;

      // Per-file concurrency is kept low (2) — the inner chunks already
      // saturate the network up to `maxUploadThreadCount`.
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
            true,
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

      // Server kicks off vectorization asynchronously and broadcasts a
      // folder-refresh socket event — re-fetch the listing locally too
      // so the new rows appear without waiting on the socket roundtrip.
      if (anySuccess) {
        void knowledgeFilesStore.fetch();
      }
    },
    [
      aiRoomStore.knowledgeId,
      filesSettings,
      knowledgeFilesStore,
      uploadStore,
    ],
  );

  const onUploadFromDevice = React.useCallback(() => {
    if (!aiRoomStore.knowledgeId) return;

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
        void uploadFiles(input.files).catch((err) => {
          toastr.error(err instanceof Error ? err.message : String(err));
        });
      }
      input.value = "";
    };

    input.click();
  }, [aiRoomStore.knowledgeId, uploadFiles]);

  React.useEffect(() => {
    return () => {
      if (inputRef.current) {
        inputRef.current.remove();
        inputRef.current = null;
      }
    };
  }, []);

  return { onUploadFromDocSpace, onUploadFromDevice };
};

export default useKnowledgeUpload;
