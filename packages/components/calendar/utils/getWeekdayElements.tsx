import React from "react";
import moment from "moment";

import { Weekday } from "../styled-components";

export const getWeekdayElements = (isMobile: any) => {
  const weekdays = moment
    .weekdaysMin(true)
    .map((weekday) => weekday.charAt(0).toUpperCase() + weekday.substring(1));
  return weekdays.map((day) => (
    // @ts-expect-error TS(2769): No overload matches this call.
    <Weekday className="weekday" key={day} isMobile={isMobile}>
      {day}
    </Weekday>
  ));
};
