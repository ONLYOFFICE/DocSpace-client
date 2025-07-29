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

import React, { useRef, useState, useEffect } from "react";
import moment from "moment";
import classNames from "classnames";

import { InputSize, InputType, TextInput } from "../text-input";

import { TimePickerProps } from "./TimePicker.types";
import styles from "./TimePicker.module.scss";

const TimePicker = ({
  initialTime,
  onChange = () => {},
  className = "",
  hasError = false,
  tabIndex,
  classNameInput,
  onBlur,
  focusOnRender = false,
  forwardedRef,
  testId,
}: TimePickerProps) => {
  const hoursInputRef = useRef<HTMLInputElement>(null);
  const minutesInputRef = useRef<HTMLInputElement>(null);

  const [date, setDate] = useState(
    initialTime ? moment(initialTime) : moment().startOf("day"),
  );

  const [isInputFocused, setIsInputFocused] = useState(false);

  const [hours, setHours] = useState(moment(date, "HH:mm").format("HH"));

  const [minutes, setMinutes] = useState(moment(date, "HH:mm").format("mm"));

  const mountRef = useRef(false);

  const focusHoursInput = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (!minutesInputRef.current?.contains(target))
      hoursInputRef.current?.select();
  };

  const focusMinutesInput = () => {
    minutesInputRef.current?.select();
  };

  const blurMinutesInput = () => {
    onBlur?.();
    minutesInputRef.current?.blur();
  };

  const changeHours = (time: string) => {
    setHours(time);
    setDate(
      moment(
        `${date.format("YYYY-MM-DD")} ${time}:${minutes}`,
        "YYYY-MM-DD HH:mm",
      ),
    );
    onChange(
      moment(
        `${date.format("YYYY-MM-DD")} ${time}:${minutes}`,
        "YYYY-MM-DD HH:mm",
      ),
    );
  };

  const onHoursBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value.length === 1) changeHours(`0${e.target.value}`);
    setIsInputFocused(false);
  };
  const onMinutesBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value.length === 1) changeHours(`0${e.target.value}`);
    setIsInputFocused(false);
  };

  const focusInput = () => setIsInputFocused(true);

  useEffect(() => {
    if (focusOnRender && hoursInputRef.current) hoursInputRef.current.select();
    mountRef.current = true;
  }, [focusOnRender]);

  const changeMinutes = (time: string) => {
    setMinutes(time);
    setDate(
      moment(
        `${date.format("YYYY-MM-DD")} ${hours}:${time}`,
        "YYYY-MM-DD HH:mm",
      ),
    );
    onChange(
      moment(
        `${date.format("YYYY-MM-DD")} ${hours}:${time}`,
        "YYYY-MM-DD HH:mm",
      ),
    );
  };

  const handleChangeHours = (e: React.ChangeEvent<HTMLInputElement>) => {
    const h = e.target.value;

    if (h.length > 2) {
      focusMinutesInput();
      return;
    }

    if (h === "") {
      changeHours("00");
      return;
    }
    if (!/^\d+$/.test(h)) return;

    if (+h > 23) {
      focusMinutesInput();
      if (h.length === 2) changeHours(`0${h[0]}`);
      return;
    }

    if (h.length === 1 && +h > 2) {
      changeHours(`0${h}`);
      focusMinutesInput();
      return;
    }

    if (h.length === 2) focusMinutesInput();

    changeHours(h);
  };

  const handleChangeMinutes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const m = e.target.value;

    if (m.length > 2) {
      blurMinutesInput();
      return;
    }

    if (m === "") {
      changeMinutes("00");
      return;
    }
    if (!/^\d+$/.test(m)) return;

    if (+m > 59) {
      onBlur?.();
      return;
    }

    if (m.length === 1 && +m > 5) {
      changeMinutes(`0${m}`);
      blurMinutesInput();
      return;
    }
    if (m.length === 2) {
      blurMinutesInput();
    }

    changeMinutes(m);
  };

  const preventDefaultContext = (e: React.MouseEvent<HTMLInputElement>) =>
    e.preventDefault();

  return (
    <div
      onClick={focusHoursInput}
      className={classNames(styles.timeInput, className, {
        [styles.hasError]: hasError,
        [styles.isFocused]: isInputFocused,
      })}
      ref={forwardedRef}
      data-testid={testId ?? "time-picker"}
      role="group"
      aria-label="Time picker"
    >
      <TextInput
        className={`${classNameInput}-hours-input`}
        withBorder={false}
        forwardedRef={hoursInputRef}
        value={hours}
        onChange={handleChangeHours}
        onBlur={onHoursBlur}
        tabIndex={tabIndex}
        onFocus={focusInput}
        type={InputType.search}
        onContextMenu={preventDefaultContext}
        autoComplete="off"
        inputMode="numeric"
        size={InputSize.base}
        data-test-id="hours-input"
        aria-label="Hours"
      />
      :
      <TextInput
        className={`${classNameInput}-minutes-input`}
        withBorder={false}
        forwardedRef={minutesInputRef}
        value={minutes}
        onChange={handleChangeMinutes}
        onClick={focusMinutesInput}
        onBlur={onMinutesBlur}
        onFocus={focusInput}
        type={InputType.search}
        onContextMenu={preventDefaultContext}
        autoComplete="off"
        inputMode="numeric"
        size={InputSize.base}
        data-test-id="minutes-input"
        aria-label="Minutes"
      />
    </div>
  );
};

export { TimePicker };
