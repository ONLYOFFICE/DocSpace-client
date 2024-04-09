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

"use client";

import React from "react";

import { Header } from "./sub-components/Header";
import { Body } from "./sub-components/Body";
import { Footer } from "./sub-components/Footer";

import { StyledSelector } from "./Selector.styled";
import {
  TAccessRight,
  SelectorProps,
  TSelectorBodySearch,
  TSelectorBreadCrumbs,
  TSelectorCancelButton,
  TSelectorItem,
  TSelectorSelectAll,
  TSelectorAccessRights,
  TSelectorFooterInput,
  TSelectorFooterCheckbox,
  TWithTabs,
  TSelectorInfo,
} from "./Selector.types";

const Selector = ({
  id,
  className,
  style,

  withHeader,
  headerProps,

  isBreadCrumbsLoading = false,
  breadCrumbsLoader,
  withBreadCrumbs,
  breadCrumbs,
  onSelectBreadCrumb,

  withSearch,
  searchLoader,
  isSearchLoading,
  searchPlaceholder,
  searchValue,
  onSearch,
  onClearSearch,

  withSelectAll,
  selectAllLabel,
  selectAllIcon,
  onSelectAll,

  emptyScreenImage,
  emptyScreenHeader,
  emptyScreenDescription,
  searchEmptyScreenImage,
  searchEmptyScreenHeader,
  searchEmptyScreenDescription,

  submitButtonLabel,
  submitButtonId,
  disableSubmitButton,
  onSubmit,

  withCancelButton,
  cancelButtonLabel,
  onCancel,
  cancelButtonId,

  withAccessRights,
  accessRights,
  selectedAccessRight,
  onAccessRightsChange,
  accessRightsMode,

  withFooterInput,
  footerInputHeader,
  currentFooterInputValue,

  withFooterCheckbox,
  footerCheckboxLabel,
  isChecked,
  setIsChecked,

  items,
  renderCustomItem,
  isMultiSelect,
  selectedItems,

  onSelect,

  rowLoader,

  hasNextPage,
  isNextPageLoading,
  loadNextPage,
  totalItems,
  isLoading,
  disableFirstFetch,

  alwaysShowFooter,

  descriptionText,

  withTabs,
  tabsData,
  activeTabId,

  withInfo,
  infoText,
}: SelectorProps) => {
  const [footerVisible, setFooterVisible] = React.useState<boolean>(false);
  const [isSearch, setIsSearch] = React.useState<boolean>(false);

  const [renderedItems, setRenderedItems] = React.useState<TSelectorItem[]>([]);
  const [newSelectedItems, setNewSelectedItems] = React.useState<
    TSelectorItem[]
  >([]);
  const [selectedTabItems, setSelectedTabItems] = React.useState<{
    [key: string]: TSelectorItem[];
  }>({});

  const [newFooterInputValue, setNewFooterInputValue] = React.useState<string>(
    currentFooterInputValue || "",
  );
  const [isFooterCheckboxChecked, setIsFooterCheckboxChecked] =
    React.useState<boolean>(isChecked || false);
  const [selectedAccess, setSelectedAccess] =
    React.useState<TAccessRight | null>(() => {
      if (selectedAccessRight) return { ...selectedAccessRight };

      return null;
    });

  const [requestRunning, setRequestRunning] = React.useState<boolean>(false);

  const onSubmitAction = async (
    item?: TSelectorItem | React.MouseEvent,
    fromCallback?: boolean,
  ) => {
    setRequestRunning(true);

    await onSubmit(
      fromCallback && item && "label" in item ? [item] : newSelectedItems,
      selectedAccess,
      newFooterInputValue,
      isFooterCheckboxChecked,
    );

    setRequestRunning(false);
  };

  const onSelectAction = (item: TSelectorItem, isDoubleClick: boolean) => {
    onSelect?.(
      {
        ...item,
      },
      isDoubleClick,
      () => onSubmitAction(item, true),
    );

    if (isMultiSelect) {
      if (item.isSelected) {
        setNewSelectedItems((value) => {
          const newValue = value.filter((x) => x.id !== item.id);

          return newValue;
        });
        if (activeTabId) {
          setSelectedTabItems((value) => {
            const newValue = { ...value };
            newValue[activeTabId] = newValue[activeTabId].filter(
              (x) => x.id !== item.id,
            );

            return newValue;
          });
        }
      } else {
        setNewSelectedItems((value) => {
          value.push({
            ...item,
          });

          return [...value];
        });
        if (activeTabId) {
          setSelectedTabItems((value) => {
            const newValue = { ...value };

            if (newValue[activeTabId]) newValue[activeTabId].push(item);
            else newValue[activeTabId] = [{ ...item }];

            return newValue;
          });
        }
      }
      setRenderedItems((value) => {
        const idx = value.findIndex((x) => item.id === x.id);

        if (idx === -1) return value;

        value[idx] = { ...value[idx], isSelected: !value[idx].isSelected };

        return value;
      });
    } else {
      setRenderedItems((value) => {
        const idx = value.findIndex((x) => item.id === x.id);

        const newValue = value.map((i: TSelectorItem) => ({
          ...i,
          isSelected: false,
        }));

        if (idx === -1) return newValue;

        newValue[idx].isSelected = !item.isSelected;

        return [...newValue];
      });

      if (item.isSelected && !isDoubleClick) {
        setNewSelectedItems([]);
      } else {
        setNewSelectedItems([item]);
      }
    }
  };

  const onSelectAllAction = React.useCallback(() => {
    onSelectAll?.();

    if (!items) return;

    const query =
      activeTabId && selectedTabItems[activeTabId]
        ? selectedTabItems[activeTabId].length === 0 ||
          selectedTabItems[activeTabId].length !==
            items.filter((i) => !i.isDisabled).length
        : newSelectedItems.length === 0 ||
          newSelectedItems.length !== items.filter((i) => !i.isDisabled).length;

    if (query) {
      const cloneItems = items
        .map((x) => ({ ...x }))
        .filter((x) => !x.isDisabled);

      setRenderedItems((i) => {
        const cloneRenderedItems = i.map((x) => ({
          ...x,
          isSelected: !x.isDisabled,
        }));

        return cloneRenderedItems;
      });
      // setNewSelectedItems(cloneItems);
      if (activeTabId) {
        setSelectedTabItems((value) => {
          const newValue = { ...value };

          newValue[activeTabId] = [...cloneItems];

          return newValue;
        });
        setNewSelectedItems((value) => [...value, ...cloneItems]);
      } else {
        setNewSelectedItems(cloneItems);
      }
    } else {
      setRenderedItems((i) => {
        const cloneRenderedItems = i.map((x) => ({
          ...x,
          isSelected: false,
        }));

        return cloneRenderedItems;
      });
      // setNewSelectedItems([]);

      if (activeTabId) {
        setSelectedTabItems((value) => {
          const newValue = { ...value };

          newValue[activeTabId] = [];

          return newValue;
        });

        setNewSelectedItems((value) => {
          const newValue = value.filter(
            (v) => items.findIndex((i) => i.id === v.id) === -1,
          );

          return newValue;
        });
      } else {
        setNewSelectedItems([]);
      }
    }
  }, [
    activeTabId,
    items,
    newSelectedItems.length,
    onSelectAll,
    selectedTabItems,
  ]);

  const onChangeAccessRightsAction = React.useCallback(
    (access: TAccessRight) => {
      setSelectedAccess({ ...access });
      onAccessRightsChange?.(access);
    },
    [onAccessRightsChange],
  );

  const loadMoreItems = React.useCallback(
    (startIndex: number) => {
      if (!isNextPageLoading) loadNextPage(startIndex - 1);
    },
    [isNextPageLoading, loadNextPage],
  );

  React.useEffect(() => {
    if (disableFirstFetch) return;
    loadNextPage(0);
  }, [disableFirstFetch, loadNextPage]);

  React.useEffect(() => {
    if (selectedAccessRight) setSelectedAccess({ ...selectedAccessRight });
  }, [selectedAccessRight]);

  React.useEffect(() => {
    let isEqual = true;

    if (selectedItems && selectedItems.length !== newSelectedItems.length) {
      return setFooterVisible(true);
    }

    if (
      newSelectedItems.length === 0 &&
      selectedItems &&
      selectedItems.length === 0
    ) {
      return setFooterVisible(false);
    }

    if (selectedItems) {
      newSelectedItems.forEach((item) => {
        isEqual = selectedItems.some((x) => x.id === item.id);
      });

      return setFooterVisible(!isEqual);
    }

    isEqual = !!newSelectedItems.length;

    setFooterVisible(isEqual);
  }, [selectedItems, newSelectedItems]);

  React.useLayoutEffect(() => {
    if (items) {
      if (
        !selectedItems ||
        (selectedItems && selectedItems.length === 0) ||
        !isMultiSelect
      ) {
        const cloneItems = items.map((x) => ({ ...x, isSelected: false }));

        return setRenderedItems(cloneItems);
      }

      const newItems = items.map((item) => {
        const { id: itemId } = item;

        const isSelected = selectedItems.some(
          (selectedItem) => selectedItem.id === itemId,
        );

        return { ...item, isSelected };
      });

      const cloneSelectedItems = selectedItems.map((item) => ({ ...item }));

      setRenderedItems(newItems);
      setNewSelectedItems(cloneSelectedItems);
    }
  }, [items, selectedItems, isMultiSelect]);

  const breadCrumbsProps: TSelectorBreadCrumbs = withBreadCrumbs
    ? {
        withBreadCrumbs,
        breadCrumbs,
        onSelectBreadCrumb,
        breadCrumbsLoader,
        isBreadCrumbsLoading,
      }
    : ({} as TSelectorBreadCrumbs);

  const tempRenderedItemsLength = renderedItems.filter(
    (x) => !x.isDisabled,
  ).length;

  const isAllIndeterminate =
    activeTabId && selectedTabItems[activeTabId]
      ? selectedTabItems[activeTabId].length !== tempRenderedItemsLength &&
        selectedTabItems[activeTabId].length !== 0
      : newSelectedItems.length !== tempRenderedItemsLength &&
        newSelectedItems.length !== 0;
  const isAllChecked =
    activeTabId && selectedTabItems[activeTabId]
      ? selectedTabItems[activeTabId].length === tempRenderedItemsLength &&
        tempRenderedItemsLength !== 0
      : newSelectedItems.length === tempRenderedItemsLength &&
        tempRenderedItemsLength !== 0;

  const onSelectAllProps: TSelectorSelectAll = withSelectAll
    ? {
        withSelectAll,
        selectAllLabel,
        selectAllIcon,
        onSelectAll: onSelectAllAction,
        isAllIndeterminate,
        isAllChecked,
      }
    : {
        isAllIndeterminate,
        isAllChecked,
      };

  const searchProps: TSelectorBodySearch = withSearch
    ? {
        withSearch,
        searchPlaceholder,
        searchLoader,
        isSearchLoading,
        searchValue,
        setIsSearch,
        onClearSearch,
        isSearch,
        onSearch,
      }
    : ({
        isSearch,
        setIsSearch,
      } as TSelectorBodySearch);

  const cancelButtonProps = withCancelButton
    ? { withCancelButton, onCancel, cancelButtonLabel, cancelButtonId }
    : ({} as TSelectorCancelButton);

  const accessRightsProps = withAccessRights
    ? {
        withAccessRights,
        accessRights,
        selectedAccessRight: selectedAccess,
        onAccessRightsChange: onChangeAccessRightsAction,
        accessRightsMode,
      }
    : ({} as TSelectorAccessRights);

  const inputProps = withFooterInput
    ? {
        withFooterInput,
        footerInputHeader,
        currentFooterInputValue: newFooterInputValue,
        setNewFooterInputValue,
      }
    : ({
        currentFooterInputValue: newFooterInputValue,
        setNewFooterInputValue,
      } as TSelectorFooterInput);

  const checkboxProps: TSelectorFooterCheckbox = withFooterCheckbox
    ? {
        withFooterCheckbox,
        footerCheckboxLabel,
        isChecked: isFooterCheckboxChecked,
        setIsFooterCheckboxChecked,
        setIsChecked,
      }
    : ({
        isChecked: isFooterCheckboxChecked,
        setIsFooterCheckboxChecked,
        setIsChecked,
      } as TSelectorFooterCheckbox);

  const tabsProps: TWithTabs = withTabs
    ? { withTabs, tabsData, activeTabId }
    : {};

  const infoProps: TSelectorInfo = withInfo
    ? {
        withInfo,
        infoText,
      }
    : {};

  React.useEffect(() => {
    if (!isMultiSelect) return;
    let hasConflict = false;

    const cloneItems = renderedItems.map((x) => {
      if (x.isSelected) return { ...x };

      const isSelected = newSelectedItems.some(
        (selectedItem) => selectedItem.id === x.id,
      );

      if (isSelected) hasConflict = true;

      return { ...x, isSelected };
    });

    if (hasConflict) {
      setRenderedItems(cloneItems);
    }
  }, [isMultiSelect, renderedItems, newSelectedItems]);

  React.useEffect(() => {
    setSelectedTabItems((value) => {
      const newValue = { ...value };
      tabsData?.forEach((tab) => {
        if (!newValue[tab.id]) newValue[tab.id] = [];
      });

      return newValue;
    });
  }, [tabsData]);

  return (
    <StyledSelector
      id={id}
      className={className}
      style={style}
      data-testid="selector"
    >
      {withHeader && <Header {...headerProps} />}
      <Body
        withHeader={withHeader}
        footerVisible={footerVisible || !!alwaysShowFooter}
        items={[...renderedItems]}
        isMultiSelect={isMultiSelect}
        onSelect={onSelectAction}
        // empty screen
        emptyScreenImage={emptyScreenImage}
        emptyScreenHeader={emptyScreenHeader}
        emptyScreenDescription={emptyScreenDescription}
        searchEmptyScreenImage={searchEmptyScreenImage}
        searchEmptyScreenHeader={searchEmptyScreenHeader}
        searchEmptyScreenDescription={searchEmptyScreenDescription}
        hasNextPage={hasNextPage}
        isNextPageLoading={isNextPageLoading}
        loadMoreItems={loadMoreItems}
        renderCustomItem={renderCustomItem}
        totalItems={totalItems || 0}
        isLoading={isLoading}
        rowLoader={rowLoader}
        withFooterInput={withFooterInput}
        withFooterCheckbox={withFooterCheckbox}
        descriptionText={descriptionText}
        // bread crumbs
        {...breadCrumbsProps}
        // select all
        {...onSelectAllProps}
        // search
        {...searchProps}
        // tabs
        {...tabsProps}
        // info
        {...infoProps}
      />

      {(footerVisible || alwaysShowFooter) && (
        <Footer
          isMultiSelect={isMultiSelect}
          selectedItemsCount={newSelectedItems.length}
          onSubmit={onSubmitAction}
          submitButtonLabel={submitButtonLabel}
          disableSubmitButton={
            alwaysShowFooter
              ? newSelectedItems.length === 0 || disableSubmitButton
              : disableSubmitButton
          }
          submitButtonId={submitButtonId}
          requestRunning={requestRunning}
          // cancel button
          {...cancelButtonProps}
          // access rights
          {...accessRightsProps}
          // input
          {...inputProps}
          // checkbox
          {...checkboxProps}
        />
      )}
    </StyledSelector>
  );
};

export { Selector };
