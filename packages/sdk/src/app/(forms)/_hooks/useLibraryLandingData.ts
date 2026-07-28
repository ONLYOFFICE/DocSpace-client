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

import { useEffect, useMemo, useRef, useState } from "react";

import api from "@docspace/shared/api";
import { createThumbnails } from "@docspace/shared/api/files";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import { FilterType } from "@docspace/shared/enums";
import { thumbnailStatuses } from "@docspace/shared/constants";

export type CategoryItem = {
  id: number | string;
  title: string;
  type: "file" | "folder";
  original: TFile | TFolder;
};

export type CategoryData = {
  folder: TFolder;
  items: CategoryItem[];
  isLoading: boolean;
};

const MAX_CONCURRENT_FETCHES = 4;

export default function useLibraryLandingData(folders: TFolder[]) {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  // Stabilize dependency — only re-fetch when folder IDs actually change
  const folderIds = useMemo(
    () => folders.map((f) => f.id).join(","),
    [folders],
  );

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setCategories(
      folders.map((folder) => ({ folder, items: [], isLoading: true })),
    );

    const fetchCategory = async (idx: number, folder: TFolder) => {
      try {
        const filter = FilesFilter.getDefault();
        filter.page = 0;
        filter.pageCount = 100;

        const res = await api.files.getFolder(
          folder.id,
          filter,
          controller.signal,
        );

        if (controller.signal.aborted) return;

        const items: CategoryItem[] = [
          ...res.folders.map(
            (f): CategoryItem => ({
              id: f.id,
              title: f.title,
              type: "folder",
              original: f,
            }),
          ),
          ...res.files.map(
            (f): CategoryItem => ({
              id: f.id,
              title: f.title.replace(/\.pdf$/i, ""),
              type: "file",
              original: f,
            }),
          ),
        ];

        const thumbIds = res.files
          .filter((f) => typeof f.id === "number" && f.thumbnailStatus !== thumbnailStatuses.CREATED)
          .map((f) => f.id as number);
        if (thumbIds.length) createThumbnails(thumbIds).catch(() => {});

        if (res.folders.length > 0) {
          const thumbFilter = FilesFilter.getDefault();
          thumbFilter.page = 0;
          thumbFilter.pageCount = 100;
          thumbFilter.withSubfolders = true;
          thumbFilter.filterType = FilterType.PDFForm;

          api.files
            .getFolder(folder.id, thumbFilter, controller.signal)
            .then((thumbRes) => {
              if (controller.signal.aborted) return;
              const ids = thumbRes.files
                .filter((f) => typeof f.id === "number" && f.thumbnailStatus !== thumbnailStatuses.CREATED)
                .map((f) => f.id as number);
              if (ids.length) createThumbnails(ids).catch(() => {});
            })
            .catch(() => {});
        }

        setCategories((prev) =>
          prev.map((cat, i) =>
            i === idx ? { ...cat, items, isLoading: false } : cat,
          ),
        );
      } catch {
        if (controller.signal.aborted) return;
        setCategories((prev) =>
          prev.map((cat, i) =>
            i === idx ? { ...cat, isLoading: false } : cat,
          ),
        );
      }
    };

    void (async () => {
      const queue = folders.map((folder, idx) => ({ idx, folder }));
      let cursor = 0;

      const runNext = async (): Promise<void> => {
        const entry = queue[cursor++];
        if (!entry || controller.signal.aborted) return;
        await fetchCategory(entry.idx, entry.folder);
        return runNext();
      };

      const workers = Array.from(
        { length: Math.min(MAX_CONCURRENT_FETCHES, queue.length) },
        () => runNext(),
      );
      await Promise.all(workers);
    })();

    return () => controller.abort();
  }, [folderIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalTemplatesCount = folders.reduce(
    (sum, f) => sum + (f.filesCount ?? 0),
    0,
  );

  return { categories, totalTemplatesCount };
}
