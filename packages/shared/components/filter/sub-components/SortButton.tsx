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

import SortDesc from "PUBLIC_DIR/images/sort.desc.react.svg";
import SortReactSvgUrl from "PUBLIC_DIR/images/sort.react.svg?url";

import { Events } from "../../../enums";

import { ComboBox, ComboBoxSize } from "../../combobox";
import { DropDownItem } from "../../drop-down-item";
import { IconButton } from "../../icon-button";
import { ViewSelector } from "../../view-selector";
import { Text } from "../../text";

import { SortButtonProps, TSortDataItem } from "../Filter.types";
import { StyledSortButton } from "../Filter.styled";

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

  const [sortData, setSortData] = React.useState<TSortDataItem[]>([]);
  const [selectedSortData, setSelectedSortData] = React.useState({
    sortDirection: "",
    sortId: "",
  });

  const getSortDataAction = React.useCallback(() => {
    const value = getSortData?.();
    const selectedValue = getSelectedSortData?.();

    const data = value.map((item) => {
      item.className = "option-item";

      if (selectedValue.sortId === item.key) {
        item.className += " selected-option-item";
        item.isSelected = true;
      }

      return item;
    });

    setSortData(data);

    setSelectedSortData({
      sortDirection: selectedValue.sortDirection,
      sortId: selectedValue.sortId,
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
    (
      key: string,
      e?: React.MouseEvent | React.ChangeEvent<HTMLInputElement>,
    ) => {
      let sortDirection = selectedSortData.sortDirection;

      if (key === selectedSortData.sortId) {
        sortDirection = sortDirection === "desc" ? "asc" : "desc";
      }

      let data = sortData.map((item) => ({ ...item }));

      data = data.map((item) => {
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

      if (!e) {
        toggleCombobox();
      }

      onSort?.(key || "", sortDirection);
    },
    [onSort, sortData, selectedSortData, toggleCombobox],
  );

  const advancedOptions = (
    <>
      {viewSelectorVisible && (
        <>
          <DropDownItem noHover className="view-selector-item">
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
      )}
      {sortData?.map((item) => (
        <DropDownItem
          id={item.id}
          onClick={(e) => onOptionClick(item.key, e)}
          className={item.className}
          key={item.key}
          data-value={item.key}
          isSelected={item.isSelected}
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
    <StyledSortButton
      viewAs={viewAs}
      isDesc={selectedSortData.sortDirection === "desc"}
      onClick={toggleCombobox}
      id={id}
      title={title}
    >
      <ComboBox
        opened={isOpen}
        onToggle={toggleCombobox}
        className="sort-combo-box"
        options={[]}
        selectedOption={{ key: "", label: "" }}
        directionX="right"
        directionY="both"
        scaled
        size={ComboBoxSize.content}
        advancedOptions={advancedOptions}
        disableIconClick={false}
        disableItemClick
        isDefaultMode={false}
        manualY="102%"
        advancedOptionsCount={advancedOptionsCount}
        onSelect={() => {}}
        withBlur={false}
        withBackdrop
        onBackdropClick={toggleCombobox}
      >
        <IconButton iconName={SortReactSvgUrl} size={16} />
      </ComboBox>
    </StyledSortButton>
  );
};

export default React.memo(SortButton);
