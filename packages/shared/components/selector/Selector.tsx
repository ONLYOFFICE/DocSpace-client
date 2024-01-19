import React from "react";

import { Header } from "./sub-components/Header";
import { Body } from "./sub-components/Body";
import { Footer } from "./sub-components/Footer";

import { StyledSelector } from "./Selector.styled";
import { AccessRight, SelectorProps, TSelectorItem } from "./Selector.types";

const Selector = ({
  id,
  className,
  style,

  headerLabel,
  withoutBackButton,
  onBackClick,

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

  items,
  isMultiSelect,
  selectedItems,
  acceptButtonLabel,
  onSelect,
  onAccept,
  rowLoader,

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

  hasNextPage,
  isNextPageLoading,
  loadNextPage,
  totalItems,
  isLoading,

  withHeader,

  withFooterInput,
  withFooterCheckbox,
  footerInputHeader,
  footerCheckboxLabel,
  currentFooterInputValue,

  alwaysShowFooter,
  disableAcceptButton,

  descriptionText,
  acceptButtonId,
  cancelButtonId,
  isChecked,
  setIsChecked,
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
    React.useState<AccessRight | null>(null);

  const onBackClickAction = React.useCallback(() => {
    onBackClick?.();
  }, [onBackClick]);

  const onClearSearchAction = React.useCallback(() => {
    onClearSearch?.(() => setIsSearch(false));
  }, [onClearSearch]);

  const onSearchAction = React.useCallback(
    (value: string) => {
      const v = value.trim();

      if (v === "") return onClearSearchAction();

      onSearch?.(v, () => setIsSearch(true));
    },
    [onSearch, onClearSearchAction],
  );

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
      id: item.id,
      email: item.email || "",
      avatar: item.avatar,
      icon: item.icon,
      label: item.label,
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
            id: item.id,
            email: item.email,
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
        id: item.id,
        email: item.email,

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
    if (newSelectedItems.length === 0) {
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

  const onAcceptAction = () => {
    onAccept?.(
      newSelectedItems,
      selectedAccess,
      newFooterInputValue,
      isFooterCheckboxChecked,
    );
  };

  const onCancelAction = React.useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const onChangeAccessRightsAction = React.useCallback(
    (access: AccessRight) => {
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
  return (
    <StyledSelector
      id={id}
      className={className}
      style={style}
      data-testid="selector"
    >
      {withHeader && (
        <Header
          onBackClickAction={onBackClickAction}
          headerLabel={headerLabel}
          withoutBackButton={withoutBackButton}
        />
      )}

      <Body
        withHeader={withHeader}
        footerVisible={footerVisible || !!alwaysShowFooter}
        isSearch={isSearch}
        isAllIndeterminate={
          newSelectedItems.length !== renderedItems.length &&
          newSelectedItems.length !== 0
        }
        isAllChecked={
          newSelectedItems.length === renderedItems.length &&
          renderedItems.length !== 0
        }
        placeholder={searchPlaceholder}
        value={searchValue}
        onSearch={onSearchAction}
        onClearSearch={onClearSearchAction}
        items={renderedItems}
        isMultiSelect={isMultiSelect}
        onSelect={onSelectAction}
        withSelectAll={withSelectAll}
        selectAllLabel={selectAllLabel}
        selectAllIcon={selectAllIcon}
        onSelectAll={onSelectAllAction}
        emptyScreenImage={emptyScreenImage}
        emptyScreenHeader={emptyScreenHeader}
        emptyScreenDescription={emptyScreenDescription}
        searchEmptyScreenImage={searchEmptyScreenImage}
        searchEmptyScreenHeader={searchEmptyScreenHeader}
        searchEmptyScreenDescription={searchEmptyScreenDescription}
        hasNextPage={hasNextPage}
        isNextPageLoading={isNextPageLoading}
        loadMoreItems={loadMoreItems}
        totalItems={totalItems || 0}
        isLoading={isLoading}
        searchLoader={searchLoader}
        rowLoader={rowLoader}
        withBreadCrumbs={withBreadCrumbs}
        breadCrumbs={breadCrumbs}
        onSelectBreadCrumb={onSelectBreadCrumb}
        breadCrumbsLoader={breadCrumbsLoader}
        isBreadCrumbsLoading={isBreadCrumbsLoading}
        isSearchLoading={isSearchLoading}
        withSearch={withSearch}
        withFooterInput={withFooterInput}
        withFooterCheckbox={withFooterCheckbox}
        descriptionText={descriptionText}
      />

      {(footerVisible || alwaysShowFooter) && (
        <Footer
          isMultiSelect={isMultiSelect}
          acceptButtonLabel={acceptButtonLabel || ""}
          selectedItemsCount={newSelectedItems.length}
          withCancelButton={withCancelButton}
          cancelButtonLabel={cancelButtonLabel}
          withAccessRights={withAccessRights}
          accessRights={accessRights}
          selectedAccessRight={selectedAccess}
          onAccept={onAcceptAction}
          onCancel={onCancelAction}
          onChangeAccessRights={onChangeAccessRightsAction}
          withFooterInput={withFooterInput}
          withFooterCheckbox={withFooterCheckbox}
          footerInputHeader={footerInputHeader}
          footerCheckboxLabel={footerCheckboxLabel}
          currentFooterInputValue={newFooterInputValue}
          setNewFooterInputValue={setNewFooterInputValue}
          isFooterCheckboxChecked={isFooterCheckboxChecked}
          setIsFooterCheckboxChecked={setIsFooterCheckboxChecked}
          setIsChecked={setIsChecked}
          disableAcceptButton={
            withFooterInput
              ? disableAcceptButton
              : disableAcceptButton && !newFooterInputValue.trim()
          }
          acceptButtonId={acceptButtonId}
          cancelButtonId={cancelButtonId}
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
