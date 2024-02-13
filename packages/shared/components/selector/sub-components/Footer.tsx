import React from "react";

import { Button, ButtonSize } from "../../button";
import { TextInput, InputSize, InputType } from "../../text-input";
import { Checkbox } from "../../checkbox";
import { ComboBoxSize, TOption } from "../../combobox";

import {
  StyledFooter,
  StyledComboBox,
  StyledButtonContainer,
  StyledNewNameContainer,
  StyledNewNameHeader,
} from "../Selector.styled";
import { TAccessRight, FooterProps } from "../Selector.types";

const Footer = React.memo(
  ({
    isMultiSelect,
    submitButtonLabel,
    selectedItemsCount,
    withCancelButton,
    cancelButtonLabel,
    withAccessRights,
    accessRights,
    selectedAccessRight,
    onSubmit,
    disableSubmitButton,
    onCancel,
    onAccessRightsChange,

    withFooterInput,
    withFooterCheckbox,
    footerInputHeader,
    footerCheckboxLabel,
    currentFooterInputValue,
    setNewFooterInputValue,
    isChecked,
    setIsFooterCheckboxChecked,
    setIsChecked,
    submitButtonId,
    cancelButtonId,
  }: FooterProps) => {
    const label =
      selectedItemsCount && isMultiSelect
        ? `${submitButtonLabel} (${selectedItemsCount})`
        : submitButtonLabel;

    const onChangeFileName = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setNewFooterInputValue?.(value);
    };

    const onChangeCheckbox = () => {
      setIsChecked?.((value: boolean) => !value);

      setIsFooterCheckboxChecked?.((value: boolean) => !value);
    };

    return (
      <StyledFooter
        withFooterInput={withFooterInput}
        withFooterCheckbox={withFooterCheckbox}
        className="selector_footer"
      >
        {withFooterInput && (
          <StyledNewNameContainer>
            <StyledNewNameHeader
              lineHeight="20px"
              fontWeight={600}
              fontSize="13px"
              noSelect
            >
              {footerInputHeader}
            </StyledNewNameHeader>
            <TextInput
              type={InputType.text}
              size={InputSize.base}
              className="new-file-input"
              value={currentFooterInputValue || ""}
              scale
              onChange={onChangeFileName}
            />
            {withFooterCheckbox && (
              <Checkbox
                label={footerCheckboxLabel}
                isChecked={isChecked}
                onChange={onChangeCheckbox}
              />
            )}
          </StyledNewNameContainer>
        )}

        {withFooterCheckbox && !withFooterInput && (
          <Checkbox
            label={footerCheckboxLabel}
            isChecked={isChecked}
            onChange={onChangeCheckbox}
            className="selector_footer-checkbox"
          />
        )}

        <StyledButtonContainer>
          <Button
            id={submitButtonId}
            className="button accept-button"
            label={label}
            primary
            scale
            size={ButtonSize.normal}
            isDisabled={
              !withFooterInput
                ? disableSubmitButton
                : disableSubmitButton && !currentFooterInputValue.trim()
            }
            onClick={onSubmit}
          />

          {withAccessRights && (
            <StyledComboBox
              onSelect={(opt?: TOption) =>
                onAccessRightsChange?.({ ...opt } as TAccessRight)
              }
              options={accessRights as TOption[]}
              size={ComboBoxSize.content}
              scaled={false}
              manualWidth="fit-content"
              selectedOption={selectedAccessRight as TOption}
              showDisabledItems
              directionX="right"
              directionY="top"
              forceCloseClickOutside
            />
          )}

          {withCancelButton && (
            <Button
              id={cancelButtonId}
              className="button cancel-button"
              label={cancelButtonLabel || ""}
              scale
              size={ButtonSize.normal}
              onClick={onCancel}
            />
          )}
        </StyledButtonContainer>
      </StyledFooter>
    );
  },
);

Footer.displayName = "Footer";

export { Footer };
