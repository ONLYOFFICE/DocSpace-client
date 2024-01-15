import React from "react";
import { inject, observer } from "mobx-react";

import { TextInput } from "@docspace/shared/components/text-input";

import StyledInputWrapper from "../styled-containers/StyledInputWrapper";

const SsoTextInput = (props) => {
  const {
    hasError,
    isDisabled,
    maxWidth,
    name,
    placeholder,
    tabIndex,
    value,
    enableSso,
    setInput,
    isLoadingXml,
    setError,
    hideError,
    className,
    onFocus,
  } = props;

  const onFocusFn = (e) => {
    hideError(e.target.name);
    onFocus && onFocus();
  };

  const onBlur = (e) => {
    const field = e.target.name;
    const value = e.target.value;

    setError(field, value);
  };

  return (
    <StyledInputWrapper maxWidth={maxWidth} className={className}>
      <TextInput
        id={name}
        className="field-input"
        hasError={hasError}
        isDisabled={isDisabled ?? (!enableSso || isLoadingXml)}
        name={name}
        onBlur={onBlur}
        onFocus={onFocusFn}
        onChange={setInput}
        placeholder={placeholder}
        scale
        tabIndex={tabIndex}
        value={value}
      />
    </StyledInputWrapper>
  );
};

export default inject(({ ssoStore }) => {
  const { enableSso, setInput, isLoadingXml, setError, hideError } = ssoStore;

  return {
    enableSso,
    setInput,
    isLoadingXml,
    setError,
    hideError,
  };
})(observer(SsoTextInput));
