import React from "react";
import moment from "moment";

import { getCalendarDays } from "./getCalendarDays";
import { ColorTheme, ThemeType } from "../../ColorTheme";

export const getDayElements = (
  observedDate: any,
  selectedDate: any,
  handleDateChange: any,
  minDate: any,
  maxDate: any,
  isMobile: any
) => {
  const dateFormat = "YYYY-MM-D";

  const calendarDays = getCalendarDays(observedDate);

  const monthDays = {
    prevMonthDays: calendarDays.prevMonthDays.map((day) => (
      // @ts-expect-error TS(2322): Type '{ children: string; className: string; theme... Remove this comment to see the full error message
      <ColorTheme
        className="day"
        themeId={ThemeType.DateItem}
        isSecondary
        key={day.key}
        onClick={() => handleDateChange(moment(day.key, dateFormat))}
        disabled={
          moment(day.key, dateFormat) < minDate ||
          moment(day.key, dateFormat) > maxDate
        }
        isMobile={isMobile}
      >
        {day.value}
      </ColorTheme>
    )),
    currentMonthDays: calendarDays.currentMonthDays.map((day) => (
      // @ts-expect-error TS(2322): Type '{ children: string; className: string; theme... Remove this comment to see the full error message
      <ColorTheme
        className="day"
        themeId={ThemeType.DateItem}
        key={day.key}
        onClick={() => handleDateChange(moment(day.key, dateFormat))}
        disabled={
          moment(day.key, dateFormat) < minDate ||
          moment(day.key, dateFormat) > maxDate
        }
        isMobile={isMobile}
      >
        {day.value}
      </ColorTheme>
    )),
    nextMonthDays: calendarDays.nextMonthDays.map((day) => (
      // @ts-expect-error TS(2322): Type '{ children: string; className: string; theme... Remove this comment to see the full error message
      <ColorTheme
        className="day"
        themeId={ThemeType.DateItem}
        isSecondary
        key={day.key}
        onClick={() => handleDateChange(moment(day.key, dateFormat))}
        disabled={
          moment(day.key, dateFormat) < minDate ||
          moment(day.key, dateFormat) > maxDate
        }
        isMobile={isMobile}
      >
        {day.value}
      </ColorTheme>
    )),
  };

  const currentDate = moment().format("YYYY-MM-") + moment().format("D");
  const selectedDateFormated =
    moment(selectedDate).format("YYYY-MM-") + moment(selectedDate).format("D");

  for (const key in calendarDays) {
    // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
    calendarDays[key].forEach((day: any, index: any) => {
      if (day.key === currentDate) {
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        monthDays[key][index] = (
          // @ts-expect-error TS(2322): Type '{ children: any; className: string; themeId:... Remove this comment to see the full error message
          <ColorTheme
            className="day"
            themeId={ThemeType.DateItem}
            isCurrent
            key={day.key}
            onClick={() => handleDateChange(moment(day.key, dateFormat))}
            disabled={
              moment(day.key, dateFormat) < minDate ||
              moment(day.key, dateFormat) > maxDate
            }
            isMobile={isMobile}
          >
            {day.value}
          </ColorTheme>
        );
      } else if (day.key === selectedDateFormated) {
        // @ts-expect-error TS(7053): Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        monthDays[key][index] = (
          // @ts-expect-error TS(2322): Type '{ children: any; className: string; themeId:... Remove this comment to see the full error message
          <ColorTheme
            className="day"
            themeId={ThemeType.DateItem}
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
          </ColorTheme>
        );
      }
    });
  }

  return [
    ...monthDays.prevMonthDays,
    ...monthDays.currentMonthDays,
    ...monthDays.nextMonthDays,
  ];
};
