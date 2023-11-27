import React from "react";
import { CalendarContainer } from "../styled-components";
import { getCalendarMonths, getMonthElements } from "../utils";

export const MonthsBody = ({
  observedDate,
  setObservedDate,
  setSelectedScene,
  selectedDate,
  minDate,
  maxDate,
  isMobile
}: any) => {
  const months = getCalendarMonths(observedDate);
  const monthsElements = getMonthElements(
    months,
    setObservedDate,
    setSelectedScene,
    selectedDate,
    minDate,
    maxDate,
    isMobile
  );

  return (
    // @ts-expect-error TS(2769): No overload matches this call.
    <CalendarContainer big isMobile={isMobile}>
      {monthsElements}
    </CalendarContainer>
  );
};
