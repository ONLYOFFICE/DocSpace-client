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

import { useRef } from "react";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { useEventCallback } from "@docspace/shared/hooks/useEventCallback";
import type { TTranslation } from "@docspace/shared/types";

import type FilesActionsStore from "SRC_DIR/store/FilesActionsStore";
import type UploadDataStore from "SRC_DIR/store/UploadDataStore";
import type { TUploadTarget } from "SRC_DIR/store/uploadDataStore/helpers";

type UseSectionDropProps = {
  t: TTranslation;
  /** False where the open folder takes no uploads. */
  canUpload: boolean;
  disableDrag: boolean;
  dragging: boolean;
  setDragging: (dragging: boolean) => void;
  resolveOpenFolderTarget: UploadDataStore["resolveOpenFolderTarget"];
  createFoldersTree: FilesActionsStore["createFoldersTree"];
  startUpload: UploadDataStore["startUpload"];
};

/**
 * Uploads files dropped on the section into the open folder, with its upload
 * right, as it was at the native drop event: the browser reads dropped
 * directories before `onDrop` runs, and the user may open another folder
 * meanwhile.
 */
export const useSectionDrop = ({
  t,
  canUpload,
  disableDrag,
  dragging,
  setDragging,
  resolveOpenFolderTarget,
  createFoldersTree,
  startUpload,
}: UseSectionDropProps) => {
  const dropSnapshot = useRef<{
    target: TUploadTarget;
    canUpload: boolean;
  } | null>(null);

  const onDropCapture = useEventCallback(() => {
    dropSnapshot.current = { target: resolveOpenFolderTarget(), canUpload };
  });

  const onDrop = useEventCallback(
    (files: Parameters<FilesActionsStore["createFoldersTree"]>[1]) => {
      const snapshot = dropSnapshot.current ?? {
        target: resolveOpenFolderTarget(),
        canUpload,
      };
      dropSnapshot.current = null;

      if (!snapshot.canUpload) return;
      const { target } = snapshot;

      const dragged = dragging;
      if (dragging) setDragging(false);

      if (disableDrag) return;

      createFoldersTree(t, files, target, dragged)
        .then((items) => {
          if (items.length > 0) startUpload(items, target, t);
        })
        .catch((err) => {
          toastr.error(err, null, 0, true);
        });
    },
  );

  return { onDrop, onDropCapture };
};
