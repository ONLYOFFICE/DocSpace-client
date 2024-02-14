import React from "react";
import { flushSync } from "react-dom";
import { useTranslation } from "react-i18next";

import ClearReactSvgUrl from "PUBLIC_DIR/images/clear.react.svg?url";

import GroupsSelector from "../../../selectors/Groups";
import PeopleSelector from "../../../selectors/People";
import RoomSelector from "../../../selectors/Room";
import { FilterGroups, FilterSelectorTypes } from "../../../enums";
import { FilterBlockLoader } from "../../../skeletons/filter";

import { Backdrop } from "../../backdrop";
import { Button, ButtonSize } from "../../button";
import { Heading, HeadingSize } from "../../heading";
import { IconButton } from "../../icon-button";
import { Scrollbar } from "../../scrollbar";
import { Portal } from "../../portal";
import { TSelectorItem } from "../../selector";

import {
  StyledControlContainer,
  StyledCrossIcon,
  StyledFilterBlock,
  StyledFilterBlockFooter,
  StyledFilterBlockHeader,
} from "../Filter.styled";

import { FilterBlockProps, TGroupItem, TItem } from "../Filter.types";
import {
  removeGroupManagerFilterValueIfNeeded,
  syncGroupManagerCheckBox,
} from "../Filter.utils";

import FilterBlockItem from "./FilterBlockItem";

