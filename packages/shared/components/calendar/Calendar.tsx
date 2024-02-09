/* eslint-disable no-console */
import React, { useEffect, useState } from "react";
import { useTheme } from "styled-components";
import moment from "moment";

import { Days, Months, Years } from "./sub-components";

import { getValidDates } from "./utils";
import { CalendarProps } from "./Calendar.types";
import { StyledContainerTheme } from "./Calendar.styled";

const Calendar = ({
  locale = "en",
  selectedDate,
  setSelectedDate,
  minDate,
  maxDate,
  id,
  className,
  style,
  initialDate,
  onChange,
  isMobile,
  forwardedRef,
}: CalendarProps) => {
  moment.locale(locale);

  const theme = useTheme();

  const handleDateChange = (date: moment.Moment) => {
    const formattedDate = moment(
      date.format("YYYY-MM-DD") +
        (selectedDate ? ` ${selectedDate.format("HH:mm")}` : ""),
    );
    setSelectedDate?.(formattedDate);
    onChange?.(formattedDate);
  };

  const [observedDate, setObservedDate] = useState(moment());
  const [selectedScene, setSelectedScene] = useState(0);
  const [resultMinDate, setResultMinDate] = useState(moment());
  const [resultMaxDate, setResultMaxDate] = useState(moment());

  useEffect(() => {
    const [min, max] = getValidDates(minDate, maxDate);

    setResultMaxDate(max);
    setResultMinDate(min);
  }, [minDate, maxDate]);

  useEffect(() => {
    let date = moment(initialDate);
    const [min, max] = getValidDates(minDate, maxDate);

    if (!initialDate) {
      const today = moment();
      date =
        today <= max && today >= min
          ? today
          : Math.abs(today.diff(min, "day")) > Math.abs(today.diff(max, "day"))
            ? max.clone()
            : min.clone();

      date.startOf("day");
      date = moment();
    } else if (date > max || date < min) {
      date =
        Math.abs(date.diff(min, "day")) > Math.abs(date.diff(max, "day"))
          ? max.clone()
          : min.clone();

      date.startOf("day");

      console.warn(
        "Initial date is out of min/max dates boundaries. Initial date will be set as closest boundary value",
      );
    }
    setObservedDate(date);
  }, [initialDate, maxDate, minDate]);

  return (
    <StyledContainerTheme
      id={id}
      className={className}
      style={style}
      isMobile={isMobile}
      ref={forwardedRef}
      $currentColorScheme={theme?.currentColorScheme}
      data-testid="calendar"
    >
      {selectedScene === 0 ? (
        <Days
          observedDate={observedDate}
          setObservedDate={setObservedDate}
          setSelectedScene={setSelectedScene}
          selectedDate={selectedDate}
          handleDateChange={handleDateChange}
          minDate={resultMinDate}
          maxDate={resultMaxDate}
          isMobile={isMobile || false}
        />
      ) : selectedScene === 1 ? (
        <Months
          observedDate={observedDate}
          setObservedDate={setObservedDate}
          setSelectedScene={setSelectedScene}
          selectedDate={selectedDate}
          minDate={resultMinDate}
          maxDate={resultMaxDate}
          isMobile={isMobile || false}
        />
      ) : (
        <Years
          observedDate={observedDate}
          setObservedDate={setObservedDate}
          setSelectedScene={setSelectedScene}
          selectedDate={selectedDate}
          minDate={resultMinDate}
          maxDate={resultMaxDate}
          isMobile={isMobile || false}
        />
      )}
    </StyledContainerTheme>
  );
};

export { Calendar };
