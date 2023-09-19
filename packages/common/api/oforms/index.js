import axios from "axios";
import { request } from "../oformClient";

export function getOforms(url) {
  return axios.get(url);
}

export const getCategoryById = async (categorizeBy, id) => {
  const options = { method: "get", url: `/${categorizeBy}/${id}` };
  return request(options).then((res) => {
    return res;
  });
};

export const getCategoriesByBranch = async (locale = "en") => {
  const options = { method: "get", url: `/categories?locale=${locale}` };
  return request(options).then((res) => {
    return res;
  });
};

export const getCategoriesByType = async (locale = "en") => {
  const options = { method: "get", url: `/types?locale=${locale}` };
  return request(options).then((res) => {
    return res;
  });
};

export const getPopularCategories = async (locale = "en") => {
  const options = { method: "get", url: `/compilations?locale=${locale}` };
  return request(options).then((res) => {
    return res;
  });
};

export function submitToGallery(url, file, formName, language, signal) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("formName", formName);
  formData.append("language", language);

  return axios.post(url, formData, { signal });
}
