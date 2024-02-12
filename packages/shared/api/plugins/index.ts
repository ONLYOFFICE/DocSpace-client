import { request } from "../client";
import { TAPIPlugin } from "./types";

export const getPlugins = async (enabled: null | boolean) => {
  const url = enabled
    ? `/settings/webplugins?enabled=${enabled}`
    : `/settings/webplugins`;

  const res = (await request({
    method: "GET",
    url,
  })) as TAPIPlugin[];

  return res;
};

export const addPlugin = async (data: FormData) => {
  const res = (await request({
    method: "POST",
    url: `/settings/webplugins`,
    data,
  })) as TAPIPlugin;

  return res;
};

export const getPlugin = async (name: string) => {
  return request({
    method: "GET",
    url: `/settings/webplugins/${name}`,
  });
};

export const updatePlugin = async (
  name: string,
  enabled: boolean,
  settings: unknown = "",
) => {
  return request({
    method: "PUT",
    url: `/settings/webplugins/${name}`,
    data: { enabled, settings },
  });
};

export const deletePlugin = async (name: string) => {
  request({
    method: "DELETE",
    url: `/settings/webplugins/${name}`,
  });
};
