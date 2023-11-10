import moment from "moment";

export const convertTime = (date, locale) => {
  return moment(date).locale(locale).format("L, LTS");
};
