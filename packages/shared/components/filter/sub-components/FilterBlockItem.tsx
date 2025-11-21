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
import classNames from "classnames";

import XIcon from "PUBLIC_DIR/images/x.react.svg";

import { FilterGroups, FilterKeys, FilterSelectorTypes } from "../../../enums";

import { SelectorAddButton } from "../../selector-add-button";
import { Heading, HeadingLevel, HeadingSize } from "../../heading";
import { ComboBox } from "../../combobox";
import { Checkbox } from "../../checkbox";
import { Text } from "../../text";
import { ToggleButton } from "../../toggle-button";

import styles from "../Filter.module.scss";
import {
  FilterBlockItemProps,
  TCheckboxItem,
  TGroupItem,
  TSelectorItem,
  TTagItem,
  TToggleButtonItem,
  TWithOptionItem,
} from "../Filter.types";

const FilterBlockItem = ({
  group,
  label,
  groupItem,
  isLast,
  withoutHeader,
  withoutSeparator,
  changeFilterValue,
  showSelector,
  isFirst,
  withMultiItems,
}: FilterBlockItemProps) => {
  const changeFilterValueAction = (
    key: string,
    isSelected?: boolean,
    isMultiSelect?: boolean,
  ) => {
    changeFilterValue?.(
      group,
      key,
      isSelected || false,
      undefined,
      isMultiSelect || false,
    );
  };

  const showSelectorAction = (
    event: React.MouseEvent,
    selectorType: string,
    g: FilterGroups,
    ref: HTMLDivElement | [],
  ) => {
    let target = event.target as HTMLDivElement;

    while (target.parentNode) {
      target = target.parentNode as HTMLDivElement;

      if (target === ref) {
        changeFilterValue?.(g, "", true);
        return;
      }
    }

    showSelector?.(selectorType, g);
  };

  const clearSelectorRef = React.useRef<HTMLDivElement | null>(null);

  const getSelectorItem = (item: TSelectorItem) => {
    const isRoomsSelector = item.group === FilterGroups.filterRoom;
    const isGroupsSelector = item.group === FilterGroups.filterGroup;
    const selectorType = isRoomsSelector
      ? FilterSelectorTypes.rooms
      : isGroupsSelector
        ? FilterSelectorTypes.groups
        : FilterSelectorTypes.people;

    return !item.isSelected ||
      item.selectedKey === "me" ||
      item.selectedKey === FilterKeys.withoutGroup ||
      item.selectedKey === "other" ? (
      <div
        className={styles.filterBlockItemSelector}
        style={
          item?.displaySelectorType === "button" ? {} : { display: "none" }
        }
        key={item.key}
        onClick={(event) =>
          showSelectorAction(event, selectorType, item.group, [])
        }
        data-testid={`filter_selector_${item.key}`}
      >
        {item?.displaySelectorType === "button" ? (
          <SelectorAddButton
            id="filter_add-author"
            label={item.label}
            lineHeight="15px"
            noSelect
            testId={`filter_selector_add_button_${item.key}`}
          />
        ) : (
          <Text
            fontSize="13px"
            fontWeight={600}
            lineHeight="15px"
            noSelect
            className={styles.filterBlockItemSelectorText}
          >
            {item.label}
          </Text>
        )}
      </div>
    ) : (
      <div
        key={item.key}
        className={styles.filterBlockItemTag}
        data-selected={item.isSelected ? "true" : "false"}
        onClick={(event: React.MouseEvent) =>
          showSelectorAction(
            event,
            selectorType,
            item.group,
            clearSelectorRef.current || [],
          )
        }
        data-testid={`filter_selector_selected_${item.key}`}
      >
        <Text
          className={classNames(
            styles.filterBlockItemTagText,

            { [styles.selected]: item.isSelected },
            "filter-text",
          )}
          noSelect
          truncate
          fontSize="13px"
          fontWeight={400}
          lineHeight="20px"
        >
          {item?.selectedLabel}
        </Text>
        {item.isSelected ? (
          <div
            className={styles.filterBlockItemTagIcon}
            ref={clearSelectorRef}
            data-testid={`filter_selector_clear_${item.key}`}
          >
            <XIcon style={{ marginTop: "2px" }} />
          </div>
        ) : null}
      </div>
    );
  };

  const getToggleItem = (item: TToggleButtonItem) => {
    return (
      <div
        className={styles.filterBlockItemToggle}
        key={item.key}
        data-testid={`filter_toggle_${item.key}`}
      >
        <Text fontSize="13px" fontWeight={600} lineHeight="36px" noSelect>
          {item.label}
        </Text>
        <ToggleButton
          className={styles.filterBlockItemToggleButton}
          isChecked={item.isSelected || false}
          onChange={() =>
            changeFilterValueAction(
              item.key as string,
              item.isSelected || false,
            )
          }
          dataTestId={`filter_toggle_button_${item.key}`}
        />
      </div>
    );
  };

  const getWithOptionsItem = (item: TWithOptionItem) => {
    const selectedOption =
      item.options.find((option) => option.isSelected) || item.options[0];

    return (
      <ComboBox
        id={item.id}
        className="combo-item"
        key={item.key}
        onSelect={(data) =>
          changeFilterValueAction(
            `${data.key}`,
            data.key === item.options[0].key,
            false,
          )
        }
        options={item.options}
        selectedOption={selectedOption}
        displaySelectedOption
        scaled
        scaledOptions
        isDefaultMode={false}
        directionY="bottom"
        fixedDirection
      />
    );
  };

  const getCheckboxItem = (item: TCheckboxItem) => {
    return (
      <div
        className={styles.filterBlockItemCheckboxContainer}
        key={item.key}
        data-testid={`filter_checkbox_container_${item.key}`}
      >
        <Checkbox
          id={item.id}
          isChecked={item.isSelected}
          label={item.label}
          isDisabled={item.isDisabled}
          onChange={() =>
            changeFilterValueAction(
              item.key as string,
              item.isSelected || false,
              false,
            )
          }
          dataTestId={`filter_checkbox_${item.key}`}
        />
      </div>
    );
  };

  const getTagItem = (item: TTagItem) => {
    const isRoomsSelector = item.group === FilterGroups.filterRoom;
    const isGroupsSelector = item.group === FilterGroups.filterGroup;

    const selectorType = isRoomsSelector
      ? FilterSelectorTypes.rooms
      : isGroupsSelector
        ? FilterSelectorTypes.groups
        : FilterSelectorTypes.people;

    if (
      item.group === FilterGroups.filterAuthor ||
      item.group === FilterGroups.roomFilterSubject ||
      item.group === FilterGroups.filterGroup ||
      item.group === FilterGroups.groupsFilterMember ||
      item.group === FilterGroups.filterInviter
    ) {
      const [notSelectorItem, otherItem, selectorItem] = groupItem;

      if (
        item.key === otherItem.key &&
        selectorItem?.isSelected &&
        !notSelectorItem?.isSelected
      )
        return;
    }

    return (
      <div
        key={Array.isArray(item.key) ? item.key[0] : item.key}
        className={styles.filterBlockItemTag}
        data-selected={item.isSelected ? "true" : "false"}
        id={item.id}
        onClick={
          item.key === FilterKeys.other || item.key === "filter_group-other"
            ? (event: React.MouseEvent) =>
                showSelectorAction(event, selectorType, item.group, [])
            : () =>
                changeFilterValueAction(
                  item.key as string,
                  item.isSelected,
                  item.isMultiSelect,
                )
        }
        data-testid={`filter_tag_${Array.isArray(item.key) ? item.key[0] : item.key}`}
      >
        <Text
          className={classNames(
            styles.filterBlockItemTagText,

            { [styles.selected]: item.isSelected },
            "filter-text",
          )}
          noSelect
          truncate
          fontSize="13px"
          fontWeight={400}
          lineHeight="20px"
        >
          {item.label}
        </Text>
      </div>
    );
  };

  return (
    <div
      className={classNames(styles.filterBlockItem, {
        [styles.isFirst]: isFirst,
        [styles.withoutHeader]: withoutHeader,
      })}
      data-testid={`filter_block_item_${group}`}
    >
      {!withoutHeader ? (
        <div
          className={styles.filterBlockItemHeader}
          data-testid={`filter_block_item_header_${group}`}
        >
          <Heading size={HeadingSize.xsmall} level={HeadingLevel.h1}>
            {label}
          </Heading>
        </div>
      ) : null}

      <div
        className={classNames(styles.filterBlockItemContent, {
          [styles.withMultiItems]: withMultiItems,
          [styles.withoutSeparator]: withoutSeparator,
        })}
        data-testid={`filter_block_item_content_${group}`}
      >
        {groupItem.map((item: TGroupItem) => {
          if ("displaySelectorType" in item && item.displaySelectorType)
            return getSelectorItem(item);
          if ("isToggle" in item && item.isToggle) return getToggleItem(item);
          if ("withOptions" in item && item.withOptions)
            return getWithOptionsItem(item);
          if ("isCheckbox" in item && item.isCheckbox)
            return getCheckboxItem(item);
          return getTagItem(item as TTagItem);
        })}
      </div>
      {!isLast && !withoutSeparator ? (
        <div className={styles.filterBlockItemSeparator} />
      ) : null}
    </div>
  );
};

export default React.memo(FilterBlockItem);
