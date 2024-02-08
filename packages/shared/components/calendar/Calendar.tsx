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
  initialDate: initialDateProp,
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

  const date = initialDateProp ?? new Date();
  const [initialDate, setInitialDate] = useState(moment(date));

  const momentMinDate = minDate
    ? moment(minDate)
    : moment(new Date("1970/01/01"));
  const momentMaxDate = maxDate
    ? moment(maxDate)
    : moment(new Date("2040/01/01"));
  const [resultMinDate, resultMaxDate] = getValidDates(
    momentMinDate,
    momentMaxDate,
  );

  useEffect(() => {
    const today = moment();
    if (!initialDateProp) {
      setInitialDate(
        today <= resultMaxDate && initialDate >= resultMinDate
          ? today
          : today.diff(resultMinDate, "day") > today.diff(resultMaxDate, "day")
            ? resultMinDate.clone()
            : resultMaxDate.clone(),
      );

      initialDate.startOf("day");
    } else if (initialDate > resultMaxDate || initialDate < resultMinDate) {
      setInitialDate(
        today <= resultMaxDate && today >= resultMinDate
          ? today
          : today.diff(resultMinDate, "day") > today.diff(resultMaxDate, "day")
            ? resultMinDate.clone()
            : resultMaxDate.clone(),
      );
      initialDate.startOf("day");

      console.error(
        "Initial date is out of min/max dates boundaries. Initial date will be set as closest boundary value",
      );
    }
    setObservedDate(initialDate);
  }, [initialDateProp, initialDate, resultMaxDate, resultMinDate]);

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
