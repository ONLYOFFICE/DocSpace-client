// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import React from "react";
import { observer } from "mobx-react";

import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { frameCallEvent } from "@docspace/shared/utils/common";
import FilesFilter from "@docspace/shared/api/files/filter";
import type { TFile } from "@docspace/shared/api/files/types";

import type { AliasFilesStore } from "../../_store";
import { formatCreated } from "../../_helpers/formatCreated";
import FilesEmptyFilter from "../files-empty-filter";
import styles from "../agent-files-list/AgentFilesList.module.scss";

// Generic body for any files-alias route (Recent / Favorites / Trash). The
// caller passes its own alias-specific store (via the `useStore` prop —
// each alias has its own context) and an `emptyView` slot for the
// "no items + no active filter" branch (e.g. RecentEmptyView,
// FavoritesEmptyView). The filter-empty branch is shared across aliases.

const openFile = (fileId: number) => {
  if (window.self !== window.parent) {
    frameCallEvent({ event: "onOpenFile", data: { fileId } });
    return;
  }
  window.open(`/doceditor?fileId=${fileId}`, "_blank", "noopener,noreferrer");
};

type Props = {
  useStore: () => AliasFilesStore;
  emptyView: React.ReactNode;
  initialFiles?: TFile[];
  initialTotal?: number;
  initialSearch?: string;
};

const AliasFiles = observer(
  ({ useStore, emptyView, initialFiles, initialTotal, initialSearch }: Props) => {
    const store = useStore();

    // Synchronously hydrate from SSR data on first render — no loader
    // flash, no client fetch on mount. Subsequent updates flow through
    // store.setSearch / store.apply (called by the @filter slot).
    // If SSR data is missing (server-side fetch failed), we fall back to
    // a client fetch in the effect below.
    const ssrHydrated = React.useRef(false);
    if (!ssrHydrated.current && initialFiles !== undefined) {
      ssrHydrated.current = true;
      const filter = FilesFilter.getDefault({
        categoryType: store.categoryType,
      });
      if (initialSearch) filter.search = initialSearch;
      store.hydrate({
        files: initialFiles,
        total: initialTotal ?? 0,
        filter,
      });
    }

    const didInit = React.useRef(false);
    React.useEffect(() => {
      if (didInit.current || ssrHydrated.current) return;
      didInit.current = true;
      void store.fetch();
    }, [store]);

    if (store.isLoading) {
      return (
        <div className={styles.loader}>
          <Loader type={LoaderTypes.dualRing} size="40px" />
        </div>
      );
    }

    if (!store.files.length) {
      if (store.hasActiveFilter) {
        return <FilesEmptyFilter onClear={() => store.clearFilter()} />;
      }
      return <>{emptyView}</>;
    }

    return (
      <div className={styles.list}>
        {store.files.map((file) => (
          <div
            key={file.id}
            className={styles.row}
            role="button"
            tabIndex={0}
            onClick={() => openFile(file.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openFile(file.id);
            }}
          >
            <span className={styles.title}>{file.title}</span>
            <span className={styles.meta}>{formatCreated(file.created)}</span>
          </div>
        ))}
      </div>
    );
  },
);

export default AliasFiles;
