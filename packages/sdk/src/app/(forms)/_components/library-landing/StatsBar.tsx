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

import styles from "./LibraryLanding.module.scss";

type StatsBarProps = {
  templatesCount: number;
  countriesCount: number;
  language: string;
};

const StatsBar = ({
  templatesCount,
  countriesCount,
  language,
}: StatsBarProps) => {
  const { t } = useTranslation("Common");

  return (
    <section className={styles.stats}>
      <h2 className={styles.statsTitle}>{t("Common:LibraryStatsTitle")}</h2>
      <p className={styles.statsSubtitle}>
        {t("Common:LibraryStatsSubtitle")}
      </p>

      <div className={styles.statsCards}>
        <div className={styles.statsCard}>
          <span className={styles.statsNumber}>{templatesCount}</span>
          <span className={styles.statsLabel}>
            {t("Common:LibraryStatsTemplates", {
              count: templatesCount,
              language,
            })}
          </span>
        </div>

        <div className={styles.statsCard}>
          <span className={styles.statsNumber}>{countriesCount}</span>
          <span className={styles.statsLabel}>
            {t("Common:LibraryStatsCountries", { count: countriesCount })}
          </span>
        </div>
      </div>
    </section>
  );
};

export default StatsBar;
