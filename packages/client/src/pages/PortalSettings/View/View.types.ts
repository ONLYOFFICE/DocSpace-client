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

export type TView =
  | "customization"
  | "security"
  | "backup"
  | "restore"
  | "integration"
  | "data-import"
  | "management"
  | "delete-data"
  | "payments"
  | "bonus"
  | "services"
  | "ai-settings"
  | "ai-services"
  | "backup-service"
  | "disk-storage"
  | "";

export type ViewProps = {
  setIsPortalSettingsLoading: TStore["clientLoadingStore"]["setIsPortalSettingsLoading"];
  loadBaseInfo: (page: string) => Promise<void>;
  isMobileView: boolean;
  settingsStore: TStore["settingsStore"];
  standalone: boolean;
  tfaStore: TStore["tfaStore"];
  backupStore: TStore["backup"];
  ssoFormStore: TStore["ssoStore"];
  init: TStore["storageManagement"]["init"];
  standaloneInit: TStore["paymentStore"]["standaloneInit"];
  setup: TStore["setup"];
  authStore: TStore["authStore"];
  currentQuotaStore: TStore["currentQuotaStore"];
  pluginStore: TStore["pluginStore"];
  filesSettingsStore: TStore["filesSettingsStore"];
  webhooksStore: TStore["webhooksStore"];
  oauthStore: TStore["oauthStore"];
  brandingStore: TStore["brandingStore"];
  importAccountsStore: TStore["importAccountsStore"];
  ldapStore: TStore["ldapStore"];
  common: TStore["common"];
  paymentStore: TStore["paymentStore"];
  servicesStore: TStore["servicesStore"];
  currentTariffStatusStore: TStore["currentTariffStatusStore"];
  defaultTemplatesStore: TStore["defaultTemplatesStore"];
  clearAbortControllerArr: TStore["settingsStore"]["clearAbortControllerArr"];
  fetchAIProviders: TStore["aiSettingsStore"]["fetchAIProviders"];
  fetchMCPServers: TStore["aiSettingsStore"]["fetchMCPServers"];
  fetchWebSearch: TStore["aiSettingsStore"]["fetchWebSearch"];
  fetchKnowledge: TStore["aiSettingsStore"]["fetchKnowledge"];
  initDefaultProvider: TStore["aiSettingsStore"]["initDefaultProvider"];
};
