import axios from "axios";

export function getOforms(url) {
  return axios.get(url);
}

export const getOformLocales = async (url) => {
  const res = await axios.get(url);
  return res?.data;
};

export const getCategoryById = async (url, categorizeBy, id, locale) => {
  const res = await axios.get(
    `${url}/${categorizeBy}/${id}?populate=*&locale=${locale}`,
  );
  return res?.data?.data;
};

export const getCategoryTypes = async (url, locale = "en") => {
  const res = await axios.get(`${url}?populate=*&locale=${locale}`);
  return res?.data?.data;
};

export const getCategoriesOfCategoryType = async (url, locale = "en") => {
  const res = await axios.get(`${url}?populate=*&locale=${locale}`);
  return res?.data?.data;
};

export function submitToGallery(url, file, formName, language, signal) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("formName", formName);
  formData.append("language", language);

  return axios.post(url, formData, { signal });
}
