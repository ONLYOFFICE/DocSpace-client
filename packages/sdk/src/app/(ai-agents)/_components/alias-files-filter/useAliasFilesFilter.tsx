// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import FilesFilter from "@docspace/shared/api/files/filter";
import {
  FilterType,
  FilterGroups,
  FilterKeys,
  SortByFieldName,
} from "@docspace/shared/enums";
import {
  getFilterType,
  getAuthorType,
} from "@docspace/ui-kit/components/filter/Filter.utils";
import { getUser as _getUser } from "@docspace/shared/api/people";
import { getManyPDFTitle } from "@docspace/shared/utils/getPDFTite";
import type {
  TItem,
  TOnFilter,
} from "@docspace/ui-kit/components/filter/Filter.types";
import type { TSortBy } from "@docspace/shared/types";

import ViewRowsReactSvg from "PUBLIC_DIR/images/view-rows.react.svg";
import ViewTilesReactSvg from "PUBLIC_DIR/images/view-tiles.react.svg";

import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";

import { useAgentsUserStore, type AliasFilesStore } from "../../_store";

const getUser = _getUser as unknown as (id: string) => Promise<{
  displayName?: string;
} | null>;

// Per-alias configuration. Recent narrows the Type group; Favorites keeps
// the full set (Folders/Files/Archives included). Extend here when adding
// a new alias.
export type AliasFilterConfig = {
  useStore: () => AliasFilesStore;
  // Whether the Type group should include Folders / Files / Archives buckets
  // (true for Favorites, false for Recent — matches client's
  // `!isRecentFolder` gate in Home/Section/Filter).
  includeFoldersFilesArchivesInType: boolean;
  // Passed straight through to FilterComponent so it can apply alias-
  // specific tweaks (e.g. hides the Filter Type quick switch for Recent).
  isRecentFolder?: boolean;
  // Not consumed by FilterComponent (no such prop) — kept for readability
  // at call sites and future-proofing the alias config.
  isFavoritesFolder?: boolean;
  // Hide the Author group entirely — used by Trash where every item is
  // owned by the current user, so author filtering is meaningless. Mirrors
  // client `Home/Section/Filter/getFilterCommonOptions` which omits the
  // group for the trash section.
  hideAuthor?: boolean;
};

