import React from "react";
import styled from "styled-components";
import { StyledParam } from "./StyledParam";

import { FieldContainer } from "@docspace/shared/components/field-container";
import { Label } from "@docspace/shared/components/label";
import { TextInput } from "@docspace/shared/components/text-input";
const StyledInputParam = styled(StyledParam)`
  flex-direction: column;
  gap: 4px;
  max-height: 54px;

  .input-label {
    cursor: pointer;
    user-select: none;
  }
`;

const InputParam = React.forwardRef(
  (
    {
      id,
      title,
      placeholder,
      value,
      onChange,
      onFocus,
      onBlur,
      isDisabled,
      isValidTitle,
      isWrongTitle,
      errorMessage,
      isAutoFocussed,
      onKeyUp,
      onKeyDown,
    },
    ref
  ) => {
    return (
      <StyledInputParam>
        <Label
          title={title}
          className="input-label"
          display="display"
          htmlFor={id}
          text={title}
        />

        <FieldContainer
          isVertical={true}
          labelVisible={false}
          hasError={!isValidTitle || isWrongTitle}
          errorMessage={errorMessage}
          errorMessageWidth={"100%"}
        >
          <TextInput
            forwardedRef={ref}
            id={id}
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            scale
            placeholder={placeholder}
            tabIndex={2}
            isDisabled={isDisabled}
            hasError={!isValidTitle}
            isAutoFocussed={isAutoFocussed}
            onKeyUp={onKeyUp}
            onKeyDown={onKeyDown}
            maxLength={170}
          />
        </FieldContainer>
      </StyledInputParam>
    );
  }
);

InputParam.defaultProps = {
  isValidTitle: true,
};

export default InputParam;
