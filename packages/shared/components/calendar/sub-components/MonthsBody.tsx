import React from "react";
import { CalendarContainer } from "../Calendar.styled";
import { getCalendarMonths, getMonthElements } from "../utils";
import { MonthsBodyProps } from "../Calendar.types";

export const MonthsBody = ({
  observedDate,
  setObservedDate,
  setSelectedScene,
  selectedDate,
  minDate,
  maxDate,
  isMobile,
}: MonthsBodyProps) => {
  const months = getCalendarMonths(observedDate);
  const monthsElements = getMonthElements(
    months,
    setObservedDate,
    setSelectedScene,
    selectedDate,
    minDate,
    maxDate,
    isMobile,
  );

  return (
    <CalendarContainer big isMobile={isMobile}>
      {monthsElements}
    </CalendarContainer>
  );
};
