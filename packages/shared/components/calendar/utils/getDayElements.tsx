import React from "react";
import moment from "moment";

import { getCalendarDays } from "./getCalendarDays";
import { StyledDateItemTheme } from "../Calendar.styled";

export const getDayElements = (
  observedDate: moment.Moment,
  selectedDate: moment.Moment,
  handleDateChange: (date: moment.Moment) => void,
  minDate: moment.Moment,
  maxDate: moment.Moment,
  isMobile: boolean,
) => {
  const dateFormat = "YYYY-MM-D";

  const calendarDays = getCalendarDays(observedDate);

  const monthDays = {
    prevMonthDays: calendarDays.prevMonthDays.map((day) => (
      <StyledDateItemTheme
        className="day"
        isSecondary
        key={day.key}
        onClick={() => handleDateChange(moment(day.key, dateFormat))}
        disabled={
          moment(day.key, dateFormat) < minDate ||
          moment(day.key, dateFormat) > maxDate
        }
        isMobile={isMobile}
        focused={false}
      >
        {day.value}
      </StyledDateItemTheme>
    )),
    currentMonthDays: calendarDays.currentMonthDays.map((day) => (
      <StyledDateItemTheme
        className="day"
        key={day.key}
        onClick={() => handleDateChange(moment(day.key, dateFormat))}
        disabled={
          moment(day.key, dateFormat) < minDate ||
          moment(day.key, dateFormat) > maxDate
        }
        isMobile={isMobile}
        focused={false}
      >
        {day.value}
      </StyledDateItemTheme>
    )),
    nextMonthDays: calendarDays.nextMonthDays.map((day) => (
      <StyledDateItemTheme
        className="day"
        isSecondary
        key={day.key}
        onClick={() => handleDateChange(moment(day.key, dateFormat))}
        disabled={
          moment(day.key, dateFormat) < minDate ||
          moment(day.key, dateFormat) > maxDate
        }
        isMobile={isMobile}
        focused={false}
      >
        {day.value}
      </StyledDateItemTheme>
    )),
  };

  const currentDate = moment().format("YYYY-MM-") + moment().format("D");
  const selectedDateFormated =
    moment(selectedDate).format("YYYY-MM-") + moment(selectedDate).format("D");

  Object.keys(calendarDays).forEach((key) => {
    if (
      key === "prevMonthDays" ||
      key === "currentMonthDays" ||
      key === "nextMonthDays"
    ) {
      calendarDays[key].forEach((day, index) => {
        if (day.key === currentDate) {
          monthDays[key][index] = (
            <StyledDateItemTheme
              className="day"
              isCurrent
              key={day.key}
              onClick={() => handleDateChange(moment(day.key, dateFormat))}
              disabled={
                moment(day.key, dateFormat) < minDate ||
                moment(day.key, dateFormat) > maxDate
              }
              isMobile={isMobile}
              focused={false}
            >
              {day.value}
            </StyledDateItemTheme>
          );
        } else if (day.key === selectedDateFormated) {
          monthDays[key][index] = (
            <StyledDateItemTheme
              className="day"
              key={day.key}
              focused
              onClick={() => handleDateChange(moment(day.key, dateFormat))}
              disabled={
                moment(day.key, dateFormat) < minDate ||
                moment(day.key, dateFormat) > maxDate
              }
              isMobile={isMobile}
            >
              {day.value}
            </StyledDateItemTheme>
          );
        }
      });
    }
  });

  return [
    ...monthDays.prevMonthDays,
    ...monthDays.currentMonthDays,
    ...monthDays.nextMonthDays,
  ];
};
