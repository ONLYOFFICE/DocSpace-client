import React from "react";
import moment from "moment";

import { ColorTheme, ThemeType } from "../../ColorTheme";

export const getYearElements = (
  years: any,
  setObservedDate: any,
  setSelectedScene: any,
  selectedDate: any,
  minDate: any,
  maxDate: any,
  isMobile: any
) => {
  const onDateClick = (year: any) => {
    setObservedDate((prevObservedDate: any) => moment(
      `${moment(year, "YYYY").format("YYYY")}-${prevObservedDate.format(
        "MM-DD"
      )}`,
      "YYYY-MM-DD"
    )
    );
    setSelectedScene((prevSelectedScene: any) => prevSelectedScene - 1);
  };

  // @ts-expect-error TS(2322): Type '{ children: any; className: string; themeId:... Remove this comment to see the full error message
  const yearElements = years.map((year: any) => <ColorTheme
    className="year"
    themeId={ThemeType.DateItem}
    isSecondary
    big
    key={year}
    onClick={() => onDateClick(year)}
    disabled={
      moment(year.toString()).endOf("year").endOf("month") < minDate ||
      moment(year.toString()) > maxDate
    }
    isMobile={isMobile}
  >
    {year}
  </ColorTheme>);

  for (let i = 1; i < 11; i++) {
    yearElements[i] = (
      // @ts-expect-error TS(2322): Type '{ children: any; className: string; themeId:... Remove this comment to see the full error message
      <ColorTheme
        className="year"
        themeId={ThemeType.DateItem}
        big
        key={years[i]}
        onClick={() => onDateClick(years[i])}
        disabled={
          moment(years[i].toString()).endOf("year").endOf("month") < minDate ||
          moment(years[i].toString()) > maxDate
        }
        isMobile={isMobile}
      >
        {years[i]}
      </ColorTheme>
    );
  }

  const currentYearIndex = years.indexOf(moment().format("YYYY"));
  const selectedYearIndex = years.indexOf(moment(selectedDate).format("YYYY"));
  if (selectedYearIndex !== -1) {
    yearElements[selectedYearIndex] = (
      // @ts-expect-error TS(2322): Type '{ children: any; className: string; themeId:... Remove this comment to see the full error message
      <ColorTheme
        className="year"
        themeId={ThemeType.DateItem}
        big
        focused
        key={years[selectedYearIndex]}
        onClick={() => onDateClick(years[selectedYearIndex])}
        disabled={
          moment(years[selectedYearIndex].toString())
            .endOf("year")
            .endOf("month") < minDate ||
          moment(years[selectedYearIndex].toString()) > maxDate
        }
        isMobile={isMobile}
      >
        {years[selectedYearIndex]}
      </ColorTheme>
    );
  }
  if (currentYearIndex !== -1) {
    yearElements[currentYearIndex] = (
      // @ts-expect-error TS(2322): Type '{ children: any; className: string; themeId:... Remove this comment to see the full error message
      <ColorTheme
        className="year"
        themeId={ThemeType.DateItem}
        isCurrent
        big
        key={years[currentYearIndex]}
        onClick={() => onDateClick(years[currentYearIndex])}
        disabled={
          moment(years[currentYearIndex].toString())
            .endOf("year")
            .endOf("month") < minDate ||
          moment(years[currentYearIndex].toString()) > maxDate
        }
        isMobile={isMobile}
      >
        {years[currentYearIndex]}
      </ColorTheme>
    );
  }

  return yearElements;
};
