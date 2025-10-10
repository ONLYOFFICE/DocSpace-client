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

import React, { use } from "react";
import { useTranslation } from "react-i18next";

import { getRooms } from "../../../api/rooms";
import RoomsFilter from "../../../api/rooms/filter";
import { RoomSearchArea } from "../../../enums";
import { TSelectorItem } from "../../../components/selector";
import { TBreadCrumb } from "../../../components/selector/Selector.types";

import { LoadersContext } from "../contexts/Loaders";

import { PAGE_COUNT } from "../constants";
import { UseAgentsHelperProps } from "../types";
import { convertRoomsToItems } from "..";

import useInputItemHelper from "./useInputItemHelper";

const useAgentsHelper = ({
  setHasNextPage,
  setTotal,
  setItems,
  setBreadCrumbs,
  setIsRoot,
  onSetBaseFolderPath,
  createDefineLabel,

  searchValue,
  // isRoomsOnly,

  isInit,
  setIsInit,
  withCreate,
  excludeItems,
  getRootData,
  setSelectedItemType,
  subscribe,
  setSelectedItemSecurity,
}: UseAgentsHelperProps) => {
  const { t } = useTranslation(["Common"]);
  const {
    setIsNextPageLoading,
    setIsBreadCrumbsLoading,
    setIsFirstLoad,

    isFirstLoad,
  } = use(LoadersContext);

  const { addInputItem } = useInputItemHelper({ withCreate, setItems });

  const requestRunning = React.useRef(false);
  const initRef = React.useRef(isInit);
  const firstLoadRef = React.useRef(isFirstLoad);

  React.useEffect(() => {
    firstLoadRef.current = isFirstLoad;
  }, [isFirstLoad]);

  React.useEffect(() => {
    initRef.current = isInit;
  }, [isInit]);

  const getAgentList = React.useCallback(
    async (sIndex: number) => {
      if (requestRunning.current) return;

      requestRunning.current = true;
      setIsNextPageLoading(true);

      let startIndex = sIndex;

      if (withCreate) {
        startIndex -= startIndex % 100;
      }

      const filterValue = searchValue || "";

      const page = startIndex / PAGE_COUNT;

      const filter = RoomsFilter.getDefault();

      filter.page = page;
      filter.pageCount = PAGE_COUNT;
      filter.filterValue = filterValue;
      filter.searchArea = RoomSearchArea.AI_AGENTS;

      const roomsFromApi = await getRooms(filter);

      const { folders, total, count, current } = roomsFromApi;

      if (initRef.current) {
        const { title, id } = current;

        // if (isRoomsOnly) subscribe(id);
        subscribe(id);

        const breadCrumbs: TBreadCrumb[] = [{ label: title, id, isRoom: true }];

        // if (!isRoomsOnly) breadCrumbs.unshift({ ...getDefaultBreadCrumb(t) });

        onSetBaseFolderPath?.(breadCrumbs);

        setBreadCrumbs?.(breadCrumbs);

        setIsBreadCrumbsLoading(false);
      }

      const itemList: TSelectorItem[] = convertRoomsToItems(folders, t).filter(
        (x) => (excludeItems ? !excludeItems.includes(x.id) : true),
      );

      setHasNextPage(count === PAGE_COUNT);

      setSelectedItemSecurity?.(current.security);

      if (firstLoadRef.current || startIndex === 0) {
        const { security } = current;

        if (withCreate && security.Create) {
          setTotal(total + 1);
          const createItem: TSelectorItem = {
            isCreateNewItem: true,
            label: createDefineLabel ?? t("NewAgent"),
            id: "create-room-item",
            key: "create-room-item",
            hotkey: "r",
            // isRoomsOnly,

            onBackClick: () => {
              setIsRoot?.(true);
              setSelectedItemType?.(undefined);
              setBreadCrumbs?.((val) => {
                const newVal = [...val];

                newVal.pop();

                return newVal;
              });
              getRootData?.();
            },
          };

          createItem.onCreateClick = () =>
            addInputItem("", "", undefined, createDefineLabel, true);

          itemList.unshift(createItem);
        } else {
          setTotal(total);
        }
        setItems?.(itemList);
      } else {
        setItems?.((prevState) => {
          if (prevState) return [...prevState, ...itemList];
          return [...itemList];
        });
      }

      requestRunning.current = false;
      setIsNextPageLoading(false);
      setIsRoot?.(false);
      setIsInit(false);
      setIsFirstLoad(false);
    },
    [
      searchValue,
      t,
      setHasNextPage,
      setSelectedItemSecurity,
      setIsRoot,
      setIsInit,
      setIsFirstLoad,
      setIsNextPageLoading,
      // isRoomsOnly,
      subscribe,
      onSetBaseFolderPath,
      setBreadCrumbs,
      setIsBreadCrumbsLoading,
      withCreate,
      setItems,
      setTotal,
      createDefineLabel,
      setSelectedItemType,
      getRootData,
      addInputItem,
      excludeItems,
    ],
  );

  return { getAgentList };
};

export default useAgentsHelper;
