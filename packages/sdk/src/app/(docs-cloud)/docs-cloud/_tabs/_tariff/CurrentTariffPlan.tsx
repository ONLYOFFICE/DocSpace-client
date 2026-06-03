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

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import AppLoader from "@docspace/ui-kit/components/app-loader";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Text } from "@docspace/ui-kit/components/text";

import {
  changeTenantQuantity,
  getAccountLink,
  getBillingPlan,
  getTenantPrice,
} from "@docspace/shared/api/docs-cloud";
import type {
  TBillingPlan,
  TBillingPrice,
  TTenantInfo,
} from "@docspace/shared/api/docs-cloud";

import { PriceDisplay } from "./PriceDisplay";
import { UserCountSelector } from "./UserCountSelector";
import styles from "./CurrentTariffPlan.module.scss";

type CurrentTariffPlanProps = {
  info: TTenantInfo;
};

export function CurrentTariffPlan({ info }: CurrentTariffPlanProps) {
  const { t } = useTranslation(["DocsCloud"]);

  const [isLoading, setIsLoading] = useState(true);
  const [plan, setPlan] = useState<TBillingPlan | null>(null);
  const [pricing, setPricing] = useState<TBillingPrice | null>(null);
  const [newCount, setNewCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getBillingPlan()
      .then(async (p) => {
        setPlan(p);
        setNewCount(p.usersCount);
        const price = await getTenantPrice(p.productId);
        setPricing(price);
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <AppLoader />;
  if (!plan || !pricing) return null;

  const activeCount = info.activeEditorsCount;
  const isAnnual = plan.period === "annual";
  const totalPrice = newCount * pricing.pricePerUser;
  const hasChanges = newCount !== plan.usersCount;
  const isDecreasing = newCount < plan.usersCount;
  const willLoseAccess = isDecreasing && newCount < activeCount;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await changeTenantQuantity(newCount);
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenAccount = async () => {
    const url = await getAccountLink();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return iso;
    }
  };

  return (
    <div className={styles.wrapper}>
      <Text className={styles.title} fontSize="18px" fontWeight={700}>
        {t("DocsCloud:CurrentPlan")}
      </Text>
      <Text className={styles.subtitle} fontSize="14px">
        {t("DocsCloud:ReviewChangesSubtitle")}
      </Text>

      <div className={styles.grid}>
        <div className={styles.card}>
          <Text className={styles.cardTitle} fontSize="14px" fontWeight={600}>
            {t("DocsCloud:CurrentPlan")}
          </Text>
          <div className={styles.row}>
            <span className={styles.rowLabel}>
              {t("DocsCloud:ActiveUntil")}
            </span>
            <span>{formatDate(plan.expirationDate)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>{t("UserLimit")}</span>
            <span>{plan.usersCount}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>
              {t("DocsCloud:ActiveUsers")}
            </span>
            <span>{activeCount}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>
              {isAnnual
                ? t("DocsCloud:PricePerYear")
                : t("DocsCloud:PricePerMonth")}
            </span>
            <span>
              {pricing.currencySymbol}
              {pricing.totalPrice}
            </span>
          </div>
        </div>

        <div className={styles.card}>
          <Text className={styles.cardTitle} fontSize="14px" fontWeight={600}>
            {t("DocsCloud:ManageSubscription")}
          </Text>
          <UserCountSelector
            count={newCount}
            onCountChange={setNewCount}
            min={Math.max(1, activeCount)}
            max={999}
          />
          <PriceDisplay
            totalPrice={totalPrice}
            pricePerUser={pricing.pricePerUser}
            currencySymbol={pricing.currencySymbol}
            isAnnual={isAnnual}
          />
          {willLoseAccess && (
            <div className={styles.warning}>
              {t("DocsCloud:UsersLosingAccess", {
                count: activeCount - newCount,
              })}
            </div>
          )}
          <div className={styles.actions}>
            <Button
              label={t("Common:SaveButton")}
              size={ButtonSize.normal}
              primary
              isLoading={isSaving}
              isDisabled={!hasChanges}
              onClick={handleSave}
            />
            <button className={styles.accountLink} onClick={handleOpenAccount}>
              {t("DocsCloud:ManageSubscription")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
