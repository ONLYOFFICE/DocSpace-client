import moment from "moment-timezone";

export default function getCorrectDate(
  locale,
  date,
  dateFormat = "L",
  timeFormat = "LT"
) {
  //  if something went wrong with 'moment' - change for on this method get correct time
  //   const options = {
  //     year: "numeric",
  //     month: "2-digit",
  //     day: "2-digit",
  //     hour: "2-digit",
  //     minute: "numeric",
  //   };

  //   const correctDate = new Date(date)
  //     .toLocaleString(locale, options)
  //     .replace(",", "");

  if (!date || date === "0001-01-01T00:00:00.0000000Z") return "—";

  const timezone = window.timezone;

  const curDate = moment(date).locale(locale).tz(timezone).format(dateFormat);
  const curTime = moment(date).locale(locale).tz(timezone).format(timeFormat);

  const correctDate = curDate + " " + curTime;

  return correctDate;
}
