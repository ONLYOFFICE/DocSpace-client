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
import equal from "fast-deep-equal/react";

import { DropDown } from "../drop-down";
import { DropDownItem } from "../drop-down-item";

import { ComboButton } from "./sub-components/ComboButton";
import { StyledComboBox } from "./Combobox.styled";
import { ComboBoxSize } from "./Combobox.enums";
import type { ComboboxProps, TOption } from "./Combobox.types";

const compare = (prevProps: ComboboxProps, nextProps: ComboboxProps) => {
  const needUpdate = equal(prevProps, nextProps);

  return needUpdate;
};

const ComboBoxPure = (props: ComboboxProps) => {
  const { selectedOption: selectedOptionProps } = props;
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedOption, setSelectedOption] =
    React.useState(selectedOptionProps);

  const ref = React.useRef<null | HTMLDivElement>(null);

  // const stopAction = (e: any) => e.preventDefault();

  // const setIsOpenAction = (value: boolean) => {
  //   const { setIsOpenItemAccess } = props;
  //   setIsOpen(value);
  //   setIsOpenItemAccess?.(value);
  // };

  const handleClickOutside = (e: Event) => {
    const { setIsOpenItemAccess, onToggle } = props;

    const target = e.target as HTMLElement;

    if (ref.current && ref.current.contains(target)) return;

    if (onToggle) return;

    // onToggle?.(e, !isOpen);
    setIsOpenItemAccess?.(!isOpen);
    setIsOpen((v) => {
      return !v;
    });
  };

  const comboBoxClick = (e: React.MouseEvent) => {
    const {
      disableIconClick = true,
      disableItemClick,
      isDisabled,
      onToggle,
      isLoading,
      setIsOpenItemAccess,
    } = props;

    const target = e.target as HTMLElement;

    if (
      isDisabled ||
      disableItemClick ||
      isLoading ||
      (disableIconClick && e && target.closest(".optionalBlock")) ||
      target.classList.contains("ScrollbarsCustom") ||
      target.classList.contains("ScrollbarsCustom-Thumb") ||
      target.classList.contains("ScrollbarsCustom-Track") ||
      target.classList.contains("backdrop-active")
    )
      return;

    onToggle?.(e, !isOpen);
    setIsOpenItemAccess?.(!isOpen);

    setIsOpen((v) => {
      return !v;
    });
  };

  const optionClick = (option: TOption) => {
    const { onSelect } = props;

    setSelectedOption({ ...option });
    // setIsOpen((v) => {
    //   setIsOpenItemAccess?.(!v);
    //   return !v;
    // });

    onSelect?.(option);
  };

  const {
    dropDownMaxHeight,
    directionX,
    directionY,
    scaled = true,
    size = ComboBoxSize.base,
    type,
    options,
    advancedOptions,
    isDisabled,
    children,
    noBorder,
    scaledOptions,
    displayType = "default",

    textOverflow,
    showDisabledItems,
    comboIcon,
    manualY,
    manualX,
    isDefaultMode = true,
    manualWidth = "200px",
    displaySelectedOption,
    fixedDirection,
    withBlur,
    fillIcon,
    offsetLeft,
    modernView,
    withBackdrop = true,
    isAside,
    withBackground,
    advancedOptionsCount,
    isMobileView,
    withoutPadding,
    isLoading,
    isNoFixedHeightOptions,
    hideMobileView,
    forceCloseClickOutside,
    withoutBackground,
    opened,
    setIsOpenItemAccess,
    dropDownId,
    title,
    className,
    plusBadgeValue,
  } = props;

  const { tabIndex, onClickSelectedItem } = props;

  React.useEffect(() => {
    setIsOpen(opened || false);
    setIsOpenItemAccess?.(opened || false);
  }, [opened, setIsOpenItemAccess, setIsOpen]);

  React.useEffect(() => {
    setSelectedOption(selectedOptionProps);
  }, [selectedOptionProps]);

  const dropDownMaxHeightProp = dropDownMaxHeight
    ? { maxHeight: dropDownMaxHeight }
    : {};

  const dropDownManualWidthProp =
    scaledOptions && !isDefaultMode
      ? { manualWidth: "100%" }
      : scaledOptions && ref.current
        ? { manualWidth: `${ref.current.clientWidth}px` }
        : { manualWidth };

  const optionsLength = options.length
    ? options.length
    : displayType !== "toggle"
      ? 0
      : 1;

  const withAdvancedOptions =
    React.isValidElement(advancedOptions) && !!advancedOptions?.props.children;

  let optionsCount = optionsLength;

  if (withAdvancedOptions) {
    const advancedOptionsWithoutSeparator: TOption[] =
      React.isValidElement(advancedOptions) && advancedOptions.props
        ? (advancedOptions.props as { children: TOption[] }).children.filter(
            (option: TOption) => option.key !== "s1",
          )
        : [];

    const advancedOptionsWithoutSeparatorLength =
      advancedOptionsWithoutSeparator.length;

    optionsCount =
      advancedOptionsCount || advancedOptionsWithoutSeparatorLength
        ? advancedOptionsWithoutSeparatorLength
        : 6;
  }

  const disableMobileView = optionsCount < 4 || hideMobileView;

  const dropDownBody =
    (advancedOptions as React.ReactNode) ||
    (options.map((option: TOption) => {
      const disabled =
        option.disabled ||
        (!displaySelectedOption && option.label === selectedOption.label);

      const isActive =
        displaySelectedOption && option.label === selectedOption.label;

      const isSelected = option.label === selectedOption.label;
      return (
        <DropDownItem
          {...option}
          className="drop-down-item"
          textOverflow={textOverflow}
          key={option.key}
          disabled={disabled}
          onClick={() => optionClick(option)}
          onClickSelectedItem={() => onClickSelectedItem?.(option)}
          fillIcon={fillIcon}
          isModern={noBorder}
          isActive={isActive}
          isSelected={isSelected}
        />
      );
    }) as React.ReactNode);

  return (
    <StyledComboBox
      ref={ref}
      scaled={scaled}
      size={size}
      onClick={comboBoxClick}
      isOpen={isOpen}
      disableMobileView={disableMobileView}
      withoutPadding={withoutPadding}
      data-testid="combobox"
      title={title}
      className={className}
      // {...rest}
    >
      <ComboButton
        noBorder={noBorder}
        isDisabled={isDisabled}
        selectedOption={selectedOption}
        withOptions={optionsLength > 0}
        optionsLength={optionsLength}
        withAdvancedOptions={withAdvancedOptions}
        innerContainer={children}
        innerContainerClassName="optionalBlock"
        isOpen={isOpen}
        size={size}
        scaled={scaled}
        comboIcon={comboIcon}
        modernView={modernView}
        fillIcon={fillIcon}
        tabIndex={tabIndex}
        isLoading={isLoading}
        type={type}
        plusBadgeValue={plusBadgeValue}
      />

      {displayType !== "toggle" && (
        <DropDown
          id={dropDownId}
          className="dropdown-container not-selectable"
          directionX={directionX}
          directionY={directionY}
          manualY={manualY}
          manualX={manualX}
          open={isOpen}
          forwardedRef={ref}
          clickOutsideAction={handleClickOutside}
          style={advancedOptions ? { padding: "6px 0px" } : {}}
          {...dropDownMaxHeightProp}
          {...dropDownManualWidthProp}
          showDisabledItems={showDisabledItems}
          isDefaultMode={isDefaultMode}
          fixedDirection={fixedDirection}
          withBlur={withBlur}
          offsetLeft={offsetLeft}
          withBackdrop={withBackdrop}
          isAside={isAside}
          withBackground={withBackground}
          isMobileView={isMobileView && !disableMobileView}
          isNoFixedHeightOptions={isNoFixedHeightOptions}
          forceCloseClickOutside={forceCloseClickOutside}
          withoutBackground={withoutBackground}
          eventTypes={["mousedown"]}
        >
          {dropDownBody}
        </DropDown>
      )}
    </StyledComboBox>
  );
};

export { ComboBoxPure };

export const ComboBox = React.memo(ComboBoxPure, compare);
