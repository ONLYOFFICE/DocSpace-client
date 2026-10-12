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
import { makeAutoObservable, runInAction } from "mobx";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFile, TFolder } from "@docspace/shared/api/files/types";
import type { CategoryType } from "@docspace/shared/constants";
import type { VectorizationStatus } from "@docspace/shared/enums";

export type AliasViewAs = "tile" | "row" | "table";

type CategoryValue = (typeof CategoryType)[keyof typeof CategoryType];

// Generic store backing any server-resolved files-alias route
// (`@recent`, `@favorites`, `@trash`, …). One instance per alias — created
// via the factory below. The store owns the list, the FilesFilter (which
// has `folder` pre-pinned to the alias) and a per-alias viewAs.
class AliasFilesStore {
  files: TFile[] = [];

  folders: TFolder[] = [];

  current: TFolder | null = null;

  total = 0;

  isLoading = true;

  filter: FilesFilter;

  viewAs: AliasViewAs = "row";

  alias: string;

  readonly categoryType: CategoryValue;

  private abort: AbortController | null = null;

  constructor(alias: string, categoryType: CategoryValue) {
    this.alias = alias;
    this.categoryType = categoryType;
    this.filter = FilesFilter.getDefault({ categoryType });
    // FilesFilter.getDefault only sets `folder` for Recent/SharedWithMe/
    // Favorite — Trash, AIAgents, and any future alias fall through to
    // DEFAULT_FOLDER (`@my`). Pin explicitly so the alias never leaks `@my`.
    if (alias) this.filter.folder = alias;
    makeAutoObservable<this, "abort">(this, { abort: false });
  }

  // Swap the underlying folder — used by per-agent stores (Knowledge /
  // Result) whose folderId is only known after the parent agent loads and
  // changes when the user switches between agents. Resets list state +
  // filter + aborts in-flight requests, then re-fetches.
  setFolder = (folderId: string | number) => {
    const next = String(folderId);
    if (this.alias === next) return;
    this.alias = next;
    this.abort?.abort();
    this.abort = null;
    const filter = FilesFilter.getDefault({ categoryType: this.categoryType });
    filter.folder = next;
    this.files = [];
    this.folders = [];
    this.current = null;
    this.total = 0;
    this.filter = filter;
    void this.fetch(filter);
  };

  // Clear list state without refetching. Used when the parent agent
  // unmounts / changes — keeps the store alive for the next swap but
  // prevents the stale agent's files from flashing on switch.
  reset = () => {
    this.alias = "";
    this.abort?.abort();
    this.abort = null;
    this.files = [];
    this.folders = [];
    this.current = null;
    this.total = 0;
    this.filter = FilesFilter.getDefault({ categoryType: this.categoryType });
    this.isLoading = false;
  };

  setIsLoading = (value: boolean) => {
    this.isLoading = value;
  };

  hydrate = (data: {
    files: TFile[];
    folders?: TFolder[];
    current?: TFolder | null;
    total: number;
    filter: FilesFilter;
  }) => {
    this.files = data.files;
    this.folders = data.folders ?? [];
    this.current = data.current ?? null;
    this.total = data.total;
    this.filter = data.filter;
    this.isLoading = false;
  };

  setSearch = (value: string) => {
    const next = this.filter.clone();
    next.search = value ? value : null;
    next.page = 0;
    void this.fetch(next);
  };

  setViewAs = (value: AliasViewAs) => {
    this.viewAs = value;
  };

  // Optimistic per-file vectorization-status flip. Mirrors the client's
  // FilesStore.updateFileVectorizationStatus — the AI-retry action calls
  // this to flip InProgress before the POST and reverts to Failed on
  // error. Server-pushed updates come in via socket and re-set the same
  // field through a regular fetch/getFileInfo refresh.
  updateFileVectorizationStatus = (
    fileId: TFile["id"],
    status: VectorizationStatus,
  ) => {
    const index = this.files.findIndex((file) => file.id === fileId);
    if (index === -1) return;
    this.files[index] = { ...this.files[index], vectorizationStatus: status };
  };

  apply = (filter: FilesFilter) => {
    void this.fetch(filter);
  };

  clearFilter = () => {
    const next = FilesFilter.getDefault({ categoryType: this.categoryType });
    void this.fetch(next);
  };

  fetch = async (filter?: FilesFilter) => {
    const filterData = filter ? filter.clone() : this.filter.clone();
    // Keep the alias pinned — clone() preserves whatever folder the caller
    // last set, but a stray FilesFilter.getDefault() without categoryType
    // would reset folder to undefined and break this fetch.
    if (!filterData.folder) filterData.folder = this.alias;
    filterData.page = 0;

    this.abort?.abort();
    const controller = new AbortController();
    this.abort = controller;

    this.setIsLoading(true);
    try {
      const data = await api.files.getFolder(
        filterData.folder,
        filterData,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      runInAction(() => {
        this.files = data.files;
        this.folders = data.folders ?? [];
        this.current = data.current ?? this.current;
        this.total = data.total;
        this.filter = filterData;
      });
    } catch (e) {
      if (!controller.signal.aborted) throw e;
    } finally {
      if (!controller.signal.aborted) this.setIsLoading(false);
    }
  };

  // Append next page — drives infinite scroll in row/tile/table views.
  // Reuses the same abort slot as `fetch` so a fresh filter change cancels
  // any in-flight pagination request.
  fetchMore = async () => {
    if (this.isLoading) return;
    const loaded = this.folders.length + this.files.length;
    if (loaded >= this.total) return;

    const filterData = this.filter.clone();
    filterData.page = (filterData.page ?? 0) + 1;
    if (!filterData.folder) filterData.folder = this.alias;

    this.abort?.abort();
    const controller = new AbortController();
    this.abort = controller;

    this.setIsLoading(true);
    try {
      const data = await api.files.getFolder(
        filterData.folder,
        filterData,
        controller.signal,
      );
      if (controller.signal.aborted) return;
      runInAction(() => {
        this.folders = [...this.folders, ...(data.folders ?? [])];
        this.files = [...this.files, ...(data.files ?? [])];
        this.total = data.total;
        this.filter = filterData;
      });
    } catch (e) {
      if (!controller.signal.aborted) throw e;
    } finally {
      if (!controller.signal.aborted) this.setIsLoading(false);
    }
  };

  get hasActiveFilter() {
    return !!(
      this.filter.search ||
      this.filter.filterType != null ||
      this.filter.authorType
    );
  }
}

// Factory — builds a per-alias context provider + hook. Each alias gets its
// own isolated store instance (so Recent and Favorites don't share `files`
// or `filter`). Callers import the pre-built Recent / Favorites bindings
// from `./index.tsx` — no need to wire the factory manually.
export const createAliasFilesStoreBinding = (
  alias: string,
  categoryType: CategoryValue,
  displayName: string,
) => {
  const Ctx = React.createContext<AliasFilesStore | null>(null);

  const Provider = ({ children }: { children: React.ReactNode }) => {
    const store = React.useMemo(
      () => new AliasFilesStore(alias, categoryType),
      // alias / categoryType are bound at factory time — never change.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );
    return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
  };

  const useStore = () => {
    const store = React.useContext(Ctx);
    if (!store)
      throw new Error(
        `${displayName} must be used within its store provider`,
      );
    return store;
  };

  return { Provider, useStore };
};

export default AliasFilesStore;
