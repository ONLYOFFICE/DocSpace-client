// (c) Copyright Ascensio System SIA 2009-2025
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
import React from "react";
import { observer } from "mobx-react";
import { usePathname, useSearchParams } from "next/navigation";

import api from "@docspace/shared/api";
import FilesFilter from "@docspace/shared/api/files/filter";

import { PAGE_COUNT } from "@/utils/constants";

import { useSettingsStore } from "@/app/(docspace)/_store/SettingsStore";
import { useFilesSelectionStore } from "@/app/(docspace)/_store/FilesSelectionStore";

import useItemIcon from "@/app/(docspace)/_hooks/useItemIcon";
import useItemList, {
  TFolderItem,
  TFileItem,
} from "@/app/(docspace)/_hooks/useItemList";
import { useFilesListStore } from "@/app/(docspace)/_store/FilesListStore";

import RowView from "../row-view";
import TileView from "../tile-view";
import EmptyView from "../empty-view";

import { ListProps } from "./List.types";
import useResetSelectionClick from "./hooks/useResetSelectionClick";

const List = ({
  folders,
  files,
  filesSettings,
  filesFilter,
  portalSettings,
  shareKey,
  total: totalProp,
  current,
}: ListProps) => {
  const timezone = portalSettings.timezone;
  const displayFileExtension = filesSettings.displayFileExtension;
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const { setIsEmptyList, filesViewAs } = useSettingsStore();
  const { setItems } = useFilesListStore();
  const { setSelection, setBufferSelection } = useFilesSelectionStore();

  useResetSelectionClick({ setSelection, setBufferSelection });

  const { getIcon } = useItemIcon({
    filesSettings,
  });

  const { convertFileToItem, convertFolderToItem } = useItemList({
    getIcon,
    shareKey,
  });

  const [filter, setFilter] = React.useState<FilesFilter>(
    FilesFilter.getFilter({
      search: `?${filesFilter}`,
      pathname,
    } as Location)!,
  );
  const [filesList, setFilesList] = React.useState<(TFolderItem | TFileItem)[]>(
    [...folders.map(convertFolderToItem), ...files.map(convertFileToItem)],
  );
  const [total, setTotal] = React.useState<number>(totalProp);
  const [hasNextPage, setHasNextPage] = React.useState<boolean>(
    filesList.length < total,
  );

  const requestRunning = React.useRef(false);
  const isInit = React.useRef(false);

  const fetchMoreFiles = React.useCallback(async () => {
    if (!hasNextPage || requestRunning.current) return;
    requestRunning.current = true;

    filter.page += 1;
    filter.pageCount = PAGE_COUNT;

    const res = await api.files.getFolder(
      filter.folder,
      filter,
      new AbortController().signal,
      shareKey,
    );

    const { files: newFiles, folders: newFolders, total: newTotal } = res;

    const newItems = [
      ...newFolders.map(convertFolderToItem),
      ...newFiles.map(convertFileToItem),
    ];

    let hasNext = false;
    setFilesList((val) => {
      const newVal = [...val, ...newItems];

      hasNext = newTotal > newVal.length;

      return newVal;
    });
    setTotal(newTotal);
    setHasNextPage(hasNext);
    setFilter(filter);
    requestRunning.current = false;
  }, [filter, shareKey, hasNextPage, convertFolderToItem, convertFileToItem]);

  React.useEffect(() => {
    if (!isInit.current || requestRunning.current) {
      isInit.current = true;

      return;
    }

    const fetchFolder = async () => {
      requestRunning.current = true;
      const newFilter = FilesFilter.getFilter(window.location)!;

      newFilter.page = 0;
      newFilter.pageCount = PAGE_COUNT;

      const res = await api.files.getFolder(
        newFilter.folder,
        newFilter,
        new AbortController().signal,
        shareKey,
      );

      const { files: newFiles, folders: newFolders, total: newTotal } = res;

      const newItems = [
        ...newFolders.map(convertFolderToItem),
        ...newFiles.map(convertFileToItem),
      ];

      setIsEmptyList(newItems.length === 0);

      setFilesList(newItems);
      setTotal(newTotal);
      setHasNextPage(newTotal > newItems.length);
      setFilter(newFilter);
      requestRunning.current = false;
    };

    fetchFolder();
  }, [
    searchParams,
    shareKey,
    setIsEmptyList,
    convertFolderToItem,
    convertFileToItem,
  ]);

  React.useEffect(() => {
    setItems(filesList);
  }, [filesList, setItems]);

  if (filesList.length === 0) {
    return (
      <EmptyView
        current={current}
        folderId={filter.folder}
        isFiltered={filter.isFiltered()}
        shareKey={shareKey}
      />
    );
  }

  return filesViewAs === "tile" ? (
    <TileView
      items={filesList}
      currentFolderId={filter.folder}
      hasMoreFiles={hasNextPage}
      fetchMoreFiles={fetchMoreFiles}
      filesLength={filesList.length}
      getIcon={getIcon}
    />
  ) : (
    <RowView
      total={total}
      items={filesList}
      hasMoreFiles={hasNextPage}
      filterSortBy={filter.sortBy}
      timezone={timezone}
      displayFileExtension={displayFileExtension}
      fetchMoreFiles={fetchMoreFiles}
    />
  );
};

export default observer(List);
