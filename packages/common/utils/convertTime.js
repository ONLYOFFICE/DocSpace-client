export const convertTime = (date, locale) => {
  return new Date(date).toLocaleString(locale);
};
