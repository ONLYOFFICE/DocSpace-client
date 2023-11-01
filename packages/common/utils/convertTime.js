import moment from "moment";

export const convertTime = (date, locale) => {
  console.log(date);
  return moment(date).locale(locale).format("L, LTS");
};
