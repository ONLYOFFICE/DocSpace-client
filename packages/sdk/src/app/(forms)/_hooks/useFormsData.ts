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
import { usePathname } from "next/navigation";

import api from "@docspace/shared/api";
import { createThumbnails } from "@docspace/shared/api/files";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFile } from "@docspace/shared/api/files/types";
import { thumbnailStatuses } from "@docspace/shared/constants";
import { FilterType, FolderType } from "@docspace/shared/enums";

import { PAGE_COUNT } from "@/utils/constants";
import { FormsSection } from "@/types/forms";

import { useFormsListStore } from "../_store/FormsListStore";
import { useFormsNavigationStore } from "../_store/FormsNavigationStore";
import { useFormsSettingsStore } from "../_store/FormsSettingsStore";
import { useFormsAiAgentStore } from "../_store/FormsAiAgentStore";
import { useFormsDbSettingsStore } from "../_store/FormsDbSettingsStore";
import { sectionFromPathname } from "../_utils/sectionFromPathname";

const FORMS_PAGE_COUNT = 25;
const MAX_FETCH_MORE_ITERATIONS = 5;
const THUMBNAIL_RETRY_COOLDOWN_MS = 5000;
const THUMBNAIL_REFRESH_DELAYS_MS = [3000, 7000, 15000];

const filterByFolder = (
  files: TFile[],
  folderId: string | number,
) => {
  const id = Number(folderId);
  return files.filter((f) => f.folderId === id);
};

