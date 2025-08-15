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
import classNames from "classnames";

import AcceptIconSvgUrl from "PUBLIC_DIR/images/selector.input.accept.svg?url";
import CancelIconSvgUrl from "PUBLIC_DIR/images/selector.input.cancel.svg?url";

import { InputSize, InputType, TextInput } from "../../text-input";
import { IconButton } from "../../icon-button";
import { RoomIcon } from "../../room-icon";
import { RoomLogo } from "../../room-logo";
import { Loader, LoaderTypes } from "../../loader";

import styles from "../Selector.module.scss";
import { InputItemProps } from "../Selector.types";

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
}: InputItemProps) => {
  const [value, setValue] = React.useState(defaultInputValue);
  const [isLoading, setIsLoading] = React.useState(false);

  const requestRunning = React.useRef<boolean>(false);
  const canceled = React.useRef<boolean>(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const onAcceptInputAction = React.useCallback(async () => {
    if (requestRunning.current || !value) return;
    setSavedInputValue(null);
    setIsLoading(true);
    requestRunning.current = true;

    await onAcceptInput(value);

    canceled.current = true;
    requestRunning.current = false;
    setIsLoading(false);
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
    <div key="input-item" className={styles.selectorItem} style={style}>
      {cover ? (
        <RoomIcon
          color={color}
          title={value}
          logo={{ cover, large: "", original: "", small: "", medium: "" }}
          showDefault={false}
          className={styles.itemLogo}
        />
      ) : color ? (
        <RoomIcon
          color={color}
          title={value}
          showDefault
          className={styles.itemLogo}
        />
      ) : roomType ? (
        <RoomLogo className={styles.roomLogoContainer} type={roomType} />
      ) : icon ? (
        <RoomIcon
          title={value}
          className={styles.itemLogo}
          imgClassName={styles.roomlogo}
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
        isDisabled={isLoading}
        testId="selector_input_item"
      />
      <div
        className={classNames(styles.inputWrapper, {
          [styles.loading]: isLoading,
        })}
        onClick={onAcceptInputAction}
      >
        {isLoading ? (
          <Loader type={LoaderTypes.track} size="16px" />
        ) : (
          <IconButton
            iconName={AcceptIconSvgUrl}
            size={16}
            dataTestId="selector_new_item_accept"
          />
        )}
      </div>
      <div
        className={classNames(styles.inputWrapper, {
          [styles.loading]: isLoading,
        })}
        onClick={onCancelInputAction}
      >
        <IconButton
          iconName={CancelIconSvgUrl}
          size={16}
          isDisabled={isLoading}
          dataTestId="selector_new_item_cancel"
        />
      </div>
    </div>
  );
};

export default InputItem;
