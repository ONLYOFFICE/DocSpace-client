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
}: MultiInputGroupProps) => {
  const [value, setValue] = React.useState("");

  const [isFocus, setIsFocus] = React.useState(false);
  const [isAddVisible, setIsAddVisible] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const addRef = React.useRef<null | HTMLDivElement>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;

    setValue(v);

    if (isValidUrl(v)) {
      setIsAddVisible(true);
    } else {
      setIsAddVisible(false);
    }
  };

  const onFocus = () => {
    setIsFocus(true);
  };

  const onBlur = () => {
    setIsFocus(false);
    if (value) {
      if (isValidUrl(value)) {
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
    if (!addRef.current) return;
    if (isAddVisible) {
      addRef.current.style.display = "flex";
    } else {
      addRef.current.style.display = "none";
    }
  }, [isAddVisible]);

  return (
    <StyledInputGroup>
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
          />
          <StyledInputAddBlock ref={addRef} onClick={onAddAction}>
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
          />
        ))}
      </StyledChipsContainer>
    </StyledInputGroup>
  );
};

export default MultiInputGroup;
