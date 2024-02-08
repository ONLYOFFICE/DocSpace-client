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
} from "./Selector.types";

const Selector = ({
  id,
  className,
  style,

  withHeader,
  headerProps,

  isBreadCrumbsLoading,
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

  withAccessRights,
  accessRights,
  selectedAccessRight,
  onAccessRightsChange,

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

  alwaysShowFooter,

  descriptionText,

  cancelButtonId,
}: SelectorProps) => {
  const [footerVisible, setFooterVisible] = React.useState<boolean>(false);
  const [isSearch, setIsSearch] = React.useState<boolean>(false);

  const [renderedItems, setRenderedItems] = React.useState<TSelectorItem[]>([]);
  const [newSelectedItems, setNewSelectedItems] = React.useState<
    TSelectorItem[]
  >([]);

  const [newFooterInputValue, setNewFooterInputValue] = React.useState<string>(
    currentFooterInputValue || "",
  );
  const [isFooterCheckboxChecked, setIsFooterCheckboxChecked] =
    React.useState<boolean>(isChecked || false);

  const [selectedAccess, setSelectedAccess] =
    React.useState<TAccessRight | null>(null);

  const compareSelectedItems = React.useCallback(
    (newList: TSelectorItem[]) => {
      let isEqual = true;

      if (selectedItems?.length !== newList.length) {
        return setFooterVisible(true);
      }

      if (newList.length === 0 && selectedItems?.length === 0) {
        return setFooterVisible(false);
      }

      newList.forEach((item) => {
        isEqual = selectedItems.some((x) => x.id === item.id);
      });

      return setFooterVisible(!isEqual);
    },
    [selectedItems],
  );

  const onSelectAction = (item: TSelectorItem) => {
    onSelect?.({
      ...item,
    });

    if (isMultiSelect) {
      setRenderedItems((value) => {
        const idx = value.findIndex((x) => item.id === x.id);

        const newValue = value.map((i: TSelectorItem) => ({ ...i }));

        if (idx === -1) return newValue;

        newValue[idx].isSelected = !value[idx].isSelected;

        return newValue;
      });

      if (item.isSelected) {
        setNewSelectedItems((value) => {
          const newValue = value
            .filter((x) => x.id !== item.id)
            .map((x) => ({ ...x }));
          compareSelectedItems(newValue);
          return newValue;
        });
      } else {
        setNewSelectedItems((value) => {
          value.push({
            ...item,
          });

          compareSelectedItems(value);

          return value;
        });
      }
    } else {
      setRenderedItems((value) => {
        const idx = value.findIndex((x) => item.id === x.id);

        const newValue = value.map((i: TSelectorItem) => ({
          ...i,
          isSelected: false,
        }));

        if (idx === -1) return newValue;

        newValue[idx].isSelected = !item.isSelected;

        return newValue;
      });

      const newItem = {
        ...item,
      };

      if (item.isSelected) {
        setNewSelectedItems([]);
        compareSelectedItems([]);
      } else {
        setNewSelectedItems([newItem]);
        compareSelectedItems([newItem]);
      }
    }
  };

  const onSelectAllAction = React.useCallback(() => {
    onSelectAll?.();

    if (!items) return;

    if (
      newSelectedItems.length === 0 ||
      newSelectedItems.length !== items.length
    ) {
      const cloneItems = items.map((x) => ({ ...x }));

      const cloneRenderedItems = items.map((x) => ({ ...x, isSelected: true }));

      setRenderedItems(cloneRenderedItems);
      setNewSelectedItems(cloneItems);
      compareSelectedItems(cloneItems);
    } else {
      const cloneRenderedItems = items.map((x) => ({
        ...x,
        isSelected: false,
      }));

      setRenderedItems(cloneRenderedItems);
      setNewSelectedItems([]);
      compareSelectedItems([]);
    }
  }, [compareSelectedItems, items, newSelectedItems.length, onSelectAll]);

  const onSubmitAction = () => {
    onSubmit(
      newSelectedItems,
      selectedAccess,
      newFooterInputValue,
      isFooterCheckboxChecked,
    );
  };

  const onChangeAccessRightsAction = React.useCallback(
    (access: TAccessRight) => {
      setSelectedAccess({ ...access });
      onAccessRightsChange?.(access);
    },
    [onAccessRightsChange],
  );

  const loadMoreItems = React.useCallback(
    (startIndex: number) => {
      if (startIndex === 1) return; // fix double fetch of the first page
      if (!isNextPageLoading) loadNextPage?.(startIndex - 1);
    },
    [isNextPageLoading, loadNextPage],
  );

  React.useEffect(() => {
    if (selectedAccessRight) setSelectedAccess({ ...selectedAccessRight });
  }, [selectedAccessRight]);

  React.useLayoutEffect(() => {
    if (items && selectedItems) {
      if (selectedItems.length === 0 || !isMultiSelect) {
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
      compareSelectedItems(cloneSelectedItems);
    }
  }, [items, selectedItems, isMultiSelect, compareSelectedItems]);

  const breadCrumbsProps: TSelectorBreadCrumbs = withBreadCrumbs
    ? {
        withBreadCrumbs,
        breadCrumbs,
        onSelectBreadCrumb,
        breadCrumbsLoader,
        isBreadCrumbsLoading,
      }
    : ({} as TSelectorBreadCrumbs);

  const onSelectAllProps: TSelectorSelectAll = withSelectAll
    ? {
        withSelectAll,
        selectAllLabel,
        selectAllIcon,
        onSelectAll: onSelectAllAction,
      }
    : ({} as TSelectorSelectAll);

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
        isAllIndeterminate:
          newSelectedItems.length !== renderedItems.length &&
          newSelectedItems.length !== 0,
        isAllChecked:
          newSelectedItems.length === renderedItems.length &&
          renderedItems.length !== 0,
      }
    : ({
        isSearch,
        setIsSearch,
        isAllIndeterminate:
          newSelectedItems.length !== renderedItems.length &&
          newSelectedItems.length !== 0,
        isAllChecked:
          newSelectedItems.length === renderedItems.length &&
          renderedItems.length !== 0,
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
        items={renderedItems}
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
      />

      {(footerVisible || alwaysShowFooter) && (
        <Footer
          isMultiSelect={isMultiSelect}
          selectedItemsCount={newSelectedItems.length}
          onSubmit={onSubmitAction}
          submitButtonLabel={submitButtonLabel}
          disableSubmitButton={disableSubmitButton}
          submitButtonId={submitButtonId}
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

Selector.defaultProps = {
  isMultiSelect: false,
  withSelectAll: false,
  withAccessRights: false,
  withCancelButton: false,
  withoutBackButton: false,
  isBreadCrumbsLoading: false,
  withSearch: true,
  withFooterInput: false,
  alwaysShowFooter: false,
  disableAcceptButton: false,
  withHeader: true,

  selectedItems: [],
};

export { Selector };
