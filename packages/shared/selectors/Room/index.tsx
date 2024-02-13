import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import EmptyScreenCorporateSvgUrl from "PUBLIC_DIR/images/empty_screen_corporate.svg?url";

import { Selector, TSelectorItem } from "../../components/selector";
import {
  TSelectorCancelButton,
  TSelectorHeader,
  TSelectorSearch,
} from "../../components/selector/Selector.types";
import { RowLoader, SearchLoader } from "../../skeletons/selector";
import api from "../../api";
import RoomsFilter from "../../api/rooms/filter";

import { TTranslation } from "../../types";

import { RoomSelectorProps } from "./RoomSelector.types";
import { convertToItems } from "./RoomSelector.utils";

const PAGE_COUNT = 100;

const RoomSelector = ({
  id,
  className,
  style,

  onSubmit,

  withHeader,
  headerProps,

  setIsDataReady,

  withCancelButton,
  isMultiSelect,

  onCancel,
}: RoomSelectorProps) => {
  const { t }: { t: TTranslation } = useTranslation(["Common"]);

  const [searchValue, setSearchValue] = React.useState("");
  const [hasNextPage, setHasNextPage] = React.useState(false);
  const [isNextPageLoading, setIsNextPageLoading] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<TSelectorItem | null>(
    null,
  );
  const [total, setTotal] = React.useState(-1);

  const [items, setItems] = React.useState<TSelectorItem[]>([]);

  const isFirstLoad = React.useRef(true);

  useEffect(() => {
    setIsDataReady?.(!isFirstLoad.current);
  }, [setIsDataReady]);

  const onSearchAction = React.useCallback(
    (value: string, callback?: Function) => {
      isFirstLoad.current = true;
      setSearchValue(() => {
        return value;
      });
      callback?.();
    },
    [],
  );

  const onClearSearchAction = React.useCallback((callback?: Function) => {
    isFirstLoad.current = true;
    setSearchValue(() => {
      return "";
    });
    callback?.();
  }, []);

  const onLoadNextPage = React.useCallback(
    async (startIndex: number) => {
      setIsNextPageLoading(true);

      const page = startIndex / PAGE_COUNT;

      const filter = RoomsFilter.getDefault();

      filter.page = page;
      filter.pageCount = PAGE_COUNT;

      filter.filterValue = searchValue || null;

      const {
        folders,
        total: totalCount,
        count,
      } = await api.rooms.getRooms(filter);

      const rooms = convertToItems(folders);

      setHasNextPage(count === PAGE_COUNT);

      if (isFirstLoad) {
        setTotal(totalCount);

        setItems([...rooms] as TSelectorItem[]);
      } else {
        setItems((prevItems) => {
          const newItems = [...rooms] as TSelectorItem[];

          return [...prevItems, ...newItems];
        });
      }

      isFirstLoad.current = false;

      setIsNextPageLoading(false);
    },
    [searchValue],
  );

  const headerSelectorProps: TSelectorHeader = withHeader
    ? {
        withHeader,
        headerProps: {
          ...headerProps,
          headerLabel: headerProps.headerLabel || t("Common:RoomList"),
        },
      }
    : ({} as TSelectorHeader);

  const cancelButtonSelectorProps: TSelectorCancelButton = withCancelButton
    ? {
        withCancelButton,
        cancelButtonLabel: t("Common:CancelButton"),
        onCancel,
      }
    : ({} as TSelectorCancelButton);

  const searchSelectorProps: TSelectorSearch = {
    withSearch: true,
    searchPlaceholder: t("Common:Search"),
    searchValue,
    onSearch: onSearchAction,
    onClearSearch: onClearSearchAction,
    searchLoader: <SearchLoader />,
    isSearchLoading: isFirstLoad.current,
  };

  return (
    <Selector
      id={id}
      className={className}
      style={style}
      {...headerSelectorProps}
      {...cancelButtonSelectorProps}
      {...searchSelectorProps}
      onSelect={(item) => setSelectedItem(item)}
      items={items}
      submitButtonLabel={t("Common:SelectAction")}
      onSubmit={onSubmit}
      isMultiSelect={isMultiSelect}
      emptyScreenImage={EmptyScreenCorporateSvgUrl}
      emptyScreenHeader={t("Common:EmptyRoomsHeader")}
      emptyScreenDescription={t("Common:EmptyRoomsDescription")}
      searchEmptyScreenImage={EmptyScreenCorporateSvgUrl}
      searchEmptyScreenHeader={t("Common:NotFoundTitle")}
      searchEmptyScreenDescription={t("Common:SearchEmptyRoomsDescription")}
      totalItems={total}
      hasNextPage={hasNextPage}
      isNextPageLoading={isNextPageLoading}
      loadNextPage={onLoadNextPage}
      isLoading={isFirstLoad.current}
      disableSubmitButton={!selectedItem}
      rowLoader={
        <RowLoader
          isMultiSelect={isMultiSelect}
          isContainer={isFirstLoad.current}
          isUser={false}
        />
      }
    />
  );
};

export default RoomSelector;

