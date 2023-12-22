import React from "react";
import moment from "moment";

import { StyledDateItemTheme } from "../Calendar.styled";

export const getMonthElements = (
  months: {
    key: string;
    value: string;
  }[],
  setObservedDate: React.Dispatch<React.SetStateAction<moment.Moment>>,
  setSelectedScene: React.Dispatch<React.SetStateAction<number>>,
  selectedDate: moment.Moment,
  minDate: moment.Moment,
  maxDate: moment.Moment,
  isMobile: boolean,
) => {
  const onDateClick = (dateString: string) => {
    setObservedDate((prevObservedDate) =>
      moment(
        `${moment(dateString, "YYYY-M").format("YYYY")}-${moment(
          dateString,
          "YYYY-M",
        ).format("MM")}-${prevObservedDate.format("DD")}`,
        "YYYY-MM-DD",
      ),
    );
    setSelectedScene((prevSelectedScene) => prevSelectedScene - 1);
  };

  const dateFormat = "YYYY-M";

  const monthsElements = months.map((month) => (
    <StyledDateItemTheme
      className="month"
      big
      key={month.key}
      onClick={() => onDateClick(month.key)}
      disabled={
        moment(month.key, dateFormat).endOf("month") < minDate ||
        moment(month.key, dateFormat).startOf("month") > maxDate
      }
      isMobile={isMobile}
      focused={false}
    >
      {month.value}
    </StyledDateItemTheme>
  ));
  for (let i = 12; i < 16; i += 1) {
    monthsElements[i] = (
      <StyledDateItemTheme
        className="month"
        isSecondary
        big
        key={months[i].key}
        onClick={() => onDateClick(months[i].key)}
        disabled={
          moment(months[i].key, dateFormat).endOf("month") < minDate ||
          moment(months[i].key, dateFormat).startOf("month") > maxDate
        }
        isMobile={isMobile}
        focused={false}
      >
        {months[i].value}
      </StyledDateItemTheme>
    );
  }

  const currentDate = `${moment().format("YYYY")}-${moment().format("M")}`;
  const formattedDate = `${moment(selectedDate).format("YYYY")}-${moment(
    selectedDate,
  ).format("M")}`;

  months.forEach((month, index) => {
    if (month.key === currentDate) {
      monthsElements[index] = (
        <StyledDateItemTheme
          className="month"
          isCurrent
          big
          key={month.key}
          onClick={() => onDateClick(month.key)}
          disabled={
            moment(month.key, dateFormat).endOf("month") < minDate ||
            moment(month.key, dateFormat).startOf("month") > maxDate
          }
          isMobile={isMobile}
          focused={false}
        >
          {month.value}
        </StyledDateItemTheme>
      );
    } else if (month.key === formattedDate) {
      monthsElements[index] = (
        <StyledDateItemTheme
          className="month"
          big
          key={month.key}
          focused
          onClick={() => onDateClick(month.key)}
          disabled={
            moment(month.key, dateFormat).endOf("month") < minDate ||
            moment(month.key, dateFormat).startOf("month") > maxDate
          }
          isMobile={isMobile}
        >
          {month.value}
        </StyledDateItemTheme>
      );
    }
  });
  return monthsElements;
};
