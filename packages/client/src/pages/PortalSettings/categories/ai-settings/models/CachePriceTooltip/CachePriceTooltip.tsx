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

import { useTranslation } from "react-i18next";

import { Tooltip, usePinnedTooltip } from "@onlyoffice/apps-ui-kit/components/tooltip";
import type { TGetTooltipContent } from "@onlyoffice/apps-ui-kit/components/tooltip";
import { Text } from "@onlyoffice/apps-ui-kit/components/text";

import {
  CACHE_PRICE_TOOLTIP_ID,
  parseCachePrice,
  type TCachePriceBreakdown,
} from "./utils";

import styles from "./CachePriceTooltip.module.scss";

const PriceLine = ({ label, value }: { label: string; value: string }) => (
  <div className={styles.line}>
    <Text as="span" fontSize="12px" className={styles.label}>
      {label}
    </Text>
    <Text as="span" fontSize="12px" fontWeight={600} className={styles.value}>
      {value}
    </Text>
  </div>
);

const CachePriceContent = ({
  breakdown,
}: {
  breakdown: TCachePriceBreakdown;
}) => {
  const { t } = useTranslation(["Common"]);

  return (
    <div className={styles.content} data-testid="ai_cache_price_content">
      <div className={styles.title}>
        {t("Common:CachePricingTitle", { currency: breakdown.currency })}
      </div>
      <div className={styles.lines}>
        {breakdown.fromCache ? (
          <PriceLine
            label={t("Common:CacheRead")}
            value={breakdown.fromCache}
          />
        ) : null}
        <PriceLine
          label={t("Common:CacheWrite")}
          value={breakdown.savedToCache ?? t("Common:Free")}
        />
      </div>
      <Text fontSize="12px" className={styles.note}>
        {t("Common:CacheLifetimeDependsOnProvider")}
      </Text>
    </div>
  );
};

const TOOLTIP_TEST_ID = "ai_cache_price_tooltip";

export const CachePriceTooltip = () => {
  const pinnedProps = usePinnedTooltip(CACHE_PRICE_TOOLTIP_ID, TOOLTIP_TEST_ID);

  const getContent = ({ content }: TGetTooltipContent) => {
    const breakdown = parseCachePrice(content);

    return breakdown ? <CachePriceContent breakdown={breakdown} /> : null;
  };

  return (
    <Tooltip
      id={CACHE_PRICE_TOOLTIP_ID}
      place="bottom"
      maxWidth="320px"
      getContent={getContent}
      dataTestId={TOOLTIP_TEST_ID}
      {...pinnedProps}
    />
  );
};
