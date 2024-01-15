import React from "react";
import moment from "moment";

import { Weekday } from "../Calendar.styled";

export const getWeekdayElements = (isMobile: boolean) => {
  const weekdays = moment
    .weekdaysMin(true)
    .map((weekday) => weekday.charAt(0).toUpperCase() + weekday.substring(1));
  return weekdays.map((day) => (
    <Weekday className="weekday" key={day} isMobile={isMobile}>
      {day}
    </Weekday>
  ));
};
