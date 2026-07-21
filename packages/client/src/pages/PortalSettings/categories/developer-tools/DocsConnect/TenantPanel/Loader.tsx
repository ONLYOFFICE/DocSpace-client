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

import { RectangleSkeleton } from "@docspace/ui-kit/components/rectangle";

import styles from "./TenantPanel.module.scss";

const STAT_COLUMNS = ["active", "internal", "external", "remaining"];

const InfoCardSkeleton = () => (
  <div className={styles.infoCard}>
    <RectangleSkeleton width="120px" height="16px" />
    <RectangleSkeleton width="100%" height="20px" />
  </div>
);

const DetailCardSkeleton = () => (
  <div className={styles.detailCard}>
    <RectangleSkeleton
      className={styles.detailCardTitle}
      width="140px"
      height="18px"
    />
    <RectangleSkeleton width="100%" height="92px" />
  </div>
);

const UsageBlockSkeleton = () => (
  <div className={styles.usageBlock}>
    <RectangleSkeleton width="120px" height="18px" />
    <RectangleSkeleton width="200px" height="14px" />
    <RectangleSkeleton width="100%" height="8px" />
    <div className={styles.statRow}>
      {STAT_COLUMNS.map((key) => (
        <div key={key} className={styles.statColumn}>
          <RectangleSkeleton width="28px" height="20px" />
          <RectangleSkeleton width="52px" height="12px" />
        </div>
      ))}
    </div>
  </div>
);

const TenantPanelLoader = () => (
  <div className={styles.panel}>
    <div className={styles.header}>
      <div className={styles.titleRow}>
        <RectangleSkeleton width="150px" height="24px" />
        <RectangleSkeleton width="110px" height="24px" />
      </div>
    </div>

    <div className={styles.titleRow}>
      <RectangleSkeleton width="90px" height="20px" />
      <RectangleSkeleton width="80px" height="20px" />
      <RectangleSkeleton width="80px" height="20px" />
    </div>

    <div className={styles.statistics}>
      <RectangleSkeleton width="180px" height="20px" />
      <div className={styles.overviewGrid}>
        <InfoCardSkeleton />
        <InfoCardSkeleton />
        <InfoCardSkeleton />
      </div>

      <div className={styles.twoCards}>
        <DetailCardSkeleton />
        <DetailCardSkeleton />
      </div>

      <RectangleSkeleton width="180px" height="20px" />
      <div className={styles.twoCards}>
        <UsageBlockSkeleton />
        <UsageBlockSkeleton />
      </div>

      <div className={styles.downloadReport}>
        <RectangleSkeleton width="150px" height="40px" />
      </div>
    </div>
  </div>
);

export default TenantPanelLoader;