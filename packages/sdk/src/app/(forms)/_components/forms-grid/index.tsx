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
import { observer } from "mobx-react";
import { usePathname } from "next/navigation";

import type { TFile, TFilesSettings } from "@docspace/shared/api/files/types";
import { RectangleSkeleton } from "@docspace/ui-kit/components/rectangle";

import useItemIcon from "@/app/(docspace)/_hooks/useItemIcon";
import useItemList from "@/app/(docspace)/_hooks/useItemList";

import { FormsSection } from "@/types/forms";

import { sectionFromPathname } from "../../_utils/sectionFromPathname";
import { useFormsListStore } from "../../_store/FormsListStore";
import { useFormsNavigationStore } from "../../_store/FormsNavigationStore";
import useFormsContextMenu from "../../_hooks/useFormsContextMenu";
import FormsEmpty from "../forms-empty";
import FormsTile from "./FormsTile";
import SubFolderTile from "./SubFolderTile";
import styles from "./FormsTile.module.scss";

type FormsGridProps = {
  filesSettings: TFilesSettings;
  fetchMore: () => Promise<void>;
};

const FormsGrid = ({ filesSettings, fetchMore }: FormsGridProps) => {
  const formsListStore = useFormsListStore();
  const { items, folders, hasMore, isLoading } = formsListStore;
  const pathname = usePathname();
  const activeSection = sectionFromPathname(pathname);
  const {
    completedFolder,
    inProgressFolder,
    openCompletedFolder,
    openInProgressFolder,
  } = useFormsNavigationStore();
  const { getIcon } = useItemIcon({ filesSettings });
  const { convertFileToItem } = useItemList({
    getIcon,
  });
  const { getFolderContextMenuModel } = useFormsContextMenu();

  const isCompletedRoot =
    activeSection === FormsSection.CompletedForms && !completedFolder;
  const isInProgressRoot =
    activeSection === FormsSection.InProgress && !inProgressFolder;

  const fileItems = React.useMemo(
    () =>
      items.map((file: TFile) => ({
        item: convertFileToItem(file),
        originalFile: file,
      })),
    [items, convertFileToItem],
  );

  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const fetchMoreRef = React.useRef(fetchMore);
  fetchMoreRef.current = fetchMore;

  const columnsCountRef = React.useRef(4);
  const [skeletonCount, setSkeletonCount] = React.useState(4);

  React.useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !hasMore) return;

    const measure = () => {
      const raw = getComputedStyle(grid).gridTemplateColumns;
      const cols = raw && raw !== "none" ? raw.split(" ").length : 4;
      if (cols === columnsCountRef.current) return;
      columnsCountRef.current = cols;
      const rem = items.length % cols;
      setSkeletonCount(rem === 0 ? cols : cols - rem);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(grid);
    return () => ro.disconnect();
  }, [hasMore, items.length]);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const scroller = document.querySelector(
      "#sectionScroll .scroll-wrapper > .scroller",
    );

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchMoreRef.current();
        }
      },
      {
        root: scroller ?? null,
        rootMargin: "200px",
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, items.length]);

  const hasFolders = folders.length > 0;
  const hasItems = items.length > 0;

  if (!hasFolders && !hasItems) {
    if (isLoading) {
      return (
        <div className={styles.filesGrid}>
          {Array.from({ length: columnsCountRef.current * 2 }, (_, i) => (
            <RectangleSkeleton
              key={`init_skeleton_${i}`}
              width="100%"
              height="220px"
              borderRadius="12px"
              animate
            />
          ))}
        </div>
      );
    }

    return <FormsEmpty />;
  }

  // Library views are now handled by dedicated route pages under /forms/library/[langId]/...
  // FormsGrid only handles MyForms, InProgress, CompletedForms sections

  if ((isCompletedRoot || isInProgressRoot || !hasItems) && hasFolders) {
    const onOpenFolder = isCompletedRoot
      ? openCompletedFolder
      : openInProgressFolder;
    return (
      <div className={styles.foldersGrid}>
        {folders.map((folder) => (
          <SubFolderTile
            key={`folder_${folder.id}`}
            folder={folder}
            getIcon={getIcon}
            onOpenFolder={onOpenFolder}
            contextOptions={getFolderContextMenuModel(folder, () =>
              onOpenFolder(folder),
            )}
          />
        ))}
      </div>
    );
  }

  if (hasItems) {
    return (
      <>
        <div className={styles.filesGrid} ref={gridRef} data-tour="forms-grid">
          {fileItems.map(({ item, originalFile }) => (
            <FormsTile
              key={`file_${item.id}`}
              item={item}
              originalFile={originalFile}
              getIcon={getIcon}
            />
          ))}
          {hasMore &&
            Array.from({ length: skeletonCount }, (_, i) => (
              <RectangleSkeleton
                key={`skeleton_${i}`}
                width="100%"
                height="220px"
                borderRadius="12px"
                animate
              />
            ))}
        </div>
        {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
      </>
    );
  }

  return isLoading ? null : <FormsEmpty />;
};

export default observer(FormsGrid);
