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

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import { RectangleSkeleton } from "@docspace/ui-kit/components/rectangle";

import { useLibraryParams } from "../../../../_hooks/useLibraryParams";
import { libraryUrl } from "../../../../_utils/libraryUrl";
import LibraryCategoryListView from "../../../../_components/forms-grid/LibraryCategoryListView";

type ListItem = {
  id: number | string;
  title: string;
  original: TFile | TFolder;
  type: "file" | "folder";
};

const LibraryCategoryRoute = () => {
  const router = useRouter();
  const { langId, categoryId, roomId, libraryId } = useLibraryParams();
  const searchParams = useSearchParams();
  const autoOpen = searchParams.get("autoOpen") === "1";
  const autoOpenDone = useRef(false);
  const [items, setItems] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch category folder contents
  useEffect(() => {
    if (!categoryId) return;

    const controller = new AbortController();
    setIsLoading(true);

    const filter = FilesFilter.getDefault();
    filter.page = 0;
    filter.pageCount = 100;

    api.files
      .getFolder(categoryId, filter, controller.signal)
      .then((res) => {
        if (controller.signal.aborted) return;

        const listItems: ListItem[] = [
          ...res.folders.map((f) => ({
            id: f.id,
            title: f.title,
            original: f as TFile | TFolder,
            type: "folder" as const,
          })),
          ...res.files.map((f) => ({
            id: f.id,
            title: f.title.replace(/\.pdf$/i, ""),
            original: f as TFile | TFolder,
            type: "file" as const,
          })),
        ];

        if (autoOpen && !autoOpenDone.current && listItems.length > 0) {
          autoOpenDone.current = true;
          const first = listItems[0];
          router.replace(
            libraryUrl({
              langId: langId ?? undefined,
              categoryId: categoryId ?? undefined,
              templateId: first.id,
              templateType: first.type,
              roomId: roomId || undefined,
              libraryId: libraryId || undefined,
            }),
          );
          return;
        }

        setItems(listItems);
        setIsLoading(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setItems([]);
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [categoryId]);

  const handleClickItem = useCallback(
    (item: ListItem) => {
      router.push(
        libraryUrl({
          langId: langId ?? undefined,
          categoryId: categoryId ?? undefined,
          templateId: item.id,
          templateType: item.type,
          roomId: roomId || undefined,
          libraryId: libraryId || undefined,
        }),
      );
    },
    [langId, categoryId, roomId, libraryId, router],
  );

  if (isLoading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 480 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <RectangleSkeleton key={i} width="240px" height="20px" borderRadius="4px" animate />
        ))}
      </div>
    );
  }

  return (
    <LibraryCategoryListView items={items} onClickItem={handleClickItem} />
  );
};

export default LibraryCategoryRoute;
