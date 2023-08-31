import { request } from "../oformClient";

export const getCategoryById = async (categorizeBy, id) => {
  console.log(`/${categorizeBy}/${id}`);
  const options = { method: "get", url: `/${categorizeBy}/${id}` };
  return request(options).then((res) => {
    console.log(res);
    return res;
  });
};

export const getCategoriesByBranch = async (locale = "en") => {
  const options = { method: "get", url: `/categories?locale=${locale}` };
  return request(options).then((res) => {
    console.log(res);
    return res;
  });
};

export const getCategoriesByType = async (locale = "en") => {
  const options = { method: "get", url: `/types?locale=${locale}` };
  return request(options).then((res) => {
    console.log(res);
    return res;
  });
};

export const getPopularCategories = async (locale = "en") => {
  const options = { method: "get", url: `/compilations?locale=${locale}` };
  return request(options).then((res) => {
    console.log(res);
    return res;
  });
};
