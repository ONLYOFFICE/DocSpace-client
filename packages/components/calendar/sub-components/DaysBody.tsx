import React from "react";
import { CalendarContainer } from "../styled-components";

import { getDayElements, getWeekdayElements } from "../utils";

export const DaysBody = ({
  observedDate,
  handleDateChange,
  selectedDate,
  minDate,
  maxDate,
  isMobile
}: any) => {
  const daysElements = getDayElements(
    observedDate,
    selectedDate,
    handleDateChange,
    minDate,
    maxDate,
    isMobile
  );
  const weekdayElements = getWeekdayElements(isMobile);

  return (
    // @ts-expect-error TS(2769): No overload matches this call.
    <CalendarContainer isMobile={isMobile}>
      {weekdayElements} {daysElements}
    </CalendarContainer>
  );
};
