import React from "react";
import { useTranslation } from "react-i18next";
import { usePathname, useSearchParams } from "next/navigation";

import {
  TItem,
  TOnFilter,
} from "@docspace/ui-kit/components/filter/Filter.types";
import FilesFilter from "@docspace/shared/api/files/filter";
import { frameCallEvent } from "@docspace/shared/utils/common";
import {
  getFilterType,
  getAuthorType,
} from "@docspace/ui-kit/components/filter/Filter.utils";
import {
  FilterGroups,
  FilterType,
  FilterKeys,
  SortByFieldName,
} from "@docspace/shared/enums";
import { getUser as _getUser } from "@docspace/shared/api/people";
import { TSortBy, type TViewAs } from "@docspace/shared/types";
import { getManyPDFTitle } from "@docspace/shared/utils/getPDFTite";

import ViewRowsReactSvg from "PUBLIC_DIR/images/view-rows.react.svg";
import ViewTilesReactSvg from "PUBLIC_DIR/images/view-tiles.react.svg";

import { useDocsUserStore } from "@/app/(personal-files)/_store/DocsUserStore";
import { PAGE_COUNT } from "@/utils/constants";

const getUser = _getUser as unknown as (id: string) => Promise<{
  displayName?: string;
} | null>;

type useFilesFiltersProps = {
  filesFilter: string;
  shareKey?: string;
  currentFolderId?: string | number;
  filesViewAs: TViewAs | null;
  setFilesViewAs: (viewAs: TViewAs) => void;
  setClearSearch: (value: boolean) => void;
};

