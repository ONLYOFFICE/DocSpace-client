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

import { TTranslation } from "../../types";

import useSocketHelper from "../utils/hooks/useSocketHelper";
import useRoomsHelper from "../utils/hooks/useRoomsHelper";
import { RoomSelectorProps } from "./RoomSelector.types";
import { convertToItems } from "./RoomSelector.utils";
import {
  LoadersContext,
  LoadersContextProvider,
} from "../utils/contexts/Loaders";

const RoomSelectorComponent = ({
  id,
  className,
  style,

  excludeItems,

  withSearch,

  isMultiSelect,

  submitButtonLabel,
  onSubmit,

  withHeader,
  headerProps,

  withPadding,

  setIsDataReady,

  withCancelButton,
  cancelButtonLabel,
  onCancel,

  roomType,
  searchArea,

  disableThirdParty,
  emptyScreenHeader,
  emptyScreenDescription,

  createDefineRoomLabel,
  createDefineRoomType,

  withInit,
  withCreate,
  initItems,
  initTotal,
  initHasNextPage,
  initSearchValue,
}: RoomSelectorProps) => {
  const { t }: { t: TTranslation } = useTranslation(["Common"]);

  const { isFirstLoad, isNextPageLoading, setIsFirstLoad } =
    React.useContext(LoadersContext);

  const [searchValue, setSearchValue] = React.useState(() =>
    withInit ? initSearchValue : "",
  );
  const [hasNextPage, setHasNextPage] = React.useState(() =>
    withInit ? initHasNextPage : false,
  );
  const [selectedItem, setSelectedItem] = React.useState<TSelectorItem | null>(
    null,
  );

  const [total, setTotal] = React.useState(() => (withInit ? initTotal : -1));
  const [items, setItems] = React.useState<TSelectorItem[]>(
    withInit
      ? convertToItems(initItems).filter((x) =>
          excludeItems ? !excludeItems.includes(x.id) : true,
        )
      : [],
  );

  const isInitRef = React.useRef<boolean>(!withInit);
  const afterSearch = React.useRef(false);

  const setIsInit = React.useCallback((value: boolean) => {
    isInitRef.current = value;
  }, []);

  const onSelect = (
    item: TSelectorItem,
    isDoubleClick: boolean,
    doubleClickCallback: () => void,
  ) => {
    setSelectedItem((el) => {
      if (el?.id === item.id) return null;

      return item;
    });
    if (isDoubleClick && !isMultiSelect) {
      doubleClickCallback();
    }
  };

  useEffect(() => {
    setIsDataReady?.(!isFirstLoad);
  }, [setIsDataReady, isFirstLoad]);

  const onSearchAction = React.useCallback(
    (value: string, callback?: VoidFunction) => {
      afterSearch.current = true;
      setIsFirstLoad(true);
      setSearchValue(() => {
        return value;
      });
      callback?.();
    },
    [setIsFirstLoad],
  );

  const { subscribe } = useSocketHelper({
    withCreate,
    setTotal,
    setItems,
    disabledItems: [],
  });

  const onClearSearchAction = React.useCallback(
    (callback?: VoidFunction) => {
      setIsFirstLoad(true);
      afterSearch.current = true;
      setSearchValue(() => {
        return "";
      });
      callback?.();
    },
    [setIsFirstLoad],
  );

  const { getRoomList: onLoadNextPage } = useRoomsHelper({
    withCreate,
    isInit: isInitRef.current,
    setIsInit,
    createDefineRoomLabel,
    createDefineRoomType,
    excludeItems,
    roomType,
    searchValue,
    isRoomsOnly: true,
    setHasNextPage,
    setTotal,
    setItems,
    withInit,
    disableThirdParty,
    searchArea,
    subscribe,
  });

  const headerSelectorProps: TSelectorHeader = withHeader
    ? {
        withHeader,
        headerProps: {
          ...headerProps,
          headerLabel: headerProps.headerLabel || t("Common:RoomList"),
        },
      }
    : {};

  const cancelButtonSelectorProps: TSelectorCancelButton = withCancelButton
    ? {
        withCancelButton: true,
        cancelButtonLabel: cancelButtonLabel || t("Common:CancelButton"),
        onCancel,
      }
    : {};

  const searchSelectorProps: TSelectorSearch = withSearch
    ? {
        withSearch: true,
        searchPlaceholder: t("Common:Search"),
        searchValue,
        onSearch: onSearchAction,
        onClearSearch: onClearSearchAction,
        searchLoader: <SearchLoader />,
        isSearchLoading: isFirstLoad && !searchValue && !afterSearch.current,
      }
    : {};

  return (
    <Selector
      id={id}
      className={className}
      style={style}
      {...headerSelectorProps}
      {...cancelButtonSelectorProps}
      {...searchSelectorProps}
      withPadding={withPadding}
      onSelect={onSelect}
      items={items}
      submitButtonLabel={submitButtonLabel || t("Common:SelectAction")}
      onSubmit={onSubmit}
      isMultiSelect={isMultiSelect}
      emptyScreenImage={EmptyScreenCorporateSvgUrl}
      emptyScreenHeader={emptyScreenHeader ?? t("Common:EmptyRoomsHeader")}
      emptyScreenDescription={
        emptyScreenDescription ?? t("Common:EmptyRoomsDescription")
      }
      searchEmptyScreenImage={EmptyScreenCorporateSvgUrl}
      searchEmptyScreenHeader={t("Common:NotFoundTitle")}
      searchEmptyScreenDescription={t("Common:SearchEmptyRoomsDescription")}
      totalItems={total}
      hasNextPage={hasNextPage}
      isNextPageLoading={isNextPageLoading}
      loadNextPage={onLoadNextPage}
      isLoading={isFirstLoad}
      disableSubmitButton={!selectedItem}
      alwaysShowFooter={items.length !== 0 || Boolean(searchValue)}
      rowLoader={
        <RowLoader
          isMultiSelect={isMultiSelect}
          isContainer={isFirstLoad}
          isUser={false}
        />
      }
      isSSR={withInit}
      dataTestId="room_selector"
    />
  );
};

const RoomSelector = (props: RoomSelectorProps) => {
  const { withInit } = props;

  return (
    <LoadersContextProvider withInit={withInit}>
      <RoomSelectorComponent {...props} />
    </LoadersContextProvider>
  );
};

export default RoomSelector;
