import React from "react";

import XIcon from "PUBLIC_DIR/images/x.react.svg";

import { FilterGroups, FilterKeys, FilterSelectorTypes } from "../../../enums";

import { SelectorAddButton } from "../../selector-add-button";
import { Heading, HeadingLevel, HeadingSize } from "../../heading";
import { ComboBox } from "../../combobox";
import { Checkbox } from "../../checkbox";
import { ColorTheme, ThemeId } from "../../color-theme";

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
    key: string | string[],
    isSelected?: boolean,
    isMultiSelect?: boolean,
    withOptions?: boolean,
  ) => {
    changeFilterValue?.(
      group,
      key,
      isSelected || false,
      undefined,
      isMultiSelect || false,
      withOptions || false,
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
        changeFilterValue?.(g, [], true);
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
        {item?.displaySelectorType === "button" && (
          <SelectorAddButton id="filter_add-author" />
        )}
        <StyledFilterBlockItemSelectorText noSelect>
          {item.label}
        </StyledFilterBlockItemSelectorText>
      </StyledFilterBlockItemSelector>
    ) : (
      <ColorTheme
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
        themeId={ThemeId.FilterBlockItemTag}
      >
        <StyledFilterBlockItemTagText
          className="filter-text"
          noSelect
          isSelected={item.isSelected}
          truncate
        >
          {item?.selectedLabel?.toLowerCase()}
        </StyledFilterBlockItemTagText>
        {item.isSelected && (
          <StyledFilterBlockItemTagIcon ref={clearSelectorRef}>
            <XIcon style={{ marginTop: "2px" }} />
          </StyledFilterBlockItemTagIcon>
        )}
      </ColorTheme>
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
            changeFilterValueAction(item.key, item.isSelected || false)
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
            item.withOptions,
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
            changeFilterValueAction(item.key, item.isSelected || false, false)
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
      item.group === FilterGroups.groupsFilterMember
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
      <ColorTheme
        key={Array.isArray(item.key) ? item.key[0] : item.key}
        isSelected={item.isSelected}
        name={`${item.label}-${item.key}`}
        id={item.id}
        onClick={
          item.key === FilterKeys.other || item.key === "filter_group-other"
            ? (event: React.MouseEvent) =>
                showSelectorAction(event, selectorType, item.group, [])
            : () =>
                changeFilterValueAction(
                  item.key,
                  item.isSelected,
                  item.isMultiSelect,
                )
        }
        themeId={ThemeId.FilterBlockItemTag}
      >
        <StyledFilterBlockItemTagText
          className="filter-text"
          noSelect
          isSelected={item.isSelected}
          truncate
        >
          {item.label}
        </StyledFilterBlockItemTagText>
      </ColorTheme>
    );
  };

  return (
    <StyledFilterBlockItem isFirst={isFirst} withoutHeader={withoutHeader}>
      {!withoutHeader && (
        <StyledFilterBlockItemHeader>
          <Heading size={HeadingSize.xsmall} level={HeadingLevel.h1}>
            {label}
          </Heading>
        </StyledFilterBlockItemHeader>
      )}

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
      {!isLast && !withoutSeparator && <StyledFilterBlockItemSeparator />}
    </StyledFilterBlockItem>
  );
};

export default React.memo(FilterBlockItem);
