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

import React from "react";
import { useNavigate } from "react-router";

import { AI_ENUM } from "@docspace/ui-kit/billing/constants";

import AISettingsStore from "SRC_DIR/store/portal-settings/AISettingsStore";
import PaymentStore from "SRC_DIR/store/PaymentStore";

type UseAiSettingsProps = {
  standalone?: boolean;
  fetchAIProviders?: AISettingsStore["fetchAIProviders"];
  fetchMCPServers?: AISettingsStore["fetchMCPServers"];
  fetchWebSearch?: AISettingsStore["fetchWebSearch"];
  fetchKnowledge?: AISettingsStore["fetchKnowledge"];
  initDefaultProvider?: AISettingsStore["initDefaultProvider"];
  fetchAiPrices?: () => Promise<void>;
  fetchAiModelRestrictions?: () => Promise<void>;
  handleServiceQuota?: PaymentStore["handleServiceQuota"];
};

const useAISettings = ({
  fetchAIProviders,
  initDefaultProvider,
  fetchMCPServers,
  fetchWebSearch,
  fetchKnowledge,
  fetchAiPrices,
  fetchAiModelRestrictions,
  handleServiceQuota,
  standalone,
}: UseAiSettingsProps) => {
  const navigate = useNavigate();

  const initAIProviders = React.useCallback(async () => {
    await fetchAIProviders?.();
    await initDefaultProvider?.();
  }, [fetchAIProviders, initDefaultProvider]);

  const initAiModels = React.useCallback(async () => {
    await Promise.all([fetchAiPrices?.(), fetchAiModelRestrictions?.()]);
  }, [fetchAiPrices, fetchAiModelRestrictions]);

  const initMCPServers = React.useCallback(async () => {
    await Promise.all([fetchMCPServers?.(), fetchAIProviders?.()]);
  }, [fetchMCPServers, fetchAIProviders]);

  const initWebSearch = React.useCallback(async () => {
    await fetchAiPrices?.();
  }, [fetchWebSearch, fetchAIProviders, fetchAiPrices]);

  const initKnowledge = React.useCallback(async () => {
    await Promise.all([fetchAiPrices?.()]);
  }, [fetchKnowledge, fetchAIProviders, fetchAiPrices]);

  const getAiSettingsInitialValue = React.useCallback(async () => {
    const isModels = window.location.pathname.includes("models");
    const isProviders = window.location.pathname.includes("providers");
    const isServers = window.location.pathname.includes("servers");
    const isSearch = window.location.pathname.includes("search");
    const isKnowledge = window.location.pathname.includes("knowledge");

    if (!standalone && !isServers) {
      navigate("/portal-settings/ai-settings/servers");
      await initMCPServers();

      return;
    }

    await handleServiceQuota?.(AI_ENUM);

    if (isModels) await initAiModels();
    if (isProviders) await initAIProviders();
    if (isServers) await initMCPServers();
    if (isSearch) await initWebSearch();
    if (isKnowledge) await initKnowledge();
  }, [
    initAiModels,
    initAIProviders,
    initMCPServers,
    initWebSearch,
    initKnowledge,
    handleServiceQuota,
    navigate,
  ]);

  return {
    initAiModels,
    initAIProviders,
    initMCPServers,
    initWebSearch,
    initKnowledge,
    getAiSettingsInitialValue,
  };
};

export default useAISettings;

