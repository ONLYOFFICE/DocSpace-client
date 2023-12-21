import React, { useRef, useState, useEffect } from "react";
import moment from "moment";

import { InputSize, InputType, TextInput } from "../text-input";

import { TimePickerProps } from "./TimePicker.types";
import TimeInput from "./TimePicker.styled";

const TimePicker = ({
  initialTime,
  onChange,
  className,
  hasError,
  tabIndex,
  classNameInput,
  onBlur,
  focusOnRender,
  forwardedRef,
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
    <TimeInput
      onClick={focusHoursInput}
      className={className}
      hasError={hasError}
      isFocused={isInputFocused}
      ref={forwardedRef}
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
        inputmode="numeric"
        size={InputSize.base}
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
        inputmode="numeric"
        size={InputSize.base}
      />
    </TimeInput>
  );
};

TimePicker.defaultProps = {
  onChange: () => {},
  className: "",
  hasError: false,
  focusOnRender: false,
};

export default TimePicker;
