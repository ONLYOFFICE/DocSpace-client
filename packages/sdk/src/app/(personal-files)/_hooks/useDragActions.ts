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

import { useCallback, useEffect, useRef } from "react";

import { moveToFolder } from "@docspace/shared/api/files";
import { ConflictResolveType, DeviceType } from "@docspace/shared/enums";
import { toastr } from "@docspace/ui-kit/components/toast";

import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";
import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";
import type {
  TFileItem,
  TFolderItem,
} from "@/app/(docspace)/_hooks/useItemList";

import { useDragStore } from "../_store/DragStore";
import type { TrackOperation } from "./useFileOperations";

export default function useDragActions({
  trackOperation,
}: {
  trackOperation: TrackOperation;
}) {
  const dragStore = useDragStore();
  const filesSelectionStore = useFilesSelectionStore();
  const filesListStore = useFilesListStore();
  const settingsStore = useSettingsStore();

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const currentDroppableRef = useRef<Element | null>(null);
  const isDragActiveRef = useRef(false);

  const moveDragItems = useCallback(
    async (destFolderId: number) => {
      const items =
        filesSelectionStore.selection.length > 0
          ? filesSelectionStore.selection
          : filesSelectionStore.bufferSelection
            ? [filesSelectionStore.bufferSelection]
            : [];

      const filtered = items.filter(
        (i) => !i.isFolder || i.id !== destFolderId,
      );
      if (!filtered.length) return;

      const fileIds = filtered
        .filter((i) => !i.isFolder)
        .map((i) => i.id as number);
      const folderIds = filtered
        .filter((i) => i.isFolder)
        .map((i) => i.id as number);

      try {
        const operations = await moveToFolder(
          destFolderId,
          folderIds,
          fileIds,
          ConflictResolveType.Duplicate,
          false,
        );
        const opId = operations?.[0]?.id;
        if (opId) {
          await trackOperation(opId, "move", () => {
            for (const item of filtered) filesListStore.removeItem(item.id);
            filesSelectionStore.setSelection();
            filesSelectionStore.setBufferSelection(null);
          });
        } else {
          for (const item of filtered) filesListStore.removeItem(item.id);
          filesSelectionStore.setSelection();
          filesSelectionStore.setBufferSelection(null);
        }
      } catch (error) {
        toastr.error(error instanceof Error ? error.message : String(error));
      }
    },
    [filesSelectionStore, filesListStore, trackOperation],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (
        Math.abs(e.pageX - startXRef.current) < 5 &&
        Math.abs(e.pageY - startYRef.current) < 5
      )
        return;

      isDragActiveRef.current = true;
      dragStore.setDragging(true);
      document.body.classList.add("drag-cursor", "no-select");
      dragStore.setTooltipPosition(e.pageX, e.pageY);

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const droppable = el?.closest(".droppable") ?? null;

      if (droppable !== currentDroppableRef.current) {
        currentDroppableRef.current?.classList.remove("droppable-hover");
        currentDroppableRef.current = droppable;
        droppable?.classList.add("droppable-hover");
      }
    },
    [dragStore],
  );

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      document.body.classList.remove("drag-cursor", "no-select");
      currentDroppableRef.current?.classList.remove("droppable-hover");
      currentDroppableRef.current = null;
      dragStore.setStartDrag(false);

      const wasActive = isDragActiveRef.current;
      isDragActiveRef.current = false;
      dragStore.setDragging(false);

      if (!wasActive) return;

      // Use elementFromPoint (same as mousemove) — e.target may be a text node
      // deep inside the row, not the droppable container itself.
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const elem = el?.closest(".droppable");
      if (!elem) return;

      const value = elem.getAttribute("value");
      if (!value) return;

      // value format: "folder_{id}_(false|draggable)_index_{idx}"
      const folderId = Number(value.split("_").slice(1, -3).join("_"));
      if (!folderId) return;

      void moveDragItems(folderId);
    },
    [handleMouseMove, dragStore, moveDragItems],
  );

  const onItemMouseDown = useCallback(
    (e: MouseEvent, item: TFileItem | TFolderItem) => {
      if (settingsStore.currentDeviceType !== DeviceType.desktop) return;
      if (e.button !== 0) return;
      const target = e.target as Element | null;
      if (target?.closest(".not-selectable, .checkbox, input")) return;

      e.preventDefault();

      startXRef.current = e.pageX;
      startYRef.current = e.pageY;
      dragStore.setTooltipPosition(e.pageX, e.pageY);
      dragStore.setStartDrag(true);

      const inSelection = filesSelectionStore.selection.some(
        (i) => i.id === item.id && i.isFolder === item.isFolder,
      );
      if (!inSelection) {
        filesSelectionStore.setSelection([]);
        filesSelectionStore.setBufferSelection(item);
      }

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [
      dragStore,
      filesSelectionStore,
      handleMouseMove,
      handleMouseUp,
      settingsStore,
    ],
  );

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.classList.remove("drag-cursor", "no-select");
    };
  }, [handleMouseMove, handleMouseUp]);

  return { onItemMouseDown };
}
