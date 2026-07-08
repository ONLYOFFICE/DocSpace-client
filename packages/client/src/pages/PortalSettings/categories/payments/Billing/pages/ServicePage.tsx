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

import { inject, observer } from "mobx-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { default as AiPage } from "@docspace/ui-kit/billing/services/pages/ai-tools/AiPage";
import { default as AiSearchPage } from "@docspace/ui-kit/billing/services/pages/ai-search/AiSearchPage";
import { default as BackupPage } from "@docspace/ui-kit/billing/services/pages/backup/BackupPage";
import { default as AdditionalStoragePage } from "@docspace/ui-kit/billing/services/pages/additional-storage/AdditionalStoragePage";

import config from "PACKAGE_FILE";

import DocsConnectPage from "../../SaaS/DocsConnectPage";

interface ServicePageProps {
  getAIConfig?: () => Promise<void>;
  fetchPayerInfo?: () => Promise<void>;
}

// Renders a single add-on service detail page based on the current route.
// The BillingRoot provider is supplied by the parent Billing wrapper, so this
// page must not create its own.
const ServicePage = (props: ServicePageProps) => {
  const { getAIConfig, fetchPayerInfo } = props;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayerInfo?.();
  }, [fetchPayerInfo]);

  const navigateToRoute = (route: string) =>
    navigate(
      combineUrl(window.ClientConfig?.proxy?.url, config.homepage, route),
    );

  const onViewUsage = () => navigateToRoute("/billing/usage");

  const { pathname } = location;

  return (
    <>
      {pathname.includes("ai-services") ? (
        <AiPage
          getAIConfig={getAIConfig}
          withBottomMargin
          onViewMore={onViewUsage}
          onOpenSupportedModels={() =>
            navigateToRoute("/portal-settings/ai-settings/ai-models")
          }
        />
      ) : null}
      {pathname.includes("ai-search") ? (
        <AiSearchPage
          getAIConfig={getAIConfig}
          withBottomMargin
          onViewMore={onViewUsage}
        />
      ) : null}
      {pathname.includes("backup") ? (
        <BackupPage withBottomMargin onViewMore={onViewUsage} />
      ) : null}
      {pathname.includes("disk-storage") ? (
        <AdditionalStoragePage withBottomMargin />
      ) : null}
      {pathname.includes("docs-connect") ? <DocsConnectPage /> : null}
    </>
  );
};

export const Component = inject(
  ({ settingsStore, currentTariffStatusStore }: TStore) => {
    const { getAIConfig } = settingsStore;
    const { fetchPayerInfo } = currentTariffStatusStore;

    return {
      getAIConfig,
      fetchPayerInfo,
    };
  },
)(observer(ServicePage));

export default Component;
