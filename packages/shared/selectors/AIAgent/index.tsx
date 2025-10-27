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

import InfoIconSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import EmptyScreenAIAgentsSelectorSvgUrl from "PUBLIC_DIR/images/emptyview/ai.agents.selector.light.svg?url";
import EmptyScreenAIAgentsSelectorSvgUrlDark from "PUBLIC_DIR/images/emptyview/ai.agents.selector.dark.svg?url";

import { Selector, TSelectorItem } from "../../components/selector";
import {
  TSelectorCancelButton,
  TSelectorHeader,
  TSelectorSearch,
} from "../../components/selector/Selector.types";
import { RowLoader, SearchLoader } from "../../skeletons/selector";

import { TTranslation } from "../../types";
import { useTheme } from "../../hooks/useTheme";

import useSocketHelper from "../utils/hooks/useSocketHelper";
import useAgentsHelper from "../utils/hooks/useAgentsHelper";
import {
  LoadersContext,
  LoadersContextProvider,
} from "../utils/contexts/Loaders";

import { AIAgentSelectorProps } from "./AIAgent.types";
import { convertToItems } from "./AIAgent.utils";

const AIAgentSelectorComponent = ({
  id,
  className,
  style,

  excludeItems,

  onSubmit,

  withPadding,

  setIsDataReady,

  onClose,

  withInit,
  initItems,
  initTotal,
  initHasNextPage,
  initSearchValue,
}: AIAgentSelectorProps) => {
  const { t }: { t: TTranslation } = useTranslation(["Common"]);

  const { isBase } = useTheme();

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
  const [withInfo, setWithInfo] = React.useState(true);

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
    if (isDoubleClick) {
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
    withCreate: true,
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

  const { getAgentList: onLoadNextPage } = useAgentsHelper({
    withCreate: true,
    isInit: isInitRef.current,
    setIsInit,
    createDefineLabel: t("Common:CreateAIAgent"),
    excludeItems,
    searchValue,
    setHasNextPage,
    setTotal,
    setItems,
    withInit,
    subscribe,
  });

  const headerSelectorProps: TSelectorHeader = {
    withHeader: true,
    headerProps: {
      headerLabel: t("Common:AskAIChat"),
      onCloseClick: onClose,
      isCloseable: true,
    },
  };

  const cancelButtonSelectorProps: TSelectorCancelButton = {
    withCancelButton: true,
    cancelButtonLabel: t("Common:CancelButton"),
    onCancel: onClose,
  };

  const searchSelectorProps: TSelectorSearch = {
    withSearch: true,
    searchPlaceholder: t("Common:Search"),
    searchValue,
    onSearch: onSearchAction,
    onClearSearch: onClearSearchAction,
    searchLoader: <SearchLoader />,
    isSearchLoading: isFirstLoad && !searchValue && !afterSearch.current,
  };

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
      submitButtonLabel={t("Common:SelectAction")}
      onSubmit={onSubmit}
      isMultiSelect={false}
      emptyScreenImage={
        isBase
          ? EmptyScreenAIAgentsSelectorSvgUrl
          : EmptyScreenAIAgentsSelectorSvgUrlDark
      }
      emptyScreenHeader={t("Common:NoAIAgents")}
      emptyScreenDescription={t("Common:NoAIAgentsDescription")}
      searchEmptyScreenImage={
        isBase
          ? EmptyScreenAIAgentsSelectorSvgUrl
          : EmptyScreenAIAgentsSelectorSvgUrlDark
      }
      searchEmptyScreenHeader={t("Common:NoAIAgentsSearch")}
      searchEmptyScreenDescription={t("Common:NoAIAgentsSearchDescription")}
      totalItems={total}
      hasNextPage={hasNextPage}
      isNextPageLoading={isNextPageLoading}
      loadNextPage={onLoadNextPage}
      isLoading={isFirstLoad}
      disableSubmitButton={!selectedItem}
      alwaysShowFooter={items.length !== 0 || Boolean(searchValue)}
      rowLoader={
        <RowLoader
          isMultiSelect={false}
          isContainer={isFirstLoad}
          isUser={false}
        />
      }
      isSSR={withInit}
      dataTestId="ai_agent_selector"
      useAside
      onClose={onClose}
      withInfoBar={withInfo}
      infoBarData={{
        title: t("Common:ChooseAIAgent"),
        icon: InfoIconSvgUrl,
        onClose: () => setWithInfo(!withInfo),
        description: t("Common:ChooseAIAgentDescription"),
      }}
      hideBackButton
    />
  );
};

const AIAgentSelector = (props: AIAgentSelectorProps) => {
  const { withInit } = props;

  return (
    <LoadersContextProvider withInit={withInit}>
      <AIAgentSelectorComponent {...props} />
    </LoadersContextProvider>
  );
};

export default AIAgentSelector;
