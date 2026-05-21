/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

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
	Email?: string;
	PasswordHash?: string;
	recaptchaResponse?: string | null;
	recaptchaType?: number;
	ThirdPartyProfile?: string;
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
