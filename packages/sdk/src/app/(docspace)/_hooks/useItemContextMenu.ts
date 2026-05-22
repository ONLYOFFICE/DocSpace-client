import { useCallback } from "react";

import { TFile, TFolder } from "@docspace/shared/api/files/types";

import { AVAILABLE_CONTEXT_ITEMS } from "../_enums/context-items";
import { useFilesSettingsStore } from "../_store/FilesSettingsStore";

type UseItemContextMenuProps = {
  isFavoritesSection?: boolean;
  isRecentSection?: boolean;
  isTrashSection?: boolean;
  isDocsSection?: boolean;
  isShareSection?: boolean;
};

export default function useItemContextMenu({
  isFavoritesSection = false,
  isRecentSection = false,
  isTrashSection = false,
  isDocsSection = false,
  isShareSection = false,
}: UseItemContextMenuProps = {}) {
  const { filesSettings } = useFilesSettingsStore();

  const getFilesContextMenu = useCallback((
    file: TFile,
    overrides?: { isRecentSection?: boolean; isFavoritesSection?: boolean },
  ) => {
    const effectiveIsRecentSection = overrides?.isRecentSection ?? isRecentSection;
    const effectiveIsFavoritesSection = overrides?.isFavoritesSection ?? isFavoritesSection;

    if (isShareSection) {
      const shareModel = new Set<AVAILABLE_CONTEXT_ITEMS>([
        AVAILABLE_CONTEXT_ITEMS.select,
        AVAILABLE_CONTEXT_ITEMS.fillForm,
        AVAILABLE_CONTEXT_ITEMS.edit,
        AVAILABLE_CONTEXT_ITEMS.editPDF,
        AVAILABLE_CONTEXT_ITEMS.preview,
        AVAILABLE_CONTEXT_ITEMS.openPDF,
        AVAILABLE_CONTEXT_ITEMS.view,
        AVAILABLE_CONTEXT_ITEMS.pdfView,
        AVAILABLE_CONTEXT_ITEMS.download,
        AVAILABLE_CONTEXT_ITEMS.downloadAs,
      ]);

      const isPdfFile = file.fileExst === ".pdf";
      const shouldFill = file.viewAccessibility.WebRestrictedEditing;
      const canFill = file.security?.FillForms;
      const canEdit = file.security.Edit && file.viewAccessibility.WebEdit;
      const canPlay =
        file.viewAccessibility.ImageView || file.viewAccessibility.MediaView;

      if (!file.security.Download) shareModel.delete(AVAILABLE_CONTEXT_ITEMS.download);
      if (!file.viewAccessibility.CanConvert)
        shareModel.delete(AVAILABLE_CONTEXT_ITEMS.downloadAs);
      if (!file.viewAccessibility.WebView)
        shareModel.delete(AVAILABLE_CONTEXT_ITEMS.preview);
      if (!isPdfFile || (shouldFill && canFill))
        shareModel.delete(AVAILABLE_CONTEXT_ITEMS.openPDF);
      if (!isPdfFile) shareModel.delete(AVAILABLE_CONTEXT_ITEMS.pdfView);
      if (!canPlay) shareModel.delete(AVAILABLE_CONTEXT_ITEMS.view);
      if (!isPdfFile || !file.security.EditForm || file.startFilling || !file.isForm)
        shareModel.delete(AVAILABLE_CONTEXT_ITEMS.editPDF);
      if (!(shouldFill && canFill) || !file.isForm)
        shareModel.delete(AVAILABLE_CONTEXT_ITEMS.fillForm);
      if (canPlay || !canEdit) shareModel.delete(AVAILABLE_CONTEXT_ITEMS.edit);

      if (file.security.Copy) shareModel.add(AVAILABLE_CONTEXT_ITEMS.copy);
      shareModel.add(AVAILABLE_CONTEXT_ITEMS.removeFromSharedWithMe);
      shareModel.add(AVAILABLE_CONTEXT_ITEMS.showInfo);

      return Array.from(shareModel);
    }

    const model = new Set([
      AVAILABLE_CONTEXT_ITEMS.select,
      AVAILABLE_CONTEXT_ITEMS.fillForm,
      AVAILABLE_CONTEXT_ITEMS.edit,
      AVAILABLE_CONTEXT_ITEMS.editPDF,
      AVAILABLE_CONTEXT_ITEMS.preview,
      AVAILABLE_CONTEXT_ITEMS.openPDF,
      AVAILABLE_CONTEXT_ITEMS.view,
      AVAILABLE_CONTEXT_ITEMS.pdfView,
      ...(isDocsSection ? [AVAILABLE_CONTEXT_ITEMS.copyLink] : []),
      AVAILABLE_CONTEXT_ITEMS.download,
      AVAILABLE_CONTEXT_ITEMS.downloadAs,
      ...(isDocsSection ? [AVAILABLE_CONTEXT_ITEMS.share] : []),
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

    if (!file.canShare) model.delete(AVAILABLE_CONTEXT_ITEMS.share);

    if (effectiveIsFavoritesSection || file.isFavorite) {
      model.add(AVAILABLE_CONTEXT_ITEMS.removeFromFavorites);
    } else {
      model.add(AVAILABLE_CONTEXT_ITEMS.markAsFavorite);
    }

    if (effectiveIsRecentSection) {
      model.add(AVAILABLE_CONTEXT_ITEMS.removeFromRecent);
    }

    if (isTrashSection) {
      model.add(AVAILABLE_CONTEXT_ITEMS.restore);
    } else {
      if (file.security.Rename) model.add(AVAILABLE_CONTEXT_ITEMS.rename);
      if (file.security.Copy) model.add(AVAILABLE_CONTEXT_ITEMS.copy);
      if (file.security.Duplicate) model.add(AVAILABLE_CONTEXT_ITEMS.duplicate);
      if (file.security.Move) model.add(AVAILABLE_CONTEXT_ITEMS.moveTo);
    }

    if (!isTrashSection && file.security?.ReadHistory) {
      model.add(AVAILABLE_CONTEXT_ITEMS.showVersionHistory);
    }

    if (!isTrashSection && file.security?.Lock) {
      model.add(AVAILABLE_CONTEXT_ITEMS.blockUnblockVersion);
    }

    const extsCustomFilter = filesSettings?.extsWebCustomFilterEditing ?? [];
    const extsWebEdited = filesSettings?.extsWebEdited ?? [];
    const isExtsCustomFilter = extsCustomFilter.includes(file.fileExst);
    const isExtsWebEdited = extsWebEdited.includes(file.fileExst);

    if (
      !isTrashSection &&
      file.security?.CustomFilter &&
      isExtsCustomFilter &&
      isExtsWebEdited
    ) {
      model.add(AVAILABLE_CONTEXT_ITEMS.customFilter);
    }

    model.add(AVAILABLE_CONTEXT_ITEMS.showInfo);

    if (file.security.Delete) {
      if (isTrashSection) {
        model.add(AVAILABLE_CONTEXT_ITEMS.deletePermanently);
      } else {
        model.add(AVAILABLE_CONTEXT_ITEMS.delete);
      }
    }

    return Array.from(model);
  }, [isFavoritesSection, isRecentSection, isTrashSection, isDocsSection, isShareSection, filesSettings?.extsWebCustomFilterEditing, filesSettings?.extsWebEdited]);

  const getFoldersContextMenu = useCallback((folder: TFolder) => {
    if (isShareSection) {
      const items: AVAILABLE_CONTEXT_ITEMS[] = [
        AVAILABLE_CONTEXT_ITEMS.select,
        AVAILABLE_CONTEXT_ITEMS.open,
      ];
      if (folder.security.Download) items.push(AVAILABLE_CONTEXT_ITEMS.download);
      if (folder.security.Copy) items.push(AVAILABLE_CONTEXT_ITEMS.copy);
      items.push(AVAILABLE_CONTEXT_ITEMS.removeFromSharedWithMe);
      items.push(AVAILABLE_CONTEXT_ITEMS.showInfo);
      return items;
    }

    const items = [
      AVAILABLE_CONTEXT_ITEMS.select,
      AVAILABLE_CONTEXT_ITEMS.open,
      ...(isDocsSection ? [AVAILABLE_CONTEXT_ITEMS.share, AVAILABLE_CONTEXT_ITEMS.copyLink] : []),
      AVAILABLE_CONTEXT_ITEMS.download,
    ];

    if (folder.isFavorite) {
      items.push(AVAILABLE_CONTEXT_ITEMS.removeFromFavorites);
    } else {
      items.push(AVAILABLE_CONTEXT_ITEMS.markAsFavorite);
    }

    if (isTrashSection) {
      items.push(AVAILABLE_CONTEXT_ITEMS.restore);
    } else {
      if (folder.security.Rename) items.push(AVAILABLE_CONTEXT_ITEMS.rename);
      if (folder.security.Copy) items.push(AVAILABLE_CONTEXT_ITEMS.copy);
      if (folder.security.Duplicate)
        items.push(AVAILABLE_CONTEXT_ITEMS.duplicate);
      if (folder.security.Move) items.push(AVAILABLE_CONTEXT_ITEMS.moveTo);
    }

    items.push(AVAILABLE_CONTEXT_ITEMS.showInfo);

    if (folder.security.Delete) {
      if (isTrashSection) {
        items.push(AVAILABLE_CONTEXT_ITEMS.deletePermanently);
      } else {
        items.push(AVAILABLE_CONTEXT_ITEMS.delete);
      }
    }

    return items;
  }, [isTrashSection, isDocsSection, isShareSection]);

  return { getFilesContextMenu, getFoldersContextMenu };
}
