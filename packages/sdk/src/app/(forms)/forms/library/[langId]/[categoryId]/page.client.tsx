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

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";

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

        setItems(listItems);
        setIsLoading(false);

        // Auto-open first file when navigating from landing page
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
        }
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

  if (isLoading) return null;

  return (
    <LibraryCategoryListView items={items} onClickItem={handleClickItem} />
  );
};

export default LibraryCategoryRoute;
