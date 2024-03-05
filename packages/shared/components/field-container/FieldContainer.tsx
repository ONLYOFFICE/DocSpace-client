import React from "react";

import { Label } from "../label";
import { HelpButton } from "../help-button";
import { Text } from "../text";

import Container from "./FieldContainer.styled";
import { FieldContainerProps } from "./FieldContainer.types";

const displayInlineBlock = { display: "inline-block" };

const FieldContainer = ({
  isVertical,
  maxLabelWidth = "110px",
  className,
  id,
  style,
  errorMessageWidth = "293px",
  removeMargin = false,
  labelVisible = false,
  inlineHelpButton,
  isRequired,
  labelText,
  tooltipMaxWidth,
  tooltipContent,
  tooltipClass,
  //   helpButtonHeaderContent,
  place = "bottom",
  hasError,
  children,
  errorMessage,
  errorColor,
}: FieldContainerProps) => {
  return (
    <Container
      vertical={isVertical}
      labelWidth={maxLabelWidth}
      className={className}
      id={id}
      style={style}
      maxwidth={errorMessageWidth}
      removeMargin={removeMargin}
      data-testid="field-container"
    >
      {labelVisible &&
        (!inlineHelpButton ? (
          <div className="field-label-icon">
            <Label
              isRequired={isRequired}
              // error={hasError}
              text={labelText}
              truncate
              className="field-label"
              tooltipMaxWidth={tooltipMaxWidth}
              htmlFor=""
            />
            {tooltipContent && (
              <HelpButton
                className={tooltipClass}
                tooltipContent={tooltipContent}
                place={place}
                // helpButtonHeaderContent={helpButtonHeaderContent}
              />
            )}
          </div>
        ) : (
          <div className="field-label-icon">
            <Label
              isRequired={isRequired}
              htmlFor=""
              // error={hasError}
              text={labelText}
              truncate
              className="field-label"
            >
              {tooltipContent && (
                <HelpButton
                  className={tooltipClass}
                  tooltipContent={tooltipContent}
                  place={place}
                  //   helpButtonHeaderContent={helpButtonHeaderContent}
                  style={displayInlineBlock}
                  offsetRight={0}
                />
              )}
            </Label>
          </div>
        ))}

      <div className="field-body">
        {children}
        {hasError ? (
          <Text className="error-label" fontSize="12px" color={errorColor}>
            {errorMessage}
          </Text>
        ) : null}
      </div>
    </Container>
  );
};

export { FieldContainer };
