import React from "react";
import { useTranslation } from "react-i18next";

import EmptyScreenCorporateSvgUrl from "PUBLIC_DIR/images/empty_screen_corporate.svg?url";

import { Selector, TSelectorItem } from "../../components/selector";
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

  excludeItems = [],

  headerLabel,
  withoutBackButton,
  onBackClick,

  withSearch,
  searchPlaceholder,
  onSearch,
  onClearSearch,

  onSelect,
  isMultiSelect,
  selectedItems,
  acceptButtonLabel,
  onAccept,

  withHeader,
  withSelectAll,
  selectAllLabel,
  selectAllIcon,
  onSelectAll,

  withAccessRights,
  accessRights,
  selectedAccessRight,
  onAccessRightsChange,

  withCancelButton,
  cancelButtonLabel,
  onCancel,

  emptyScreenImage,
  emptyScreenHeader,
  emptyScreenDescription,
  searchEmptyScreenImage,
  searchEmptyScreenHeader,
  searchEmptyScreenDescription,

  roomType,
}: RoomSelectorProps) => {
  const { t }: { t: TTranslation } = useTranslation(["RoomSelector", "Common"]);

  const [isFirstLoad, setIsFirstLoad] = React.useState(true);
  const [searchValue, setSearchValue] = React.useState("");
  const [hasNextPage, setHasNextPage] = React.useState(false);
  const [isNextPageLoading, setIsNextPageLoading] = React.useState(false);

  const [total, setTotal] = React.useState(-1);

  const [items, setItems] = React.useState<TSelectorItem[]>([]);

  const onSearchAction = React.useCallback(
    (value: string) => {
      onSearch?.(value);
      setSearchValue(() => {
        setIsFirstLoad(true);

        return value;
      });
    },
    [onSearch],
  );

  const onClearSearchAction = React.useCallback(() => {
    onClearSearch?.();
    setSearchValue(() => {
      setIsFirstLoad(true);

      return "";
    });
  }, [onClearSearch]);

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

      const itemList = roomType
        ? rooms.filter(
            (x) => !excludeItems.includes(x.id) && x.roomType === roomType,
          )
        : rooms.filter((x) => !excludeItems.includes(x.id));

      setHasNextPage(count === PAGE_COUNT);

      if (isFirstLoad) {
        setTotal(totalCount);
        setItems(itemList);
      } else {
        setItems((value) => [...value, ...itemList]);
      }

      if (isFirstLoad) {
        setTimeout(() => {
          setIsFirstLoad(false);
        }, 500);
      }

      setIsNextPageLoading(false);
    },
    [isFirstLoad, excludeItems, searchValue, roomType],
  );

  React.useEffect(() => {
    onLoadNextPage(0);
  }, [roomType]);

  return (
    <Selector
      id={id}
      className={className}
      style={style}
      headerLabel={headerLabel || t("RoomList")}
      onBackClick={onBackClick}
      searchPlaceholder={searchPlaceholder || t("Common:Search")}
      searchValue={searchValue}
      onSearch={onSearchAction}
      onClearSearch={onClearSearchAction}
      onSelect={onSelect}
      items={items}
      acceptButtonLabel={acceptButtonLabel || t("Common:SelectAction")}
      onAccept={onAccept}
      withHeader={withHeader}
      withCancelButton={withCancelButton}
      cancelButtonLabel={cancelButtonLabel || t("Common:CancelButton")}
      onCancel={onCancel}
      isMultiSelect={isMultiSelect}
      selectedItems={selectedItems}
      withSelectAll={withSelectAll}
      selectAllLabel={selectAllLabel}
      selectAllIcon={selectAllIcon}
      onSelectAll={onSelectAll}
      withAccessRights={withAccessRights}
      accessRights={accessRights}
      selectedAccessRight={selectedAccessRight}
      onAccessRightsChange={onAccessRightsChange}
      emptyScreenImage={emptyScreenImage || EmptyScreenCorporateSvgUrl}
      emptyScreenHeader={emptyScreenHeader || t("EmptyRoomsHeader")}
      emptyScreenDescription={
        emptyScreenDescription || t("EmptyRoomsDescription")
      }
      searchEmptyScreenImage={
        searchEmptyScreenImage || EmptyScreenCorporateSvgUrl
      }
      searchEmptyScreenHeader={
        searchEmptyScreenHeader || t("Common:NotFoundTitle")
      }
      searchEmptyScreenDescription={
        searchEmptyScreenDescription || t("Common:SearchEmptyRoomsDescription")
      }
      totalItems={total}
      hasNextPage={hasNextPage}
      isNextPageLoading={isNextPageLoading}
      loadNextPage={onLoadNextPage}
      isLoading={isFirstLoad}
      searchLoader={<SearchLoader />}
      rowLoader={
        <RowLoader
          isMultiSelect={isMultiSelect}
          isContainer={isFirstLoad}
          isUser={false}
        />
      }
      withSearch={withSearch}
      withoutBackButton={withoutBackButton}
    />
  );
};

export default RoomSelector;