export default function useFormsData() {
  const formsSettingsStore = useFormsSettingsStore();
  const formsListStore = useFormsListStore();
  const aiStore = useFormsAiAgentStore();
  const dbSettingsStore = useFormsDbSettingsStore();
  const pathname = usePathname();
  const activeSection = sectionFromPathname(pathname);
  const { completedFolder, inProgressFolder } = useFormsNavigationStore();
  const currentPage = useRef(0);
  const apiExhausted = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const fetchMoreAbortRef = useRef<AbortController | null>(null);
  const doneFolderIdRef = useRef<number | null>(null);
  const inProgressFolderIdRef = useRef<number | null>(null);
  const requestedThumbnailIds = useRef<Set<number>>(new Set());
  const thumbnailScopeRef = useRef<string>("");

  const requestThumbnails = useCallback(
    (files: TFile[], scope: string | number) => {
      const scopeKey = String(scope);
      if (thumbnailScopeRef.current !== scopeKey) {
        thumbnailScopeRef.current = scopeKey;
        requestedThumbnailIds.current.clear();
      }

      const ids: number[] = [];
      for (const f of files) {
        if (typeof f.id === "string") continue;
        if (f.thumbnailStatus !== thumbnailStatuses.WAITING) continue;
        if (requestedThumbnailIds.current.has(f.id)) continue;
        ids.push(f.id);
      }

      if (!ids.length) return;

      for (const id of ids) requestedThumbnailIds.current.add(id);

      const releaseIds = () => {
        for (const id of ids) requestedThumbnailIds.current.delete(id);
      };

      createThumbnails(ids)
        .then(() => {
          setTimeout(releaseIds, THUMBNAIL_RETRY_COOLDOWN_MS);
        })
        .catch(() => {
          releaseIds();
        });
    },
    [],
  );

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      fetchMoreAbortRef.current?.abort();
    };
  }, []);

  const getFolderId = useCallback(
    (section?: FormsSection) => {
      const sec = section ?? activeSection;
      switch (sec) {
        case FormsSection.MyForms:
          return formsSettingsStore.roomId;
        case FormsSection.InProgress:
          return (
            inProgressFolder?.id ??
            formsSettingsStore.inProgressFolderId ??
            inProgressFolderIdRef.current ??
            ""
          );
        case FormsSection.CompletedForms:
          return (
            completedFolder?.id ??
            aiStore.doneFolderId ??
            doneFolderIdRef.current ??
            ""
          );
        default:
          return formsSettingsStore.roomId;
      }
    },
    [pathname, formsSettingsStore, completedFolder, inProgressFolder, aiStore],
  );

  const fetchVirtualFolders = useCallback(
    async (
      signal: AbortSignal,
      virtualFolderType: FolderType,
      folderIdRef: React.RefObject<number | null>,
    ) => {
      const roomId = formsSettingsStore.roomId;
      if (!roomId) return;

      const cachedId =
        virtualFolderType === FolderType.Done
          ? aiStore.doneFolderId
          : virtualFolderType === FolderType.InProgress
            ? formsSettingsStore.inProgressFolderId
            : undefined;

      let virtualFolderId = cachedId ?? undefined;

      if (!virtualFolderId) {
        const roomFilter = FilesFilter.getDefault();
        roomFilter.page = 0;
        roomFilter.pageCount = PAGE_COUNT;

        const roomRes = await api.files.getFolder(
          roomId,
          roomFilter,
          signal,
        );

        if (signal.aborted) return;

        const virtualFolder = roomRes.folders.find(
          (f) => f.type === virtualFolderType,
        );

        if (!virtualFolder) {
          formsListStore.setFolders([]);
          formsListStore.setItems([], 0);
          return;
        }

        virtualFolderId = virtualFolder.id;
        folderIdRef.current = virtualFolder.id;

        if (virtualFolderType === FolderType.Done) {
          aiStore.setDoneFolderId(virtualFolder.id);
        }
        if (virtualFolderType === FolderType.InProgress) {
          formsSettingsStore.setInProgressFolderId(virtualFolder.id);
        }
      }

      const filter = FilesFilter.getDefault();
      filter.page = 0;
      filter.pageCount = PAGE_COUNT;

      const res = await api.files.getFolder(
        virtualFolderId,
        filter,
        signal,
      );

      if (signal.aborted) return;

      formsListStore.setFolders(res.folders);
      formsListStore.setItems([], 0);
    },
    [formsSettingsStore, formsListStore, aiStore],
  );

  const isCompletedWithXlsx =
    activeSection === FormsSection.CompletedForms && dbSettingsStore.collectXlsx;

  const fetchSubfolder = useCallback(
    async (folderId: number, signal: AbortSignal) => {
      formsListStore.setIsLoading(true);
      try {
        const filter = FilesFilter.getDefault();
        filter.page = 0;
        filter.pageCount = FORMS_PAGE_COUNT;
        if (!isCompletedWithXlsx) {
          filter.filterType = FilterType.PDFForm;
        }

        const res = await api.files.getFolder(folderId, filter, signal);

        if (signal.aborted) return;

        const files = res.files;
        apiExhausted.current = res.files.length < FORMS_PAGE_COUNT;
        const total = apiExhausted.current
          ? files.length
          : files.length + 1;
        formsListStore.setFolders([]);
        formsListStore.setItems(files, total);
        currentPage.current = 0;
        requestThumbnails(files, folderId);
      } finally {
        if (!signal.aborted) {
          formsListStore.setIsLoading(false);
        }
      }
    },
    [formsListStore, isCompletedWithXlsx, requestThumbnails],
  );

  const fetchSection = useCallback(
    async (section?: FormsSection) => {
      const sec = section ?? activeSection;

      if (sec === FormsSection.Library || sec === FormsSection.Settings)
        return;

      abortRef.current?.abort();
      fetchMoreAbortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      formsListStore.setSection(sec);
      formsListStore.setIsLoading(true);
      apiExhausted.current = false;

      try {
        if (sec === FormsSection.CompletedForms) {
          if (completedFolder) {
            await fetchSubfolder(completedFolder.id, controller.signal);
          } else {
            await fetchVirtualFolders(
              controller.signal,
              FolderType.Done,
              doneFolderIdRef,
            );
          }

          if (controller.signal.aborted) return;
        } else if (sec === FormsSection.InProgress) {
          if (inProgressFolder) {
            await fetchSubfolder(
              inProgressFolder.id,
              controller.signal,
            );
          } else {
            await fetchVirtualFolders(
              controller.signal,
              FolderType.InProgress,
              inProgressFolderIdRef,
            );
          }

          if (controller.signal.aborted) return;
        } else {
          const folderId = getFolderId(section);
          if (!folderId) return;

          const filter = FilesFilter.getDefault();
          filter.page = 0;
          filter.pageCount = FORMS_PAGE_COUNT;
          filter.filterType = FilterType.PDFForm;

          const res = await api.files.getFolder(
            folderId,
            filter,
            controller.signal,
          );

          if (controller.signal.aborted) return;

          const files = filterByFolder(res.files, folderId);
          apiExhausted.current = res.files.length < FORMS_PAGE_COUNT;
          const total = apiExhausted.current
            ? files.length
            : files.length + 1;
          formsListStore.setFolders([]);
          formsListStore.setItems(files, total);
          currentPage.current = 0;
          requestThumbnails(files, folderId);

          if (res.current?.security) {
            formsSettingsStore.setFolderSecurity(res.current.security);
          }
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
    },
    [
      pathname,
      completedFolder,
      inProgressFolder,
      getFolderId,
      fetchVirtualFolders,
      fetchSubfolder,
      formsListStore,
      formsSettingsStore,
      requestThumbnails,
    ],
  );

  const isFetchingMore = useRef(false);

  const fetchMore = useCallback(async () => {
    if (apiExhausted.current || isFetchingMore.current) return;

    isFetchingMore.current = true;

    fetchMoreAbortRef.current?.abort();
    const controller = new AbortController();
    fetchMoreAbortRef.current = controller;

    const folderId = getFolderId();
    if (!folderId) {
      isFetchingMore.current = false;
      return;
    }

    const savedPage = currentPage.current;

    try {
      let fetched: TFile[] = [];
      let iterations = 0;

      while (!apiExhausted.current && fetched.length === 0 && iterations < MAX_FETCH_MORE_ITERATIONS) {
        iterations += 1;
        currentPage.current += 1;

        const filter = FilesFilter.getDefault();
        filter.page = currentPage.current;
        filter.pageCount = FORMS_PAGE_COUNT;
        if (!isCompletedWithXlsx) {
          filter.filterType = FilterType.PDFForm;
        }

        const res = await api.files.getFolder(
          folderId,
          filter,
          controller.signal,
        );

        if (controller.signal.aborted) return;

        fetched = filterByFolder(res.files, folderId);
        apiExhausted.current = res.files.length < FORMS_PAGE_COUNT;
      }

      if (controller.signal.aborted) return;

      const total = apiExhausted.current
        ? formsListStore.items.length + fetched.length
        : formsListStore.items.length + fetched.length + 1;
      formsListStore.appendItems(fetched, total);
      requestThumbnails(fetched, folderId);
    } catch (error) {
      if (!controller.signal.aborted) {
        currentPage.current = savedPage;
        if (error instanceof Error) {
          console.error("Forms fetchMore failed:", error.message);
        }
      }
    } finally {
      isFetchingMore.current = false;
    }
  }, [getFolderId, formsListStore, isCompletedWithXlsx, requestThumbnails]);

  const refreshTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    const timers = refreshTimersRef.current;
    return () => {
      for (const t of timers) clearTimeout(t);
      timers.clear();
    };
  }, []);

  const refreshAfterMutation = useCallback(
    async (section?: FormsSection) => {
      await fetchSection(section);

      for (const t of refreshTimersRef.current) clearTimeout(t);
      refreshTimersRef.current.clear();

      for (const delay of THUMBNAIL_REFRESH_DELAYS_MS) {
        const handle = setTimeout(async () => {
          refreshTimersRef.current.delete(handle);
          const hasWaiting = formsListStore.items.some(
            (f) => f.thumbnailStatus === thumbnailStatuses.WAITING,
          );
          if (!hasWaiting) {
            for (const t of refreshTimersRef.current) clearTimeout(t);
            refreshTimersRef.current.clear();
            return;
          }
          await fetchSection(section);
        }, delay);
        refreshTimersRef.current.add(handle);
      }
    },
    [fetchSection, formsListStore],
  );

  return { fetchSection, fetchMore, fetchSubfolder, refreshAfterMutation };
}
