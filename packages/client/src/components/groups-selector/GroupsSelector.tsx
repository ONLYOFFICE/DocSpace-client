import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import api from "@docspace/shared/api";
import EmptyScreenGroupsSvgUrl from "PUBLIC_DIR/images/empty_screen_persons.svg?url";
// @ts-ignore
import Loaders from "@docspace/common/components/Loaders";
import { Selector } from "@docspace/shared/components/selector";

import {
  GroupsSelectorItem,
  GroupsSelectorProps,
} from "./GroupsSelector.types";

export const GroupsSelector = (props: GroupsSelectorProps) => {
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
    withCancelButton,
    withHeader,
    searchEmptyScreenDescription,
    searchEmptyScreenHeader,
    searchEmptyScreenImage,
    searchPlaceholder,
    ...rest
  } = props;

  const { t } = useTranslation(["GroupsSelector", "Common"]);

  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [itemsList, setItemsList] = useState<GroupsSelectorItem[]>([]);

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

  const onSelectAction = () => {};

  const onCancelAction = () => {};

  const onAcceptAction = (
    items: any,
    accessRights: any,
    fileName: string,
    isChecked: boolean
  ) => {
    onAccept && onAccept(items);
  };

  const onLoadNextPage = async (startIndex: number) => {
    setIsNextPageLoading(true);

    const { items, total, count } = await api.groups.getGroupsByName(
      searchValue,
      startIndex
    );

    const convertedItems = items.map((group: any) => ({
      id: group.id,
      label: group.name,
      isGroup: true,
    }));

    const oldItems = startIndex ? itemsList : [];
    const newItems = [...oldItems, ...convertedItems];

    setHasNextPage(newItems.length < total);
    console.log(newItems.length);

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
      headerLabel={headerLabel || t("Groups")}
      onBackClick={onBackClick}
      searchPlaceholder={searchPlaceholder || t("Common:Search")}
      onSearch={onSearchAction}
      searchValue={searchValue}
      onClearSearch={onClearSearchAction}
      onSelect={onSelectAction}
      items={itemsList || []}
      acceptButtonLabel={t("Common:SelectAction")}
      onAccept={onAcceptAction}
      withHeader={withHeader}
      withCancelButton={withCancelButton}
      cancelButtonLabel={cancelButtonLabel || t("Common:CancelButton")}
      onCancel={onCancelAction}
      isMultiSelect={isMultiSelect}
      emptyScreenImage={emptyScreenImage || EmptyScreenGroupsSvgUrl}
      emptyScreenHeader={emptyScreenHeader || t("GroupsNotFoundHeader")} // Todo: Update empty screen texts when they are ready
      emptyScreenDescription={
        emptyScreenDescription || t("GroupsNotFoundDescription")
      }
      searchEmptyScreenImage={searchEmptyScreenImage || EmptyScreenGroupsSvgUrl}
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
      searchLoader={<Loaders.SelectorSearchLoader />}
      rowLoader={
        <Loaders.SelectorRowLoader
          isMultiSelect={isMultiSelect}
          isContainer={isFirstLoad}
          isUser={false}
        />
      }
    />
  );
};
