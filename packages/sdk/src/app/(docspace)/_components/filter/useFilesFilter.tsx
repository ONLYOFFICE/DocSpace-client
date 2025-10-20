import React from "react";
import { useTranslation } from "react-i18next";
import { usePathname, useSearchParams } from "next/navigation";

import {
  TItem,
  TOnFilter,
} from "@docspace/shared/components/filter/Filter.types";
import FilesFilter from "@docspace/shared/api/files/filter";
import { getFilterType } from "@docspace/shared/components/filter/Filter.utils";
import {
  FilterGroups,
  FilterType,
  SortByFieldName,
} from "@docspace/shared/enums";
import { TSortBy, type TViewAs } from "@docspace/shared/types";
import { getManyPDFTitle } from "@docspace/shared/utils/getPDFTite";

import ViewRowsReactSvg from "PUBLIC_DIR/images/view-rows.react.svg";
import ViewTilesReactSvg from "PUBLIC_DIR/images/view-tiles.react.svg";

import { PAGE_COUNT } from "@/utils/constants";

type useFilesFiltersProps = {
  filesFilter: string;
  shareKey?: string;
  filesViewAs: TViewAs | null;
  setFilesViewAs: (viewAs: TViewAs) => void;
};

export default function useFilesFilter({
  filesFilter,
  shareKey,
  filesViewAs,
  setFilesViewAs,
}: useFilesFiltersProps) {
  const { t } = useTranslation(["Common"]);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [filter, setFilter] = React.useState<FilesFilter>(
    FilesFilter.getFilter({ search: `?${filesFilter}`, pathname } as Location)!,
  );

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

      const newFilter = filter.clone();
      newFilter.page = 0;

      newFilter.filterType = filterType;

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
        label: t("Common:Folders"),
      },
      {
        id: "filter_type-all-files",
        key: FilterType.FilesOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Files"),
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
        id: "filter_type-forms",
        key: FilterType.PDFForm.toString(),
        group: FilterGroups.filterType,
        label: getManyPDFTitle(t, true),
      },
      {
        id: "filter_type-pdf",
        key: FilterType.Pdf.toString(),
        group: FilterGroups.filterType,
        label: getManyPDFTitle(t, false),
      },
      {
        id: "filter_type-diagrams",
        key: FilterType.DiagramsOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Diagrams"),
      },
      {
        id: "filter_type-archive",
        key: FilterType.ArchiveOnly.toString(),
        group: FilterGroups.filterType,
        label: t("Common:Archives"),
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

    return [...typeOptions];
  }, [t]);

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
  }, [filter.filterType, t]);

  const initSelectedFilterData = React.useMemo(
    () => getSelectedFilterData(),
    [], // should be calculated once
  );

  const getViewSettingsData = React.useCallback(() => {
    const viewSettings = [
      {
        id: "view-switch_rows",
        value: "row",
        label: t("Files:ViewList"),
        icon: <ViewRowsReactSvg />,
      },
      {
        id: "view-switch_tiles",
        value: "tile",
        label: t("Files:ViewTiles"),
        icon: <ViewTilesReactSvg />,
      },
    ];

    return viewSettings;
  }, [t]);

  const onChangeViewAs = React.useCallback(() => {
    const newViewAs = filesViewAs === "tile" ? "row" : "tile";

    setFilesViewAs(newViewAs);
  }, [setFilesViewAs, filesViewAs]);

  const removeSelectedItem = React.useCallback(
    ({ group }: { key: string | number; group?: FilterGroups }) => {
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
    initSelectedFilterData,
  };
}
