import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import EmptyScreenGroupSvgUrl from "PUBLIC_DIR/images/empty_screen_groups_75-75.svg?url";
import EmptyScreenGroupSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_groups_dark_75-75.svg?url";

import api from "../../api";
import { RowLoader, SearchLoader } from "../../skeletons/selector";
import { Selector, TSelectorItem } from "../../components/selector";

import {
  GroupsSelectorItem,
  GroupsSelectorProps,
} from "./GroupsSelector.types";

const GroupsSelector = (props: GroupsSelectorProps) => {
  const {
    id,

    cancelButtonLabel,
    emptyScreenDescription,
    emptyScreenHeader,
    emptyScreenImage,
    headerLabel,
    isMultiSelect,
    onBackClick,
    onAccept,
    onCancel,
    onSelect,
    withCancelButton,
    withHeader,
    searchEmptyScreenDescription,
    searchEmptyScreenHeader,
    searchEmptyScreenImage,
    searchPlaceholder,
  } = props;

  const { t } = useTranslation(["GroupsSelector", "Common"]);
  const theme = useTheme();

  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [itemsList, setItemsList] = useState<GroupsSelectorItem[]>([]);

  const emptyScreenImg = theme.isBase
    ? EmptyScreenGroupSvgUrl
    : EmptyScreenGroupSvgDarkUrl;

  const onSearchAction = (value: string, isSearchCallback?: Function) => {
    setSearchValue(() => {
      setIsFirstLoad(true);
      isSearchCallback?.(Boolean(value));

      return value;
    });
  };

  const onClearSearchAction = () => {
    setSearchValue(() => {
      setIsFirstLoad(true);

      return "";
    });
  };

  const onAcceptAction = (items: TSelectorItem[]) => {
    onAccept?.(items);
  };

  const onLoadNextPage = async (startIndex: number) => {
    setIsNextPageLoading(true);

    // Todo: fix types after TS API will be done
    const { items, total } = await api.groups.getGroupsByName(
      searchValue,
      startIndex,
    );

    const convertedItems = items.map((group: any) => ({
      id: group.id,
      label: group.name,
      isGroup: true,
    }));

    const oldItems = startIndex ? itemsList : [];
    const newItems = [...oldItems, ...convertedItems];

    setHasNextPage(newItems.length < total);

    setItemsList(newItems);
    if (isFirstLoad) {
      setTotal(total);
      setTimeout(() => {
        setIsFirstLoad(false);
      }, 500);
    } else {
      // setItems((value) => [...value, ...convertedItems]);
    }

    setIsNextPageLoading(false);
  };

  useEffect(() => {
    onLoadNextPage(0);
  }, [searchValue]);

  return (
    <Selector
      id={id}
      headerLabel={headerLabel || t("Common:Groups")}
      onBackClick={onBackClick}
      searchPlaceholder={searchPlaceholder || t("Common:Search")}
      onSearch={onSearchAction}
      searchValue={searchValue}
      onClearSearch={onClearSearchAction}
      onSelect={onSelect}
      items={itemsList || []}
      acceptButtonLabel={t("Common:SelectAction")}
      onAccept={onAcceptAction}
      withHeader={withHeader}
      withCancelButton={withCancelButton}
      cancelButtonLabel={cancelButtonLabel || t("Common:CancelButton")}
      onCancel={onCancel}
      isMultiSelect={isMultiSelect}
      emptyScreenImage={emptyScreenImage || emptyScreenImg}
      emptyScreenHeader={emptyScreenHeader || t("GroupsNotFoundHeader")} // Todo: Update empty screen texts when they are ready
      emptyScreenDescription={
        emptyScreenDescription || t("GroupsNotFoundDescription")
      }
      searchEmptyScreenImage={searchEmptyScreenImage || emptyScreenImg}
      searchEmptyScreenHeader={
        searchEmptyScreenHeader || t("GroupsNotFoundHeader")
      }
      searchEmptyScreenDescription={
        searchEmptyScreenDescription || t("GroupsNotFoundDescription")
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
    />
  );
};

export default GroupsSelector;
