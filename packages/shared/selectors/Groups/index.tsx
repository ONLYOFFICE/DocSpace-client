import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "styled-components";

import EmptyScreenGroupSvgUrl from "PUBLIC_DIR/images/empty_screen_groups_75-75.svg?url";
import EmptyScreenGroupSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_groups_dark_75-75.svg?url";

import api from "../../api";
import { RowLoader, SearchLoader } from "../../skeletons/selector";
import { Selector, TSelectorItem } from "../../components/selector";

import { GroupsSelectorProps } from "./GroupsSelector.types";

const GroupsSelector = (props: GroupsSelectorProps) => {
  const {
    id,
    className,

    headerProps,

    onSubmit,
  } = props;

  const { t } = useTranslation(["GroupsSelector", "Common"]);
  const theme = useTheme();

  const [searchValue, setSearchValue] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [itemsList, setItemsList] = useState<TSelectorItem[]>([]);
  const isFirstLoad = useRef(true);
  const afterSearch = useRef(false);
  const totalRef = useRef(0);

  const emptyScreenImg = theme.isBase
    ? EmptyScreenGroupSvgUrl
    : EmptyScreenGroupSvgDarkUrl;

  const onSearch = useCallback((value: string, callback?: Function) => {
    isFirstLoad.current = true;
    afterSearch.current = true;
    setSearchValue(() => {
      return value;
    });
    callback?.();
  }, []);

  const onClearSearch = useCallback((callback?: Function) => {
    isFirstLoad.current = true;
    afterSearch.current = true;
    setSearchValue(() => {
      return "";
    });
    callback?.();
  }, []);

  const onSubmitAction = useCallback(
    (items: TSelectorItem[]) => {
      onSubmit?.(items);
    },
    [onSubmit],
  );

  const onLoadNextPage = useCallback(
    async (startIndex: number) => {
      const pageCount = 100;
      setIsNextPageLoading(true);

      // Todo: fix types after TS API will be done
      const { items, total } = await api.groups.getGroupsByName(
        searchValue,
        startIndex,
        pageCount,
      );

      const convertedItems: TSelectorItem[] = items.map((group) => ({
        id: group.id,
        label: group.name,
        isGroup: true,
        avatar: "",
      }));

      if (isFirstLoad.current) {
        totalRef.current = total;
        setItemsList([...convertedItems]);
        setHasNextPage(convertedItems.length < total);

        isFirstLoad.current = false;
      } else {
        setItemsList((value) => {
          const arr = [...value, ...convertedItems];
          setHasNextPage(arr.length < total);
          return arr;
        });
        isFirstLoad.current = false;
      }

      setIsNextPageLoading(false);
    },
    [searchValue],
  );

  return (
    <Selector
      id={id}
      className={className}
      withHeader
      headerProps={{
        ...headerProps,
        headerLabel: headerProps?.headerLabel || t("Common:Groups"),
      }}
      withSearch
      searchPlaceholder={t("Common:Search")}
      onSearch={onSearch}
      searchValue={searchValue}
      onClearSearch={onClearSearch}
      isSearchLoading={false}
      disableSubmitButton={false}
      isMultiSelect={false}
      items={itemsList}
      submitButtonLabel={t("Common:SelectAction")}
      onSubmit={onSubmitAction}
      cancelButtonLabel={t("Common:CancelButton")}
      emptyScreenImage={emptyScreenImg}
      emptyScreenHeader={t("GroupsNotFoundHeader")} // Todo: Update empty screen texts when they are ready
      emptyScreenDescription={t("GroupsNotFoundDescription")}
      searchEmptyScreenImage={emptyScreenImg}
      searchEmptyScreenHeader={t("GroupsNotFoundHeader")}
      searchEmptyScreenDescription={t("GroupsNotFoundDescription")}
      totalItems={totalRef.current}
      hasNextPage={hasNextPage}
      isNextPageLoading={isNextPageLoading}
      loadNextPage={onLoadNextPage}
      isLoading={isFirstLoad.current}
      searchLoader={<SearchLoader />}
      rowLoader={
        <RowLoader
          isMultiSelect={false}
          isContainer={isFirstLoad.current}
          isUser={false}
        />
      }
    />
  );
};

export default GroupsSelector;
