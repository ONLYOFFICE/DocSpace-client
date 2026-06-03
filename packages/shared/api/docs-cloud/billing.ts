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

// TODO: Remove all FAKE_* constants and uncomment the request() calls when the API is ready.
// import { request } from "../client";
import type { TBillingPlan, TBillingPrice } from "./types";

const FAKE_BILLING_PLAN: TBillingPlan = {
  productId: "docs-cloud-annual-100",
  name: "Business",
  period: "annual",
  usersCount: 100,
  isTrial: false,
  isActive: true,
  expirationDate: "2027-01-01T00:00:00",
};

const FAKE_BILLING_PRICE: TBillingPrice = {
  productId: "docs-cloud-annual-100",
  pricePerUser: 8,
  totalPrice: 800,
  period: "annual",
  currency: "USD",
  currencySymbol: "$",
};

export async function getBillingPlan(): Promise<TBillingPlan> {
  // TODO: return (await request<TBillingPlan>({ method: "get", url: "/billing/plan" })) as TBillingPlan;
  return { ...FAKE_BILLING_PLAN };
}

export async function getTenantPrice(
  _productId: string,
): Promise<TBillingPrice> {
  // TODO: return (await request<TBillingPrice>({ method: "get", url: `/billing/${encodeURIComponent(productId)}/price` })) as TBillingPrice;
  return { ...FAKE_BILLING_PRICE };
}

export async function changeTenantQuantity(_quantity: number): Promise<void> {
  // TODO: await request({ method: "put", url: "/billing/quantity", data: { quantity } });
}

export async function getAccountLink(): Promise<string> {
  // TODO: return (await request<string>({ method: "get", url: "/billing/account" })) as string;
  return "https://billing.example.com/account";
}

export async function getPaymentLink(
  _devpack: boolean,
  _quantity: number,
): Promise<string> {
  // TODO: return (await request<string>({ method: "get", url: "/billing/link", params: { devpack, quantity } })) as string;
  return "https://billing.example.com/payment";
}

