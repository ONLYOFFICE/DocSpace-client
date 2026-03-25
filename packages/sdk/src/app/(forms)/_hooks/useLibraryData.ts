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

import { useCallback, useEffect, useRef } from "react";

import api from "@docspace/shared/api";
import { createThumbnails } from "@docspace/shared/api/files";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFile } from "@docspace/shared/api/files/types";
import { thumbnailStatuses } from "@docspace/shared/constants";
import { FilterType } from "@docspace/shared/enums";

import { PAGE_COUNT } from "@/utils/constants";

import { useFormsListStore } from "../_store/FormsListStore";
import { useFormsSettingsStore } from "../_store/FormsSettingsStore";
import { useLibraryNavigationStore } from "../_store/LibraryNavigationStore";

const LIBRARY_PAGE_COUNT = 25;

const requestThumbnails = (files: TFile[]) => {
  const ids = files
    .filter(
      (f) =>
        typeof f.id !== "string" &&
        f.thumbnailStatus === thumbnailStatuses.WAITING,
    )
    .map((f) => f.id);

  if (ids.length) {
    createThumbnails(ids).catch(() => {});
  }
};

export default function useLibraryData() {
  const formsSettingsStore = useFormsSettingsStore();
  const formsListStore = useFormsListStore();
  const libraryNav = useLibraryNavigationStore();
  const currentPage = useRef(0);
  const apiExhausted = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const fetchMoreAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      fetchMoreAbortRef.current?.abort();
    };
  }, []);

  // Store refs are stable (created once per context via useMemo), so the
  // callback is effectively created once. Consumer uses fetchRef pattern.
  const fetchLibrarySection = useCallback(async () => {
    abortRef.current?.abort();
    fetchMoreAbortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    formsListStore.setIsLoading(true);
    apiExhausted.current = false;

    const { libraryId } = formsSettingsStore;
    if (!libraryId) {
      formsListStore.setFolders([]);
      formsListStore.setItems([], 0);
      formsListStore.setIsLoading(false);
      return;
    }

    // Level 0 → library room root; Level 1+ → currentFolder
    const folderId = libraryNav.currentFolder?.id ?? libraryId;

    try {
      const filter = FilesFilter.getDefault();
      filter.page = 0;
      filter.pageCount = PAGE_COUNT;

      const res = await api.files.getFolder(
        folderId,
        filter,
        controller.signal,
      );

      if (controller.signal.aborted) return;

      if (res.folders.length > 0) {
        // Folder level — show subfolders (no pagination needed)
        formsListStore.setFolders(res.folders);
        formsListStore.setItems([], 0);
      } else if (res.files.length > 0) {
        // Leaf level — show template files with pagination
        const files = res.files;
        apiExhausted.current = files.length < PAGE_COUNT;
        const total = apiExhausted.current
          ? files.length
          : files.length + 1;
        formsListStore.setFolders([]);
        formsListStore.setItems(files, total);
        currentPage.current = 0;
        requestThumbnails(files);
      } else {
        formsListStore.setFolders([]);
        formsListStore.setItems([], 0);
      }
    } catch {
      if (controller.signal.aborted) return;
      formsListStore.setFolders([]);
      formsListStore.setItems([], 0);
      currentPage.current = 0;
      apiExhausted.current = true;
    } finally {
      if (!controller.signal.aborted) {
        formsListStore.setIsLoading(false);
      }
    }
  }, [formsSettingsStore, formsListStore, libraryNav]);

  const fetchMore = useCallback(async () => {
    if (apiExhausted.current) return;

    const folderId = libraryNav.currentFolder?.id;
    if (!folderId) return;

    fetchMoreAbortRef.current?.abort();
    const controller = new AbortController();
    fetchMoreAbortRef.current = controller;

    try {
      currentPage.current += 1;

      const filter = FilesFilter.getDefault();
      filter.page = currentPage.current;
      filter.pageCount = LIBRARY_PAGE_COUNT;
      filter.filterType = FilterType.PDFForm;

      const res = await api.files.getFolder(
        folderId,
        filter,
        controller.signal,
      );

      if (controller.signal.aborted) return;

      const fetched = res.files;
      apiExhausted.current = fetched.length < LIBRARY_PAGE_COUNT;

      const total = apiExhausted.current
        ? formsListStore.items.length + fetched.length
        : formsListStore.items.length + fetched.length + 1;
      formsListStore.appendItems(fetched, total);
      requestThumbnails(fetched);
    } catch {
      // aborted or network error — ignore
    }
  }, [formsListStore, libraryNav]);

  return { fetchLibrarySection, fetchMore };
}
