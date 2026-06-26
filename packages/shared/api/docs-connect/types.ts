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

export type TDocsConnectTenant = {
  address?: string;
  modifiedDate?: string;
  endDate?: string;
  payment?: { quantity?: number; currency?: string };
};

export type TDocsConnectConfig = {
  tenantName: string;
  security: { secret: string; header: string };
  server: { isAnonymousSupport: boolean };
};

export type TDocsConnectStat = {
  active: number;
  internal: number;
  external: number;
  remaining: number;
  criticalRemaining: boolean;
};

export type TDocsConnectTenantInfo = {
  license: { valid: string; trial: boolean; buildDate: string };
  server: { version: string; packageType: string; date: string };
  usersLimit: { edit: number; view: number };
  stats: {
    periodDay: number;
    editor: TDocsConnectStat;
    viewer: TDocsConnectStat;
  };
};

export type TDocsConnectPrices = {
  pricePerUser: number;
  devPackPrice: number;
};

export type TDocsConnectWallet = {
  availableCredits: number;
  currency: string;
};

export type TDocsConnectInfo = {
  tenant: TDocsConnectTenant;
  config: TDocsConnectConfig;
  tenantInfo: TDocsConnectTenantInfo;
  prices: TDocsConnectPrices | null;
  wallet: TDocsConnectWallet | null;
  devPackEnabled: boolean;
};

export type TDocsConnectConfigUpdate = {
  tenantName: string;
  security: {
    secret: string;
    header: string;
  };
  server: {
    isAnonymousSupport: boolean;
  };
};
