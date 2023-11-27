import React from "react";
import moment from "moment";
import { ColorTheme, ThemeType } from "../../ColorTheme";

export const getMonthElements = (
  months: any,
  setObservedDate: any,
  setSelectedScene: any,
  selectedDate: any,
  minDate: any,
  maxDate: any,
  isMobile: any
) => {
  const onDateClick = (dateString: any) => {
    setObservedDate((prevObservedDate: any) => moment(
      `${moment(dateString, "YYYY-M").format("YYYY")}-${moment(
        dateString,
        "YYYY-M"
      ).format("MM")}-${prevObservedDate.format("DD")}`,
      "YYYY-MM-DD"
    )
    );
    setSelectedScene((prevSelectedScene: any) => prevSelectedScene - 1);
  };

  const dateFormat = "YYYY-M";

  // @ts-expect-error TS(2322): Type '{ children: any; className: string; themeId:... Remove this comment to see the full error message
  const monthsElements = months.map((month: any) => <ColorTheme
    className="month"
    themeId={ThemeType.DateItem}
    big
    key={month.key}
    onClick={() => onDateClick(month.key)}
    disabled={
      moment(month.key, dateFormat).endOf("month") < minDate ||
      moment(month.key, dateFormat).startOf("month") > maxDate
    }
    isMobile={isMobile}
  >
    {month.value}
  </ColorTheme>);
  for (let i = 12; i < 16; i++) {
    monthsElements[i] = (
      // @ts-expect-error TS(2322): Type '{ children: any; className: string; themeId:... Remove this comment to see the full error message
      <ColorTheme
        className="month"
        themeId={ThemeType.DateItem}
        isSecondary
        big
        key={months[i].key}
        onClick={() => onDateClick(months[i].key)}
        disabled={
          moment(months[i].key, dateFormat).endOf("month") < minDate ||
          moment(months[i].key, dateFormat).startOf("month") > maxDate
        }
        isMobile={isMobile}
      >
        {months[i].value}
      </ColorTheme>
    );
  }

  const currentDate = `${moment().format("YYYY")}-${moment().format("M")}`;
  const formattedDate = `${moment(selectedDate).format("YYYY")}-${moment(
    selectedDate
  ).format("M")}`;

  months.forEach((month: any, index: any) => {
    if (month.key === currentDate) {
      monthsElements[index] = (
        // @ts-expect-error TS(2322): Type '{ children: any; className: string; themeId:... Remove this comment to see the full error message
        <ColorTheme
          className="month"
          themeId={ThemeType.DateItem}
          isCurrent
          big
          key={month.key}
          onClick={() => onDateClick(month.key)}
          disabled={
            moment(month.key, dateFormat).endOf("month") < minDate ||
            moment(month.key, dateFormat).startOf("month") > maxDate
          }
          isMobile={isMobile}
        >
          {month.value}
        </ColorTheme>
      );
    } else if (month.key === formattedDate) {
      monthsElements[index] = (
        // @ts-expect-error TS(2322): Type '{ children: any; className: string; themeId:... Remove this comment to see the full error message
        <ColorTheme
          className="month"
          themeId={ThemeType.DateItem}
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
        </ColorTheme>
      );
    }
  });
  return monthsElements;
};