export default function useAliasFilesFilter(config: AliasFilterConfig) {
  const { t } = useTranslation(["Common", "Files"]);
  const store = config.useStore();
  const userStore = useAgentsUserStore();
  const settingsStore = useSettingsStore();

  const filter = store.filter;
  const userId = userStore.user?.id;
  const isCollaborator = userStore.user?.isCollaborator ?? false;
  const isVisitor = userStore.user?.isVisitor ?? false;

  const apply = React.useCallback(
    (next: FilesFilter) => {
      store.apply(next);
    },
    [store],
  );

  const onClearFilter = React.useCallback(() => {
    store.clearFilter();
  }, [store]);

  const onSearch = React.useCallback(
    (value: string) => {
      const next = filter.clone();
      next.search = value || null;
      next.page = 0;
      apply(next);
    },
    [filter, apply],
  );

  const getSelectedInputValue = React.useCallback(
    () => filter.search ?? "",
    [filter.search],
  );

  const onSort = React.useCallback(
    (sortId: string, sortDirection: string) => {
      const next = filter.clone();
      next.sortBy = sortId as TSortBy;
      next.sortOrder = sortDirection === "desc" ? "descending" : "ascending";
      next.page = 0;
      apply(next);
    },
    [filter, apply],
  );

  const getSortData = React.useCallback(
    () => [
      {
        id: "sort-by_name",
        key: SortByFieldName.Name,
        label: t("Common:Label", { defaultValue: "Name" }),
        default: true,
      },
      {
        id: "sort-by_modified",
        key: SortByFieldName.ModifiedDate,
        label: t("Common:LastModifiedDate", {
          defaultValue: "Last modified date",
        }),
        default: true,
      },
      {
        id: "sort-by_author",
        key: SortByFieldName.Author,
        label: t("Common:Owner", { defaultValue: "Owner" }),
        default: true,
      },
    ],
    [t],
  );

  const getSelectedSortData = React.useCallback(
    () =>
      ({
        sortId: (filter.sortBy ?? SortByFieldName.ModifiedDate) as TSortBy,
        sortDirection: filter.sortOrder === "ascending" ? "asc" : "desc",
      }) as { sortId: TSortBy; sortDirection: "asc" | "desc" },
    [filter.sortBy, filter.sortOrder],
  );

  // ── Type + Author ──────────────────────────────────────────────────────
  const onFilter: TOnFilter = React.useCallback(
    (data) => {
      const next = filter.clone();
      next.page = 0;

      next.filterType = getFilterType(data) as FilterType | null;

      const authorId = getAuthorType(data);
      if (authorId) {
        next.authorType =
          authorId === FilterKeys.me && userId
            ? `user_${userId}`
            : `user_${authorId}`;
      } else {
        next.authorType = null;
      }

      apply(next);
    },
    [filter, apply, userId],
  );

  const getFilterData = React.useCallback(async (): Promise<TItem[]> => {
    const authorOptions: TItem[] = config.hideAuthor
      ? []
      : [
          {
            key: FilterGroups.filterAuthor,
            group: FilterGroups.filterAuthor,
            label: t("Common:ByAuthor", { defaultValue: "Author" }),
            isHeader: true,
            isLast: false,
          },
          {
            id: "filter_author-me",
            key: FilterKeys.me,
            group: FilterGroups.filterAuthor,
            label: t("Common:MeLabel", { defaultValue: "Me" }),
          },
        ];

    if (!config.hideAuthor && !isCollaborator && !isVisitor) {
      authorOptions.push({
        id: "filter_author-user",
        key: FilterKeys.user,
        group: FilterGroups.filterAuthor,
        label: "",
        displaySelectorType: "link",
      });
      authorOptions.push({
        id: "filter_author-other",
        key: FilterKeys.other,
        group: FilterGroups.filterAuthor,
        label: t("Common:OtherLabel", { defaultValue: "Other" }),
      });
    }

    const typeOptions: TItem[] = [
      {
        key: FilterGroups.filterType,
        group: FilterGroups.filterType,
        label: t("Common:Type", { defaultValue: "Type" }),
        isHeader: true,
        isLast: true,
      },
    ];

    // Folders / Files / Archives — only for Favorites (full files list);
    // Recent omits them (mirrors client `!isRecentFolder` gate).
    if (config.includeFoldersFilesArchivesInType) {
      typeOptions.push(
        {
          id: "filter_type-folders",
          key: String(FilterType.FoldersOnly),
          group: FilterGroups.filterType,
          label: t("Common:Folders", { defaultValue: "Folders" }),
        },
        {
          id: "filter_type-files",
          key: String(FilterType.FilesOnly),
          group: FilterGroups.filterType,
          label: t("Common:Files", { defaultValue: "Files" }),
        },
      );
    }

    typeOptions.push(
      {
        id: "filter_type-documents",
        key: String(FilterType.DocumentsOnly),
        group: FilterGroups.filterType,
        label: t("Common:Documents", { defaultValue: "Documents" }),
      },
      {
        id: "filter_type-spreadsheets",
        key: String(FilterType.SpreadsheetsOnly),
        group: FilterGroups.filterType,
        label: t("Common:Spreadsheets", { defaultValue: "Spreadsheets" }),
      },
      {
        id: "filter_type-presentations",
        key: String(FilterType.PresentationsOnly),
        group: FilterGroups.filterType,
        label: t("Common:Presentations", { defaultValue: "Presentations" }),
      },
      {
        id: "filter_type-pdf",
        key: String(FilterType.Pdf),
        group: FilterGroups.filterType,
        label: getManyPDFTitle(t, false),
      },
      {
        id: "filter_type-forms",
        key: String(FilterType.PDFForm),
        group: FilterGroups.filterType,
        label: getManyPDFTitle(t, true),
      },
      {
        id: "filter_type-diagrams",
        key: String(FilterType.DiagramsOnly),
        group: FilterGroups.filterType,
        label: t("Common:Diagrams", { defaultValue: "Diagrams" }),
      },
    );

    if (config.includeFoldersFilesArchivesInType) {
      typeOptions.push({
        id: "filter_type-archive",
        key: String(FilterType.ArchiveOnly),
        group: FilterGroups.filterType,
        label: t("Common:Archives", { defaultValue: "Archives" }),
      });
    }

    typeOptions.push(
      {
        id: "filter_type-images",
        key: String(FilterType.ImagesOnly),
        group: FilterGroups.filterType,
        label: t("Common:Images", { defaultValue: "Images" }),
      },
      {
        id: "filter_type-media",
        key: String(FilterType.MediaOnly),
        group: FilterGroups.filterType,
        label: t("Common:Media", { defaultValue: "Media" }),
      },
    );

    // Author-less aliases (Trash) need the Type header to be the last group
    // header — flip `isLast` on the Type header when Author is hidden.
    if (config.hideAuthor) {
      typeOptions[0] = { ...typeOptions[0], isLast: true };
    }

    return [...authorOptions, ...typeOptions];
  }, [
    t,
    isCollaborator,
    isVisitor,
    config.includeFoldersFilesArchivesInType,
    config.hideAuthor,
  ]);

  // Maps a stored FilterType code back to its label — used to populate the
  // chip that appears under the filter bar after a type is picked.
  const getTypeLabel = React.useCallback(
    (type: FilterType): string => {
      switch (type) {
        case FilterType.FoldersOnly:
          return t("Common:Folders", { defaultValue: "Folders" });
        case FilterType.FilesOnly:
          return t("Common:Files", { defaultValue: "Files" });
        case FilterType.DocumentsOnly:
          return t("Common:Documents", { defaultValue: "Documents" });
        case FilterType.SpreadsheetsOnly:
          return t("Common:Spreadsheets", { defaultValue: "Spreadsheets" });
        case FilterType.PresentationsOnly:
          return t("Common:Presentations", { defaultValue: "Presentations" });
        case FilterType.Pdf:
          return getManyPDFTitle(t, false);
        case FilterType.PDFForm:
          return getManyPDFTitle(t, true);
        case FilterType.DiagramsOnly:
          return t("Common:Diagrams", { defaultValue: "Diagrams" });
        case FilterType.ArchiveOnly:
          return t("Common:Archives", { defaultValue: "Archives" });
        case FilterType.ImagesOnly:
          return t("Common:Images", { defaultValue: "Images" });
        case FilterType.MediaOnly:
          return t("Common:Media", { defaultValue: "Media" });
        default:
          return "";
      }
    },
    [t],
  );

  const parseAuthorId = React.useCallback((raw: string | null) => {
    if (!raw) return null;
    const m = /^(?:user|group)_(.+)$/.exec(raw);
    return m ? m[1] : raw;
  }, []);

  const getSelectedFilterData = React.useCallback(async (): Promise<
    TItem[]
  > => {
    const out: TItem[] = [];

    if (filter.filterType != null) {
      out.push({
        key: String(filter.filterType),
        group: FilterGroups.filterType,
        label: getTypeLabel(filter.filterType),
      });
    }

    const authorRaw = parseAuthorId(filter.authorType);
    if (authorRaw) {
      const isMe = userId === authorRaw;
      let label = isMe
        ? t("Common:MeLabel", { defaultValue: "Me" })
        : authorRaw;
      try {
        if (!isMe) {
          const user = await getUser(authorRaw);
          label = user?.displayName ?? authorRaw;
        }
      } catch {
        // fall back to raw id
      }
      out.push({
        key: isMe ? FilterKeys.me : authorRaw,
        group: FilterGroups.filterAuthor,
        label,
        selectedLabel: `${t("Common:ByAuthor", { defaultValue: "Author" })}: ${label}`,
      });
    }

    return out;
  }, [
    filter.filterType,
    filter.authorType,
    parseAuthorId,
    getTypeLabel,
    t,
    userId,
  ]);

  const initSelectedFilterData = React.useMemo<TItem[]>(() => {
    const out: TItem[] = [];
    if (filter.filterType != null) {
      out.push({
        key: String(filter.filterType),
        group: FilterGroups.filterType,
        label: getTypeLabel(filter.filterType),
      });
    }
    const authorRaw = parseAuthorId(filter.authorType);
    if (authorRaw) {
      const isMe = userId === authorRaw;
      const label = isMe
        ? t("Common:MeLabel", { defaultValue: "Me" })
        : authorRaw;
      out.push({
        key: isMe ? FilterKeys.me : authorRaw,
        group: FilterGroups.filterAuthor,
        label,
        selectedLabel: `${t("Common:ByAuthor", { defaultValue: "Author" })}: ${label}`,
      });
    }
    return out;
    // initSelectedFilterData should snapshot mount-time state only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── View-as ────────────────────────────────────────────────────────────
  const getViewSettingsData = React.useCallback(
    () => [
      {
        id: "view-switch_rows",
        value: "row",
        label: t("Common:ViewList", { defaultValue: "List view" }),
        icon: <ViewRowsReactSvg />,
      },
      {
        id: "view-switch_tiles",
        value: "tile",
        label: t("Common:ViewTiles", { defaultValue: "Tile view" }),
        icon: <ViewTilesReactSvg />,
      },
    ],
    [t],
  );

  // View-as lives in the docspace SettingsStore (shared with the body's
  // List) — toggling here is what flips the row/tile/table renderer.
  const onChangeViewAs = React.useCallback(() => {
    const isDesktopWidth =
      typeof window !== "undefined" && window.innerWidth > 1024;
    const current = settingsStore.filesViewAs ?? "row";
    const next = current === "tile" ? (isDesktopWidth ? "table" : "row") : "tile";
    settingsStore.setFilesViewAs(next);
  }, [settingsStore]);

  const removeSelectedItem = React.useCallback(
    ({ group }: { key: string | number; group?: FilterGroups }) => {
      const next = filter.clone();
      if (group === FilterGroups.filterType) next.filterType = null;
      if (group === FilterGroups.filterAuthor) next.authorType = null;
      next.page = 0;
      apply(next);
    },
    [filter, apply],
  );

  const clearAll = React.useCallback(() => {
    onClearFilter();
  }, [onClearFilter]);

  return {
    onClearFilter,
    onSearch,
    getSelectedInputValue,
    onSort,
    getSortData,
    getSelectedSortData,
    onFilter,
    getFilterData,
    getSelectedFilterData,
    getViewSettingsData,
    onChangeViewAs,
    removeSelectedItem,
    clearAll,
    initSelectedFilterData,
  };
}
