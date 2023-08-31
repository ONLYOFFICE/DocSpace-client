import { request } from "../oformClient";

export const getCategoryById = async (categorizeBy, id) => {
  console.log(`/${categorizeBy}/${id}`);
  const options = { method: "get", url: `/${categorizeBy}/${id}` };
  return request(options).then((res) => {
    console.log(res);
    return res;
  });
};

export const getCategoriesByBranch = async () => {
  const options = { method: "get", url: `/categories` };
  return request(options).then((res) => {
    console.log(res);
    return res;
  });
};

export const getCategoriesByType = async () => {
  const options = { method: "get", url: `/types` };
  return request(options).then((res) => {
    console.log(res);
    return res;
  });
};

export const getPopularCategories = async () => {
  const options = { method: "get", url: `/compilations` };
  return request(options).then((res) => {
    console.log(res);
    return res;
  });
};
