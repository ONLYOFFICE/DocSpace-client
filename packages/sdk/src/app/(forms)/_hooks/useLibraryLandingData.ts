// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";

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

    for (const [idx, folder] of folders.entries()) {
      void (async () => {
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
      })();
    }

    return () => controller.abort();
  }, [folderIds]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalTemplatesCount = folders.reduce(
    (sum, f) => sum + (f.filesCount ?? 0),
    0,
  );

  return { categories, totalTemplatesCount };
}
