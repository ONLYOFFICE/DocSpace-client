import React from "react";

import { CalendarContainer } from "../styled-components";
import { getCalendarYears, getYearElements } from "../utils";

export const YearsBody = ({
  observedDate,
  setObservedDate,
  setSelectedScene,
  selectedDate,
  minDate,
  maxDate,
  isMobile
}: any) => {
  const years = getCalendarYears(observedDate);
  const yearElements = getYearElements(
    years,
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
      {yearElements}
    </CalendarContainer>
  );
};
