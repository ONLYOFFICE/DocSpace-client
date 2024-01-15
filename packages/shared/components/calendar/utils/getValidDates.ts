/* eslint-disable no-console */
import moment from "moment";

export const getValidDates = (
  currentMinDate: moment.Moment | Date,
  currentMaxDate: moment.Moment | Date,
  minDate = new Date("01/01/1970"),
  maxDate = new Date().setFullYear(new Date().getFullYear() + 10),
) => {
  // @ts-expect-error TS(2365): Operator '>=' cannot be applied to types 'Date' an... Remove this comment to see the full error message
  if (minDate >= maxDate) {
    minDate = new Date("01/01/1970");
    maxDate = new Date().setFullYear(new Date().getFullYear() + 10);
    console.error(
      "The minimum date is farther than or same as the maximum date. minDate and maxDate are set to default",
    );
  }
  // @ts-expect-error TS(2740): Type 'Moment' is missing the following properties ... Remove this comment to see the full error message
  minDate = moment(minDate);
  // @ts-expect-error TS(2322): Type 'Moment' is not assignable to type 'number'.
  maxDate = moment(maxDate);

  let resultMinDate = moment(currentMinDate);
  let resultMaxDate = moment(currentMaxDate);

  // @ts-expect-error TS(2322): Type 'Date | Moment' is not assignable to type 'Mo... Remove this comment to see the full error message
  resultMinDate = resultMinDate < minDate ? minDate : resultMinDate;
  // @ts-expect-error TS(2322): Type 'number | Moment' is not assignable to type '... Remove this comment to see the full error message
  resultMaxDate = resultMaxDate > maxDate ? maxDate : resultMaxDate;

  if (resultMinDate >= resultMaxDate) {
    // @ts-expect-error TS(2322): Type 'Date' is not assignable to type 'Moment'.
    resultMinDate = minDate;
    // @ts-expect-error TS(2322): Type 'number' is not assignable to type 'Moment'.
    resultMaxDate = maxDate;
  }

  return [resultMinDate, resultMaxDate];
};
