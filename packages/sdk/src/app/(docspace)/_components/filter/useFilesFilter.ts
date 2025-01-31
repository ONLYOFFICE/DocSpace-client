import React from "react";
import { useTranslation } from "react-i18next";

import {
  TItem,
  TOnFilter,
} from "@docspace/shared/components/filter/Filter.types";
import FilesFilter from "@docspace/shared/api/files/filter";
import {
  FilterType,
  FilterGroups,
  FilterKeys,
  SortByFieldName,
} from "@docspace/shared/enums";

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

  const [filter, setFilter] = React.useState<FilesFilter>();

  React.useEffect(() => {
    setFilter(FilesFilter.getFilter(window.location)!);
  }, []);

  const onClearFilter = React.useCallback(() => {}, []);

  const onSearch = React.useCallback((value: string) => {}, []);

  const getSelectedInputValue = React.useCallback(() => "", []);

  const onSort = React.useCallback(() => {}, []);

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

  const getSelectedSortData = React.useCallback(() => {}, []);

  const onFilter: TOnFilter = React.useCallback((value) => {}, []);

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

  const getSelectedFilterData = React.useCallback(() => [], []);

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

  const onChangeViewAs = React.useCallback(() => {}, []);

  const removeSelectedItem = React.useCallback(() => {}, []);

  const clearAll = React.useCallback(() => {}, []);

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
