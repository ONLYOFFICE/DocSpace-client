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

import React from "react";
import classNames from "classnames";

import { DragAndDrop } from "@docspace/ui-kit/components/drag-and-drop";

import { useDragStore } from "../../_store/DragStore";
import styles from "./DropZone.module.scss";

type DropZoneProps = {
  children: React.ReactNode;
  onFilesDropped: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
  currentFolderTitle?: string;
  canCreate?: boolean;
};

const hasFiles = (e: DragEvent) =>
  !!e.dataTransfer &&
  (e.dataTransfer.types.includes("Files") ||
    e.dataTransfer.types.includes("application/x-moz-file"));

// Root-level OS-file drop target.
//
// "Is an OS file drag happening" is detected with document-level listeners
// (mirroring the client's onDragOver/onDragLeaveDoc) rather than the wrapping
// element: the per-row DragAndDrop wrappers stop native event propagation
// (react-dropzone, noDragEventsBubbling), so a wrapper would never see a drag
// that starts over a row. The document listener also sets the default upload
// destination (the current folder), which a hovered sub-folder later overrides.
//
// "Where the file lands" is owned by the DragAndDrop dropzones: the per-row
// wrappers handle drops on themselves, and this outer dropzone catches drops on
// the gaps/empty area below the list — both routing to an upload. The
// document-level `drop` only resets drag state (it must NOT upload, or a drop
// on a row would upload twice).
const DropZone = ({
  children,
  onFilesDropped,
  disabled,
  className,
  currentFolderTitle,
  canCreate,
}: DropZoneProps) => {
  const dragStore = useDragStore();

  // Keep the latest gating values in a ref so the document listeners (attached
  // once) always read fresh props without re-subscribing on every render.
  const cfgRef = React.useRef({ disabled, currentFolderTitle, canCreate });
  cfgRef.current = { disabled, currentFolderTitle, canCreate };

  React.useEffect(() => {
    const startOsDrag = () => {
      if (!dragStore.osDragging) {
        dragStore.setOsDragging(true);
        document.body.classList.add("os-drag");
      }
      const { canCreate: cc, currentFolderTitle: title } = cfgRef.current;
      if (cc && title) dragStore.setOsCurrentFolderTitle(title);
    };
    const stopOsDrag = () => {
      dragStore.setOsDragging(false);
      document.body.classList.remove("os-drag");
    };

    const onDragOver = (e: DragEvent) => {
      if (cfgRef.current.disabled || !hasFiles(e)) return;
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      startOsDrag();
    };
    const onDragLeaveDoc = (e: DragEvent) => {
      // relatedTarget is null when the cursor leaves the window entirely.
      if (!e.relatedTarget || !hasFiles(e)) stopOsDrag();
    };
    const onDropDoc = () => stopOsDrag();

    document.addEventListener("dragover", onDragOver);
    document.addEventListener("dragleave", onDragLeaveDoc);
    document.addEventListener("drop", onDropDoc);

    return () => {
      document.removeEventListener("dragover", onDragOver);
      document.removeEventListener("dragleave", onDragLeaveDoc);
      document.removeEventListener("drop", onDropDoc);
      document.body.classList.remove("os-drag");
    };
  }, [dragStore]);

  const onDrop = React.useCallback(
    (files: File[]) => {
      if (disabled) return;
      if (files.length > 0) onFilesDropped(files);
    },
    [disabled, onFilesDropped],
  );

  return (
    <DragAndDrop
      isDropZone
      className={classNames(styles.dropZone, className)}
      onDrop={onDrop}
    >
      {children}
    </DragAndDrop>
  );
};

export default DropZone;
