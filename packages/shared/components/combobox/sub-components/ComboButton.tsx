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
import { ReactSVG } from "react-svg";

import { IconSizeType } from "../../../utils";
import { LoaderTypes } from "../../loader";

import {
  StyledArrowIcon,
  StyledIcon,
  StyledOptionalItem,
  StyledTriangleDownIcon,
  StyledLoader,
  StyledPlusBadge,
  DescriptiveContainer,
} from "../ComboBox.styled";

import { Text } from "../../text";
import { Badge } from "../../badge";

import ComboButtonTheme from "../ComboBox.theme";

import { ComboBoxSize } from "../ComboBox.enums";
import type { TComboButtonProps } from "../ComboBox.types";

const ComboButton: React.FC<TComboButtonProps> = ({
  onClick,

  innerContainer,

  selectedOption,
  optionsLength = 0,

  comboIcon,
  fillIcon,

  type,
  plusBadgeValue,
  noBorder = false,
  isDisabled = false,
  withOptions = true,
  withAdvancedOptions = false,
  innerContainerClassName = "innerContainer",
  isOpen = false,
  size = ComboBoxSize.content,
  scaled = false,
  modernView = false,
  tabIndex = -1,
  isLoading = false,
  displayArrow: displayArrowProp,
}) => {
  const defaultOption = selectedOption?.default;
  // const isSelected = selectedOption?.key !== 0;
  const displayArrow = withOptions || withAdvancedOptions || displayArrowProp;

  const comboButtonClassName = `combo-button combo-button_${isOpen ? "open" : "closed"}`;

  const Icon = selectedOption?.icon;
  const isIconReactElement =
    Icon &&
    typeof Icon === "function" &&
    React.isValidElement(React.createElement(Icon));

  return (
    <ComboButtonTheme
      isOpen={isOpen}
      isDisabled={isDisabled}
      noBorder={noBorder}
      containOptions={optionsLength}
      withAdvancedOptions={withAdvancedOptions}
      onClick={onClick}
      scaled={scaled}
      size={size}
      modernView={modernView}
      className={comboButtonClassName}
      tabIndex={tabIndex}
      displayArrow={displayArrow}
      isLoading={isLoading}
      type={type}
      selectedOption={selectedOption}
      plusBadgeValue={plusBadgeValue}
      aria-disabled={isDisabled}
      aria-expanded={isOpen}
      aria-pressed={isOpen}
      aria-haspopup="listbox"
      role="button"
      data-test-id="combo-button"
    >
      {innerContainer ? (
        <StyledOptionalItem
          className={innerContainerClassName}
          isDisabled={isDisabled}
          defaultOption={defaultOption}
          isLoading={isLoading}
          fillIcon={fillIcon}
        >
          {innerContainer}
        </StyledOptionalItem>
      ) : null}
      {selectedOption && selectedOption.icon ? (
        <StyledIcon
          className="combo-button_selected-icon-container"
          isDisabled={isDisabled}
          defaultOption={defaultOption}
          isLoading={isLoading}
          data-test-id="combo-button-icon"
        >
          {isIconReactElement ? React.createElement(Icon) : null}

          {typeof selectedOption.icon === "string" ? (
            <ReactSVG
              src={selectedOption.icon}
              className={fillIcon ? "combo-button_selected-icon" : ""}
            />
          ) : null}
        </StyledIcon>
      ) : null}
      {type === "badge" ? (
        <Badge
          label={selectedOption.label}
          noHover
          color={selectedOption.color}
          backgroundColor={selectedOption.backgroundColor}
          border={`2px solid ${selectedOption.border}`}
          compact={!!selectedOption.border}
          data-test-id="combo-button-badge"
        />
      ) : type === "descriptive" ? (
        <DescriptiveContainer data-test-id="combo-button-descriptive">
          <Text
            title={selectedOption?.label}
            as="div"
            truncate
            fontWeight={600}
            className="combo-button-label"
            fontSize="14px"
            lineHeight="16px"
            dir="auto"
          >
            {selectedOption?.label}
          </Text>
          <Text
            title={selectedOption?.description}
            fontSize="12px"
            lineHeight="16px"
            fontWeight={400}
            dir="auto"
          >
            {selectedOption?.description}
          </Text>
        </DescriptiveContainer>
      ) : type !== "onlyIcon" ? (
        <Text
          title={selectedOption?.label}
          as="div"
          truncate
          fontWeight={600}
          className="combo-button-label"
          dir="auto"
        >
          {selectedOption?.label}
        </Text>
      ) : null}
      {plusBadgeValue ? (
        <StyledPlusBadge
          isOpen={isOpen}
        >{`+${plusBadgeValue}`}</StyledPlusBadge>
      ) : null}
      <StyledArrowIcon
        displayArrow={displayArrow}
        isOpen={isOpen}
        className="combo-buttons_arrow-icon"
        isLoading={isLoading}
        isDisabled={isDisabled}
        data-test-id="combo-button-arrow"
        aria-hidden="true"
      >
        {displayArrow ? (
          comboIcon ? (
            <ReactSVG
              src={comboIcon}
              className="combo-buttons_expander-icon"
              data-test-id="combo-button-custom-icon"
            />
          ) : (
            <StyledTriangleDownIcon
              size={IconSizeType.scale}
              className="combo-buttons_expander-icon"
              data-test-id="combo-button-default-icon"
            />
          )
        ) : null}
      </StyledArrowIcon>
      {isLoading ? (
        <StyledLoader displaySize={size} type={LoaderTypes.track} size="20px" />
      ) : null}
    </ComboButtonTheme>
  );
};

export { ComboButton };
