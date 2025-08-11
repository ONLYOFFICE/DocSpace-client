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
import classNames from "classnames";

import TriangleDownIcon from "PUBLIC_DIR/images/triangle.down.react.svg";

import { IconSizeType } from "../../../utils";
import { Loader, LoaderTypes } from "../../loader";
import { Text } from "../../text";
import { Badge } from "../../badge";

import { ComboBoxSize } from "../ComboBox.enums";
import type { TComboButtonProps } from "../ComboBox.types";

import styles from "./ComboButton.module.scss";

export const ComboButton: React.FC<TComboButtonProps> = ({
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

  const comboButtonClasses = classNames(
    styles.comboButton,
    "combo-button",
    `combo-button_${isOpen ? "open" : "closed"}`,
    styles[size],
    {
      [styles.isOpen]: isOpen,
      [styles.isDisabled]: isDisabled,
      [styles.noBorder]: noBorder,
      [styles.containOptions]: optionsLength,
      [styles.withAdvancedOptions]: withAdvancedOptions,
      [styles.scaled]: scaled,
      [styles.modernView]: modernView,
      [styles.displayArrow]: displayArrow,
      [styles.isLoading]: isLoading,
      [styles.type]: type,
      [styles.descriptive]: type === "descriptive",
      [styles.plusBadgeValue]: plusBadgeValue,
    },
  );

  const optionalItemClasses = classNames(
    styles.optionalItem,
    innerContainerClassName,
    {
      [styles.isDisabled]: isDisabled,
      [styles.defaultOption]: defaultOption,
      [styles.isLoading]: isLoading,
      [styles.fillIcon]: fillIcon,
    },
  );

  const iconClasses = classNames(
    styles.icon,
    styles.comboButtonSelectedIconContainer,
    "combo-button_selected-icon-container",
    {
      [styles.isDisabled]: isDisabled,
      [styles.defaultOption]: defaultOption,
      [styles.isLoading]: isLoading,
      [styles.onlyIcon]: type === "onlyIcon",
    },
  );

  const Icon = selectedOption?.icon;
  const isIconReactElement =
    Icon &&
    typeof Icon === "function" &&
    React.isValidElement(React.createElement(Icon));

  return (
    <div
      className={comboButtonClasses}
      onClick={onClick}
      tabIndex={tabIndex}
      aria-disabled={isDisabled}
      aria-expanded={isOpen}
      aria-pressed={isOpen}
      aria-haspopup="listbox"
      role="button"
      data-test-id="combo-button"
    >
      {innerContainer ? (
        <div className={optionalItemClasses}>{innerContainer}</div>
      ) : null}
      {selectedOption && selectedOption.icon ? (
        <div className={iconClasses} data-test-id="combo-button-icon">
          {isIconReactElement ? React.createElement(Icon) : null}

          {typeof selectedOption.icon === "string" ? (
            <ReactSVG
              src={selectedOption.icon}
              className={classNames({
                [styles.comboButtonSelectedIcon]: fillIcon,
                "combo-button_selected-icon": fillIcon,
              })}
            />
          ) : null}
        </div>
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
        <div
          className={styles.descriptiveContainer}
          data-test-id="combo-button-descriptive"
        >
          <Text
            title={selectedOption?.label}
            as="div"
            truncate
            fontWeight={600}
            className={classNames(
              styles.comboButtonLabel,
              "combo-button-label",
            )}
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
        </div>
      ) : type !== "onlyIcon" ? (
        <Text
          title={selectedOption?.label}
          as="div"
          truncate
          fontWeight={600}
          className={classNames(styles.comboButtonLabel, "combo-button-label")}
          dir="auto"
        >
          {selectedOption?.label}
        </Text>
      ) : null}
      {plusBadgeValue ? (
        <div
          className={classNames(styles.plusBadge, { [styles.isOpen]: isOpen })}
        >{`+${plusBadgeValue}`}</div>
      ) : null}
      <div
        className={classNames(styles.arrowIcon, "combo-buttons_arrow-icon", {
          [styles.displayArrow]: displayArrow,
          [styles.isOpen]: isOpen,
          [styles.isLoading]: isLoading,
          [styles.isDisabled]: isDisabled,
        })}
        data-test-id="combo-button-arrow"
        aria-hidden="true"
      >
        {displayArrow ? (
          comboIcon ? (
            <ReactSVG
              src={comboIcon}
              className={classNames(
                styles.comboButtonsExpanderIcon,
                "combo-buttons_expander-icon",
              )}
              data-test-id="combo-button-custom-icon"
            />
          ) : (
            <TriangleDownIcon
              data-size={IconSizeType.scale}
              className={classNames(
                styles.comboButtonsExpanderIcon,
                "combo-buttons_expander-icon",
              )}
              data-test-id="combo-button-default-icon"
            />
          )
        ) : null}
      </div>
      {isLoading ? (
        <Loader
          className={styles.loader}
          type={LoaderTypes.track}
          size="20px"
        />
      ) : null}
    </div>
  );
};
