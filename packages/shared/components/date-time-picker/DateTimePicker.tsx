import React, { useState, useRef, useEffect } from "react";
import moment from "moment";

import ClockIcon from "PUBLIC_DIR/images/clock.react.svg";

import { ButtonKeys } from "../../enums";

import { TimePicker } from "../time-picker";
import { DatePicker } from "../date-picker";

import { DateTimePickerProps } from "./DateTimerPicker.types";
import { Selectors, TimeCell, TimeSelector } from "./DateTimerPicker.styled";

const DateTimePicker = (props: DateTimePickerProps) => {
  const {
    initialDate,
    selectDateText,
    onChange,
    className,
    id,
    hasError,
    minDate,
    maxDate,
    locale,
    openDate,
  } = props;

  const [isTimeFocused, setIsTimeFocused] = useState(false);

  const [date, setDate] = useState(initialDate ? moment(initialDate) : null);

  const showTimePicker = () => setIsTimeFocused(true);
  const hideTimePicker = () => setIsTimeFocused(false);

  const handleChange = (d: moment.Moment | null) => {
    onChange?.(d);
    setDate(d);
  };

  const timePickerRef = useRef<HTMLInputElement | null>(null);

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target &&
      timePickerRef?.current &&
      !timePickerRef?.current?.contains(target)
    )
      setIsTimeFocused(false);
  };
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === ButtonKeys.enter || event.key === ButtonKeys.tab) {
      setIsTimeFocused(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClick, { capture: true });
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, []);

  return (
    <Selectors className={className} id={id} hasError={hasError}>
      <DatePicker
        initialDate={initialDate}
        // date={date}
        onChange={handleChange}
        selectDateText={selectDateText}
        minDate={minDate}
        maxDate={maxDate}
        locale={locale}
        openDate={openDate}
        outerDate={date}
      />
      <TimeSelector>
        {date !== null &&
          (isTimeFocused ? (
            <TimePicker
              initialTime={date}
              onChange={handleChange}
              tabIndex={0}
              onBlur={hideTimePicker}
              focusOnRender
              forwardedRef={timePickerRef}
            />
          ) : (
            <TimeCell onClick={showTimePicker} hasError={hasError}>
              <ClockIcon className="clockIcon" />
              {date.format("HH:mm")}
            </TimeCell>
          ))}
      </TimeSelector>
    </Selectors>
  );
};

export { DateTimePicker };
