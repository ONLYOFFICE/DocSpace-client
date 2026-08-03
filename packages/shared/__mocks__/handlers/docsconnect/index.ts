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

import { http } from "msw";

import { API_PREFIX, BASE_URL } from "../../e2e/utils";
import {
  DocsConnectPreset,
  docsConnectConfigSuccess,
  docsConnectDevPackCalcSuccess,
  docsConnectPaymentQuotaSuccess,
  docsConnectTariffSuccess,
  docsConnectTenantInfoSuccess,
  docsConnectTenantSuccess,
  docsConnectWalletBalanceSuccess,
  docsConnectWalletServicesSuccess,
} from "./data";

export * from "./data";

export const PATH_DOCS_CONNECT_TENANT = "settings/docscloud/tenant";
export const PATH_DOCS_CONNECT_CONFIG = "settings/docscloud/tenant/config";
export const PATH_DOCS_CONNECT_INFO = "settings/docscloud/tenant/info";
export const PATH_DOCS_CONNECT_TRIAL = "settings/docscloud/trial";
export const PATH_DOCS_CONNECT_REPORT = "settings/docscloud/tenant/quota/report";
export const PATH_DOCS_CONNECT_CALC_DEVPACK =
  "settings/docscloud/calculatedevpack";
export const PATH_DOCS_CONNECT_SWITCH_DEVPACK =
  "settings/docscloud/switchtodevpack";
export const PATH_WALLET_SERVICES = "portal/payment/walletservices";
export const PATH_WALLET_BALANCE = "portal/payment/customer/balance";
export const PATH_UPDATE_WALLET = "portal/payment/updatewallet";
export const PATH_PAYMENT_QUOTA = "portal/payment/quota";
export const PATH_PORTAL_TARIFF = "portal/tariff";

export const DOCS_CONNECT_REPORT_URL = "http://localhost/products/report.xlsx";

const apiUrl = (port: string, path: string) =>
  `${BASE_URL}:${port}/${API_PREFIX}/${path}`;

const jsonResponse = (response: unknown) =>
  new Response(
    JSON.stringify({ response, count: 1, status: 0, statusCode: 200 }),
  );

export const docsCloudEndpointHandlers = (
  port: string,
  preset: DocsConnectPreset,
) => [
  http.get(apiUrl(port, PATH_DOCS_CONNECT_TENANT), () =>
    jsonResponse(docsConnectTenantSuccess(preset)),
  ),
  http.get(apiUrl(port, PATH_DOCS_CONNECT_CONFIG), () =>
    jsonResponse(docsConnectConfigSuccess()),
  ),
  http.put(apiUrl(port, PATH_DOCS_CONNECT_CONFIG), () =>
    jsonResponse(docsConnectConfigSuccess()),
  ),
  http.get(apiUrl(port, PATH_DOCS_CONNECT_INFO), () =>
    jsonResponse(docsConnectTenantInfoSuccess(preset)),
  ),
  http.post(apiUrl(port, PATH_DOCS_CONNECT_TRIAL), () => jsonResponse(true)),
  http.post(apiUrl(port, PATH_DOCS_CONNECT_REPORT), () =>
    jsonResponse({
      id: "DocumentBuilderTask_1",
      error: "",
      percentage: 0,
      isCompleted: false,
      status: 0,
      resultFileId: 0,
      resultFileName: "",
      resultFileUrl: "",
    }),
  ),
  http.get(apiUrl(port, PATH_DOCS_CONNECT_REPORT), () =>
    jsonResponse({
      id: "DocumentBuilderTask_1",
      error: "",
      percentage: 100,
      isCompleted: true,
      status: 2,
      resultFileId: 26,
      resultFileName: "DocsCloud Quota Report.xlsx",
      resultFileUrl: DOCS_CONNECT_REPORT_URL,
    }),
  ),
  http.post(apiUrl(port, PATH_DOCS_CONNECT_CALC_DEVPACK), () =>
    jsonResponse(docsConnectDevPackCalcSuccess(50)),
  ),
  http.post(apiUrl(port, PATH_DOCS_CONNECT_SWITCH_DEVPACK), () =>
    jsonResponse(true),
  ),
];

export type DocsConnectHandlersOptions = {
  balance?: number;
};

export const docsConnectPaymentHandlers = (
  port: string,
  preset: DocsConnectPreset,
  options?: DocsConnectHandlersOptions,
) => [
  http.get(apiUrl(port, PATH_WALLET_SERVICES), () =>
    jsonResponse(docsConnectWalletServicesSuccess()),
  ),
  http.get(apiUrl(port, PATH_WALLET_BALANCE), () =>
    jsonResponse(docsConnectWalletBalanceSuccess(options?.balance)),
  ),
  http.get(apiUrl(port, PATH_PAYMENT_QUOTA), () =>
    new Response(JSON.stringify(docsConnectPaymentQuotaSuccess(preset))),
  ),
  http.get(apiUrl(port, PATH_PORTAL_TARIFF), () =>
    new Response(JSON.stringify(docsConnectTariffSuccess(preset))),
  ),
  http.put(apiUrl(port, PATH_UPDATE_WALLET), () => jsonResponse(true)),
];

export const docsConnectHandlers = (
  port: string,
  preset: DocsConnectPreset,
  options?: DocsConnectHandlersOptions,
) => [
  ...docsCloudEndpointHandlers(port, preset),
  ...docsConnectPaymentHandlers(port, preset, options),
];

export const docsConnectPayerHandler = (
  port: string,
  cardLinked: boolean = true,
) =>
  http.get(apiUrl(port, "portal/payment/customerinfo"), () =>
    jsonResponse({
      portalId: null,
      paymentMethodStatus: cardLinked ? 1 : 0,
      email: "test@gmail.com",
      payer: { displayName: "Test Payer", hasAvatar: false },
    }),
  );

export const docsConnectTrialActivationHandlers = (port: string) => {
  let started = false;

  return [
    http.post(apiUrl(port, PATH_DOCS_CONNECT_TRIAL), () => {
      started = true;
      return jsonResponse(true);
    }),
    http.get(apiUrl(port, PATH_DOCS_CONNECT_TENANT), () =>
      jsonResponse(started ? docsConnectTenantSuccess("trial") : null),
    ),
    http.get(apiUrl(port, PATH_DOCS_CONNECT_CONFIG), () =>
      jsonResponse(docsConnectConfigSuccess()),
    ),
    http.get(apiUrl(port, PATH_DOCS_CONNECT_INFO), () =>
      jsonResponse(docsConnectTenantInfoSuccess("trial")),
    ),
    ...docsConnectPaymentHandlers(port, "trial"),
  ];
};

export const docsConnectServerErrorHandler = (
  port: string,
  path: string,
  method: "get" | "post" | "put" = "get",
) =>
  http[method](apiUrl(port, path), () => new Response(null, { status: 500 }));

export const docsConnectDefaultHandlers = (port: string) => [
  http.get(apiUrl(port, PATH_DOCS_CONNECT_TENANT), () => jsonResponse(null)),
];
