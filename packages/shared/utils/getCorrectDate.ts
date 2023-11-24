import moment from "moment";

export default function getCorrectDate(locale: string, date: string) {
  if (!date || date === "0001-01-01T00:00:00.0000000Z") return "—";

  const curDate = moment(date).locale(locale).format("L");
  const curTime = moment(date).locale(locale).format("LT");

  const correctDate = `${curDate} ${curTime}`;

  return correctDate;
}
