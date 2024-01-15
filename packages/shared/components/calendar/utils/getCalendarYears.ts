import moment from "moment";

export const getCalendarYears = (observedDate: moment.Moment) => {
  const years = [];
  const selectedYear = observedDate.year();
  const firstYear = selectedYear - (selectedYear % 10) - 1;

  for (let i = firstYear; i <= firstYear + 15; i += 1) {
    years.push(moment(i, "YYYY").format("YYYY"));
  }

  return years;
};
