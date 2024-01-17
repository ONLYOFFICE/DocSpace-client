import moment from "moment-timezone";

export const convertTime = (date: moment.Moment, locale: string) => {
  return moment(date)
    .tz(window.timezone)
    .locale(locale || "")
    .format("L, LTS");
};
