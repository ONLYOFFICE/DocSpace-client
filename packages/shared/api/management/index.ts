// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

// @ts-nocheck

import { AxiosRequestConfig } from "axios";
import { request } from "../client";
import { TGetAllPortals, TGetDomainName, TRemovedPortal } from "./types";

const baseURL = "/apisystem";

export const deletePortal = async (data) => {
  const options = {
    baseURL,
    method: "delete",
    url: `/portal/remove`,
    params: data,
  };

  const res = await request(options);

  return res as TRemovedPortal;
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

export const getAvailablePortals = async (data: {
  Email: string;
  PasswordHash: string;
  recaptchaResponse?: string | null;
  recaptchaType?: number;
}) => {
  const res = (await request({
    baseURL,
    method: "post",
    url: `/portal/signin`,
    data,
    skipUnauthorized: true,
  })) as { tenants: { portalLink: string; portalName: string }[] };

  return res.tenants;
};

export async function createLicenseQuotaReport() {
  const res = (await request({
    baseURL,
    method: "post",
    url: "/portal/licensequota/report",
    params: {
      useCache: false,
    },
  })) as { result: string };

  return res.result;
}
