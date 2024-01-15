import React from "react";
import { inject, observer } from "mobx-react";

import { ComboBox } from "@docspace/shared/components/combobox";
import { FieldContainer } from "@docspace/shared/components/field-container";

import StyledInputWrapper from "../styled-containers/StyledInputWrapper";

const SsoComboBox = (props) => {
  const {
    labelText,
    name,
    options,
    tabIndex,
    value,
    setComboBox,
    enableSso,
    isLoadingXml,
    isDisabled,
  } = props;

  const currentOption =
    options.find((option) => option.key === value) || options[0];

  const onSelect = () => {
    setComboBox(currentOption, name);
  };

  return (
    <FieldContainer isVertical labelText={labelText}>
      <StyledInputWrapper>
        <ComboBox
          id={name}
          isDisabled={!enableSso || isLoadingXml || isDisabled}
          onSelect={onSelect}
          options={options}
          scaled
          scaledOptions
          selectedOption={currentOption}
          showDisabledItems
          tabIndex={tabIndex}
          size="content"
          dropDownMaxHeight={364}
          manualWidth="100%"
          directionY="both"
          textOverflow={true}
        />
      </StyledInputWrapper>
    </FieldContainer>
  );
};

export default inject(({ ssoStore }) => {
  const { setComboBox, enableSso, isLoadingXml } = ssoStore;

  return {
    setComboBox,
    enableSso,
    isLoadingXml,
  };
})(observer(SsoComboBox));
