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
} from "../Combobox.styled";

import { Text } from "../../text";
import { Badge } from "../../badge";

import ComboButtonTheme from "../Combobox.theme";

import { ComboBoxSize } from "../Combobox.enums";
import type { ComboButtonProps } from "../Combobox.types";

const ComboButton = (props: ComboButtonProps) => {
  const {
    noBorder,
    onClick,
    isDisabled,
    innerContainer,
    innerContainerClassName = "innerContainer",
    selectedOption,
    optionsLength,
    withOptions = true,
    withAdvancedOptions = false,
    isOpen,
    scaled = false,
    size,
    comboIcon,
    fillIcon,
    modernView = false,
    tabIndex,
    isLoading,
    type,
  } = props;

  const defaultOption = selectedOption?.default;
  const isSelected = selectedOption?.key !== 0;
  const displayArrow = withOptions || withAdvancedOptions;

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
      isSelected={isSelected}
      modernView={modernView}
      className="combo-button"
      tabIndex={tabIndex}
      displayArrow={displayArrow}
      isLoading={isLoading}
      type={type}
      selectedOption={selectedOption}
    >
      {innerContainer && (
        <StyledOptionalItem
          className={innerContainerClassName}
          isDisabled={isDisabled}
          defaultOption={defaultOption}
          isLoading={isLoading}
          fillIcon={fillIcon}
        >
          {innerContainer}
        </StyledOptionalItem>
      )}
      {selectedOption && selectedOption.icon && (
        <StyledIcon
          className="forceColor"
          isDisabled={isDisabled}
          defaultOption={defaultOption}
          isSelected={isSelected}
          isLoading={isLoading}
        >
          <ReactSVG
            src={selectedOption.icon}
            className={fillIcon ? "combo-button_selected-icon" : ""}
          />
        </StyledIcon>
      )}
      {type === "badge" ? (
        <Badge
          label={selectedOption.label}
          noHover
          color={selectedOption.color}
          backgroundColor={selectedOption.backgroundColor}
          border={`2px solid ${selectedOption.border}`}
          compact={!!selectedOption.border}
        />
      ) : (
        <Text
          title={selectedOption?.label}
          as="div"
          truncate
          fontWeight={600}
          className="combo-button-label"
        >
          {selectedOption?.label}
        </Text>
      )}
      <StyledArrowIcon
        displayArrow={displayArrow}
        isOpen={isOpen}
        className="combo-buttons_arrow-icon"
        isLoading={isLoading}
      >
        {displayArrow &&
          (comboIcon ? (
            <ReactSVG src={comboIcon} className="combo-buttons_expander-icon" />
          ) : (
            <StyledTriangleDownIcon
              size={IconSizeType.scale}
              className="combo-buttons_expander-icon"
            />
          ))}
      </StyledArrowIcon>

      {isLoading && (
        <StyledLoader displaySize={size} type={LoaderTypes.track} size="20px" />
      )}
    </ComboButtonTheme>
  );
};

ComboButton.defaultProps = {
  noBorder: false,
  isDisabled: false,
  withOptions: true,
  withAdvancedOptions: false,
  innerContainerClassName: "innerContainer",
  isOpen: false,
  size: ComboBoxSize.content,
  scaled: false,
  modernView: false,
  tabIndex: -1,
  isLoading: false,
};

export { ComboButton };
