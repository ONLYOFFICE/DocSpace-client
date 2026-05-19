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
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router";

import { BillingRoot } from "@docspace/ui-kit/billing";
import { default as AiPage } from "@docspace/ui-kit/billing/services/pages/ai-tools/AiPage";
import { default as BackupPage } from "@docspace/ui-kit/billing/services/pages/backup/BackupPage";
import { default as AdditionalStoragePage } from "@docspace/ui-kit/billing/services/pages/additional-storage/AdditionalStoragePage";
import type { TPaymentUser } from "@docspace/ui-kit/billing/types";
import { PAYMENT_ROUTES } from "./utils";

interface ServicesPageProps {
  language?: string;
  logoText?: string;
  user?: TPaymentUser;
  openOnNewPage?: boolean;
  getAIConfig?: () => Promise<void>;
  fetchPayerInfo?: () => Promise<void>;
}

const ServicesPage = (props: ServicesPageProps) => {
  const {
    language = "en",
    logoText,
    user,
    openOnNewPage,
    getAIConfig,
    fetchPayerInfo,
  } = props;
  const location = useLocation();
  useEffect(() => {
    fetchPayerInfo?.();
  }, [fetchPayerInfo]);

  const paymentConfig = useMemo(
    () => ({
      language,
      logoText,
      user,
      openOnNewPage,
      routes: PAYMENT_ROUTES,
    }),
    [language, logoText, user, openOnNewPage],
  );

  const pathname = location.pathname;

  return (
    <BillingRoot config={paymentConfig}>
      {pathname.includes("ai-services") ? (
        <AiPage getAIConfig={getAIConfig} withBottomMargin={true}/>
      ) : null}
      {pathname.includes("backup") ? <BackupPage withBottomMargin={true}/> : null}
      {pathname.includes("disk-storage") ? <AdditionalStoragePage withBottomMargin={true}/> : null}
    </BillingRoot>
  );
};

export const Component = inject(
  ({
    settingsStore,
    authStore,
    userStore,
    currentTariffStatusStore,
    filesSettingsStore,
  }: TStore) => {
    const { language } = authStore;
    const { user } = userStore;
    const { logoText, getAIConfig } = settingsStore;
    const { fetchPayerInfo } = currentTariffStatusStore;
    const { openOnNewPage } = filesSettingsStore;

    return {
      language,
      logoText,
      getAIConfig,
      fetchPayerInfo,
      openOnNewPage,
      user: user
        ? {
            id: user.id,
            email: user.email,
            isOwner: user.isOwner,
          }
        : undefined,
    };
  },
)(observer(ServicesPage));

