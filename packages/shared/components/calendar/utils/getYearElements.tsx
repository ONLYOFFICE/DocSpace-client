import React from "react";
import moment from "moment";

import { StyledDateItemTheme } from "../Calendar.styled";

export const getYearElements = (
  years: string[],
  setObservedDate: React.Dispatch<React.SetStateAction<moment.Moment>>,
  setSelectedScene: React.Dispatch<React.SetStateAction<number>>,
  selectedDate: moment.Moment,
  minDate: moment.Moment,
  maxDate: moment.Moment,
  isMobile: boolean,
) => {
  const onDateClick = (year: string) => {
    setObservedDate((prevObservedDate) =>
      moment(
        `${moment(year, "YYYY").format("YYYY")}-${prevObservedDate.format(
          "MM-DD",
        )}`,
        "YYYY-MM-DD",
      ),
    );
    setSelectedScene((prevSelectedScene) => prevSelectedScene - 1);
  };

  const yearElements = years.map((year) => (
    <StyledDateItemTheme
      className="year"
      isSecondary
      big
      focused={false}
      key={year}
      onClick={() => onDateClick(year)}
      disabled={
        moment(year.toString()).endOf("year").endOf("month") < minDate ||
        moment(year.toString()) > maxDate
      }
      isMobile={isMobile}
    >
      {year}
    </StyledDateItemTheme>
  ));

  for (let i = 1; i < 11; i += 1) {
    yearElements[i] = (
      <StyledDateItemTheme
        className="year"
        big
        focused={false}
        key={years[i]}
        onClick={() => onDateClick(years[i])}
        disabled={
          moment(years[i].toString()).endOf("year").endOf("month") < minDate ||
          moment(years[i].toString()) > maxDate
        }
        isMobile={isMobile}
      >
        {years[i]}
      </StyledDateItemTheme>
    );
  }

  const currentYearIndex = years.indexOf(moment().format("YYYY"));
  const selectedYearIndex = years.indexOf(moment(selectedDate).format("YYYY"));
  if (selectedYearIndex !== -1) {
    yearElements[selectedYearIndex] = (
      <StyledDateItemTheme
        className="year"
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
      </StyledDateItemTheme>
    );
  }
  if (currentYearIndex !== -1) {
    yearElements[currentYearIndex] = (
      <StyledDateItemTheme
        className="year"
        isCurrent
        big
        focused={false}
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
      </StyledDateItemTheme>
    );
  }

  return yearElements;
};
