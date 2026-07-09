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

import { Text } from "@docspace/ui-kit/components/text";
import { ProgressBar } from "@docspace/ui-kit/components/progress-bar";

import type { TDocsConnectStat } from "@docspace/shared/api/docs-connect/types";
import type { TTranslation } from "@docspace/shared/types";

import StatColumn from "./StatColumn";

import styles from "../TenantPanel.module.scss";

type UsageLevel = "positive" | "negative";

const usageLevelClass: Record<UsageLevel, string> = {
  positive: styles.usagePositive,
  negative: styles.usageNegative,
};

const getUsageLevel = (usage: TDocsConnectStat): UsageLevel =>
  usage.criticalRemaining ? "negative" : "positive";

const UsageBlock = ({
  title,
  subtitle,
  usageLabel,
  usage,
  limit,
  t,
}: {
  title: string;
  subtitle: string;
  usageLabel: string;
  usage: TDocsConnectStat;
  limit: number;
  t: TTranslation;
}) => {
  const percent = limit > 0 ? (usage.active / limit) * 100 : 0;
  const level = getUsageLevel(usage);

  return (
    <div className={`${styles.usageBlock} ${usageLevelClass[level]}`}>
      <Text fontSize="16px" fontWeight={700}>
        {title}
      </Text>
      <Text fontSize="13px" className={styles.muted}>
        {subtitle}
      </Text>
      <div className={styles.usageBarRow}>
        <Text fontSize="14px" fontWeight={600}>
          {usageLabel}
        </Text>
        <Text fontSize="13px" fontWeight={600}>
          {`${usage.active} / ${limit}`}
        </Text>
      </div>
      <ProgressBar percent={percent} className={styles.usageProgress} />
      <div className={styles.statRow}>
        <StatColumn value={usage.active} label={t("Common:Active")} />
        <StatColumn value={usage.internal} label={t("DocsConnect:Internal")} />
        <StatColumn value={usage.external} label={t("DocsConnect:External")} />
        <StatColumn
          value={usage.remaining}
          label={t("DocsConnect:Remaining")}
          highlight
        />
      </div>
    </div>
  );
};

export default UsageBlock;
