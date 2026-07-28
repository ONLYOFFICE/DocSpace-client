/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";

import { FieldContainer } from "@docspace/ui-kit/components/field-container";
import { Label } from "@docspace/ui-kit/components/label";
import { InputType, TextInput } from "@docspace/ui-kit/components/text-input";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { Text } from "@docspace/ui-kit/components/text";

import { StyledParam } from "./StyledParam";
import styles from "./InputParam.module.scss";

type InputParamProps = {
  ref?: React.RefObject<HTMLInputElement | null>;
  id: string;
  title: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  isValidTitle?: boolean;
  isWrongTitle?: boolean;
  errorMessage?: string;
  isAutoFocussed?: boolean;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  name?: string;
  tooltipLabel?: string;
  dataTestId?: string;
};

const InputParam = ({
  ref,
  id,
  title,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  isDisabled,
  isValidTitle = true,
  isWrongTitle,
  errorMessage,
  isAutoFocussed,
  onKeyUp,
  onKeyDown,
  name,
  tooltipLabel,
  dataTestId,
}: InputParamProps) => {
  return (
    <StyledParam className={styles.inputParam}>
      <div className="input-label-wrapper">
        <Label
          title={title}
          className="input-label"
          display="display"
          htmlFor={id}
          text={title}
        />
        {tooltipLabel ? (
          <HelpButton
            place="right"
            tooltipContent={
              <Text fontSize="12px" fontWeight={400}>
                {tooltipLabel}
              </Text>
            }
          />
        ) : null}
      </div>

      <FieldContainer
        isVertical
        labelVisible={false}
        hasError={!isValidTitle || isWrongTitle}
        errorMessage={errorMessage}
        errorMessageWidth="100%"
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
          name={name ?? id}
          type={InputType.text}
          testId={dataTestId}
        />
      </FieldContainer>
    </StyledParam>
  );
};

InputParam.displayName = "InputParam";

export default InputParam;

