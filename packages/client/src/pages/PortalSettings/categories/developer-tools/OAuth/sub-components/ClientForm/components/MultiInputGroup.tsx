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
import { Text } from "@docspace/shared/components/text";
import { SelectorAddButton } from "@docspace/shared/components/selector-add-button";
import { SelectedItem } from "@docspace/shared/components/selected-item";
import { InputSize, InputType } from "@docspace/shared/components/text-input";
import { TTranslation } from "@docspace/shared/types";
import { IClientReqDTO } from "@docspace/shared/utils/oauth/types";

import ArrowIcon from "PUBLIC_DIR/images/arrow.right.react.svg";

import {
  StyledChipsContainer,
  StyledInputAddBlock,
  StyledInputGroup,
  StyledInputRow,
} from "../ClientForm.styled";
import { isValidUrl } from "../ClientForm.utils";

import InputGroup from "./InputGroup";

interface MultiInputGroupProps {
  t: TTranslation;
  label: string;

  name: string;
  placeholder: string;
  currentValue: string[];
  hasError?: boolean;
  onAdd: (name: keyof IClientReqDTO, value: string, remove?: boolean) => void;

  helpButtonText?: string;

  isDisabled?: boolean;

  dataTestId?: string;
}

const MultiInputGroup = ({
  t,
  label,
  name,
  placeholder,
  currentValue,
  onAdd,
  hasError,
  helpButtonText,
  isDisabled,
  dataTestId,
}: MultiInputGroupProps) => {
  const [value, setValue] = React.useState("");

  const [isFocus, setIsFocus] = React.useState(false);
  const [isAddVisible, setIsAddVisible] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const addRef = React.useRef<null | HTMLDivElement>(null);
  // const withoutSearch = name === "redirect_uris";
  const withoutSearch = true;
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;

    setValue(v);

    if (isValidUrl(v, withoutSearch)) {
      setIsAddVisible(true);
    } else {
      setIsAddVisible(false);
    }
  };

  const onFocus = () => {
    setIsFocus(true);
    if (isValidUrl(value, withoutSearch)) setIsAddVisible(true);
  };

  const onBlur = () => {
    setIsFocus(false);

    if (value) {
      if (isValidUrl(value, withoutSearch)) {
        setIsError(false);
      } else {
        setIsError(true);
      }
    } else {
      setIsError(false);
    }
  };

  const onAddAction = React.useCallback(() => {
    if (isDisabled || isError) return;

    onAdd(name as keyof IClientReqDTO, value);
    setIsAddVisible(false);
    setIsError(false);
    setValue("");
  }, [isDisabled, isError, name, onAdd, value]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && isAddVisible) {
        onAddAction();
      }
    };

    if (isFocus) {
      window.addEventListener("keydown", onKeyDown);
    } else {
      window.removeEventListener("keydown", onKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isAddVisible, isFocus, onAddAction]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element;

      if (target.closest(`.multi-input-group-${label}`) || isFocus) return;

      setIsAddVisible(false);
    };

    if (isAddVisible) {
      window.addEventListener("click", onClick);
    }

    return () => {
      window.removeEventListener("click", onClick);
    };
  }, [isAddVisible, isFocus, label]);

  React.useEffect(() => {
    if (!addRef.current) return;
    if (isAddVisible) {
      addRef.current.style.display = "flex";
    } else {
      addRef.current.style.display = "none";
    }
  }, [isAddVisible]);

  return (
    <StyledInputGroup className={`multi-input-group-${label}`}>
      <InputGroup
        label={label}
        helpButtonText={helpButtonText}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        error={
          isError
            ? `${t("ErrorWrongURL")}: ${window.location.origin}`
            : t("ThisRequiredField")
        }
        isRequired
        isError={isError || hasError}
      >
        <StyledInputRow>
          <InputBlock
            name={name}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            scale
            tabIndex={0}
            maxLength={255}
            isDisabled={isDisabled}
            onFocus={onFocus}
            onBlur={onBlur}
            hasError={isError || hasError}
            size={InputSize.base}
            type={InputType.text}
            noIcon
            dataTestId={`${dataTestId}_input`}
          />
          <StyledInputAddBlock
            ref={addRef}
            onClick={onAddAction}
            data-testid={`${dataTestId}_add_button`}
          >
            <Text fontSize="13px" fontWeight={600} lineHeight="20px" truncate>
              {value}
            </Text>
            <div className="add-block">
              <Text fontSize="13px" fontWeight={400} lineHeight="20px" truncate>
                {t("Common:AddButton")}
              </Text>
              <ArrowIcon />
            </div>
          </StyledInputAddBlock>
          <SelectorAddButton
            onClick={onAddAction}
            isDisabled={isDisabled || isError}
          />
        </StyledInputRow>
      </InputGroup>

      <StyledChipsContainer>
        {currentValue.map((v) => (
          <SelectedItem
            key={`${v}`}
            propKey={v}
            isInline
            label={v}
            isDisabled={isDisabled}
            hideCross={isDisabled}
            onClose={() => {
              if (!isDisabled) onAdd(name as keyof IClientReqDTO, v, true);
            }}
            dataTestId={`${dataTestId}_${v}`}
          />
        ))}
      </StyledChipsContainer>
    </StyledInputGroup>
  );
};

export default MultiInputGroup;
