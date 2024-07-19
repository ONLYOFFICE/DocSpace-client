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

import React, { useContext } from "react";
import { useTranslation } from "react-i18next";

import { getRooms } from "../../../api/rooms";
import RoomsFilter from "../../../api/rooms/filter";
import { RoomsType } from "../../../enums";
import { RoomsTypeValues } from "../../../utils";
import RoomType from "../../../components/room-type";
import { TSelectorItem } from "../../../components/selector";
import { TBreadCrumb } from "../../../components/selector/Selector.types";

import { LoadersContext } from "../contexts/Loaders";

import { PAGE_COUNT } from "../FilesSelector.constants";
import { UseRoomsHelperProps } from "../FilesSelector.types";
import {
  convertRoomsToItems,
  getDefaultBreadCrumb,
} from "../FilesSelector.utils";

import useInputItemHelper from "./useInputItemHelper";

const useRoomsHelper = ({
  setHasNextPage,
  setTotal,
  setItems,
  setBreadCrumbs,
  setIsRoot,
  onSetBaseFolderPath,

  searchValue,
  isRoomsOnly,

  isInit,
  setIsInit,

  withCreate,
  createDefineRoomLabel,
  createDefineRoomType,
  getRootData,
  setSelectedItemType,
  subscribe,
}: UseRoomsHelperProps) => {
  const { t } = useTranslation(["Common"]);
  const {
    setIsNextPageLoading,
    setIsBreadCrumbsLoading,
    isFirstLoad,
    setIsFirstLoad,
  } = useContext(LoadersContext);

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

  const createDropDownItems = React.useMemo(() => {
    return RoomsTypeValues.map((value) => {
      const onClick = () => {
        addInputItem("", "", value as RoomsType, t("EnterName"));
      };

      return (
        <RoomType
          key={value}
          roomType={value}
          selectedId={value}
          type="dropdownItem"
          isOpen={false}
          onClick={onClick}
        />
      );
    });
  }, [addInputItem, t]);

  const getRoomList = React.useCallback(
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
      filter.type = createDefineRoomType;

      const rooms = await getRooms(filter);

      const { folders, total, count, current } = rooms;

      if (initRef.current) {
        const { title, id } = current;

        // TODO: need unsubcribe
        if (isRoomsOnly) subscribe(id);

        const breadCrumbs: TBreadCrumb[] = [{ label: title, id, isRoom: true }];

        if (!isRoomsOnly) breadCrumbs.unshift({ ...getDefaultBreadCrumb(t) });

        onSetBaseFolderPath?.(breadCrumbs);

        setBreadCrumbs(breadCrumbs);

        setIsBreadCrumbsLoading(false);
      }
      const itemList: TSelectorItem[] = convertRoomsToItems(folders);

      setHasNextPage(count === PAGE_COUNT);

      if (firstLoadRef.current || startIndex === 0) {
        const { security } = current;

        if (withCreate && security.Create) {
          setTotal(total + 1);
          const createItem: TSelectorItem = {
            isCreateNewItem: true,
            label: createDefineRoomLabel ?? t("NewRoom"),
            id: "create-room-item",
            key: "create-room-item",
            hotkey: "r",
            isRoomsOnly,
            createDefineRoomType,
            dropDownItems: createDefineRoomType
              ? undefined
              : createDropDownItems,

            onBackClick: () => {
              setIsRoot(true);
              setSelectedItemType(undefined);
              setBreadCrumbs((val) => {
                const newVal = [...val];

                newVal.pop();

                return newVal;
              });
              getRootData?.();
            },
          };

          if (createDefineRoomType) {
            createItem.onCreateClick = () =>
              addInputItem("", "", createDefineRoomType, createDefineRoomLabel);
          }

          itemList.unshift(createItem);
        } else {
          setTotal(total);
        }
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
      setIsFirstLoad(false);
    },
    [
      setIsNextPageLoading,
      withCreate,
      searchValue,
      setHasNextPage,
      setIsRoot,
      setIsInit,
      setIsFirstLoad,
      isRoomsOnly,
      onSetBaseFolderPath,
      setBreadCrumbs,
      setIsBreadCrumbsLoading,
      setItems,
      setTotal,
      createDefineRoomLabel,
      t,
      createDefineRoomType,
      createDropDownItems,
      addInputItem,
      setSelectedItemType,
      getRootData,
      subscribe,
    ],
  );
  return { getRoomList };
};

export default useRoomsHelper;
