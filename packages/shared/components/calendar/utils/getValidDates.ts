/* eslint-disable no-console */
import moment from "moment";

export const getValidDates = (
  currentMinDate?: moment.Moment | Date,
  currentMaxDate?: moment.Moment | Date,
  minDate?: moment.Moment | Date,
  maxDate?: moment.Moment | Date,
) => {
  if (!minDate) {
    minDate = moment("01/01/1970", "DD/MM/YYYY");
  }
  if (!maxDate) {
    maxDate = moment();
    maxDate.add(10, "years");
  }

  if (minDate >= maxDate) {
    minDate = moment("01/01/1970", "DD/MM/YYYY");
    maxDate = moment();
    maxDate.add(10, "years");
    console.error(
      "The minimum date is farther than or same as the maximum date. minDate and maxDate are set to default",
    );
  }
  minDate = moment(minDate);
  maxDate = moment(maxDate);

  if (!currentMinDate) {
    currentMinDate = minDate;
  }
  if (!currentMaxDate) {
    currentMaxDate = maxDate;
  }

  let resultMinDate = moment(currentMinDate);
  let resultMaxDate = moment(currentMaxDate);

  resultMinDate = resultMinDate < minDate ? minDate : resultMinDate;
  resultMaxDate = resultMaxDate > maxDate ? maxDate : resultMaxDate;

  if (resultMinDate >= resultMaxDate) {
    resultMinDate = minDate;
    resultMaxDate = maxDate;
  }

  return [resultMinDate, resultMaxDate];
};
