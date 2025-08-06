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

import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import EmptyScreenGroupSvgUrl from "PUBLIC_DIR/images/empty_screen_groups_75-75.svg?url";
import EmptyScreenGroupSvgDarkUrl from "PUBLIC_DIR/images/empty_screen_groups_dark_75-75.svg?url";

import api from "../../api";
import { RowLoader, SearchLoader } from "../../skeletons/selector";
import { Selector, TSelectorItem } from "../../components/selector";
import { useTheme } from "../../hooks/useTheme";

import { GroupsSelectorProps } from "./GroupsSelector.types";

const GroupsSelector = (props: GroupsSelectorProps) => {
  const {
    id,
    className,

    headerProps,

    onSubmit,
  } = props;

  const { t } = useTranslation(["Common"]);
  const { isBase } = useTheme();

  const [searchValue, setSearchValue] = useState("");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [itemsList, setItemsList] = useState<TSelectorItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TSelectorItem | null>(null);

  const isFirstLoad = useRef(true);
  const afterSearch = useRef(false);
  const totalRef = useRef(0);

  const emptyScreenImg = isBase
    ? EmptyScreenGroupSvgUrl
    : EmptyScreenGroupSvgDarkUrl;

  const onSelect = (
    item: TSelectorItem,
    isDoubleClick: boolean,
    doubleClickCallback: () => void,
  ) => {
    setSelectedItem((el) => {
      if (el?.id === item.id) return null;

      return item;
    });

    if (isDoubleClick) {
      doubleClickCallback();
    }
  };
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
        name: group.name,
        isGroup: true,
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
        onCloseClick: () => {},
        headerLabel: headerProps?.headerLabel || t("Common:Groups"),
      }}
      alwaysShowFooter={itemsList.length !== 0 || Boolean(searchValue)}
      withSearch
      searchPlaceholder={t("Common:Search")}
      onSearch={onSearch}
      searchValue={searchValue}
      onClearSearch={onClearSearch}
      isSearchLoading={false}
      disableSubmitButton={!selectedItem}
      isMultiSelect={false}
      items={itemsList}
      submitButtonLabel={t("Common:SelectAction")}
      onSubmit={onSubmitAction}
      emptyScreenImage={emptyScreenImg}
      emptyScreenHeader={t("Common:NotFoundGroups")}
      emptyScreenDescription={t("Common:GroupsNotFoundDescription")}
      searchEmptyScreenImage={emptyScreenImg}
      searchEmptyScreenHeader={t("Common:NotFoundGroups")}
      searchEmptyScreenDescription={t("Common:GroupsNotFoundDescription")}
      totalItems={totalRef.current}
      hasNextPage={hasNextPage}
      isNextPageLoading={isNextPageLoading}
      loadNextPage={onLoadNextPage}
      isLoading={isFirstLoad.current}
      searchLoader={<SearchLoader />}
      onSelect={onSelect}
      rowLoader={
        <RowLoader
          isMultiSelect={false}
          isContainer={isFirstLoad.current}
          isUser={false}
        />
      }
      dataTestId="groups_selector"
    />
  );
};

export default GroupsSelector;
