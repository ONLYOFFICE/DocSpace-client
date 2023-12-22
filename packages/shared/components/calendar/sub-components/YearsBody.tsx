import React from "react";

import { CalendarContainer } from "../Calendar.styled";
import { getCalendarYears, getYearElements } from "../utils";
import { YearsProps } from "../Calendar.types";

export const YearsBody = ({
  observedDate,
  setObservedDate,
  setSelectedScene,
  selectedDate,
  minDate,
  maxDate,
  isMobile,
}: YearsProps) => {
  const years = getCalendarYears(observedDate);
  const yearElements = getYearElements(
    years,
    setObservedDate,
    setSelectedScene,
    selectedDate,
    minDate,
    maxDate,
    isMobile,
  );

  return (
    <CalendarContainer big isMobile={isMobile}>
      {yearElements}
    </CalendarContainer>
  );
};
