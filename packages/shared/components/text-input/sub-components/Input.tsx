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

import React, { memo } from "react";
import MaskedInput from "react-text-mask";

import { TextInputProps } from "../TextInput.types";
import { InputType } from "../TextInput.enums";

type InputComponentProps = TextInputProps & {
  className?: string;
};

const InputComponent = ({
  // Required props
  type = InputType.text,
  value = "",

  // Optional props with defaults
  isAutoFocussed = false,
  isDisabled = false,
  isReadOnly = false,
  maxLength = 255,
  tabIndex = -1,
  autoComplete = "off",
  placeholder = " ",
  dir = "auto",
  guide = false,
  className = "",

  // Optional props without defaults
  mask,
  forwardedRef,
  keepCharPositions,

  // Rest of props
  ...props
}: InputComponentProps) => {
  const baseClassName = `${className} input-component not-selectable`;

  const commonProps = {
    type,
    placeholder,
    className: baseClassName,
    disabled: isDisabled,
    readOnly: isReadOnly,
    autoFocus: isAutoFocussed,
    value,
    maxLength,
    tabIndex,
    autoComplete,
    dir,
    ...props,
  };

  // MaskedInput expects `size` to be a number, while our TextInput props may use an enum.
  // Omit `size` when rendering MaskedInput and the native input to avoid the type mismatch.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { size, ...commonPropsForInput } = commonProps;

  if (mask) {
    return (
      <MaskedInput
        {...commonPropsForInput}
        mask={mask}
        guide={guide}
        keepCharPositions={keepCharPositions}
      />
    );
  }

  return <input {...commonPropsForInput} ref={forwardedRef} />;
};

export const Input = memo(InputComponent);

export type { InputComponentProps };
