import moment from "moment-timezone";

export default function getCorrectDate(
  locale: string,
  date: string,
  dateFormat = "L",
  timeFormat = "LT",
) {
  if (!date || date === "0001-01-01T00:00:00.0000000Z") return "—";

  const timezone = window.timezone;

  const curDate = moment(date).locale(locale).tz(timezone).format(dateFormat);
  const curTime = moment(date).locale(locale).tz(timezone).format(timeFormat);

  const correctDate = `${curDate} ${curTime}`;

  return correctDate;
}
