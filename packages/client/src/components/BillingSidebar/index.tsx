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
import { inject, observer } from "mobx-react";
import { useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";

import type {
  NavMenuGroup,
  NavMenuItem,
} from "@docspace/ui-kit/components/nav-menu";

import OverviewReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog-settings-integration.svg?url";
import WalletReactSvgUrl from "PUBLIC_DIR/images/icons/16/billing/wallet.react.svg?url";
import TariffReactSvgUrl from "PUBLIC_DIR/images/icons/16/billing/tariff-plan.react.svg?url";
import AddonsReactSvgUrl from "PUBLIC_DIR/images/icons/16/billing/addons.react.svg?url";
import PaymentMethodReactSvgUrl from "PUBLIC_DIR/images/icons/16/billing/payment-method.react.svg?url";
import UsageReactSvgUrl from "PUBLIC_DIR/images/icons/16/billing/usage.react.svg?url";

import AppsSidebar from "SRC_DIR/components/AppsSidebar";

type BillingSidebarProps = {
  isNotPaidPeriod: boolean;
};

const ITEMS = [
  {
    id: "billing-overview",
    path: "/billing/overview",
    icon: OverviewReactSvgUrl,
    translationKey: "Common:BillingOverview" as const,
    hideWhenNotPaid: true,
  },
  {
    id: "billing-wallet",
    path: "/billing/wallet",
    icon: WalletReactSvgUrl,
    translationKey: "Common:Wallet" as const,
  },
  {
    id: "billing-tariff-plan",
    path: "/billing/tariff-plan",
    icon: TariffReactSvgUrl,
    translationKey: "Common:TariffPlan" as const,
  },
  {
    id: "billing-addons",
    path: "/billing/addons",
    icon: AddonsReactSvgUrl,
    translationKey: "Common:Addons" as const,
    hideWhenNotPaid: true,
  },
  {
    id: "billing-payment-method",
    path: "/billing/payment-method",
    icon: PaymentMethodReactSvgUrl,
    translationKey: "Common:PaymentMethod" as const,
    hideWhenNotPaid: true,
  },
  {
    id: "billing-usage",
    path: "/billing/usage",
    icon: UsageReactSvgUrl,
    translationKey: "Common:Usage" as const,
    hideWhenNotPaid: true,
  },
];

const BillingSidebar = ({ isNotPaidPeriod }: BillingSidebarProps) => {
  const { t } = useTranslation(["Common"]);
  const location = useLocation();
  const navigate = useNavigate();

  const visibleItems = ITEMS.filter(
    (item) => !item.hideWhenNotPaid || !isNotPaidPeriod,
  );

  const activeId = React.useMemo(() => {
    const { pathname } = location;
    const found = visibleItems.find(
      (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
    );
    return found?.id;
  }, [location, visibleItems]);

  const groups = React.useMemo<NavMenuGroup[]>(() => {
    const items: NavMenuItem[] = visibleItems.map((item) => ({
      id: item.id,
      // biome-ignore lint/plugin/no-dynamic-i18n-key: literals captured by locales scanner
      label: t(item.translationKey),
      icon: item.icon,
      onClick: () => navigate(item.path),
    }));
    return [{ id: "billing", items }];
  }, [t, navigate, visibleItems]);

  const onBack = isNotPaidPeriod
    ? () => navigate("/portal-settings/backup/data-backup")
    : undefined;
  const backLabel = isNotPaidPeriod ? t("Common:Settings") : undefined;

  return (
    <AppsSidebar
      groups={groups}
      activeId={activeId}
      variant="secondary"
      onBack={onBack}
      backLabel={backLabel}
    />
  );
};

export default inject(({ currentTariffStatusStore }: TStore) => ({
  isNotPaidPeriod: currentTariffStatusStore?.isNotPaidPeriod ?? false,
}))(observer(BillingSidebar));

