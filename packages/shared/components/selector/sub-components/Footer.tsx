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
import { AccessRight, FooterProps } from "../Selector.types";

const Footer = React.memo(
  ({
    isMultiSelect,
    acceptButtonLabel,
    selectedItemsCount,
    withCancelButton,
    cancelButtonLabel,
    withAccessRights,
    accessRights,
    selectedAccessRight,
    onAccept,
    disableAcceptButton,
    onCancel,
    onChangeAccessRights,

    withFooterInput,
    withFooterCheckbox,
    footerInputHeader,
    footerCheckboxLabel,
    currentFooterInputValue,
    setNewFooterInputValue,
    isFooterCheckboxChecked,
    setIsFooterCheckboxChecked,
    setIsChecked,
    acceptButtonId,
    cancelButtonId,
  }: FooterProps) => {
    const label =
      selectedItemsCount && isMultiSelect
        ? `${acceptButtonLabel} (${selectedItemsCount})`
        : acceptButtonLabel;

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
                isChecked={isFooterCheckboxChecked}
                onChange={onChangeCheckbox}
              />
            )}
          </StyledNewNameContainer>
        )}

        {withFooterCheckbox && !withFooterInput && (
          <Checkbox
            label={footerCheckboxLabel}
            isChecked={isFooterCheckboxChecked}
            onChange={onChangeCheckbox}
            className="selector_footer-checkbox"
          />
        )}

        <StyledButtonContainer>
          <Button
            id={acceptButtonId}
            className="button accept-button"
            label={label}
            primary
            scale
            size={ButtonSize.normal}
            isDisabled={disableAcceptButton}
            onClick={onAccept}
          />

          {withAccessRights && (
            <StyledComboBox
              onSelect={(opt?: TOption) =>
                onChangeAccessRights?.({ ...opt } as AccessRight)
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
