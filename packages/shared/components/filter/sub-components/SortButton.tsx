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

import SortDesc from "PUBLIC_DIR/images/sort.desc.react.svg";
import SortReactSvg from "PUBLIC_DIR/images/sort.react.svg";

import { Events } from "../../../enums";

import { ComboBox, ComboBoxSize } from "../../combobox";
import { DropDownItem } from "../../drop-down-item";
import { IconButton } from "../../icon-button";
import { ViewSelector } from "../../view-selector";
import { Text } from "../../text";
import { DivWithTooltip } from "../../tooltip";

import { SortButtonProps, TSortDataItem } from "../Filter.types";
import styles from "../Filter.module.scss";

const SortButton = ({
  id,
  getSortData,
  getSelectedSortData,

  onChangeViewAs,
  view,
  viewAs,
  viewSettings,

  onSort,
  viewSelectorVisible,

  onSortButtonClick,
  title,
}: SortButtonProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const Wrapper = title ? DivWithTooltip : "div";

  const [sortData, setSortData] = React.useState<TSortDataItem[]>([]);
  const [selectedSortData, setSelectedSortData] = React.useState({
    sortDirection: "",
    sortId: "",
  });

  const getSortDataAction = React.useCallback(() => {
    const value = getSortData?.();
    const selectedValue = getSelectedSortData?.();

    const data = value.map((itemProp) => {
      const item = { ...itemProp };
      item.className = "option-item";

      if (selectedValue.sortId === item.key) {
        item.className += " selected-option-item";
        item.isSelected = true;
      }

      return item;
    });

    setSortData(data);

    setSelectedSortData({
      sortDirection: selectedValue.sortDirection ?? "",
      sortId: selectedValue.sortId ?? "",
    });
  }, [getSortData, getSelectedSortData]);

  React.useEffect(() => {
    window.addEventListener(Events.CHANGE_COLUMN, getSortDataAction);
    getSortDataAction();

    return () =>
      window.removeEventListener(Events.CHANGE_COLUMN, getSortDataAction);
  }, [getSortDataAction]);

  const toggleCombobox = React.useCallback(() => {
    setIsOpen((val) => !val);
  }, []);

  React.useEffect(() => {
    onSortButtonClick?.(!isOpen);
  }, [isOpen, onSortButtonClick]);

  const onOptionClick = React.useCallback(
    (e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => {
      const target = e.target as HTMLDivElement;
      const key = (target.closest(".option-item") as HTMLDivElement)?.dataset
        .value;

      let { sortDirection } = selectedSortData;

      if (key === selectedSortData.sortId) {
        sortDirection = sortDirection === "desc" ? "asc" : "desc";
      }

      let data = sortData.map((item) => ({ ...item }));

      data = data.map((itemProp) => {
        const item = { ...itemProp };
        item.className = "option-item";
        item.isSelected = false;
        if (key === item.key) {
          item.className += " selected-option-item";
          item.isSelected = true;
        }

        return item;
      });

      setSortData(data);

      setSelectedSortData({
        sortId: key || "",
        sortDirection,
      });

      onSort?.(key || "", sortDirection);
    },
    [onSort, sortData, selectedSortData],
  );

  const advancedOptions = (
    <>
      {viewSelectorVisible ? (
        <>
          <DropDownItem
            noHover
            className="view-selector-item"
            testId="filter_sort_view_selector_item"
          >
            <Text fontWeight={600}>{view}</Text>
            <ViewSelector
              className="view-selector"
              onChangeView={onChangeViewAs}
              viewAs={viewAs}
              viewSettings={viewSettings}
            />
          </DropDownItem>

          <DropDownItem isSeparator />
        </>
      ) : null}
      {sortData?.map((item) => (
        <DropDownItem
          id={item.id}
          onClick={onOptionClick}
          className={item.className}
          key={item.key}
          data-value={item.key}
          testId={`filter_sort_option_${item.key}`}
        >
          <Text fontWeight={600}>{item.label}</Text>
          <SortDesc
            className={`option-item__icon${
              item.isSelected ? " selected-option-item__icon" : ""
            }`}
          />
        </DropDownItem>
      ))}
    </>
  );

  let advancedOptionsCount = sortData.length;

  if (viewSelectorVisible) {
    advancedOptionsCount += 1;
  }

  return (
    <Wrapper
      onClick={toggleCombobox}
      id={id}
      title={title}
      className={styles.sortButton}
      data-row-view={viewAs === "row" ? "true" : "false"}
      data-desc={selectedSortData.sortDirection === "desc" ? "true" : "false"}
      data-testid="filter_sort_button"
    >
      <ComboBox
        opened={isOpen}
        onToggle={toggleCombobox}
        className="sort-combo-box"
        options={[]}
        selectedOption={{ key: "", label: "" }}
        directionX="left"
        directionY="both"
        scaled
        size={ComboBoxSize.content}
        advancedOptions={advancedOptions}
        disableIconClick={false}
        disableItemClick
        isDefaultMode={false}
        advancedOptionsCount={advancedOptionsCount}
        onSelect={() => {}}
        withBlur={false}
        withBackdrop
        onBackdropClick={toggleCombobox}
        type="onlyIcon"
        dataTestId="filter_sort_combobox"
      >
        <IconButton iconNode={<SortReactSvg />} size={16} />
      </ComboBox>
    </Wrapper>
  );
};

export default React.memo(SortButton);
