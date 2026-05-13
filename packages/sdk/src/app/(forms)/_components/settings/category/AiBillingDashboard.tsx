// (c) Copyright Ascensio System SIA 2009-2026
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

