import axios from "axios";

export function getOforms(url) {
  return axios.get(url);
}

export const getCategoryById = async (url, categorizeBy, id, locale) => {
  const res = await axios.get(
    `${url}/${categorizeBy}/${id}?populate=*&locale=${locale}`
  );
  return res?.data?.data;
};

export const getCategoryList = async (url, locale = "en") => {
  const res = await axios.get(`${url}?populate=*&locale=${locale}`);
  return res?.data?.data;
};

export const getCategories = async (url, locale = "en") => {
  const res = await axios.get(`${url}?populate=*&locale=${locale}`);
  return res?.data?.data;
};

export const getCategoriesByBranch = async (url, locale = "en") => {
  const res = await axios.get(`${url}?populate=*&locale=${locale}`);
  return res?.data?.data;
};

export const getCategoriesByType = async (url, locale = "en") => {
  const res = await axios.get(`${url}?populate=*&locale=${locale}`);
  return res?.data?.data;
};

export const getPopularCategories = async (url, locale = "en") => {
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
