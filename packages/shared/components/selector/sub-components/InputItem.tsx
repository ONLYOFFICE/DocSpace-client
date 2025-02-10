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

import AcceptIconSvgUrl from "PUBLIC_DIR/images/selector.input.accept.svg?url";
import CancelIconSvgUrl from "PUBLIC_DIR/images/selector.input.cancel.svg?url";

import { ICover } from "../../../api/rooms/types";

import { RoomsType } from "../../../enums";
import { Nullable } from "../../../types";

import { InputSize, InputType, TextInput } from "../../text-input";
import { IconButton } from "../../icon-button";
import { RoomIcon } from "../../room-icon";
import { RoomLogo } from "../../room-logo";

import { StyledInputWrapper, StyledItem } from "../Selector.styled";

const InputItem = ({
  defaultInputValue,
  onAcceptInput,
  onCancelInput,
  style,

  color,
  icon,
  cover,
  roomType,

  placeholder,

  setInputItemVisible,
  setSavedInputValue,
}: {
  defaultInputValue: string;
  onAcceptInput: (value: string) => void;
  onCancelInput: VoidFunction;
  style: React.CSSProperties;

  placeholder?: string;

  color?: string;
  icon?: string;
  roomType?: RoomsType;
  cover?: ICover;

  setInputItemVisible: (value: boolean) => void;
  setSavedInputValue: (value: Nullable<string>) => void;
}) => {
  const [value, setValue] = React.useState(defaultInputValue);

  const requestRunning = React.useRef<boolean>(false);
  const canceled = React.useRef<boolean>(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const onAcceptInputAction = React.useCallback(async () => {
    if (requestRunning.current || !value) return;
    setSavedInputValue(null);
    requestRunning.current = true;

    await onAcceptInput(value);

    canceled.current = true;
    requestRunning.current = false;
  }, [onAcceptInput, setSavedInputValue, value]);

  const onCancelInputAction = React.useCallback(() => {
    canceled.current = true;
    setSavedInputValue(null);
    onCancelInput();
  }, [onCancelInput, setSavedInputValue]);

  React.useEffect(() => {
    setInputItemVisible(true);

    return () => {
      setInputItemVisible(false);
    };
  }, [setInputItemVisible]);

  React.useEffect(() => {
    return () => {
      if (!canceled.current) setSavedInputValue(value);
    };
  }, [setSavedInputValue, value]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") onAcceptInputAction();
      else if (e.key === "Escape") onCancelInputAction();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onAcceptInputAction, onCancelInputAction]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;

    setValue(newVal);
  };

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  return (
    <StyledItem
      key="input-item"
      isSelected={false}
      isMultiSelect={false}
      isDisabled={false}
      noHover
      style={style}
    >
      {cover ? (
        <RoomIcon
          color={color}
          title={value}
          logo={{ cover, large: "", original: "", small: "", medium: "" }}
          showDefault={false}
          className="item-logo"
        />
      ) : color ? (
        <RoomIcon
          color={color}
          title={value}
          showDefault
          className="item-logo"
        />
      ) : roomType ? (
        <RoomLogo className="room-logo__container" type={roomType} />
      ) : icon ? (
        <RoomIcon
          title={value}
          className="item-logo"
          imgClassName="room-logo"
          logo={icon}
          showDefault={false}
        />
      ) : null}
      <TextInput
        value={value}
        size={InputSize.base}
        type={InputType.text}
        onChange={onChange}
        forwardedRef={inputRef}
        placeholder={placeholder}
      />
      <StyledInputWrapper onClick={onAcceptInputAction}>
        <IconButton iconName={AcceptIconSvgUrl} size={16} />
      </StyledInputWrapper>
      <StyledInputWrapper onClick={onCancelInputAction}>
        <IconButton iconName={CancelIconSvgUrl} size={16} />
      </StyledInputWrapper>
    </StyledItem>
  );
};

export default InputItem;
