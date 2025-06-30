import { useCallback } from "react";

import { TFile } from "@docspace/shared/api/files/types";

import { AVAILABLE_CONTEXT_ITEMS } from "../_enums/context-items";

export default function useItemContextMenu() {
  const getFilesContextMenu = useCallback((file: TFile) => {
    const model = new Set([
      AVAILABLE_CONTEXT_ITEMS.select,
      AVAILABLE_CONTEXT_ITEMS.fillForm,
      AVAILABLE_CONTEXT_ITEMS.edit,
      AVAILABLE_CONTEXT_ITEMS.editPDF,
      AVAILABLE_CONTEXT_ITEMS.preview,
      AVAILABLE_CONTEXT_ITEMS.openPDF,
      AVAILABLE_CONTEXT_ITEMS.view,
      AVAILABLE_CONTEXT_ITEMS.pdfView,
      AVAILABLE_CONTEXT_ITEMS.copyLink,
      AVAILABLE_CONTEXT_ITEMS.download,
      AVAILABLE_CONTEXT_ITEMS.downloadAs,
    ]);

    const isPdf = file.fileExst === ".pdf";
    const shouldFillForm = file.viewAccessibility.WebRestrictedEditing;
    const canFillForm = file.security?.FillForms;
    const canEditFile = file.security.Edit && file.viewAccessibility.WebEdit;

    const canOpenPlayer =
      file.viewAccessibility.ImageView || file.viewAccessibility.MediaView;

    if (!file.security.Download) model.delete(AVAILABLE_CONTEXT_ITEMS.download);

    if (!file.viewAccessibility.CanConvert)
      model.delete(AVAILABLE_CONTEXT_ITEMS.downloadAs);

    if (!file.viewAccessibility.WebView)
      model.delete(AVAILABLE_CONTEXT_ITEMS.preview);

    if (!isPdf || (shouldFillForm && canFillForm)) {
      model.delete(AVAILABLE_CONTEXT_ITEMS.openPDF);
    }

    if (!isPdf) model.delete(AVAILABLE_CONTEXT_ITEMS.pdfView);

    if (!canOpenPlayer) model.delete(AVAILABLE_CONTEXT_ITEMS.view);

    if (!isPdf || !file.security.EditForm || file.startFilling || !file.isForm)
      model.delete(AVAILABLE_CONTEXT_ITEMS.editPDF);

    if (!(shouldFillForm && canFillForm) || !file.isForm)
      model.delete(AVAILABLE_CONTEXT_ITEMS.fillForm);

    if (canOpenPlayer || !canEditFile) {
      model.delete(AVAILABLE_CONTEXT_ITEMS.edit);
    }

    return Array.from(model);
  }, []);

  const getFoldersContextMenu = useCallback(() => {
    return [
      AVAILABLE_CONTEXT_ITEMS.select,
      AVAILABLE_CONTEXT_ITEMS.open,
      AVAILABLE_CONTEXT_ITEMS.copyLink,
      AVAILABLE_CONTEXT_ITEMS.download,
    ];
  }, []);

  return { getFilesContextMenu, getFoldersContextMenu };
}
