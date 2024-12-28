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

import React from "react";

import XIcon from "PUBLIC_DIR/images/x.react.svg";

import { FilterGroups, FilterKeys, FilterSelectorTypes } from "../../../enums";

import { SelectorAddButton } from "../../selector-add-button";
import { Heading, HeadingLevel, HeadingSize } from "../../heading";
import { ComboBox } from "../../combobox";
import { Checkbox } from "../../checkbox";

import {
  StyledFilterBlockItem,
  StyledFilterBlockItemHeader,
  StyledFilterBlockItemContent,
  StyledFilterBlockItemSelector,
  StyledFilterBlockItemSelectorText,
  StyledFilterBlockItemTagText,
  StyledFilterBlockItemTagIcon,
  StyledFilterBlockItemToggle,
  StyledFilterBlockItemToggleText,
  StyledFilterBlockItemToggleButton,
  StyledFilterBlockItemCheckboxContainer,
  StyledFilterBlockItemSeparator,
  StyledFilterBlockItemTag,
} from "../Filter.styled";
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
      <StyledFilterBlockItemSelector
        style={
          item?.displaySelectorType === "button"
            ? {}
            : { height: "0", width: "0" }
        }
        key={item.key}
        onClick={(event) =>
          showSelectorAction(event, selectorType, item.group, [])
        }
      >
        {item?.displaySelectorType === "button" ? (
          <SelectorAddButton id="filter_add-author" />
        ) : null}
        <StyledFilterBlockItemSelectorText noSelect>
          {item.label}
        </StyledFilterBlockItemSelectorText>
      </StyledFilterBlockItemSelector>
    ) : (
      <StyledFilterBlockItemTag
        key={item.key}
        isSelected={item.isSelected}
        onClick={(event: React.MouseEvent) =>
          showSelectorAction(
            event,
            selectorType,
            item.group,
            clearSelectorRef.current || [],
          )
        }
      >
        <StyledFilterBlockItemTagText
          className="filter-text"
          noSelect
          isSelected={item.isSelected}
          truncate
        >
          {item?.selectedLabel?.toLowerCase()}
        </StyledFilterBlockItemTagText>
        {item.isSelected ? (
          <StyledFilterBlockItemTagIcon ref={clearSelectorRef}>
            <XIcon style={{ marginTop: "2px" }} />
          </StyledFilterBlockItemTagIcon>
        ) : null}
      </StyledFilterBlockItemTag>
    );
  };

  const getToggleItem = (item: TToggleButtonItem) => {
    return (
      <StyledFilterBlockItemToggle key={item.key}>
        <StyledFilterBlockItemToggleText noSelect>
          {item.label}
        </StyledFilterBlockItemToggleText>
        <StyledFilterBlockItemToggleButton
          isChecked={item.isSelected || false}
          onChange={() =>
            changeFilterValueAction(
              item.key as string,
              item.isSelected || false,
            )
          }
        />
      </StyledFilterBlockItemToggle>
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
      <StyledFilterBlockItemCheckboxContainer key={item.key}>
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
        />
      </StyledFilterBlockItemCheckboxContainer>
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
      <StyledFilterBlockItemTag
        key={Array.isArray(item.key) ? item.key[0] : item.key}
        isSelected={item.isSelected}
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
      >
        <StyledFilterBlockItemTagText
          className="filter-text"
          noSelect
          isSelected={item.isSelected}
          truncate
        >
          {item.label}
        </StyledFilterBlockItemTagText>
      </StyledFilterBlockItemTag>
    );
  };

  return (
    <StyledFilterBlockItem isFirst={isFirst} withoutHeader={withoutHeader}>
      {!withoutHeader ? (
        <StyledFilterBlockItemHeader>
          <Heading size={HeadingSize.xsmall} level={HeadingLevel.h1}>
            {label}
          </Heading>
        </StyledFilterBlockItemHeader>
      ) : null}

      <StyledFilterBlockItemContent
        withMultiItems={withMultiItems}
        withoutSeparator={withoutSeparator}
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
      </StyledFilterBlockItemContent>
      {!isLast && !withoutSeparator ? <StyledFilterBlockItemSeparator /> : null}
    </StyledFilterBlockItem>
  );
};

export default React.memo(FilterBlockItem);
