// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useRef, useEffect } from "react";

import InputWrapper from "./CodeInput.styled";
import { CodeInputProps } from "./CodeInput.types";

const CodeInput = (props: CodeInputProps) => {
  const { onSubmit, onChange, isDisabled = false, ...rest } = props;

  const inputsRef = useRef<HTMLInputElement[]>([]);
  const characters = 6;
  const allowed = "^[A-Za-z0-9]*$";

  useEffect(() => {
    if (inputsRef.current) inputsRef.current[0].focus();
  }, []);

  const onEnter = () => {
    if (inputsRef.current) {
      const code = inputsRef.current.map((input) => input.value).join("");
      if (code.length === characters) {
        onSubmit?.(code);
      }
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.match(allowed)) {
      onChange?.();
      if (e.target.nextElementSibling !== null) {
        if (e.target.nextElementSibling.nodeName === "HR") {
          (
            e.target.nextElementSibling.nextElementSibling as HTMLInputElement
          ).focus();
        }
        (e.target.nextElementSibling as HTMLInputElement).focus();
      }
    } else {
      e.target.value = "";
    }
    onEnter();
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const { key } = e;
    const target = e.target as HTMLInputElement;

    if (key === "Backspace") {
      onChange?.();
      if (target.value === "" && target.previousElementSibling !== null) {
        if (target.previousElementSibling !== null) {
          if (target.previousElementSibling.nodeName === "HR") {
            const prev = target.previousElementSibling
              .previousElementSibling as HTMLInputElement;

            prev?.focus();
          }
          (target.previousElementSibling as HTMLInputElement).focus();
          e.preventDefault();
        }
      } else {
        target.value = "";
      }
    }
  };

  const handleOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleOnPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const value = e.clipboardData.getData("Text");
    if (value.match(allowed)) {
      for (let i = 0; i < characters && i < value.length; i += 1) {
        if (inputsRef.current) {
          inputsRef.current[i].value = value.charAt(i);

          if (inputsRef.current[i].nextElementSibling !== null) {
            (
              inputsRef.current[i].nextElementSibling as HTMLInputElement
            ).focus();
          }
        }
      }
    }
    onEnter();
    e.preventDefault();
  };

  const elements = [];
  for (let i = 0; i < characters; i += 1) {
    if (i === 3) elements.push(<hr key="InputCode-line" />);
    elements.push(
      <input
        key={`InputCode-${i}`}
        onChange={handleOnChange}
        onKeyDown={handleOnKeyDown}
        onFocus={handleOnFocus}
        onPaste={handleOnPaste}
        ref={(el) => {
          if (el) inputsRef.current[i] = el;
        }}
        maxLength={1}
        disabled={isDisabled}
      />,
    );
  }

  return (
    <InputWrapper {...rest} data-testid="code-input">
      {elements}
    </InputWrapper>
  );
};

export { CodeInput };
