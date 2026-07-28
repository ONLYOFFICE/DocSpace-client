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

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import {
  FloatingButton,
  FloatingButtonIcons,
} from "@docspace/ui-kit/components/floating-button";
import { Text } from "@docspace/ui-kit/components/text";
import { HelpButton } from "@docspace/ui-kit/components/help-button";

import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";

import { useDragStore } from "../../_store/DragStore";
import styles from "./DragTooltip.module.scss";

const DragTooltip = observer(() => {
  const dragStore = useDragStore();
  const selectionStore = useFilesSelectionStore();
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useTranslation("Common");

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.left = `${dragStore.tooltipPageX + 8}px`;
    ref.current.style.top = `${dragStore.tooltipPageY + 8}px`;
  }, [dragStore.tooltipPageX, dragStore.tooltipPageY]);

  // OS drag — show upload FloatingButton centered at bottom with folder name tooltip
  if (dragStore.osDragging) {
    const folderName = dragStore.osDropTargetFolderName;
    return (
      <div className={styles.osDragContainer}>
        <HelpButton
          place="bottom"
          tooltipContent={
            folderName ? (
              <Text fontWeight={600} fontSize="14px">
                {t("DropToLocation", { folderName })}
              </Text>
            ) : null
          }
          isOpen={!!folderName}
          noUserSelect
          isClickable={false}
          tooltipStyle={{ pointerEvents: "none" }}
        >
          <FloatingButton
            icon={FloatingButtonIcons.upload}
            withoutProgress
          />
        </HelpButton>
      </div>
    );
  }

  // Internal drag — show file name tooltip following cursor
  if (!dragStore.dragging) return null;

  const item =
    selectionStore.bufferSelection ?? selectionStore.selection[0] ?? null;
  if (!item) return null;

  const count = selectionStore.selection.length;
  const isSingle = count <= 1;

  const reg = /^([^\\]*)\.(\w+)/;
  const title = item.title ?? "";
  const matches = isSingle ? title.match(reg) : null;
  const name = matches ? matches[1] : title;
  const ext = matches ? matches[2] : null;

  const icon =
    "icon" in item && typeof item.icon === "string" ? item.icon : null;

  return (
    <div ref={ref} className={styles.tooltip}>
      {isSingle && icon && (
        <Image className={styles.icon} src={icon} alt="" width={16} height={16} unoptimized />
      )}
      {isSingle ? (
        <>
          {name}
          {ext && <span className={styles.extension}>.{ext}</span>}
        </>
      ) : (
        count
      )}
    </div>
  );
});

export default DragTooltip;
