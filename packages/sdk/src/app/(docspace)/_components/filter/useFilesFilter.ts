import React from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";

import {
  TItem,
  TOnFilter,
} from "@docspace/shared/components/filter/Filter.types";
import FilesFilter from "@docspace/shared/api/files/filter";
import {
  getFilterType,
  getAuthorType,
  getSearchParams,
  getFilterContent,
  getRoomId,
} from "@docspace/shared/components/filter/Filter.utils";
import {
  FilterType,
  FilterGroups,
  FilterKeys,
  SortByFieldName,
} from "@docspace/shared/enums";
import { Nullable, TSortBy } from "@docspace/shared/types";

import ViewRowsReactSvgUrl from "PUBLIC_DIR/images/view-rows.react.svg?url";
import ViewTilesReactSvgUrl from "PUBLIC_DIR/images/view-tiles.react.svg?url";

import { PAGE_COUNT } from "@/utils/constants";

type useFiltesFiltersProps = {
  filesFilter: string;
  shareKey?: string;
  canSearchByContent: boolean;
};

export default function useFilesFilter({
  filesFilter,
  shareKey,
  canSearchByContent,
}: useFiltesFiltersProps) {
  const { t } = useTranslation(["Common"]);
  const searchParams = useSearchParams();

  const [filter, setFilter] = React.useState<FilesFilter>(
    FilesFilter.getFilter({ search: `?${filesFilter}` } as Location)!,
  );
  const [, setSelectedFilterValues] = React.useState<Nullable<TItem[]>>(null);

  const isSSR = React.useRef<boolean>(true);

  React.useEffect(() => {
    isSSR.current = false;
  }, []);

  React.useEffect(() => {
    setFilter(FilesFilter.getFilter(window.location)!);
  }, [searchParams]);

  const onClearFilter = React.useCallback(() => {
    const defaultFilter = FilesFilter.getDefault();

    defaultFilter.pageCount = PAGE_COUNT;
    defaultFilter.page = 0;
    defaultFilter.folder = filter.folder;
    defaultFilter.key = shareKey ?? "";

    setFilter(defaultFilter);

    const urlFilter = defaultFilter.toUrlParams();

    window.history.pushState(null, "", urlFilter);
  }, [filter.folder, shareKey]);

  const onSearch = React.useCallback(
    (value: string) => {
      const modifiedFilter = filter.clone();

      modifiedFilter.search = value;
      modifiedFilter.page = 0;
      modifiedFilter.pageCount = PAGE_COUNT;

      setFilter(modifiedFilter);

      const urlFilter = modifiedFilter.toUrlParams();

      window.history.pushState(null, "", `?${urlFilter}`);
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

      const withSubfolders = getSearchParams(data);
      const withContent = getFilterContent(data);

      const newFilter = filter.clone();
      newFilter.page = 0;

      newFilter.filterType = filterType;

      newFilter.withSubfolders =
        withSubfolders === FilterKeys.excludeSubfolders ? false : true;

      newFilter.searchInContent = withContent === "true" ? true : null;

      setFilter(newFilter);

      const urlFilter = newFilter.toUrlParams();

      window.history.pushState(null, "", `?${urlFilter}`);
    },
    [filter],
  );

  const getFilterData = React.useCallback(async () => {
    const typeOptions = [
      {
        key: FilterGroups.filterType,
        group: FilterGroups.filterType,
        label: t("Common:Type"),
        isHeader: true,
        isLast: true,
      },
      {
        id: "filter_type-folders",
        key: FilterType.FoldersOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Folders").toLowerCase(),
      },
      {
        id: "filter_type-all-files",
        key: FilterType.FilesOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Files").toLowerCase(),
      },
      {
        id: "filter_type-documents",
        key: FilterType.DocumentsOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Documents").toLowerCase(),
      },
      {
        id: "filter_type-spreadsheets",
        key: FilterType.SpreadsheetsOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Spreadsheets").toLowerCase(),
      },
      {
        id: "filter_type-presentations",
        key: FilterType.PresentationsOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Presentations").toLowerCase(),
      },
      {
        id: "filter_type-forms",
        key: FilterType.Pdf.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Forms").toLowerCase(),
      },
      {
        id: "filter_type-archive",
        key: FilterType.ArchiveOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Archives").toLowerCase(),
      },
      {
        id: "filter_type-images",
        key: FilterType.ImagesOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Images").toLowerCase(),
      },
      {
        id: "filter_type-media",
        key: FilterType.MediaOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Media").toLowerCase(),
      },
    ];

    const foldersOptions = [
      {
        key: FilterGroups.filterFolders,
        group: FilterGroups.filterFolders,
        label: t("Common:Search"),
        isHeader: true,
        withoutSeparator: true,
      },
      {
        id: "filter_folders",
        key: "folders",
        group: FilterGroups.filterFolders,
        label: "",
        withOptions: true,
        options: [
          {
            id: "filter_folders_exclude-subfolders",
            key: FilterKeys.excludeSubfolders,
            label: t("ExcludeSubfolders"),
          },
          {
            id: "filter_folders_with-subfolders",
            key: FilterKeys.withSubfolders,
            label: t("WithSubfolders"),
          },
        ],
      },
    ];

    const contentOptions: TItem[] = [
      {
        key: FilterGroups.filterContent,
        group: FilterGroups.filterContent,
        isHeader: true,
        withoutHeader: true,
        label: "",
      },
    ];

    if (canSearchByContent) {
      contentOptions.push({
        id: "filter_search-by-file-contents",
        key: "true" as FilterGroups,
        group: FilterGroups.filterContent,
        label: t("SearchByContent"),
        isCheckbox: true,
      });
    }

    return [...foldersOptions, ...contentOptions, ...typeOptions];
  }, [t, canSearchByContent]);

  const getSelectedFilterData = React.useCallback(() => {
    const filterValues: TItem[] = [];

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
          label = t("Common:Forms");
          break;
        default:
          break;
      }

      filterValues.push({
        key: `${filter.filterType}`,
        label: label.toLowerCase(),
        group: FilterGroups.filterType,
      });
    }

    if (filter.withSubfolders) {
      filterValues.push({
        key: FilterKeys.withSubfolders,
        label: t("Common:WithSubfolders"),
        group: FilterGroups.filterFolders,
      });
    }

    if (filter.searchInContent) {
      filterValues.push({
        key: "true",
        label: t("FileContents"),
        group: FilterGroups.filterContent,
      });
    }

    const currentFilterValues: TItem[] = [];

    setSelectedFilterValues((value: Nullable<TItem[]>) => {
      if (!value) {
        currentFilterValues.push(...filterValues);

        return filterValues.map((f) => ({ ...f }));
      }

      const items = value.map((v) => {
        const item = filterValues.find((f) => f.group === v.group);

        if (item) {
          if (item.isMultiSelect) {
            let isEqual = true;

            if (Array.isArray(item.key))
              item.key.forEach((k) => {
                if (Array.isArray(v.key) && !v.key.includes(k)) {
                  isEqual = false;
                }
              });

            if (isEqual) return item;

            return false;
          }
          if (item.key === v.key) return item;
          return false;
        }
        return false;
      });

      const newItems = filterValues.filter(
        (v) => !items.find((i) => i && i.group === v.group),
      );

      const filteredItems = items.filter((i) => i) as TItem[];

      currentFilterValues.push(...filteredItems);

      return filteredItems;
    });

    return isSSR ? filterValues : currentFilterValues;
  }, [filter.filterType, filter.searchInContent, filter.withSubfolders, t]);

  const getViewSettingsData = React.useCallback(() => {
    const viewSettings = [
      {
        id: "view-switch_rows",
        value: "row",
        label: t("Common:ViewList"),
        icon: ViewRowsReactSvgUrl,
      },
      {
        id: "view-switch_tiles",
        value: "tile",
        label: t("Common:ViewTiles"),
        icon: ViewTilesReactSvgUrl,
      },
    ];

    return viewSettings;
  }, [t]);

  // TODO: implement onChangeViewAs
  const onChangeViewAs = React.useCallback(() => {}, []);

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
      if (group === FilterGroups.filterFolders) {
        newFilter.withSubfolders = null;
      }
      if (group === FilterGroups.filterContent) {
        newFilter.searchInContent = null;
      }
      if (group === FilterGroups.filterRoom) {
        newFilter.roomId = null;
      }

      newFilter.page = 0;

      setFilter(newFilter);

      const urlFilter = newFilter.toUrlParams();

      window.history.pushState(null, "", `?${urlFilter}`);
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
  };
}
