import moment from "moment-timezone";

export const convertTime = (date, locale) => {
  return moment(date)
    .tz(window.timezone)
    .locale(locale)
    .format("L, LTS");
};
