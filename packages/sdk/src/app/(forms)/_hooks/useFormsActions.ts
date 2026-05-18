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

import { useCallback, useRef } from "react";

import {
  deleteFile,
  deleteFolder as deleteFolderApi,
  downloadFiles,
  getProgress,
  formRoleMapping,
  manageFormFilling,
} from "@docspace/shared/api/files";
import { FormFillingManageAction } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";
import { frameCallEvent } from "@docspace/shared/utils/common";
import { isFolder } from "@docspace/shared/utils/typeGuards";
import { XlsxUpdateService } from "@docspace/shared/services/xlsx-update.service";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import type { TTranslation } from "@docspace/shared/types";

import type { EditorAction } from "../_store/FormsNavigationStore";

import { useSDKConfig } from "@/providers/SDKConfigProvider";

import { useFormsAiAgentStore } from "../_store/FormsAiAgentStore";
import { useFormsListStore } from "../_store/FormsListStore";
import { useFormsNavigationStore } from "../_store/FormsNavigationStore";
import { useFormsDeleteDialogStore } from "../_store/FormsDeleteDialogStore";
import { useFormsProgressStore } from "../_store/FormsProgressStore";
import { useFormsStopFillingDialogStore } from "../_store/FormsStopFillingDialogStore";
import { useFormsDataContext } from "../_context/FormsDataContext";

type UseFormsActionsProps = { t: TTranslation };

export default function useFormsActions({ t }: UseFormsActionsProps) {
  const { sdkConfig } = useSDKConfig();
  const { openEditor } = useFormsNavigationStore();
  const { closePanel } = useFormsAiAgentStore();
  const formsListStore = useFormsListStore();
  const deleteDialogStore = useFormsDeleteDialogStore();
  const progressStore = useFormsProgressStore();
  const stopFillingDialogStore = useFormsStopFillingDialogStore();
  const { fetchSection } = useFormsDataContext();

  const openForm = useCallback(
    (file: TFile, action: EditorAction = "edit") => {
      if (sdkConfig?.events?.onFileManagerClick) {
        frameCallEvent({
          event: "onFileManagerClick",
          data: file,
        });
        return;
      }

      closePanel();
      openEditor(file, action);
    },
    [sdkConfig?.events?.onFileManagerClick, closePanel, openEditor],
  );

  const downloadFile = useCallback(
    (fileId: number) => {
      const url = `/filehandler.ashx?action=download&fileid=${fileId}`;
      window.open(url, "_blank");
    },
    [],
  );

  const deleteFromList = useCallback(
    (fileId: number) => {
      deleteDialogStore.open({
        kind: "file",
        onConfirm: async () => {
          try {
            await deleteFile(fileId, false, true);
            const newItems = formsListStore.items.filter(
              (f) => f.id !== fileId,
            );
            formsListStore.setItems(newItems, newItems.length);
          } catch (error) {
            toastr.error(error as string);
          }
        },
      });
    },
    [formsListStore, deleteDialogStore],
  );

  const downloadAbortRef = useRef<AbortController | null>(null);

  const downloadFolder = useCallback(
    async (folderId: number) => {
      downloadAbortRef.current?.abort();
      const controller = new AbortController();
      downloadAbortRef.current = controller;

      try {
        const ops = await downloadFiles([], [folderId], "");
        const opId = ops[0]?.id;
        if (!opId) return;

        const poll = async (): Promise<string | null> => {
          for (let i = 0; i < 60; i++) {
            if (controller.signal.aborted) return null;
            const progress = await getProgress(opId);
            const op = progress[0];
            if (controller.signal.aborted) return null;
            if (op?.error) throw new Error(op.error);
            if (op?.finished && op?.url) return op.url;
            await new Promise((r) => setTimeout(r, 1000));
          }
          return null;
        };

        const url = await poll();
        if (url && !controller.signal.aborted) window.open(url, "_blank");
      } catch (error) {
        if (!controller.signal.aborted) {
          toastr.error(error as string);
        }
      }
    },
    [t],
  );

  const deleteFolderFromList = useCallback(
    (folderId: number) => {
      deleteDialogStore.open({
        kind: "folder",
        onConfirm: async () => {
          try {
            await deleteFolderApi(folderId, false, true);
            const newFolders = formsListStore.folders.filter(
              (f) => f.id !== folderId,
            );
            formsListStore.setFolders(newFolders);
          } catch (error) {
            toastr.error(error as string);
          }
        },
      });
    },
    [formsListStore, deleteDialogStore],
  );

  const startFilling = useCallback(
    async (file: TFile) => {
      try {
        await manageFormFilling(file.id, FormFillingManageAction.Start);
        toastr.success(t("Common:ReadyToFillOut"));
        await fetchSection();
      } catch (error) {
        toastr.error(error as string);
      }
    },
    [t, fetchSection],
  );

  const resetFilling = useCallback(
    async (file: TFile) => {
      try {
        await formRoleMapping({ formId: file.id, roles: [] });
        await fetchSection();
      } catch (error) {
        toastr.error(error as string);
      }
    },
    [t, fetchSection],
  );

  const stopFilling = useCallback(
    (file: TFile) => {
      stopFillingDialogStore.open({
        formId: file.id,
        onConfirm: async () => {
          try {
            await manageFormFilling(file.id, FormFillingManageAction.Stop);
            await fetchSection();
          } catch (error) {
            toastr.error(error as string);
          }
        },
      });
    },
    [stopFillingDialogStore, fetchSection],
  );

  const syncXlsxData = useCallback(
    async (item: TFile | TFolder) => {
      if (progressStore.isBusy) return;

      let progressStarted = false;
      try {
        const response = await XlsxUpdateService.start(
          item.id,
          isFolder(item),
        );
        if (!response) return;

        const { form, task, isNewFile } = response;

        if (task.isCompleted) {
          XlsxUpdateService.assertTaskSucceeded(task);
        } else {
          progressStore.start("other");
          progressStarted = true;
          await XlsxUpdateService.poll(form.id, task.id, (progress) => {
            progressStore.update(progress?.percentage ?? 0);
          });
          progressStore.finish();
        }

        const messageVar = { formName: form.title };
        toastr.success(
          isNewFile
            ? t("Common:SpreadsheetGenerated", messageVar)
            : t("Common:SpreadsheetUpdated", messageVar),
        );
      } catch (error) {
        if (progressStarted) progressStore.error();
        toastr.error(error as string);
        console.error(error);
      }
    },
    [t, progressStore],
  );

  return {
    openForm,
    downloadFile,
    downloadFolder,
    deleteFromList,
    deleteFolderFromList,
    startFilling,
    resetFilling,
    stopFilling,
    syncXlsxData,
  };
}
