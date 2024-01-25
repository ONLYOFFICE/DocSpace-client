import { AxiosRequestConfig } from "axios";
import { request } from "../client";
import { TGetAllPortals, TGetDomainName } from "./types";

const baseURL = "/apisystem";

export const deletePortal = async (data) => {
  const options = {
    baseURL,
    method: "delete",
    url: `/portal/remove`,
    params: data,
  };

  const res = await request(options);

  return res;
};

export const getPortalName = async () => {
  const res = await request({
    baseURL,
    method: "get",
    url: `/settings/get?tenantId=-1&key=portalName`,
  });

  return res;
};

export const getDomainName = async () => {
  const options: AxiosRequestConfig = {
    baseURL,
    method: "get",
    url: `/settings/get?tenantId=-1&key=baseDomain`,
  };
  const res = (await request(options)) as TGetDomainName;

  return res;
};

export const setDomainName = async (domainName) => {
  const data = {
    key: "BaseDomain",
    tenantId: -1,
    value: domainName,
  };

  const res = await request({
    baseURL,
    method: "post",
    url: `/settings/save`,
    data,
  });

  return res;
};

export const setPortalName = async (portalName) => {
  const data = {
    Alias: portalName,
  };

  const res = await request({
    method: "put",
    url: `portal/portalrename`,
    data,
  });

  return res;
};

export const getPortalStatus = async (portalName) => {
  const data = {
    portalName,
  };

  const res = await request({
    baseURL,
    method: "put",
    url: `/portal/status`,
    data,
  });

  return res;
};

export const createNewPortal = async (data) => {
  const res = await request({
    baseURL,
    method: "post",
    url: `/portal/register`,
    data,
  });

  return res;
};

export const getAllPortals = async () => {
  const res = (await request({
    baseURL,
    method: "get",
    url: `/portal/get?statistics=true`,
  })) as TGetAllPortals;
  return res;
};

export const checkDomain = async (domain: string) => {
  const data = {
    HostName: domain,
  };
  const res = await request({
    baseURL,
    method: "post",
    url: `/settings/checkdomain`,
    data,
  });
  return res;
};
