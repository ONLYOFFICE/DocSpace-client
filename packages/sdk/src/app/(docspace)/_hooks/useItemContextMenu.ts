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

import { useCallback } from "react";

import { TFile, TFolder } from "@docspace/shared/api/files/types";
import { TRoom } from "@docspace/shared/api/rooms/types";

import { AVAILABLE_CONTEXT_ITEMS } from "../_enums/context-items";
import { useFilesSettingsStore } from "../_store/FilesSettingsStore";

type UseItemContextMenuProps = {
  isFavoritesSection?: boolean;
  isRecentSection?: boolean;
  isTrashSection?: boolean;
  isDocsSection?: boolean;
  isShareSection?: boolean;
  /**
   * Temporary flag: hide the "Add to favorites" context menu entry.
   * Used for rooms internals and trash where favoriting is undesired.
   */
  withoutFavorite?: boolean;
  /**
   * When true, enables the "download without decryption" option for folders.
   * For files the option is gated by file.encrypted; for folders the caller
   * must indicate private-room context since folders have no encrypted field.
   */
  isPrivate?: boolean;
};

export default function useItemContextMenu({
  isFavoritesSection = false,
  isRecentSection = false,
  isTrashSection = false,
  isDocsSection = false,
  isShareSection = false,
  withoutFavorite = false,
  isPrivate = false,
}: UseItemContextMenuProps = {}) {
  const { filesSettings } = useFilesSettingsStore();

  const getFilesContextMenu = useCallback(
    (
      file: TFile,
      overrides?: { isRecentSection?: boolean; isFavoritesSection?: boolean },
    ) => {
      const effectiveIsRecentSection =
        overrides?.isRecentSection ?? isRecentSection;
      const effectiveIsFavoritesSection =
        overrides?.isFavoritesSection ?? isFavoritesSection;

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

        if (!file.security.Download)
          shareModel.delete(AVAILABLE_CONTEXT_ITEMS.download);
        if (!file.viewAccessibility.CanConvert)
          shareModel.delete(AVAILABLE_CONTEXT_ITEMS.downloadAs);
        if (!file.viewAccessibility.WebView)
          shareModel.delete(AVAILABLE_CONTEXT_ITEMS.preview);
        if (!isPdfFile || (shouldFill && canFill))
          shareModel.delete(AVAILABLE_CONTEXT_ITEMS.openPDF);
        if (!isPdfFile) shareModel.delete(AVAILABLE_CONTEXT_ITEMS.pdfView);
        if (!canPlay) shareModel.delete(AVAILABLE_CONTEXT_ITEMS.view);
        if (
          !isPdfFile ||
          !file.security.EditForm ||
          file.startFilling ||
          !file.isForm
        )
          shareModel.delete(AVAILABLE_CONTEXT_ITEMS.editPDF);
        if (!(shouldFill && canFill) || !file.isForm)
          shareModel.delete(AVAILABLE_CONTEXT_ITEMS.fillForm);
        if (canPlay || !canEdit)
          shareModel.delete(AVAILABLE_CONTEXT_ITEMS.edit);

        if (file.security.Copy) shareModel.add(AVAILABLE_CONTEXT_ITEMS.copy);
        shareModel.add(AVAILABLE_CONTEXT_ITEMS.removeFromSharedWithMe);
        shareModel.add(AVAILABLE_CONTEXT_ITEMS.showInfo);

        return Array.from(shareModel);
      }

      if (isTrashSection) {
        const trashModel: AVAILABLE_CONTEXT_ITEMS[] = [
          AVAILABLE_CONTEXT_ITEMS.select,
          AVAILABLE_CONTEXT_ITEMS.showInfo,
          AVAILABLE_CONTEXT_ITEMS.restore,
        ];
        if (file.security.Delete)
          trashModel.push(AVAILABLE_CONTEXT_ITEMS.deletePermanently);
        return trashModel;
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

      if (!file.security.Download)
        model.delete(AVAILABLE_CONTEXT_ITEMS.download);

      // Emit the "download without decryption" option for encrypted files so
      // the private-room whitelist can pass it through. The option is omitted
      // for non-encrypted files; non-private-room callers filter it out via
      // their allowedContextOptions whitelist.
      if (file.encrypted && file.security.Download) {
        model.add(AVAILABLE_CONTEXT_ITEMS.downloadEncrypted);
      }

      if (!file.viewAccessibility.CanConvert)
        model.delete(AVAILABLE_CONTEXT_ITEMS.downloadAs);

      if (!file.viewAccessibility.WebView)
        model.delete(AVAILABLE_CONTEXT_ITEMS.preview);

      if (!isPdf || (shouldFillForm && canFillForm)) {
        model.delete(AVAILABLE_CONTEXT_ITEMS.openPDF);
      }

      if (!isPdf) model.delete(AVAILABLE_CONTEXT_ITEMS.pdfView);

      if (!canOpenPlayer) model.delete(AVAILABLE_CONTEXT_ITEMS.view);

      if (
        !isPdf ||
        !file.security.EditForm ||
        file.startFilling ||
        !file.isForm
      )
        model.delete(AVAILABLE_CONTEXT_ITEMS.editPDF);

      if (!(shouldFillForm && canFillForm) || !file.isForm)
        model.delete(AVAILABLE_CONTEXT_ITEMS.fillForm);

      if (canOpenPlayer || !canEditFile) {
        model.delete(AVAILABLE_CONTEXT_ITEMS.edit);
      }

      if (!file.canShare) model.delete(AVAILABLE_CONTEXT_ITEMS.share);

      if (!withoutFavorite) {
        if (effectiveIsFavoritesSection || file.isFavorite) {
          model.add(AVAILABLE_CONTEXT_ITEMS.removeFromFavorites);
        } else {
          model.add(AVAILABLE_CONTEXT_ITEMS.markAsFavorite);
        }
      }

      if (effectiveIsRecentSection) {
        model.add(AVAILABLE_CONTEXT_ITEMS.removeFromRecent);
      }

      if (effectiveIsFavoritesSection || effectiveIsRecentSection) {
        model.add(AVAILABLE_CONTEXT_ITEMS.openLocation);
      }

      if (file.security.Rename) model.add(AVAILABLE_CONTEXT_ITEMS.rename);
      if (file.security.Copy) model.add(AVAILABLE_CONTEXT_ITEMS.copy);
      if (file.security.Duplicate)
        model.add(AVAILABLE_CONTEXT_ITEMS.duplicate);
      if (file.security.Move) model.add(AVAILABLE_CONTEXT_ITEMS.moveTo);

      if (file.security?.ReadHistory) {
        model.add(AVAILABLE_CONTEXT_ITEMS.showVersionHistory);
      }

      if (file.security?.Lock) {
        model.add(AVAILABLE_CONTEXT_ITEMS.blockUnblockVersion);
      }

      const extsCustomFilter = filesSettings?.extsWebCustomFilterEditing ?? [];
      const extsWebEdited = filesSettings?.extsWebEdited ?? [];
      const isExtsCustomFilter = extsCustomFilter.includes(file.fileExst);
      const isExtsWebEdited = extsWebEdited.includes(file.fileExst);

      if (
        file.security?.CustomFilter &&
        isExtsCustomFilter &&
        isExtsWebEdited
      ) {
        model.add(AVAILABLE_CONTEXT_ITEMS.customFilter);
      }

      model.add(AVAILABLE_CONTEXT_ITEMS.showInfo);

      // Knowledge-folder retry: the server sets `security.Vectorization` on
      // files that live inside a Knowledge subfolder of an AI agent. Mirrors
      // the client's ContextOptionsStore vectorization entry.
      if (file.security?.Vectorization) {
        model.add(AVAILABLE_CONTEXT_ITEMS.vectorization);
      }

      if (file.security.Delete) model.add(AVAILABLE_CONTEXT_ITEMS.delete);

      return Array.from(model);
    },
    [
      isFavoritesSection,
      isRecentSection,
      isTrashSection,
      isDocsSection,
      isShareSection,
      filesSettings?.extsWebCustomFilterEditing,
      filesSettings?.extsWebEdited,
      withoutFavorite,
    ],
  );

  const getFoldersContextMenu = useCallback(
    (
      folder: TFolder | TRoom,
      { isHeader = false }: { isHeader?: boolean } = {},
    ) => {
      if (isShareSection) {
        const items: AVAILABLE_CONTEXT_ITEMS[] = [
          AVAILABLE_CONTEXT_ITEMS.select,
          ...(isHeader ? [] : [AVAILABLE_CONTEXT_ITEMS.open]),
        ];
        if (folder.security.Download)
          items.push(AVAILABLE_CONTEXT_ITEMS.download);
        if (folder.security.Copy) items.push(AVAILABLE_CONTEXT_ITEMS.copy);
        items.push(AVAILABLE_CONTEXT_ITEMS.removeFromSharedWithMe);
        items.push(AVAILABLE_CONTEXT_ITEMS.showInfo);
        return items;
      }

      if (isTrashSection) {
        const trashItems: AVAILABLE_CONTEXT_ITEMS[] = [
          AVAILABLE_CONTEXT_ITEMS.select,
          AVAILABLE_CONTEXT_ITEMS.showInfo,
          AVAILABLE_CONTEXT_ITEMS.restore,
        ];
        if (folder.security.Delete)
          trashItems.push(AVAILABLE_CONTEXT_ITEMS.deletePermanently);
        return trashItems;
      }

      const items = [
        AVAILABLE_CONTEXT_ITEMS.select,
        ...(isHeader ? [] : [AVAILABLE_CONTEXT_ITEMS.open]),
        ...(isDocsSection
          ? [AVAILABLE_CONTEXT_ITEMS.share, AVAILABLE_CONTEXT_ITEMS.copyLink]
          : []),
        AVAILABLE_CONTEXT_ITEMS.download,
        // In private rooms, expose the raw-ciphertext archive download option.
        // Gated by Download permission so the item can be disabled at the model
        // level to match the reference's disabled: !item.security?.Download.
        ...(isPrivate && folder.security.Download
          ? [AVAILABLE_CONTEXT_ITEMS.downloadEncrypted]
          : []),
      ];

      const isFavorite = (folder as TFolder).isFavorite;

      if (!withoutFavorite) {
        if (isFavorite) {
          items.push(AVAILABLE_CONTEXT_ITEMS.removeFromFavorites);
        } else {
          items.push(AVAILABLE_CONTEXT_ITEMS.markAsFavorite);
        }
      }

      if (isFavoritesSection || isRecentSection) {
        items.push(AVAILABLE_CONTEXT_ITEMS.openLocation);
      }

      if (folder.security.Rename) items.push(AVAILABLE_CONTEXT_ITEMS.rename);
      if (folder.security.Copy) items.push(AVAILABLE_CONTEXT_ITEMS.copy);
      if (folder.security.Duplicate)
        items.push(AVAILABLE_CONTEXT_ITEMS.duplicate);
      if (folder.security.Move) items.push(AVAILABLE_CONTEXT_ITEMS.moveTo);

      items.push(AVAILABLE_CONTEXT_ITEMS.showInfo);

      if (folder.security.Delete) items.push(AVAILABLE_CONTEXT_ITEMS.delete);

      return items;
    },
    [
      isTrashSection,
      isDocsSection,
      isShareSection,
      withoutFavorite,
      isFavoritesSection,
      isRecentSection,
      isPrivate,
    ],
  );

  return { getFilesContextMenu, getFoldersContextMenu };
}
