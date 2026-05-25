// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import React from "react";

import { toastr } from "@docspace/ui-kit/components/toast";
import { useTranslation } from "react-i18next";

import { useAgentDialogsStore } from "../_store";

// Shared upload-actions for the Knowledge tab. Consumed by both the
// filter main-button dropdown and the empty-view CTA buttons so they
// stay in sync.
//
// `onUploadFromDocSpace` flips the `selectFileAiKnowledgeDialogVisible`
// flag on the dialogs store — the actual <FilesSelector> dialog (and the
// `copyToFolder` call) lives in <KnowledgeUploadSelectorDialog>.
//
// `onUploadFromDevice` is a placeholder until the chunked-upload pipeline
// is ported in. The client's flow (UploadDataStore.startUpload →
// uploadChunkParallel → finalizeUploadSession) is non-trivial to lift
// over and warrants its own pass.
export const useKnowledgeUpload = () => {
  const dialogsStore = useAgentDialogsStore();
  const { t } = useTranslation(["Common"]);

  const onUploadFromDocSpace = React.useCallback(() => {
    dialogsStore.setSelectFileAiKnowledgeDialogVisible(true);
  }, [dialogsStore]);

  const onUploadFromDevice = React.useCallback(() => {
    toastr.info(
      t("Common:UnderDevelopment", { defaultValue: "Under development" }),
    );
  }, [t]);

  return { onUploadFromDocSpace, onUploadFromDevice };
};

export default useKnowledgeUpload;
