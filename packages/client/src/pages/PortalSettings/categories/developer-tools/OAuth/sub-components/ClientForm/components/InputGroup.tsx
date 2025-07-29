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

import { InputBlock } from "@docspace/shared/components/input-block";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { FieldContainer } from "@docspace/shared/components/field-container";
import { RectangleSkeleton } from "@docspace/shared/skeletons/rectangle";
import { InputSize, InputType } from "@docspace/shared/components/text-input";

import CopyReactSvgUrl from "PUBLIC_DIR/images/icons/16/copy.react.svg?url";

import { StyledInputGroup } from "../ClientForm.styled";

interface InputGroupProps {
  label: string;

  name: string;
  value: string;
  placeholder?: string;

  error: string;

  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  helpButtonText?: string;

  buttonLabel?: string;
  onButtonClick?: () => void;

  withCopy?: boolean;
  onCopyClick?: (e: React.MouseEvent) => void;
  isPassword?: boolean;

  disabled?: boolean;
  isRequired?: boolean;
  isError?: boolean;
  children?: React.ReactNode;

  onBlur?: (name: string) => void;
  dataTestId?: string;
}

const InputGroup = ({
  label,

  name,
  value,
  placeholder,

  error,

  onChange,
  onBlur,

  helpButtonText,

  buttonLabel,
  onButtonClick,

  withCopy,
  onCopyClick,
  isPassword,
  disabled,
  isRequired,
  isError,
  children,
  dataTestId,
}: InputGroupProps) => {
  const [isRequestRunning, setIsRequestRunning] = React.useState(false);

  const onButtonClickAction = async () => {
    setIsRequestRunning(true);

    onButtonClick?.();

    setTimeout(() => {
      setIsRequestRunning(false);
    });
  };

  return (
    <StyledInputGroup>
      <FieldContainer
        className={buttonLabel ? "input-block-with-button" : ""}
        isVertical
        isRequired={isRequired}
        labelVisible
        labelText={label}
        tooltipContent={helpButtonText}
        errorMessage={error}
        removeMargin
        hasError={isError}
        dataTestId={dataTestId}
      >
        {children || (
          <>
            {isRequestRunning ? (
              <RectangleSkeleton
                className="loader"
                width="100%"
                height="32px"
              />
            ) : (
              <InputBlock
                name={name}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                scale
                tabIndex={0}
                maxLength={255}
                isReadOnly={withCopy}
                isDisabled={disabled}
                size={InputSize.base}
                iconName={withCopy ? CopyReactSvgUrl : ""}
                onIconClick={withCopy ? onCopyClick : undefined}
                type={isPassword ? InputType.password : InputType.text}
                onBlur={() => onBlur?.(name)}
                hasError={isError}
                noIcon={!withCopy}
                testId={`${dataTestId}_input`}
              />
            )}
            {buttonLabel ? (
              <Button
                label={buttonLabel}
                size={ButtonSize.small}
                onClick={onButtonClickAction}
                isDisabled={isRequestRunning}
                testId={`${dataTestId}_button`}
              />
            ) : null}
          </>
        )}
      </FieldContainer>
    </StyledInputGroup>
  );
};

export default InputGroup;