export default function useFilesFilter({
  filesFilter,
  shareKey,
  currentFolderId,
  filesViewAs,
  setFilesViewAs,
  setClearSearch,
}: useFilesFiltersProps) {
  const { t } = useTranslation(["Common"]);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const userStore = useDocsUserStore();
  const userId = userStore.user?.id;
  const isCollaborator = userStore.user?.isCollaborator ?? false;
  const isVisitor = userStore.user?.isVisitor ?? false;

  const parseFromLocation = React.useCallback(
    (loc: Pick<Location, "search" | "pathname">) => {
      const next = FilesFilter.getFilter(loc as Location)!;
      if (currentFolderId != null) {
        next.folder = String(currentFolderId);
      }
      return next;
    },
    [currentFolderId],
  );

  const [filter, setFilter] = React.useState<FilesFilter>(() =>
    parseFromLocation({ search: `?${filesFilter}`, pathname }),
  );

  React.useEffect(() => {
    setFilter(parseFromLocation(window.location));
  }, [searchParams, parseFromLocation]);

  const onClearFilter = React.useCallback(() => {
    const defaultFilter = FilesFilter.getDefault();

    defaultFilter.pageCount = PAGE_COUNT;
    defaultFilter.page = 0;
    defaultFilter.folder = filter.folder;
    defaultFilter.key = shareKey ?? "";

    setFilter(defaultFilter);

    const urlFilter = defaultFilter.toUrlParams();

    window.history.pushState(null, "", `?${urlFilter}`);

    frameCallEvent({ event: "onFilterSearch", data: { search: "" } });

    setClearSearch(true);
  }, [filter.folder, shareKey, setClearSearch]);

  const onSearch = React.useCallback(
    (value: string) => {
      const modifiedFilter = filter.clone();

      modifiedFilter.search = value;
      modifiedFilter.page = 0;
      modifiedFilter.pageCount = PAGE_COUNT;

      setFilter(modifiedFilter);

      const urlFilter = modifiedFilter.toUrlParams();

      window.history.pushState(null, "", `?${urlFilter}`);

      frameCallEvent({ event: "onFilterSearch", data: { search: value } });
    },
    [filter],
  );

  const getSelectedInputValue = React.useCallback(() => {
    return filter.search ?? "";
  }, [filter.search]);

  const onSort = React.useCallback(
    (sortId: string, sortDirection: string) => {
      const sortBy = sortId;
      const sortOrder = sortDirection === "desc" ? "descending" : "ascending";

      const newFilter = filter.clone();
      newFilter.sortBy = sortBy as TSortBy;
      newFilter.sortOrder = sortOrder;
      newFilter.page = 0;
      newFilter.pageCount = PAGE_COUNT;

      setFilter(newFilter);

      const urlFilter = newFilter.toUrlParams();

      window.history.pushState(null, "", `?${urlFilter}`);
    },
    [filter],
  );

  const getSortData = React.useCallback(() => {
    const name = {
      id: "sort-by_name",
      key: SortByFieldName.Name,
      label: t("Common:Label"),
      default: true,
    };
    const modifiedDate = {
      id: "sort-by_modified",
      key: SortByFieldName.ModifiedDate,
      label: t("Common:LastModifiedDate"),
      default: true,
    };

    const size = {
      id: "sort-by_size",
      key: SortByFieldName.Size,
      label: t("Common:Size"),
      default: true,
    };

    return [name, modifiedDate, size];
  }, [t]);

  const getSelectedSortData = React.useCallback(() => {
    return {
      sortId: filter.sortBy,
      sortDirection: filter.sortOrder === "ascending" ? "asc" : "desc",
    } as { sortId: TSortBy; sortDirection: "asc" | "desc" };
  }, [filter.sortBy, filter.sortOrder]);

  const onFilter: TOnFilter = React.useCallback(
    (data) => {
      const filterType = getFilterType(data) || null;

      const newFilter = filter.clone();
      newFilter.page = 0;

      newFilter.filterType = filterType;

      const authorId = getAuthorType(data);
      if (authorId) {
        newFilter.authorType =
          authorId === FilterKeys.me && userId
            ? `user_${userId}`
            : `user_${authorId}`;
      } else {
        newFilter.authorType = null;
      }

      setFilter(newFilter);

      const urlFilter = newFilter.toUrlParams();

      window.history.pushState(null, "", `?${urlFilter}`);
    },
    [filter, userId],
  );

  const getFilterData = React.useCallback(async () => {
    // By Author group — mirrors client `Home/Section/Filter/getAuthorFilter`.
    // "Me" + a person selector are always offered; the "Other" bucket is
    // hidden for collaborators/visitors who can only see their own items.
    const authorOptions: TItem[] = [
      {
        key: FilterGroups.filterAuthor,
        group: FilterGroups.filterAuthor,
        label: t("Common:ByAuthor"),
        isHeader: true,
      },
      {
        id: "filter_author-me",
        key: FilterKeys.me,
        group: FilterGroups.filterAuthor,
        label: t("Common:MeLabel"),
      },
      {
        id: "filter_author-user",
        key: FilterKeys.user,
        group: FilterGroups.filterAuthor,
        label: "",
        displaySelectorType: "link",
      },
    ];

    if (!isCollaborator && !isVisitor) {
      authorOptions.push({
        id: "filter_author-other",
        key: FilterKeys.other,
        group: FilterGroups.filterAuthor,
        label: t("Common:OtherLabel"),
      });
    }

    // Type group. This filter is hardcoded to the Recent folder, so it omits
    // the Folders / Files / Archives buckets (recent lists files only) —
    // matching the client's `!isRecentFolder` gate in Home/Section/Filter.
    const typeOptions: TItem[] = [
      {
        key: FilterGroups.filterType,
        group: FilterGroups.filterType,
        label: t("Common:Type"),
        isHeader: true,
        isLast: true,
      },
      {
        id: "filter_type-documents",
        key: FilterType.DocumentsOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Documents"),
      },
      {
        id: "filter_type-spreadsheets",
        key: FilterType.SpreadsheetsOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Spreadsheets"),
      },
      {
        id: "filter_type-presentations",
        key: FilterType.PresentationsOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Presentations"),
      },
      {
        id: "filter_type-pdf",
        key: FilterType.Pdf.toString(),
        group: FilterGroups.filterType,
        label: getManyPDFTitle(t, false),
      },
      {
        id: "filter_type-forms",
        key: FilterType.PDFForm.toString(),
        group: FilterGroups.filterType,
        label: getManyPDFTitle(t, true),
      },
      {
        id: "filter_type-diagrams",
        key: FilterType.DiagramsOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Diagrams"),
      },
      {
        id: "filter_type-images",
        key: FilterType.ImagesOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Images"),
      },
      {
        id: "filter_type-media",
        key: FilterType.MediaOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Media"),
      },
    ];

    return [...authorOptions, ...typeOptions];
  }, [t, isCollaborator, isVisitor]);

  const parseAuthorId = React.useCallback((raw: string | null) => {
    if (!raw) return null;
    const m = /^(?:user|group)_(.+)$/.exec(raw);
    return m ? m[1] : raw;
  }, []);

  const getSelectedFilterData = React.useCallback(async () => {
    const filterValues: TItem[] = [];

    const sp = new URLSearchParams(window.location.search);
    const tagsRaw = sp.get("tags");
    if (tagsRaw) {
      try {
        const parsed = JSON.parse(tagsRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((tag: string) => {
            filterValues.push({
              key: `tag-${tag}`,
              label: tag,
              group: FilterGroups.roomFilterTags,
            });
          });
        }
      } catch {
        // ignore
      }
    }

    // By Author chip — resolve the stored `user_<id>` back to a label:
    // "Me" for the current user, otherwise the person's display name.
    const authorRaw = parseAuthorId(filter.authorType);
    if (authorRaw) {
      const isMe = userId === authorRaw;
      let label = isMe ? t("Common:MeLabel") : authorRaw;
      if (!isMe) {
        try {
          const user = await getUser(authorRaw);
          label = user?.displayName ?? authorRaw;
        } catch {
          // fall back to the raw id
        }
      }
      filterValues.push({
        key: isMe ? FilterKeys.me : authorRaw,
        group: FilterGroups.filterAuthor,
        label,
        selectedLabel: `${t("Common:ByAuthor")}: ${label}`,
      });
    }

    if (filter.filterType) {
      let label = "";

      switch (filter.filterType.toString()) {
        case FilterType.DocumentsOnly.toString():
          label = t("Common:Documents");
          break;
        case FilterType.FoldersOnly.toString():
          label = t("Common:Folders");
          break;
        case FilterType.SpreadsheetsOnly.toString():
          label = t("Common:Spreadsheets");
          break;
        case FilterType.ArchiveOnly.toString():
          label = t("Common:Archives");
          break;
        case FilterType.PresentationsOnly.toString():
          label = t("Common:Presentations");
          break;
        case FilterType.DiagramsOnly.toString():
          label = t("Common:Diagrams");
          break;
        case FilterType.ImagesOnly.toString():
          label = t("Common:Images");
          break;
        case FilterType.MediaOnly.toString():
          label = t("Common:Media");
          break;
        case FilterType.FilesOnly.toString():
          label = t("Common:Files");
          break;
        case FilterType.Pdf.toString():
          label = getManyPDFTitle(t, false);
          break;
        case FilterType.PDFForm.toString():
          label = getManyPDFTitle(t, true);
          break;
        default:
          break;
      }

      filterValues.push({
        key: `${filter.filterType}`,
        label,
        group: FilterGroups.filterType,
      });
    }

    return filterValues;
  }, [
    filter.filterType,
    filter.authorType,
    parseAuthorId,
    userId,
    t,
    searchParams,
  ]);

  const initSelectedFilterData = React.useMemo<TItem[]>(() => {
    const filterValues: TItem[] = [];

    const authorRaw = parseAuthorId(filter.authorType);
    if (authorRaw) {
      const isMe = userId === authorRaw;
      const label = isMe ? t("Common:MeLabel") : authorRaw;
      filterValues.push({
        key: isMe ? FilterKeys.me : authorRaw,
        group: FilterGroups.filterAuthor,
        label,
        selectedLabel: `${t("Common:ByAuthor")}: ${label}`,
      });
    }

    if (filter.filterType) {
      filterValues.push({
        key: `${filter.filterType}`,
        label: "",
        group: FilterGroups.filterType,
      });
    }

    return filterValues;
    // initSelectedFilterData should snapshot mount-time state only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getViewSettingsData = React.useCallback(() => {
    const viewSettings = [
      {
        id: "view-switch_rows",
        value: "row",
        label: t("Common:ViewList"),
        icon: <ViewRowsReactSvg />,
      },
      {
        id: "view-switch_tiles",
        value: "tile",
        label: t("Common:ViewTiles"),
        icon: <ViewTilesReactSvg />,
      },
    ];

    return viewSettings;
  }, [t]);

  const onChangeViewAs = React.useCallback(() => {
    if (filesViewAs === "tile") {
      const isDesktopWidth = window.innerWidth > 1024;
      setFilesViewAs(isDesktopWidth ? "table" : "row");
    } else {
      setFilesViewAs("tile");
    }
  }, [setFilesViewAs, filesViewAs]);

  const removeSelectedItem = React.useCallback(
    ({ key, group }: { key: string | number; group?: FilterGroups }) => {
      const newFilter = filter.clone();

      if (group === FilterGroups.filterType) {
        newFilter.filterType = null;
      }
      if (group === FilterGroups.filterAuthor) {
        newFilter.authorType = null;
        newFilter.excludeSubject = null;
      }
      if (group === FilterGroups.filterRoom) {
        newFilter.roomId = null;
      }

      newFilter.page = 0;

      setFilter(newFilter);

      const sp = new URLSearchParams(newFilter.toUrlParams());

      if (group === FilterGroups.roomFilterTags) {
        const tagsRaw = window.location.search
          ? new URLSearchParams(window.location.search).get("tags")
          : null;
        if (tagsRaw) {
          try {
            const parsed = JSON.parse(tagsRaw);
            if (Array.isArray(parsed)) {
              const removed = String(key).replace(/^tag-/, "");
              const remaining = parsed.filter((t: string) => t !== removed);
              if (remaining.length) {
                sp.set("tags", JSON.stringify(remaining));
              } else {
                sp.delete("tags");
              }
            }
          } catch {
            sp.delete("tags");
          }
        }
      } else {
        const existingTags = new URLSearchParams(window.location.search).get(
          "tags",
        );
        if (existingTags) sp.set("tags", existingTags);
      }

      window.history.pushState(null, "", `?${sp.toString()}`);
    },
    [filter],
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

