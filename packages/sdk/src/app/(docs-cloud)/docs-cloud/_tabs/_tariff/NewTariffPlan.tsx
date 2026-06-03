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

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import AppLoader from "@docspace/ui-kit/components/app-loader";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Checkbox } from "@docspace/ui-kit/components/checkbox";
import { Text } from "@docspace/ui-kit/components/text";

import {
  getBillingPlan,
  getPaymentLink,
  getTenantPrice,
} from "@docspace/shared/api/docs-cloud";
import type {
  TBillingPrice,
  TTenantInfo,
} from "@docspace/shared/api/docs-cloud";

import { PriceDisplay } from "./PriceDisplay";
import { UserCountSelector } from "./UserCountSelector";
import styles from "./NewTariffPlan.module.scss";

type NewTariffPlanProps = {
  info: TTenantInfo;
};

export function NewTariffPlan({ info }: NewTariffPlanProps) {
  const { t } = useTranslation(["DocsCloud"]);

  const [isLoading, setIsLoading] = useState(true);
  const [pricing, setPricing] = useState<TBillingPrice | null>(null);
  const [newCount, setNewCount] = useState(
    Math.max(1, info.activeEditorsCount),
  );
  const [hasDevPack, setHasDevPack] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    getBillingPlan()
      .then(async (plan) => {
        const price = await getTenantPrice(plan.productId);
        setPricing(price);
        setNewCount((prev) => Math.max(prev, price.pricePerUser > 0 ? 1 : 1));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const daysRemaining = useMemo(() => {
    if (!info.licenseDate) return 0;
    const end = new Date(info.licenseDate);
    const diff = end.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [info.licenseDate]);

  if (isLoading) return <AppLoader />;
  if (!pricing) return null;

  const totalPrice = newCount * pricing.pricePerUser;
  const activeCount = info.activeEditorsCount;
  const willLoseAccess = newCount < activeCount;

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const url = await getPaymentLink(hasDevPack, newCount);
      window.open(url, "_blank", "noopener,noreferrer");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      {info.isTrial && (
        <div className={styles.banner}>
          <span className={styles.bannerStrong}>
            {t("DocsCloud:TrialExpiresMessage", { days: daysRemaining })}
          </span>{" "}
          {t("DocsCloud:TrialPaymentMessage")}
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Text fontSize="18px" fontWeight={700}>
            Docs Cloud
          </Text>
        </div>

        <UserCountSelector
          count={newCount}
          onCountChange={setNewCount}
          min={1}
          max={999}
        />

        <PriceDisplay
          totalPrice={totalPrice}
          pricePerUser={pricing.pricePerUser}
          currencySymbol={pricing.currencySymbol}
        />

        <div className={styles.devPackRow}>
          <Checkbox
            id="dev-pack"
            isChecked={hasDevPack}
            onChange={() => setHasDevPack((v) => !v)}
            label={t("DocsCloud:DeveloperPack")}
          />
        </div>

        {willLoseAccess && (
          <div className={styles.warningBox}>
            {t("DocsCloud:UsersLosingAccess", {
              count: activeCount - newCount,
            })}
          </div>
        )}

        <div className={styles.actions}>
          <Button
            label={t("DocsCloud:SubscribeNow")}
            size={ButtonSize.normal}
            primary
            isLoading={isSubscribing}
            onClick={handleSubscribe}
          />
        </div>
      </div>
    </div>
  );
}
