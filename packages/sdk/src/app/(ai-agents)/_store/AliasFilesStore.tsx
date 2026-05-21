// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import React from "react";
import { makeAutoObservable, runInAction } from "mobx";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFile } from "@docspace/shared/api/files/types";
import type { CategoryType } from "@docspace/shared/constants";

export type AliasViewAs = "tile" | "row" | "table";

type CategoryValue = (typeof CategoryType)[keyof typeof CategoryType];

// Generic store backing any server-resolved files-alias route
// (`@recent`, `@favorites`, `@trash`, …). One instance per alias — created
// via the factory below. The store owns the list, the FilesFilter (which
// has `folder` pre-pinned to the alias) and a per-alias viewAs.
class AliasFilesStore {
  files: TFile[] = [];

  total = 0;

  isLoading = true;

  filter: FilesFilter;

  viewAs: AliasViewAs = "row";

  readonly alias: string;

  readonly categoryType: CategoryValue;

  private abort: AbortController | null = null;

  constructor(alias: string, categoryType: CategoryValue) {
    this.alias = alias;
    this.categoryType = categoryType;
    this.filter = FilesFilter.getDefault({ categoryType });
    makeAutoObservable<this, "abort">(this, { abort: false });
  }

  setIsLoading = (value: boolean) => {
    this.isLoading = value;
  };

  hydrate = (data: { files: TFile[]; total: number; filter: FilesFilter }) => {
    this.files = data.files;
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
