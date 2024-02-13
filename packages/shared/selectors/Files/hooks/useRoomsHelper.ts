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
  onSetBaseFolderPath,
  setIsBreadCrumbsLoading,
  searchValue,
  isRoomsOnly,
  isFirstLoad,
  isInit,
  setIsInit,
}: UseRoomsHelperProps) => {
  const requestRunning = React.useRef(false);
  const initRef = React.useRef(isInit);
  const firstLoadRef = React.useRef(isFirstLoad);

  React.useEffect(() => {
    firstLoadRef.current = isFirstLoad;
  }, [isFirstLoad]);

  React.useEffect(() => {
    initRef.current = isInit;
  }, [isInit]);

  const getRoomList = React.useCallback(
    async (startIndex: number) => {
      if (requestRunning.current) return;

      requestRunning.current = true;
      setIsNextPageLoading(true);

      const filterValue = searchValue || "";

      const page = startIndex / PAGE_COUNT;

      const filter = RoomsFilter.getDefault();

      filter.page = page;
      filter.pageCount = PAGE_COUNT;

      filter.filterValue = filterValue;

      const rooms = await getRooms(filter);

      const { folders, total, count, current } = rooms;

      if (initRef.current) {
        const { title, id } = current;

        const breadCrumbs: TBreadCrumb[] = [{ label: title, id, isRoom: true }];

        if (!isRoomsOnly) breadCrumbs.unshift({ ...DEFAULT_BREAD_CRUMB });

        onSetBaseFolderPath?.(breadCrumbs);

        setBreadCrumbs(breadCrumbs);

        setIsBreadCrumbsLoading(false);
      }
      const itemList: TSelectorItem[] = convertRoomsToItems(folders);

      setHasNextPage(count === PAGE_COUNT);

      if (firstLoadRef.current || startIndex === 0) {
        setTotal(total);
        setItems(itemList);
      } else {
        setItems((prevState) => {
          if (prevState) return [...prevState, ...itemList];
          return [...itemList];
        });
      }

      requestRunning.current = false;
      setIsNextPageLoading(false);
      setIsRoot(false);
      setIsInit(false);
    },
    [
      setIsNextPageLoading,
      searchValue,
      setHasNextPage,
      setIsRoot,
      setIsInit,
      isRoomsOnly,
      onSetBaseFolderPath,
      setBreadCrumbs,
      setIsBreadCrumbsLoading,
      setTotal,
      setItems,
    ],
  );
  return { getRoomList };
};

export default useRoomsHelper;
