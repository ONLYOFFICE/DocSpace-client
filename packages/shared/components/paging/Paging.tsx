import React from "react";

import { ButtonSize, Button } from "../button";
import { ComboBox, TOption } from "../combobox";

import { StyledPage, StyledOnPage, StyledPaging } from "./Paging.styled";
import { PagingProps } from "./Paging.types";

const Paging = (props: PagingProps) => {
  // console.log("Paging render");
  const {
    previousLabel,
    nextLabel,
    previousAction,
    nextAction,
    pageItems,
    countItems,
    openDirection,
    disablePrevious = false,
    disableNext = false,
    disableHover = false,
    selectedPageItem,
    selectedCountItem,
    id,
    className,
    style,
    showCountItem = true,
    onSelectPage,
    onSelectCount,
  } = props;

  const onSelectPageAction = (option: TOption) => {
    onSelectPage?.(option);
  };

  const onSelectCountAction = (option: TOption) => {
    onSelectCount?.(option);
  };

  const setDropDownMaxHeight =
    pageItems && pageItems.length > 6 ? { dropDownMaxHeight: 200 } : {};

  return (
    <StyledPaging id={id} className={className} style={style}>
      <Button
        className="not-selectable"
        size={ButtonSize.small}
        scale
        label={previousLabel}
        onClick={previousAction}
        isDisabled={disablePrevious}
        disableHover={disableHover}
      />
      {pageItems && (
        <StyledPage>
          <ComboBox
            isDisabled={disablePrevious && disableNext}
            className="manualWidth"
            directionY={openDirection}
            options={pageItems}
            onSelect={onSelectPageAction}
            scaledOptions={pageItems.length < 6}
            selectedOption={selectedPageItem}
            {...setDropDownMaxHeight}
          />
        </StyledPage>
      )}
      <Button
        className="not-selectable"
        size={ButtonSize.small}
        scale
        label={nextLabel}
        onClick={nextAction}
        isDisabled={disableNext}
        disableHover={disableHover}
      />
      {showCountItem
        ? countItems && (
            <StyledOnPage>
              <ComboBox
                className="hideDisabled"
                directionY={openDirection}
                directionX="right"
                options={countItems}
                scaledOptions
                onSelect={onSelectCountAction}
                selectedOption={selectedCountItem}
              />
            </StyledOnPage>
          )
        : null}
    </StyledPaging>
  );
};

export { Paging };
