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
import { sectionFromPathname } from "../_utils/sectionFromPathname";

const FORMS_PAGE_COUNT = 25;

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
  const pathname = usePathname();
  const activeSection = sectionFromPathname(pathname);
  const { completedFolder, inProgressFolder } = useFormsNavigationStore();
  const currentPage = useRef(0);
  const apiExhausted = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const fetchMoreAbortRef = useRef<AbortController | null>(null);
  const doneFolderIdRef = useRef<number | null>(null);
  const inProgressFolderIdRef = useRef<number | null>(null);

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

      // Use cached virtual folder IDs when available to skip room fetch
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

  const fetchSubfolder = useCallback(
    async (folderId: number, signal: AbortSignal) => {
      formsListStore.setIsLoading(true);
      try {
        const filter = FilesFilter.getDefault();
        filter.page = 0;
        filter.pageCount = FORMS_PAGE_COUNT;
        filter.filterType = FilterType.PDFForm;

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
        requestThumbnails(files);
      } finally {
        if (!signal.aborted) {
          formsListStore.setIsLoading(false);
        }
      }
    },
    [formsListStore],
  );

  const fetchSection = useCallback(
    async (section?: FormsSection) => {
      abortRef.current?.abort();
      fetchMoreAbortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      formsListStore.setIsLoading(true);
      apiExhausted.current = false;

      const sec = section ?? activeSection;

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
          requestThumbnails(files);

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
    ],
  );

  const fetchMore = useCallback(async () => {
    if (apiExhausted.current) return;

    fetchMoreAbortRef.current?.abort();
    const controller = new AbortController();
    fetchMoreAbortRef.current = controller;

    const folderId = getFolderId();
    if (!folderId) return;

    try {
      let fetched: TFile[] = [];

      while (!apiExhausted.current && fetched.length === 0) {
        currentPage.current += 1;

        const filter = FilesFilter.getDefault();
        filter.page = currentPage.current;
        filter.pageCount = FORMS_PAGE_COUNT;
        filter.filterType = FilterType.PDFForm;

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
      requestThumbnails(fetched);
    } catch {
      // aborted or network error — ignore
    }
  }, [getFolderId, formsListStore]);

  return { fetchSection, fetchMore, fetchSubfolder };
}
