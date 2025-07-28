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
import equal from "fast-deep-equal/react";
import { isMobileOnly, isMobile, isTablet } from "react-device-detect";
import classNames from "classnames";

import { DropDown } from "../drop-down";
import { DropDownItem } from "../drop-down-item";

import { ComboButton } from "./sub-components/ComboButton";
import { ComboBoxSize, ComboBoxDisplayType } from "./ComboBox.enums";
import type { TComboboxProps, TOption } from "./ComboBox.types";
import styles from "./ComboBox.module.scss";

const compare = (prevProps: TComboboxProps, nextProps: TComboboxProps) => {
  return equal(prevProps, nextProps);
};

const ComboBoxPure: React.FC<TComboboxProps> = ({
  selectedOption: selectedOptionProps,
  setIsOpenItemAccess,
  ...props
}) => {
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
    const { withBackdrop, onBackdropClick, onToggle } = props;

    const target = e.target as HTMLElement;

    if (ref.current && ref.current.contains(target)) return;

    if (onToggle && !(withBackdrop && onBackdropClick)) return;

    setIsOpenItemAccess?.(!isOpen);
    setIsOpen(false);

    if (withBackdrop) onBackdropClick?.(e);
  };

  const comboBoxClick: React.MouseEventHandler<HTMLDivElement | Element> = (
    e,
  ) => {
    const {
      disableIconClick = true,
      disableItemClick,
      isDisabled,
      onToggle,
      isLoading,
      disableItemClickFirstLevel = false,
    } = props;

    const target = e.target as HTMLElement;

    if (
      isDisabled ||
      disableItemClick ||
      isLoading ||
      (disableItemClickFirstLevel &&
        target.closest(".item-by-first-level") &&
        (isMobileOnly || isMobile || isTablet)) ||
      (disableIconClick && e && target.closest(".optionalBlock")) ||
      target.classList.contains("ScrollbarsCustom") ||
      target.classList.contains("ScrollbarsCustom-Thumb") ||
      target.classList.contains("ScrollbarsCustom-Track") ||
      target.classList.contains("backdrop-active")
    )
      return;

    onToggle?.(e as React.MouseEvent<HTMLDivElement>, !isOpen);
    setIsOpenItemAccess?.(!isOpen);

    setIsOpen((v) => {
      return !v;
    });
  };

  const { onSelect } = props;

  const optionClick = React.useCallback(
    (
      option: TOption,
      event:
        | React.ChangeEvent<HTMLInputElement>
        | React.MouseEvent
        | KeyboardEvent,
    ) => {
      if (option.isSeparator) return;

      setIsOpen((v) => {
        setIsOpenItemAccess?.(!v);
        return !v;
      });

      onSelect?.(option);

      event?.stopPropagation();
    },
    [onSelect, setIsOpenItemAccess],
  );

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      const options = document.querySelectorAll(
        '[data-testid="drop-down-item"]',
      );
      const currentFocusedIndex = Array.from(options).findIndex(
        (opt) => opt.getAttribute("data-focused") === "true",
      );

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const nextIndex =
            currentFocusedIndex === -1
              ? 0
              : (currentFocusedIndex + 1) % options.length;
          options.forEach((opt, i) => {
            opt.setAttribute(
              "data-focused",
              i === nextIndex ? "true" : "false",
            );
          });
          break;
        }
        case "Enter": {
          e.preventDefault();
          const focusedOption = Array.from(options).find(
            (opt) => opt.getAttribute("data-focused") === "true",
          );
          if (focusedOption) {
            const optionIndex = Array.from(options).indexOf(focusedOption);
            const option = props.options?.[optionIndex];
            if (option && !option.disabled) {
              optionClick(option, e);
            }
          }
          break;
        }
        default:
          break;
      }
    },
    [isOpen, props.options, optionClick],
  );

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, isOpen, props.options]);

  const {
    dropDownMaxHeight,
    directionX,
    directionY,
    size = ComboBoxSize.base,
    type,
    options,
    advancedOptions,
    isDisabled,
    children,
    noBorder,
    scaled = true,
    scaledOptions,
    displayType = ComboBoxDisplayType.default,
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
    dropDownId,
    title,
    className,
    plusBadgeValue,
    optionStyle,
    style,
    withLabel = true,
    displayArrow,
    topSpace,
    usePortalBackdrop,
    tabIndex,
    onClickSelectedItem,
    shouldShowBackdrop,
    dropDownClassName,
    testId,
    dropDownTestId,
  } = props;

  React.useEffect(() => {
    setIsOpen(opened || false);
    setIsOpenItemAccess?.(opened || false);
  }, [opened, setIsOpenItemAccess, setIsOpen]);

  React.useEffect(() => {
    setSelectedOption(selectedOptionProps);
  }, [selectedOptionProps]);

  React.useEffect(() => {
    setIsOpen(false);
  }, [withLabel]);

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

  // Todo: Add support advancedOptions === Array
  const withAdvancedOptions =
    React.isValidElement(advancedOptions) && !!advancedOptions?.props.children;

  let optionsCount = optionsLength;

  if (withAdvancedOptions) {
    const advancedOptionsWithoutSeparator: TOption[] =
      React.isValidElement(advancedOptions) && advancedOptions.props
        ? (advancedOptions.props as { children: TOption[] }).children.filter(
            (option: TOption) => option?.key !== "s1",
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

  const renderOptions = () => {
    const dropDownBody = options?.map((option) => {
      const { key, disabled, label, icon, isBeta } = option;

      const optionDisabled =
        disabled ||
        (!displaySelectedOption && option?.label === selectedOption?.label);

      const isActiveOption = withLabel
        ? label === selectedOption?.label
        : key === selectedOption?.key;

      const isActive = displaySelectedOption && isActiveOption;

      const isSelected = isActiveOption;

      return (
        <DropDownItem
          key={key}
          label={label}
          icon={icon}
          isBeta={isBeta}
          testId={option.testId}
          data-focused={isOpen ? isActiveOption : undefined}
          data-is-separator={option.isSeparator || undefined}
          data-type={option.type || undefined}
          aria-disabled={option.disabled || undefined}
          className={`drop-down-item ${option?.className || ""}`}
          textOverflow={textOverflow}
          disabled={optionDisabled}
          onClick={(e) => optionClick(option, e)}
          onClickSelectedItem={() => onClickSelectedItem?.(option)}
          fillIcon={fillIcon}
          isModern={noBorder}
          isActive={isActive}
          isSelected={isSelected}
          style={optionStyle}
          isSeparator={option.isSeparator}
        />
      );
    });

    return dropDownBody;
  };

  const renderDropDown = () => {
    const dropDownProps = {
      open: isOpen,
      directionX,
      directionY,
      manualWidth,
      manualX,
      manualY: manualY?.toString(),
      fixedDirection,
      forwardedRef: ref,
      withBlur,
      offsetLeft,
      withBackdrop,
      isAside,
      withBackground,
      advancedOptionsCount,
      isMobileView,
      withoutPadding,
      isNoFixedHeightOptions,
      forceCloseClickOutside,
      withoutBackground,
      dropDownId,
      eventTypes: ["mousedown"],
      topSpace,
      usePortalBackdrop,
      style,
      showDisabledItems,
      isDefaultMode,
      clickOutsideAction: handleClickOutside,
      shouldShowBackdrop,
      className: dropDownClassName,
      testId: dropDownTestId,
    };

    const dropDownOptions = advancedOptions || renderOptions();

    return (
      <DropDown
        {...dropDownProps}
        {...dropDownMaxHeightProp}
        {...dropDownManualWidthProp}
      >
        {dropDownOptions}
      </DropDown>
    );
  };

  const comboboxClasses = classNames(styles.combobox, className, styles[size], {
    [styles.scaled]: scaled,
    [styles.isOpen]: isOpen,
    [styles.disableMobileView]: disableMobileView,
    [styles.withoutPadding]: withoutPadding,
  });

  return (
    <div
      className={comboboxClasses}
      ref={ref}
      onClick={comboBoxClick}
      data-testid={testId ?? "combobox"}
      title={title}
      data-scaled={scaledOptions || undefined}
      style={style}
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
        size={size as ComboBoxSize}
        scaled={scaled}
        comboIcon={comboIcon}
        modernView={modernView}
        fillIcon={fillIcon}
        tabIndex={tabIndex}
        isLoading={isLoading}
        type={type}
        plusBadgeValue={plusBadgeValue}
        displayArrow={displayArrow}
      />

      {displayType !== "toggle" ? renderDropDown() : null}
    </div>
  );
};

export { ComboBoxPure };

export const ComboBox = React.memo(ComboBoxPure, compare);
