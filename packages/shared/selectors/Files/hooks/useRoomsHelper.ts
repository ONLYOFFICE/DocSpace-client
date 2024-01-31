import React from "react";

import { getRooms } from "../../../api/rooms";
import RoomsFilter from "../../../api/rooms/filter";
import { TSelectorItem } from "../../../components/selector";
import { TBreadCrumb } from "../../../components/selector/Selector.types";

import { PAGE_COUNT, DEFAULT_BREAD_CRUMB } from "../FilesSelector.constants";
import { UseRoomsHelperProps } from "../FilesSelector.types";
import { convertRoomsToItems } from "../FilesSelector.utils";

const useRoomsHelper = ({
  setIsNextPageLoading,
  setHasNextPage,
  setTotal,
  setItems,
  setBreadCrumbs,
  setIsRoot,
  isFirstLoad,
  setIsBreadCrumbsLoading,
  searchValue,
  isRoomsOnly,
  onSetBaseFolderPath,
}: UseRoomsHelperProps) => {
  const getRoomList = React.useCallback(
    async (
      startIndex: number,
      search?: string | null,
      isInit?: boolean,
      isErrorPath?: boolean,
    ) => {
      setIsNextPageLoading(true);

      const filterValue = search || (search === null ? "" : searchValue || "");

      const page = startIndex / PAGE_COUNT;

      const filter = RoomsFilter.getDefault();

      filter.page = page;
      filter.pageCount = PAGE_COUNT;

      filter.filterValue = filterValue;

      const rooms = await getRooms(filter);

      const { folders, total, count, current } = rooms;

      const { title, id } = current;

      if (isInit) {
        const breadCrumbs: TBreadCrumb[] = [{ label: title, id, isRoom: true }];

        if (!isRoomsOnly) breadCrumbs.unshift({ ...DEFAULT_BREAD_CRUMB });

        onSetBaseFolderPath?.(isErrorPath ? [] : breadCrumbs);

        setBreadCrumbs(breadCrumbs);

        setIsBreadCrumbsLoading(false);
      }

      const itemList: TSelectorItem[] = convertRoomsToItems(folders);

      setHasNextPage(count === PAGE_COUNT);

      if (isFirstLoad || startIndex === 0) {
        setTotal(total);
        setItems(itemList);
      } else {
        setItems((prevState) => {
          if (prevState) return [...prevState, ...itemList];
          return [...itemList];
        });
      }

      setIsNextPageLoading(false);
      setIsRoot(false);
    },
    [
      isFirstLoad,
      isRoomsOnly,
      onSetBaseFolderPath,
      searchValue,
      setBreadCrumbs,
      setHasNextPage,
      setIsBreadCrumbsLoading,
      setIsNextPageLoading,
      setIsRoot,
      setItems,
      setTotal,
    ],
  );
  return { getRoomList };
};

export default useRoomsHelper;
