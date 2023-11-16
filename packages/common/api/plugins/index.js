import { request } from "../client";

export const getPlugins = async (enabled) => {
  const url = enabled
    ? `/settings/webplugins?enabled=${enabled}`
    : `/settings/webplugins`;

  return request({
    method: "GET",
    url,
  });
};

export const addPlugin = async (data) => {
  return request({
    method: "POST",
    url: `/settings/webplugins`,
    data,
  });
};

export const getPlugin = async (name) => {
  return request({
    method: "GET",
    url: `/settings/webplugins/${name}`,
  });
};

export const activatePlugin = async (name, enabled, settings = "") => {
  return request({
    method: "PUT",
    url: `/settings/webplugins/${name}`,
    data: { enabled, settings },
  });
};

export const deletePlugin = async (name) => {
  request({
    method: "DELETE",
    url: `/settings/webplugins/${name}`,
  });
};
