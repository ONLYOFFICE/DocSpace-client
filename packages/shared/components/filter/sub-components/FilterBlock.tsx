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

import React from "react";
import { useTranslation } from "react-i18next";
import cloneDeep from "lodash/cloneDeep";

import ClearReactSvgUrl from "PUBLIC_DIR/images/icons/17/clear.react.svg?url";

import GroupsSelector from "../../../selectors/Groups";
import PeopleSelector from "../../../selectors/People";
import RoomSelector from "../../../selectors/Room";
import { FilterGroups, FilterSelectorTypes } from "../../../enums";
import { FilterBlockLoader } from "../../../skeletons/filter";

import { Button, ButtonSize } from "../../button";
import { TSelectorItem } from "../../selector";
import { ModalDialog, ModalDialogType } from "../../modal-dialog";
import { IconButton } from "../../icon-button";

import styles from "../Filter.module.scss";
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
  isContactsPage,
  isContactsPeoplePage,
  isContactsGroupsPage,
  isContactsInsideGroupPage,
  isContactsGuestsPage,
  disableThirdParty,
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
  const [isLoading, setIsLoading] = React.useState(isRooms);

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

    if (selectedFilterValue.size > 0) onFilter([]);
  }, [changeSelectedItems, onFilter, selectedFilterValue]);

  const changeFilterValue = React.useCallback(
    (
      group: FilterGroups,
      key: string,
      isSelected: boolean,
      label?: string,
      isMultiSelect?: boolean,
    ) => {
      let value: TGroupItem[] = cloneDeep(filterValues);

      const isFilterOwner = group === FilterGroups.roomFilterOwner;

      if (isSelected && !isFilterOwner) {
        if (isMultiSelect) {
          const groupItemKey = value.find((item) => item.group === group)!.key;

          if (Array.isArray(groupItemKey)) {
            const itemIdx = groupItemKey.findIndex((item) => item === key);

            groupItemKey.splice(itemIdx, 1);

            if (groupItemKey.length === 0)
              value = value.filter((item) => item.group !== group);
          }
        } else {
          value = value.filter((item) => item.group !== group);
        }

        value = removeGroupManagerFilterValueIfNeeded(value);

        setFilterValues(value);
        changeSelectedItems(value);

        // Commented out the ability to remove parameters from the filter without clicking the Apply button

        // if (selectedFilterValue.has(group)) {
        //   if (isMultiSelect) {
        //     const groupItems = selectedFilterValue.get(group)!;

        //     if (groupItems.size > 1) {
        //       if (!groupItems.has(key)) return;

        //       const selectedFilterValues: TItem[] = [];

        //       Object.entries(selectedFilterValue).forEach(
        //         ([selectedGroup, items]) => {
        //           const item = {
        //             group: selectedGroup as FilterGroups,
        //             key:
        //               items.size === 1
        //                 ? (Array.from(items.keys())[0] as string)
        //                 : (Array.from(items.keys()) as string[]),
        //             label: Array.from(items.keys())[0] as string,
        //           };

        //           if (selectedGroup === group && Array.isArray(item.key)) {
        //             const idx = item.key.findIndex((val) => val === key);

        //             item.key.splice(idx, 1);
        //           }

        //           selectedFilterValues.push(item);
        //         },
        //       );

        //       return onFilter(selectedFilterValues);
        //     }

        //     onFilter(value);
        //   }
        // }

        return;
      }

      if (value.find((item) => item.group === group)) {
        value.forEach((item, idx) => {
          if (item.group === group) {
            if (
              isMultiSelect &&
              Array.isArray(value[idx].key) &&
              !Array.isArray(key)
            ) {
              value[idx].key.push(key);
            } else {
              value[idx].key = isSelected && isFilterOwner ? "1" : key;
              if (label) {
                value[idx].label = label;
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
    [filterValues, changeSelectedItems],
  );

  const getDefaultFilterData = React.useCallback(async () => {
    if (isRooms) setIsLoading(true);
    const data = await getFilterData();

    const headerItems = data.filter((item) => item.isHeader === true);

    headerItems.forEach((item, index) => {
      const groupItems = cloneDeep(
        data.filter((i) => i.group === item.group && !i.isHeader),
      ) as TGroupItem[];

      headerItems[index].groupItem = groupItems.map((groupItem) => {
        if (!selectedFilterValue.has(item.group))
          return {
            ...groupItem,
            isSelected: false,
          };

        const groupSelectedItem = selectedFilterValue.get(item.group);

        let isSelected = false;

        if (!Array.isArray(groupItem.key) && groupItem.key) {
          const selectedItem = groupSelectedItem?.get(groupItem.key);

          isSelected =
            !!selectedItem ||
            ("displaySelectorType" in groupItem &&
              !!groupItem.displaySelectorType);

          if (
            "displaySelectorType" in groupItem &&
            !!groupItem.displaySelectorType
          ) {
            groupItem.selectedLabel = groupSelectedItem
              ?.values()
              .next().value?.label;
            groupItem.selectedKey = groupSelectedItem?.values().next().value
              ?.key as string;
          }
        }

        if (
          "isMultiSelect" in groupItem &&
          groupItem.isMultiSelect &&
          Array.isArray(groupItem.key)
        ) {
          isSelected = groupItem.key.some((key) => groupSelectedItem?.has(key));
        }

        if ("withOptions" in groupItem && groupItem.withOptions) {
          isSelected = groupItem.options.some((option) =>
            groupSelectedItem?.has(option.key),
          );
        }

        return {
          ...groupItem,
          isSelected,
        };
      });
    });

    const newFilterValues: TGroupItem[] = Array.from(
      selectedFilterValue,
      (item) => {
        if (item[0] === FilterGroups.roomFilterTags) {
          const newObj: TGroupItem = {
            group: item[0],
            key: Array.from(item[1].values(), (value) => value.key?.toString()),
          };

          return newObj as TGroupItem;
        }

        return item[1].values().next().value as TGroupItem;
      },
    );

    setFilterDataFn(headerItems);
    setFilterValues(newFilterValues);

    if (isRooms)
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
  }, [getFilterData, selectedFilterValue, isRooms]);

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

    const isSelectedFilterTags = selectedFilterValue.get(
      FilterGroups.roomFilterTags,
    );

    const isFilterValuesTags = filterValues.find(
      (value) => value.group === FilterGroups.roomFilterTags,
    );

    const isEqualTags =
      isSelectedFilterTags?.size ===
      (isFilterValuesTags?.key as string[])?.length;

    if (
      !isEqualTags ||
      (selectedFilterValue.size === 0 && filterValues.length > 0) ||
      selectedFilterValue.size !== filterValues.length
    ) {
      isEqual = false;

      return !isEqual;
    }

    filterValues.forEach((value) => {
      const oldValue = selectedFilterValue.get(value.group);

      let isMultiSelectEqual = false;
      let withOptionsEqual = false;

      if (Array.isArray(value.key) && oldValue) {
        isMultiSelectEqual = true;
        value.key.forEach(
          (item) =>
            (isMultiSelectEqual = isMultiSelectEqual && oldValue.has(item)),
        );
      }

      if (oldValue && "options" in value && value.options) {
        withOptionsEqual = true;
        value.options.forEach(
          (option) =>
            (withOptionsEqual = isMultiSelectEqual && oldValue.has(option.key)),
        );
      }

      isEqual =
        isEqual &&
        ((!Array.isArray(value.key) && value.key && oldValue?.has(value.key)) ||
          isMultiSelectEqual ||
          withOptionsEqual);
    });

    return !isEqual;
  };

  console.log("filter data", filterData);

  const showFooter = isLoading ? false : isEqualFilter();
  const showClearFilterBtn =
    !isLoading && (selectedFilterValue.size > 0 || filterValues.length > 0);

  return (
    <ModalDialog
      displayType={ModalDialogType.aside}
      visible
      onClose={hideFilterBlock}
      withBodyScroll
      containerVisible={showSelector.show}
    >
      {showSelector.show ? (
        <ModalDialog.Container>
          <div className={styles.filterBlock}>
            {showSelector.type === FilterSelectorTypes.people ? (
              <PeopleSelector
                withOutCurrentAuthorizedUser
                className="people-selector"
                onSubmit={selectOption}
                submitButtonLabel=""
                disableSubmitButton={false}
                withHeader
                headerProps={{
                  onBackClick: onArrowClick,
                  onCloseClick: hideFilterBlock,
                  headerLabel: selectorLabel,
                  withoutBackButton: false,
                  withoutBorder: !!isRooms,
                }}
                currentUserId={userId}
                withGuests={!!isRooms}
              />
            ) : showSelector.type === FilterSelectorTypes.groups ? (
              <GroupsSelector
                className="group-selector"
                onSubmit={selectOption}
                withHeader
                headerProps={{
                  onBackClick: onArrowClick,
                  onCloseClick: hideFilterBlock,
                  headerLabel: selectorLabel,
                  withoutBackButton: false,
                  withoutBorder: false,
                }}
              />
            ) : (
              <RoomSelector
                className="room-selector"
                onSubmit={selectOption}
                withHeader
                headerProps={{
                  onBackClick: onArrowClick,
                  onCloseClick: hideFilterBlock,
                  headerLabel: selectorLabel,
                  withoutBackButton: false,
                  withoutBorder: false,
                }}
                isMultiSelect={false}
                withSearch
                disableThirdParty={disableThirdParty}
              />
            )}
          </div>
        </ModalDialog.Container>
      ) : null}

      <ModalDialog.Header>
        <div className={styles.filterBlockHeader}>
          {filterHeader}

          <div className="additional-icons-container">
            {showClearFilterBtn ? (
              <IconButton
                key="filter-icon"
                size={17}
                className="close-button"
                iconName={ClearReactSvgUrl}
                onClick={onClearFilter}
                isClickable
                isFill
              />
            ) : null}
          </div>
        </div>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <div className="filter-body">
          {isLoading ? (
            <FilterBlockLoader
              isRooms={isRooms}
              isContactsPage={isContactsPage}
              isContactsPeoplePage={isContactsPeoplePage}
              isContactsGroupsPage={isContactsGroupsPage}
              isContactsInsideGroupPage={isContactsInsideGroupPage}
              isContactsGuestsPage={isContactsGuestsPage}
            />
          ) : (
            <>
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
            </>
          )}
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          id="filter_apply-button"
          size={ButtonSize.normal}
          primary
          label={t("Common:ApplyButton")}
          scale
          onClick={onFilterAction}
          isDisabled={!showFooter}
        />
        <Button
          id="filter_cancel-button"
          size={ButtonSize.normal}
          label={t("Common:CancelButton")}
          scale
          onClick={hideFilterBlock}
          isDisabled={isLoading}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default React.memo(FilterBlock);
