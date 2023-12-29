import React from "react";

import { getDayElements, getWeekdayElements } from "../utils";
import { CalendarContainer } from "../Calendar.styled";
import { DaysBodyProps } from "../Calendar.types";

export const DaysBody = ({
  observedDate,
  handleDateChange,
  selectedDate,
  minDate,
  maxDate,
  isMobile,
}: DaysBodyProps) => {
  const daysElements = getDayElements(
    observedDate,
    selectedDate,
    handleDateChange,
    minDate,
    maxDate,
    isMobile,
  );
  const weekdayElements = getWeekdayElements(isMobile);

  return (
    <CalendarContainer isMobile={isMobile}>
      {weekdayElements} {daysElements}
    </CalendarContainer>
  );
};
