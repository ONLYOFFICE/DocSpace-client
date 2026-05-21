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

"use client";

import React from "react";
import { useTranslation } from "react-i18next";

import AiPage from "@docspace/ui-kit/billing/services/pages/ai-tools/AiPage";
import { PaymentMethod } from "@docspace/ui-kit/billing";
import { getBrandName } from "@docspace/shared/constants/brands";

import AiIcon from "@docspace/ui-kit/assets/icons/16/ai-agents.svg";
import CardIcon from "@docspace/ui-kit/assets/icons/16/card.react.svg";

import { BillingCards, type BillingCardTab } from "@/components/BillingCards";
import cardStyles from "@/components/BillingCards/BillingCards.module.scss";

import styles from "./SettingsPanel.module.scss";

type DashboardTab = "ai" | "payment-method";

type AiBillingDashboardProps = {
  integrationUrl?: string;
};

const TAB_DEFS: {
  id: DashboardTab;
  titleKey: string;
  tKey: string;
  iconClass: string;
  icon: React.ReactNode;
  nativeIcon?: boolean;
}[] = [
  {
    id: "ai",
    titleKey: "OrganizationAI",
    tKey: "BillingAICardDesc",
    iconClass: cardStyles.billingIconAi,
    icon: <AiIcon />,
  },
  {
    id: "payment-method",
    titleKey: "PaymentMethod",
    tKey: "BillingPaymentMethodCardDesc",
    iconClass: cardStyles.billingIconPayment,
    icon: <CardIcon />,
    nativeIcon: true,
  },
];

const AiBillingDashboard = ({ integrationUrl }: AiBillingDashboardProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<DashboardTab>("ai");

  const tabs: BillingCardTab[] = TAB_DEFS.map((d) => ({
    id: d.id,
    // biome-ignore lint/plugin/no-dynamic-i18n-key: titleKey/tKey literals defined on TAB_DEFS entries are captured by the locales scanner
    title: t(d.titleKey, {
      productName: getBrandName("ProductName"),
      organizationName: getBrandName("OrganizationName"),
    }),
    // biome-ignore lint/plugin/no-dynamic-i18n-key: see above
    description: t(d.tKey),
    iconClass: d.iconClass,
    icon: d.icon,
    nativeIcon: d.nativeIcon,
  }));

  return (
    <>
      <BillingCards
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as DashboardTab)}
      />

      <div key={activeTab} className={styles.billingContent}>
        {activeTab === "ai" ? (
          <AiPage integrationUrl={integrationUrl} withoutWallet simpleTopUp />
        ) : null}
        {activeTab === "payment-method" ? (
          <PaymentMethod integrationUrl={integrationUrl} />
        ) : null}
      </div>
    </>
  );
};

export default AiBillingDashboard;

