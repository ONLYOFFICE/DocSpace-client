// (c) Copyright Ascensio System SIA 2009-2024
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