const FilterBlock = ({
  selectedFilterValue,
  filterHeader,
  getFilterData,
  hideFilterBlock,
  onFilter,
  selectorLabel,
  userId,
  isRooms,
  isAccounts,
  isPeopleAccounts,
  isGroupsAccounts,
  isInsideGroup,
}: FilterBlockProps) => {
  const { t } = useTranslation(["Common"]);

  const [showSelector, setShowSelector] = React.useState<{
    show: boolean;
    type: string | null;
    group: FilterGroups | null;
  }>({
    show: false,
    type: null,
    group: null,
  });

  const [filterData, setFilterData] = React.useState<TItem[]>([]);
  const [filterValues, setFilterValues] = React.useState<TGroupItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const setFilterDataFn = (data: TItem[]) => {
    const filterSubject = data.find(
      (f) => f.group === FilterGroups.roomFilterSubject,
    );

    if (filterSubject && filterSubject.groupItem) {
      const filterOwner = data.find(
        (f) => f.group === FilterGroups.roomFilterOwner,
      );

      const isSelected =
        filterSubject.groupItem.findIndex((i) => i.isSelected) > -1;

      if (
        filterOwner &&
        filterOwner.groupItem &&
        "isDisabled" in filterOwner.groupItem[0]
      )
        filterOwner.groupItem[0].isDisabled = !isSelected;
    }

    syncGroupManagerCheckBox(data);

    setFilterData(data);
  };

  const changeShowSelector = React.useCallback(
    (selectorType: string, group: FilterGroups) => {
      setShowSelector((val) => ({
        show: !val.show,
        type: selectorType,
        group,
      }));
    },
    [],
  );

  const changeSelectedItems = React.useCallback(
    (filter: TGroupItem[]) => {
      const data = filterData.map((item) => ({ ...item }));

      data.forEach((item) => {
        if (
          filter.find((value) => "group" in value && value.group === item.group)
        ) {
          const currentFilter = filter.find(
            (value) => "group" in value && value.group === item.group,
          );

          item.groupItem?.forEach((groupItem) => {
            groupItem.isSelected = false;
            if (currentFilter && groupItem.key === currentFilter.key) {
              groupItem.isSelected = true;
            }
            if (
              "displaySelectorType" in groupItem &&
              groupItem.displaySelectorType &&
              currentFilter &&
              !Array.isArray(currentFilter.key) &&
              "label" in currentFilter
            ) {
              groupItem.isSelected = true;
              groupItem.selectedKey = currentFilter.key;
              groupItem.selectedLabel = currentFilter.label;
            }
            if (
              "isMultiSelect" in groupItem &&
              groupItem.isMultiSelect &&
              currentFilter &&
              Array.isArray(currentFilter.key) &&
              typeof groupItem.key === "string"
            ) {
              groupItem.isSelected = currentFilter.key.includes(groupItem.key);
            }
            if (
              "withOptions" in groupItem &&
              groupItem.withOptions &&
              currentFilter &&
              Array.isArray(currentFilter.key) &&
              typeof groupItem.key === "string"
            ) {
              groupItem.isSelected = currentFilter.key.includes(groupItem.key);
            }
          });
        } else {
          item.groupItem?.forEach((groupItem) => {
            groupItem.isSelected = false;
            if (
              "displaySelectorType" in groupItem &&
              groupItem.displaySelectorType
            ) {
              groupItem.selectedKey = undefined;
              groupItem.selectedLabel = undefined;
            }
            if (
              "withOptions" in groupItem &&
              groupItem.withOptions &&
              "options" in groupItem
            ) {
              groupItem.options.forEach((x: unknown, index: number) => {
                groupItem.options[index].isSelected = false;
              });
            }
          });
        }
      });

      setFilterDataFn(data);
    },
    [filterData],
  );

  const onClearFilter = React.useCallback(() => {
    changeSelectedItems([]);
    setFilterValues([]);

    if (selectedFilterValue && selectedFilterValue.length > 0 && onFilter)
      onFilter([]);
  }, [changeSelectedItems, onFilter, selectedFilterValue]);

  const changeFilterValue = React.useCallback(
    (
      group: FilterGroups,
      key: string | string[],
      isSelected: boolean,
      label?: string,
      isMultiSelect?: boolean,
    ) => {
      let value = filterValues.map((v: TGroupItem) => {
        if (Array.isArray(v.key)) {
          const newKey = [...v.key];
          v.key = newKey;
        }

        return {
          ...v,
        };
      });

      if (isSelected) {
        if (isMultiSelect) {
          const groupIdx = value.findIndex(
            (item) => "group" in item && item.group === group,
          );

          const groupItemKey = value[groupIdx].key;

          if (Array.isArray(groupItemKey)) {
            const itemIdx = groupItemKey.findIndex((item) => item === key);

            groupItemKey.splice(itemIdx, 1);

            if (groupItemKey.length === 0)
              value = value.filter(
                (item) => "group" in item && item.group !== group,
              );
          }
        } else {
          value = value.filter(
            (item) => "group" in item && item.group !== group,
          );
        }

        value = removeGroupManagerFilterValueIfNeeded(value);

        setFilterValues(value);
        changeSelectedItems(value);

        const idx = selectedFilterValue.findIndex(
          (item) => item.group === group,
        );

        if (idx > -1) {
          if (isMultiSelect) {
            const groupItemKey = selectedFilterValue[idx].key;

            if (Array.isArray(groupItemKey)) {
              const itemIdx = groupItemKey.findIndex((item) => item === key);

              if (itemIdx === -1) return;

              groupItemKey.splice(itemIdx, 1);

              return onFilter(selectedFilterValue);
            }

            onFilter(value);
          }
        }

        return;
      }

      if (value.find((item) => "group" in item && item.group === group)) {
        value.forEach((item) => {
          if ("group" in item && item.group === group) {
            if (
              isMultiSelect &&
              Array.isArray(item.key) &&
              !Array.isArray(key)
            ) {
              item.key.push(key);
            } else {
              item.key = key;
              if (label) {
                item.label = label;
              }
            }
          }
        });
      } else if (label) {
        value.push({ group, key, label });
      } else if (isMultiSelect && typeof key === "string") {
        value.push({ group, key: [key] });
      } else {
        value.push({ group, key });
      }

      setFilterValues(value);
      changeSelectedItems(value);
    },
    [filterValues, changeSelectedItems, selectedFilterValue, onFilter],
  );

  const getDefaultFilterData = React.useCallback(async () => {
    flushSync(() => setIsLoading(true));
    const data = await getFilterData();

    const items = data.filter((item) => item.isHeader === true);

    items.forEach((item) => {
      const groupItem = data.filter(
        (val) => val.group === item.group && val.isHeader !== true,
      );

      groupItem.forEach((i) => (i.isSelected = false));

      item.groupItem = groupItem as TGroupItem[];
    });

    if (selectedFilterValue) {
      selectedFilterValue.forEach((selectedValue) => {
        items.forEach((item) => {
          if (item.group === selectedValue.group) {
            item.groupItem?.forEach((groupItem) => {
              if (
                groupItem.key === selectedValue.key ||
                ("displaySelectorType" in groupItem &&
                  groupItem.displaySelectorType)
              ) {
                groupItem.isSelected = true;
                if (
                  "displaySelectorType" in groupItem &&
                  groupItem.displaySelectorType
                ) {
                  groupItem.selectedLabel = selectedValue.label;
                  groupItem.selectedKey = Array.isArray(selectedValue.key)
                    ? ""
                    : selectedValue.key;
                }
              }

              if (
                "isMultiSelect" in groupItem &&
                groupItem.isMultiSelect &&
                Array.isArray(selectedValue.key) &&
                typeof groupItem.key === "string"
              ) {
                groupItem.isSelected = selectedValue.key.includes(
                  groupItem.key,
                );
              }

              if ("withOptions" in groupItem && groupItem.withOptions) {
                groupItem.options.forEach(
                  (option) =>
                    (option.isSelected = option.key === selectedValue.key),
                );
              }
            });
          }
        });
      });
    }

    const newFilterValues = selectedFilterValue.map((value) => {
      if (Array.isArray(value.key)) {
        const newKey = [...value.key];
        value.key = newKey;
      }

      return {
        ...value,
      };
    });

    setFilterDataFn(items);
    setFilterValues(newFilterValues as TGroupItem[]);

    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [getFilterData, selectedFilterValue]);

  React.useEffect(() => {
    getDefaultFilterData();
  }, [getDefaultFilterData]);

  const onFilterAction = React.useCallback(() => {
    onFilter?.(filterValues);
    hideFilterBlock();
  }, [onFilter, hideFilterBlock, filterValues]);

  const onArrowClick = React.useCallback(() => {
    setShowSelector((val) => ({ ...val, show: false }));
  }, []);

  const selectOption = React.useCallback(
    (items: TSelectorItem[]) => {
      setShowSelector((val) => ({
        ...val,
        show: false,
      }));

      if (showSelector.group)
        changeFilterValue(
          showSelector.group,
          `${items[0].id}`,
          false,
          items[0].label || "",
        );
    },
    [showSelector.group, changeFilterValue],
  );

  const isEqualFilter = () => {
    let isEqual = true;

    if (
      filterValues.length === 0 ||
      selectedFilterValue.length > filterValues.length
    )
      return !isEqual;

    if (
      (selectedFilterValue.length === 0 && filterValues.length > 0) ||
      selectedFilterValue.length !== filterValues.length
    ) {
      isEqual = false;

      return !isEqual;
    }

    filterValues.forEach((value) => {
      const oldValue = selectedFilterValue.find(
        (item) =>
          "group" in item && "group" in value && item.group === value.group,
      );

      let isMultiSelectEqual = false;
      let withOptionsEqual = false;

      if (Array.isArray(value.key) && oldValue) {
        isMultiSelectEqual = true;
        value.key.forEach(
          (item) =>
            (isMultiSelectEqual =
              isMultiSelectEqual && oldValue.key.includes(item)),
        );
      }

      if (oldValue && "options" in value && value.options) {
        withOptionsEqual = true;
        value.options.forEach(
          (option) =>
            (withOptionsEqual =
              isMultiSelectEqual && option.key === oldValue.key),
        );
      }

      isEqual =
        isEqual &&
        (oldValue?.key === value.key || isMultiSelectEqual || withOptionsEqual);
    });

    return !isEqual;
  };

  const showFooter = isEqualFilter();

  const filterBlockComponent = (
    <>
      {showSelector.show ? (
        <StyledFilterBlock>
          {showSelector.type === FilterSelectorTypes.people ? (
            <PeopleSelector
              withOutCurrentAuthorizedUser
              className="people-selector"
              isMultiSelect={false}
              onAccept={selectOption}
              onBackClick={onArrowClick}
              headerLabel={selectorLabel}
              currentUserId={userId}
            />
          ) : showSelector.type === FilterSelectorTypes.groups ? (
            <GroupsSelector
              className="group-selector"
              onAccept={selectOption}
              onBackClick={onArrowClick}
              headerLabel={selectorLabel}
            />
          ) : (
            <RoomSelector
              className="people-selector"
              isMultiSelect={false}
              onAccept={selectOption}
              onBackClick={onArrowClick}
              headerLabel={selectorLabel}
            />
          )}
          <StyledControlContainer onClick={hideFilterBlock}>
            <StyledCrossIcon />
          </StyledControlContainer>
        </StyledFilterBlock>
      ) : (
        <StyledFilterBlock showFooter={showFooter}>
          <StyledFilterBlockHeader>
            <Heading size={HeadingSize.medium}>{filterHeader}</Heading>
            {showFooter && (
              <IconButton
                id="filter_search-options-clear"
                iconName={ClearReactSvgUrl}
                isFill
                onClick={onClearFilter}
                size={17}
              />
            )}
          </StyledFilterBlockHeader>
          <div className="filter-body">
            {isLoading ? (
              <FilterBlockLoader
                isRooms={isRooms}
                isAccounts={isAccounts}
                isPeopleAccounts={isPeopleAccounts}
                isGroupsAccounts={isGroupsAccounts}
                isInsideGroup={isInsideGroup}
              />
            ) : (
              <Scrollbar className="filter-body__scrollbar">
                {filterData.map((item: TItem, index) => {
                  return (
                    <FilterBlockItem
                      key={typeof item.key === "string" ? item.key : ""}
                      label={item.label}
                      group={item.group}
                      groupItem={item.groupItem || []}
                      isLast={item.isLast || false}
                      isFirst={index === 0}
                      withoutHeader={item.withoutHeader || false}
                      withoutSeparator={item.withoutSeparator || false}
                      changeFilterValue={changeFilterValue}
                      showSelector={changeShowSelector}
                      withMultiItems={item.withMultiItems || false}
                    />
                  );
                })}
              </Scrollbar>
            )}
          </div>
          {showFooter && (
            <StyledFilterBlockFooter>
              <Button
                id="filter_apply-button"
                size={ButtonSize.normal}
                primary
                label={t("Common:ApplyButton")}
                scale
                onClick={onFilterAction}
              />
              <Button
                id="filter_cancel-button"
                size={ButtonSize.normal}
                label={t("Common:CancelButton")}
                scale
                onClick={hideFilterBlock}
              />
            </StyledFilterBlockFooter>
          )}

          <StyledControlContainer id="filter_close" onClick={hideFilterBlock}>
            <StyledCrossIcon />
          </StyledControlContainer>
        </StyledFilterBlock>
      )}

      <Backdrop visible withBackground onClick={hideFilterBlock} zIndex={215} />
    </>
  );

  const renderPortalFilterBlock = () => {
    const rootElement = document.getElementById("root");

    return (
      <Portal
        element={filterBlockComponent}
        appendTo={rootElement || undefined}
        visible
      />
    );
  };

  return renderPortalFilterBlock();
};

export default React.memo(FilterBlock);
